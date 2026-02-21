# Inventory SaaS - Multi-tenant Inventory Management

Production-grade, multi-tenant Inventory Management SaaS for SMBs (India-first, global-ready).

## Architecture

- **Backend**: NestJS + Mongoose + MongoDB
- **Frontend**: React + TypeScript + Material UI + Vite
- **Multi-tenancy**: Row-level isolation (`orgId` on all collections)
- **Auth**: JWT (access token)
- **Structure**: Pabbly-style (config, models, utils, modules)

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full design.

## Quick Start

### 1. MongoDB

Use your MongoDB Atlas (or local) connection string. Copy `backend/.env.example` to `backend/.env` and set:

```
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/?retryWrites=true&w=majority
```

### 2. Backend

```bash
cd saas/backend
npm install
cp .env.example .env   # Edit if needed
npm run start:dev
```

API runs at `http://localhost:3000/api/v1`

### 3. Frontend

```bash
cd saas/frontend
npm install
npm run dev
```

App runs at `http://localhost:5174`

### 4. First Use

1. Go to **Register** - create organization + admin user
2. Login with your credentials
3. Add **Warehouses** (required for inventory)
4. Add **Items**
5. Add **Customers**
6. Create **Invoices**

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/login | Login |
| POST | /auth/register | Register org + user |
| GET | /items | List items (paginated) |
| POST | /items | Create item |
| GET | /warehouses | List warehouses |
| POST | /warehouses | Create warehouse |
| GET | /sales/customers | List customers |
| POST | /sales/customers | Create customer |
| GET | /sales/invoices | List invoices |
| POST | /sales/invoices | Create invoice |
| PUT | /sales/invoices/:id/paid | Mark invoice paid |

All endpoints (except auth) require `Authorization: Bearer <token>`.

## Modules Implemented

- [x] Multi-tenant core (org isolation)
- [x] Auth (JWT, register, login)
- [x] Inventory (items, ledger-based stock)
- [x] Warehouse
- [x] Sales (customers, invoices, payments)
- [ ] Purchase (vendors, POs)
- [ ] Shipping
- [ ] Automation engine
- [ ] Reporting (GST, exports)
- [ ] Integrations

## Environment

Copy `backend/.env.example` to `backend/.env` and configure.

## License

MIT
