// Load environment variables from .env file
require('dotenv').config();


// Log environment variables for debugging
console.log('Environment variables:', {
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI ? '*** MongoDB URI is set ***' : '❌ MONGO_URI is not set!',
  JWT_SECRET: process.env.JWT_SECRET ? '*** JWT_SECRET is set ***' : '❌ JWT_SECRET is not set!'
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Initialize Express app
const app = express();

// List of allowed origins
const allowedOrigins = [
  // Local development
  /^http:\/\/localhost(:[0-9]+)?$/,
  /^http:\/\/192\.168\.[0-9]+\.[0-9]+(:[0-9]+)?$/,
  
  // Production domains
  'https://ecomstore-7j0x.onrender.com',
  'https://ecommerce-app-ws9s.onrender.com'
];

// CORS middleware
const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;
  
  // Always allow requests with no origin (like mobile apps or curl requests)
  if (!origin) return next();
  
  // In development, allow all origins
  if (process.env.NODE_ENV !== 'production') {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    return next();
  }
  
  // In production, check against allowed origins
  const isAllowed = allowedOrigins.some(regex => {
    if (typeof regex === 'string') {
      return origin === regex;
    } else if (regex instanceof RegExp) {
      return regex.test(origin);
    }
    return false;
  }) || origin.endsWith('.onrender.com');
  
  if (isAllowed) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    return next();
  }
  
  console.warn('Blocked by CORS:', origin);
  return res.status(403).json({ error: 'Not allowed by CORS' });
};

// Apply CORS middleware
app.use(corsMiddleware);

// Handle preflight for all routes
app.options('*', corsMiddleware);
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve static files from the React app
const clientBuildPath = path.join(__dirname, '../client/build');

// Check if the build directory exists
const buildPathExists = fs.existsSync(clientBuildPath);

if (buildPathExists) {
  console.log('✅ Found client build directory');
  
  // Serve static files from the React app
  app.use(express.static(clientBuildPath));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  console.warn('⚠️  Client build directory not found. Make sure to build the React app.');
  
  // In development, you might want to proxy to the React dev server
  if (process.env.NODE_ENV !== 'production') {
    console.log('Running in development mode with proxy to React dev server');
  } else {
    console.error('❌ Production build not found. Please build the React app before starting the server.');
  }
}

// Only check for .env file in development
if (process.env.NODE_ENV !== 'production') {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.warn('⚠️  Warning: .env file not found at:', envPath);
    console.log('In production, make sure to set environment variables in your hosting platform.');
    console.log('For local development, create a .env file with your MongoDB connection string');
  }
}

// Import and mount routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// MongoDB connection
const connectToMongoDB = async () => {
  const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';
  
  if (!process.env.MONGO_URI) {
    console.error('❌ Error: MONGO_URI is not defined in .env file');
    return;
  }

  try {
    console.log('🔌 Attempting to connect to MongoDB...');
    console.log('Connection string:', MONGODB_URI.replace(/:([^:]*?)@/, ':***@'));
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
    });
    
    console.log('✅ Successfully connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Check if your IP is whitelisted in MongoDB Atlas');
    console.log('2. Verify your username and password in the connection string');
    console.log('3. Make sure the database name is correct');
    console.log('4. Check your internet connection');
    return false;
  }
};

// Start the server
const startServer = async () => {
  const isConnected = await connectToMongoDB();
  
  if (!isConnected) {
    console.log('❌ Failed to connect to MongoDB. Server not started.');
    process.exit(1);
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`\n🚀 Server is running on port ${PORT}`);
    console.log(`📡 API available at: http://localhost:${PORT}/api`);
    console.log('\n💡 Try these endpoints:');
    console.log(`- GET http://localhost:${PORT}/api/products`);
    console.log(`- POST http://localhost:${PORT}/api/auth/register`);
  });
};

// Health check route (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: '✅ E-commerce API is running',
      database: '✅ Connected',
      timestamp: new Date().toISOString()
    });
  });
}

// Start the application
startServer();
