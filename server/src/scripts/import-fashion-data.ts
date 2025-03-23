// TypeScript declaration for global.gc
declare global {
    namespace NodeJS {
        interface Global {
            gc: () => void;
        }
    }
}

import fs from 'fs';
import path from 'path';
import { createReadStream } from 'fs';
import csv from 'csv-parser';
import { supabase } from '../config/supabase';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

// Path to the dataset files (should be downloaded from Kaggle)
const DATASET_PATH = path.join(__dirname, '../../../data/styles.csv');
const IMAGE_DIR = path.join(__dirname, '../../../data/images');
const UPLOAD_DIR = path.join(__dirname, '../../uploads/products');

// Make sure the upload directories exist
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Define the batch size and limit - we can process the entire small dataset
const BATCH_SIZE = 20; // Reduced batch size to avoid memory issues
const IMPORT_LIMIT = 5000; // Increased for small dataset which has fewer items

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

// Map Kaggle dataset categories to our application categories
const mapCategories = async (): Promise<Record<string, string>> => {
    try {
        // First, ensure we have the necessary categories in our database
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

        // Insert categories if they don't exist
        for (const category of categories) {
            const { error } = await supabase
                .from('categories')
                .upsert(category, { onConflict: 'name' });

            if (error) {
                console.error(`Error inserting category ${category.name}:`, error);
            }
        }

        // Now get all categories with their IDs
        const { data, error } = await supabase
            .from('categories')
            .select('id, name');

        if (error) {
            throw error;
        }

        const categoryMap: Record<string, string> = {};
        data?.forEach((category: { id: string; name: string }) => {
            categoryMap[category.name.toLowerCase()] = category.id;
        });

        return categoryMap;
    } catch (error) {
        console.error('Error mapping categories:', error);
        return {};
    }
};

// Get or create an admin user
const getAdminUser = async (): Promise<string> => {
    try {
        // Check if admin user exists
        const { data, error } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'admin')
            .limit(1);

        if (error) {
            throw error;
        }

        // If admin exists, return their ID
        if (data && data.length > 0) {
            return data[0].id;
        }

        // If no admin exists, create one
        const { data: newAdmin, error: createError } = await supabase
            .from('users')
            .insert({
                username: 'admin',
                email: 'admin@example.com',
                password: '$2b$10$uLJ9REmbMQ2SnZsNFM0yUO7Q1l5O7WnB/3zKCaIPbOt0JVPVJ226e', // hashed 'password123'
                role: 'admin',
                created_at: new Date(),
                updated_at: new Date()
            })
            .select('id')
            .single();

        if (createError) {
            throw createError;
        }

        return newAdmin!.id;
    } catch (error) {
        console.error('Error getting/creating admin user:', error);
        throw error;
    }
};

// Image record interface
interface ProductImage {
    product_id: string;
    url: string;
    position: number;
    created_at: Date;
    updated_at: Date;
}

// Product-category relation interface
interface ProductCategory {
    product_id: string;
    category_id: string;
    created_at?: Date;
    updated_at?: Date;
}

