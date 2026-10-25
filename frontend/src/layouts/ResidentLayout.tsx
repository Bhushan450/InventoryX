import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  ShoppingBag,
  LayoutDashboard,
  Package,
  ShoppingCart,
  ReceiptText,
  LogOut,
  Menu,
  X,
  Home,
} from 'lucide-react';

export const ResidentLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/app/products', icon: Package },
    {
      name: 'Cart',
      path: '/app/cart',
      icon: ShoppingCart,
      badge: cartCount > 0 ? cartCount : undefined,
    },
    { name: 'My Orders', path: '/app/orders', icon: ReceiptText },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Brand */}
            <div className="flex items-center space-x-3">
              <NavLink to="/app/dashboard" className="flex items-center space-x-2.5">
                <div className="bg-emerald-600 text-white p-2 rounded-xl shadow-xs">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-xl tracking-tight text-gray-900">
                    Society<span className="text-emerald-600">Bulk</span>
                  </span>
                  <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
                    Resident
                  </span>
                </div>
              </NavLink>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 font-semibold'
                          : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-100/70'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                    {item.badge !== undefined && (
                      <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-600 text-white animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* User Profile & Logout */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2.5 pl-3 border-l border-gray-200">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.name}</p>
                  <p className="text-xs text-gray-500 flex items-center">
                    <Home className="w-3 h-3 mr-0.5 inline text-emerald-600" />
                    Flat {user?.flatNumber || 'N/A'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Logout"
                className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-gray-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center space-x-2">
              <NavLink
                to="/app/cart"
                className="p-2 text-gray-600 hover:text-emerald-600 relative"
                aria-label="View Cart"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-emerald-600 text-white">
                    {cartCount}
                  </span>
                )}
              </NavLink>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-medium ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-emerald-600" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-600 text-white">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}

            <div className="pt-3 mt-2 border-t border-gray-200">
              <div className="flex items-center justify-between px-3 py-2">
                <div>
                  <p className="font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">Flat {user?.flatNumber || 'N/A'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 text-sm font-medium text-rose-600 hover:text-rose-700"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-500">
          SocietyBulk &copy; {new Date().getFullYear()} — Collective Buying For Smarter Residential Living.
        </div>
      </footer>
    </div>
  );
};

export default ResidentLayout;
