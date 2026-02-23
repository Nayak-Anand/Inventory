import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import SessionTimeoutModal from './components/SessionTimeoutModal';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Invoices from './pages/Invoices';
import Orders from './pages/Orders';
import TeamMembers from './pages/TeamMembers';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Help from './pages/Help';

const pathRoles = {
  '/': ['company_admin', 'salesman', 'b2b_customer'],
  '/products': ['company_admin', 'salesman', 'b2b_customer'],
  '/products/categories': ['company_admin'],
  '/customers': ['company_admin', 'salesman'],
  '/suppliers': ['company_admin'],
  '/orders': ['company_admin', 'salesman', 'b2b_customer'],
  '/invoices': ['company_admin', 'salesman', 'b2b_customer'],
  '/invoices/create': ['company_admin'],
  '/reports': ['company_admin', 'salesman'],
  '/team-members': ['company_admin'],
  '/team-members/performance': ['company_admin'],
  '/settings': ['company_admin'],
  '/help': ['company_admin', 'salesman', 'b2b_customer'],
};

function PrivateRoute({ children }) {
  const { token, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const roleType = user?.roleType || 'company_admin';
  const allowed = pathRoles[location.pathname];
  if (allowed && !allowed.includes(roleType)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <StoreProvider>
          <ToastProvider>
            <BrowserRouter>
              <SessionTimeoutModal />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/*"
                  element={
                    <PrivateRoute>
                      <Layout>
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/products" element={<Products />} />
                          <Route path="/products/categories" element={<Products />} />
                          <Route path="/customers" element={<Customers />} />
                          <Route path="/suppliers" element={<Suppliers />} />
                          <Route path="/orders" element={<Orders />} />
                          <Route path="/invoices" element={<Invoices />} />
                          <Route path="/invoices/create" element={<Invoices />} />
                          <Route path="/team-members" element={<TeamMembers />} />
                          <Route path="/team-members/performance" element={<TeamMembers />} />
                          <Route path="/reports" element={<Reports />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/help" element={<Help />} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </Layout>
                    </PrivateRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </StoreProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
