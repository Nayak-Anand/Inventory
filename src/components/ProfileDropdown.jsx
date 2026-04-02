import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle2, Camera, X, LogOut, Sun, Moon, Building2, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function ProfileDropdown() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('uiTheme') || 'light');
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('uiTheme', theme);
  }, [theme]);

  const setUiTheme = (nextTheme) => {
    setTheme(nextTheme);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    e.target.value = '';
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result;
        const { data } = await api.put('/auth/me', { avatar: dataUrl });
        updateUser({ avatar: data.avatar });
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to update photo');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!user) return null;

  return (
    <div
      className="relative"
      ref={dropdownRef}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={uploading}
      />
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-3 rounded-full bg-white/90 hover:bg-white text-gray-800 shrink-0 shadow-sm focus:outline-none transition-shadow px-2 py-1"
        aria-label="Profile"
      >
        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-500 text-white overflow-hidden shrink-0">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <UserCircle2 size={24} />
          )}
        </span>
        <span className="hidden md:flex flex-col items-start leading-tight min-w-0 pr-1">
          <span className="text-sm font-semibold truncate max-w-40">{user.name || 'Profile'}</span>
          <span className="text-xs text-gray-500 truncate max-w-40">{user.email || user.mobile}</span>
        </span>
        <ChevronDown className="hidden md:block w-4 h-4 text-gray-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-3 z-50 w-80 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-sm text-gray-500 truncate">{user.email || user.mobile}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 shrink-0"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Theme</p>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setUiTheme('light')}
                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  theme === 'light' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Sun size={16} />
                Light
              </button>
              <button
                type="button"
                onClick={() => setUiTheme('dark')}
                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  theme === 'dark' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Moon size={16} />
                Dark
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 py-2">
            <button
              type="button"
              onClick={() => { setOpen(false); navigate('/settings'); }}
              className="w-full flex items-center gap-3 px-5 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Building2 size={18} className="text-gray-400" />
              <span>Business Settings</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center gap-3 px-5 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
            >
              <Camera size={18} className="text-gray-400" />
              <span>{uploading ? 'Uploading...' : 'Change Profile Image'}</span>
            </button>
          </div>

          <div className="border-t border-gray-100 p-2">
            <button
              type="button"
              onClick={() => { logout(); navigate('/login'); }}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <LogOut size={18} className="text-gray-400" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
