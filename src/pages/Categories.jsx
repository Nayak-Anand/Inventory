import { useState, useEffect } from 'react';
import api from '../api/client';
import { useStore } from '../context/StoreContext';
import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react';

export default function Categories() {
  const { fetchData } = useStore();
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setForm({ name: '', description: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, form);
      } else {
        await api.post('/categories', form);
      }
      fetchCategories();
      fetchData(); // refresh StoreContext so Products dropdown gets new category
      resetForm();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleEdit = (c) => {
    setForm({ name: c.name, description: c.description || '' });
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
      fetchData(); // refresh StoreContext so Products dropdown stays in sync
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) return <div className="py-20 text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 rounded-xl font-medium"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-semibold mb-4">{editingId ? 'Edit Category' : 'Add Category'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. Grocery, FMCG"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                rows="2"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-medium">
                {editingId ? 'Update' : 'Save'}
              </button>
              <button type="button" onClick={resetForm} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
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
                <th className="text-left px-4 py-3 font-medium text-gray-700">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700 hidden md:table-cell">Description</th>
                <th className="text-right px-4 py-3 font-medium text-gray-700 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-gray-500">
                    <FolderOpen className="mx-auto mb-2 opacity-50" size={48} />
                    <p>No categories yet. Add your first category above.</p>
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{c.description || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
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
    </div>
  );
}
