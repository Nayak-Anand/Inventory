import { useEffect, useState, useRef } from 'react';
import api from '../api/client';
import { useStore } from '../context/StoreContext';
import { Users, Plus, Pencil, Trash2, UserCircle2, Camera } from 'lucide-react';
import DateTimeCell from '../components/DateTimeCell';

export default function TeamMembers() {
  const { customers } = useStore();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    roleType: 'salesman',
    assignedCustomerIds: [],
    avatar: '', // data URL or existing URL
  });
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef(null);

  const loadData = async () => {
    try {
      const teamRes = await api.get('/team-members');
      setTeam(teamRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setForm({
      name: '',
      mobile: '',
      email: '',
      password: '',
      roleType: 'salesman',
      assignedCustomerIds: [],
      avatar: '',
    });
    setEditingId(null);
    setShowForm(false);
    setShowPasswordReset(false);
    setNewPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        mobile: form.mobile,
        email: form.email || undefined,
        roleType: form.roleType,
        assignedCustomerIds: form.assignedCustomerIds,
        ...(form.avatar && { avatar: form.avatar }),
      };
      if (!editingId) {
        payload.password = form.password;
        await api.post('/team-members', payload);
      } else {
        await api.put(`/team-members/${editingId}`, payload);
      }
      await loadData();
      resetForm();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to save team member');
    }
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    e.target.value = '';
    setAvatarUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, avatar: reader.result }));
      setAvatarUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handlePasswordReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    try {
      await api.post(`/team-members/${editingId}/reset-password`, { newPassword });
      alert('Password reset successfully!');
      setShowPasswordReset(false);
      setNewPassword('');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to reset password');
    }
  };

  const handleEdit = (m) => {
    setForm({
      name: m.name,
      mobile: m.mobile,
      email: m.email || '',
      password: '',
      roleType: m.role?.roleType || 'salesman',
      assignedCustomerIds: m.assignedCustomerIds || [],
      avatar: m.avatar || '',
    });
    setEditingId(m.id);
    setShowForm(true);
    setShowPasswordReset(false);
    setNewPassword('');
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this team member?')) return;
    try {
      await api.delete(`/team-members/${id}`);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const toggleCustomer = (customerId) => {
    setForm((prev) => {
      const exists = prev.assignedCustomerIds.includes(customerId);
      return {
        ...prev,
        assignedCustomerIds: exists
          ? prev.assignedCustomerIds.filter((id) => id !== customerId)
          : [...prev.assignedCustomerIds, customerId],
      };
    });
  };

  if (loading) {
    return <div className="py-20 text-center text-gray-500">Loading...</div>;
  }

  const roleOptions = [
    { value: 'salesman', label: 'Salesman' },
    { value: 'b2b_customer', label: 'B2B Customer' },
  ];

  const roleLabel = (m) => {
    const rt = m.role?.roleType;
    if (rt === 'salesman') return 'Salesman';
    if (rt === 'b2b_customer') return 'B2B Customer';
    return m.role?.name || 'Member';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Team Members</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 rounded-xl font-medium"
        >
          <Plus size={20} />
          Add Team Member
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-semibold mb-4">{editingId ? 'Edit Team Member' : 'Add Team Member'}</h3>
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
                    disabled={avatarUploading}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 shadow disabled:opacity-70"
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
                <p className="text-xs text-gray-500 mt-1">Optional. Member can also set in their profile.</p>
              </div>
              <div className="flex-1 grid sm:grid-cols-2 gap-4 w-full">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="10-digit mobile number"
                />
              </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="email@example.com"
              />
            </div>
            {!editingId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Minimum 6 characters"
                />
              </div>
            )}
            {editingId && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">Reset Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPasswordReset(!showPasswordReset)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {showPasswordReset ? 'Cancel' : 'Change Password'}
                  </button>
                </div>
                {showPasswordReset && (
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
                      <input
                        type="password"
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="Minimum 6 characters"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handlePasswordReset}
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg font-medium"
                    >
                      Reset Password
                    </button>
                  </div>
                )}
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={form.roleType}
                  onChange={(e) => setForm({ ...form, roleType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {roleOptions.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Customers</label>
              <div className="max-h-48 overflow-auto border border-gray-200 rounded-lg p-2 space-y-1">
                {customers.length === 0 && (
                  <p className="text-sm text-gray-500 px-2 py-1">No customers yet. Add customers first.</p>
                )}
                {customers.map((c) => {
                  const checked = form.assignedCustomerIds.includes(c.id);
                  return (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCustomer(c.id)}
                      />
                      <span>{c.name}</span>
                    </label>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Salesman: in customers list and order creation mein yahi customers dikhenge.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-medium"
              >
                {editingId ? 'Update' : 'Save'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
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
                <th className="text-left px-4 py-3 font-medium text-gray-700">Mobile</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Assigned Customers</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700 hidden lg:table-cell">Created</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700 hidden lg:table-cell">Last updated</th>
                <th className="text-right px-4 py-3 font-medium text-gray-700 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {team.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                    <Users className="mx-auto mb-2 opacity-50" size={48} />
                    <p>No team members yet. Add your first team member above.</p>
                  </td>
                </tr>
              ) : (
                team.map((m) => (
                  <tr key={m.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                        {m.avatar ? (
                          <img src={m.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <UserCircle2 size={22} className="text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{m.name}</td>
                    <td className="px-4 py-3">{m.mobile}</td>
                    <td className="px-4 py-3">{m.email || '—'}</td>
                    <td className="px-4 py-3">{roleLabel(m)}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {m.assignedCustomers && m.assignedCustomers.length > 0
                        ? m.assignedCustomers.map((c) => c?.name).filter(Boolean).join(', ')
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                      <DateTimeCell value={m.createdAt} />
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                      <DateTimeCell value={m.updatedAt} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(m)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
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

