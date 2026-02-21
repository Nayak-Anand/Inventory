# Inventory Backend API

NestJS + MongoDB backend for B2B Inventory Management.

## Structure

```
src/
├── common/           # Shared decorators
│   └── decorators/   # @CurrentOrg()
├── config/           # DB config
├── models/           # Mongoose schemas
│   ├── organization.schema.ts
│   ├── user.schema.ts
│   ├── item.schema.ts
│   ├── customer.schema.ts
│   ├── supplier.schema.ts
│   ├── invoice.schema.ts
│   ├── warehouse.schema.ts
│   └── ...
└── modules/
    ├── auth/         # Login, Register
    ├── tenant/       # Settings (org)
    ├── inventory/    # Items, Stock
    ├── sales/        # Customers, Invoices
    ├── supplier/     # Suppliers
    └── warehouse/    # Warehouses
```

## Commands

```bash
npm run start:dev   # Dev with watch
npm run build       # Build
npm run start:prod  # Production
```

## Environment

- `MONGODB_URI` - MongoDB Atlas URI
- `JWT_SECRET` - JWT secret
- `CORS_ORIGIN` - Frontend URL (e.g. http://localhost:5173)
