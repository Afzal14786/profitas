# PROFITAS — Real Estate Liquidity Infrastructure (Backend)

> **"Property is valuable, but real‑estate investment is often illiquid. PROFITAS builds the infrastructure that makes liquidity easier."**

PROFITAS is a **real‑estate liquidity orchestration platform** that connects investors, buyers, institutional capital, lenders, and legal partners. It enables investors to access liquidity from eligible real‑estate‑linked investments through a **secondary marketplace**, an **institutional liquidity network**, or **credit against eligible assets** — without PROFITAS having to buy every asset itself.

This repository contains the **backend API** powering the PROFITAS ecosystem.

---

## 📖 Table of Contents

- [Business Context](#business-context)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Data Model](#data-model)
- [Authentication & Authorization](#authentication--authorization)
- [Seed Data](#seed-data)
- [Available Scripts](#available-scripts)
- [Roadmap & Future Work](#roadmap--future-work)
- [License](#license)

---

## Business Context

### Vision
PROFITAS is a **Real‑Estate Liquidity Infrastructure / Liquidity Network**. Its long‑term goal is to build an ecosystem connecting investors, buyers, institutional capital, lenders, property owners, legal partners, banks, and property managers.

**Positioning:** *"Fractional platforms create/access the asset. PROFITAS creates liquidity around the asset."*

### The Problem
Real‑estate‑linked investments are difficult to monetize due to:
- Limited buyers and longer exit timelines
- Valuation challenges and legal/documentation friction
- Settlement complexity and lock‑ins
- Limited secondary‑market infrastructure

**Core focus:** *"How can we make real‑estate investments easier to monetize?"*

### Three Main Liquidity Routes

| Route | Description |
|---|---|
| **A. Secondary Marketplace** | Investors can list eligible assets; buyers (investors, HNIs, funds, institutions) discover and match. |
| **B. Institutional Liquidity Network** | HNIs, funds, and institutions participate as capital providers or buyers via curated, verified opportunities. |
| **C. Credit Against Eligible Asset** | Investors retain ownership and access credit from NBFCs/lenders, secured against the asset. |

### Core Market Hypothesis
*"As real estate becomes increasingly financialised through REITs, SM‑REITs and fractional structures, there is an opportunity to build infrastructure that helps investors discover, access and obtain liquidity from real‑estate‑linked investments that are less liquid than listed securities."*

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js (ES Modules) |
| **Framework** | Express 5 |
| **Database** | PostgreSQL |
| **ORM** | Drizzle ORM |
| **Authentication** | JWT (access + refresh tokens) with `jsonwebtoken` |
| **Password Hashing** | `bcrypt` (12 salt rounds) |
| **Validation** | Zod |
| **File Storage** | Cloudinary (via `multer-storage-cloudinary`) |
| **Logging** | Pino + `pino-http` |
| **Security** | Helmet, CORS |
| **Environment** | `dotenv` |

**Dependencies** (from `package.json`)[reference:0]:
```json
{
  "bcrypt": "^6.0.0",
  "cloudinary": "^1.41.3",
  "cors": "^2.8.6",
  "dotenv": "^18.0.0",
  "drizzle-orm": "^0.45.2",
  "express": "^5.2.1",
  "helmet": "^8.3.0",
  "jsonwebtoken": "^9.0.3",
  "multer": "^2.4.0",
  "multer-storage-cloudinary": "^4.0.0",
  "pg": "^8.23.0",
  "pino": "^10.3.1",
  "pino-http": "^11.0.0",
  "zod": "^4.6.5"
}
```  

# Architecture Overview

PROFITAS follows a modular monolith pattern. Each business domain (Auth, Users, Properties, Partners, Legal & Compliance, Liquidity) is self-contained with its own validation, service, controller, and routes.  

```markdown
┌─────────────────────────────────────────────────────────┐
│  Client (React / Next.js) → REST API                     │
├─────────────────────────────────────────────────────────┤
│  Express App (app.js)                                    │
│   ├── pino-http (logging)                               │
│   ├── helmet (security headers)                         │
│   ├── cors                                              │
│   ├── express.json / urlencoded                         │
│   └── /api/v1 → Routes (index.routes.js)                │
├─────────────────────────────────────────────────────────┤
│  Modules (each: validation → service → controller)      │
│   ├── auth          ├── users          ├── organizations│
│   ├── properties    ├── partners       ├── documents    │
│   ├── verifications ├── compliance     ├── liquidity    │
│   └── dashboard                                         │
├─────────────────────────────────────────────────────────┤
│  Shared Layer                                           │
│   ├── middlewares (auth, validate, error, not-found)    │
│   ├── utils (jwt, password, api-response, app-error…)   │
│   ├── constants (roles, error-codes, http-status)       │
│   └── infra (health-check)                              │
├─────────────────────────────────────────────────────────┤
│  Database (Drizzle ORM) → PostgreSQL                    │
│  External: Cloudinary (document storage)                │
└─────────────────────────────────────────────────────────┘
```  

### Server startup (`server.js`)

- Imports `app` and environment config
- Connects to the database via `connectDatabase()`
- Starts listening on `env.PORT`
- Handles graceful shutdown on `SIGTERM` / `SIGINT`

### App setup (`app.js`)

- Applies `pino-http`, `helmet`, `cors`, body parsers
- Mounts the router at `/api/v1`
- Attaches not-found and error middleware  

---  

## Project Structure  

```markdown
profitas/
├── src/
│   ├── config/
│   │   ├── env.js            # Zod‑validated environment variables
│   │   └── logger.js         # Pino logger
│   ├── db/
│   │   ├── index.js          # Database connection + pool
│   │   ├── schema/
│   │   │   ├── index.schema.js
│   │   │   ├── enums.js
│   │   │   ├── users.schema.js
│   │   │   ├── organizations.schema.js
│   │   │   ├── organizationMembers.schema.js
│   │   │   ├── properties.schema.js
│   │   │   ├── partners.schema.js
│   │   │   ├── documents.schema.js
│   │   │   ├── verifications.schema.js
│   │   │   ├── compliance.schema.js
│   │   │   ├── liquidity.schema.js
│   │   │   └── relations.js
│   │   └── seed.js           # Database seeder (~1600 rows)
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.validation.js
│   │   │   └── auth.constants.js
│   │   ├── users/
│   │   ├── organizations/
│   │   ├── properties/
│   │   ├── partners/
│   │   ├── documents/
│   │   ├── verifications/
│   │   ├── compliance/
│   │   ├── liquidity/
│   │   └── dashboard/
│   ├── shared/
│   │   ├── constants/
│   │   │   ├── http-status.js
│   │   │   ├── error-codes.js
│   │   │   └── roles.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   ├── validate.middleware.js
│   │   │   └── not-found.middleware.js
│   │   ├── utils/
│   │   │   ├── app-error.js
│   │   │   ├── async-handler.js
│   │   │   ├── api-response.js
│   │   │   ├── jwt.js
│   │   │   └── password.js
│   │   └── infra/
│   │       └── health-check.js
│   ├── routes/
│   │   └── index.routes.js
│   ├── app.js
│   └── server.js
├── drizzle/                  # Generated migrations
├── .env
├── .env.example
├── .gitignore
├── drizzle.config.js
├── package.json
├── package-lock.json
└── README.md
```  

---  

# Getting Started

## Prerequisites

- Node.js ≥ 18 (ES modules)
- PostgreSQL ≥ 14
- Cloudinary account (for document upload)
- npm or yarn  

## 1. Clone the Repository  

```bash
git clone https://github.com/Afzal14786/profitas.git
cd profitas
```  

## 2. Install Dependencies  

```bash
npm install
```  

## 3. Configure Environment Variables  
Create a `.env` file from `.env.example:`

```bash
cp .env.example .env
```  

Edit `.env` with your credentials:  
```env
PORT=8000
DATABASE_URL=postgresql://postgres:password@localhost:5432/profitas
NODE_ENV=development

# JWT
JWT_SECRET=your_access_secret
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRATION=7d

# Database pool
DB_POOL_MAX=50

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=profitas/documents
```  

> **Note:** Environment variables are validated at startup by Zod (`src/config/env.js`). The server will not start if required values are missing.  

## 4. Set Up the Database  

Create a PostgreSQL database named `profitas`, then run:  

```bash
# Generate migration files from schema
npm run db:generate

# Apply migrations to the database
npm run db:migrate

# (Alternative) Push schema directly without migration files
npm run db:push
```  

## 5. Seed the Database (Optional but Recommended)  
Populate the database with realistic demo data:  

```bash
npm run db:seed
```  

This creates:

- 250 users (1 admin + 249 investors)
- 60 organizations (30 owners, 10 developers, 20 partners)
- 120 organization memberships
- 200 properties (various statuses)
- 20 partners (banks, NBFCs, institutions, platforms, legal, managers)
- 300 documents
- 250 verifications
- 150 compliance records
- 100 liquidity requests
- ~55 listings + ~125 offers
- ~45 credit applications

Default credentials after seeding:

- Admin: `admin@profitas.dev` / `Password123`
- Users: `user1@profitas.dev` … `user249@profitas.dev` / `Password123`  

## 6. Start the Server  

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```  
The API will be available at `http://localhost:8000/api/v1`.  

**Health check:**  

```bash
curl http://localhost:8000/api/v1/health
```  

---  

# API Documentation  
All routes are prefixed with `/api/v1`.  

## 🔐 Auth (`/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Register a new user |
| POST | `/auth/login` | Public | Login and receive tokens |
| POST | `/auth/refresh` | Public | Refresh access token |

## 👥 Users (`/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/me` | Any | Get own profile |
| PATCH | `/users/me` | Any | Update own profile |
| PATCH | `/users/me/password` | Any | Change password |
| GET | `/users` | Admin | List all users (with filters) |
| GET | `/users/stats` | Admin | Get user statistics |
| GET | `/users/:id` | Admin | Get user by ID |
| PATCH | `/users/:id` | Admin | Update user |
| PATCH | `/users/:id/activate` | Admin | Reactivate user |
| DELETE | `/users/:id` | Admin | Deactivate user (soft delete) |

## 🏢 Organizations (`/organizations`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/organizations` | Any | Create organization |
| GET | `/organizations/me` | Any | List my organizations |
| GET | `/organizations` | Admin | List all organizations |
| GET | `/organizations/:id` | Member/Admin | Get organization details |
| PATCH | `/organizations/:id` | Owner/Admin | Update organization |
| POST | `/organizations/:id/members` | Owner/Admin | Add member |
| GET | `/organizations/:id/members` | Member/Admin | List members |
| DELETE | `/organizations/:id/members/:userId` | Owner/Admin | Remove member |

## 🏠 Properties (`/properties`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/properties` | Owner/Admin | Create property |
| GET | `/properties` | Any | List properties (filterable) |
| GET | `/properties/:id` | Any | Get property details |
| PATCH | `/properties/:id` | Owner/Admin | Update property |
| DELETE | `/properties/:id` | Owner/Admin | Archive property |
| PATCH | `/properties/:id/status` | Admin | Update property status |

## 🤝 Partners (`/partners`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/partners` | Admin | Create partner |
| GET | `/partners` | Any | List partners (filterable) |
| GET | `/partners/:id` | Any | Get partner details |
| PATCH | `/partners/:id` | Admin | Update partner |
| DELETE | `/partners/:id` | Admin | Deactivate partner |

## 📄 Documents (`/documents`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/documents` | Owner/Admin | Upload document (multipart) |
| GET | `/documents` | Any | List documents (filterable) |
| GET | `/documents/:id` | Any | Get document details |
| DELETE | `/documents/:id` | Uploader/Admin | Delete document |

## ⚖️ Verifications (`/verifications`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/verifications` | Admin | Create verification |
| GET | `/verifications` | Any | List verifications (filterable) |
| GET | `/verifications/:id` | Any | Get verification details |
| PATCH | `/verifications/:id` | Admin | Update verification |

## 📋 Compliance (`/compliance`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/compliance` | Admin | Create compliance record |
| GET | `/compliance` | Any | List compliance records |
| GET | `/compliance/stats` | Admin | Get compliance statistics |
| GET | `/compliance/:id` | Any | Get compliance record |
| PATCH | `/compliance/:id` | Admin | Update compliance record |

## 💧 Liquidity (`/liquidity`)

### Requests

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/liquidity/requests` | Investor | Create liquidity request |
| GET | `/liquidity/requests` | Own/Admin | List liquidity requests |
| GET | `/liquidity/requests/:id` | Owner/Admin | Get request details |
| PATCH | `/liquidity/requests/:id/status` | Owner/Admin | Update request status |

### Listings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/liquidity/listings` | Request Owner | Create listing |
| GET | `/liquidity/listings` | Any | List listings |
| GET | `/liquidity/listings/:id` | Any | Get listing details |
| GET | `/liquidity/listings/:id/offers` | Any | List offers on a listing |

### Offers

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/liquidity/listings/:listingId/offers` | Buyer | Make an offer |
| PATCH | `/liquidity/offers/:id` | Seller/Admin | Accept or reject offer |

### Credit Applications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/liquidity/credit-applications` | Investor | Create credit application |
| GET | `/liquidity/credit-applications` | Own/Admin | List credit applications |
| PATCH | `/liquidity/credit-applications/:id/route` | Admin | Route to lender |
| PATCH | `/liquidity/credit-applications/:id/status` | Admin | Update credit status |

## 📊 Dashboard (`/dashboard`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dashboard/summary` | Any | Get ecosystem summary counts |
| GET | `/dashboard/properties` | Any | Get property cards for dashboard |

## 🩺 Health (`/health`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | Public | Health check (DB connectivity) |  

---  

# Data Model

The database schema is defined in `src/db/schema/` using Drizzle ORM. All tables use UUID primary keys with `gen_random_uuid()`.

## Core Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | Platform users (investors, admins) | `id`, `name`, `email`, `password_hash`, `role`, `is_active` |
| `organizations` | Property owners, developers, partners | `id`, `name`, `type`, `email`, `is_active` |
| `organization_members` | Many-to-many user ↔ organization | `organization_id`, `user_id`, `role_in_org` |
| `properties` | Real-estate assets | `id`, `name`, `location`, `value`, `rental_yield`, `status` |
| `partners` | Banks, NBFCs, institutions, platforms | `id`, `partner_type`, `contact_person`, `services` |
| `documents` | Uploaded legal/ownership docs | `id`, `property_id`, `document_type`, `cloudinary_url` |
| `verifications` | Legal verification records | `id`, `property_id`, `verification_type`, `status` |
| `compliance_records` | Compliance checks | `id`, `property_id`, `compliance_type`, `status` |
| `liquidity_requests` | Parent liquidity request | `id`, `property_id`, `liquidity_type`, `status` |
| `listings` | Sell/Match listings | `id`, `liquidity_request_id`, `asking_price`, `status` |
| `offers` | Buyer offers on listings | `id`, `listing_id`, `buyer_id`, `amount`, `status` |
| `credit_applications` | Get Credit applications | `id`, `liquidity_request_id`, `requested_amount`, `status` |

## Enums

All enums are defined in `src/db/schema/enums.js`:

- `user_role`: `user`, `admin`
- `organization_type`: `property_owner`, `property_developer`, `partner`
- `property_status`: `draft`, `pending_verification`, `verified`, `rejected`, `archived`
- `property_type`: `commercial`, `office`, `retail`, `industrial`, `residential`, `mixed_use`
- `partner_type`: `bank`, `nbfc`, `institution`, `property_platform`, `legal_advocate`, `property_manager`
- `document_type`: `title`, `ownership`, `encumbrance`, `sale_agreement`, `lease`, `investment_agreement`, `collateral`, `compliance`, `other`
- `verification_type`: `title`, `ownership`, `encumbrance`, `dispute`
- `compliance_type`: `regulatory`, `documentation`, `disclosure`
- `liquidity_type`: `sell_match`, `get_credit`
- `listing_status`: `active`, `matched`, `closed`, `cancelled`
- `offer_status`: `pending`, `accepted`, `rejected`, `withdrawn`
- `credit_application_status`: `requested`, `routed`, `approved`, `rejected`, `disbursed`

## Relations

Defined in `src/db/schema/relations.js`. Key relationships:

- `User` → many `OrganizationMembers`, `Properties`, `Documents`, `LiquidityRequests`, `Offers`, `CreditApplications`
- `Organization` → many `Members`, `Properties`, `Partners`
- `Property` → many `Documents`, `Verifications`, `ComplianceRecords`, `LiquidityRequests`
- `LiquidityRequest` → one `Listing` / one `CreditApplication`; many `Offers` via `Listing`  

---  

# Authentication & Authorization

## JWT Flow

- Register/Login → server returns `accessToken` (short-lived) and `refreshToken` (long-lived).
- Client stores tokens and sends `Authorization: Bearer <accessToken>` on every request.
- On 401, client calls `POST /auth/refresh` with the refresh token to get a new access token.
- If refresh fails, the user is logged out.

## Middleware

- `authenticate` — verifies JWT, attaches `req.user = { id, role }`.
- `authorize(ROLES.ADMIN)` — gates admin-only routes.
- `validate(schema, source)` — Zod validation on body, query, or params.

## Roles

| Role | Permissions |
|------|-------------|
| `user` | Self-service (profile, own properties, liquidity requests, offers) |
| `admin` | Full access: user management, partners, verifications, compliance, credit routing, property status flips |

> **Note:** The MVP uses two roles. Ecosystem actors like "legal advocate" and "compliance officer" are represented by the admin in the prototype. Future versions will expand role granularity.  

## Seed Data  

The seed script (`src/db/seed.js`) populates the database with realistic demo data. It uses `TRUNCATE … CASCADE` to reset all tables first, so it's safe to re‑run.  

**Run:**  

```bash
npm run db:seed
```  

**Default Credentials**

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@profitas.dev` | `Password123` |
| Investor | `user1@profitas.dev` … `user249@profitas.dev` | `Password123` |

**Data Volumes (approximate)**

- Users: 250
- Organizations: 60 (30 owners, 10 developers, 20 partners)
- Organization memberships: 120
- Properties: 200
- Partners: 20
- Documents: 300
- Verifications: 250
- Compliance records: 150
- Liquidity requests: 100
- Listings: ~55
- Offers: ~125
- Credit applications: ~45

# Available Scripts**

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `nodemon ./src/server.js` | Start dev server with hot reload |
| `start` | `node ./src/server.js` | Start production server |
| `db:generate` | `drizzle-kit generate` | Generate SQL migrations from schema |
| `db:migrate` | `drizzle-kit migrate` | Apply migrations to database |
| `db:push` | `drizzle-kit push` | Push schema directly (dev only) |
| `db:seed` | `node src/db/seed.js` | Seed database with demo data |

---  

# Roadmap & Future Work

## Phase 1 — MVP (Current)

- ✅ Auth (register, login, refresh)
- ✅ User management (profile, admin CRUD)
- ✅ Organizations & memberships
- ✅ Properties CRUD with status workflow
- ✅ Partners management
- ✅ Documents (Cloudinary upload)
- ✅ Verifications & Compliance
- ✅ Liquidity (requests, listings, offers, credit applications)
- ✅ Dashboard aggregations

## Phase 2 — Next Steps

- 🔲 Expand role granularity (Investor, Buyer, Legal Advocate, Compliance Officer as distinct roles)
- 🔲 Real-time notifications (WebSockets / SSE)
- 🔲 Advanced search & filtering (full-text search on properties)
- 🔲 Automated valuation integration
- 🔲 KYC/AML provider integration
- 🔲 Blockchain-based ownership registry (exploratory)

## Phase 3 — Scale

- 🔲 Microservices extraction for Liquidity and Credit modules
- 🔲 Event-driven architecture (Kafka / RabbitMQ)
- 🔲 Multi-region deployment
- 🔲 Institutional investor portal

## Known Limitations (MVP)

- No actual payment processing or settlement
- No live NBFC/lender API integration
- No automated KYC or document verification
- No blockchain
- Guaranteed buyback is intentionally excluded from the core model (balance-sheet risk)

## License

ISC — see `package.json` for details.

## Author

Md Afzal Ansari — [GitHub](https://github.com/Afzal14786)

> PROFITAS — Real-estate liquidity infrastructure that connects investors with buyers, institutional capital and credit providers so they can access liquidity from eligible real-estate-linked investments without PROFITAS having to buy every asset itself.