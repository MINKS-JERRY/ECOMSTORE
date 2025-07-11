import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import Navbar from './components/Navbar';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './theme/theme';
import ErrorBoundary from './components/ErrorBoundary';
import Loading from './components/Loading';
import { CartProvider } from './context/CartContext';
import Cart from './pages/Cart';
import ProductDetail from './pages/ProductDetail';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

const VendorRoute = ({ children }) => {
  const { isAuthenticated, isVendor } = useAuth();
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return isVendor() ? children : <Navigate to="/products" />;
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            } />
            <Route path="/add-product" element={
              <VendorRoute>
                <AddProduct />
              </VendorRoute>
            } />
            <Route path="/edit-product/:productId" element={<EditProduct />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/product/:productId" element={<ProductDetail />} />
            <Route path="/" element={<Navigate to="/products" replace />} />
            <Route path="*" element={
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <h4>Page Not Found</h4>
                <button onClick={() => window.history.back()}>Go Back</button>
              </div>
            } />
          </Routes>
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;


