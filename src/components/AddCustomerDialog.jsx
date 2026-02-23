import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useToast } from './Toast';
import { LoadingButton } from './Loading';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { validateRequired, validateEmail, validatePhone, validateGSTIN } from '../utils/validation';

export default function AddCustomerDialog({ open, onClose, onSuccess }) {
  const { addCustomer } = useStore();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    gstin: '',
  });

  const resetForm = () => {
    setForm({ name: '', phone: '', email: '', address: '', gstin: '' });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    const nameError = validateRequired(form.name, 'Customer name');
    if (nameError) errors.name = nameError;
    if (form.email) {
      const emailError = validateEmail(form.email);
      if (emailError) errors.email = emailError;
    }
    if (form.phone) {
      const phoneError = validatePhone(form.phone);
      if (phoneError) errors.phone = phoneError;
    }
    if (form.gstin) {
      const gstinError = validateGSTIN(form.gstin);
      if (gstinError) errors.gstin = gstinError;
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { name: form.name.trim(), phone: form.phone?.trim() || undefined, email: form.email?.trim() || undefined, address: form.address?.trim() || undefined, gstin: form.gstin?.trim().toUpperCase() || undefined };
      const id = await addCustomer(payload);
      toast.success('Customer added successfully');
      resetForm();
      onClose?.();
      onSuccess?.(id);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to add customer';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} aria-hidden="true" />
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus size={22} className="text-primary-500" />
            <h3 className="font-semibold text-gray-900">Add Customer</h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => { setForm({ ...form, name: e.target.value }); if (formErrors.name) setFormErrors({ ...formErrors, name: null }); }}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                formErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Customer name"
              autoFocus
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {formErrors.name}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => { setForm({ ...form, phone: e.target.value }); if (formErrors.phone) setFormErrors({ ...formErrors, phone: null }); }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  formErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="10-digit mobile"
                maxLength={10}
              />
              {formErrors.phone && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {formErrors.phone}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => { setForm({ ...form, email: e.target.value }); if (formErrors.email) setFormErrors({ ...formErrors, email: null }); }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="email@example.com"
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {formErrors.email}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              rows="2"
              placeholder="Full address (optional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN (Optional)</label>
            <input
              type="text"
              value={form.gstin}
              onChange={(e) => { setForm({ ...form, gstin: e.target.value.toUpperCase() }); if (formErrors.gstin) setFormErrors({ ...formErrors, gstin: null }); }}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                formErrors.gstin ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="15-character GST number"
              maxLength={15}
            />
            {formErrors.gstin && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {formErrors.gstin}
              </p>
            )}
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <LoadingButton
              type="submit"
              loading={submitting}
              disabled={submitting}
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-medium disabled:opacity-70"
            >
              Add & Select
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}
