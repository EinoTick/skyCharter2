import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// ── helpers ───────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function addHours(d: Date, h: number): Date {
  return new Date(d.getTime() + h * 60 * 60 * 1000)
}

function subDays(d: Date, days: number): Date {
  return new Date(d.getTime() - days * 24 * 60 * 60 * 1000)
}

function pad(n: number, width = 3) {
  return String(n).padStart(width, '0')
}

// ── constants ─────────────────────────────────────────────────────────────────

const YEAR_START = new Date('2024-01-01T00:00:00Z')
const YEAR_END   = new Date('2024-12-31T23:59:59Z')

// Weight distribution: 25% pending, 60% accepted, 15% rejected
const STATUS_WEIGHTS = [
  ...Array(25).fill('PENDING'),
  ...Array(60).fill('ACCEPTED'),
  ...Array(15).fill('REJECTED'),
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
  'Tech summit delegation',
  'Music tour equipment and crew',
  'Fashion week transport',
  'Private wedding party',
  'Emergency medical equipment transfer',
  'Offshore energy crew rotation',
  'Diplomatic mission support',
  'Charity gala guests',
  'University sports championship',
  'Film festival press junket',
  null, null, null, null, null,
]

// ── airlines (unchanged) ──────────────────────────────────────────────────────

const AIRLINE_DEFS = [
  { id: 'airline-seed-01', name: 'SkyJet Airlines',    email: 'ops@skyjet.com',             password: 'airline123' },
  { id: 'airline-seed-02', name: 'Apex Air',           email: 'ops@apexair.com',            password: 'airline123' },
  { id: 'airline-seed-03', name: 'Nimbus Charter',     email: 'ops@nimbusair.com',          password: 'airline123' },
  { id: 'airline-seed-04', name: 'Cirrus Executive',   email: 'ops@cirrusexec.com',         password: 'airline123' },
  { id: 'airline-seed-05', name: 'Meridian Flights',   email: 'ops@meridianflights.com',    password: 'airline123' },
]

// ── 100 booking users ─────────────────────────────────────────────────────────

const FIRST_NAMES = [
  'Alice','Bob','Carol','David','Eva','Frank','Grace','Henry','Isla','James',
  'Karen','Leo','Mia','Nathan','Olivia','Paul','Quinn','Rachel','Sam','Tina',
  'Uma','Victor','Wendy','Xavier','Yara','Zane','Aaron','Bella','Carlos','Diana',
  'Ethan','Fiona','George','Hannah','Ivan','Julia','Kevin','Laura','Marco','Nina',
  'Oscar','Petra','Quentin','Rosa','Stefan','Tara','Ulrich','Vera','William','Xena',
  'Yasmin','Zack','Amber','Bruno','Chloe','Derek','Elena','Flynn','Gloria','Hugo',
  'Iris','Jake','Kira','Liam','Maya','Noel','Opal','Perry','Queenie','Reed',
  'Sasha','Troy','Ursula','Vince','Wren','Xander','Yvonne','Zara','Adam','Beth',
  'Cole','Demi','Eric','Faith','Grant','Holly','Ian','Jade','Kyle','Luna',
  'Mike','Nadia','Owen','Paige','Rhys','Sara','Todd','Ugo','Violet','Wade',
]

const LAST_NAMES = [
  'Hartwell','Mercer','Driscoll','Okafor','Steinberg','Liu','Patel','Johansson','McKenna','Okonkwo',
  'Novak','Fernandez','Tanaka','Brooks','Chambers','Nguyen','Kowalski','Hassan','Rivera','Bennett',
  'Yamamoto','Petrov','Andersen','Silva','Muller','Osei','Cohen','Russo','Park','Williams',
  'Diaz','Nielsen','Kuznetsov','Bakker','Nkosi','Reyes','Schmidt','Watanabe','Torres','Larsson',
  'Moreau','Khan','Costa','Olsen','Popescu','Santos','Jensen','Hoffman','Nakamura','Dupont',
  'Alvarez','Murphy','Eriksson','Lombardi','Szabo','Castro','Lindqvist','Becker','Ramos','Svensson',
  'Owens','Dubois','Papadopoulos','Romero','Holmberg','Ferreira','Fischer','Gutierrez','Hansson','Ivanova',
  'Jolie','Kumar','Lopes','Martinez','Niemi','Ozturk','Pham','Queiroz','Rashid','Sorensen',
  'Tran','Ueda','Vasquez','Weber','Xiong','Yilmaz','Zubkov','Abreu','Bjork','Cardoso',
  'Dahl','Elias','Florea','Girard','Hakala','Ito','Jansen','Kaya','Lund','Mora',
]

