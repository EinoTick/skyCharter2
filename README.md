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

All 100 booking users follow the pattern `firstname.lastname@example.com`.

| Name | Email |
|---|---|
| Alice Hartwell | alice.hartwell@example.com |
| Bob Mercer | bob.mercer@example.com |
| Carol Driscoll | carol.driscoll@example.com |
| David Okafor | david.okafor@example.com |
| Eva Steinberg | eva.steinberg@example.com |
| Frank Liu | frank.liu@example.com |
| Grace Patel | grace.patel@example.com |
| Henry Johansson | henry.johansson@example.com |
| Isla McKenna | isla.mckenna@example.com |
| James Okonkwo | james.okonkwo@example.com |
| Karen Novak | karen.novak@example.com |
| Leo Fernandez | leo.fernandez@example.com |
| Mia Tanaka | mia.tanaka@example.com |
| Nathan Brooks | nathan.brooks@example.com |
| Olivia Chambers | olivia.chambers@example.com |
| Paul Nguyen | paul.nguyen@example.com |
| Quinn Kowalski | quinn.kowalski@example.com |
| Rachel Hassan | rachel.hassan@example.com |
| Sam Rivera | sam.rivera@example.com |
| Tina Bennett | tina.bennett@example.com |
| Uma Yamamoto | uma.yamamoto@example.com |
| Victor Petrov | victor.petrov@example.com |
| Wendy Andersen | wendy.andersen@example.com |
| Xavier Silva | xavier.silva@example.com |
| Yara Muller | yara.muller@example.com |
| Zane Osei | zane.osei@example.com |
| Aaron Cohen | aaron.cohen@example.com |
| Bella Russo | bella.russo@example.com |
| Carlos Park | carlos.park@example.com |
| Diana Williams | diana.williams@example.com |
| Ethan Diaz | ethan.diaz@example.com |
| Fiona Nielsen | fiona.nielsen@example.com |
| George Kuznetsov | george.kuznetsov@example.com |
| Hannah Bakker | hannah.bakker@example.com |
| Ivan Nkosi | ivan.nkosi@example.com |
| Julia Reyes | julia.reyes@example.com |
| Kevin Schmidt | kevin.schmidt@example.com |
| Laura Watanabe | laura.watanabe@example.com |
| Marco Torres | marco.torres@example.com |
| Nina Larsson | nina.larsson@example.com |
| Oscar Moreau | oscar.moreau@example.com |
| Petra Khan | petra.khan@example.com |
| Quentin Costa | quentin.costa@example.com |
| Rosa Olsen | rosa.olsen@example.com |
| Stefan Popescu | stefan.popescu@example.com |
| Tara Santos | tara.santos@example.com |
| Ulrich Jensen | ulrich.jensen@example.com |
| Vera Hoffman | vera.hoffman@example.com |
| William Nakamura | william.nakamura@example.com |
| Xena Dupont | xena.dupont@example.com |
| Yasmin Alvarez | yasmin.alvarez@example.com |
| Zack Murphy | zack.murphy@example.com |
| Amber Eriksson | amber.eriksson@example.com |
| Bruno Lombardi | bruno.lombardi@example.com |
| Chloe Szabo | chloe.szabo@example.com |
| Derek Castro | derek.castro@example.com |
| Elena Lindqvist | elena.lindqvist@example.com |
| Flynn Becker | flynn.becker@example.com |
| Gloria Ramos | gloria.ramos@example.com |
| Hugo Svensson | hugo.svensson@example.com |
| Iris Owens | iris.owens@example.com |
| Jake Dubois | jake.dubois@example.com |
| Kira Papadopoulos | kira.papadopoulos@example.com |
| Liam Romero | liam.romero@example.com |
| Maya Holmberg | maya.holmberg@example.com |
| Noel Ferreira | noel.ferreira@example.com |
| Opal Fischer | opal.fischer@example.com |
| Perry Gutierrez | perry.gutierrez@example.com |
| Queenie Hansson | queenie.hansson@example.com |
| Reed Ivanova | reed.ivanova@example.com |
| Sasha Jolie | sasha.jolie@example.com |
| Troy Kumar | troy.kumar@example.com |
| Ursula Lopes | ursula.lopes@example.com |
| Vince Martinez | vince.martinez@example.com |
| Wren Niemi | wren.niemi@example.com |
| Xander Ozturk | xander.ozturk@example.com |
| Yvonne Pham | yvonne.pham@example.com |
| Zara Queiroz | zara.queiroz@example.com |
| Adam Rashid | adam.rashid@example.com |
| Beth Sorensen | beth.sorensen@example.com |
| Cole Tran | cole.tran@example.com |
| Demi Ueda | demi.ueda@example.com |
| Eric Vasquez | eric.vasquez@example.com |
| Faith Weber | faith.weber@example.com |
| Grant Xiong | grant.xiong@example.com |
| Holly Yilmaz | holly.yilmaz@example.com |
| Ian Zubkov | ian.zubkov@example.com |
| Jade Abreu | jade.abreu@example.com |
| Kyle Bjork | kyle.bjork@example.com |
| Luna Cardoso | luna.cardoso@example.com |
| Mike Dahl | mike.dahl@example.com |
| Nadia Elias | nadia.elias@example.com |
| Owen Florea | owen.florea@example.com |
| Paige Girard | paige.girard@example.com |
| Rhys Hakala | rhys.hakala@example.com |
| Sara Ito | sara.ito@example.com |
| Todd Jansen | todd.jansen@example.com |
| Ugo Kaya | ugo.kaya@example.com |
| Violet Lund | violet.lund@example.com |
| Wade Mora | wade.mora@example.com |

