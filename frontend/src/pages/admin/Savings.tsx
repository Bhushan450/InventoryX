import React, { useEffect, useState } from 'react';
import { getSavings } from '../../api/adminApi';
import { SavingsItem } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  PiggyBank,
  TrendingDown,
  Sparkles,
  AlertCircle,
  FileSpreadsheet,
  IndianRupee,
  ShieldCheck,
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

export const AdminSavingsPage: React.FC = () => {
  const [savingsItems, setSavingsItems] = useState<SavingsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSavings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getSavings();
      if (res.success && res.data) {
        setSavingsItems(res.data.items);
      } else {
        setError(res.message || 'Failed to generate savings report.');
      }
    } catch (err: any) {
      console.error('Fetch savings error:', err);
      setError(err.response?.data?.message || 'Error communicating with savings analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavings();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating collective community savings report..." size="lg" />;
  }

  // Totals
  const grandTotalQuantity = savingsItems.reduce((acc, curr) => acc + curr.totalQuantity, 0);
  const grandTotalSavings = savingsItems.reduce((acc, curr) => acc + curr.totalSavings, 0);

  // Calculate overall retail vs wholesale costs for chart comparison
  const chartData = savingsItems.slice(0, 8).map((item) => {
    const retailCost = item.retailPrice * item.totalQuantity;
    const wholesaleCost = item.wholesalePrice * item.totalQuantity;

    return {
      name:
        item.productName.length > 14
          ? `${item.productName.substring(0, 12)}...`
          : item.productName,
      RetailCost: retailCost,
      WholesaleCost: wholesaleCost,
      Savings: item.totalSavings,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Society Collective Savings Audit
            </h1>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase">
              Official Report
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Certified comparison of open-market retail prices vs collective bulk procurement costs
          </p>
        </div>

        <button
          onClick={loadSavings}
          className="text-xs font-semibold px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center space-x-1.5"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Refresh Audit</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadSavings}
            className="px-3 py-1 bg-rose-200 hover:bg-rose-300 rounded font-semibold text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Grand Total Highlight Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 p-6 sm:p-8 rounded-2xl text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center space-x-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Estimated Savings Delivered to Residents</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center">
            <IndianRupee className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />
            {grandTotalSavings.toLocaleString('en-IN')}
          </h2>
          <p className="text-emerald-200/90 text-xs sm:text-sm mt-1">
            Total savings retained by apartment residents through collective wholesale aggregation
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t md:border-t-0 md:border-l border-emerald-700/80 pt-4 md:pt-0 md:pl-8">
          <div>
            <p className="text-xs text-emerald-300">Total Units Pooled</p>
            <p className="text-xl font-extrabold">{grandTotalQuantity.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-xs text-emerald-300">Cataloged Products</p>
            <p className="text-xl font-extrabold">{savingsItems.length}</p>
          </div>
        </div>
      </div>

      {/* Comparison Chart: Retail Cost vs Wholesale Cost */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Procurement Comparison: Retail Market Value vs Bulk Wholesale Cost (₹)
            </h3>
            <p className="text-xs text-gray-500">
              Direct comparison of what residents would have paid in supermarket vs bulk purchase
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-1 bg-emerald-50 text-emerald-700 rounded">
            Estimated Savings
          </span>
        </div>

        <div className="h-72 w-full pt-2">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              No completed bulk savings recorded yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar
                  dataKey="RetailCost"
                  name="Retail Market Total (₹)"
                  fill="#94a3b8"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="WholesaleCost"
                  name="Wholesale Bulk Cost (₹)"
                  fill="#059669"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Savings Breakdown Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
            <PiggyBank className="w-5 h-5 text-emerald-600" />
            <span>Product-Level Savings Breakdown</span>
          </h3>
          <span className="text-xs text-gray-500 font-medium">
            Official Audit for Society RWA
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Unit</th>
                <th className="px-6 py-4 text-center">Total Quantity Demanded</th>
                <th className="px-6 py-4 text-right">Retail Rate</th>
                <th className="px-6 py-4 text-right">Wholesale Rate</th>
                <th className="px-6 py-4 text-right">Savings / Unit</th>
                <th className="px-6 py-4 text-right">Total Product Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {savingsItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    No savings data recorded yet.
                  </td>
                </tr>
              ) : (
                savingsItems.map((item) => (
                  <tr key={item.productId} className="hover:bg-gray-50/70">
                    <td className="px-6 py-4 font-bold text-gray-900">{item.productName}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">{item.unit}</td>
                    <td className="px-6 py-4 text-center font-bold text-gray-800">
                      {item.totalQuantity} {item.unit}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-400 line-through">
                      ₹{item.retailPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-800">
                      ₹{item.wholesalePrice.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-emerald-700">
                      ₹{Math.max(0, item.retailPrice - item.wholesalePrice).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-emerald-700">
                      +₹{item.totalSavings.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {savingsItems.length > 0 && (
              <tfoot className="bg-gray-50 font-bold border-t-2 border-gray-300">
                <tr>
                  <td colSpan={2} className="px-6 py-4 uppercase text-xs text-gray-700">
                    Grand Total Savings:
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-black text-gray-900">
                    {grandTotalQuantity} units
                  </td>
                  <td colSpan={3} className="px-6 py-4"></td>
                  <td className="px-6 py-4 text-right text-lg text-emerald-800 font-black">
                    +₹{grandTotalSavings.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSavingsPage;
