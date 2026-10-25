import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { createRazorpayOrder, RazorpayCheckoutResponse, verifyRazorpayPayment } from '../../api/paymentApi';
import { getOrder } from '../../api/orderApi';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  IndianRupee,
  Loader2,
  ReceiptText,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
  };
  theme: { color: string };
  modal: { ondismiss: () => void };
  handler: (response: RazorpayCheckoutResponse) => void;
}

interface RazorpayCheckoutInstance {
  open: () => void;
  on: (event: 'payment.failed', callback: (response: { error?: { description?: string } }) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;
  }
}

type PaymentResult = {
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  message: string;
};

let razorpayScriptPromise: Promise<boolean> | null = null;

const loadRazorpayScript = (): Promise<boolean> => {
  if (window.Razorpay) {
    return Promise.resolve(true);
  }
  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.id = 'razorpay-checkout';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      const loaded = Boolean(window.Razorpay);
      if (!loaded) {
        razorpayScriptPromise = null;
      }
      resolve(loaded);
    };
    script.onerror = () => {
      script.remove();
      razorpayScriptPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });
  return razorpayScriptPromise;
};

export const ResidentPaymentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const orderId = Number(id);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PaymentResult | null>(null);

  const fetchOrderDetails = async () => {
    if (!orderId) {
      setError('Invalid order reference.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getOrder(orderId);
      if (response.success && response.data) {
        setOrder(response.data);
        if (response.data.paymentStatus === 'SUCCESS') {
          setResult({
            status: 'SUCCESS',
            message: 'This order has already been paid successfully.',
          });
        }
      } else {
        setError(response.message || 'Order not found.');
      }
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'Failed to load order information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const handleVerifyPayment = async (payment: RazorpayCheckoutResponse) => {
    try {
      setProcessing(true);
      setError(null);
      const response = await verifyRazorpayPayment(orderId, payment);
      if (response.success && response.data) {
        if (response.data.paymentStatus === 'SUCCESS' && response.data.orderStatus === 'PAID') {
          setResult({ status: 'SUCCESS', message: response.data.message });
          setOrder((currentOrder) =>
            currentOrder
              ? { ...currentOrder, paymentStatus: 'SUCCESS', orderStatus: 'PAID' }
              : currentOrder
          );
        } else {
          setResult({
            status: response.data.paymentStatus === 'FAILED' ? 'FAILED' : 'PENDING',
            message: response.data.message,
          });
        }
      } else {
        setError(response.message || 'The payment could not be verified.');
      }
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'The payment could not be verified.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!order || !orderId) return;

    try {
      setProcessing(true);
      setError(null);
      setResult(null);

      const gatewayOrderResponse = await createRazorpayOrder(orderId);
      if (!gatewayOrderResponse.success || !gatewayOrderResponse.data) {
        setError(gatewayOrderResponse.message || 'Could not start checkout.');
        setProcessing(false);
        return;
      }

      const gatewayOrder = gatewayOrderResponse.data;
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        setError('Razorpay Checkout could not be loaded. Check your internet connection and retry.');
        setProcessing(false);
        return;
      }

      const checkout = new window.Razorpay({
        key: gatewayOrder.keyId,
        amount: gatewayOrder.amount,
        currency: gatewayOrder.currency,
        name: 'SocietyBulk',
        description: `Payment for order #${orderId}`,
        order_id: gatewayOrder.gatewayOrderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: { color: '#059669' },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            setResult({
              status: 'PENDING',
              message: 'Checkout was closed. Your order is still unpaid; you can retry payment.',
            });
          },
        },
        handler: (payment) => {
          void handleVerifyPayment(payment);
        },
      });

      checkout.on('payment.failed', (response) => {
        setProcessing(false);
        setResult({
          status: 'FAILED',
          message: response.error?.description || 'Payment failed. Please try again.',
        });
      });
      checkout.open();
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'Could not start Razorpay checkout.');
      setProcessing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your order..." size="lg" />;
  }

  if (error && !order) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-lg mx-auto shadow-2xs">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-800">Order Error</h2>
        <p className="text-sm text-gray-500 mt-1">{error}</p>
        <Link
          to="/app/orders"
          className="mt-5 inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold"
        >
          <ReceiptText className="w-4 h-4" />
          <span>Go to My Orders</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-900 text-sm">
        <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-700" />
        <p>
          Secure checkout powered by Razorpay. Payment is sent to the SocietyBulk merchant account.
          SocietyBulk never stores your card or UPI credentials.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-700/60 rounded-xl">
              <CreditCard className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">Secure Checkout</h1>
              <p className="text-xs text-emerald-200 mt-0.5">Order Reference #{orderId}</p>
            </div>
          </div>
          {order && <StatusBadge status={order.paymentStatus} />}
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-3">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Date Placed</span>
              <span className="font-semibold text-gray-800">
                {order?.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Items in Order</span>
              <span className="font-semibold text-gray-800">{order?.items?.length || 0} product(s)</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between items-baseline">
              <span className="text-base font-bold text-gray-800">Total Payable</span>
              <span className="text-3xl font-black text-emerald-800 flex items-center">
                <IndianRupee className="w-6 h-6" />
                {(order?.totalAmount ?? 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              {error}
            </div>
          )}

          {result && (
            <div
              className={`p-5 rounded-xl border flex items-start gap-3 ${
                result.status === 'SUCCESS'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : result.status === 'PENDING'
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              {result.status === 'SUCCESS' ? (
                <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-600" />
              ) : result.status === 'PENDING' ? (
                <AlertTriangle className="w-6 h-6 shrink-0 text-amber-600" />
              ) : (
                <XCircle className="w-6 h-6 shrink-0 text-rose-600" />
              )}
              <div className="flex-1">
                <h3 className="font-bold text-sm">
                  {result.status === 'SUCCESS'
                    ? 'Payment Confirmed'
                    : result.status === 'PENDING'
                      ? 'Payment Pending'
                      : 'Payment Not Completed'}
                </h3>
                <p className="text-xs mt-1 leading-relaxed">{result.message}</p>
                {result.status === 'SUCCESS' && (
                  <div className="mt-4 flex items-center gap-3">
                    <Link
                      to={`/app/orders/${orderId}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-xs font-bold rounded-lg"
                    >
                      <span>View Order Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link to="/app/orders" className="text-xs font-semibold underline">
                      Back to Orders
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {order?.paymentStatus !== 'SUCCESS' && (
            <div className="space-y-3 pt-1">
              <button
                type="button"
                disabled={processing}
                onClick={handlePayment}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Waiting for Razorpay...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Pay with Razorpay</span>
                  </>
                )}
              </button>
              <p className="text-xs text-center text-gray-500">
                Card, UPI, netbanking and other methods depend on your merchant account settings.
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mr-1" />
              Payment verified by the SocietyBulk server
            </span>
            <Link to="/app/orders" className="hover:text-gray-600">My Orders</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentPaymentPage;
