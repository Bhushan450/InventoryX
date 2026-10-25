import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder } from '../../api/orderApi';
import { Order } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  ArrowLeft,
  CreditCard,
  Receipt,
  Calendar,
  AlertCircle,
  Package,
  IndianRupee,
  ShieldCheck,
} from 'lucide-react';

export const ResidentOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getOrder(orderId);
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        setError(res.message || 'Order could not be found.');
      }
    } catch (err: any) {
      console.error('Fetch order detail error:', err);
      setError(err.response?.data?.message || 'Failed to retrieve order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <LoadingSpinner message="Loading order details..." size="lg" />;
  }

  if (error || !order) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-md mx-auto shadow-2xs">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-800">Order Not Found</h2>
        <p className="text-sm text-gray-500 mt-1">{error || 'Invalid order identifier'}</p>
        <Link
          to="/app/orders"
          className="mt-5 inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Orders</span>
        </Link>
      </div>
    );
  }

  const isPending =
    order.paymentStatus === 'PENDING' || order.orderStatus === 'PENDING_PAYMENT';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation and Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/app/orders"
            className="p-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-emerald-700 hover:bg-gray-50 transition-colors shadow-2xs"
            aria-label="Back to orders list"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Order #{order.id}
              </h1>
              <StatusBadge status={order.orderStatus} />
            </div>
            <p className="text-xs text-gray-500 flex items-center mt-0.5">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              Placed on{' '}
              {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>

        {isPending && (
          <Link
            to={`/app/orders/${order.id}/payment`}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            <span>Complete Payment Now</span>
          </Link>
        )}
      </div>

      {/* Pending Payment Notification Banner */}
      {isPending && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start space-x-3 text-amber-900 text-sm">
          <CreditCard className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold">Payment Awaiting Simulation</h4>
            <p className="text-xs text-amber-700 mt-0.5">
              This order will only be aggregated into the society bulk wholesale purchase once
              payment has succeeded.
            </p>
          </div>
          <Link
            to={`/app/orders/${order.id}/payment`}
            className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 text-xs font-bold rounded-lg"
          >
            Pay ₹{order.totalAmount}
          </Link>
        </div>
      )}

      {/* Order Info & Status Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Payment Status
          </p>
          <div className="mt-2">
            <StatusBadge status={order.paymentStatus} />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {order.paymentStatus === 'SUCCESS'
              ? 'Wholesale procurement confirmed'
              : 'Awaiting simulated settlement'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Order Lifecycle
          </p>
          <div className="mt-2">
            <StatusBadge status={order.orderStatus} />
          </div>
          <p className="text-xs text-gray-500 mt-2">Managed by Society Committee</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Total Billed
          </p>
          <h3 className="text-2xl font-black text-emerald-800 mt-1 flex items-center">
            <IndianRupee className="w-5 h-5" />
            {order.totalAmount.toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-gray-500 mt-1">Wholesale price inclusive</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 flex items-center space-x-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <span>Items Ordered</span>
          </h2>
          <span className="text-xs text-gray-500 font-medium">
            {order.items?.length || 0} unique item(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">Unit / Pack</th>
                <th className="px-6 py-4 text-center">Quantity</th>
                <th className="px-6 py-4 text-right">Wholesale Unit Price</th>
                <th className="px-6 py-4 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items?.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {item.productName}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {item.unit || 'unit'}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-gray-800">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-700">
                    ₹{item.unitPrice.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-right font-black text-emerald-900">
                    ₹{item.subtotal.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50/80 font-bold border-t border-gray-200">
              <tr>
                <td colSpan={4} className="px-6 py-4 text-right text-gray-700 uppercase text-xs">
                  Grand Total
                </td>
                <td className="px-6 py-4 text-right text-lg text-emerald-800 font-black">
                  ₹{order.totalAmount.toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResidentOrderDetailPage;
