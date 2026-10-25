import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { createOrder } from '../../api/orderApi';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ArrowRight,
  ShieldCheck,
  PiggyBank,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';

export const ResidentCartPage: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal, estimatedSavingsTotal } =
    useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;

    try {
      setSubmitting(true);
      setError(null);

      const itemsPayload = cartItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const res = await createOrder(itemsPayload);

      if (res.success && res.data) {
        clearCart();
        navigate(`/app/orders/${res.data.id}/payment`);
      } else {
        setError(res.message || 'Failed to place order. Please try again.');
      }
    } catch (err: any) {
      console.error('Place order error:', err);
      setError(
        err.response?.data?.message || 'Error communicating with order processing backend.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-2xl mx-auto my-12 shadow-2xs">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-4">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Your Bulk Cart is Empty</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          Add staple items and groceries to your cart. As more residents order, everyone saves on wholesale prices!
        </p>
        <Link
          to="/app/products"
          className="mt-6 inline-flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors"
        >
          <span>Explore Products Catalogue</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const retailTotal = cartItems.reduce(
    (sum, item) => sum + item.product.retailPrice * item.quantity,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Your Cart</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Review your items before pooling into the society bulk order
          </p>
        </div>
        <Link
          to="/app/products"
          className="inline-flex items-center space-x-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items Table / List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Unit Price</th>
                  <th className="px-6 py-4 text-center">Quantity</th>
                  <th className="px-6 py-4 text-right">Subtotal</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cartItems.map((item) => {
                  const subtotal = item.product.wholesalePrice * item.quantity;
                  const itemSavings =
                    Math.max(0, item.product.retailPrice - item.product.wholesalePrice) *
                    item.quantity;

                  return (
                    <tr key={item.product.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{item.product.name}</div>
                        <div className="text-xs text-gray-500">
                          {item.product.category} • {item.product.unit}
                        </div>
                        {itemSavings > 0 && (
                          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                            Saves ₹{itemSavings} vs retail
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">
                          ₹{item.product.wholesalePrice}
                        </div>
                        <div className="text-xs text-gray-400 line-through">
                          ₹{item.product.retailPrice}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50 max-w-[110px] mx-auto">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                            className="p-1.5 text-gray-600 hover:text-gray-900 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                            className="p-1.5 text-gray-600 hover:text-gray-900 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right font-black text-gray-900">
                        ₹{subtotal.toLocaleString('en-IN')}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <button
              type="button"
              onClick={clearCart}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700"
            >
              Clear Entire Cart
            </button>
            <span className="text-xs text-gray-500">
              {cartItems.length} unique {cartItems.length === 1 ? 'item' : 'items'} in basket
            </span>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs h-fit space-y-5">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
            Society Order Summary
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Estimated Market Retail Value</span>
              <span className="line-through text-gray-400">
                ₹{retailTotal.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between text-emerald-700 font-medium bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
              <span className="flex items-center">
                <PiggyBank className="w-4 h-4 mr-1.5 text-emerald-600" />
                Collective Bulk Savings
              </span>
              <span className="font-bold">-₹{estimatedSavingsTotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Delivery / Clubhouse Handling</span>
              <span className="text-emerald-700 font-semibold">FREE (Society Collective)</span>
            </div>

            <div className="border-t border-gray-200 pt-3 flex justify-between items-baseline">
              <div>
                <span className="text-base font-bold text-gray-900">Total Bulk Price</span>
                <p className="text-xs text-gray-400">All taxes & wholesale costs included</p>
              </div>
              <span className="text-2xl font-black text-emerald-800">
                ₹{cartTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={submitting || cartItems.length === 0}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Placing Order...</span>
                </>
              ) : (
                <>
                  <span>Place Order & Pay</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-[11px] text-gray-400 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Secured College Demo Simulation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentCartPage;
