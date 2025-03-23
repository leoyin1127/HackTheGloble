import fs from 'fs';
import path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import csv from 'csv-parser';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Path to the dataset files (should be downloaded from Kaggle)
const DATASET_PATH = path.join(__dirname, '../../../data/styles.csv');
const IMAGE_DIR = path.join(__dirname, '../../../data/images');
const SQL_OUTPUT_PATH = path.join(__dirname, '../../../data/products_import.sql');

// Define the import limit
const IMPORT_LIMIT = 2000;

interface FashionItem {
    id: number;
    gender: string;
    masterCategory: string;
    subCategory: string;
    articleType: string;
    baseColour: string;
    season: string;
    year: string;
    usage: string;
    productDisplayName: string;
    [key: string]: any;
}

// Sustainability scores and badges for demo purposes
const generateSustainabilityData = () => {
    // Random score between 40-100
    const score = Math.floor(Math.random() * 60) + 40;

    // Possible sustainability badges
    const allBadges = [
        'Recycled', 'Eco-friendly', 'Sustainable', 'Organic',
        'Fair Trade', 'Handmade', 'Renewable', 'Vegan',
        'Local', 'Zero Waste'
    ];

    // Higher scores get more badges
    const badgeCount = Math.min(Math.floor(score / 20) + 1, 5);
    const badges: string[] = [];

    // Randomly select badges without duplicates
    while (badges.length < badgeCount) {
        const badge = allBadges[Math.floor(Math.random() * allBadges.length)];
        if (!badges.includes(badge)) {
            badges.push(badge);
        }
    }

    return {
        score,
        badges
    };
};

// Escape strings for SQL
const escapeSql = (val: any): string => {
    if (val === null || val === undefined) {
        return 'NULL';
    }

    if (typeof val === 'number') {
        return val.toString();
    }

    if (typeof val === 'object') {
        return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
    }

    return `'${val.toString().replace(/'/g, "''")}'`;
};

// Generate category mapping SQL
const generateCategorySQL = (): { sql: string; categoryMap: Record<string, number> } => {
    const categories = [
        { name: 'Clothing', description: 'Sustainable and second-hand clothing items' },
        { name: 'Home', description: 'Eco-friendly home goods and decor' },
        { name: 'Electronics', description: 'Refurbished and energy-efficient electronics' },
        { name: 'Books', description: 'Used books and publications' },
        { name: 'Toys', description: 'Second-hand toys and games' },
        { name: 'Sports', description: 'Pre-owned sports equipment' },
        { name: 'Art', description: 'Handmade and upcycled art pieces' },
        { name: 'Jewelry', description: 'Sustainable and vintage jewelry' },
        { name: 'Accessories', description: 'Sustainable accessories and bags' },
        { name: 'Footwear', description: 'Sustainable and second-hand footwear' }
    ];

    let sql = '-- Insert categories\n';
    const categoryMap: Record<string, number> = {};

    categories.forEach((category, index) => {
        const id = index + 1;
        categoryMap[category.name.toLowerCase()] = id;
        sql += `INSERT INTO categories (id, name, description, created_at, updated_at) 
                VALUES (${id}, ${escapeSql(category.name)}, ${escapeSql(category.description)}, NOW(), NOW())
                ON CONFLICT (name) DO NOTHING;\n`;
    });

    return { sql, categoryMap };
};

// Generate admin user SQL
const generateAdminSQL = (): string => {
    // Hash for 'password123'
    const passwordHash = '$2b$10$uLJ9REmbMQ2SnZsNFM0yUO7Q1l5O7WnB/3zKCaIPbOt0JVPVJ226e';

    return `-- Insert admin user
INSERT INTO users (id, username, email, password, role, created_at, updated_at) 
VALUES ('admin-user-uuid', 'admin', 'admin@example.com', '${passwordHash}', 'admin', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;\n`;
};

