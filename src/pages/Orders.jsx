import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../api/client';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Loading, { LoadingButton } from '../components/Loading';
import CreateOrderForm from '../components/CreateOrderForm';
import { FileText, CheckCircle, XCircle, Receipt, Plus } from 'lucide-react';
import DateTimeCell from '../components/DateTimeCell';

export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { fetchData } = useStore();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [approveOrder, setApproveOrder] = useState(null);
  const [applyGstOnApprove, setApplyGstOnApprove] = useState(true);
  const [setDueDateOnApprove, setSetDueDateOnApprove] = useState(false);
  const [approveDueDate, setApproveDueDate] = useState('');
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);

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

  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setShowCreateDrawer(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const openApproveDialog = (order) => {
    setApproveOrder(order);
    setApplyGstOnApprove(true);
    setSetDueDateOnApprove(false);
    const orderDate = order.date ? format(new Date(order.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
    setApproveDueDate(orderDate);
  };

  const handleApproveConfirm = async () => {
    if (!approveOrder) return;
    const id = approveOrder.id;
    setApproveOrder(null);
    setProcessingId(id);
    try {
      await api.post(`/orders/${id}/approve`, {
        applyGst: applyGstOnApprove,
        setDueDate: setDueDateOnApprove,
        ...(setDueDateOnApprove && approveDueDate && { dueDate: approveDueDate }),
      });
      toast.success('Order approved and invoice created');
      await fetchOrders();
      await fetchData();
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

  const canCreateOrder = ['company_admin', 'salesman', 'b2b_customer'].includes(user?.roleType);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-gray-600">Approve order to auto-create invoice. Invoice will appear in Invoices list.</p>
        </div>
        {canCreateOrder && (
          <button
            onClick={() => setShowCreateDrawer(true)}
            className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 rounded-xl font-medium shrink-0"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Create Order</span>
            <span className="sm:hidden">Create</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-700">Order #</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700 hidden sm:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700 hidden md:table-cell">Approved at</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-700 hidden md:table-cell">Amount</th>
                <th className="text-right px-4 py-3 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12">
                    <Loading text="Loading orders..." size="sm" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
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
                        <DateTimeCell value={o.date} />
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                        <DateTimeCell value={o.approvedAt} />
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
                              onClick={() => openApproveDialog(o)}
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

      {approveOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
            <h3 className="font-semibold text-lg mb-2">Approve Order</h3>
            <p className="text-gray-600 mb-4">
              Invoice will be created for {approveOrder.orderNumber}. Apply GST on this invoice?
            </p>
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={applyGstOnApprove}
                onChange={(e) => setApplyGstOnApprove(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">Apply GST on invoice</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={setDueDateOnApprove}
                onChange={(e) => setSetDueDateOnApprove(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">Set payment due date on invoice</span>
            </label>
            {setDueDateOnApprove && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment due date</label>
                <input
                  type="date"
                  value={approveDueDate}
                  onChange={(e) => setApproveDueDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleApproveConfirm}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium"
              >
                Approve
              </button>
              <button
                onClick={() => setApproveOrder(null)}
                className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Order side drawer */}
      {showCreateDrawer && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setShowCreateDrawer(false)}
            aria-hidden="true"
          />
          <div className="fixed top-0 right-0 h-full w-full max-w-[60rem] bg-white shadow-xl z-50 flex flex-col drawer-slide-in">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Create Order</h2>
              <button
                onClick={() => setShowCreateDrawer(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                aria-label="Close"
              >
                <XCircle size={22} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <CreateOrderForm
                compact
                onSuccess={(data) => {
                  setShowCreateDrawer(false);
                  fetchOrders();
                  fetchData();
                }}
                onCancel={() => setShowCreateDrawer(false)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