---

## Seed Data Summary

| Entity | Count |
|---|---|
| Admins | 1 |
| Airline users | 5 |
| Booking users | 100 |
| Planes | 75 (15 per airline) |
| Bookings | 1,000 spread across Jan–Dec 2024 |

Booking status distribution: ~60% Accepted, 25% Pending, 15% Rejected.

### Planes by Airline

**SkyJet Airlines** — `ops@skyjet.com`
| Name | Model | Seats | Price/hr |
|---|---|---|---|
| Eagle One | Cessna Citation X | 12 | $4,500 |
| SkyJet Premier | Bombardier Challenger 350 | 10 | $5,800 |
| Horizon Express | Embraer Phenom 300 | 8 | $3,200 |
| Cloudrunner | Pilatus PC-24 | 9 | $3,800 |
| Apex Cruiser | Gulfstream G280 | 10 | $6,100 |
| Solstice Jet | Cessna Citation Latitude | 10 | $4,200 |
| Polar Star | Bombardier Learjet 75 | 9 | $3,500 |
| Zephyr One | Embraer Praetor 500 | 10 | $4,900 |
| Summit Express | Hawker 800XP | 9 | $3,100 |
| Aurora Flight | Gulfstream G150 | 9 | $3,700 |
| Nimbus Swift | Nextant 400XTi | 8 | $2,800 |
| Delta Wing | Cessna Citation CJ3+ | 8 | $2,600 |
| Cirrus Dash | Beechcraft Premier I | 6 | $2,200 |
| TailWind One | Piaggio Avanti EVO | 9 | $2,700 |
| NightHawk | Gulfstream G200 | 10 | $4,100 |

**Apex Air** — `ops@apexair.com`
| Name | Model | Seats | Price/hr |
|---|---|---|---|
| Falcon Executive | Dassault Falcon 7X | 16 | $7,200 |
| Apex Ultra | Gulfstream G700 | 19 | $9,800 |
| Swift Runner | Cessna Citation CJ4 | 9 | $2,900 |
| Apex Prestige | Bombardier Global 7500 | 19 | $11,200 |
| Meridian Star | Embraer Legacy 650 | 14 | $6,500 |
| Apex Sovereign | Bombardier Global 6000 | 17 | $8,800 |
| Stratosphere One | Gulfstream G600 | 17 | $8,500 |
| Apex Vanguard | Dassault Falcon 2000LXS | 12 | $6,800 |
| Pacific Runner | Bombardier Global 5500 | 16 | $8,100 |
| Apex Legend | Gulfstream G500 | 16 | $7,900 |
| Nightfall Express | Embraer Legacy 500 | 12 | $5,400 |
| Zenith Cruiser | Cessna Citation Sovereign+ | 12 | $4,700 |
| Apex Express | Piaggio P.180 Avanti | 9 | $2,600 |
| Cosmos Jet | Gulfstream G450 | 16 | $7,700 |
| Apex Sprint | Cessna Citation M2 Gen2 | 7 | $2,300 |

