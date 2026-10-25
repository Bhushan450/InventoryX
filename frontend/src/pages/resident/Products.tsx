import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../../api/productApi';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Sparkles,
  Check,
  Tag,
  AlertCircle,
  PackageSearch,
} from 'lucide-react';

export const ResidentProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Local state for product quantities before adding to cart
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [justAdded, setJustAdded] = useState<Record<number, boolean>>({});

  const { addToCart, cartCount, cartTotal } = useCart();

  const fetchProductsList = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProducts();
      if (res.success && res.data) {
        setProducts(res.data);
      } else {
        setError(res.message || 'Failed to load products');
      }
    } catch (err: any) {
      console.error('Fetch products error:', err);
      setError(err.response?.data?.message || 'Could not connect to product catalogue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsList();
  }, []);

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  const handleQuantityChange = (productId: number, val: number) => {
    if (val < 1) return;
    setQuantities((prev) => ({ ...prev, [productId]: val }));
  };

  const handleAddToCart = (product: Product) => {
    const qty = quantities[product.id] || 1;
    addToCart(product, qty);

    // Show temporary "Added" feedback
    setJustAdded((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setJustAdded((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'ALL' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <LoadingSpinner message="Loading society catalog..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Bulk Buying Catalogue
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Society bulk rates unlocked by combining our neighborhood demand
          </p>
        </div>

        {cartCount > 0 && (
          <Link
            to="/app/cart"
            className="inline-flex items-center space-x-3 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-bold text-sm">
              View Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'} • ₹{cartTotal.toLocaleString('en-IN')})
            </span>
          </Link>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchProductsList}
            className="px-3 py-1 bg-rose-200 hover:bg-rose-300 rounded font-semibold text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search groceries, staples, detergent, oil..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div className="sm:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-gray-700"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Cards Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <PackageSearch className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">No products found</h3>
          <p className="text-xs text-gray-500 mt-1">
            Try adjusting your search criteria or clearing filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const qty = quantities[product.id] || 1;
            const savingsPerUnit = Math.max(0, product.retailPrice - product.wholesalePrice);
            const discountPercent =
              product.retailPrice > 0
                ? Math.round((savingsPerUnit / product.retailPrice) * 100)
                : 0;
            const isAdded = justAdded[product.id];

            return (
              <div
                key={product.id}
                className="relative bg-white rounded-2xl border border-gray-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
              >
                {/* Card Top */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <Tag className="w-3 h-3 mr-1" />
                      {product.category}
                    </span>
                    {discountPercent > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Pack / Unit: <span className="font-semibold text-gray-700">{product.unit}</span>
                  </p>

                  {/* Price Box */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-black text-emerald-800">
                        ₹{product.wholesalePrice}
                      </span>
                      <span className="text-sm font-medium text-gray-400 line-through">
                        ₹{product.retailPrice}
                      </span>
                      <span className="text-xs text-gray-500">/ {product.unit}</span>
                    </div>

                    <div className="mt-2 inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                      <Sparkles className="w-3 h-3 mr-1 text-emerald-600" />
                      Save ₹{savingsPerUnit} / unit
                    </div>
                  </div>
                </div>

                {/* Card Bottom / Actions */}
                <div className="p-5 pt-0">
                  <div className="flex items-center justify-between gap-3">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(product.id, qty - 1)}
                        disabled={qty <= 1}
                        className="px-2.5 py-2 text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={qty}
                        onChange={(e) =>
                          handleQuantityChange(product.id, parseInt(e.target.value) || 1)
                        }
                        className="w-10 text-center text-sm font-bold bg-transparent text-gray-800 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(product.id, qty + 1)}
                        className="px-2.5 py-2 text-gray-600 hover:bg-gray-200 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Add to Cart button */}
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.available}
                      className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-sm font-bold transition-all shadow-xs ${
                        !product.available
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : isAdded
                          ? 'bg-emerald-800 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResidentProductsPage;
