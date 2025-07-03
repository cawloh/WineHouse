import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Wine, Package, BarChart2, FileText, LogOut, Menu, X, AlertTriangle, Settings, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface StaffLayoutProps {
  children: React.ReactNode;
}

const StaffLayout: React.FC<StaffLayoutProps> = ({ children }) => {
  const { currentUser, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    // Add smooth transition effect
    const logoutElement = document.createElement('div');
    logoutElement.className = 'fixed inset-0 bg-wine-900 bg-opacity-90 flex items-center justify-center z-50 transition-all duration-500';
    logoutElement.innerHTML = `
      <div class="text-center text-white animate-fade-in">
        <div class="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-lg font-medium">Logging out...</p>
        <p class="text-sm opacity-75">See you soon!</p>
      </div>
    `;
    document.body.appendChild(logoutElement);

    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    logout();
    navigate('/login');
    
    // Clean up
    document.body.removeChild(logoutElement);
    setIsLoggingOut(false);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
      isActive
        ? 'bg-wine-gradient text-white shadow-lg scale-105'
        : 'text-gray-700 hover:bg-gradient-to-r hover:from-wine-100 hover:to-wine-50 hover:text-wine-800 hover:scale-[1.02] hover:shadow-md'
    }`;

  const getDisplayName = () => {
    if (currentUser?.firstName && currentUser?.lastName) {
      return `${currentUser.firstName} ${currentUser.lastName}`;
    }
    return currentUser?.username || 'Staff Member';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-wine-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 border-4 border-wine-700 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <div className="space-y-2">
            <p className="text-wine-700 font-semibold text-lg">Loading dashboard...</p>
            <p className="text-gray-500 text-sm">Please wait while we prepare your workspace</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-cream-50 via-white to-wine-50">
      {/* Mobile Header */}
      <header className="md:hidden bg-wine-gradient text-white p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <Wine size={28} className="animate-bounce-gentle" />
          <h1 className="font-serif text-xl font-semibold">Winehouse</h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar for desktop / Mobile menu */}
      <aside 
        className={`${
          isMobileMenuOpen ? 'block animate-slide-up' : 'hidden'
        } md:block w-full md:w-72 bg-white/90 backdrop-blur-md border-r border-gray-200/50 p-6 md:h-screen md:sticky md:top-0 overflow-y-auto shadow-xl`}
      >
        <div className="hidden md:flex items-center gap-3 mb-8 p-4 bg-gradient-to-r from-wine-50 to-cream-50 rounded-2xl transition-all duration-300 hover:shadow-md">
          <Wine size={32} className="text-wine-700 animate-bounce-gentle" />
          <div>
            <h1 className="font-serif text-2xl text-wine-700 font-bold">Winehouse</h1>
            <p className="text-xs text-wine-600 uppercase tracking-wider">Management System</p>
          </div>
        </div>

        <div className="mb-8 hidden md:block p-4 bg-gradient-to-r from-gold-50 to-cream-50 rounded-2xl transition-all duration-300 hover:shadow-md">
          <div className="flex items-center gap-3 mb-3">
            {/* Profile Picture */}
            {currentUser?.profileImage ? (
              <img
                src={currentUser.profileImage}
                alt="Profile"
                className="w-12 h-12 object-cover rounded-full border-2 border-white shadow-md transition-all duration-300 hover:scale-110"
                onError={(e) => {
                  console.error('Profile image failed to load');
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-wine-100 to-wine-200 rounded-full border-2 border-white shadow-md flex items-center justify-center transition-all duration-300 hover:scale-110">
                <User size={20} className="text-wine-600" />
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">Welcome back,</p>
              <p className="font-semibold text-gray-800 text-lg truncate">{getDisplayName()}</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-gold-400 rounded-full mr-2 animate-pulse"></div>
            <p className="text-xs text-gold-600 uppercase tracking-wider font-medium">Staff Member</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <NavLink to="/staff/dashboard" className={navLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
            <BarChart2 size={20} className="group-hover:scale-110 transition-transform" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/staff/stocks" className={navLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
            <Package size={20} className="group-hover:scale-110 transition-transform" />
            <span>Stocks</span>
          </NavLink>
          <NavLink to="/staff/transactions" className={navLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
            <FileText size={20} className="group-hover:scale-110 transition-transform" />
            <span>Transactions</span>
          </NavLink>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Report Products
            </p>
            <NavLink to="/staff/expired-products" className={navLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
              <AlertTriangle size={20} className="group-hover:scale-110 transition-transform" />
              <span>Expired Products</span>
            </NavLink>
            <NavLink to="/staff/damaged-products" className={navLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
              <AlertTriangle size={20} className="group-hover:scale-110 transition-transform" />
              <span>Damaged Products</span>
            </NavLink>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Account
            </p>
            <NavLink to="/staff/account-settings" className={navLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
              <Settings size={20} className="group-hover:scale-110 transition-transform" />
              <span>Account Settings</span>
            </NavLink>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-3 text-gray-700 hover:text-red-600 px-4 py-3 w-full transition-all duration-300 rounded-xl hover:bg-red-50 hover:scale-[1.02] group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut size={20} className="group-hover:scale-110 transition-transform" />
              <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default StaffLayout;