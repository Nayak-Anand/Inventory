# Inventory SaaS - Architecture Document

## System Overview

Multi-tenant Inventory Management for SMBs (India-first).  
**Frontend:** Root app (`d:\Inventory`) - React + Vite + Tailwind  
**Backend:** `d:\Inventory\saas\backend` - NestJS + MongoDB

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  React + Vite + Tailwind (d:\Inventory\src)                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ REST / JWT
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                     │
│  NestJS - Rate limiting, CORS, Request validation                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MULTI-TENANT MIDDLEWARE                              │
│  org_id extraction (JWT/subdomain/header) → TenantContext                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Auth Module    │    │  Inventory      │    │  Sales Module   │
│  JWT + Refresh  │    │  Ledger-based   │    │  Orders, Invoices│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SHARED SERVICES                                      │
│  TenantService, AuditService, IdempotencyService, EventBus                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  MongoDB        │    │  Redis (opt)    │    │  S3 / MinIO     │
│  (Mongoose)     │    │  Cache + Queue  │    │  (Documents)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Multi-Tenancy Strategy

- **Row-level isolation**: Every collection has `orgId` (string, ref to organizations)
- **Tenant context**: Injected via `@CurrentOrg()` decorator
- **Database**: MongoDB Atlas / single cluster, orgId on all documents
- **Structure**: Pabbly-style — `config/`, `models/`, `utils/`, `modules/`

## Module Dependency Graph

```
Core (Tenant, User, Role)
    │
    ├── Auth ─────────────────────────────────────────────────┐
    │                                                          │
    ├── Inventory ──┬── Sales                                  │
    │               ├── Purchase                               │
    │               ├── Warehouse                              ├── All Modules
    │               └── Shipping                               │
    │                                                          │
    ├── Automation Engine (Rules) ─────────────────────────────┤
    │                                                          │
    └── Reporting (Read models, aggregates) ───────────────────┘
```

## Database (MongoDB) — Collections

### Organizations & Users
- **organizations**: name, slug, settings, gstin, address, stateCode
- **users**: orgId, email, passwordHash, name, roleId, isActive
- **roles**: orgId, name, permissions[]

### Inventory
- **items**: orgId, type, name, sku, description, category, price, hsnCode, reorderLevel, attributes
- **inventory_ledger**: orgId, warehouseId, itemId, quantity, type, refType, refId
- **warehouses**: orgId, name, address, code, isActive

### Sales
- **customers**: orgId, name, email, phone, address, gstin, placeOfSupply, stateCode
- **invoices**: orgId, invoiceNumber, customerId, date, dueDate, status, paymentStatus, gstType, subtotal, cgst, sgst, igst, grandTotal, lines[]

## API Design Principles

- RESTful, plural nouns: `/api/v1/items`, `/api/v1/invoices`
- Idempotency: `Idempotency-Key` header for POST/PUT
- Pagination: `?page=1&limit=20&sort=-created_at`
- Filtering: `?status=pending&customer_id=xxx`
- Bulk: `POST /api/v1/items/bulk` with array body

## Security

- JWT access token (15m) + Refresh token (7d, stored in DB)
- Password: bcrypt, min 8 chars
- RBAC: permissions as `module.action` (e.g., `inventory.create`)
- Audit: All mutations logged with user, org, timestamp

## Scalability

- Stateless API servers (horizontal scale)
- Redis for session/cache
- BullMQ for async jobs (stock sync, reports, webhooks)
- Read replicas for reporting queries (future)
