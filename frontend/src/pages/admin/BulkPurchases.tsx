import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getBulkPurchases,
  createBulkPurchase,
  updateBulkPurchaseStatus,
} from '../../api/adminApi';
import { getProducts } from '../../api/productApi';
import { BulkPurchase, Product } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Truck,
  Plus,
  CheckCircle2,
  AlertCircle,
  Package,
  Calendar,
  Loader2,
  IndianRupee,
} from 'lucide-react';

export const AdminBulkPurchasesPage: React.FC = () => {
  const location = useLocation();
  const prefill = (location.state as any)?.prefill;

  const [purchases, setPurchases] = useState<BulkPurchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [selectedProductId, setSelectedProductId] = useState<number | ''>(
    prefill?.productId || ''
  );
  const [quantity, setQuantity] = useState<string>(
    prefill?.totalQuantity ? prefill.totalQuantity.toString() : ''
  );
  const [wholesalePrice, setWholesalePrice] = useState<string>(
    prefill?.wholesalePrice ? prefill.wholesalePrice.toString() : ''
  );
  const [purchaseStatus, setPurchaseStatus] = useState<'PLANNED' | 'ORDERED' | 'RECEIVED'>(
    'PLANNED'
  );

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [purchasesRes, productsRes] = await Promise.all([
        getBulkPurchases(),
        getProducts(),
      ]);

      if (purchasesRes.success && purchasesRes.data) {
        setPurchases(purchasesRes.data);
      }
      if (productsRes.success && productsRes.data) {
        setProducts(productsRes.data);
      }
    } catch (err: any) {
      console.error('Fetch bulk purchases error:', err);
      setError(err.response?.data?.message || 'Error communicating with procurement backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When a product is selected, auto-populate default wholesale price if not pre-set
  const handleProductSelect = (prodId: number) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod && !wholesalePrice) {
      setWholesalePrice(prod.wholesalePrice.toString());
    }
  };

  // Auto-calculated total cost
  const parsedQty = parseFloat(quantity) || 0;
  const parsedPrice = parseFloat(wholesalePrice) || 0;
  const calculatedTotal = parsedQty * parsedPrice;

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || parsedQty <= 0 || parsedPrice <= 0) {
      setError('Please provide valid product, quantity, and wholesale price.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const res = await createBulkPurchase({
        productId: Number(selectedProductId),
        totalQuantity: parsedQty,
        wholesalePrice: parsedPrice,
        purchaseStatus,
      });

      if (res.success && res.data) {
        setSuccessMsg('Bulk purchase entry recorded successfully!');
        // Reset form
        setSelectedProductId('');
        setQuantity('');
        setWholesalePrice('');
        setPurchaseStatus('PLANNED');
        loadData();
      } else {
        setError(res.message || 'Failed to record bulk purchase');
      }
    } catch (err: any) {
      console.error('Create bulk purchase error:', err);
      setError(err.response?.data?.message || 'Error recording purchase.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessMsg(null), 3500);
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      setError(null);
      const res = await updateBulkPurchaseStatus(id, newStatus);
      if (res.success) {
        setSuccessMsg(`Purchase #${id} status updated to ${newStatus}`);
        setPurchases((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, purchaseStatus: newStatus as BulkPurchase['purchaseStatus'] } : p
          )
        );
      } else {
        setError(res.message || 'Failed to update purchase status');
      }
    } catch (err: any) {
      console.error('Update purchase status error:', err);
      setError(err.response?.data?.message || 'Error updating status.');
    } finally {
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  if (loading && purchases.length === 0) {
    return <LoadingSpinner message="Loading bulk wholesale purchases ledger..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Wholesale Bulk Purchases
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Log and manage direct supplier shipments ordered for society distribution
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
          {purchases.length} Recorded Bulk Shipments
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

      {/* Record Purchase Form Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs">
        <h2 className="text-base font-bold text-gray-900 mb-1 flex items-center space-x-2">
          <Truck className="w-5 h-5 text-emerald-600" />
          <span>Record New Wholesale Bulk Purchase</span>
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Select product, confirm bulk procurement volume, and track supplier dispatch
        </p>

        <form onSubmit={handleCreatePurchase} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Product *
              </label>
              <select
                required
                value={selectedProductId}
                onChange={(e) => handleProductSelect(Number(e.target.value))}
                className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm bg-white font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Choose Product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Total Quantity Demanded *
              </label>
              <input
                type="number"
                min="1"
                step="any"
                required
                placeholder="e.g. 50"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Wholesale Price / Unit (₹) *
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                required
                placeholder="e.g. 340"
                value={wholesalePrice}
                onChange={(e) => setWholesalePrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Initial Status
              </label>
              <select
                value={purchaseStatus}
                onChange={(e) => setPurchaseStatus(e.target.value as any)}
                className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm bg-white font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="PLANNED">PLANNED (Order drafted)</option>
                <option value="ORDERED">ORDERED (Paid to vendor)</option>
                <option value="RECEIVED">RECEIVED (In Clubhouse)</option>
              </select>
            </div>
          </div>

          {/* Cost preview & submit button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 border-t border-gray-100 gap-3">
            <div className="text-sm text-gray-600">
              <span>Estimated Total Wholesale Cost: </span>
              <span className="font-extrabold text-emerald-800 text-lg">
                ₹{calculatedTotal.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>Record Bulk Purchase</span>
            </button>
          </div>
        </form>
      </div>

      {/* Table of Existing Purchases */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Recorded Bulk Shipments</h2>
          <span className="text-xs text-gray-500 font-medium">
            Advance status as inventory arrives at society
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-6 py-4">Shipment #</th>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Total Quantity</th>
                <th className="px-6 py-4">Wholesale Rate</th>
                <th className="px-6 py-4">Total Cost</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Update Lifecycle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">
                    No bulk purchases recorded yet. Submit the form above to record supplier orders.
                  </td>
                </tr>
              ) : (
                purchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50/70">
                    <td className="px-6 py-4 font-bold text-gray-900">#{purchase.id}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {purchase.productName || `Product #${purchase.productId}`}
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-bold">
                      {purchase.totalQuantity} {purchase.unit || 'units'}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      ₹{purchase.wholesalePrice.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 font-black text-emerald-800">
                      ₹{purchase.totalCost.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={purchase.purchaseStatus} />
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {purchase.createdAt
                        ? new Date(purchase.createdAt).toLocaleDateString()
                        : 'Recent'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        value={purchase.purchaseStatus}
                        onChange={(e) => handleStatusUpdate(purchase.id, e.target.value)}
                        className="text-xs font-semibold py-1 px-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="PLANNED">PLANNED</option>
                        <option value="ORDERED">ORDERED</option>
                        <option value="RECEIVED">RECEIVED</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBulkPurchasesPage;
