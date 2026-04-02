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
  Menu,
  X,
  ShoppingCart,
  UserCircle2,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProfileDropdown from './ProfileDropdown';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['company_admin', 'salesman', 'b2b_customer'] },
  { path: '/products', icon: Package, label: 'Products', roles: ['company_admin', 'salesman', 'b2b_customer'] },
  { path: '/customers', icon: Users, label: 'Customers', roles: ['company_admin', 'salesman'] },
  { path: '/suppliers', icon: Truck, label: 'Suppliers', roles: ['company_admin'] },
  { path: '/orders', icon: ShoppingCart, label: 'Orders', roles: ['company_admin', 'salesman', 'b2b_customer'] },
  { path: '/invoices', icon: FileText, label: 'Invoices', roles: ['company_admin', 'salesman', 'b2b_customer'] },
  { path: '/reports', icon: BarChart3, label: 'Reports', roles: ['company_admin', 'salesman'] },
  { path: '/team-members', icon: UserCircle2, label: 'Team', roles: ['company_admin'] },
  { path: '/help', icon: HelpCircle, label: 'Help', roles: ['company_admin', 'salesman', 'b2b_customer'] },
];

const pageMeta = [
  { match: (pathname) => pathname === '/', title: 'Dashboard' },
  {
    match: (pathname) => pathname === '/products/categories',
    title: 'Categories',
    subtitle: 'Manage product categories from this page.',
  },
  { match: (pathname) => pathname.startsWith('/products'), title: 'Products' },
  { match: (pathname) => pathname.startsWith('/customers'), title: 'Customers' },
  { match: (pathname) => pathname.startsWith('/suppliers'), title: 'Suppliers' },
  {
    match: (pathname) => pathname.startsWith('/orders'),
    title: 'Orders',
    subtitle: 'Approve orders to auto-create invoices.',
  },
  {
    match: (pathname) => pathname === '/invoices/create',
    title: 'Create Invoice',
    subtitle: 'Create a new invoice and print or save it.',
  },
  { match: (pathname) => pathname.startsWith('/invoices'), title: 'Invoices' },
  { match: (pathname) => pathname.startsWith('/reports'), title: 'Reports' },
  {
    match: (pathname) => pathname === '/team-members/performance',
    title: 'Salesman Performance',
    subtitle: 'Review sales performance by team member.',
  },
  { match: (pathname) => pathname.startsWith('/team-members'), title: 'Team Members' },
  {
    match: (pathname) => pathname.startsWith('/settings'),
    title: 'Business Settings',
    subtitle: 'This information will appear on your invoices.',
  },
  {
    match: (pathname) => pathname.startsWith('/help'),
    title: 'Help',
    subtitle: 'How to use each page. If you face any issues, check this page.',
  },
];

function getPageMeta(pathname) {
  return pageMeta.find((entry) => entry.match(pathname)) || {};
}

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const currentPage = getPageMeta(location.pathname);
  const currentNavLabel = navItems.find((n) => n.path === location.pathname)?.label;
  const pageTitle = currentPage.title || currentNavLabel || 'B2B Inventory';

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
        className={`fixed lg:static inset-y-0 left-0 z-50 ${
          sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
        } w-64 bg-white shadow-lg transform transition-all duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
              <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'flex-col items-center gap-1'}`}>
                <img
                  src="/logo/b2b-inventory-with-name.png"
                  alt="B2B Inventory"
                  className={sidebarCollapsed ? 'h-10 w-10 object-contain' : 'h-20 w-auto object-contain'}
                />
                {!sidebarCollapsed && <span className="sr-only">B2B Inventory</span>}
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>
          </div>
          <nav className={`flex-1 p-3 space-y-1 overflow-y-auto ${sidebarCollapsed ? 'lg:px-2' : ''}`}>
            {navItems
              .filter((item) => !user?.roleType || item.roles.includes(user.roleType))
              .map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  sidebarCollapsed ? 'lg:justify-center lg:px-3' : ''
                } ${
                  location.pathname === path ||
                  (path === '/products' && location.pathname.startsWith('/products')) ||
                  (path === '/invoices' && location.pathname.startsWith('/invoices')) ||
                  (path === '/team-members' && location.pathname.startsWith('/team-members'))
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={sidebarCollapsed ? label : undefined}
              >
                <Icon size={22} />
                <span className={`font-medium ${sidebarCollapsed ? 'lg:hidden' : ''}`}>{label}</span>
              </Link>
            ))}
          </nav>
          <div className="p-3 border-t">
            <button
              type="button"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              className={`hidden lg:flex items-center justify-center gap-2 w-full rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors ${
                sidebarCollapsed ? 'py-3' : 'py-2.5'
              }`}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              <span className={sidebarCollapsed ? 'hidden' : 'text-sm font-medium'}>Collapse sidebar</span>
            </button>
          </div>
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
            <div className="min-w-0">
              <h2 className="font-semibold text-gray-800 truncate">{pageTitle}</h2>
              {currentPage.subtitle && (
                <p className="text-xs text-gray-500 truncate">{currentPage.subtitle}</p>
              )}
            </div>
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
