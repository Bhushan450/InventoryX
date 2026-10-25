import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDashboard, getBulkDemand } from '../../api/adminApi';
import { getAllOrders } from '../../api/orderApi';
import { AdminDashboard, BulkDemand, Order } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Users,
  Package,
  ShoppingCart,
  CheckCircle,
  IndianRupee,
  PiggyBank,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  Clock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const AdminDashboardPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [demandData, setDemandData] = useState<BulkDemand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashRes, ordersRes, demandRes] = await Promise.allSettled([
        getAdminDashboard(),
        getAllOrders(),
        getBulkDemand(),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value.success) {
        setDashboard(dashRes.value.data);
      } else if (dashRes.status === 'fulfilled') {
        setError(dashRes.value.message || 'Error loading dashboard metrics.');
      }

      if (ordersRes.status === 'fulfilled' && ordersRes.value.success) {
        setRecentOrders(ordersRes.value.data || []);
      }

      if (demandRes.status === 'fulfilled' && demandRes.value.success) {
        setDemandData(demandRes.value.data || []);
      }
    } catch (err: any) {
      console.error('Admin dashboard load error:', err);
      setError(err.response?.data?.message || 'Failed to load administration dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Aggregating society metrics & orders..." size="lg" />;
  }

  // Prepare chart data: top products by total quantity or cost
  const chartData = demandData
    .slice(0, 7)
    .map((item) => ({
      name: item.productName.length > 12 ? `${item.productName.substring(0, 10)}...` : item.productName,
      Quantity: item.totalQuantity,
      WholesaleCost: item.estimatedWholesaleCost,
      RetailCost: item.estimatedRetailCost,
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Society Committee Overview
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Real-time monitoring of resident demand aggregation, orders, and wholesale savings
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/admin/bulk-demand"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Review Bulk Demand</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
          <div className="flex-1">
            <p className="font-semibold">Notice</p>
            <p className="text-xs text-amber-700 mt-0.5">{error}</p>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-1 bg-amber-200 hover:bg-amber-300 rounded font-semibold text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Residents */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Residents</span>
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-black text-gray-900">
            {dashboard?.totalResidents ?? 0}
          </h3>
          <p className="text-[11px] text-gray-400 mt-1">Participating flats</p>
        </div>

        {/* Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Products</span>
            <Package className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-black text-gray-900">
            {dashboard?.totalProducts ?? 0}
          </h3>
          <p className="text-[11px] text-gray-400 mt-1">Catalogue listings</p>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Orders</span>
            <ShoppingCart className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-2xl font-black text-gray-900">
            {dashboard?.totalOrders ?? 0}
          </h3>
          <p className="text-[11px] text-gray-400 mt-1">Submitted orders</p>
        </div>

        {/* Paid Orders */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Paid Orders</span>
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-black text-emerald-800">
            {dashboard?.paidOrders ?? 0}
          </h3>
          <p className="text-[11px] text-gray-400 mt-1">Ready for wholesale</p>
        </div>

        {/* Total Collected */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Collected</span>
            <IndianRupee className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-xl font-black text-gray-900">
            ₹{(dashboard?.totalCollected ?? 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-gray-400 mt-1">Society pool balance</p>
        </div>

        {/* Estimated Savings */}
        <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Est. Savings</span>
            <PiggyBank className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-xl font-black text-emerald-700">
            ₹{(dashboard?.estimatedSavings ?? 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-emerald-600 mt-1">Saved for residents</p>
        </div>
      </div>

      {/* Chart & Bulk Demand Preview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Top Products by Resident Demand Quantity
              </h2>
              <p className="text-xs text-gray-500">Aggregated from verified paid resident orders</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md">
              Wholesale Batches
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            {chartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                <Package className="w-10 h-10 mb-2 text-gray-300" />
                <span>No demand data aggregated yet. Place orders to see chart.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar
                    dataKey="Quantity"
                    fill="#059669"
                    name="Demand Units"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Quick Admin Navigation & Overview */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-1">Committee Quick Actions</h2>
            <p className="text-xs text-gray-500 mb-4">Common cooperative buying workflows</p>

            <div className="space-y-3">
              <Link
                to="/admin/products"
                className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/40 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Manage Catalog</h4>
                    <p className="text-[11px] text-gray-500">Add or edit products & wholesale rates</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
              </Link>

              <Link
                to="/admin/bulk-purchases"
                className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/40 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Record Bulk Purchase</h4>
                    <p className="text-[11px] text-gray-500">Log wholesale distributor procurement</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
              </Link>

              <Link
                to="/admin/savings"
                className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/40 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <PiggyBank className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Savings Audit Report</h4>
                    <p className="text-[11px] text-gray-500">Retail vs Wholesale society audit</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600" />
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400 flex items-center justify-between">
            <span>Status: Active Session</span>
            <span className="font-semibold text-emerald-600">Society Committee</span>
          </div>
        </div>
      </div>

      {/* Recent Society Orders */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Recent Society Resident Orders</h2>
            <p className="text-xs text-gray-500">Latest orders submitted by society members</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
          >
            <span>View All ({recentOrders.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No orders submitted yet across the society.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                <tr>
                  <th className="px-6 py-3">Order #</th>
                  <th className="px-6 py-3">Resident</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Total Amount</th>
                  <th className="px-6 py-3">Payment</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/70">
                    <td className="px-6 py-4 font-bold text-gray-900">#{order.id}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-800">
                      {order.userName || `Resident #${order.userId}`}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-emerald-800">
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
                        to="/admin/orders"
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-800"
                      >
                        Manage
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

export default AdminDashboardPage;
