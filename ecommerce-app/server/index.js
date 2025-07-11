// Load environment variables from .env file
require('dotenv').config();

// Force production mode on Render
if (process.env.RENDER) {
  process.env.NODE_ENV = 'production';
}

// Log environment variables for debugging
console.log('Environment variables:', {
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI ? '✅ MONGO_URI is set' : '❌ MONGO_URI is not set!',
  JWT_SECRET: process.env.JWT_SECRET ? '✅ JWT_SECRET is set' : '❌ JWT_SECRET is not set!',
  RENDER: process.env.RENDER || 'Not running on Render'
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
  'http://localhost:3000',                   // local development frontend
  'http://localhost:3001',                   // alternative local frontend port
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Allowing origin in development:', origin);
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin) || origin.endsWith('.onrender.com')) {
      return callback(null, true);
    }
    
    console.log('❌ CORS blocked origin:', origin);
    return callback(new Error('❌ Not allowed by CORS: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin', 
    'X-Requested-With', 
    'Content-Type', 
    'Accept', 
    'Authorization',
    'Cache-Control',
    'X-Requested-With'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  preflightContinue: false,
  maxAge: 86400 // 24 hours
};

// Apply CORS with our configuration
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Add CORS debugging middleware
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.path} - Origin: ${req.headers.origin || 'No origin'}`);
  next();
});

app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  // Path to the React app build directory
  const clientBuildPath = path.join(__dirname, '..', 'client', 'build');
  
  // Log the build path for debugging
  console.log('Serving static files from:', clientBuildPath);
  
  // Check if build directory exists
  if (fs.existsSync(clientBuildPath)) {
    console.log('Found React build directory');
    // Serve static files from the build directory
    app.use(express.static(clientBuildPath));
    
    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
      console.log('Serving React app for path:', req.path);
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
  } else {
    console.error('React build directory not found at:', clientBuildPath);
    console.log('Current working directory:', process.cwd());
    console.log('Directory contents:', fs.readdirSync(path.join(__dirname, '..')));
  }
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

// Health check endpoint (available in all environments)
app.get('/api/health', (req, res) => {
  res.json({
    status: '✅ API is running',
    timestamp: new Date().toISOString(),
    cors: {
      origin: req.headers.origin,
      method: req.method,
      headers: req.headers
    }
  });
});

// Add a simple root route for backend
app.get('/', (req, res) => {
  res.send('Backend is running. Use /api endpoints.');
});

// Start app
startServer();
