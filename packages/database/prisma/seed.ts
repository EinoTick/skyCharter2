import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding SkyCharter database…')

  const [adminPass, airlinePass, bookingPass] = await Promise.all([
    bcrypt.hash('admin123', 10),
    bcrypt.hash('airline123', 10),
    bcrypt.hash('booking123', 10),
  ])

  const admin = await prisma.user.upsert({
    where: { email: 'admin@skycharter.com' },
    update: {},
    create: { name: 'Admin User', email: 'admin@skycharter.com', password: adminPass, role: 'ADMIN' },
  })

  const airline = await prisma.user.upsert({
    where: { email: 'airline@skyjet.com' },
    update: {},
    create: { name: 'SkyJet Airlines', email: 'airline@skyjet.com', password: airlinePass, role: 'AIRLINE' },
  })

  const booker = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: { name: 'John Travolta', email: 'user@example.com', password: bookingPass, role: 'BOOKING' },
  })

  const plane1 = await prisma.plane.upsert({
    where: { id: 'plane-seed-001' },
    update: {},
    create: {
      id: 'plane-seed-001',
      name: 'Eagle One',
      model: 'Cessna Citation X',
      capacity: 12,
      pricePerHour: 4500,
      description: 'Luxury mid-size business jet with state-of-the-art avionics.',
      airlineId: airline.id,
    },
  })

  const plane2 = await prisma.plane.upsert({
    where: { id: 'plane-seed-002' },
    update: {},
    create: {
      id: 'plane-seed-002',
      name: 'Falcon Executive',
      model: 'Dassault Falcon 7X',
      capacity: 16,
      pricePerHour: 7200,
      description: 'Ultra-long-range business jet perfect for intercontinental travel.',
      airlineId: airline.id,
    },
  })

  await prisma.booking.upsert({
    where: { id: 'booking-seed-001' },
    update: {},
    create: {
      id: 'booking-seed-001',
      userId: booker.id,
      planeId: plane1.id,
      status: 'PENDING',
      startDate: new Date('2024-04-10T10:00:00Z'),
      endDate: new Date('2024-04-10T14:00:00Z'),
      notes: 'Business trip to New York',
    },
  })

  await prisma.booking.upsert({
    where: { id: 'booking-seed-002' },
    update: {},
    create: {
      id: 'booking-seed-002',
      userId: booker.id,
      planeId: plane2.id,
      status: 'ACCEPTED',
      startDate: new Date('2024-05-20T08:00:00Z'),
      endDate: new Date('2024-05-20T16:00:00Z'),
      notes: 'Intercontinental trip – Falcon preferred',
    },
  })

  console.log('✅ Seed complete!')
  console.table({
    admin: admin.email,
    airline: airline.email,
    booker: booker.email,
    planes: `${plane1.name}, ${plane2.name}`,
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
