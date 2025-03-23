import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { supabase } from '../config/supabase';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

// Path to CSV files
const IMAGES_CSV_PATH = path.join(__dirname, '../../../images.csv');
const STYLES_CSV_PATH = path.join(__dirname, '../../../styles.csv');

// Maximum number of images to process
const MAX_IMAGES = 2000;

// Read styles CSV and insert products with image URLs
async function insertProductsWithImages() {
    console.log('Starting direct product and image import...');

    // Check if files exist
    if (!fs.existsSync(IMAGES_CSV_PATH)) {
        console.error(`Error: Images CSV file not found at ${IMAGES_CSV_PATH}`);
        return;
    }

    if (!fs.existsSync(STYLES_CSV_PATH)) {
        console.error(`Error: Styles CSV file not found at ${STYLES_CSV_PATH}`);
        return;
    }

    // Map to hold image IDs and URLs
    const imageMap: Record<string, string> = {};
    let imageCount = 0;

    // Read the images CSV and collect image info
    await new Promise<void>((resolve) => {
        fs.createReadStream(IMAGES_CSV_PATH)
            .pipe(csv())
            .on('data', (data: any) => {
                // Skip if we already have enough images
                if (imageCount >= MAX_IMAGES) return;

                // Get filename and link from CSV
                const filename = data.filename || '';
                const imageUrl = data.link || '';

                // Extract the ID from filename (removing .jpg extension)
                const id = filename.replace('.jpg', '');

                if (filename && imageUrl) {
                    imageMap[id] = imageUrl;
                    imageCount++;
                }
            })
            .on('end', () => {
                console.log(`Parsed ${Object.keys(imageMap).length} image URLs from CSV`);
                resolve();
            });
    });

    // Now read styles CSV and create products
    console.log('Reading styles data and creating products...');

    const products: any[] = [];
    let styleCount = 0;

    await new Promise<void>((resolve) => {
        fs.createReadStream(STYLES_CSV_PATH)
            .pipe(csv())
            .on('data', (data: any) => {
                // Skip if we already have enough products or don't have an image for this product
                if (styleCount >= MAX_IMAGES) return;

                const id = data.id?.toString();
                if (!id || !imageMap[id]) return;

                // Create a product object
                const product = {
                    id: uuidv4(), // Generate a unique ID
                    title: data.productDisplayName || `Product ${id}`,
                    description: `${data.productDisplayName || 'Product'} - ${data.articleType || ''} for ${data.gender || 'all'}. Color: ${data.baseColour || ''}. From ${data.season || ''} ${data.year || ''} collection.`,
                    price: Math.floor(Math.random() * 100) + 10, // Random price between 10-110
                    images: [imageMap[id]], // Use the image URL
                    condition: data.usage || 'new',
                    gender: data.gender || null,
                    master_category: data.masterCategory || null,
                    sub_category: data.subCategory || null,
                    article_type: data.articleType || null,
                    base_colour: data.baseColour || null,
                    season: data.season || null,
                    year: data.year || null,
                    usage: data.usage || null,
                    product_display_name: data.productDisplayName || null,
                    seller_id: null, // Will be updated later
                    sustainability: Math.floor(Math.random() * 60) + 40, // Random score between 40-100
                    sustainability_badges: ['Eco-friendly', 'Sustainable'],
                    created_at: new Date(),
                    updated_at: new Date()
                };

                products.push(product);
                styleCount++;

                if (styleCount % 100 === 0) {
                    console.log(`Prepared ${styleCount} products for insertion`);
                }
            })
            .on('end', () => {
                console.log(`Prepared ${products.length} products with images`);
                resolve();
            });
    });

    // Check if there are any products in the database first
    console.log('Checking existing products in database...');
    const { count: existingCount, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('Error checking existing products:', countError);
        return;
    }

    console.log(`Found ${existingCount || 0} existing products in database`);

    // If we have existing products, try to update them instead of inserting
    if (existingCount && existingCount > 0) {
        console.log('Existing products found. Fetching product IDs to update...');

        const { data: productIds, error: idsError } = await supabase
            .from('products')
            .select('id')
            .limit(MAX_IMAGES);

        if (idsError) {
            console.error('Error fetching product IDs:', idsError);
            return;
        }

        if (!productIds || productIds.length === 0) {
            console.log('No product IDs found. Proceeding with insert...');
        } else {
            console.log(`Got ${productIds.length} product IDs to update`);

            // Update existing products in batches
            console.log('Updating existing products with image URLs...');
            const batchSize = 50;
            let updated = 0;

            for (let i = 0; i < Math.min(productIds.length, products.length); i += batchSize) {
                const batch = productIds.slice(i, i + batchSize);

                for (let j = 0; j < batch.length; j++) {
                    if (i + j >= products.length) break;

                    const productId = batch[j].id;
                    const productImg = products[i + j].images[0]; // Get image from our prepared product

                    try {
                        const { error } = await supabase
                            .from('products')
                            .update({
                                images: [productImg]
                            })
                            .eq('id', productId);

                        if (error) {
                            console.error(`Error updating product ${productId}:`, error);
                        } else {
                            updated++;
                        }
                    } catch (error) {
                        console.error(`Error processing update for product ${productId}:`, error);
                    }
                }

                console.log(`Updated batch ${i / batchSize + 1} (${batch.length} products)`);
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            console.log(`Update complete! Updated ${updated}/${Math.min(productIds.length, products.length)} products with images`);
            return; // Skip insert if we did updates
        }
    }

    // Insert products in batches
    console.log('Inserting products into database...');

    const batchSize = 50;
    let inserted = 0;

    for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);

        try {
            const { data, error } = await supabase
                .from('products')
                .insert(batch)
                .select('id');

            if (error) {
                console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
            } else {
                inserted += data?.length || 0;
                console.log(`Inserted batch ${i / batchSize + 1} (${data?.length || 0} products)`);
            }
        } catch (error) {
            console.error(`Error processing batch ${i / batchSize + 1}:`, error);
        }

        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`Insertion complete! Inserted ${inserted}/${products.length} products with images`);
}

// Run the function
console.log('Direct product import started');
insertProductsWithImages()
    .then(() => console.log('Direct product import completed'))
    .catch(err => console.error('Error during import:', err)); 