# B2B Inventory Management

Multi-tenant inventory, billing & GST management for SMBs (India-focused).

## Project Structure

```
d:\Inventory\
├── src/                    # Frontend (React + Vite + Tailwind)
│   ├── api/               # API client (axios)
│   ├── components/        # Reusable components
│   ├── context/           # AuthContext, StoreContext
│   ├── pages/             # Dashboard, Products, Customers, etc.
│   └── ...
├── saas/
│   └── backend/           # NestJS API (MongoDB)
│       ├── src/
│       │   ├── common/    # Decorators, guards
│       │   ├── config/    # DB config
│       │   ├── models/    # Mongoose schemas
│       │   └── modules/   # Auth, Items, Sales, Suppliers, etc.
│       └── .env
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Quick Start

### 1. Backend (API Server)

```powershell
cd d:\Inventory\saas\backend
npm install
npm run start:dev
```

Runs on **http://localhost:3000** (API prefix: `/api/v1`)

### 2. Frontend (Root App)

```powershell
cd d:\Inventory
npm install
npm run dev
```

Runs on **http://localhost:5173**

### 3. First Time

1. Open **http://localhost:5173/register**
2. Create account (Org Name, Org Slug, Email, Password)
3. Login → **http://localhost:5173/login**
4. Add Products, Customers, Suppliers → Create Invoices

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | React 19, Vite 7, Tailwind CSS, React Router |
| Backend | NestJS, MongoDB (Mongoose), JWT |
| API | REST, `/api/v1` prefix |

## Environment

**Backend** (`saas/backend/.env`):
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `CORS_ORIGIN` - http://localhost:5173

## API Endpoints

| Module | Endpoints |
|--------|-----------|
| Auth | POST `/auth/login`, POST `/auth/register` |
| Items | GET/POST `/items`, PUT/DELETE `/items/:id` |
| Categories | GET/POST `/categories`, PUT/DELETE `/categories/:id` |
| Customers | GET/POST `/sales/customers`, PUT/DELETE `/sales/customers/:id` |
| Suppliers | GET/POST `/suppliers`, PUT/DELETE `/suppliers/:id` |
| Orders | GET/POST `/orders`, POST `/orders/:id/approve`, POST `/orders/:id/reject` |
| Invoices | GET/POST `/sales/invoices`, PUT `/sales/invoices/:id/paid` |
| Warehouses | GET/POST `/warehouses` |
| Settings | GET/PUT `/settings` |
| Roles | GET `/roles`, POST `/roles/seed` |
| Subscription | GET `/subscription-plans`, POST `/subscription-plans/seed` |

## Data Flow

- All data → MongoDB (via backend)
- No localStorage for business data (only JWT token)
- Auth: JWT in `Authorization` header
