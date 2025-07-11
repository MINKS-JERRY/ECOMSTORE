import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Alert,
  CircularProgress,
  Card,
  CardMedia,
  Grid,
  Stack,
  useTheme
} from '@mui/material';
import { productsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const AddProduct = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    image: null
  });
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isVendor } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate image file
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('Image must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setError('');
    };
    reader.readAsDataURL(file);
    setFormData(prev => ({ ...prev, image: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset error state
    setError('');

    // Validate form
    if (!formData.title || formData.title.trim() === '') {
      setError('Title is required');
      return;
    }

    if (!formData.price || formData.price <= 0) {
      setError('Price is required and must be greater than 0');
      return;
    }

    if (isNaN(formData.price)) {
      setError('Price must be a valid number');
      return;
    }

    // Validate image
    if (!formData.image) {
      setError('Please upload a product image');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      // Create FormData object
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('price', formData.price);
      formDataToSend.append('image', formData.image);
      
      // Log form data for debugging
      console.log('Sending form data:', {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        image: formData.image.name
      });
      
      await productsAPI.create({
        title: formData.title,
        description: formData.description || '',
        price: formData.price,
        image: formData.image
      });
      
      // Redirect to products page after successful creation
      navigate('/products');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to add product';
      setError(errorMessage);
      console.error('Add product error:', {
        error: err,
        response: err.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  // Redirect non-vendors away from this page
  if (!isVendor()) {
    navigate('/products');
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 2, md: 4 }, mb: { xs: 2, md: 4 }, px: { xs: 1, sm: 2 } }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, boxShadow: 3 }}>
        <Stack spacing={3}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{ fontWeight: 600, textAlign: 'center', fontSize: { xs: '1.5rem', md: '2.2rem' } }}
          >
            Add New Product
          </Typography>
          {error && (
            <Alert 
              severity="error" 
              sx={{ borderRadius: 1, mb: 2 }}
            >
              {error}
            </Alert>
          )}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Product Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  error={error.includes('Title')}
                  helperText={error.includes('Title') ? error : ''}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                />
                <TextField
                  fullWidth
                  label="Product Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                />
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  type="number"
                  required
                  error={error.includes('Price')}
                  helperText={error.includes('Price') ? error : ''}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                />
                <Box>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="raised-button-file"
                    type="file"
                    onChange={handleImageChange}
                  />
                  <label htmlFor="raised-button-file">
                    <Button
                      variant="contained"
                      component="span"
                      fullWidth
                      disabled={loading}
                      startIcon={preview ? <CloudUploadIcon /> : <AddPhotoAlternateIcon />}
                      sx={{
                        borderRadius: 1,
                        textTransform: 'none',
                        '&:hover': {
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        },
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={24} />
                      ) : preview ? (
                        'Replace Image'
                      ) : (
                        'Upload Product Image'
                      )}
                    </Button>
                  </label>
                </Box>
                {error.includes('Image') && (
                  <Typography 
                    color="error" 
                    variant="body2" 
                    sx={{ mt: 1 }}
                  >
                    {error}
                  </Typography>
                )}
                {preview && (
                  <Card 
                    sx={{ 
                      height: { xs: 180, md: 250 },
                      borderRadius: 2,
                      boxShadow: 2,
                      mt: 2
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="250"
                      image={preview}
                      alt="Product Preview"
                      sx={{
                        objectFit: 'cover',
                        borderRadius: '8px 8px 0 0',
                        height: { xs: 180, md: 250 }
                      }}
                    />
                  </Card>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    borderRadius: 1,
                    textTransform: 'none',
                    mt: 2,
                    '&:hover': {
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Add Product'
                  )}
                </Button>
              </Stack>
            </form>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};

export default AddProduct;
