import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ShoppingCart,
  PiggyBank,
  Truck,
  ShieldCheck,
  TrendingDown,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Landing: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  const steps = [
    {
      step: '01',
      title: 'Residents Order Together',
      description:
        'Apartment residents select essentials like flour, oil, pulses, and detergents from the catalogue.',
      icon: ShoppingCart,
    },
    {
      step: '02',
      title: 'Demand Aggregation',
      description:
        'The platform automatically pools individual apartment needs into consolidated bulk volume orders.',
      icon: Users,
    },
    {
      step: '03',
      title: 'Wholesale Procurement',
      description:
        'Admins procure goods directly from farmers & wholesale suppliers at 25-40% below retail MSRP.',
      icon: Truck,
    },
    {
      step: '04',
      title: 'Clubhouse Distribution',
      description:
        'Supplies arrive at the society clubhouse, organized for easy pickup or doorstep collection.',
      icon: PiggyBank,
    },
  ];

  const benefits = [
    {
      title: 'Deep Collective Savings',
      desc: 'Bypass intermediary distributor markups. Save ₹1,500 - ₹4,000 monthly per household on kitchen staples.',
      icon: TrendingDown,
    },
    {
      title: 'Verified Quality Sourcing',
      desc: 'Wholesale certified suppliers vetted for consistent grain quality, freshness, and authentic packaging.',
      icon: ShieldCheck,
    },
    {
      title: 'Transparent Accounting',
      desc: 'Live tracking of procurement price, order statuses, delivery timelines, and exact resident savings.',
      icon: Sparkles,
    },
    {
      title: 'Community Empowerment',
      desc: 'Harness the purchasing power of your residential society to negotiate genuine bulk market rates.',
      icon: Building,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      {/* Navbar */}
      <header className="border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="bg-emerald-600 text-white p-2 rounded-xl shadow-xs">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-gray-900">
              Society<span className="text-emerald-600">Bulk</span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <Link
                to={isAdmin ? '/admin/dashboard' : '/app/dashboard'}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm shadow-xs transition-colors"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-emerald-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg shadow-xs transition-colors"
                >
                  Join Society
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-emerald-50/60 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Residential Bulk Buying System</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-tight sm:leading-none">
              Buy Together. <span className="text-emerald-600">Save Big.</span> Strengthen Your Society.
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed font-normal">
              SocietyBulk pools monthly grocery demands across apartment residents to unlock direct
              wholesale distributor prices. Save up to 40% on essentials every month.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-base"
              >
                <span>Register as Resident</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-xl border border-gray-300 shadow-xs transition-all flex items-center justify-center text-base"
              >
                <span>Resident / Admin Login</span>
              </Link>
            </div>

            {/* Quick trust metrics */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-6 pt-8 border-t border-gray-200/80">
              <div>
                <p className="text-3xl font-black text-emerald-700">25% - 40%</p>
                <p className="text-xs text-gray-500 font-medium mt-1">Average Price Discount</p>
              </div>
              <div>
                <p className="text-3xl font-black text-emerald-700">100%</p>
                <p className="text-xs text-gray-500 font-medium mt-1">Transparent Invoicing</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-3xl font-black text-emerald-700">₹0</p>
                <p className="text-xs text-gray-500 font-medium mt-1">Middlemen Markups</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24 bg-gray-50/70 border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">
              Workflow Pipeline
            </h2>
            <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
              How SocietyBulk Works
            </h3>
            <p className="mt-3 text-base text-gray-600">
              A streamlined 4-step pipeline turning scattered household grocery runs into consolidated bulk purchasing power.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-2xl font-black text-gray-200">{item.step}</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">
              Value Proposition
            </h2>
            <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
              Engineered For Modern Housing Societies
            </h3>
            <p className="mt-3 text-base text-gray-600">
              Designed specifically for resident welfare associations, apartment communities, and cooperative housing complexes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((b, idx) => {
              const Icon = b.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-gray-100 bg-emerald-50/30 flex items-start space-x-4"
                >
                  <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-xs flex-shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">{b.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* College Project / Footer note */}
      <section className="py-12 bg-emerald-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-6 h-6 text-emerald-400" />
                <span className="text-xl font-bold tracking-tight">SocietyBulk</span>
              </div>
              <p className="text-xs text-emerald-300 mt-1">
                College Project — Community Bulk-Buying & Cooperative Demand Aggregator
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-xs font-semibold uppercase tracking-wider text-white transition-colors"
              >
                Admin & Resident Portal
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
