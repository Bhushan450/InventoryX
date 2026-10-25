import React, { useEffect, useState } from 'react';
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../api/productApi';
import { Product } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  X,
  AlertCircle,
  Tag,
  Loader2,
} from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form inputs
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Groceries',
    unit: '1 kg',
    retailPrice: '',
    wholesalePrice: '',
    available: true,
  });

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminProducts();
      if (res.success && res.data) {
        setProducts(res.data);
      } else {
        setError(res.message || 'Failed to load products');
      }
    } catch (err: any) {
      console.error('Admin load products error:', err);
      setError(err.response?.data?.message || 'Error communicating with products database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: 'Groceries',
      unit: '1 kg',
      retailPrice: '',
      wholesalePrice: '',
      available: true,
    });
    setIsFormOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      unit: product.unit,
      retailPrice: product.retailPrice.toString(),
      wholesalePrice: product.wholesalePrice.toString(),
      available: product.available,
    });
    setIsFormOpen(true);
  };

  const closeModal = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.retailPrice ||
      !formData.wholesalePrice
    ) {
      setError('Please fill all required product fields.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category.trim(),
      unit: formData.unit.trim(),
      retailPrice: parseFloat(formData.retailPrice),
      wholesalePrice: parseFloat(formData.wholesalePrice),
      available: formData.available,
    };

    if (payload.retailPrice <= 0 || payload.wholesalePrice <= 0) {
      setError('Prices must be greater than zero.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (editingProduct) {
        const res = await updateProduct(editingProduct.id, payload);
        if (res.success) {
          setSuccessMsg(`Product "${payload.name}" updated successfully!`);
          closeModal();
          loadProducts();
        } else {
          setError(res.message || 'Failed to update product');
        }
      } else {
        const res = await createProduct(payload);
        if (res.success) {
          setSuccessMsg(`Product "${payload.name}" added to catalog!`);
          closeModal();
          loadProducts();
        } else {
          setError(res.message || 'Failed to create product');
        }
      }
    } catch (err: any) {
      console.error('Submit product error:', err);
      setError(err.response?.data?.message || 'Error saving product.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to remove/deactivate "${name}"?`)) {
      return;
    }

    try {
      setError(null);
      const res = await deleteProduct(id);
      if (res.success) {
        setSuccessMsg(`Product "${name}" deleted.`);
        loadProducts();
      } else {
        setError(res.message || 'Failed to delete product.');
      }
    } catch (err: any) {
      console.error('Delete product error:', err);
      setError(err.response?.data?.message || 'Error deleting product.');
    } finally {
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      categoryFilter === 'ALL' || p.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCat;
  });

  if (loading && products.length === 0) {
    return <LoadingSpinner message="Loading products inventory..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Product Catalogue Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Define bulk products, wholesale discount rates, and resident availability
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
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

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by product name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="sm:w-60">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-700"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Pack / Unit</th>
                <th className="px-6 py-4">Market Retail</th>
                <th className="px-6 py-4">Wholesale Price</th>
                <th className="px-6 py-4">Resident Savings</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">
                    No products found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const savings = Math.max(0, p.retailPrice - p.wholesalePrice);
                  const discountPercent =
                    p.retailPrice > 0 ? Math.round((savings / p.retailPrice) * 100) : 0;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/70">
                      <td className="px-6 py-4 font-bold text-gray-900">{p.name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                          <Tag className="w-3 h-3 mr-1 text-gray-500" />
                          {p.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-600">{p.unit}</td>
                      <td className="px-6 py-4 text-gray-500 line-through">
                        ₹{p.retailPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 font-extrabold text-emerald-800">
                        ₹{p.wholesalePrice.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Save ₹{savings} ({discountPercent}%)
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {p.available ? (
                          <span className="inline-flex items-center text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-semibold text-gray-400">
                            <XCircle className="w-3.5 h-3.5 mr-1 text-gray-400" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingProduct ? 'Edit Catalogue Product' : 'Add New Bulk Product'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aashirvaad Shudh Chakki Atta"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Groceries, Dairy, Oils, Pulses"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Pack Unit *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="10 kg, 1 Liter, 500 g"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Description *
                </label>
                <textarea
                  required
                  maxLength={1000}
                  rows={2}
                  placeholder="Describe the grocery product"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Market Retail Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="450"
                    value={formData.retailPrice}
                    onChange={(e) => setFormData({ ...formData, retailPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Wholesale Bulk Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="340"
                    value={formData.wholesalePrice}
                    onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                />
                <label htmlFor="available" className="text-sm font-medium text-gray-700">
                  Available for resident ordering
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center space-x-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-xs disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
