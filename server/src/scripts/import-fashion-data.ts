import fs from 'fs';
import path from 'path';
import { createReadStream } from 'fs';
import csv from 'csv-parser';
import { supabase } from '../config/supabase';
import dotenv from 'dotenv';

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
const BATCH_SIZE = 100;
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
const mapCategories = async () => {
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

        console.log(`Processing CSV file: ${DATASET_PATH}`);
        console.log(`Will import up to ${IMPORT_LIMIT} items from the smaller dataset`);

        // Process the CSV file
        createReadStream(DATASET_PATH)
            .pipe(csv())
            .on('data', async (row: FashionItem) => {
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

                    // Create product object
                    const product = {
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
                        category_ids: categoryIds,
                        sustainability_info: {
                            impact: `This item has a sustainability score of ${score}. Higher is better.`,
                            certifications: badges,
                            condition: row.usage || 'new',
                        },
                        sustainability: score,
                        sustainability_badges: badges,
                        created_at: new Date(),
                        updated_at: new Date(),
                    };

                    batch.push(product);
                    count++;

                    // If batch is full or we've reached the limit, insert it
                    if (batch.length >= BATCH_SIZE || count >= IMPORT_LIMIT) {
                        batchCount++;
                        console.log(`Inserting batch ${batchCount} (${batch.length} items)`);

                        const { error } = await supabase
                            .from('products')
                            .insert(batch);

                        if (error) {
                            console.error(`Error inserting batch ${batchCount}:`, error);
                        } else {
                            console.log(`Successfully inserted batch ${batchCount}`);
                        }

                        batch = [];
                    }

                    if (count % 100 === 0) {
                        console.log(`Processed ${count} items`);
                    }
                } catch (error) {
                    console.error('Error processing item:', error);
                }
            })
            .on('end', async () => {
                // Insert any remaining items
                if (batch.length > 0) {
                    batchCount++;
                    console.log(`Inserting final batch ${batchCount} (${batch.length} items)`);

                    const { error } = await supabase
                        .from('products')
                        .insert(batch);

                    if (error) {
                        console.error(`Error inserting final batch:`, error);
                    } else {
                        console.log(`Successfully inserted final batch`);
                    }
                }

                console.log(`Import complete! Imported ${count} items in ${batchCount} batches.`);
            });
    } catch (error) {
        console.error('Error during import:', error);
    }
};

// Run the import
importData().catch(console.error); 