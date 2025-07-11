const express = require('express');
const Product = require('../models/Product');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Token verification error:', err);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
};

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Add a new product (Vendor only)
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  console.log('BODY:', req.body);
  console.log('FILE:', req.file);
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ error: 'Only vendors can add products' });
    }
    
    // Create image URL
    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
      console.log('Generated image URL:', imageUrl);
    }
    
    let { title, description, price } = req.body;
    title = title ? title.trim() : '';
    price = price ? parseFloat(price) : null;
    let imagePath = '';
    if (req.file) {
      imagePath = '/uploads/' + req.file.filename;
    }
    
    // Validate input
    if (!title || !price) {
      return res.status(400).json({ error: 'Title and price are required' });
    }
    
    // Create product
    const newProduct = new Product({
      title,
      description: description || '',
      price,
      vendorId: req.user.id,
      image: imageUrl || ''
    });
    
    await newProduct.save();
    
    // Populate vendor info
    await newProduct.populate('vendorId', 'name email');
    
    res.status(201).json({
      message: 'Product added successfully',
      product
    });
    
  } catch (err) {
    console.error('Add product error:', err);
    res.status(500).json({ error: 'Server error while adding product' });
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find()
      .populate('vendorId', 'name email')
      .sort({ createdAt: -1 });
      
    res.json(products);
    
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'Server error while fetching products' });
  }
});

// Get a single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('vendorId', 'name email whatsappNumber');
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('Get product by ID error:', err);
    res.status(500).json({ error: 'Server error while fetching product' });
  }
});

// Get products by vendor
router.get('/vendor/:vendorId', verifyToken, async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    // If it's not the vendor themselves or an admin, restrict access
    if (req.user.role !== 'admin' && req.user.id !== vendorId) {
      return res.status(403).json({ error: 'Not authorized to view these products' });
    }
    
    const products = await Product.find({ vendorId })
      .populate('vendorId', 'name email')
      .sort({ createdAt: -1 });
      
    res.json(products);
    
  } catch (err) {
    console.error('Get vendor products error:', err);
    res.status(500).json({ error: 'Server error while fetching vendor products' });
  }
});

// Delete a product (Vendor or Admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    // Only the vendor who owns the product or an admin can delete
    if (req.user.role !== 'admin' && product.vendorId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this product' });
    }
    // Delete image file if exists
    if (product.image && product.image.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '../../', product.image);
      fs.unlink(imagePath, err => {
        if (err) console.warn('Failed to delete image file:', imagePath);
      });
    }
    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Server error while deleting product' });
  }
});

// Edit a product (Vendor or Admin only)
router.put('/:id', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    // Only the vendor who owns the product or an admin can edit
    if (req.user.role !== 'admin' && product.vendorId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to edit this product' });
    }
    let { title, description, price } = req.body;
    title = title ? title.trim() : product.title;
    price = price ? parseFloat(price) : product.price;
    // If a new image is uploaded, delete the old one
    if (req.file) {
      if (product.image && product.image.startsWith('/uploads/')) {
        const oldImagePath = path.join(__dirname, '../../', product.image);
        fs.unlink(oldImagePath, err => {
          if (err) console.warn('Failed to delete old image file:', oldImagePath);
        });
      }
      product.image = '/uploads/' + req.file.filename;
    }
    product.title = title;
    product.description = description || product.description;
    product.price = price;
    await product.save();
    await product.populate('vendorId', 'name email');
    res.json({ message: 'Product updated successfully', product });
  } catch (err) {
    console.error('Edit product error:', err);
    res.status(500).json({ error: 'Server error while editing product' });
  }
});

module.exports = router;
