# Echo: Sustainable Second-Hand Marketplace

![Echo Logo](echo/assets/icon.png)

## Project Overview

Echo is a mobile marketplace specifically designed for sustainable second-hand shopping. The application uses a swipe-based interface similar to dating apps, making the discovery of second-hand items both engaging and intuitive. Each product includes a sustainability score and badges, educating users about their environmental impact.

### Key Features

- **AI-Powered Assistant**: Chat with "Echo," an AI stylist that helps users discover sustainable fashion matching their style preferences
- **Tinder-Style Discovery**: Swipe interface for browsing products (right for like, left for pass)
- **Sustainability Metrics**: Each product displays a sustainability score (0-100) and specific badges (Organic, Recycled, Fair Trade, etc.)
- **In-App Messaging**: Direct communication between buyers and sellers
- **Personalized Recommendations**: Machine learning algorithms match users with relevant products

## Project Structure

This repository contains both frontend and backend code:

- `/echo` - Frontend React Native mobile application
- `/server` - Backend Node.js/Express API server
- `/data` - Sample data and import scripts

## Technology Stack

### Frontend
- React Native with Expo
- TypeScript
- React Navigation
- Supabase Client

### Backend
- Node.js
- Express
- TypeScript
- PostgreSQL (via Supabase)
- JWT Authentication

## Installation

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Expo CLI
- Supabase account

### Setup Frontend (Echo)

1. Navigate to the frontend directory:
   ```bash
   cd echo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_API_URL=http://localhost:5000
   ```

### Setup Backend (Server)

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with required configuration:
   ```
   PORT=5000
   NODE_ENV=development
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_service_key
   JWT_SECRET=your_jwt_secret
   ```

## Running the Application

### Frontend

1. Start the Expo development server:
   ```bash
   cd echo
   npm start
   ```

2. Use the Expo Go app on your mobile device to scan the QR code, or press 'i' for iOS simulator or 'a' for Android emulator.

### Backend

1. Start the backend server:
   ```bash
   cd server
   npm run dev
   ```

## Database Setup

The server includes scripts for setting up the database schema and importing sample data:

1. Set up database schema:
   ```bash
   cd server
   npm run setup-db
   ```

2. Import sample product data:
   ```bash
   cd server
   npm run import-data
   ```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT License](LICENSE) 