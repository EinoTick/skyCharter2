import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// ── helpers ──────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Random date within [start, end] */
function randDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

/** Add hours to a date */
function addHours(d: Date, h: number): Date {
  return new Date(d.getTime() + h * 60 * 60 * 1000)
}

// ── data ─────────────────────────────────────────────────────────────────────

const YEAR_START = new Date('2024-01-01T00:00:00Z')
const YEAR_END   = new Date('2024-12-31T23:59:59Z')

const AIRLINE_DEFS = [
  { id: 'airline-seed-01', name: 'SkyJet Airlines',      email: 'ops@skyjet.com',      password: 'airline123' },
  { id: 'airline-seed-02', name: 'Apex Air',             email: 'ops@apexair.com',      password: 'airline123' },
  { id: 'airline-seed-03', name: 'Nimbus Charter',       email: 'ops@nimbusair.com',    password: 'airline123' },
  { id: 'airline-seed-04', name: 'Cirrus Executive',     email: 'ops@cirrusexec.com',   password: 'airline123' },
  { id: 'airline-seed-05', name: 'Meridian Flights',     email: 'ops@meridianflights.com', password: 'airline123' },
]

const BOOKING_USERS = [
  { id: 'booker-seed-01', name: 'Alice Hartwell',   email: 'alice@example.com' },
  { id: 'booker-seed-02', name: 'Bob Mercer',        email: 'bob@example.com' },
  { id: 'booker-seed-03', name: 'Carol Driscoll',    email: 'carol@example.com' },
  { id: 'booker-seed-04', name: 'David Okafor',      email: 'david@example.com' },
  { id: 'booker-seed-05', name: 'Eva Steinberg',     email: 'eva@example.com' },
  { id: 'booker-seed-06', name: 'Frank Liu',         email: 'frank@example.com' },
  { id: 'booker-seed-07', name: 'Grace Patel',       email: 'grace@example.com' },
  { id: 'booker-seed-08', name: 'Henry Johansson',   email: 'henry@example.com' },
  { id: 'booker-seed-09', name: 'Isla McKenna',      email: 'isla@example.com' },
  { id: 'booker-seed-10', name: 'James Okonkwo',     email: 'james@example.com' },
  { id: 'booker-seed-11', name: 'Karen Novak',       email: 'karen@example.com' },
  { id: 'booker-seed-12', name: 'Leo Fernandez',     email: 'leo@example.com' },
  { id: 'booker-seed-13', name: 'Mia Tanaka',        email: 'mia@example.com' },
  { id: 'booker-seed-14', name: 'Nathan Brooks',     email: 'nathan@example.com' },
  { id: 'booker-seed-15', name: 'Olivia Chambers',   email: 'olivia@example.com' },
]

