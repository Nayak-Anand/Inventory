import { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { useToast } from '../components/Toast';
import Loading, { LoadingButton } from '../components/Loading';
import { Plus, Pencil, Trash2, Users, Download, AlertCircle, UserCircle2, Camera } from 'lucide-react';
import { validateRequired, validateEmail, validatePhone, validateGSTIN } from '../utils/validation';
import { exportToCSV, exportToExcel } from '../utils/export';

export default function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, loading } = useStore();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    gstin: '',
    creditLimit: '',
    avatar: '',
  });
  const avatarInputRef = useRef(null);

  const resetForm = () => {
    setForm({ name: '', phone: '', email: '', address: '', gstin: '', creditLimit: '', avatar: '' });
    setFormErrors({});
    setEditingId(null);
    setShowForm(false);
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = () => setForm((p) => ({ ...p, avatar: reader.result }));
    reader.readAsDataURL(file);
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
      const payload = { name: form.name, phone: form.phone, email: form.email, address: form.address, gstin: form.gstin };
      if (form.creditLimit) payload.creditLimit = parseFloat(form.creditLimit) || 0;
      if (form.avatar) payload.avatar = form.avatar;
      if (editingId) {
        await updateCustomer(editingId, payload);
        toast.success('Customer updated successfully');
      } else {
        await addCustomer(payload);
        toast.success('Customer added successfully');
      }
      resetForm();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to save customer';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    
    setDeletingId(id);
    try {
      await deleteCustomer(id);
      toast.success('Customer deleted successfully');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to delete customer';
      toast.error(errorMsg);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = (format = 'csv') => {
    if (customers.length === 0) {
      toast.warning('No customers to export');
      return;
    }

    const exportData = customers.map((c) => ({
      Name: c.name,
      Phone: c.phone || '',
      Email: c.email || '',
      Address: c.address || '',
      GSTIN: c.gstin || '',
      'Credit Limit': c.creditLimit || 0,
    }));

    const filename = `customers_${new Date().toISOString().split('T')[0]}.${format}`;
    
    if (format === 'csv') {
      exportToCSV(exportData, filename);
      toast.success('Customers exported to CSV');
    } else {
      exportToExcel(exportData, filename);
      toast.success('Customers exported to Excel');
    }
  };

  const handleEdit = (c) => {
    setForm({
      name: c.name,
      phone: c.phone || '',
      email: c.email || '',
      address: c.address || '',
      gstin: c.gstin || '',
      creditLimit: c.creditLimit?.toString() || '',
      avatar: c.avatar || '',
    });
    setEditingId(c.id);
    setShowForm(true);
  };

  if (loading && customers.length === 0) {
    return <Loading text="Loading customers..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Customers</h1>
        <div className="flex flex-wrap gap-2">
          {customers.length > 0 && (
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
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 rounded-xl font-medium"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add Customer</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-semibold mb-4">{editingId ? 'Edit Customer' : 'Add Customer'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="shrink-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                    {form.avatar ? (
                      <img src={form.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle2 size={40} className="text-gray-400" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 shadow"
                    title="Add/Change photo"
                  >
                    <Camera size={16} />
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarSelect}
                  />
                </div>
                {form.avatar && (
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, avatar: '' }))}
                    className="mt-1 text-xs text-red-600 hover:text-red-700"
                  >
                    Remove photo
                  </button>
                )}
                <p className="text-xs text-gray-500 mt-1">Optional. Salesman bhi customer ki photo add/update kar sakte hain.</p>
              </div>
              <div className="flex-1 w-full space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  if (formErrors.name) setFormErrors({ ...formErrors, name: null });
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  formErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Customer name"
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {formErrors.name}
                </p>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => {
                    setForm({ ...form, phone: e.target.value });
                    if (formErrors.phone) setFormErrors({ ...formErrors, phone: null });
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
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
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    if (formErrors.email) setFormErrors({ ...formErrors, email: null });
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
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
                placeholder="Full address"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN (Optional)</label>
                <input
                  type="text"
                  value={form.gstin}
                  onChange={(e) => {
                    setForm({ ...form, gstin: e.target.value.toUpperCase() });
                    if (formErrors.gstin) setFormErrors({ ...formErrors, gstin: null });
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={form.creditLimit}
                  onChange={(e) => setForm({ ...form, creditLimit: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="0"
                />
              </div>
            </div>
              </div>
            </div>
            <div className="flex gap-2">
              <LoadingButton
                type="submit"
                loading={submitting}
                disabled={submitting}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-medium disabled:opacity-70"
              >
                {editingId ? 'Update' : 'Save'}
              </LoadingButton>
              <button
                type="button"
                onClick={resetForm}
                disabled={submitting}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-700 w-14">Photo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700 hidden md:table-cell">Address</th>
                <th className="text-right px-4 py-3 font-medium text-gray-700 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12">
                    <Loading text="Loading customers..." size="sm" />
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    <Users className="mx-auto mb-2 opacity-50" size={48} />
                    <p>No customers yet. Add your first customer above.</p>
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                        {c.avatar ? (
                          <img src={c.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <UserCircle2 size={22} className="text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3">{c.phone || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell truncate max-w-[200px]">
                      {c.address || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(c)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={deletingId === c.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                          title="Delete customer"
                        >
                          {deletingId === c.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
