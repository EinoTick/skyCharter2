import { Router } from 'express'
import { prisma } from '@skycharter/database'
import { CreateBookingSchema, UpdateBookingStatusSchema } from '@skycharter/shared-types'
import { authenticate, AuthRequest } from '../middleware/auth'
import { checkRole } from '../middleware/checkRole'

const router = Router()

// GET /api/bookings  — scoped by role
router.get('/', authenticate, async (req: AuthRequest, res) => {
  const { role, userId } = req.user!

  const where =
    role === 'ADMIN'
      ? {}
      : role === 'AIRLINE'
      ? { plane: { airlineId: userId } }
      : { userId }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true } },
      plane: {
        select: {
          id: true,
          name: true,
          model: true,
          airline: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(bookings)
})

// GET /api/bookings/:id
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      plane: { include: { airline: { select: { id: true, name: true } } } },
    },
  })
  if (!booking) return res.status(404).json({ error: 'Booking not found' })

  const { role, userId } = req.user!
  if (role === 'BOOKING' && booking.userId !== userId) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  if (role === 'AIRLINE' && booking.plane.airlineId !== userId) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  res.json(booking)
})

// POST /api/bookings  — BOOKING users (and ADMIN)
router.post('/', authenticate, checkRole('BOOKING', 'ADMIN'), async (req: AuthRequest, res) => {
  const parsed = CreateBookingSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { planeId, startDate, endDate, notes } = parsed.data

  const plane = await prisma.plane.findUnique({ where: { id: planeId } })
  if (!plane || !plane.isAvailable) {
    return res.status(400).json({ error: 'Plane not available for booking' })
  }

  const booking = await prisma.booking.create({
    data: {
      userId: req.user!.userId,
      planeId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      notes,
      status: 'PENDING',
    },
    include: {
      plane: { select: { id: true, name: true, model: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  })
  res.status(201).json(booking)
})

// PATCH /api/bookings/:id/status  — AIRLINE (own planes) or ADMIN
router.patch(
  '/:id/status',
  authenticate,
  checkRole('AIRLINE', 'ADMIN'),
  async (req: AuthRequest, res) => {
    const parsed = UpdateBookingStatusSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { plane: true },
    })
    if (!booking) return res.status(404).json({ error: 'Booking not found' })

    if (req.user!.role === 'AIRLINE' && booking.plane.airlineId !== req.user!.userId) {
      return res.status(403).json({ error: 'Forbidden: not your plane' })
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: parsed.data.status },
    })
    res.json(updated)
  }
)

export default router