// 25 planes spread across 5 airlines (5 per airline)
const PLANE_DEFS = [
  // SkyJet Airlines
  { id: 'plane-seed-01', airlineIdx: 0, name: 'Eagle One',         model: 'Cessna Citation X',        capacity: 12, pricePerHour: 4500, description: 'Luxury mid-size business jet with state-of-the-art avionics.' },
  { id: 'plane-seed-02', airlineIdx: 0, name: 'SkyJet Premier',    model: 'Bombardier Challenger 350', capacity: 10, pricePerHour: 5800, description: 'Super mid-size jet ideal for transcontinental routes.' },
  { id: 'plane-seed-03', airlineIdx: 0, name: 'Horizon Express',   model: 'Embraer Phenom 300',       capacity:  8, pricePerHour: 3200, description: 'Light jet with impressive range and fuel efficiency.' },
  { id: 'plane-seed-04', airlineIdx: 0, name: 'Cloudrunner',       model: 'Pilatus PC-24',            capacity:  9, pricePerHour: 3800, description: 'Versatile super-light jet with short-field capability.' },
  { id: 'plane-seed-05', airlineIdx: 0, name: 'Apex Cruiser',      model: 'Gulfstream G280',          capacity: 10, pricePerHour: 6100, description: 'Mid-size jet with best-in-class cabin width.' },

  // Apex Air
  { id: 'plane-seed-06', airlineIdx: 1, name: 'Falcon Executive',  model: 'Dassault Falcon 7X',       capacity: 16, pricePerHour: 7200, description: 'Ultra-long-range tri-engine business jet.' },
  { id: 'plane-seed-07', airlineIdx: 1, name: 'Apex Ultra',        model: 'Gulfstream G700',          capacity: 19, pricePerHour: 9800, description: 'Flagship ultra-long-range jet with full-flat beds.' },
  { id: 'plane-seed-08', airlineIdx: 1, name: 'Swift Runner',      model: 'Cessna Citation CJ4',      capacity:  9, pricePerHour: 2900, description: 'Light jet perfect for short regional hops.' },
  { id: 'plane-seed-09', airlineIdx: 1, name: 'Apex Prestige',     model: 'Bombardier Global 7500',   capacity: 19, pricePerHour: 11200, description: 'The pinnacle of private aviation — four living spaces.' },
  { id: 'plane-seed-10', airlineIdx: 1, name: 'Meridian Star',     model: 'Embraer Legacy 650',       capacity: 14, pricePerHour: 6500, description: 'Large cabin jet with full intercontinental range.' },

  // Nimbus Charter
  { id: 'plane-seed-11', airlineIdx: 2, name: 'Nimbus Cloud',      model: 'Beechcraft King Air 350',  capacity: 11, pricePerHour: 2200, description: 'Turboprop workhorse — reliable and cost-effective.' },
  { id: 'plane-seed-12', airlineIdx: 2, name: 'Cumulus One',       model: 'Pilatus PC-12',            capacity:  9, pricePerHour: 1800, description: 'Single-engine turboprop with exceptional range.' },
  { id: 'plane-seed-13', airlineIdx: 2, name: 'Stratus Jet',       model: 'HondaJet Elite II',        capacity:  6, pricePerHour: 2100, description: 'Innovative over-the-nacelle engine design for reduced cabin noise.' },
  { id: 'plane-seed-14', airlineIdx: 2, name: 'Cirrus Sprint',     model: 'Cessna Citation M2',       capacity:  7, pricePerHour: 2500, description: 'Entry-level light jet, ideal for quick city hops.' },
  { id: 'plane-seed-15', airlineIdx: 2, name: 'Alto Wind',         model: 'Learjet 75 Liberty',       capacity:  9, pricePerHour: 3400, description: 'Renowned for speed and high-altitude performance.' },

  // Cirrus Executive
  { id: 'plane-seed-16', airlineIdx: 3, name: 'Executive One',     model: 'Dassault Falcon 8X',       capacity: 16, pricePerHour: 8400, description: 'Extended ultra-long-range jet with the widest Falcon cabin.' },
  { id: 'plane-seed-17', airlineIdx: 3, name: 'Cirrus Horizon',    model: 'Bombardier Challenger 650', capacity: 12, pricePerHour: 5200, description: 'Wide-body large cabin jet with stand-up headroom.' },
  { id: 'plane-seed-18', airlineIdx: 3, name: 'Summit Flyer',      model: 'Gulfstream G450',          capacity: 16, pricePerHour: 7700, description: 'Large cabin, ultra-long-range jet with Rolls-Royce engines.' },
  { id: 'plane-seed-19', airlineIdx: 3, name: 'Pinnacle Pro',      model: 'Embraer Praetor 600',      capacity: 12, pricePerHour: 5600, description: 'Super mid-size with longest range in its class.' },
  { id: 'plane-seed-20', airlineIdx: 3, name: 'Vertex VIP',        model: 'Bombardier Global 6500',   capacity: 17, pricePerHour: 9100, description: 'Smooth ride with Nuage seats and full-stand-up cabin.' },

  // Meridian Flights
  { id: 'plane-seed-21', airlineIdx: 4, name: 'Meridian Classic',  model: 'Hawker 900XP',             capacity: 10, pricePerHour: 3600, description: 'Proven mid-size jet with a spacious flat-floor cabin.' },
  { id: 'plane-seed-22', airlineIdx: 4, name: 'Atlantic Cruiser',  model: 'Gulfstream G550',          capacity: 18, pricePerHour: 8900, description: 'Ultra-long-range workhorse trusted by heads of state.' },
  { id: 'plane-seed-23', airlineIdx: 4, name: 'Compass Rose',      model: 'Cessna Citation Longitude', capacity: 12, pricePerHour: 5000, description: 'Super mid-size jet with whisper-quiet cabin.' },
  { id: 'plane-seed-24', airlineIdx: 4, name: 'Venture Jet',       model: 'Embraer Phenom 100',       capacity:  5, pricePerHour: 1600, description: 'Entry-level very light jet — affordable city-pair travel.' },
  { id: 'plane-seed-25', airlineIdx: 4, name: 'Odyssey Ultra',     model: 'Dassault Falcon 2000LX',   capacity: 12, pricePerHour: 6800, description: 'Long-range wide-body Falcon with exceptional fuel economy.' },
]