// Main import function
const importData = async () => {
    try {
        console.log('Starting import process for smaller fashion dataset...');

        // Get category mapping
        const categoryMap = await mapCategories();
        console.log('Category mapping created');

        // Get admin user
        const adminId = await getAdminUser();
        console.log(`Using admin user ID: ${adminId}`);

        // Check if dataset file exists
        if (!fs.existsSync(DATASET_PATH)) {
            console.error(`Dataset file not found at ${DATASET_PATH}`);
            console.log('Please download the smaller dataset from Kaggle (https://www.kaggle.com/datasets/paramaggarwal/fashion-product-images-small) and extract it to the data directory.');
            return;
        }

        let count = 0;
        let batch: any[] = [];
        let batchCount = 0;
        let productCategoryRelations: ProductCategory[] = [];
        let processedRows = 0;

        // Create a Map to store ID mappings (Kaggle ID -> UUID)
        // Using a Map for better memory efficiency with large datasets
        const productIdMap = new Map<number, string>();

        console.log(`Processing CSV file: ${DATASET_PATH}`);
        console.log(`Will import up to ${IMPORT_LIMIT} items from the smaller dataset`);

        // Process a batch of products and their images
        const processProductBatch = async (currentBatch: any[]): Promise<void> => {
            if (currentBatch.length === 0) return;

            batchCount++;
            console.log(`Inserting batch ${batchCount} (${currentBatch.length} items)`);

            try {
                const { error } = await supabase
                    .from('products')
                    .upsert(currentBatch, { onConflict: 'id' });

                if (error) {
                    console.error(`Error inserting batch ${batchCount}:`, error);
                    return;
                }

                console.log(`Successfully inserted batch ${batchCount}`);

                // Process image records for this batch
                const imageRecords: ProductImage[] = [];

                for (const product of currentBatch) {
                    if (product.images && product.images.length > 0) {
                        product.images.forEach((imageUrl: string, index: number) => {
                            imageRecords.push({
                                product_id: product.id,
                                url: imageUrl,
                                position: index,
                                created_at: new Date(),
                                updated_at: new Date()
                            });
                        });
                    }
                }

                if (imageRecords.length > 0) {
                    try {
                        const { error: imageError } = await supabase
                            .from('product_images')
                            .insert(imageRecords);

                        if (imageError) {
                            console.error(`Error inserting product images:`, imageError);
                        } else {
                            console.log(`Inserted ${imageRecords.length} product images`);
                        }
                    } catch (error) {
                        console.error('Error processing image records:', error);
                    }
                }
            } catch (error) {
                console.error(`Error processing batch ${batchCount}:`, error);
            }
        };

        // Process category relationships
        const processCategoryRelations = async (relations: ProductCategory[]): Promise<void> => {
            if (relations.length === 0) return;

            console.log(`Inserting ${relations.length} product-category relationships`);

            // Insert in smaller batches
            for (let i = 0; i < relations.length; i += 50) {
                const relationBatch = relations.slice(i, i + 50);

                try {
                    const { error } = await supabase
                        .from('product_categories')
                        .insert(relationBatch);

                    if (error) {
                        console.error(`Error inserting product-category relationships:`, error);
                    }
                } catch (error) {
                    console.error('Error processing category relationships batch:', error);
                }

                if (i % 200 === 0 && i > 0) {
                    console.log(`Processed ${i} category relationships`);
                }
            }

            console.log(`Successfully inserted product-category relationships`);
        };

        // Create a readable stream for the CSV file
        const fileStream = createReadStream(DATASET_PATH);

        // Create a parser
        const parser = fileStream.pipe(csv());

        // Use a Promise to handle the stream processing
        await new Promise<void>((resolve, reject) => {
            parser.on('data', (row: FashionItem) => {
                // Stop if we've reached the limit
                if (count >= IMPORT_LIMIT) return;

                try {
                    // Map dataset categories to our application categories
                    const categoryIds: string[] = [];
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

                    // Copy image if it exists
                    let imagePaths: string[] = [];
                    if (row.id) {
                        const imagePath = path.join(IMAGE_DIR, `${row.id}.jpg`);
                        if (fs.existsSync(imagePath)) {
                            const destPath = path.join(UPLOAD_DIR, `${row.id}.jpg`);
                            fs.copyFileSync(imagePath, destPath);
                            imagePaths.push(`/uploads/products/${row.id}.jpg`);
                        }
                    }

                    // Generate sustainability data
                    const { score, badges } = generateSustainabilityData();

                    // Create a unique product ID for linking to categories later
                    const productId = uuidv4();

                    // Store the mapping between Kaggle ID and UUID
                    productIdMap.set(row.id, productId);

                    // Create product object
                    const product = {
                        id: productId, // Set a predictable ID to use for relationships
                        title: row.productDisplayName || `${row.articleType} - ${row.gender}`,
                        price: Math.floor(Math.random() * 100) + 10, // Random price between 10-110
                        description: `${row.productDisplayName || 'Sustainable item'} - ${row.articleType} for ${row.gender}. Color: ${row.baseColour}. From ${row.season} ${row.year} collection.`,
                        images: imagePaths,
                        condition: row.usage || 'new',
                        brand: row.productDisplayName?.split(' ')[0] || 'Sustainable Brand',
                        size: ['XS', 'S', 'M', 'L', 'XL'][Math.floor(Math.random() * 5)],
                        material: row.articleType || null,
                        color: row.baseColour || null,
                        seller_id: adminId,
                        sustainability_info: {
                            impact: `This item has a sustainability score of ${score}. Higher is better.`,
                            certifications: badges,
                            condition: row.usage || 'new',
                        },
                        sustainability: score,
                        sustainability_badges: badges,
                        gender: row.gender || null,
                        master_category: row.masterCategory || null,
                        sub_category: row.subCategory || null,
                        article_type: row.articleType || null,
                        base_colour: row.baseColour || null,
                        season: row.season || null,
                        year: row.year || null,
                        usage: row.usage || null,
                        product_display_name: row.productDisplayName || null
                    };

                    // Add category relationships to be inserted later
                    categoryIds.forEach(categoryId => {
                        if (categoryId) {
                            productCategoryRelations.push({
                                product_id: productId,
                                category_id: categoryId,
                                created_at: new Date(),
                                updated_at: new Date()
                            });
                        }
                    });

                    batch.push(product);
                    count++;
                    processedRows++;

                    // Process batches to keep memory usage low
                    if (batch.length >= BATCH_SIZE) {
                        // Pause the stream while we process the batch
                        parser.pause();

                        // Process this batch and continue when done
                        processProductBatch([...batch])
                            .then(() => {
                                // Clear the batch array
                                batch.length = 0;

                                // Process category relations if we've accumulated a lot
                                if (productCategoryRelations.length >= 500) {
                                    return processCategoryRelations([...productCategoryRelations])
                                        .then(() => {
                                            productCategoryRelations.length = 0;
                                            parser.resume();
                                        });
                                } else {
                                    parser.resume();
                                    return Promise.resolve();
                                }
                            })
                            .catch(error => {
                                console.error('Error processing batch:', error);
                                parser.resume();
                            });
                    }

                    if (processedRows % 100 === 0) {
                        console.log(`Processed ${processedRows} rows`);
                        // Force garbage collection on older Node versions via global
                        if (global.gc) {
                            global.gc();
                        }
                    }
                } catch (error) {
                    console.error('Error processing item:', error);
                }
            });

            parser.on('end', async () => {
                // Process any remaining items
                if (batch.length > 0) {
                    await processProductBatch(batch);
                    batch.length = 0;
                }

                // Process any remaining category relationships
                if (productCategoryRelations.length > 0) {
                    await processCategoryRelations(productCategoryRelations);
                    productCategoryRelations.length = 0;
                }

                console.log(`Import complete! Processed ${processedRows} rows and imported ${count} items in ${batchCount} batches.`);
                resolve();
            });

            parser.on('error', (error) => {
                reject(error);
            });
        });
    } catch (error) {
        console.error('Error during import:', error);
    }
};

// Run the import
importData().catch(console.error); 