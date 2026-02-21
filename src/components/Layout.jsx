import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  FileText,
  Receipt,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  FolderOpen,
  ShoppingCart,
  UserCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProfileDropdown from './ProfileDropdown';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['company_admin', 'salesman', 'b2b_customer'] },
  { path: '/products', icon: Package, label: 'Products', roles: ['company_admin', 'salesman', 'b2b_customer'] },
  { path: '/categories', icon: FolderOpen, label: 'Categories', roles: ['company_admin'] },
  { path: '/customers', icon: Users, label: 'Customers', roles: ['company_admin', 'salesman'] },
  { path: '/suppliers', icon: Truck, label: 'Suppliers', roles: ['company_admin'] },
  { path: '/orders', icon: ShoppingCart, label: 'Orders', roles: ['company_admin', 'salesman', 'b2b_customer'] },
  { path: '/create-order', icon: ShoppingCart, label: 'Create Order', roles: ['company_admin', 'salesman', 'b2b_customer'] },
  { path: '/create-invoice', icon: Receipt, label: 'Create Bill', roles: ['company_admin'] },
  { path: '/invoices', icon: FileText, label: 'Invoices', roles: ['company_admin', 'salesman', 'b2b_customer'] },
  { path: '/reports', icon: BarChart3, label: 'Reports', roles: ['company_admin', 'salesman'] },
  { path: '/team-members', icon: UserCircle2, label: 'Team', roles: ['company_admin'] },
  { path: '/salesman-performance', icon: BarChart3, label: 'Salesman Performance', roles: ['company_admin'] },
  { path: '/settings', icon: Settings, label: 'Settings', roles: ['company_admin'] },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center gap-1">
                <img src="/logo/b2b-inventory-with-name.png" alt="B2B Inventory" className="h-20 w-auto object-contain" />
                {/* <span className="font-bold text-xl text-primary-600">B2B Inventory</span> */}
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>
            {user && (
              <div className="mt-3 flex items-center gap-2 px-2 py-2 rounded-lg bg-gray-50">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                ) : (
                  <UserCircle2 size={40} className="text-primary-500 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            )}
          </div>
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems
              .filter((item) => !user?.roleType || item.roles.includes(user.roleType))
              .map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === path
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={22} />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 w-full mt-4"
            >
              <LogOut size={22} />
              <span className="font-medium">Logout</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 shrink-0"
            >
              <Menu size={24} />
            </button>
            <h2 className="font-semibold text-gray-800 truncate">
              {navItems.find((n) => n.path === location.pathname)?.label || 'B2B Inventory'}
            </h2>
          </div>
          {user && (
            <div className="flex shrink-0">
              <ProfileDropdown />
            </div>
          )}
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto pb-20 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
