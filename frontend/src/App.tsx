import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import ResidentLayout from './layouts/ResidentLayout';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Resident Pages
import ResidentDashboardPage from './pages/resident/Dashboard';
import ResidentProductsPage from './pages/resident/Products';
import ResidentCartPage from './pages/resident/Cart';
import ResidentOrdersPage from './pages/resident/Orders';
import ResidentOrderDetailPage from './pages/resident/OrderDetail';
import ResidentPaymentPage from './pages/resident/Payment';

// Admin Pages
import AdminDashboardPage from './pages/admin/Dashboard';
import AdminProductsPage from './pages/admin/Products';
import AdminOrdersPage from './pages/admin/Orders';
import AdminBulkDemandPage from './pages/admin/BulkDemand';
import AdminBulkPurchasesPage from './pages/admin/BulkPurchases';
import AdminSavingsPage from './pages/admin/Savings';
import AdminResidentsPage from './pages/admin/Residents';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Resident Protected Routes */}
          <Route
            path="/app"
            element={
              <ProtectedRoute allowedRole="RESIDENT">
                <ResidentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<ResidentDashboardPage />} />
            <Route path="products" element={<ResidentProductsPage />} />
            <Route path="cart" element={<ResidentCartPage />} />
            <Route path="orders" element={<ResidentOrdersPage />} />
            <Route path="orders/:id" element={<ResidentOrderDetailPage />} />
            <Route path="orders/:id/payment" element={<ResidentPaymentPage />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="residents" element={<AdminResidentsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="bulk-demand" element={<AdminBulkDemandPage />} />
            <Route path="bulk-purchases" element={<AdminBulkPurchasesPage />} />
            <Route path="savings" element={<AdminSavingsPage />} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
