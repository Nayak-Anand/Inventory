import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useToast } from '../components/Toast';
import Loading, { LoadingButton } from '../components/Loading';
import { FileText, CheckCircle, XCircle, Receipt } from 'lucide-react';
import { format } from 'date-fns';

export default function Orders() {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data || []);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load orders';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleApprove = async (id) => {
    if (!confirm('Approve this order? Invoice will be created automatically.')) return;
    
    setProcessingId(id);
    try {
      await api.post(`/orders/${id}/approve`);
      toast.success('Order approved and invoice created');
      fetchOrders();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to approve order';
      toast.error(errorMsg);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Reject this order?')) return;
    
    setProcessingId(id);
    try {
      await api.post(`/orders/${id}/reject`);
      toast.success('Order rejected');
      fetchOrders();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to reject order';
      toast.error(errorMsg);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <Loading text="Loading orders..." />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders</h1>
      <p className="text-gray-600">Approve order to auto-create invoice. Invoice will appear in Invoices list.</p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-700">Order #</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700 hidden sm:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-700 hidden md:table-cell">Amount</th>
                <th className="text-right px-4 py-3 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12">
                    <Loading text="Loading orders..." size="sm" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    <FileText className="mx-auto mb-2 opacity-50" size={48} />
                    <p>No orders yet.</p>
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const isPending = o.approvalStatus === 'pending';
                  return (
                    <tr key={o.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
                      <td className="px-4 py-3">{o.customer?.name || '-'}</td>
                      <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                        {o.date ? format(new Date(o.date), 'dd MMM yyyy') : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            o.approvalStatus === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : o.approvalStatus === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {o.approvalStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium hidden md:table-cell">
                        ₹{parseFloat(o.grandTotal || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        {isPending ? (
                          <div className="flex justify-end gap-2">
                            <LoadingButton
                              onClick={() => handleApprove(o.id)}
                              loading={processingId === o.id}
                              disabled={processingId === o.id}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                              title="Approve"
                            >
                              {processingId === o.id ? (
                                <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <CheckCircle size={20} />
                              )}
                            </LoadingButton>
                            <LoadingButton
                              onClick={() => handleReject(o.id)}
                              loading={processingId === o.id}
                              disabled={processingId === o.id}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                              title="Reject"
                            >
                              {processingId === o.id ? (
                                <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <XCircle size={20} />
                              )}
                            </LoadingButton>
                          </div>
                        ) : o.invoiceId ? (
                          <Link
                            to="/invoices"
                            className="inline-flex items-center gap-1 text-sm text-primary-600 hover:underline"
                          >
                            <Receipt size={16} />
                            <span className="hidden sm:inline">View Invoice</span>
                            <span className="sm:hidden">Invoice</span>
                          </Link>
                        ) : null}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
