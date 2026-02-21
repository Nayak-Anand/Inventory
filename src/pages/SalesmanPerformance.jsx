import { useState, useEffect, useMemo } from 'react';
import api from '../api/client';
import { UserCircle2, Search, Calendar, X, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export default function SalesmanPerformance() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedSalesman, setSelectedSalesman] = useState(null);
  const [details, setDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (fromDate) params.set('fromDate', fromDate);
      if (toDate) params.set('toDate', toDate);
      const url = '/team-members/sales-performance' + (params.toString() ? '?' + params.toString() : '');
      const { data: res } = await api.get(url);
      setData(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fromDate, toDate]);

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const s = search.trim().toLowerCase();
    return data.filter(
      (row) =>
        (row.name || '').toLowerCase().includes(s) ||
        (row.email || '').toLowerCase().includes(s)
    );
  }, [data, search]);

  const handleSalesmanClick = async (salesman) => {
    setSelectedSalesman(salesman);
    setLoadingDetails(true);
    try {
      const params = new URLSearchParams();
      if (fromDate) params.set('fromDate', fromDate);
      if (toDate) params.set('toDate', toDate);
      const url = `/team-members/sales-performance/${salesman.id}` + (params.toString() ? '?' + params.toString() : '');
      const { data: res } = await api.get(url);
      setDetails(res || []);
    } catch (err) {
      console.error(err);
      setDetails([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Salesman Performance</h1>

        <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
          <Calendar className="text-gray-500" size={20} />
          <span className="text-sm font-medium text-gray-700">Date range (day-wise):</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
          />
          {(fromDate || toDate) && (
            <button
              type="button"
              onClick={() => { setFromDate(''); setToDate(''); }}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear dates
            </button>
          )}
          <span className="text-xs text-gray-500 ml-1">Leave empty for all time</span>
        </div>

        <div className="flex justify-end">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Filter by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-700 w-14">Photo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Salesman</th>
                <th className="text-right px-4 py-3 font-medium text-gray-700">Orders</th>
                <th className="text-right px-4 py-3 font-medium text-gray-700">Total Sales (₹)</th>
                <th className="text-right px-4 py-3 font-medium text-gray-700">Payment Received (₹)</th>
                <th className="text-right px-4 py-3 font-medium text-gray-700">Pending (₹)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    <UserCircle2 className="mx-auto mb-2 opacity-50" size={48} />
                    <p>{search ? 'No matching salesman.' : 'No salesmen yet. Add Salesman from Team.'}</p>
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSalesmanClick(row)}
                  >
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                        {row.avatar ? (
                          <img src={row.avatar} alt={row.name || 'Salesman'} className="w-full h-full object-cover" />
                        ) : (
                          <UserCircle2 size={22} className="text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{row.name}</p>
                          <p className="text-sm text-gray-500">{row.email}</p>
                        </div>
                        <ChevronRight className="text-gray-400" size={18} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{row.orderCount}</td>
                    <td className="px-4 py-3 text-right">
                      ₹{parseFloat(row.totalSales || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right text-green-600">
                      ₹{parseFloat(row.paymentReceived || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right text-amber-600">
                      ₹{parseFloat(row.pending || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSalesman && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedSalesman(null)}>
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                  {selectedSalesman.avatar ? (
                    <img src={selectedSalesman.avatar} alt={selectedSalesman.name || 'Salesman'} className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle2 size={32} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedSalesman.name}</h2>
                  <p className="text-sm text-gray-500">{selectedSalesman.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSalesman(null)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {loadingDetails ? (
                <div className="py-20 text-center text-gray-500">Loading...</div>
              ) : details.length === 0 ? (
                <div className="py-20 text-center text-gray-500">No customers or orders found.</div>
              ) : (
                <div className="space-y-6">
                  {details.map((stat) => (
                    <div key={stat.customer.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{stat.customer.name}</h3>
                          {stat.customer.email && <p className="text-sm text-gray-500">{stat.customer.email}</p>}
                          {stat.customer.phone && <p className="text-sm text-gray-500">{stat.customer.phone}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Orders: <span className="font-medium">{stat.orderCount}</span></p>
                          <p className="text-sm text-gray-500">Total Sales: <span className="font-medium">₹{parseFloat(stat.totalSales || 0).toLocaleString('en-IN')}</span></p>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4 mb-4">
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-600">Payment Received</p>
                          <p className="text-lg font-semibold text-green-700">₹{parseFloat(stat.paymentReceived || 0).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="bg-amber-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-600">Pending</p>
                          <p className="text-lg font-semibold text-amber-700">₹{parseFloat(stat.pending || 0).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                      {stat.invoices.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Invoices:</p>
                          <div className="space-y-2">
                            {stat.invoices.map((inv) => (
                              <div key={inv.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                                <div>
                                  <span className="font-medium">{inv.invoiceNumber}</span>
                                  <span className="text-gray-500 ml-2">
                                    {inv.date ? format(new Date(inv.date), 'dd MMM yyyy') : ''}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4">
                                  {inv.dueDate && (
                                    <span className="text-gray-600">
                                      Due: {format(new Date(inv.dueDate), 'dd MMM yyyy')}
                                    </span>
                                  )}
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    inv.paymentStatus === 'paid'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {inv.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                                  </span>
                                  <span className="font-medium">₹{parseFloat(inv.grandTotal || 0).toLocaleString('en-IN')}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
