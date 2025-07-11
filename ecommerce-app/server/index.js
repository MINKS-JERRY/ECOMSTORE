// Load environment variables from .env file
require('dotenv').config();

// Log environment variables for debugging
console.log('Environment variables:', {
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI ? '✅ MONGO_URI is set' : '❌ MONGO_URI is not set!',
  JWT_SECRET: process.env.JWT_SECRET ? '✅ JWT_SECRET is set' : '❌ JWT_SECRET is not set!'
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Setup CORS
const allowedOrigins = [
  'https://ecommerce-app-ws9s.onrender.com', // frontend
  'https://ecomstore-7j0x.onrender.com',     // backend
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser clients

    if (
      process.env.NODE_ENV !== 'production' ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.onrender.com')
    ) {
      callback(null, true);
    } else {
      callback(new Error('❌ Not allowed by CORS: ' + origin));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve static files from React (client) build
const clientBuildPath = path.join(__dirname, '../client/build');
if (fs.existsSync(clientBuildPath)) {
  console.log('✅ Found client build directory');
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  console.warn('⚠️ React build not found. Did you run `npm run build` in the client folder?');
}

// Development-only .env check
if (process.env.NODE_ENV !== 'production') {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.warn('⚠️ Warning: .env file not found at:', envPath);
    console.log('Set env variables manually in Render dashboard.');
  }
}

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// MongoDB Connection
const connectToMongoDB = async () => {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.error('❌ MONGO_URI is not defined in .env');
    return false;
  }

  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    return false;
  }
};

// Start Server
const startServer = async () => {
  const connected = await connectToMongoDB();
  if (!connected) {
    console.log('❌ Failed to connect to MongoDB. Server exiting.');
    process.exit(1);
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at: http://localhost:${PORT}/api`);
  });
};

// Optional health check in development
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/health', (req, res) => {
    res.json({
      status: '✅ API is running',
      timestamp: new Date().toISOString(),
    });
  });
}

// Start app
startServer();
