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

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://ecomstore-7v4x.onrender.com',
  'https://ecomstore-7v4x.onrender.com/'
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      console.log('Allowing origin in development:', origin);
      return callback(null, true);
    }
    
    // In production, only allow specific origins
    if (allowedOrigins.includes(origin) || origin.endsWith('.onrender.com')) {
      return callback(null, true);
    }
    
    console.log('❌ CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
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
    'X-Requested-With',
    'X-Access-Token',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods'
  ],
  exposedHeaders: [
    'Content-Length', 
    'X-Foo', 
    'X-Bar',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Credentials'
  ],
  optionsSuccessStatus: 200,
  preflightContinue: false,
  maxAge: 86400
};

// Apply CORS with our configuration
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  if (Object.keys(req.body).length > 0) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Add CORS debugging middleware
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.path} - Origin: ${req.headers.origin || 'No origin'}`);
  next();
});

app.use(express.json());

// API Routes must come before static files
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory at:', uploadsDir);
}

// Serve uploaded files statically with proper headers
console.log('Serving uploads from:', uploadsDir);
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, path) => {
    // Set proper cache and CORS headers for images
    if (path.match(/\.(jpg|jpeg|png|gif)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  },
  // Enable directory listing for debugging
  index: false,
  // Allow access to all files in the directory
  dotfiles: 'allow'
}));

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
  const clientBuildPath = path.join(__dirname, '..', 'client', 'build');
  console.log('Serving static files from:', clientBuildPath);
  
  if (fs.existsSync(clientBuildPath)) {
    console.log('✅ Found React build directory');
    
    // Serve static files from the React build directory
    app.use(express.static(clientBuildPath, {
      maxAge: '1y',
      etag: true,
      lastModified: true,
      setHeaders: (res, path) => {
        // Cache static assets for 1 year
        if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000');
        }
      }
    }));
    
    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api/') && !req.path.startsWith('/uploads/')) {
        console.log('Serving React app for path:', req.path);
        res.sendFile(path.join(clientBuildPath, 'index.html'));
      } else {
        res.status(404).json({ error: 'Not found' });
      }
    });
  } else {
    console.error('❌ React build directory not found at:', clientBuildPath);
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

// MongoDB Connection
const connectToMongoDB = async () => {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.error('❌ MONGO_URI is not defined in .env');
    return false;
  }

  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log('Using MongoDB URI:', MONGO_URI.replace(/(mongodb(\+srv)?:\/\/[^:]+:)[^@]+/i, '$1*****'));
    
    const options = {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      maxPoolSize: 10, // Maintain up to 10 socket connections
      retryWrites: true,
      w: 'majority'
    };

    await mongoose.connect(MONGO_URI, options);
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
