# Sustainable Marketplace

A React Native mobile application for sustainable second-hand shopping, built for Hack The Globe 2025.

## Project Overview

This platform aims to promote responsible consumption by creating a user-friendly marketplace for second-hand items with features like:

- Personalized user profiles and preferences
- AI-assisted search and recommendation system
- Detailed item information with quality verification
- Community features to encourage sustainable consumption
- Intuitive, Tinder-style discovery interface

## Technology Stack

- **Frontend**: React Native with Expo
- **Backend**: Firebase for authentication, database, and storage
- **Search & Recommendations**: ML-based matching algorithms
- **Payments**: Secure payment processing
- **AI Chat**: OpenAI GPT for sustainable fashion advice

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo CLI
- OpenAI API key (for Echo AI chat feature)

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/sustainable-marketplace.git
cd sustainable-marketplace
```

2. Install dependencies
```
npm install
# or
yarn install
```

3. Configure environment variables
```
# Create a .env file from the example template
cp .env.example .env

# Edit the .env file with your OpenAI API key
nano .env
```

4. Start the development server
```
npm start
# or
yarn start
```

## Environment Variables Configuration

The application uses environment variables for configuration, including API keys. For security reasons, the actual `.env` file with your keys is not committed to the repository.

To configure your environment:

1. Sign up for an OpenAI API key at https://platform.openai.com/api-keys
2. Create a `.env` file from the template:
   ```
   cp .env.example .env
   ```
3. Edit the `.env` file and add your actual API key:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```
4. The `.env` file is in `.gitignore` to prevent accidentally committing your API key to the repository

The application loads these environment variables using react-native-dotenv and makes them available throughout the app.

## Project Structure

- `/app/components` - Reusable UI components
- `/app/screens` - Application screens
- `/app/navigation` - Navigation configuration
- `/app/services` - API and backend services
- `/app/utils` - Helper functions and utilities
- `/app/context` - React Context providers
- `/app/hooks` - Custom React hooks
- `/app/assets` - Images, fonts, and other static assets
- `/app/config` - Configuration files (constants, types)
- `/types` - TypeScript type definitions

## Features

- User authentication and profile management
- Item browsing and detailed views
- Search functionality with filters
- Shopping cart and checkout process
- Messaging between buyers and sellers
- Sustainability metrics and educational content
- AI-powered fashion assistant (Echo)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
