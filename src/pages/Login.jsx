import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { X } from 'lucide-react';

export default function Login() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOrgSlug, setForgotOrgSlug] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [resetTokenReceived, setResetTokenReceived] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (token) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [token, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(mobile, password, orgSlug || undefined);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Invalid credentials';
      setError(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', {
        identifier: forgotIdentifier,
        orgSlug: forgotOrgSlug || undefined,
      });
      setForgotSuccess(data.message);
      if (data.resetToken) {
        setResetTokenReceived(data.resetToken);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to process request';
      setForgotError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters long');
      return;
    }
    setForgotError('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        resetToken: resetToken || resetTokenReceived,
        newPassword,
      });
      setForgotSuccess('Password reset successfully! You can now login.');
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetTokenReceived('');
        setResetToken('');
        setNewPassword('');
        setConfirmPassword('');
        setForgotIdentifier('');
        setForgotOrgSlug('');
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to reset password';
      setForgotError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          {/* <h1 className="text-2xl font-bold text-gray-800 mb-2">B2B Inventory</h1>
          <p className="text-gray-500 mb-6">Sign in to your account</p> */}

          <img src="/logo/b2b-inventory-with-name.png" alt="B2B Inventory" className="h-20 w-auto object-contain" />

          <h1 className="text-1xl font-bold text-gray-500 mb-5">Sign in to your account</h1>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number or Email</label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Mobile number or email address"
              />
              <p className="text-xs text-gray-500 mt-1">Old accounts: Use your email. New accounts: Use mobile number.</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">Forgot password is only available for company admin accounts.</p>

            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Org Slug (optional)</label>
              <input
                type="text"
                value={orgSlug}
                onChange={(e) => setOrgSlug(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g. mycompany"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
            >
              Login
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Forgot Password</h2>
                <p className="text-xs text-gray-500 mt-1">Only available for company admin accounts</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotError('');
                  setForgotSuccess('');
                  setResetTokenReceived('');
                  setResetToken('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setForgotIdentifier('');
                  setForgotOrgSlug('');
                }}
                className="p-1 rounded hover:bg-gray-100 text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            {!resetTokenReceived && !resetToken ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {forgotError && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                    {forgotError}
                  </div>
                )}
                {forgotSuccess && (
                  <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm">
                    {forgotSuccess}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number or Email
                  </label>
                  <input
                    type="text"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your mobile or email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Org Slug (optional)
                  </label>
                  <input
                    type="text"
                    value={forgotOrgSlug}
                    onChange={(e) => setForgotOrgSlug(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g. mycompany"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-70"
                >
                  {loading ? 'Processing...' : 'Generate Reset Token'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {forgotError && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                    {forgotError}
                  </div>
                )}
                {forgotSuccess && (
                  <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm">
                    {forgotSuccess}
                  </div>
                )}
                {resetTokenReceived && (
                  <div className="p-3 rounded-lg bg-blue-50 text-blue-700 text-sm">
                    <p className="font-semibold">Your Reset Token:</p>
                    <p className="text-lg font-mono mt-1">{resetTokenReceived}</p>
                    <p className="text-xs mt-1">This token is valid for 1 hour. Use it below to reset your password.</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reset Token
                  </label>
                  <input
                    type="text"
                    value={resetToken || resetTokenReceived}
                    onChange={(e) => setResetToken(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter 6-digit reset token"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Minimum 6 characters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Confirm your new password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-70"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