**Nimbus Charter** — `ops@nimbusair.com`
| Name | Model | Seats | Price/hr |
|---|---|---|---|
| Nimbus Cloud | Beechcraft King Air 350 | 11 | $2,200 |
| Cumulus One | Pilatus PC-12 | 9 | $1,800 |
| Stratus Jet | HondaJet Elite II | 6 | $2,100 |
| Cirrus Sprint | Cessna Citation M2 | 7 | $2,500 |
| Alto Wind | Learjet 75 Liberty | 9 | $3,400 |
| Nimbus Breeze | Daher TBM 940 | 5 | $1,400 |
| Orca Cloud | Beechcraft King Air 260 | 9 | $1,900 |
| Cirrus Arrow | Piper M600/SLS | 5 | $1,200 |
| Nimbus Flyer | Socata TBM 850 | 5 | $1,300 |
| Lofty Cruiser | Cessna Citation CJ1+ | 6 | $2,000 |
| Vortex One | Eclipse 550 | 5 | $1,500 |
| Nimbus Shadow | Embraer Phenom 100EV | 5 | $1,700 |
| Drift Runner | Syberjet SJ30i | 6 | $2,400 |
| Overcast One | Cessna Citation CJ2+ | 7 | $2,200 |
| Cumulus Racer | Adam Aircraft A700 | 6 | $1,900 |

**Cirrus Executive** — `ops@cirrusexec.com`
| Name | Model | Seats | Price/hr |
|---|---|---|---|
| Executive One | Dassault Falcon 8X | 16 | $8,400 |
| Cirrus Horizon | Bombardier Challenger 650 | 12 | $5,200 |
| Summit Flyer | Gulfstream G450 | 16 | $7,700 |
| Pinnacle Pro | Embraer Praetor 600 | 12 | $5,600 |
| Vertex VIP | Bombardier Global 6500 | 17 | $9,100 |
| Cirrus Pinnacle | Dassault Falcon 900LX | 14 | $7,500 |
| Executive Voyager | Bombardier Global 5000 | 14 | $7,800 |
| Cirrus Icon | Gulfstream G350 | 14 | $6,900 |
| Apex Crown | Bombardier Challenger 605 | 12 | $5,700 |
| Cirrus Monarch | Gulfstream G300 | 14 | $6,400 |
| Prestige Liner | Embraer Legacy 600 | 14 | $6,200 |
| Blue Ridge Flyer | Dassault Falcon 50EX | 10 | $5,100 |
| Cirrus Comet | Bombardier Challenger 300 | 10 | $4,800 |
| Executive Glide | Cessna Citation X+ | 12 | $5,300 |
| Altitude King | Gulfstream GIV-SP | 14 | $6,700 |

**Meridian Flights** — `ops@meridianflights.com`
| Name | Model | Seats | Price/hr |
|---|---|---|---|
| Meridian Classic | Hawker 900XP | 10 | $3,600 |
| Atlantic Cruiser | Gulfstream G550 | 18 | $8,900 |
| Compass Rose | Cessna Citation Longitude | 12 | $5,000 |
| Venture Jet | Embraer Phenom 100 | 5 | $1,600 |
| Odyssey Ultra | Dassault Falcon 2000LX | 12 | $6,800 |
| Meridian Horizon | Bombardier Challenger 850 | 15 | $6,300 |
| Trans-Atlantic One | Gulfstream G650 | 18 | $9,500 |
| Meridian Arrow | Bombardier Learjet 60 XR | 8 | $3,300 |
| Silver Wing | Cessna Citation Excel | 9 | $3,000 |
| Gulf Breeze | Dassault Falcon 900EX | 14 | $7,100 |
| Meridian Glider | Hawker 750 | 9 | $3,200 |
| Pacific Pioneer | Gulfstream GV-SP (G550) | 16 | $8,600 |
| Meridian Comet | Embraer Legacy 450 | 10 | $4,600 |
| Sky Baron | Bombardier Global 8000 | 19 | $12,500 |
| Meridian Elite | Gulfstream G800 | 19 | $13,200 |

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
