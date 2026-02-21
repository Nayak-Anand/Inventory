import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Loading, { LoadingButton } from '../components/Loading';
import { useReactToPrint } from 'react-to-print';
import { FileText, Printer, ChevronLeft, CheckCircle, Clock, Download } from 'lucide-react';
import InvoicePrint from '../components/InvoicePrint';
import { format } from 'date-fns';
import { exportToCSV, exportToExcel } from '../utils/export';

export default function Invoices() {
  const { invoices, updateInvoice, loading } = useStore();
  const { user } = useAuth();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentFilter, setPaymentFilter] = useState(searchParams.get('filter') || 'all');
  const [markPaidInvoice, setMarkPaidInvoice] = useState(null);
  const [receivedDate, setReceivedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [updatingInvoice, setUpdatingInvoice] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter && ['all', 'pending', 'received'].includes(filter)) {
      setPaymentFilter(filter);
    }
  }, [searchParams]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedInvoice?.invoiceNumber || 'Invoice',
  });

  const sortedInvoices = [...invoices]
    .filter((inv) => {
      if (paymentFilter === 'all') return true;
      return inv.paymentStatus === paymentFilter;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleMarkAsPaid = (inv) => {
    setMarkPaidInvoice(inv);
    setReceivedDate(format(new Date(), 'yyyy-MM-dd'));
  };

  const confirmMarkAsPaid = async () => {
    if (!markPaidInvoice) return;
    setUpdatingInvoice(markPaidInvoice.id);
    try {
      await updateInvoice(markPaidInvoice.id, { paymentStatus: 'received', receivedDate });
      setSelectedInvoice((prev) =>
        prev?.id === markPaidInvoice.id
          ? { ...prev, paymentStatus: 'received', receivedDate, markedByName: user?.name || prev?.markedByName }
          : prev
      );
      toast.success('Invoice marked as paid');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update invoice';
      toast.error(errorMsg);
    } finally {
      setUpdatingInvoice(null);
      setMarkPaidInvoice(null);
    }
  };

  const handleExport = (exportFormat = 'csv') => {
    const filteredInvoices = sortedInvoices;
    if (filteredInvoices.length === 0) {
      toast.warning('No invoices to export');
      return;
    }

    const headers = ['Invoice #', 'Customer', 'Date', 'Due Date', 'Status', 'Subtotal', 'GST', 'Total'];
    const exportData = filteredInvoices.map((inv) => ({
      'Invoice #': inv.invoiceNumber || '',
      'Customer': typeof inv.customer === 'object' && inv.customer?.name ? inv.customer.name : (inv.customer || ''),
      'Date': inv.date ? format(new Date(inv.date), 'dd/MM/yyyy') : '',
      'Due Date': inv.dueDate ? format(new Date(inv.dueDate), 'dd/MM/yyyy') : '',
      'Status': inv.paymentStatus === 'received' ? 'Paid' : 'Pending',
      'Subtotal': Number(inv.subtotal) || 0,
      'GST': (Number(inv.cgst) || 0) + (Number(inv.sgst) || 0) + (Number(inv.igst) || 0),
      'Total': Number(inv.grandTotal) || 0,
    }));

    const filename = `invoices_${paymentFilter}_${new Date().toISOString().split('T')[0]}.${exportFormat === 'csv' ? 'csv' : 'xlsx'}`;
    try {
      if (exportFormat === 'csv') {
        exportToCSV(exportData, filename, headers);
        toast.success('Invoices exported to CSV');
      } else {
        exportToExcel(exportData, filename, headers);
        toast.success('Invoices exported to Excel');
      }
    } catch (err) {
      console.error('Export failed:', err);
      toast.error(err?.message || 'Export failed. Try again.');
    }
  };

  if (selectedInvoice) {
    const isPaid = selectedInvoice.paymentStatus === 'received';
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedInvoice(null)}
          className="flex items-center gap-2 text-primary-500 hover:text-primary-600 font-medium"
        >
          <ChevronLeft size={20} />
          Back to list
        </button>

        <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-xs text-gray-500">Payment Status</p>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                  isPaid ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isPaid ? <CheckCircle size={16} /> : <Clock size={16} />}
                {isPaid ? (selectedInvoice.markedByName ? `Received by ${selectedInvoice.markedByName}` : 'Received') : 'Pending'}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Due Date</p>
              <p className="font-medium">
                {selectedInvoice.dueDate
                  ? format(new Date(selectedInvoice.dueDate), 'dd MMM yyyy')
                  : '-'}
              </p>
            </div>
            {isPaid && selectedInvoice.receivedDate && (
              <div>
                <p className="text-xs text-gray-500">Received Date</p>
                <p className="font-medium text-green-700">
                  {format(new Date(selectedInvoice.receivedDate), 'dd MMM yyyy')}
                </p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {!isPaid && (
              <LoadingButton
                onClick={() => handleMarkAsPaid(selectedInvoice)}
                loading={updatingInvoice === selectedInvoice.id}
                disabled={updatingInvoice === selectedInvoice.id}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl font-medium disabled:opacity-70"
              >
                <CheckCircle size={20} />
                <span className="hidden sm:inline">Mark as Paid</span>
                <span className="sm:hidden">Paid</span>
              </LoadingButton>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 rounded-xl font-medium"
            >
              <Printer size={20} />
              <span className="hidden sm:inline">Print / PDF</span>
              <span className="sm:hidden">Print</span>
            </button>
          </div>
        </div>

        {markPaidInvoice && markPaidInvoice.id === selectedInvoice.id && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
              <h3 className="font-semibold text-lg mb-4">Mark as Paid</h3>
              <p className="text-gray-600 mb-4">
                Payment received for {selectedInvoice.invoiceNumber}?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Received Date
                </label>
                <input
                  type="date"
                  value={receivedDate}
                  onChange={(e) => setReceivedDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex gap-2">
                <LoadingButton
                  onClick={confirmMarkAsPaid}
                  loading={updatingInvoice === selectedInvoice.id}
                  disabled={updatingInvoice === selectedInvoice.id}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium disabled:opacity-70"
                >
                  Confirm
                </LoadingButton>
                <button
                  onClick={() => setMarkPaidInvoice(null)}
                  disabled={updatingInvoice === selectedInvoice.id}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border p-6 overflow-x-auto">
          <InvoicePrint ref={printRef} invoice={selectedInvoice} />
        </div>
      </div>
    );
  }

  if (loading && invoices.length === 0 && !selectedInvoice) {
    return <Loading text="Loading invoices..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <div className="flex flex-wrap gap-2">
          {sortedInvoices.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => handleExport('csv')}
                className="flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                title="Export to CSV"
              >
                <Download size={16} />
                <span className="hidden sm:inline">CSV</span>
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                title="Export to Excel"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Excel</span>
              </button>
            </div>
          )}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg max-w-[180px]"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="received">Received</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-700">Invoice #</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700 hidden sm:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700 hidden md:table-cell">Due Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-700">Amount</th>
                <th className="text-right px-4 py-3 font-medium text-gray-700 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && sortedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12">
                    <Loading text="Loading invoices..." size="sm" />
                  </td>
                </tr>
              ) : sortedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    <FileText className="mx-auto mb-2 opacity-50" size={48} />
                    <p>
                      {paymentFilter === 'all'
                        ? 'No invoices yet. Create your first invoice.'
                        : `No ${paymentFilter} invoices.`}
                    </p>
                  </td>
                </tr>
              ) : (
                sortedInvoices.map((inv) => {
                  const isPaid = inv.paymentStatus === 'received';
                  return (
                    <tr key={inv.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3">{inv.customer?.name || '-'}</td>
                      <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                        {inv.date ? format(new Date(inv.date), 'dd MMM yyyy') : '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                        {inv.dueDate ? format(new Date(inv.dueDate), 'dd MMM yyyy') : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            isPaid ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isPaid ? <CheckCircle size={14} /> : <Clock size={14} />}
                          {isPaid ? (inv.markedByName ? `Received by ${inv.markedByName}` : 'Received') : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        ₹{parseFloat(inv.grandTotal || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="p-2 text-primary-500 hover:bg-primary-50 rounded-lg"
                          title="View & Print"
                        >
                          <Printer size={18} />
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
    </div>
  );
}
