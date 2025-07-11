import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout, isVendor } = useAuth();
  const navigate = useNavigate();
  const { cart } = useCart();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
              E-Commerce App
            </Link>
          </Typography>
          
          <Box>
            {user ? (
              <>
                {isVendor() && (
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/add-product" 
                    sx={{ mr: 2 }}
                  >
                    Add Product
                  </Button>
                )}
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/products" 
                  sx={{ mr: 2 }}
                >
                  Products
                </Button>
                <Button color="inherit" component={Link} to="/cart" sx={{ mr: 2 }}>
                  <ShoppingCartIcon />
                  {cart.length > 0 && (
                    <span style={{ marginLeft: 4, fontWeight: 600 }}>{cart.length}</span>
                  )}
                </Button>
                <span style={{ marginRight: '10px' }}>
                  Welcome, {user.name} ({user.role})
                </span>
                <Button 
                  color="inherit" 
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button color="inherit" component={Link} to="/login">
                  Login
                </Button>
                <Button color="inherit" component={Link} to="/register">
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
