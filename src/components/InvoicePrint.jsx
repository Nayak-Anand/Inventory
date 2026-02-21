import { forwardRef } from 'react';
import { useStore } from '../context/StoreContext';
import { format } from 'date-fns';

const InvoicePrint = forwardRef(({ invoice }, ref) => {
  const { settings } = useStore();
  const { customer, items: itemsProp, lines, subtotal, cgst, sgst, igst, grandTotal, gstType } = invoice;
  const rawItems = itemsProp || lines || [];
  const items = rawItems.map((i) => ({ ...i, name: i.name || i.itemName }));

  return (
    <div ref={ref} className="bg-white p-6 max-w-[210mm] mx-auto text-gray-900" style={{ fontFamily: 'system-ui' }}>
      <div className="border-b-2 border-gray-800 pb-4 mb-4">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div className="flex items-start gap-4">
            {settings.logo && (
              <img
                src={settings.logo}
                alt="Logo"
                className="h-16 w-auto max-w-[140px] object-contain"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">{settings.businessName}</h1>
              <p className="text-sm text-gray-600 mt-1">{settings.address}</p>
              {settings.gstin && <p className="text-sm mt-1">GSTIN: {settings.gstin}</p>}
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-primary-600">TAX INVOICE</h2>
            <p className="text-sm mt-2 font-medium">{invoice.invoiceNumber}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <p className="font-medium text-gray-600">Bill To:</p>
          <p className="font-semibold mt-1">{customer?.name}</p>
          {customer?.address && <p className="text-gray-600">{customer.address}</p>}
          {customer?.gstin && <p className="mt-1">GSTIN: {customer.gstin}</p>}
          {customer?.phone && <p>Phone: {customer.phone}</p>}
        </div>
        <div className="text-right">
          <p className="font-medium text-gray-600">Invoice Date:</p>
          <p className="font-semibold mt-1">
            {invoice.date ? format(new Date(invoice.date), 'dd MMM yyyy') : '-'}
          </p>
        </div>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-3 py-2 text-left">#</th>
            <th className="border border-gray-300 px-3 py-2 text-left">Item</th>
            <th className="border border-gray-300 px-3 py-2 text-right">Qty</th>
            <th className="border border-gray-300 px-3 py-2 text-right">Rate</th>
            <th className="border border-gray-300 px-3 py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items?.map((item, i) => (
            <tr key={i}>
              <td className="border border-gray-300 px-3 py-2">{i + 1}</td>
              <td className="border border-gray-300 px-3 py-2">{item.name}</td>
              <td className="border border-gray-300 px-3 py-2 text-right">{item.quantity} {item.unit}</td>
              <td className="border border-gray-300 px-3 py-2 text-right">₹{parseFloat(item.rate).toFixed(2)}</td>
              <td className="border border-gray-300 px-3 py-2 text-right">₹{parseFloat(item.amount).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-end">
        <table className="w-64 text-sm">
          <tr>
            <td className="py-1 font-medium">Subtotal:</td>
            <td className="py-1 text-right">₹{parseFloat(subtotal || 0).toFixed(2)}</td>
          </tr>
          {gstType === 'igst' && igst > 0 && (
            <tr>
              <td className="py-1 font-medium">IGST:</td>
              <td className="py-1 text-right">₹{parseFloat(igst).toFixed(2)}</td>
            </tr>
          )}
          {gstType !== 'igst' && (
            <>
              {cgst > 0 && (
                <tr>
                  <td className="py-1 font-medium">CGST:</td>
                  <td className="py-1 text-right">₹{parseFloat(cgst).toFixed(2)}</td>
                </tr>
              )}
              {sgst > 0 && (
                <tr>
                  <td className="py-1 font-medium">SGST:</td>
                  <td className="py-1 text-right">₹{parseFloat(sgst).toFixed(2)}</td>
                </tr>
              )}
            </>
          )}
          <tr className="border-t-2 border-gray-800">
            <td className="py-2 font-bold">Grand Total:</td>
            <td className="py-2 text-right font-bold">₹{parseFloat(grandTotal || 0).toFixed(2)}</td>
          </tr>
        </table>
      </div>

      {(invoice.paymentStatus || invoice.receivedDate) && (
        <div className="mt-6 pt-4 border-t space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Status:</span>
            <span
              className={
                invoice.paymentStatus === 'received'
                  ? 'font-medium text-green-600'
                  : 'font-medium text-amber-600'
              }
            >
              {invoice.paymentStatus === 'received' ? 'Received' : 'Pending'}
            </span>
          </div>
          {invoice.dueDate && (
            <div className="flex justify-between">
              <span className="text-gray-600">Due Date:</span>
              <span>
                {invoice.dueDate ? format(new Date(invoice.dueDate), 'dd MMM yyyy') : '-'}
              </span>
            </div>
          )}
          {invoice.receivedDate && (
            <div className="flex justify-between">
              <span className="text-gray-600">Received Date:</span>
              <span className="text-green-600 font-medium">
                {format(new Date(invoice.receivedDate), 'dd MMM yyyy')}
              </span>
            </div>
          )}
        </div>
      )}

      <p className="mt-8 text-xs text-gray-500 text-center">
        Thank you for your business! This is a computer-generated invoice.
      </p>
    </div>
  );
});

InvoicePrint.displayName = 'InvoicePrint';

export default InvoicePrint;
