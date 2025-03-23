import fs from 'fs';
import path from 'path';
import { supabase } from '../config/supabase';
import dotenv from 'dotenv';
import https from 'https';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

// Define paths
const UPLOAD_DIR = path.join(__dirname, '../../uploads/products');

// Make sure the upload directories exist
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Define the number of products to generate
const PRODUCT_COUNT = 2000;
const BATCH_SIZE = 100;

// Product categories with descriptions
const CATEGORIES = [
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

// Clothing types per category
const CLOTHING_TYPES = [
    'T-Shirt', 'Blouse', 'Sweater', 'Dress', 'Jeans', 'Pants', 'Skirt',
    'Jacket', 'Coat', 'Hoodie', 'Cardigan', 'Shorts', 'Crop Top'
];

const HOME_TYPES = [
    'Throw Pillow', 'Blanket', 'Curtains', 'Rug', 'Lamp', 'Vase',
    'Wall Art', 'Candle', 'Plant Pot', 'Table Runner', 'Kitchenware'
];

const ACCESSORIES_TYPES = [
    'Bag', 'Handbag', 'Wallet', 'Scarf', 'Hat', 'Belt', 'Sunglasses',
    'Backpack', 'Tote', 'Clutch', 'Beanie', 'Gloves'
];

const FOOTWEAR_TYPES = [
    'Sneakers', 'Boots', 'Sandals', 'Flats', 'Heels', 'Loafers',
    'Slippers', 'Athletic Shoes', 'Oxfords', 'Espadrilles'
];

const JEWELRY_TYPES = [
    'Necklace', 'Earrings', 'Bracelet', 'Ring', 'Pendant', 'Anklet',
    'Brooch', 'Cufflinks', 'Tiara', 'Watch'
];

// Product conditions
const CONDITIONS = ['new', 'like new', 'good', 'fair', 'worn'];

// Colors
const COLORS = [
    'black', 'white', 'red', 'blue', 'green', 'yellow', 'purple',
    'pink', 'grey', 'brown', 'navy', 'olive', 'teal', 'maroon'
];

// Sizes
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];

// Brands
const BRANDS = [
    'EcoStyle', 'GreenThreads', 'SustainMe', 'PureEarth', 'NatureFusion',
    'RenewFashion', 'CircularChic', 'EarthBound', 'GoodLoop', 'RePurpose',
    'EthicalEdge', 'ThriftLuxe', 'VintageCraft', 'UpCycleChic', 'EcoElite'
];

// Materials
const MATERIALS = [
    'Organic Cotton', 'Recycled Polyester', 'Hemp', 'Linen', 'Bamboo',
    'TENCEL™', 'Modal', 'Recycled Nylon', 'Cork', 'Recycled Wool',
    'Organic Silk', 'Piñatex', 'Recycled Denim', 'Upcycled Materials'
];

// Genders
const GENDERS = ['Men', 'Women', 'Unisex', 'Kids'];

// Seasons
const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter', 'All Season'];

// Placeholder image URLs (free-to-use stock photo sites, using small images)
const PLACEHOLDER_IMAGES = {
    Clothing: [
        'https://source.unsplash.com/200x300/?tshirt',
        'https://source.unsplash.com/200x300/?dress',
        'https://source.unsplash.com/200x300/?jacket',
        'https://source.unsplash.com/200x300/?jeans',
        'https://source.unsplash.com/200x300/?sweater'
    ],
    Home: [
        'https://source.unsplash.com/200x300/?pillow',
        'https://source.unsplash.com/200x300/?blanket',
        'https://source.unsplash.com/200x300/?lamp',
        'https://source.unsplash.com/200x300/?vase',
        'https://source.unsplash.com/200x300/?rug'
    ],
    Accessories: [
        'https://source.unsplash.com/200x300/?bag',
        'https://source.unsplash.com/200x300/?wallet',
        'https://source.unsplash.com/200x300/?backpack',
        'https://source.unsplash.com/200x300/?scarf',
        'https://source.unsplash.com/200x300/?hat'
    ],
    Footwear: [
        'https://source.unsplash.com/200x300/?shoes',
        'https://source.unsplash.com/200x300/?boots',
        'https://source.unsplash.com/200x300/?sneakers',
        'https://source.unsplash.com/200x300/?sandals',
        'https://source.unsplash.com/200x300/?heels'
    ],
    Jewelry: [
        'https://source.unsplash.com/200x300/?necklace',
        'https://source.unsplash.com/200x300/?earrings',
        'https://source.unsplash.com/200x300/?ring',
        'https://source.unsplash.com/200x300/?bracelet',
        'https://source.unsplash.com/200x300/?watch'
    ],
    default: [
        'https://source.unsplash.com/200x300/?sustainable',
        'https://source.unsplash.com/200x300/?fashion',
        'https://source.unsplash.com/200x300/?product',
        'https://source.unsplash.com/200x300/?clothing',
        'https://source.unsplash.com/200x300/?eco'
    ]
};

