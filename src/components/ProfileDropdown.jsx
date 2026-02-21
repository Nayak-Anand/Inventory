import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle2, Camera, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function ProfileDropdown() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const leaveTimerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    leaveTimerRef.current = setTimeout(() => setOpen(false), 150);
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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-500 hover:bg-primary-600 text-white shrink-0 ring-2 ring-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
        aria-label="Profile"
      >
        {user.avatar ? (
          <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
        ) : (
          <UserCircle2 size={24} />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-white rounded-xl shadow-lg border border-gray-100 py-4">
            <div className="px-4 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 rounded hover:bg-gray-100 text-gray-400"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 pb-4 -mt-6 flex flex-col items-center">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden border-2 border-primary-200">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle2 size={40} className="text-primary-500" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 transition-colors shadow disabled:opacity-70"
                  title="Change photo"
                >
                  <Camera size={16} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
              </div>
              <p className="mt-3 font-semibold text-gray-900 text-center">{user.name}</p>
              <p className="text-sm text-gray-500 text-center truncate w-full px-2">{user.mobile}</p>
              {user.email && <p className="text-xs text-gray-400 text-center truncate w-full px-2">{user.email}</p>}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {uploading ? 'Uploading...' : 'Change photo'}
              </button>
              <button
                type="button"
                onClick={() => { logout(); navigate('/login'); }}
                className="mt-2 flex items-center justify-center gap-2 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
        </div>
      )}
    </div>
  );
}
