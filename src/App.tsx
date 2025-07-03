import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import StaffDashboard from './pages/staff/StaffDashboard';
import ProductsPage from './pages/admin/ProductsPage';
import StocksPage from './pages/admin/StocksPage';
import SuppliersPage from './pages/admin/SuppliersPage';
import TransactionsPage from './pages/admin/TransactionsPage';
import ExpiredProductsPage from './pages/admin/ExpiredProductsPage';
import DamagedProductsPage from './pages/admin/DamagedProductsPage';
import StaffAccountsPage from './pages/admin/StaffAccountsPage';
import StaffStocksPage from './pages/staff/StaffStocksPage';
import StaffTransactionsPage from './pages/staff/StaffTransactionsPage';
import StaffExpiredProductsPage from './pages/staff/StaffExpiredProductsPage';
import StaffDamagedProductsPage from './pages/staff/StaffDamagedProductsPage';
import StaffAccountSettingsPage from './pages/staff/StaffAccountSettingsPage';
import ProtectedRoute from './components/routes/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const { currentUser, loading } = useAuth();

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 via-white to-wine-50">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 border-4 border-wine-700 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <div className="space-y-2">
            <p className="text-wine-700 font-semibold text-lg">Loading Winehouse...</p>
            <p className="text-gray-500 text-sm">Please wait while we prepare your workspace</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        currentUser ? (
          <Navigate to={currentUser.role === 'admin' ? '/admin/dashboard' : '/staff/dashboard'} />
        ) : (
          <Navigate to="/login" />
        )
      } />
      
      {/* Public routes - only accessible when not logged in */}
      <Route path="/login" element={
        currentUser ? (
          <Navigate to={currentUser.role === 'admin' ? '/admin/dashboard' : '/staff/dashboard'} />
        ) : (
          <LoginPage />
        )
      } />
      <Route path="/register" element={
        currentUser ? (
          <Navigate to={currentUser.role === 'admin' ? '/admin/dashboard' : '/staff/dashboard'} />
        ) : (
          <RegisterPage />
        )
      } />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="stocks" element={<StocksPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="expired-products" element={<ExpiredProductsPage />} />
        <Route path="damaged-products" element={<DamagedProductsPage />} />
        <Route path="staff-accounts" element={<StaffAccountsPage />} />
      </Route>
      
      {/* Staff Routes */}
      <Route path="/staff" element={<ProtectedRoute allowedRoles={['staff']} />}>
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="stocks" element={<StaffStocksPage />} />
        <Route path="transactions" element={<StaffTransactionsPage />} />
        <Route path="expired-products" element={<StaffExpiredProductsPage />} />
        <Route path="damaged-products" element={<StaffDamagedProductsPage />} />
        <Route path="account-settings" element={<StaffAccountSettingsPage />} />
      </Route>
      
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;