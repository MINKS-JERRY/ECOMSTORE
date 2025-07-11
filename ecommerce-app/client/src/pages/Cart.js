import React from 'react';
import { Container, Paper, Typography, Box, Button, IconButton, Stack, TextField, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 2, md: 4 }, mb: { xs: 2, md: 4 }, px: { xs: 1, sm: 2 } }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, textAlign: 'center', fontSize: { xs: '1.5rem', md: '2.2rem' } }}>Shopping Cart</Typography>
        {cart.length === 0 ? (
          <Typography variant="h6" align="center">Your cart is empty.</Typography>
        ) : (
          <>
            {cart.map(item => (
              <Box key={item._id} display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" mb={2} gap={2}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
                  <img src={item.image && item.image.startsWith('/uploads') ? `http://localhost:5000${item.image}` : item.image} alt={item.title} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, maxWidth: '100%' }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                    <Typography variant="body1" color="primary">CFA {item.price}</Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
                  <TextField
                    type="number"
                    size="small"
                    value={item.quantity}
                    onChange={e => updateQuantity(item._id, Math.max(1, parseInt(e.target.value) || 1))}
                    inputProps={{ min: 1, style: { width: 50, textAlign: 'center' } }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    component={Link}
                    to={`/product/${item._id}`}
                    sx={{ minWidth: 0, px: 1 }}
                  >
                    View
                  </Button>
                  <IconButton color="error" onClick={() => removeFromCart(item._id)}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Box>
            ))}
            <Divider sx={{ my: 3 }} />
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2}>
              <Typography variant="h5" sx={{ fontWeight: 600, fontSize: { xs: '1.1rem', md: '1.5rem' } }}>Total: CFA {total.toLocaleString()}</Typography>
              <Button variant="contained" color="primary" onClick={clearCart} sx={{ width: { xs: '100%', sm: 'auto' } }}>Clear Cart</Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default Cart; 