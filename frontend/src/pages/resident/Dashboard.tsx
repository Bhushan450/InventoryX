import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getResidentDashboard } from '../../api/adminApi';
import { ResidentDashboard } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  ShoppingBag,
  Clock,
  IndianRupee,
  PiggyBank,
  ArrowRight,
  Package,
  ReceiptText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const ResidentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<ResidentDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getResidentDashboard();
      if (res.success && res.data) {
        setDashboard(res.data);
      } else {
        setError(res.message || 'Failed to fetch resident dashboard.');
      }
    } catch (err: any) {
      console.error('Resident dashboard error:', err);
      setError(
        err.response?.data?.message || 'Error fetching dashboard data from the server.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." size="lg" />;
  }

  const recentOrders = dashboard?.recentOrders || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="inline-block px-3 py-1 bg-emerald-700/60 rounded-full text-xs font-semibold uppercase tracking-wider text-emerald-200 mb-2">
            Resident Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Neighbor'}!
          </h1>
          <p className="text-emerald-200/90 text-sm mt-1">
            Flat Number: <span className="font-semibold text-white">{user?.flatNumber || 'N/A'}</span> — Pooling demand for maximum society savings.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Link
            to="/app/products"
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-white text-emerald-900 font-bold text-sm rounded-xl hover:bg-emerald-50 transition-colors shadow-xs"
          >
            <Package className="w-4 h-4 text-emerald-600" />
            <span>Browse Products</span>
          </Link>
          <Link
            to="/app/orders"
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-800/80 hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl border border-emerald-700 transition-colors"
          >
            <ReceiptText className="w-4 h-4" />
            <span>My Orders</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
          <div className="flex-1">
            <p className="font-medium">Could not refresh live statistics</p>
            <p className="text-xs text-amber-700 mt-0.5">{error}</p>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-1 bg-amber-200 hover:bg-amber-300 rounded text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total Orders
            </p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">
              {recentOrders.length}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Purchases placed</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Pending Payments
            </p>
            <h3 className={`text-2xl font-black mt-1 ${
              (dashboard?.pendingPayments ?? 0) > 0 ? 'text-amber-600' : 'text-gray-900'
            }`}>
              {dashboard?.pendingPayments ?? 0}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Awaiting checkout</p>
          </div>
          <div className={`p-3 rounded-xl ${
            (dashboard?.pendingPayments ?? 0) > 0
              ? 'bg-amber-50 text-amber-700'
              : 'bg-gray-100 text-gray-500'
          }`}>
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total Spent
            </p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">
              ₹{(dashboard?.totalSpent ?? 0).toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Wholesale cost billed</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        {/* Estimated Savings */}
        <div className="bg-emerald-50/70 border border-emerald-200 p-5 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Your Bulk Savings
            </p>
            <h3 className="text-2xl font-black text-emerald-700 mt-1">
              ₹{(dashboard?.estimatedSavings ?? 0).toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-emerald-600 mt-0.5">Saved vs retail prices</p>
          </div>
          <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-xs">
            <PiggyBank className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <p className="text-xs text-gray-500">Your latest society bulk purchase activities</p>
          </div>
          <Link
            to="/app/orders"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto text-gray-400 mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-800">No orders placed yet</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              You haven't participated in any bulk buying yet. Start ordering essentials to pool demand with your neighbors!
            </p>
            <Link
              to="/app/products"
              className="mt-5 inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors"
            >
              <Package className="w-4 h-4" />
              <span>Browse Catalog</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                <tr>
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Items</th>
                  <th className="px-6 py-3">Total Amount</th>
                  <th className="px-6 py-3">Payment</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">#{order.id}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Today'}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-700">
                      {order.items?.length || 0} items
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-800">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.paymentStatus} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.orderStatus} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/app/orders/${order.id}`}
                        className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-600 hover:text-emerald-800"
                      >
                        <span>Details</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResidentDashboardPage;
