import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../../api/orderApi';
import { Order } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  ReceiptText,
  CreditCard,
  ExternalLink,
  ShoppingBag,
  AlertCircle,
  Calendar,
  Layers,
} from 'lucide-react';

export const ResidentOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyOrders();
      if (res.success && res.data) {
        setOrders(res.data);
      } else {
        setError(res.message || 'Failed to fetch your orders.');
      }
    } catch (err: any) {
      console.error('Fetch orders error:', err);
      setError(err.response?.data?.message || 'Error communicating with order system.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your bulk order history..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Bulk Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track status, delivery milestones, and simulated payments
          </p>
        </div>
        <Link
          to="/app/products"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>New Order</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchOrders}
            className="px-3 py-1 bg-rose-200 hover:bg-rose-300 rounded font-semibold text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-2xs">
          <ReceiptText className="w-16 h-16 text-gray-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-800">No Orders Placed Yet</h2>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            You haven't participated in any bulk buying yet. Start ordering essentials to pool demand with your neighbors!
          </p>
          <Link
            to="/app/products"
            className="mt-5 inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors"
          >
            <span>Start Shopping</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Date Placed</th>
                  <th className="px-6 py-4">Items Count</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Payment Status</th>
                  <th className="px-6 py-4">Order Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => {
                  const needsPayment =
                    order.paymentStatus === 'PENDING' || order.orderStatus === 'PENDING_PAYMENT';

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">
                        <Link
                          to={`/app/orders/${order.id}`}
                          className="hover:text-emerald-600 hover:underline"
                        >
                          #{order.id}
                        </Link>
                      </td>

                      <td className="px-6 py-4 text-xs text-gray-600">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString()
                              : 'Recent'}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs text-gray-700">
                        <div className="flex items-center space-x-1.5">
                          <Layers className="w-3.5 h-3.5 text-gray-400" />
                          <span>{order.items?.length || 0} items</span>
                        </div>
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

                      <td className="px-6 py-4 text-right space-x-2">
                        {needsPayment && (
                          <Link
                            to={`/app/orders/${order.id}/payment`}
                            className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors shadow-2xs"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay Now</span>
                          </Link>
                        )}

                        <Link
                          to={`/app/orders/${order.id}`}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 text-gray-700 hover:text-emerald-700 hover:bg-gray-100 rounded-lg text-xs font-semibold transition-colors border border-gray-200"
                        >
                          <span>Details</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentOrdersPage;
