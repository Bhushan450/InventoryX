import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  Truck,
  PiggyBank,
  LogOut,
  Menu,
  X,
  Boxes,
  ShieldCheck,
  Users,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Residents', path: '/admin/residents', icon: Users },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Bulk Demand', path: '/admin/bulk-demand', icon: TrendingUp },
    { name: 'Bulk Purchases', path: '/admin/bulk-purchases', icon: Truck },
    { name: 'Savings Report', path: '/admin/savings', icon: PiggyBank },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile top bar */}
      <div className="md:hidden bg-emerald-950 text-white px-4 py-3 flex items-center justify-between border-b border-emerald-900">
        <div className="flex items-center space-x-2">
          <div className="bg-emerald-500 p-1.5 rounded-lg text-emerald-950">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight">SocietyBulk</span>
            <span className="ml-2 text-xs uppercase px-1.5 py-0.5 bg-emerald-800 text-emerald-300 rounded font-semibold">
              Admin
            </span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 rounded-md text-emerald-200 hover:text-white hover:bg-emerald-900 focus:outline-none"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar for Desktop & Mobile drawer */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:block md:w-64 bg-emerald-950 text-white flex-shrink-0 flex flex-col min-h-screen md:sticky md:top-0 border-r border-emerald-900 z-30`}
      >
        {/* Brand */}
        <div className="p-5 border-b border-emerald-900/80 flex items-center space-x-3">
          <div className="bg-emerald-500 p-2 rounded-xl text-emerald-950 shadow-sm">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-white">SocietyBulk</h1>
            <p className="text-xs text-emerald-400 font-medium flex items-center mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Admin Portal
            </p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-emerald-200/80 hover:bg-emerald-900/60 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout at bottom */}
        <div className="p-4 border-t border-emerald-900/80 bg-emerald-950/60">
          <div className="mb-3 px-2">
            <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
            <div className="text-xs text-emerald-400 truncate">{user?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-emerald-200 bg-emerald-900/70 hover:bg-rose-900/60 hover:text-rose-200 rounded-lg transition-colors border border-emerald-800"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top bar on desktop */}
        <header className="hidden md:flex bg-white border-b border-gray-200 h-16 items-center justify-between px-8 sticky top-0 z-20 shadow-xs">
          <div>
            <h2 className="text-sm font-medium text-gray-500">
              Community Bulk Procurement & Distribution
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800 leading-none">{user?.name}</p>
                <span className="text-xs text-emerald-600 font-medium">Administrator</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Body content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
