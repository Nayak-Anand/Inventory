import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { BarChart3, TrendingUp, FileText } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export default function Reports() {
  const { invoices, products } = useStore();
  const [filter, setFilter] = useState('all');

  const now = new Date();
  const filteredInvoices =
    filter === 'all'
      ? invoices
      : invoices.filter((inv) => {
          const d = new Date(inv.date || inv.createdAt);
          return d >= startOfMonth(subMonths(now, parseInt(filter))) && d <= endOfMonth(subMonths(now, parseInt(filter)));
        });

  const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
  const receivedAmount = filteredInvoices
    .filter((inv) => inv.paymentStatus === 'received')
    .reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
  const pendingAmount = filteredInvoices
    .filter((inv) => inv.paymentStatus !== 'received')
    .reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
  const totalInvoices = filteredInvoices.length;
  const avgOrderValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

  const lowStockCount = products.filter((p) => (p.stock || 0) <= (p.minStock || 5)).length;

  const topProducts = {};
  filteredInvoices.forEach((inv) => {
    const items = inv.lines || inv.items || [];
    items.forEach((item) => {
      const name = item.name || item.itemName || 'Unknown';
      topProducts[name] = (topProducts[name] || 0) + (item.quantity || 0) * (item.rate || 0);
    });
  });
  const topProductsList = Object.entries(topProducts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Reports</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Time</option>
          <option value="0">This Month</option>
          <option value="1">Last Month</option>
          <option value="2">2 Months Ago</option>
          <option value="3">3 Months Ago</option>
        </select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center gap-2 text-green-500 mb-2">
            <TrendingUp size={24} />
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString('en-IN')}</p>
          <p className="text-sm text-gray-500">Total Revenue</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-2xl font-bold text-green-600">₹{receivedAmount.toLocaleString('en-IN')}</p>
          <p className="text-sm text-gray-500">Received</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-2xl font-bold text-amber-600">₹{pendingAmount.toLocaleString('en-IN')}</p>
          <p className="text-sm text-gray-500">Pending</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            <FileText size={24} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalInvoices}</p>
          <p className="text-sm text-gray-500">Total Invoices</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center gap-2 text-purple-500 mb-2">
            <BarChart3 size={24} />
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{avgOrderValue.toFixed(0)}</p>
          <p className="text-sm text-gray-500">Avg Order Value</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center gap-2 text-amber-500 mb-2">
            <BarChart3 size={24} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{lowStockCount}</p>
          <p className="text-sm text-gray-500">Low Stock Items</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="font-semibold mb-4">Top Selling Products (by value)</h3>
        {topProductsList.length === 0 ? (
          <p className="text-gray-500">No sales data for this period.</p>
        ) : (
          <ul className="space-y-3">
            {topProductsList.map(([name, value], i) => (
              <li key={name} className="flex justify-between items-center">
                <span className="font-medium">
                  {i + 1}. {name}
                </span>
                <span className="text-primary-600 font-semibold">₹{value.toLocaleString('en-IN')}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="font-semibold mb-4">Recent Invoices</h3>
        <div className="space-y-2">
          {filteredInvoices.slice(0, 10).map((inv) => (
            <div
              key={inv.id}
              className="flex justify-between items-center py-2 border-b last:border-0"
            >
              <div>
                <p className="font-medium">{inv.invoiceNumber}</p>
                <p className="text-sm text-gray-500">
                  {inv.customer?.name} • {inv.date ? format(new Date(inv.date), 'dd MMM yyyy') : '-'}
                </p>
              </div>
              <p className="font-semibold">₹{parseFloat(inv.grandTotal || 0).toLocaleString('en-IN')}</p>
            </div>
          ))}
          {filteredInvoices.length === 0 && (
            <p className="text-gray-500 py-4">No invoices in this period.</p>
          )}
        </div>
      </div>
    </div>
  );
}
