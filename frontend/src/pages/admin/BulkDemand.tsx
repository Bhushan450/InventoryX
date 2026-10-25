import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBulkDemand } from '../../api/adminApi';
import { BulkDemand } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  TrendingUp,
  Truck,
  PiggyBank,
  AlertCircle,
  PackageCheck,
  IndianRupee,
  Sparkles,
} from 'lucide-react';

export const AdminBulkDemandPage: React.FC = () => {
  const [demandList, setDemandList] = useState<BulkDemand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadBulkDemand = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getBulkDemand();
      if (res.success && res.data) {
        setDemandList(res.data);
      } else {
        setError(res.message || 'Failed to aggregate society bulk demand.');
      }
    } catch (err: any) {
      console.error('Fetch bulk demand error:', err);
      setError(err.response?.data?.message || 'Error communicating with bulk demand aggregator.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBulkDemand();
  }, []);

  const handleRecordPurchase = (item: BulkDemand) => {
    // Navigate to bulk purchases with query params or state
    navigate('/admin/bulk-purchases', {
      state: {
        prefill: {
          productId: item.productId,
          productName: item.productName,
          totalQuantity: item.totalQuantity,
          wholesalePrice: item.wholesalePrice,
        },
      },
    });
  };

  if (loading) {
    return <LoadingSpinner message="Calculating collective demand from paid orders..." size="lg" />;
  }

  // Calculate totals
  const totalQuantitySum = demandList.reduce((acc, curr) => acc + curr.totalQuantity, 0);
  const totalRetailCostSum = demandList.reduce((acc, curr) => acc + curr.estimatedRetailCost, 0);
  const totalWholesaleCostSum = demandList.reduce(
    (acc, curr) => acc + curr.estimatedWholesaleCost,
    0
  );
  const totalSavingsSum = Math.max(0, totalRetailCostSum - totalWholesaleCostSum);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Aggregated Society Bulk Demand
            </h1>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase">
              Paid Orders Only
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Total quantity pooled across all apartments ready for wholesale supplier procurement
          </p>
        </div>

        <button
          onClick={loadBulkDemand}
          className="text-xs font-semibold px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          Refresh Demand
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadBulkDemand}
            className="px-3 py-1 bg-rose-200 hover:bg-rose-300 rounded font-semibold text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Aggregate Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Total Units Demanded
          </p>
          <h3 className="text-2xl font-black text-gray-900 mt-1">
            {totalQuantitySum.toLocaleString('en-IN')} units
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{demandList.length} distinct staple products</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Est. Wholesale Procurement Cost
          </p>
          <h3 className="text-2xl font-black text-emerald-800 mt-1">
            ₹{totalWholesaleCostSum.toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Amount payable to distributor</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Market Retail Equivalent
          </p>
          <h3 className="text-2xl font-black text-gray-600 line-through mt-1">
            ₹{totalRetailCostSum.toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">If bought individually in shops</p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-2xs">
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            Society Collective Savings
          </p>
          <h3 className="text-2xl font-black text-emerald-700 mt-1">
            ₹{totalSavingsSum.toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-emerald-600 mt-0.5">Retained in resident pockets</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Unit / Pack</th>
                <th className="px-6 py-4 text-center">Pooled Quantity</th>
                <th className="px-6 py-4 text-right">Retail Rate</th>
                <th className="px-6 py-4 text-right">Wholesale Rate</th>
                <th className="px-6 py-4 text-right">Est. Retail Cost</th>
                <th className="px-6 py-4 text-right">Est. Wholesale Cost</th>
                <th className="px-6 py-4 text-right">Est. Savings</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {demandList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-gray-400">
                    <PackageCheck className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm font-semibold text-gray-700">No active demand aggregated</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Bulk demand will appear once residents place and pay for orders.
                    </p>
                  </td>
                </tr>
              ) : (
                demandList.map((item) => {
                  const savings = Math.max(
                    0,
                    item.estimatedRetailCost - item.estimatedWholesaleCost
                  );

                  return (
                    <tr key={item.productId} className="hover:bg-gray-50/70">
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {item.productName}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">{item.unit}</td>
                      <td className="px-6 py-4 text-center font-black text-gray-900">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-100">
                          {item.totalQuantity} {item.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-400 line-through">
                        ₹{item.retailPrice}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-800">
                        ₹{item.wholesalePrice}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600">
                        ₹{item.estimatedRetailCost.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900">
                        ₹{item.estimatedWholesaleCost.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-emerald-700">
                        +₹{savings.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleRecordPurchase(item)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors shadow-2xs"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Record Purchase</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {demandList.length > 0 && (
              <tfoot className="bg-gray-50 font-bold border-t-2 border-gray-300">
                <tr>
                  <td colSpan={2} className="px-6 py-4 uppercase text-xs text-gray-700">
                    Grand Totals:
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-black text-emerald-900">
                    {totalQuantitySum} units
                  </td>
                  <td colSpan={2} className="px-6 py-4"></td>
                  <td className="px-6 py-4 text-right text-sm text-gray-500 line-through">
                    ₹{totalRetailCostSum.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-right text-base text-gray-900 font-black">
                    ₹{totalWholesaleCostSum.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-right text-base text-emerald-700 font-black">
                    +₹{totalSavingsSum.toLocaleString('en-IN')}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBulkDemandPage;
