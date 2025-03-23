# Data Import Options

This directory contains various scripts for importing product data from the [Kaggle Fashion Product Images Dataset](https://www.kaggle.com/datasets/paramaggarwal/fashion-product-images-dataset/data).

## Prerequisites

1. Download the dataset from Kaggle
2. Extract the ZIP file and place the following files in the `data` directory:
   - `styles.csv` - The main product data file
   - `images/` - The directory containing all product images

## Import Options

### 1. Direct Supabase Import (Default)

Uses Supabase's client to directly import data and copies images to the local uploads directory.

```bash
npm run import-data
```

**Pros:**
- Simple setup - only requires Supabase credentials
- Works with the default application configuration
- Images are stored locally, reducing dependency on external services

**Cons:**
- Limited to smaller datasets due to memory usage
- Less efficient for very large imports

### 2. REST API-based Import

Uses the application's existing REST API endpoints to import data.

```bash
npm run import-api
```

**Pros:**
- Uses the same validation and business logic as the application
- Good for testing the API endpoints
- Can be run from any machine with API access

**Cons:**
- Slower than direct database access
- Requires the API server to be running

### 3. SQL Dump Import

Generates a SQL file that can be directly imported into PostgreSQL.

```bash
npm run import-sql
```

**Pros:**
- Fastest import method for large datasets
- Bypasses application logic for maximum performance
- Can be used with database backup/restore tools

**Cons:**
- Requires direct database access
- Bypasses application validation logic

### 4. S3 Streaming Import

Uses AWS S3 for image storage and streaming to handle large datasets efficiently.

```bash
npm run import-s3
```

**Pros:**
- Best for production environments
- Efficiently handles large datasets through streaming
- Stores images in S3 for better scaling and CDN support
- Memory efficient for very large imports

**Cons:**
- Requires AWS credentials and S3 bucket setup
- More complex configuration

## Environment Variables

Some import methods require additional environment variables:

### For API Import
- `API_URL` - The URL of your API (default: http://localhost:3000/api)

### For S3 Import
- `AWS_REGION` - AWS region (default: us-east-1)
- `AWS_ACCESS_KEY_ID` - Your AWS access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
- `AWS_S3_BUCKET` - Your S3 bucket name

## Import Limits

By default, all import scripts are limited to 2,000 products to avoid overwhelming the system. You can adjust this limit by modifying the `IMPORT_LIMIT` constant in each script. 