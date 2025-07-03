import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../../layouts/AdminLayout';
import StaffLayout from '../../layouts/StaffLayout';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 via-white to-wine-50">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 border-4 border-wine-700 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <div className="space-y-2">
            <p className="text-wine-700 font-semibold text-lg">Loading...</p>
            <p className="text-gray-500 text-sm">Please wait while we verify your authentication</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  // Determine which layout to use based on user role
  if (currentUser.role === 'admin') {
    return (
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    );
  } else {
    return (
      <StaffLayout>
        <Outlet />
      </StaffLayout>
    );
  }
};

export default ProtectedRoute;