// Function to download an image
const downloadImage = (url: string, filename: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download image: ${response.statusCode}`));
                return;
            }

            const fileStream = fs.createWriteStream(filename);
            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                resolve(filename);
            });

            fileStream.on('error', (err) => {
                fs.unlink(filename, () => { }); // Delete the file on error
                reject(err);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
};

// Generate sustainability data (scores and badges)
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

// Generate a random product based on category
const generateProduct = (category: string, categoryId: string, adminId: string, index: number) => {
    // Select appropriate product type based on category
    let productType: string;
    let gender = GENDERS[Math.floor(Math.random() * GENDERS.length)];
    let imageCategory = category;

    switch (category.toLowerCase()) {
        case 'clothing':
            productType = CLOTHING_TYPES[Math.floor(Math.random() * CLOTHING_TYPES.length)];
            break;
        case 'home':
            productType = HOME_TYPES[Math.floor(Math.random() * HOME_TYPES.length)];
            gender = 'Unisex'; // Home goods are generally unisex
            break;
        case 'accessories':
            productType = ACCESSORIES_TYPES[Math.floor(Math.random() * ACCESSORIES_TYPES.length)];
            break;
        case 'footwear':
            productType = FOOTWEAR_TYPES[Math.floor(Math.random() * FOOTWEAR_TYPES.length)];
            break;
        case 'jewelry':
            productType = JEWELRY_TYPES[Math.floor(Math.random() * JEWELRY_TYPES.length)];
            break;
        default:
            productType = 'Item';
            imageCategory = 'default';
    }

    // Generate random attributes
    const brand = BRANDS[Math.floor(Math.random() * BRANDS.length)];
    const material = MATERIALS[Math.floor(Math.random() * MATERIALS.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const size = SIZES[Math.floor(Math.random() * SIZES.length)];
    const condition = CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)];
    const season = SEASONS[Math.floor(Math.random() * SEASONS.length)];
    const year = 2020 + Math.floor(Math.random() * 4); // 2020-2023

    // Create product title
    const title = `${brand} ${color} ${productType} for ${gender} - ${material}`;

    // Create product description
    const description = `Sustainable ${color} ${productType} by ${brand}. Made with ${material}. Perfect for ${gender} in ${season} ${year}. This item is in ${condition} condition and was ethically sourced.`;

    // Generate sustainability data
    const { score, badges } = generateSustainabilityData();

    // Random price between $15-150
    const price = Math.floor(Math.random() * 135) + 15;

    // Pick a random placeholder image from the appropriate category
    const imageList = PLACEHOLDER_IMAGES[imageCategory as keyof typeof PLACEHOLDER_IMAGES] || PLACEHOLDER_IMAGES.default;
    const imageUrl = imageList[Math.floor(Math.random() * imageList.length)];

    // Generate a filename for the image
    const imageId = uuidv4();
    const imageFilename = `${imageId}.jpg`;
    const imagePath = path.join(UPLOAD_DIR, imageFilename);

    // Return product data along with image info
    return {
        productData: {
            title,
            price,
            description,
            images: [`/uploads/products/${imageFilename}`],
            condition,
            brand,
            size,
            material,
            color,
            seller_id: adminId,
            category_ids: [categoryId],
            sustainability_info: {
                impact: `This item has a sustainability score of ${score}. Higher is better.`,
                certifications: badges,
                condition,
            },
            sustainability: score,
            sustainability_badges: badges,
            created_at: new Date(),
            updated_at: new Date(),
        },
        imageInfo: {
            url: imageUrl,
            path: imagePath,
            filename: imageFilename,
        }
    };
};

// Map categories to database
const insertCategories = async () => {
    try {
        // Insert categories if they don't exist
        for (const category of CATEGORIES) {
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
        data?.forEach(category => {
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

// Main function to generate and import products
const generateAndImportProducts = async () => {
    try {
        console.log('Starting product generation process...');

        // Get category mapping
        const categoryMap = await insertCategories();
        if (Object.keys(categoryMap).length === 0) {
            throw new Error('Failed to create category mapping');
        }
        console.log('Category mapping created');

        // Get admin user
        const adminId = await getAdminUser();
        console.log(`Using admin user ID: ${adminId}`);

        let count = 0;
        let batch: any[] = [];
        let batchCount = 0;
        let downloadPromises: Promise<any>[] = [];
        let productsPerCategory = Math.ceil(PRODUCT_COUNT / CATEGORIES.length);

        // Generate products for each category
        for (const category of CATEGORIES) {
            console.log(`Generating products for category: ${category.name}`);
            const categoryId = categoryMap[category.name.toLowerCase()];

            if (!categoryId) {
                console.warn(`No ID found for category "${category.name}", skipping`);
                continue;
            }

            for (let i = 0; i < productsPerCategory && count < PRODUCT_COUNT; i++) {
                // Generate a product
                const { productData, imageInfo } = generateProduct(
                    category.name,
                    categoryId,
                    adminId,
                    count
                );

                // Add image download promise to batch
                downloadPromises.push(
                    downloadImage(imageInfo.url, imageInfo.path)
                        .catch(err => {
                            console.error(`Failed to download image: ${err.message}`);
                            // Set empty image array if download fails
                            productData.images = [];
                            return null;
                        })
                );

                // Add product to batch
                batch.push(productData);
                count++;

                // If batch is full, process it
                if (batch.length >= BATCH_SIZE || count >= PRODUCT_COUNT) {
                    batchCount++;

                    // Wait for image downloads to complete
                    console.log(`Downloading images for batch ${batchCount}...`);
                    await Promise.all(downloadPromises);

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
                    downloadPromises = [];

                    // Add a small delay to avoid overwhelming the external image servers
                    await new Promise(resolve => setTimeout(resolve, 500));
                }

                if (count % 100 === 0) {
                    console.log(`Generated ${count}/${PRODUCT_COUNT} products`);
                }
            }
        }

        console.log(`Product generation complete! Generated ${count} products in ${batchCount} batches.`);

    } catch (error) {
        console.error('Error during product generation:', error);
    }
};

// Run the generation and import process
generateAndImportProducts().catch(console.error); 