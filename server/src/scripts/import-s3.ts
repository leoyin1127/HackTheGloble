import fs from 'fs';
import path from 'path';
import { createReadStream } from 'fs';
import csv from 'csv-parser';
import dotenv from 'dotenv';
import { supabase } from '../config/supabase';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';
import mime from 'mime-types';

// Load environment variables
dotenv.config();

// Path to the dataset files (should be downloaded from Kaggle)
const DATASET_PATH = path.join(__dirname, '../../../data/styles.csv');
const IMAGE_DIR = path.join(__dirname, '../../../data/images');

// Define the batch size and limit
const BATCH_SIZE = 100;
const IMPORT_LIMIT = 2000;

// AWS S3 configuration
const s3 = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
});
const S3_BUCKET = process.env.AWS_S3_BUCKET || 'your-bucket-name';

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

// Upload image to S3
const uploadImageToS3 = async (imageId: number): Promise<string | null> => {
    try {
        const imagePath = path.join(IMAGE_DIR, `${imageId}.jpg`);
        if (!fs.existsSync(imagePath)) {
            return null;
        }

        const fileStream = fs.createReadStream(imagePath);
        const key = `products/${imageId}.jpg`;
        const contentType = mime.lookup(imagePath) || 'image/jpeg';

        const upload = new Upload({
            client: s3,
            params: {
                Bucket: S3_BUCKET,
                Key: key,
                Body: fileStream,
                ContentType: contentType,
                ACL: 'public-read'
            }
        });

        await upload.done();

        // Return the S3 URL
        return `https://${S3_BUCKET}.s3.amazonaws.com/${key}`;
    } catch (error) {
        console.error(`Error uploading image ${imageId} to S3:`, error);
        return null;
    }
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

// Process chunks of data using streaming
const processDataStream = async () => {
    try {
        console.log('Starting S3 import process...');

        // Get category mapping
        const categoryMap = await mapCategories();
        console.log('Category mapping created');

        // Get admin user
        const adminId = await getAdminUser();
        console.log(`Using admin user ID: ${adminId}`);

        // Check if dataset file exists
        if (!fs.existsSync(DATASET_PATH)) {
            console.error(`Dataset file not found at ${DATASET_PATH}`);
            console.log('Please download the dataset from Kaggle and extract it to the data directory.');
            return;
        }

        let count = 0;
        let batch: any[] = [];
        let batchCount = 0;
        let imageUploadPromises: Promise<any>[] = [];

        console.log(`Processing CSV file: ${DATASET_PATH}`);
        console.log(`Will import up to ${IMPORT_LIMIT} items`);

        // Process the CSV file as a stream
        const stream = createReadStream(DATASET_PATH)
            .pipe(csv());

        // Process each row
        for await (const row of stream) {
            // Stop if we've reached the limit
            if (count >= IMPORT_LIMIT) break;

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

                // Upload image to S3 if it exists (non-blocking)
                let imagePromise: Promise<string | null> = Promise.resolve(null);
                if (row.id) {
                    imagePromise = uploadImageToS3(row.id);
                    imageUploadPromises.push(imagePromise);
                }

                // Generate sustainability data
                const { score, badges } = generateSustainabilityData();

                // Wait for the image to upload
                const imageUrl = await imagePromise;
                const imagePaths = imageUrl ? [imageUrl] : [];

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
                    // Clean up completed image upload promises to avoid memory issues
                    // We'll create a new array instead of filtering the existing one
                    const pendingPromises: Promise<any>[] = [];
                    for (const promise of imageUploadPromises) {
                        // Check if promise is still pending by trying to attach a no-op callback
                        const isPending = Promise.race([promise, Promise.resolve('pending')])
                            .then(result => result === 'pending');
                        if (await isPending) {
                            pendingPromises.push(promise);
                        }
                    }
                    imageUploadPromises = pendingPromises;
                }
            } catch (error) {
                console.error('Error processing item:', error);
            }
        }

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

        // Wait for any remaining image uploads to complete
        if (imageUploadPromises.length > 0) {
            console.log(`Waiting for ${imageUploadPromises.length} image uploads to complete...`);
            await Promise.allSettled(imageUploadPromises);
        }

        console.log(`Import complete! Imported ${count} items in ${batchCount} batches.`);
    } catch (error) {
        console.error('Error during import:', error);
    }
};

// Run the import
processDataStream().catch(console.error); 