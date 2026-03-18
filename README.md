# SkyCharter

Role-based charter flight booking system — full-stack monorepo (npm workspaces).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, DaisyUI, Recharts, TanStack Query |
| Backend | Node.js, Express, TypeScript, Prisma ORM |
| Database | SQLite (dev) → PostgreSQL (production-ready) |
| Auth | JWT + bcrypt |
| Shared | Zod schemas in `packages/shared-types` |

---

## Project Structure

```
skycharter/
├── apps/
│   ├── frontend/          React + Vite app (port 5173)
│   └── backend/           Express API (port 3001)
├── packages/
│   ├── database/          Prisma schema, migrations, seed
│   └── shared-types/      Zod schemas + TypeScript interfaces
└── package.json           npm workspaces root
```

---

## First-Time Setup

```bash
# 1. Copy environment files
cp packages/database/.env.example packages/database/.env
cp apps/backend/.env.example apps/backend/.env

# 2. Install all dependencies
npm install

# 3. Generate Prisma client
npm run db:generate

# 4. Push schema to SQLite
npm run db:push

# 5. Seed demo data
npm run db:seed

# 6. Start both servers
npm run dev
```

Servers:
- Frontend → http://localhost:5173
- Backend  → http://localhost:3001
- API health check → http://localhost:3001/api/health

---

## User Roles

| Role | Permissions |
|---|---|
| `ADMIN` | Full access — all users, all planes, all bookings |
| `AIRLINE` | Create/manage own planes, accept/reject bookings on own planes |
| `BOOKING` | Browse planes, create bookings, view own bookings only |

---

## Seed Accounts

### Admin

| Name | Email | Password |
|---|---|---|
| Admin User | admin@skycharter.com | `admin123` |

---

### Airline Users — password: `airline123`

| Name | Email |
|---|---|
| SkyJet Airlines | ops@skyjet.com |
| Apex Air | ops@apexair.com |
| Nimbus Charter | ops@nimbusair.com |
| Cirrus Executive | ops@cirrusexec.com |
| Meridian Flights | ops@meridianflights.com |

---

### Booking Users — password: `booking123`

| Name | Email |
|---|---|
| Alice Hartwell | alice@example.com |
| Bob Mercer | bob@example.com |
| Carol Driscoll | carol@example.com |
| David Okafor | david@example.com |
| Eva Steinberg | eva@example.com |
| Frank Liu | frank@example.com |
| Grace Patel | grace@example.com |
| Henry Johansson | henry@example.com |
| Isla McKenna | isla@example.com |
| James Okonkwo | james@example.com |
| Karen Novak | karen@example.com |
| Leo Fernandez | leo@example.com |
| Mia Tanaka | mia@example.com |
| Nathan Brooks | nathan@example.com |
| Olivia Chambers | olivia@example.com |

---

## Seed Data Summary

| Entity | Count |
|---|---|
| Admins | 1 |
| Airline users | 5 |
| Booking users | 15 |
| Planes | 25 (5 per airline) |
| Bookings | 120 spread across Jan–Dec 2024 |

Booking status distribution: ~60% Accepted, 25% Pending, 15% Rejected.

### Planes by Airline

**SkyJet Airlines**
- Eagle One — Cessna Citation X — 12 seats — $4,500/hr
- SkyJet Premier — Bombardier Challenger 350 — 10 seats — $5,800/hr
- Horizon Express — Embraer Phenom 300 — 8 seats — $3,200/hr
- Cloudrunner — Pilatus PC-24 — 9 seats — $3,800/hr
- Apex Cruiser — Gulfstream G280 — 10 seats — $6,100/hr

**Apex Air**
- Falcon Executive — Dassault Falcon 7X — 16 seats — $7,200/hr
- Apex Ultra — Gulfstream G700 — 19 seats — $9,800/hr
- Swift Runner — Cessna Citation CJ4 — 9 seats — $2,900/hr
- Apex Prestige — Bombardier Global 7500 — 19 seats — $11,200/hr
- Meridian Star — Embraer Legacy 650 — 14 seats — $6,500/hr

**Nimbus Charter**
- Nimbus Cloud — Beechcraft King Air 350 — 11 seats — $2,200/hr
- Cumulus One — Pilatus PC-12 — 9 seats — $1,800/hr
- Stratus Jet — HondaJet Elite II — 6 seats — $2,100/hr
- Cirrus Sprint — Cessna Citation M2 — 7 seats — $2,500/hr
- Alto Wind — Learjet 75 Liberty — 9 seats — $3,400/hr

**Cirrus Executive**
- Executive One — Dassault Falcon 8X — 16 seats — $8,400/hr
- Cirrus Horizon — Bombardier Challenger 650 — 12 seats — $5,200/hr
- Summit Flyer — Gulfstream G450 — 16 seats — $7,700/hr
- Pinnacle Pro — Embraer Praetor 600 — 12 seats — $5,600/hr
- Vertex VIP — Bombardier Global 6500 — 17 seats — $9,100/hr

**Meridian Flights**
- Meridian Classic — Hawker 900XP — 10 seats — $3,600/hr
- Atlantic Cruiser — Gulfstream G550 — 18 seats — $8,900/hr
- Compass Rose — Cessna Citation Longitude — 12 seats — $5,000/hr
- Venture Jet — Embraer Phenom 100 — 5 seats — $1,600/hr
- Odyssey Ultra — Dassault Falcon 2000LX — 12 seats — $6,800/hr

---

## Database

The schema uses `String` fields for `role` and `status` (not Prisma enums) to keep SQLite compatibility. Validation is enforced at the application layer via Zod in `packages/shared-types`.

**To migrate to PostgreSQL:** update `DATABASE_URL` in `.env` files to a `postgresql://` connection string and change the Prisma `provider` to `"postgresql"`.

### Useful commands

```bash
npm run db:generate   # regenerate Prisma client after schema changes
npm run db:push       # sync schema to database (no migration file)
npm run db:migrate    # create a named migration file
npm run db:studio     # open Prisma Studio at http://localhost:5555
npm run db:seed       # (re)seed demo data
```
