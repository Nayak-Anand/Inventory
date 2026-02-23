import { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { useToast } from '../components/Toast';
import { LoadingButton } from '../components/Loading';
import AddCustomerDialog from '../components/AddCustomerDialog';
import { useReactToPrint } from 'react-to-print';
import { Plus, Trash2, UserPlus } from 'lucide-react';
import InvoicePrint from '../components/InvoicePrint';
import { format } from 'date-fns';

const GST_RATES = [0, 5, 12, 18, 28];

const WATERMARK_OPTIONS = [
  { value: '', label: 'No watermark' },
  { value: 'ORIGINAL', label: 'ORIGINAL' },
  { value: 'DUPLICATE', label: 'DUPLICATE' },
  { value: 'COPY', label: 'COPY' },
  { value: 'PAID', label: 'PAID' },
  { value: 'DRAFT', label: 'DRAFT' },
  { value: 'IMAGE', label: 'Image (custom)' },
];

export default function CreateInvoice() {
  const { products, customers, createInvoice } = useStore();
  const toast = useToast();
  const printRef = useRef();
  const WATERMARK_STORAGE_KEY = 'invoiceWatermark';
  const [createdInvoice, setCreatedInvoice] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [printWatermark, setPrintWatermark] = useState(() => {
    try {
      return localStorage.getItem(WATERMARK_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });

  const handlePrintWatermarkChange = (value) => {
    setPrintWatermark(value);
    try {
      localStorage.setItem(WATERMARK_STORAGE_KEY, value);
    } catch {
      // ignore localStorage errors
    }
  };

  const [customerId, setCustomerId] = useState('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState('');
  const [applyGst, setApplyGst] = useState(true);
  const [gstRate, setGstRate] = useState(18);
  const [gstType, setGstType] = useState('cgst_sgst');
  const [items, setItems] = useState([{ productId: '', quantity: 1, rate: 0, name: '', unit: 'pcs' }]);

  const customer = customers.find((c) => c.id === customerId);

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1, rate: 0, name: '', unit: 'pcs' }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    if (field === 'productId') {
      const product = products.find((p) => p.id === value);
      newItems[index] = {
        ...newItems[index],
        productId: value,
        name: product?.name || '',
        rate: product?.price || 0,
        unit: product?.unit || 'pcs',
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const calculateAmount = (qty, rate) => parseFloat(qty) * parseFloat(rate);

  const subtotal = items.reduce(
    (sum, i) => sum + calculateAmount(i.quantity, i.rate),
    0
  );

  const effectiveGstRate = applyGst ? gstRate : 0;
  const gstAmount = (subtotal * effectiveGstRate) / 100;
  const cgst = applyGst && gstType === 'cgst_sgst' ? gstAmount / 2 : 0;
  const sgst = applyGst && gstType === 'cgst_sgst' ? gstAmount / 2 : 0;
  const igst = applyGst && gstType === 'igst' ? gstAmount : 0;
  const grandTotal = subtotal + gstAmount;

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: createdInvoice?.invoiceNumber || 'Invoice',
  });

  const handleCreate = async () => {
    if (!customerId) {
      toast.error('Please select a customer');
      return;
    }
    const validItems = items.filter((i) => i.productId && i.quantity > 0);
    if (validItems.length === 0) {
      toast.error('Add at least one item');
      return;
    }

    setSubmitting(true);
    const invoiceItems = validItems.map((i) => {
      const product = products.find((p) => p.id === i.productId);
      const qty = parseInt(i.quantity) || 0;
      const rate = parseFloat(i.rate) || 0;
      return {
        productId: i.productId,
        name: i.name || product?.name,
        quantity: qty,
        unit: i.unit || 'pcs',
        rate,
        amount: qty * rate,
      };
    });

    try {
      const invoice = await createInvoice({
        customer: { ...customer, id: customerId },
        customerId,
        date: invoiceDate,
        dueDate: dueDate.trim() || null,
        items: invoiceItems,
        subtotal,
        cgst,
        sgst,
        igst,
        grandTotal,
        gstType: applyGst ? (gstType === 'cgst_sgst' ? 'cgst_sgst' : 'igst') : 'cgst_sgst',
        gstRate: effectiveGstRate,
      });
      setCreatedInvoice(invoice);
      toast.success('Invoice created successfully');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to create invoice';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setCreatedInvoice(null);
    setCustomerId('');
    try {
      setPrintWatermark(localStorage.getItem(WATERMARK_STORAGE_KEY) || '');
    } catch {
      setPrintWatermark('');
    }
    setInvoiceDate(format(new Date(), 'yyyy-MM-dd'));
    setDueDate('');
    setApplyGst(true);
    setGstRate(18);
    setGstType('cgst_sgst');
    setItems([{ productId: '', quantity: 1, rate: 0, name: '', unit: 'pcs' }]);
  };

  if (createdInvoice) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="font-semibold text-green-800">✓ Invoice created: {createdInvoice.invoiceNumber}</p>
          <p className="text-sm text-green-700 mt-1">Stock has been updated automatically.</p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Watermark:</label>
            <select
              value={printWatermark}
              onChange={(e) => handlePrintWatermarkChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              {WATERMARK_OPTIONS.map((opt) => (
                <option key={opt.value || 'none'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handlePrint}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium"
          >
            Print / Save PDF
          </button>
          <button
            onClick={resetForm}
            className="border border-gray-300 px-6 py-3 rounded-xl hover:bg-gray-50 font-medium"
          >
            Create Another
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <InvoicePrint ref={printRef} invoice={createdInvoice} watermark={printWatermark} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create Invoice</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Customer *</label>
              <button
                type="button"
                onClick={() => setShowAddCustomer(true)}
                className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600 font-medium"
              >
                <UserPlus size={16} />
                Add Customer
              </button>
            </div>
            <select
              required
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => {
              setInvoiceDate(e.target.value);
            }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Due Date (Optional)</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="flex-1 min-w-0 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="button"
                onClick={() => setDueDate('')}
                className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 whitespace-nowrap"
                title="No due date"
              >
                No due date
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={applyGst}
              onChange={(e) => setApplyGst(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">Apply GST on this invoice</span>
          </label>
          {applyGst && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Type</label>
                <select
                  value={gstType}
                  onChange={(e) => setGstType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  <option value="cgst_sgst">CGST + SGST (Same State)</option>
                  <option value="igst">IGST (Different State)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate %</label>
                <select
                  value={gstRate}
                  onChange={(e) => setGstRate(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  {GST_RATES.map((r) => (
                    <option key={r} value={r}>
                      {r}%
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="font-medium text-gray-700">Items</label>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 text-primary-500 hover:text-primary-600 font-medium"
            >
              <Plus size={18} /> Add Item
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 rounded-lg"
              >
                <div className="col-span-12 sm:col-span-5">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Product</label>
                  <select
                    value={item.productId}
                    onChange={(e) => updateItem(index, 'productId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - ₹{p.price} (Stock: {p.stock || 0})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Rate (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) => updateItem(index, 'rate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Amount</label>
                  <p className="py-2 font-medium">
                    ₹{calculateAmount(item.quantity, item.rate).toFixed(2)}
                  </p>
                </div>
                <div className="col-span-1">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4 flex justify-end">
          <div className="w-full sm:w-64 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {applyGst && gstType === 'cgst_sgst' && effectiveGstRate > 0 && (
              <>
                <div className="flex justify-between">
                  <span>CGST ({gstRate / 2}%):</span>
                  <span>₹{(gstAmount / 2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST ({gstRate / 2}%):</span>
                  <span>₹{(gstAmount / 2).toFixed(2)}</span>
                </div>
              </>
            )}
            {applyGst && gstType === 'igst' && effectiveGstRate > 0 && (
              <div className="flex justify-between">
                <span>IGST ({gstRate}%):</span>
                <span>₹{gstAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Grand Total:</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <LoadingButton
          onClick={handleCreate}
          loading={submitting}
          disabled={submitting}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-semibold disabled:opacity-70"
        >
          Create Invoice
        </LoadingButton>
      </div>

      <AddCustomerDialog
        open={showAddCustomer}
        onClose={() => setShowAddCustomer(false)}
        onSuccess={(newId) => { setCustomerId(newId); setShowAddCustomer(false); }}
      />
    </div>
  );
}
