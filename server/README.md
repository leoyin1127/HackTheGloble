# Sustainable Marketplace Backend

This is the backend server for the Sustainable Marketplace application, a platform for buying and selling sustainable products.

## Tech Stack

- Node.js
- TypeScript
- Express
- Supabase (PostgreSQL)
- JWT Authentication
- Zod (validation)

## Project Structure

```
server/
├── src/
│   ├── config/        # Configuration files
│   ├── controllers/   # Route controllers
│   ├── database/      # Database scripts and migrations
│   ├── middleware/    # Express middleware
│   ├── models/        # Data models
│   ├── routes/        # API routes
│   ├── utils/         # Utility functions
│   └── index.ts       # Server entry point
├── uploads/           # Uploaded files
├── dist/              # Compiled JavaScript
├── package.json
└── tsconfig.json
```

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Supabase account and project

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

### Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Set up the Supabase database:
   - Create a new Supabase project
   - Run the SQL script in `src/database/schema.sql` in the Supabase SQL editor

3. Build the project:
   ```
   npm run build
   ```

4. Start the server:
   ```
   npm start
   ```

   For development with auto-reload:
   ```
   npm run dev
   ```

### Importing Product Data

To import product data from the Kaggle Fashion Products dataset:

1. Download the dataset from https://www.kaggle.com/datasets/paramaggarwal/fashion-product-images-dataset/data
2. Extract the dataset files to a `data` directory at the project root
3. Run the import script:
   ```
   node src/database/import.js [limit]
   ```
   Where `[limit]` is an optional parameter to limit the number of products to import (default: 1000)

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change user password
- `DELETE /api/users/account` - Delete user account

### Products

- `POST /api/products` - Create a new product
- `GET /api/products` - Get all products with filters
- `GET /api/products/:id` - Get a product by ID
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product
- `POST /api/products/import` - Import products from dataset (admin only)

### Cart

- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Orders

- `POST /api/orders` - Create a new order from cart
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status (admin only)
- `PUT /api/orders/:id/cancel` - Cancel order

### Chat

- `POST /api/chat/messages` - Send a message
- `GET /api/chat/messages/:userId` - Get conversation with another user
- `GET /api/chat/list` - Get all user's chats
- `GET /api/chat/unread` - Get unread message count
- `DELETE /api/chat/messages/:messageId` - Delete a message 