const BOOKING_NOTES = [
  'Business trip — need onboard Wi-Fi',
  'Corporate retreat, 8 passengers',
  'Medical transport, priority handling required',
  'Anniversary getaway — champagne on arrival please',
  'Film crew transport with equipment',
  'Sports team relocation',
  'VIP client transfer — complete discretion required',
  'Family vacation to the coast',
  'Conference attendance, early morning departure',
  'Government delegation flight',
  'Leisure trip — no specific requirements',
  'Urgent executive travel',
  'Product launch event transport',
  'Honeymoon trip',
  'Weekend ski retreat',
  null,
  null,
  null,
]

const STATUSES = ['PENDING', 'ACCEPTED', 'REJECTED'] as const
// Weight distribution: 25% pending, 60% accepted, 15% rejected
const STATUS_WEIGHTS = [
  ...Array(25).fill('PENDING'),
  ...Array(60).fill('ACCEPTED'),
  ...Array(15).fill('REJECTED'),
]

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding SkyCharter database with rich test data…\n')

  // 1. Hash passwords
  const [adminHash, airlineHash, bookingHash] = await Promise.all([
    bcrypt.hash('admin123', 10),
    bcrypt.hash('airline123', 10),
    bcrypt.hash('booking123', 10),
  ])

  // 2. Admin
  await prisma.user.upsert({
    where: { email: 'admin@skycharter.com' },
    update: {},
    create: { id: 'admin-seed-01', name: 'Admin User', email: 'admin@skycharter.com', password: adminHash, role: 'ADMIN' },
  })
  console.log('✔ Admin created')

  // 3. Airlines
  const airlineRecords = await Promise.all(
    AIRLINE_DEFS.map((a) =>
      prisma.user.upsert({
        where: { email: a.email },
        update: {},
        create: { id: a.id, name: a.name, email: a.email, password: airlineHash, role: 'AIRLINE' },
      })
    )
  )
  console.log(`✔ ${airlineRecords.length} airline users created`)

  // 4. Booking users
  const bookerRecords = await Promise.all(
    BOOKING_USERS.map((u) =>
      prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: { id: u.id, name: u.name, email: u.email, password: bookingHash, role: 'BOOKING' },
      })
    )
  )
  console.log(`✔ ${bookerRecords.length} booking users created`)

  // 5. Planes
  const planeRecords = await Promise.all(
    PLANE_DEFS.map((p) =>
      prisma.plane.upsert({
        where: { id: p.id },
        update: {},
        create: {
          id: p.id,
          name: p.name,
          model: p.model,
          capacity: p.capacity,
          pricePerHour: p.pricePerHour,
          description: p.description,
          airlineId: airlineRecords[p.airlineIdx].id,
        },
      })
    )
  )
  console.log(`✔ ${planeRecords.length} planes created`)

  // 6. Bookings — 120 spread across Jan–Dec 2024
  // Delete existing seed bookings first so re-seeding is clean
  await prisma.booking.deleteMany({ where: { id: { startsWith: 'booking-seed-' } } })

  const bookingData = Array.from({ length: 120 }, (_, i) => {
    const startDate = randDate(YEAR_START, YEAR_END)
    const durationHours = pick([2, 3, 4, 5, 6, 8, 10, 12])
    const endDate = addHours(startDate, durationHours)
    const note = pick(BOOKING_NOTES)

    return {
      id: `booking-seed-${String(i + 1).padStart(3, '0')}`,
      userId: pick(bookerRecords).id,
      planeId: pick(planeRecords).id,
      status: pick(STATUS_WEIGHTS),
      startDate,
      endDate,
      notes: note ?? undefined,
    }
  })

  await prisma.booking.createMany({ data: bookingData })
  console.log(`✔ ${bookingData.length} bookings created`)

  // ── summary ──
  console.log('\n📋 Login credentials:')
  console.table({
    'Admin':        { email: 'admin@skycharter.com',   password: 'admin123'   },
    'SkyJet (AL)':  { email: 'ops@skyjet.com',          password: 'airline123' },
    'Apex Air (AL)':{ email: 'ops@apexair.com',         password: 'airline123' },
    'Alice (BU)':   { email: 'alice@example.com',       password: 'booking123' },
    'Bob (BU)':     { email: 'bob@example.com',         password: 'booking123' },
  })

  // Monthly distribution
  const monthly: Record<string, number> = {}
  bookingData.forEach((b) => {
    const m = b.startDate.toLocaleString('default', { month: 'short' })
    monthly[m] = (monthly[m] || 0) + 1
  })
  console.log('\n📅 Bookings per month:')
  console.table(monthly)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
