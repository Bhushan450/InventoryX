import React, { useEffect, useState } from 'react';
import { getResidents } from '../../api/adminApi';
import { Resident } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { AlertCircle, Users } from 'lucide-react';

export const AdminResidentsPage: React.FC = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResidents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getResidents();
      if (response.success && response.data) {
        setResidents(response.data);
      } else {
        setError(response.message || 'Unable to load registered residents.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to load registered residents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResidents();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading registered residents..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      <header className="bg-white p-6 rounded-2xl border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Registered Residents</h1>
            <p className="text-sm text-gray-500 mt-1">Society members participating in bulk buying</p>
          </div>
        </div>
      </header>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </span>
          <button onClick={loadResidents} className="font-semibold underline">Retry</button>
        </div>
      )}

      <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-900">Society Directory</h2>
          <span className="text-sm text-gray-500">{residents.length} residents</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Flat</th>
                <th className="px-6 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {residents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    No residents have registered yet.
                  </td>
                </tr>
              ) : (
                residents.map((resident) => (
                  <tr key={resident.id}>
                    <td className="px-6 py-4 font-semibold text-gray-900">{resident.name}</td>
                    <td className="px-6 py-4 text-gray-600">{resident.email}</td>
                    <td className="px-6 py-4 text-gray-600">{resident.flatNumber || '—'}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(resident.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminResidentsPage;