// Main function to generate SQL dump
const generateSQLDump = async () => {
    try {
        console.log('Starting SQL dump generation...');

        // Check if dataset file exists
        if (!fs.existsSync(DATASET_PATH)) {
            console.error(`Dataset file not found at ${DATASET_PATH}`);
            console.log('Please download the dataset from Kaggle and extract it to the data directory.');
            return;
        }

        // Create SQL file stream
        const sqlStream = createWriteStream(SQL_OUTPUT_PATH);

        // Write header
        sqlStream.write('-- Fashion Product Dataset Import SQL\n');
        sqlStream.write('-- Generated on ' + new Date().toISOString() + '\n\n');

        // Generate category SQL and get mapping
        const { sql: categorySql, categoryMap } = generateCategorySQL();
        sqlStream.write(categorySql + '\n');

        // Generate admin user SQL
        sqlStream.write(generateAdminSQL() + '\n');

        // Start transaction
        sqlStream.write('BEGIN;\n\n');

        // Begin products insert
        sqlStream.write('-- Insert products\n');

        let count = 0;

        // Create an array to store all product image SQL statements
        const productsImagesSQL: string[] = [];

        // Create an array to store all product category SQL statements
        const productsCategoriesSQL: string[] = [];

        console.log(`Processing CSV file: ${DATASET_PATH}`);
        console.log(`Will import up to ${IMPORT_LIMIT} items`);

        // Process the CSV file
        createReadStream(DATASET_PATH)
            .pipe(csv())
            .on('data', (row: FashionItem) => {
                // Stop if we've reached the limit
                if (count >= IMPORT_LIMIT) return;

                try {
                    // Map dataset categories to our application categories
                    const categoryIds: number[] = [];
                    const masterCategory = row.masterCategory?.toLowerCase();

                    // Map to our categories
                    if (masterCategory === 'apparel') {
                        categoryIds.push(categoryMap['clothing']);
                    } else if (masterCategory === 'accessories') {
                        categoryIds.push(categoryMap['accessories']);
                    } else if (masterCategory === 'footwear') {
                        categoryIds.push(categoryMap['footwear']);
                    } else if (masterCategory === 'personal care') {
                        categoryIds.push(categoryMap['home']);
                    } else if (categoryMap[masterCategory]) {
                        categoryIds.push(categoryMap[masterCategory]);
                    }

                    // Check if image exists and prepare image paths
                    const imagePaths: string[] = [];
                    if (row.id) {
                        const imagePath = path.join(IMAGE_DIR, `${row.id}.jpg`);
                        if (fs.existsSync(imagePath)) {
                            imagePaths.push(`/uploads/products/${row.id}.jpg`);
                        }
                    }

                    // Generate sustainability data
                    const { score, badges } = generateSustainabilityData();

                    // Generate a UUID for the product
                    const productId = `product-${row.id}`;

                    // SQL for product insert
                    const productSQL = `INSERT INTO products (
                        id, title, price, description, condition, brand, 
                        size, material, color, seller_id, sustainability, 
                        sustainability_badges, sustainability_info, created_at, updated_at
                    ) VALUES (
                        ${escapeSql(productId)},
                        ${escapeSql(row.productDisplayName || `${row.articleType} - ${row.gender}`)},
                        ${Math.floor(Math.random() * 100) + 10},
                        ${escapeSql(`${row.productDisplayName || 'Sustainable item'} - ${row.articleType} for ${row.gender}. Color: ${row.baseColour}. From ${row.season} ${row.year} collection.`)},
                        ${escapeSql(row.usage || 'new')},
                        ${escapeSql(row.productDisplayName?.split(' ')[0] || 'Sustainable Brand')},
                        ${escapeSql(['XS', 'S', 'M', 'L', 'XL'][Math.floor(Math.random() * 5)])},
                        ${escapeSql(row.articleType || null)},
                        ${escapeSql(row.baseColour || null)},
                        'admin-user-uuid',
                        ${score},
                        ${escapeSql(badges)},
                        ${escapeSql({
                        impact: `This item has a sustainability score of ${score}. Higher is better.`,
                        certifications: badges,
                        condition: row.usage || 'new',
                    })},
                        NOW(),
                        NOW()
                    );\n`;

                    sqlStream.write(productSQL);

                    // SQL for product images
                    imagePaths.forEach((imagePath, index) => {
                        productsImagesSQL.push(`INSERT INTO product_images (
                            product_id, url, position, created_at, updated_at
                        ) VALUES (
                            ${escapeSql(productId)},
                            ${escapeSql(imagePath)},
                            ${index},
                            NOW(),
                            NOW()
                        );\n`);
                    });

                    // SQL for product categories
                    categoryIds.forEach(categoryId => {
                        productsCategoriesSQL.push(`INSERT INTO product_categories (
                            product_id, category_id, created_at, updated_at
                        ) VALUES (
                            ${escapeSql(productId)},
                            ${categoryId},
                            NOW(),
                            NOW()
                        );\n`);
                    });

                    count++;

                    if (count % 100 === 0) {
                        console.log(`Processed ${count} items`);
                    }
                } catch (error) {
                    console.error('Error processing item:', error);
                }
            })
            .on('end', () => {
                // Write product images SQL
                sqlStream.write('\n-- Insert product images\n');
                productsImagesSQL.forEach(sql => sqlStream.write(sql));

                // Write product categories SQL
                sqlStream.write('\n-- Insert product categories\n');
                productsCategoriesSQL.forEach(sql => sqlStream.write(sql));

                // Commit transaction
                sqlStream.write('\nCOMMIT;\n');
                sqlStream.end();

                console.log(`SQL dump generation complete! Processed ${count} items.`);
                console.log(`SQL file saved to: ${SQL_OUTPUT_PATH}`);
                console.log('\nTo import this file into your PostgreSQL database:');
                console.log('psql -U your_username -d your_database -f ' + SQL_OUTPUT_PATH);
            });
    } catch (error) {
        console.error('Error generating SQL dump:', error);
    }
};

// Run the generator
generateSQLDump().catch(console.error); 