import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import { Package, Users, Truck, FileText, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { products, customers, suppliers, invoices, loading } = useStore();
  const { user } = useAuth();

  const totalProducts = products.length;
  const lowStock = products.filter((p) => (p.stock || 0) <= (p.minStock || 5)).length;
  const totalInvoices = invoices.length;
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
  const pendingInvoices = invoices.filter((inv) => inv.paymentStatus !== 'received');
  const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);

  const cards = [
    { icon: Package, label: 'Products', value: totalProducts, color: 'bg-blue-500', link: '/products' },
    { icon: Users, label: 'Customers', value: customers.length, color: 'bg-green-500', link: '/customers' },
    { icon: Truck, label: 'Suppliers', value: suppliers.length, color: 'bg-amber-500', link: '/suppliers' },
    { icon: FileText, label: 'Invoices', value: totalInvoices, color: 'bg-purple-500', link: '/invoices' },
  ];

  if (loading) {
    return <Loading text="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ icon: Icon, label, value, color, link }) => (
          <Link
            key={label}
            to={link}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mb-3`}>
              <Icon className="text-white" size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-gray-500 text-sm">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-green-500" size={24} />
            <h3 className="font-semibold">Total Revenue</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">₹{totalRevenue.toLocaleString('en-IN')}</p>
          <p className="text-sm text-gray-500 mt-1">From all invoices</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-amber-500" size={24} />
            <h3 className="font-semibold">Pending Payment</h3>
          </div>
          <p className="text-3xl font-bold text-amber-600">₹{pendingAmount.toLocaleString('en-IN')}</p>
          <p className="text-sm text-gray-500 mt-1">
            {pendingInvoices.length} invoice(s) pending
          </p>
          {pendingInvoices.length > 0 && (
            <Link
              to="/invoices?filter=pending"
              className="inline-block mt-2 text-primary-500 font-medium text-sm hover:underline"
            >
              View Pending →
            </Link>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Package className="text-amber-500" size={24} />
            <h3 className="font-semibold">Low Stock Alert</h3>
          </div>
          <p className="text-3xl font-bold text-amber-600">{lowStock}</p>
          <p className="text-sm text-gray-500 mt-1">
            {lowStock > 0 ? 'Products need restocking' : 'All products in stock'}
          </p>
          {lowStock > 0 && (
            <Link
              to="/products"
              className="inline-block mt-2 text-primary-500 font-medium text-sm hover:underline"
            >
              View Products →
            </Link>
          )}
        </div>
      </div>

      {user?.roleType === 'company_admin' ? (
        <Link
          to="/invoices/create"
          className="block w-full py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl text-center transition-colors"
        >
          + Create New Invoice
        </Link>
      ) : (
        <Link
          to="/orders?create=1"
          className="block w-full py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl text-center transition-colors"
        >
          + Create New Order
        </Link>
      )}
    </div>
  );
}
