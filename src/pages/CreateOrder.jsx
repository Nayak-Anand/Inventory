import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useToast } from '../components/Toast';
import { LoadingButton } from '../components/Loading';
import AddCustomerDialog from '../components/AddCustomerDialog';
import api from '../api/client';
import { Plus, Trash2, UserPlus } from 'lucide-react';
import { format } from 'date-fns';

export default function CreateOrder() {
  const { products, customers } = useStore();
  const toast = useToast();
  const [customerId, setCustomerId] = useState('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [orderDate, setOrderDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [items, setItems] = useState([{ productId: '', quantity: 1, rate: 0, name: '', unit: 'pcs' }]);
  const [success, setSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

  const subtotal = items.reduce(
    (sum, i) => sum + (parseFloat(i.quantity) || 0) * (parseFloat(i.rate) || 0),
    0
  );

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
    try {
      const orderItems = validItems.map((i) => {
        const product = products.find((p) => p.id === i.productId);
        return {
          itemId: i.productId,
          itemName: i.name || product?.name,
          quantity: parseInt(i.quantity) || 0,
          rate: parseFloat(i.rate) || 0,
          unit: i.unit || 'pcs',
        };
      });
      // Combine selected date with current time so order date shows correct time
      const now = new Date();
      const [y, m, day] = orderDate.split('-').map(Number);
      const orderDateTime = new Date(y, m - 1, day, now.getHours(), now.getMinutes(), now.getSeconds());
      const { data } = await api.post('/orders', {
        customerId,
        date: orderDateTime.toISOString(),
        items: orderItems,
        taxAmount: 0,
      });
      setCreatedOrder(data);
      setSuccess(true);
      toast.success('Order created successfully');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to create order';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (success && createdOrder) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="font-semibold text-green-800">✓ Order created: {createdOrder.orderNumber}</p>
          <p className="text-sm text-green-700 mt-1">Pending admin approval.</p>
        </div>
        <a
          href="/orders"
          className="inline-block bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium"
        >
          View Orders
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create Order</h1>
      <p className="text-gray-600">Create order for customer. Admin approval required before invoice.</p>

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
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
              <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 rounded-lg">
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
                        {p.name} - ₹{p.price}
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
                  <p className="py-2 font-medium">₹{((item.quantity || 0) * (item.rate || 0)).toFixed(2)}</p>
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
          <div className="w-64 text-right">
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <LoadingButton
          onClick={handleCreate}
          loading={submitting}
          disabled={submitting}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-semibold disabled:opacity-70"
        >
          Create Order
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
