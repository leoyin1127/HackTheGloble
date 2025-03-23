#!/bin/bash

# Show environment info
echo "Starting image upload to Supabase storage..."
echo "Node version: $(node -v)"
echo "Memory limit increased to 8GB"

# Run the upload script with increased memory limit
NODE_OPTIONS="--max-old-space-size=8192" npm run upload-images

# Notes:
# 1. This script will:
#    - Read images.csv and styles.csv from root directory
#    - Upload images to Supabase storage 'product-images' bucket
#    - Update database records with Supabase image URLs
#
# 2. Prerequisites:
#    - Valid Supabase credentials in .env file
#    - images.csv with image URLs in root directory
#    - styles.css with product info in root directory
#
# 3. If memory issues persist, you can try with even larger allocation:
#    NODE_OPTIONS="--max-old-space-size=16384" npm run upload-images 