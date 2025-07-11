import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  CardActions, 
  Button, 
  Box,
  CircularProgress,
  Alert,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Badge,
  Rating,
  Stack,
  useTheme
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { cart, addToCart } = useCart();
  const [contactDialog, setContactDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { user, isVendor } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getAll();
        setProducts(response.data);
      } catch (err) {
        setError('Failed to fetch products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const handleContactVendor = (product) => {
    setSelectedProduct(product);
    setContactDialog(true);
  };

  const handleEditProduct = (productId) => {
    navigate(`/edit-product/${productId}`);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.delete(productId);
        setProducts(products.filter(p => p._id !== productId));
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          All Products
        </Typography>
        {isVendor && (
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/add-product')}
          >
            Add New Product
          </Button>
        )}
      </Box>

      {products.length === 0 ? (
        <Box textAlign="center" my={4}>
          <Typography variant="h6">No products available yet.</Typography>
          {isVendor && (
            <Button 
              variant="contained" 
              color="primary"
              sx={{ mt: 2 }}
              onClick={() => navigate('/add-product')}
            >
              Add Your First Product
            </Button>
          )}
        </Box>
      ) : (
        <>
          {cart.length > 0 && (
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <Badge badgeContent={cart.length} color="primary">
                <ShoppingCartIcon sx={{ mr: 1 }} />
              </Badge>
              <Typography variant="h6" color="primary">
                {cart.length} items in cart
              </Typography>
            </Box>
          )}
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item key={product._id} xs={12} sm={6} md={4}>
                <Card sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 3,
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  }
                }}>
                  <CardMedia
                    component="img"
                    height="250"
                    image={product.image && product.image.startsWith('/uploads') ? `${BACKEND_URL}${product.image}` : product.image}
                    alt={product.title}
                    sx={{
                      objectFit: 'cover',
                      borderRadius: '8px 8px 0 0',
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack spacing={1}>
                      <Typography 
                        gutterBottom 
                        variant="h5" 
                        component="h2"
                        sx={{ 
                          fontWeight: 600,
                          lineHeight: 1.2,
                          mb: 1 
                        }}
                      >
                        {product.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        paragraph
                        sx={{ 
                          height: '60px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {product.description}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography 
                          variant="h6" 
                          color="primary"
                          sx={{ fontWeight: 600 }}
                        >
                          ${product.price}
                        </Typography>
                        <Rating 
                          value={product.rating || 0} 
                          precision={0.5} 
                          readOnly 
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Stack>
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                    <Stack direction="row" spacing={2}>
                      <Button 
                        variant="contained" 
                        startIcon={<ShoppingCartIcon />} 
                        onClick={() => handleAddToCart(product)}
                        sx={{
                          textTransform: 'none',
                          borderRadius: 2,
                          px: 3,
                          '&:hover': {
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                          },
                        }}
                      >
                        Add to Cart
                      </Button>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleContactVendor(product)}
                        size="large"
                      >
                        <ChatBubbleOutlineIcon />
                      </IconButton>
                      {isVendor && (
                        <>
                          <IconButton 
                            color="secondary" 
                            onClick={() => handleEditProduct(product._id)}
                            size="large"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteProduct(product._id)}
                            size="large"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </Stack>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
      <Dialog 
        open={contactDialog} 
        onClose={() => setContactDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Contact Vendor</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedProduct && (
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {selectedProduct.title}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="subtitle1">
                    Vendor: {selectedProduct.vendorName}
                  </Typography>
                  <Typography variant="subtitle1" color="primary">
                    {selectedProduct.vendorEmail}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Contact the vendor directly for more information or to place an order
                </Typography>
              </Stack>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setContactDialog(false)}
            variant="outlined"
            sx={{
              textTransform: 'none',
              borderRadius: 2,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Products;
