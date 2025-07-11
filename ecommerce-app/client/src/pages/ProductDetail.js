import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Typography, Box, CircularProgress, Stack, CardMedia, Divider, Button } from '@mui/material';
import { productsAPI } from '../services/api';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await productsAPI.getById(productId);
        setProduct(res.data);
      } catch (err) {
        setError('Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  }
  if (error || !product) {
    return <Typography color="error" align="center" mt={4}>{error || 'Product not found'}</Typography>;
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
        <Stack spacing={3}>
          <CardMedia
            component="img"
            height="300"
            image={product.image && product.image.startsWith('/uploads') ? `${BACKEND_URL}${product.image}` : product.image}
            alt={product.title}
            sx={{ objectFit: 'cover', borderRadius: 2 }}
          />
          <Typography variant="h4" sx={{ fontWeight: 600 }}>{product.title}</Typography>
          <Typography variant="body1" color="text.secondary">{product.description}</Typography>
          <Divider />
          <Typography variant="h5" color="primary">CFA {product.price}</Typography>
          {product.vendorId && (
            <Box>
              <Typography variant="subtitle1">Vendor: {product.vendorId.name}</Typography>
              <Typography variant="subtitle2" color="text.secondary">{product.vendorId.email}</Typography>
              {product.vendorId.whatsappNumber && (
                <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                  <WhatsAppIcon color="success" />
                  <Typography variant="body2">{product.vendorId.whatsappNumber}</Typography>
                  <Button
                    variant="outlined"
                    color="success"
                    size="small"
                    href={`https://wa.me/${product.vendorId.whatsappNumber.replace(/[^\d]/g, '')}`}
                    target="_blank"
                    startIcon={<WhatsAppIcon />}
                    sx={{ ml: 1 }}
                  >
                    WhatsApp
                  </Button>
                </Stack>
              )}
            </Box>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};

export default ProductDetail; 