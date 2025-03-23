import { supabase } from './src/config/supabase';

interface Product {
    id: string;
    images: string[];
}

interface ImageRecord {
    id: string;
    product_id: string;
    url: string;
    position: number;
}

async function checkImagesInDatabase() {
    // Count products with images
    const { data: productsWithImages, error: countError, count } = await supabase
        .from('products')
        .select('id, images', { count: 'exact' })
        .not('images', 'is', null)
        .limit(5);

    if (countError) {
        console.error('Error querying products:', countError);
        return;
    }

    console.log(`Total products with images in database: ${count}`);

    // Check product_images table
    const { data: imageRecords, error: imageError } = await supabase
        .from('product_images')
        .select('*', { count: 'exact' })
        .limit(5);

    if (imageError) {
        console.error('Error querying product_images:', imageError);
        return;
    }

    const { count: imageCount } = await supabase
        .from('product_images')
        .select('*', { count: 'exact', head: true });

    console.log(`Total product_images records: ${imageCount}`);

    // Display sample products with their images
    console.log('\nSample products with images:');
    if (productsWithImages && productsWithImages.length > 0) {
        productsWithImages.forEach((product: Product) => {
            console.log(`Product ID: ${product.id}`);
            console.log(`Image URLs: ${JSON.stringify(product.images)}`);
            console.log('---');
        });
    }

    // Display sample image records from product_images table
    console.log('\nSample records from product_images table:');
    if (imageRecords && imageRecords.length > 0) {
        imageRecords.forEach((record: ImageRecord) => {
            console.log(`Image ID: ${record.id}`);
            console.log(`Product ID: ${record.product_id}`);
            console.log(`Image URL: ${record.url}`);
            console.log('---');
        });
    }
}

checkImagesInDatabase().catch(console.error); 