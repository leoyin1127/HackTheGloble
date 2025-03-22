const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const csv = require('csv-parser');

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase URL or key in environment variables');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Path to the dataset file (should be downloaded from Kaggle)
const DATASET_PATH = path.join(__dirname, '../../../data/styles.csv');
const IMAGE_DIR = path.join(__dirname, '../../../data/images');
const UPLOAD_DIR = path.join(__dirname, '../../uploads/products');

// Make sure the upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Get admin user ID (first create an admin user in the database)
async function getAdminUserId() {
    const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin')
        .limit(1);

    if (error || !data || data.length === 0) {
        console.error('No admin user found. Please create an admin user first.');
        process.exit(1);
    }

    return data[0].id;
}

// Map product categories from dataset to our categories
async function mapCategories() {
    const { data, error } = await supabase
        .from('categories')
        .select('id, name');

    if (error) {
        console.error('Error fetching categories:', error);
        process.exit(1);
    }

    const categoryMap = {};
    data.forEach(category => {
        categoryMap[category.name.toLowerCase()] = category.id;
    });

    return categoryMap;
}

// Process and import dataset
async function importProducts(limit = 1000) {
    try {
        const adminUserId = await getAdminUserId();
        const categoryMap = await mapCategories();

        let count = 0;
        const results = [];

        fs.createReadStream(DATASET_PATH)
            .pipe(csv())
            .on('data', async (data) => {
                if (count >= limit) return;

                // Map dataset categories to our category IDs
                const categoryIds = [];
                const masterCategory = data.masterCategory?.toLowerCase();
                const subCategory = data.subCategory?.toLowerCase();

                if (categoryMap[masterCategory]) {
                    categoryIds.push(categoryMap[masterCategory]);
                } else if (masterCategory === 'apparel') {
                    categoryIds.push(categoryMap['clothing']);
                } else if (masterCategory === 'accessories') {
                    categoryIds.push(categoryMap['jewelry']);
                } else if (masterCategory === 'footwear') {
                    categoryIds.push(categoryMap['clothing']);
                } else if (masterCategory === 'personal care') {
                    categoryIds.push(categoryMap['home']);
                }

                // Copy image if it exists
                let imagePaths = [];
                if (data.id && fs.existsSync(path.join(IMAGE_DIR, `${data.id}.jpg`))) {
                    const newPath = path.join(UPLOAD_DIR, `${data.id}.jpg`);
                    fs.copyFileSync(path.join(IMAGE_DIR, `${data.id}.jpg`), newPath);
                    imagePaths.push(`/uploads/products/${data.id}.jpg`);
                }

                // Generate a random sustainability score between 40-100
                const sustainability = Math.floor(Math.random() * 60) + 40;

                // Generate random sustainability badges based on the score
                const allBadges = ['Recycled', 'Eco-friendly', 'Sustainable', 'Organic', 'Fair Trade', 'Handmade', 'Renewable', 'Vegan', 'Local', 'Zero Waste'];
                const badgeCount = Math.floor(sustainability / 20); // Higher scores get more badges
                const sustainabilityBadges = [];

                for (let i = 0; i < badgeCount; i++) {
                    const randomBadge = allBadges[Math.floor(Math.random() * allBadges.length)];
                    if (!sustainabilityBadges.includes(randomBadge)) {
                        sustainabilityBadges.push(randomBadge);
                    }
                }

                const product = {
                    title: data.productDisplayName || 'Unknown Product',
                    price: parseFloat(data.price) || Math.floor(Math.random() * 100) + 10,
                    description: `${data.productDisplayName} - ${data.articleType} made by ${data.brandName}. Color: ${data.baseColour}. ${data.season} collection.`,
                    images: imagePaths,
                    condition: data.usage || 'new',
                    brand: data.brandName || 'Unknown Brand',
                    size: data.size || null,
                    material: data.articleType || null,
                    color: data.baseColour || null,
                    seller_id: adminUserId,
                    category_ids: categoryIds,
                    sustainability_info: {
                        impact: `This item has a sustainability score of ${sustainability}. Higher is better.`,
                        certifications: sustainabilityBadges,
                        condition: data.usage || 'new',
                    },
                    sustainability: sustainability,
                    sustainability_badges: sustainabilityBadges,
                    created_at: new Date(),
                    updated_at: new Date(),
                };

                results.push(product);
                count++;

                if (count % 100 === 0) {
                    console.log(`Processed ${count} products`);
                }
            })
            .on('end', async () => {
                console.log(`Inserting ${results.length} products into the database...`);

                // Insert products in batches of 100
                const batchSize = 100;
                for (let i = 0; i < results.length; i += batchSize) {
                    const batch = results.slice(i, i + batchSize);
                    const { data, error } = await supabase
                        .from('products')
                        .insert(batch);

                    if (error) {
                        console.error(`Error inserting batch ${i}-${i + batchSize}:`, error);
                    } else {
                        console.log(`Inserted batch ${i}-${i + batchSize}`);
                    }
                }

                console.log('Import complete!');
            });
    } catch (error) {
        console.error('Error during import:', error);
    }
}

// Start the import process with limit
const importLimit = process.argv[2] ? parseInt(process.argv[2]) : 1000;
console.log(`Importing up to ${importLimit} products...`);
importProducts(importLimit); 