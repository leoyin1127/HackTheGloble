# Image Upload and Management with Supabase Storage

This document explains how to use the new image pipeline that uploads images from external URLs to Supabase storage and displays them in the frontend application.

## Overview

Instead of storing images locally in the filesystem, this new approach:

1. Reads image URLs from CSV files
2. Downloads images from these URLs
3. Uploads them to Supabase storage
4. Updates the database with the Supabase storage URLs
5. Configures the frontend to display images directly from Supabase storage

## Prerequisites

- Supabase account with valid credentials in `.env` file
- `images.csv` file in the project root containing image URLs
- `styles.csv` file in the project root containing product information
- Node.js and npm installed

## File Structure

- `server/src/scripts/upload-images-to-supabase.ts` - Script to upload images to Supabase
- `server/run-upload-images.sh` - Shell script to run the upload process
- Frontend components updated to use Supabase image URLs

## Steps to Upload Images

1. Ensure your CSV files are in the project root:
   - `images.csv` should have columns for `id` and `url`
   - `styles.csv` should contain product information

2. Make the upload script executable:
   ```bash
   chmod +x run-upload-images.sh
   ```

3. Run the upload script:
   ```bash
   ./run-upload-images.sh
   ```

   This will:
   - Create a Supabase storage bucket named `product-images` if it doesn't exist
   - Download images from URLs in `images.csv`
   - Upload them to Supabase storage
   - Update the database with Supabase image URLs

## How the Frontend Uses Images

The frontend now has a priority system for displaying images:

1. **First priority**: Use the `supabase_image_url` field if it exists (high-quality Supabase storage image)
2. **Second priority**: Use `product_images` relation if available
3. **Third priority**: Use direct `images` array
4. **Fourth priority**: Use single `image` string if available
5. **Fallback**: Use a placeholder image if none of the above are available

## Testing Image Display

1. Start the backend server:
   ```bash
   npm run dev
   ```

2. Start the frontend app:
   ```bash
   cd ../echo
   npm start
   ```

3. Navigate to the ImageTest screen:
   - Click the "Test Images" button on the home screen
   - The test screen will show Supabase images if available

4. Toggle between Supabase and local images:
   - Use the "Switch to..." button to toggle between Supabase and local images
   - This helps compare the quality and loading performance

## Troubleshooting

- **No Supabase images visible**: Ensure you've run the upload script and check your Supabase credentials
- **Memory issues during upload**: Increase the memory allocation in `run-upload-images.sh`
- **API connection issues**: Use the port testing buttons to try different ports
- **Image loading errors**: Check browser console for specific error messages

## Advantages of Supabase Storage

- Better image quality than the previous solution
- Faster loading times (Supabase CDN)
- No need to manage files locally on the server
- Scalable solution for larger datasets
- Reliable access from both web and mobile apps 