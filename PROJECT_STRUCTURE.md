# B2B Inventory - Project Structure

## Overview

```
Inventory/
├── src/                          # Frontend (React + Vite)
├── saas/backend/                 # Backend API (NestJS + MongoDB)
├── README.md                     # Quick start guide
└── PROJECT_STRUCTURE.md          # This file
```

---

## Frontend (`d:\Inventory\src`)

| Folder/File | Purpose |
|-------------|---------|
| `api/client.js` | Axios instance, JWT interceptor, baseURL `/api/v1` |
| `context/AuthContext.jsx` | Login, Register, token, logout |
| `context/StoreContext.jsx` | Products, Customers, Suppliers, Invoices, Settings (API calls) |
| `components/Layout.jsx` | Sidebar, header, logout |
| `components/InvoicePrint.jsx` | Invoice print/PDF layout |
| `pages/Login.jsx` | Login form |
| `pages/Register.jsx` | Registration form |
| `pages/Dashboard.jsx` | Dashboard stats |
| `pages/Products.jsx` | Products CRUD |
| `pages/Customers.jsx` | Customers CRUD |
| `pages/Suppliers.jsx` | Suppliers CRUD |
| `pages/Invoices.jsx` | Invoice list, mark paid |
| `pages/CreateInvoice.jsx` | Create invoice |
| `pages/Reports.jsx` | Revenue, top products |
| `pages/Settings.jsx` | Business name, logo, GSTIN |

---

## Backend (`d:\Inventory\saas\backend\src`)

| Module | Purpose |
|--------|---------|
| `auth` | Login, Register, JWT |
| `tenant` | Org settings (GET/PUT) |
| `inventory` | Items CRUD, stock |
| `sales` | Customers, Invoices |
| `supplier` | Suppliers CRUD |
| `warehouse` | Warehouses CRUD |

---

## Run Order

1. **Backend first:** `cd saas/backend && npm run start:dev`
2. **Frontend:** `cd d:\Inventory && npm run dev`
3. Open: http://localhost:5173
