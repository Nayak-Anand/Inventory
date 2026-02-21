import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Clock } from 'lucide-react';

const EXPIRING_WARNING_MINUTES = 5;
const CHECK_INTERVAL_MS = 60 * 1000; // 1 minute

export default function SessionTimeoutModal() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [showExpired, setShowExpired] = useState(false);
  const [showExpiringSoon, setShowExpiringSoon] = useState(false);
  const [expiringMinutes, setExpiringMinutes] = useState(null);

  const handleSessionExpired = useCallback(() => {
    setShowExpired(true);
  }, []);

  const handleLogoutAndRedirect = useCallback(() => {
    logout();
    setShowExpired(false);
    setShowExpiringSoon(false);
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  // Listen for 401 / session expired from API
  useEffect(() => {
    const onSessionExpired = () => handleSessionExpired();
    window.addEventListener('sessionExpired', onSessionExpired);
    return () => window.removeEventListener('sessionExpired', onSessionExpired);
  }, [handleSessionExpired]);

  // Check token expiry and show "expiring soon" warning
  useEffect(() => {
    if (!token || !user) return;

    const expiresAt = localStorage.getItem('tokenExpiresAt');
    if (!expiresAt) return;

    const checkExpiry = () => {
      const now = Date.now();
      const expiresAtMs = parseInt(expiresAt, 10);
      const remainingMs = expiresAtMs - now;
      const remainingMinutes = Math.floor(remainingMs / (60 * 1000));

      if (remainingMs <= 0) {
        setShowExpired(true);
        setShowExpiringSoon(false);
        return;
      }

      if (remainingMinutes <= EXPIRING_WARNING_MINUTES && remainingMinutes > 0) {
        setExpiringMinutes(remainingMinutes);
        setShowExpiringSoon(true);
      } else {
        setShowExpiringSoon(false);
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [token, user]);

  // Session expired modal (after 401 or token expiry)
  if (showExpired) {
    return (
      <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-600" size={28} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Session Expired</h2>
          <p className="text-gray-600 mb-6">
            Your session has expired due to inactivity or for security reasons. Please login again to continue.
          </p>
          <button
            onClick={handleLogoutAndRedirect}
            className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl"
          >
            OK, Login Again
          </button>
        </div>
      </div>
    );
  }

  // Session expiring soon warning
  if (showExpiringSoon && expiringMinutes !== null) {
    return (
      <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <Clock className="text-amber-600" size={28} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Session Expiring Soon</h2>
          <p className="text-gray-600 mb-6">
            Your session will expire in about <strong>{expiringMinutes} minute{expiringMinutes !== 1 ? 's' : ''}</strong>.
            Please save your work. You will need to login again after that.
          </p>
          <button
            onClick={() => setShowExpiringSoon(false)}
            className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl"
          >
            OK, Continue
          </button>
        </div>
      </div>
    );
  }

  return null;
}
