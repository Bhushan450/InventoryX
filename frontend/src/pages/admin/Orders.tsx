import React, { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus } from '../../api/orderApi';
import { Order } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  AlertCircle,
  Package,
  Calendar,
  Layers,
} from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Expandable row tracking
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllOrders();
      if (res.success && res.data) {
        setOrders(res.data);
      } else {
        setError(res.message || 'Failed to fetch society orders');
      }
    } catch (err: any) {
      console.error('Fetch all orders error:', err);
      setError(err.response?.data?.message || 'Error communicating with orders backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      setError(null);
      const res = await updateOrderStatus(orderId, newStatus);
      if (res.success) {
        setSuccessMsg(`Order #${orderId} status changed to ${newStatus}`);
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, orderStatus: newStatus as Order['orderStatus'] }
              : o
          )
        );
      } else {
        setError(res.message || 'Failed to update order status');
      }
    } catch (err: any) {
      console.error('Update status error:', err);
      setError(err.response?.data?.message || 'Error updating order status.');
    } finally {
      setUpdatingId(null);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesPayment = paymentFilter === 'ALL' || o.paymentStatus === paymentFilter;
    const matchesStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter;
    const matchesSearch =
      o.id.toString().includes(searchQuery) ||
      (o.userName && o.userName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPayment && matchesStatus && matchesSearch;
  });

  if (loading && orders.length === 0) {
    return <LoadingSpinner message="Loading all society orders..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Society Orders Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track individual resident submissions and advance procurement lifecycle
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
          {orders.length} Total Society Orders
        </span>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center space-x-3 text-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-xs font-semibold underline text-rose-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order # or Resident..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm bg-white font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="PENDING">PENDING Payment</option>
            <option value="SUCCESS">SUCCESS (Paid)</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm bg-white font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Order Lifecycle States</option>
            <option value="PENDING_PAYMENT">Pending Payment</option>
            <option value="PAID">PAID (Aggregating)</option>
            <option value="ORDERED">ORDERED (Wholesale placed)</option>
            <option value="READY">READY (Clubhouse arrived)</option>
            <option value="COMPLETED">COMPLETED (Collected)</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Resident</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Order Status</th>
                <th className="px-6 py-4">Update Status</th>
                <th className="px-6 py-4 text-right">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">
                    No orders match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  const isUpdating = updatingId === order.id;

                  return (
                    <React.Fragment key={order.id}>
                      <tr className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">#{order.id}</td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">
                            {order.userName || `Resident #${order.userId}`}
                          </div>
                          <div className="text-xs text-gray-400">Resident ID: {order.userId}</div>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString()
                            : 'Recent'}
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
                        <td className="px-6 py-4">
                          <select
                            disabled={isUpdating}
                            value={order.orderStatus}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="text-xs font-semibold py-1 px-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          >
                            <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                            <option value="PAID">PAID</option>
                            <option value="ORDERED">ORDERED</option>
                            <option value="READY">READY</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => toggleExpand(order.id)}
                            className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 p-1 rounded hover:bg-emerald-50"
                          >
                            <span>{order.items?.length || 0} items</span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Order Items row */}
                      {isExpanded && (
                        <tr className="bg-gray-50/90">
                          <td colSpan={8} className="px-8 py-4">
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center">
                                <Package className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                                Items Breakdown for Order #{order.id}
                              </h4>
                              <table className="min-w-full text-xs text-left divide-y divide-gray-100">
                                <thead>
                                  <tr className="text-gray-400 uppercase">
                                    <th className="py-2">Product Name</th>
                                    <th className="py-2">Unit</th>
                                    <th className="py-2 text-center">Qty</th>
                                    <th className="py-2 text-right">Unit Price</th>
                                    <th className="py-2 text-right">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                  {order.items?.map((item) => (
                                    <tr key={item.id}>
                                      <td className="py-2 font-medium text-gray-800">
                                        {item.productName}
                                      </td>
                                      <td className="py-2 text-gray-500">{item.unit || 'unit'}</td>
                                      <td className="py-2 text-center font-bold text-gray-700">
                                        {item.quantity}
                                      </td>
                                      <td className="py-2 text-right text-gray-600">
                                        ₹{item.unitPrice.toLocaleString('en-IN')}
                                      </td>
                                      <td className="py-2 text-right font-bold text-emerald-800">
                                        ₹{item.subtotal.toLocaleString('en-IN')}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersPage;
