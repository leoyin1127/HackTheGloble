import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import { createReadStream } from 'fs';
import csv from 'csv-parser';
import FormData from 'form-data';

// Load environment variables
dotenv.config();

// Path to the dataset files (should be downloaded from Kaggle)
const DATASET_PATH = path.join(__dirname, '../../../data/styles.csv');
const IMAGE_DIR = path.join(__dirname, '../../../data/images');

// Define the batch size and limit
const BATCH_SIZE = 20;
const IMPORT_LIMIT = 2000;
const API_URL = process.env.API_URL || 'http://localhost:3000/api';

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

// Get admin credentials to authenticate API calls
const authenticate = async (): Promise<string> => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@example.com',
            password: 'password123'
        });

        if (response.data && response.data.token) {
            return response.data.token;
        } else {
            throw new Error('Authentication failed: No token received');
        }
    } catch (error) {
        console.error('Authentication error:', error);
        throw error;
    }
};

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

// Get all categories from the API
const getCategories = async (token: string): Promise<Record<string, string>> => {
    try {
        const response = await axios.get(`${API_URL}/categories`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.data) {
            const categoryMap: Record<string, string> = {};
            response.data.forEach((category: any) => {
                categoryMap[category.name.toLowerCase()] = category.id;
            });
            return categoryMap;
        } else {
            throw new Error('Failed to fetch categories');
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
        return {};
    }
};

// Upload image and get image URL
const uploadImage = async (imageId: number, token: string): Promise<string[]> => {
    try {
        const imagePath = path.join(IMAGE_DIR, `${imageId}.jpg`);
        if (!fs.existsSync(imagePath)) {
            return [];
        }

        const form = new FormData();
        form.append('image', fs.createReadStream(imagePath));

        const response = await axios.post(`${API_URL}/uploads/product`, form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });

        if (response.data && response.data.url) {
            return [response.data.url];
        }

        return [];
    } catch (error) {
        console.error(`Error uploading image ${imageId}:`, error);
        return [];
    }
};

// Main import function
const importData = async () => {
    try {
        console.log('Starting API-based import process...');

        // Check if dataset file exists
        if (!fs.existsSync(DATASET_PATH)) {
            console.error(`Dataset file not found at ${DATASET_PATH}`);
            console.log('Please download the dataset from Kaggle and extract it to the data directory.');
            return;
        }

        // Authenticate to get JWT token
        const token = await authenticate();
        console.log('Authentication successful');

        // Get category mapping
        const categoryMap = await getCategories(token);
        console.log('Category mapping created');

        let count = 0;
        let batch: any[] = [];
        let batchCount = 0;

        console.log(`Processing CSV file: ${DATASET_PATH}`);
        console.log(`Will import up to ${IMPORT_LIMIT} items`);

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

                    // Upload image if it exists
                    const imagePaths = await uploadImage(row.id, token);

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
                        category_ids: categoryIds,
                        sustainability_info: {
                            impact: `This item has a sustainability score of ${score}. Higher is better.`,
                            certifications: badges,
                            condition: row.usage || 'new',
                        },
                        sustainability: score,
                        sustainability_badges: badges
                    };

                    batch.push(product);
                    count++;

                    // If batch is full or we've reached the limit, insert it
                    if (batch.length >= BATCH_SIZE || count >= IMPORT_LIMIT) {
                        batchCount++;
                        console.log(`Inserting batch ${batchCount} (${batch.length} items)`);

                        try {
                            const response = await axios.post(`${API_URL}/products/batch`, {
                                products: batch
                            }, {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            });

                            if (response.status === 201) {
                                console.log(`Successfully inserted batch ${batchCount}`);
                            } else {
                                console.error(`Error inserting batch ${batchCount}:`, response.data);
                            }
                        } catch (error) {
                            console.error(`Error inserting batch ${batchCount}:`, error);
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

                    try {
                        const response = await axios.post(`${API_URL}/products/batch`, {
                            products: batch
                        }, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        });

                        if (response.status === 201) {
                            console.log(`Successfully inserted final batch`);
                        } else {
                            console.error(`Error inserting final batch:`, response.data);
                        }
                    } catch (error) {
                        console.error(`Error inserting final batch:`, error);
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