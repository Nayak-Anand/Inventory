import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';

export default function Settings() {
  const { settings, saveSettings } = useStore();
  const [form, setForm] = useState({
    businessName: settings.businessName || '',
    address: settings.address || '',
    gstin: settings.gstin || '',
    state: settings.state || '',
    stateCode: settings.stateCode || '',
    logo: settings.logo || '',
  });

  useEffect(() => {
    setForm({
      businessName: settings.businessName || '',
      address: settings.address || '',
      gstin: settings.gstin || '',
      state: settings.state || '',
      stateCode: settings.stateCode || '',
      logo: settings.logo || '',
    });
  }, [settings]);

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, etc.)');
      return;
    }
    if (file.size > 500 * 1024) {
      alert('Image should be less than 500 KB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, logo: reader.result }));
    reader.readAsDataURL(file);
  };

  const removeLogo = () => setForm((f) => ({ ...f, logo: '' }));

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await saveSettings(form);
      alert('Settings saved!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save settings');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Business Settings</h1>
      <p className="text-gray-600">This information will appear on your invoices.</p>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Logo</label>
          <div className="flex items-center gap-4">
            {form.logo ? (
              <div className="relative">
                <img
                  src={form.logo}
                  alt="Business Logo"
                  className="h-20 w-auto max-w-[200px] object-contain border border-gray-200 rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-sm hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="h-20 w-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                No logo
              </div>
            )}
            <label className="cursor-pointer">
              <span className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">
                {form.logo ? 'Change Logo' : 'Upload Logo'}
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={handleLogoChange}
              />
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG (max 500 KB). Will appear on invoices.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
          <input
            type="text"
            required
            value={form.businessName}
            onChange={(e) => setForm({ ...form, businessName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Your business name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
          <textarea
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows="3"
            placeholder="Full business address"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN (Optional)</label>
          <input
            type="text"
            value={form.gstin}
            onChange={(e) => setForm({ ...form, gstin: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="15-character GST number"
            maxLength={15}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. Maharashtra"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State Code</label>
            <input
              type="text"
              value={form.stateCode}
              onChange={(e) => setForm({ ...form, stateCode: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. 27"
              maxLength={2}
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-semibold"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
}
