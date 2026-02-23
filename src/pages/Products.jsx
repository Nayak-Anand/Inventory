import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Loading, { LoadingButton } from '../components/Loading';
import { Plus, Pencil, Trash2, Package, Download, AlertCircle, FolderOpen, X } from 'lucide-react';
import { validateRequired, validatePositiveNumber, validateNumber } from '../utils/validation';
import { exportToCSV, exportToExcel } from '../utils/export';
import DateTimeCell from '../components/DateTimeCell';

export default function Products() {
  const { user } = useAuth();
  const { products, categories, addProduct, updateProduct, deleteProduct, fetchData, loading } = useStore();
  const toast = useToast();
  const canEditProducts = !user?.roleType || user?.roleType === 'company_admin';
  const isAdmin = user?.roleType === 'company_admin';
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = (location.pathname === '/products/categories' && isAdmin) ? 'categories' : 'products';

  const setActiveTab = (tab) => {
    if (tab === 'products') {
      navigate('/products', { replace: true });
    } else {
      navigate('/products/categories', { replace: true });
    }
  };
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    gstRate: '18',
    stock: '',
    minStock: '5',
    unit: 'pcs',
  });
  const [catForm, setCatForm] = useState({ name: '', description: '' });
  const [catShowForm, setCatShowForm] = useState(false);
  const [catEditingId, setCatEditingId] = useState(null);

  const resetForm = () => {
    setForm({
      name: '',
      sku: '',
      category: '',
      price: '',
      gstRate: '18',
      stock: '',
      minStock: '5',
      unit: 'pcs',
    });
    setFormErrors({});
    setEditingId(null);
    setShowForm(false);
  };

  const validateForm = () => {
    const errors = {};
    
    const nameError = validateRequired(form.name, 'Product name');
    if (nameError) errors.name = nameError;
    
    const priceError = validatePositiveNumber(form.price, 'Price');
    if (priceError) errors.price = priceError;
    
    const gstError = validateNumber(form.gstRate, 'GST rate', 0, 100);
    if (gstError) errors.gstRate = gstError;
    
    const stockError = validatePositiveNumber(form.stock, 'Stock quantity');
    if (stockError) errors.stock = stockError;
    
    const minStockError = validatePositiveNumber(form.minStock, 'Minimum stock');
    if (minStockError) errors.minStock = minStockError;
    
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
    const data = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: form.category.trim(),
      price: parseFloat(form.price) || 0,
      gstRate: parseFloat(form.gstRate) || 18,
      stock: parseInt(form.stock) || 0,
      minStock: parseInt(form.minStock) || 5,
      unit: form.unit,
    };
    
    try {
      if (editingId) {
        await updateProduct(editingId, data);
        toast.success('Product updated successfully');
      } else {
        await addProduct(data);
        toast.success('Product added successfully');
      }
      resetForm();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to save product';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    setDeletingId(id);
    try {
      await deleteProduct(id);
      toast.success('Product deleted successfully');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to delete product';
      toast.error(errorMsg);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = (format = 'csv') => {
    if (products.length === 0) {
      toast.warning('No products to export');
      return;
    }

    const exportData = products.map((p) => ({
      Name: p.name,
      SKU: p.sku || '',
      Category: p.category || '',
      Price: p.price || 0,
      'GST %': p.gstRate ?? 18,
      Stock: p.stock || 0,
      'Min Stock': p.minStock || 5,
      Unit: p.unit || 'pcs',
    }));

    const filename = `products_${new Date().toISOString().split('T')[0]}.${format}`;
    
    if (format === 'csv') {
      exportToCSV(exportData, filename);
      toast.success('Products exported to CSV');
    } else {
      exportToExcel(exportData, filename);
      toast.success('Products exported to Excel');
    }
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name,
      sku: p.sku || '',
      category: p.category || '',
      price: p.price?.toString() || '',
      gstRate: p.gstRate?.toString() || '18',
      stock: p.stock?.toString() || '',
      minStock: p.minStock?.toString() || '5',
      unit: p.unit || 'pcs',
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const lowStockProducts = products.filter((p) => (p.stock || 0) <= (p.minStock || 5));

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    try {
      if (catEditingId) {
        await api.put(`/categories/${catEditingId}`, catForm);
        toast.success('Category updated');
      } else {
        await api.post('/categories', catForm);
        toast.success('Category added');
      }
      fetchData();
      setCatForm({ name: '', description: '' });
      setCatEditingId(null);
      setCatShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleCatEdit = (c) => {
    setCatForm({ name: c.name, description: c.description || '' });
    setCatEditingId(c.id);
    setCatShowForm(true);
  };

  const handleCatDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchData();
      toast.success('Category deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading && products.length === 0) {
    return <Loading text="Loading products..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Products</h1>
          {isAdmin && (
            <div className="flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
              <button
                onClick={() => setActiveTab('products')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'products' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Package size={18} />
                Products
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'categories' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FolderOpen size={18} />
                Categories
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {activeTab === 'products' && products.length > 0 && (
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
          {activeTab === 'products' && canEditProducts && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 rounded-xl font-medium"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
          {activeTab === 'categories' && isAdmin && (
            <button
              onClick={() => setCatShowForm(true)}
              className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 rounded-xl font-medium"
            >
              <Plus size={20} />
              Add Category
            </button>
          )}
        </div>
      </div>

      {activeTab === 'categories' && (
        <>
          {catShowForm && (
            <div
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => { setCatShowForm(false); setCatEditingId(null); setCatForm({ name: '', description: '' }); }}
            >
              <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">{catEditingId ? 'Edit Category' : 'Add Category'}</h3>
                  <button
                    onClick={() => { setCatShowForm(false); setCatEditingId(null); setCatForm({ name: '', description: '' }); }}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleCatSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      required
                      value={catForm.name}
                      onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g. Grocery, FMCG"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={catForm.description}
                      onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      rows="2"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-medium">
                      {catEditingId ? 'Update' : 'Save'}
                    </button>
                    <button type="button" onClick={() => { setCatShowForm(false); setCatEditingId(null); setCatForm({ name: '', description: '' }); }} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 font-medium text-gray-700">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700 hidden md:table-cell">Description</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700 hidden lg:table-cell">Created</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700 hidden lg:table-cell">Last updated</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-700 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                        <FolderOpen className="mx-auto mb-2 opacity-50" size={48} />
                        <p>No categories yet. Add your first category above.</p>
                      </td>
                    </tr>
                  ) : (
                    categories.map((c) => (
                      <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{c.name}</td>
                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{c.description || '-'}</td>
                        <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                          <DateTimeCell value={c.createdAt} />
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                          <DateTimeCell value={c.updatedAt} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleCatEdit(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                              <Pencil size={18} />
                            </button>
                            <button onClick={() => handleCatDelete(c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                              <Trash2 size={18} />
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
        </>
      )}

      {activeTab === 'products' && canEditProducts && showForm && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={resetForm}
        >
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
              <h3 className="font-semibold text-lg">{editingId ? 'Edit Product' : 'Add Product'}</h3>
              <button
                onClick={resetForm}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
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
                placeholder="e.g. Rice 1kg"
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {formErrors.name}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU / Code</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">Add categories from Categories tab first.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                value={form.price}
                onChange={(e) => {
                  setForm({ ...form, price: e.target.value });
                  if (formErrors.price) setFormErrors({ ...formErrors, price: null });
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  formErrors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {formErrors.price && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {formErrors.price}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST %</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.gstRate}
                onChange={(e) => {
                  setForm({ ...form, gstRate: e.target.value });
                  if (formErrors.gstRate) setFormErrors({ ...formErrors, gstRate: null });
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  formErrors.gstRate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="18"
              />
              {formErrors.gstRate ? (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {formErrors.gstRate}
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-0.5">Invoice mein isi rate se tax lagega</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
              <input
                type="number"
                min="0"
                required
                value={form.stock}
                onChange={(e) => {
                  setForm({ ...form, stock: e.target.value });
                  if (formErrors.stock) setFormErrors({ ...formErrors, stock: null });
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  formErrors.stock ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {formErrors.stock && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {formErrors.stock}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock</label>
                <input
                  type="number"
                  min="0"
                  value={form.minStock}
                  onChange={(e) => {
                    setForm({ ...form, minStock: e.target.value });
                    if (formErrors.minStock) setFormErrors({ ...formErrors, minStock: null });
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    formErrors.minStock ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {formErrors.minStock && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {formErrors.minStock}
                  </p>
                )}
              </div>
              <div className="w-24">
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  <option value="pcs">pcs</option>
                  <option value="kg">kg</option>
                  <option value="ltr">ltr</option>
                  <option value="box">box</option>
                </select>
              </div>
            </div>
            <div className="sm:col-span-2 flex gap-2">
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
          </div>
        </div>
      )}

      {activeTab === 'products' && lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="font-medium text-amber-800">⚠️ Low Stock ({lowStockProducts.length})</p>
          <p className="text-sm text-amber-700 mt-1">
            {lowStockProducts.map((p) => p.name).join(', ')}
          </p>
        </div>
      )}

      {activeTab === 'products' && (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-700">Product</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700 hidden sm:table-cell">SKU</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700 hidden md:table-cell">Category</th>
                <th className="text-right px-4 py-3 font-medium text-gray-700">Price</th>
                <th className="text-right px-4 py-3 font-medium text-gray-700 hidden md:table-cell">GST %</th>
                <th className="text-right px-4 py-3 font-medium text-gray-700">Stock</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700 hidden lg:table-cell">Last updated</th>
                {canEditProducts && (
                  <th className="text-right px-4 py-3 font-medium text-gray-700 w-24">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan={canEditProducts ? 8 : 7} className="px-4 py-12">
                    <Loading text="Loading products..." size="sm" />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={canEditProducts ? 8 : 7} className="px-4 py-12 text-center text-gray-500">
                    <Package className="mx-auto mb-2 opacity-50" size={48} />
                    <p>No products yet. Add your first product above.</p>
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{p.sku || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{p.category || '-'}</td>
                    <td className="px-4 py-3 text-right">₹{parseFloat(p.price || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-gray-600 hidden md:table-cell">{p.gstRate ?? 18}%</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          (p.stock || 0) <= (p.minStock || 5)
                            ? 'text-amber-600 font-medium'
                            : ''
                        }
                      >
                        {p.stock || 0} {p.unit || 'pcs'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                      <DateTimeCell value={p.updatedAt || p.createdAt} />
                    </td>
                    {canEditProducts && (
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(p)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            disabled={deletingId === p.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                            title="Delete product"
                          >
                            {deletingId === p.id ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
}