const BOOKING_USERS = FIRST_NAMES.map((first, i) => ({
  id: `booker-seed-${pad(i + 1)}`,
  name: `${first} ${LAST_NAMES[i % LAST_NAMES.length]}`,
  email: `${first.toLowerCase()}.${LAST_NAMES[i % LAST_NAMES.length].toLowerCase()}@example.com`,
}))

// ── 75 planes (15 per airline) ────────────────────────────────────────────────

const PLANE_DEFS = [
  // ── SkyJet Airlines (0) ──
  { id: 'plane-seed-01', airlineIdx: 0, name: 'Eagle One',          model: 'Cessna Citation X',            capacity: 12, pricePerHour: 4500,  description: 'Luxury mid-size business jet with state-of-the-art avionics.' },
  { id: 'plane-seed-02', airlineIdx: 0, name: 'SkyJet Premier',     model: 'Bombardier Challenger 350',     capacity: 10, pricePerHour: 5800,  description: 'Super mid-size jet ideal for transcontinental routes.' },
  { id: 'plane-seed-03', airlineIdx: 0, name: 'Horizon Express',    model: 'Embraer Phenom 300',            capacity:  8, pricePerHour: 3200,  description: 'Light jet with impressive range and fuel efficiency.' },
  { id: 'plane-seed-04', airlineIdx: 0, name: 'Cloudrunner',        model: 'Pilatus PC-24',                 capacity:  9, pricePerHour: 3800,  description: 'Versatile super-light jet with short-field capability.' },
  { id: 'plane-seed-05', airlineIdx: 0, name: 'Apex Cruiser',       model: 'Gulfstream G280',               capacity: 10, pricePerHour: 6100,  description: 'Mid-size jet with best-in-class cabin width.' },
  { id: 'plane-seed-06', airlineIdx: 0, name: 'Solstice Jet',       model: 'Cessna Citation Latitude',      capacity: 10, pricePerHour: 4200,  description: 'Stand-up cabin mid-size jet with exceptional comfort.' },
  { id: 'plane-seed-07', airlineIdx: 0, name: 'Polar Star',         model: 'Bombardier Learjet 75',         capacity:  9, pricePerHour: 3500,  description: 'High-performance light jet renowned for speed.' },
  { id: 'plane-seed-08', airlineIdx: 0, name: 'Zephyr One',         model: 'Embraer Praetor 500',           capacity: 10, pricePerHour: 4900,  description: 'Mid-size jet with transcontinental range.' },
  { id: 'plane-seed-09', airlineIdx: 0, name: 'Summit Express',     model: 'Hawker 800XP',                  capacity:  9, pricePerHour: 3100,  description: 'Mid-size classic with flat-floor cabin.' },
  { id: 'plane-seed-10', airlineIdx: 0, name: 'Aurora Flight',      model: 'Gulfstream G150',               capacity:  9, pricePerHour: 3700,  description: 'Mid-cabin jet with superior avionics suite.' },
  { id: 'plane-seed-11', airlineIdx: 0, name: 'Nimbus Swift',       model: 'Nextant 400XTi',                capacity:  8, pricePerHour: 2800,  description: 'Remanufactured light jet with new-gen performance.' },
  { id: 'plane-seed-12', airlineIdx: 0, name: 'Delta Wing',         model: 'Cessna Citation CJ3+',          capacity:  8, pricePerHour: 2600,  description: 'Light jet with a roomy 5-foot stand-up cabin.' },
  { id: 'plane-seed-13', airlineIdx: 0, name: 'Cirrus Dash',        model: 'Beechcraft Premier I',          capacity:  6, pricePerHour: 2200,  description: 'Fastest light jet in its class.' },
  { id: 'plane-seed-14', airlineIdx: 0, name: 'TailWind One',       model: 'Piaggio Avanti EVO',            capacity:  9, pricePerHour: 2700,  description: 'Turboprop pusher with jet-like speed and comfort.' },
  { id: 'plane-seed-15', airlineIdx: 0, name: 'NightHawk',          model: 'Gulfstream G200',               capacity: 10, pricePerHour: 4100,  description: 'Super mid-size with 3,400 nm range.' },

  // ── Apex Air (1) ──
  { id: 'plane-seed-16', airlineIdx: 1, name: 'Falcon Executive',   model: 'Dassault Falcon 7X',            capacity: 16, pricePerHour: 7200,  description: 'Ultra-long-range tri-engine business jet.' },
  { id: 'plane-seed-17', airlineIdx: 1, name: 'Apex Ultra',         model: 'Gulfstream G700',               capacity: 19, pricePerHour: 9800,  description: 'Flagship ultra-long-range jet with full-flat beds.' },
  { id: 'plane-seed-18', airlineIdx: 1, name: 'Swift Runner',       model: 'Cessna Citation CJ4',           capacity:  9, pricePerHour: 2900,  description: 'Light jet perfect for short regional hops.' },
  { id: 'plane-seed-19', airlineIdx: 1, name: 'Apex Prestige',      model: 'Bombardier Global 7500',        capacity: 19, pricePerHour: 11200, description: 'Four living spaces — the pinnacle of private aviation.' },
  { id: 'plane-seed-20', airlineIdx: 1, name: 'Meridian Star',      model: 'Embraer Legacy 650',            capacity: 14, pricePerHour: 6500,  description: 'Large cabin jet with full intercontinental range.' },
  { id: 'plane-seed-21', airlineIdx: 1, name: 'Apex Sovereign',     model: 'Bombardier Global 6000',        capacity: 17, pricePerHour: 8800,  description: 'Ultra-long-range widebody with signature smooth ride.' },
  { id: 'plane-seed-22', airlineIdx: 1, name: 'Stratosphere One',   model: 'Gulfstream G600',               capacity: 17, pricePerHour: 8500,  description: 'Advanced fly-by-wire ultra-long-range jet.' },
  { id: 'plane-seed-23', airlineIdx: 1, name: 'Apex Vanguard',      model: 'Dassault Falcon 2000LXS',       capacity: 12, pricePerHour: 6800,  description: 'Long-range wide-body with exceptional fuel economy.' },
  { id: 'plane-seed-24', airlineIdx: 1, name: 'Pacific Runner',     model: 'Bombardier Global 5500',        capacity: 16, pricePerHour: 8100,  description: 'Ultra-long-range jet with 5,900 nm range.' },
  { id: 'plane-seed-25', airlineIdx: 1, name: 'Apex Legend',        model: 'Gulfstream G500',               capacity: 16, pricePerHour: 7900,  description: 'Advanced avionics with touchscreen Symmetry flight deck.' },
  { id: 'plane-seed-26', airlineIdx: 1, name: 'Nightfall Express',  model: 'Embraer Legacy 500',            capacity: 12, pricePerHour: 5400,  description: 'Mid-size jet with the largest cabin in its class.' },
  { id: 'plane-seed-27', airlineIdx: 1, name: 'Zenith Cruiser',     model: 'Cessna Citation Sovereign+',    capacity: 12, pricePerHour: 4700,  description: 'Mid-size with best-in-class fuel burn.' },
  { id: 'plane-seed-28', airlineIdx: 1, name: 'Apex Express',       model: 'Piaggio P.180 Avanti',          capacity:  9, pricePerHour: 2600,  description: 'Distinctive turboprop with jet-comparable comfort.' },
  { id: 'plane-seed-29', airlineIdx: 1, name: 'Cosmos Jet',         model: 'Gulfstream G450',               capacity: 16, pricePerHour: 7700,  description: 'Large cabin, ultra-long-range with Rolls-Royce engines.' },
  { id: 'plane-seed-30', airlineIdx: 1, name: 'Apex Sprint',        model: 'Cessna Citation M2 Gen2',       capacity:  7, pricePerHour: 2300,  description: 'Updated entry-level jet with enhanced reliability.' },

  // ── Nimbus Charter (2) ──
  { id: 'plane-seed-31', airlineIdx: 2, name: 'Nimbus Cloud',       model: 'Beechcraft King Air 350',       capacity: 11, pricePerHour: 2200,  description: 'Turboprop workhorse — reliable and cost-effective.' },
  { id: 'plane-seed-32', airlineIdx: 2, name: 'Cumulus One',        model: 'Pilatus PC-12',                 capacity:  9, pricePerHour: 1800,  description: 'Single-engine turboprop with exceptional range.' },
  { id: 'plane-seed-33', airlineIdx: 2, name: 'Stratus Jet',        model: 'HondaJet Elite II',             capacity:  6, pricePerHour: 2100,  description: 'Over-the-nacelle engines for reduced cabin noise.' },
  { id: 'plane-seed-34', airlineIdx: 2, name: 'Cirrus Sprint',      model: 'Cessna Citation M2',            capacity:  7, pricePerHour: 2500,  description: 'Entry-level light jet for quick city hops.' },
  { id: 'plane-seed-35', airlineIdx: 2, name: 'Alto Wind',          model: 'Learjet 75 Liberty',            capacity:  9, pricePerHour: 3400,  description: 'High-altitude performance and speed.' },
  { id: 'plane-seed-36', airlineIdx: 2, name: 'Nimbus Breeze',      model: 'Daher TBM 940',                 capacity:  5, pricePerHour: 1400,  description: 'Fast single-engine turboprop for short sectors.' },
  { id: 'plane-seed-37', airlineIdx: 2, name: 'Orca Cloud',         model: 'Beechcraft King Air 260',       capacity:  9, pricePerHour: 1900,  description: 'Updated King Air with Garmin avionics.' },
  { id: 'plane-seed-38', airlineIdx: 2, name: 'Cirrus Arrow',       model: 'Piper M600/SLS',                capacity:  5, pricePerHour: 1200,  description: 'Light turboprop with HALO emergency autoland.' },
  { id: 'plane-seed-39', airlineIdx: 2, name: 'Nimbus Flyer',       model: 'Socata TBM 850',                capacity:  5, pricePerHour: 1300,  description: 'High-performance single-engine turboprop.' },
  { id: 'plane-seed-40', airlineIdx: 2, name: 'Lofty Cruiser',      model: 'Cessna Citation CJ1+',          capacity:  6, pricePerHour: 2000,  description: 'Entry-level light jet with low operating costs.' },
  { id: 'plane-seed-41', airlineIdx: 2, name: 'Vortex One',         model: 'Eclipse 550',                   capacity:  5, pricePerHour: 1500,  description: 'Very light jet with modern glass cockpit.' },
  { id: 'plane-seed-42', airlineIdx: 2, name: 'Nimbus Shadow',      model: 'Embraer Phenom 100EV',          capacity:  5, pricePerHour: 1700,  description: 'Very light jet with enhanced performance.' },
  { id: 'plane-seed-43', airlineIdx: 2, name: 'Drift Runner',       model: 'Syberjet SJ30i',                capacity:  6, pricePerHour: 2400,  description: 'Ultra-long-range light jet — fastest in class.' },
  { id: 'plane-seed-44', airlineIdx: 2, name: 'Overcast One',       model: 'Cessna Citation CJ2+',          capacity:  7, pricePerHour: 2200,  description: 'Light jet with increased range over standard CJ2.' },
  { id: 'plane-seed-45', airlineIdx: 2, name: 'Cumulus Racer',      model: 'Adam Aircraft A700',            capacity:  6, pricePerHour: 1900,  description: 'Centre-line thrust very light jet.' },

  // ── Cirrus Executive (3) ──
  { id: 'plane-seed-46', airlineIdx: 3, name: 'Executive One',      model: 'Dassault Falcon 8X',            capacity: 16, pricePerHour: 8400,  description: 'Extended ultra-long-range with widest Falcon cabin.' },
  { id: 'plane-seed-47', airlineIdx: 3, name: 'Cirrus Horizon',     model: 'Bombardier Challenger 650',     capacity: 12, pricePerHour: 5200,  description: 'Wide-body large cabin jet with stand-up headroom.' },
  { id: 'plane-seed-48', airlineIdx: 3, name: 'Summit Flyer',       model: 'Gulfstream G450',               capacity: 16, pricePerHour: 7700,  description: 'Large cabin ultra-long-range with Rolls-Royce engines.' },
  { id: 'plane-seed-49', airlineIdx: 3, name: 'Pinnacle Pro',       model: 'Embraer Praetor 600',           capacity: 12, pricePerHour: 5600,  description: 'Super mid-size with longest range in class.' },
  { id: 'plane-seed-50', airlineIdx: 3, name: 'Vertex VIP',         model: 'Bombardier Global 6500',        capacity: 17, pricePerHour: 9100,  description: 'Nuage seats and full stand-up cabin.' },
  { id: 'plane-seed-51', airlineIdx: 3, name: 'Cirrus Pinnacle',    model: 'Dassault Falcon 900LX',         capacity: 14, pricePerHour: 7500,  description: 'Tri-engine ultra-long-range with wide cabin.' },
  { id: 'plane-seed-52', airlineIdx: 3, name: 'Executive Voyager',  model: 'Bombardier Global 5000',        capacity: 14, pricePerHour: 7800,  description: 'Ultra-long-range jet with 5,200 nm range.' },
  { id: 'plane-seed-53', airlineIdx: 3, name: 'Cirrus Icon',        model: 'Gulfstream G350',               capacity: 14, pricePerHour: 6900,  description: 'Large cabin jet with Gulfstream signature ride.' },
  { id: 'plane-seed-54', airlineIdx: 3, name: 'Apex Crown',         model: 'Bombardier Challenger 605',     capacity: 12, pricePerHour: 5700,  description: 'Large cabin jet trusted by corporations worldwide.' },
  { id: 'plane-seed-55', airlineIdx: 3, name: 'Cirrus Monarch',     model: 'Gulfstream G300',               capacity: 14, pricePerHour: 6400,  description: 'Spacious mid-cabin with cross-continental range.' },
  { id: 'plane-seed-56', airlineIdx: 3, name: 'Prestige Liner',     model: 'Embraer Legacy 600',            capacity: 14, pricePerHour: 6200,  description: 'Airline-derived airliner comfort in private config.' },
  { id: 'plane-seed-57', airlineIdx: 3, name: 'Blue Ridge Flyer',   model: 'Dassault Falcon 50EX',          capacity: 10, pricePerHour: 5100,  description: 'Tri-engine intercontinental jet, proven reliability.' },
  { id: 'plane-seed-58', airlineIdx: 3, name: 'Cirrus Comet',       model: 'Bombardier Challenger 300',     capacity: 10, pricePerHour: 4800,  description: 'Super mid-size that redefined the category.' },
  { id: 'plane-seed-59', airlineIdx: 3, name: 'Executive Glide',    model: 'Cessna Citation X+',            capacity: 12, pricePerHour: 5300,  description: 'Fastest civilian jet approved for charter.' },
  { id: 'plane-seed-60', airlineIdx: 3, name: 'Altitude King',      model: 'Gulfstream GIV-SP',             capacity: 14, pricePerHour: 6700,  description: 'Proven ultra-long-range with exceptional resale value.' },

  // ── Meridian Flights (4) ──
  { id: 'plane-seed-61', airlineIdx: 4, name: 'Meridian Classic',   model: 'Hawker 900XP',                  capacity: 10, pricePerHour: 3600,  description: 'Proven mid-size jet with flat-floor cabin.' },
  { id: 'plane-seed-62', airlineIdx: 4, name: 'Atlantic Cruiser',   model: 'Gulfstream G550',               capacity: 18, pricePerHour: 8900,  description: 'Ultra-long-range workhorse trusted by heads of state.' },
  { id: 'plane-seed-63', airlineIdx: 4, name: 'Compass Rose',       model: 'Cessna Citation Longitude',     capacity: 12, pricePerHour: 5000,  description: 'Super mid-size with a whisper-quiet cabin.' },
  { id: 'plane-seed-64', airlineIdx: 4, name: 'Venture Jet',        model: 'Embraer Phenom 100',            capacity:  5, pricePerHour: 1600,  description: 'Entry-level VLJ for affordable city-pair travel.' },
  { id: 'plane-seed-65', airlineIdx: 4, name: 'Odyssey Ultra',      model: 'Dassault Falcon 2000LX',        capacity: 12, pricePerHour: 6800,  description: 'Long-range wide-body Falcon with top fuel economy.' },
  { id: 'plane-seed-66', airlineIdx: 4, name: 'Meridian Horizon',   model: 'Bombardier Challenger 850',     capacity: 15, pricePerHour: 6300,  description: 'Regional jet-derived wide cabin for group charters.' },
  { id: 'plane-seed-67', airlineIdx: 4, name: 'Trans-Atlantic One', model: 'Gulfstream G650',               capacity: 18, pricePerHour: 9500,  description: 'Benchmark ultra-long-range at Mach 0.925.' },
  { id: 'plane-seed-68', airlineIdx: 4, name: 'Meridian Arrow',     model: 'Bombardier Learjet 60 XR',      capacity:  8, pricePerHour: 3300,  description: 'Mid-size jet with exceptional high-altitude climb.' },
  { id: 'plane-seed-69', airlineIdx: 4, name: 'Silver Wing',        model: 'Cessna Citation Excel',         capacity:  9, pricePerHour: 3000,  description: 'Stand-up cabin light-to-mid-size jet.' },
  { id: 'plane-seed-70', airlineIdx: 4, name: 'Gulf Breeze',        model: 'Dassault Falcon 900EX',         capacity: 14, pricePerHour: 7100,  description: 'EASy-equipped tri-engine long-range jet.' },
  { id: 'plane-seed-71', airlineIdx: 4, name: 'Meridian Glider',    model: 'Hawker 750',                    capacity:  9, pricePerHour: 3200,  description: 'Mid-size jet optimised for short-to-medium sectors.' },
  { id: 'plane-seed-72', airlineIdx: 4, name: 'Pacific Pioneer',    model: 'Gulfstream GV-SP (G550)',       capacity: 16, pricePerHour: 8600,  description: 'Flagship ultra-long-range from Gulfstream.' },
  { id: 'plane-seed-73', airlineIdx: 4, name: 'Meridian Comet',     model: 'Embraer Legacy 450',            capacity: 10, pricePerHour: 4600,  description: 'Mid-size with fly-by-wire precision handling.' },
  { id: 'plane-seed-74', airlineIdx: 4, name: 'Sky Baron',          model: 'Bombardier Global 8000',        capacity: 19, pricePerHour: 12500, description: 'Longest-range purpose-built private jet ever made.' },
  { id: 'plane-seed-75', airlineIdx: 4, name: 'Meridian Elite',     model: 'Gulfstream G800',               capacity: 19, pricePerHour: 13200, description: 'Gulfstream\'s flagship — 8,000 nm non-stop.' },
]

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding SkyCharter database…\n')

  // 1. Passwords
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
  console.log('✔ Admin')

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
  console.log(`✔ ${airlineRecords.length} airline users`)

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
  console.log(`✔ ${bookerRecords.length} booking users`)

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
  console.log(`✔ ${planeRecords.length} planes`)

  // 6. Bookings — wipe seed bookings and recreate 1,000
  await prisma.booking.deleteMany({ where: { id: { startsWith: 'booking-seed-' } } })

  const bookingData = Array.from({ length: 1000 }, (_, i) => {
    const startDate = randDate(YEAR_START, YEAR_END)
    const durationHours = pick([2, 3, 4, 5, 6, 8, 10, 12])
    const note = pick(BOOKING_NOTES)
    // createdAt = 1–30 days before startDate so the dashboard chart
    // groups by a realistic booking-creation date, not the seed run date
    const createdAt = subDays(startDate, Math.ceil(Math.random() * 30))
    return {
      id: `booking-seed-${pad(i + 1, 4)}`,
      userId: pick(bookerRecords).id,
      planeId: pick(planeRecords).id,
      status: pick(STATUS_WEIGHTS),
      startDate,
      endDate: addHours(startDate, durationHours),
      createdAt,
      notes: note ?? undefined,
    }
  })

  // Insert in batches of 200 to avoid SQLite statement limits
  for (let i = 0; i < bookingData.length; i += 200) {
    await prisma.booking.createMany({ data: bookingData.slice(i, i + 200) })
  }
  console.log(`✔ ${bookingData.length} bookings`)

  // ── summary ──
  const monthly: Record<string, number> = {}
  bookingData.forEach((b) => {
    const m = b.startDate.toLocaleString('default', { month: 'short' })
    monthly[m] = (monthly[m] || 0) + 1
  })
  console.log('\n📅 Bookings per month:')
  console.table(monthly)

  console.log('\n📋 Sample credentials:')
  console.table([
    { role: 'ADMIN',   email: 'admin@skycharter.com', password: 'admin123'   },
    { role: 'AIRLINE', email: 'ops@skyjet.com',        password: 'airline123' },
    { role: 'BOOKING', email: 'alice.hartwell@example.com', password: 'booking123' },
  ])
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
