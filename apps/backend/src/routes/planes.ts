import { Router } from 'express'
import { prisma } from '@skycharter/database'
import { CreatePlaneSchema, UpdatePlaneSchema } from '@skycharter/shared-types'
import { authenticate, AuthRequest } from '../middleware/auth'
import { checkRole } from '../middleware/checkRole'

const router = Router()

// GET /api/planes  — all authenticated users
router.get('/', authenticate, async (req: AuthRequest, res) => {
  const { search } = req.query
  const { role, userId } = req.user!
  const planes = await prisma.plane.findMany({
    where: {
      ...(role === 'AIRLINE' ? { airlineId: userId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: String(search) } },
              { model: { contains: String(search) } },
            ],
          }
        : {}),
    },
    include: { airline: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(planes)
})

// GET /api/planes/:id
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  const plane = await prisma.plane.findUnique({
    where: { id: req.params.id },
    include: { airline: { select: { id: true, name: true, email: true } } },
  })
  if (!plane) return res.status(404).json({ error: 'Plane not found' })
  res.json(plane)
})

// POST /api/planes  — AIRLINE or ADMIN
router.post('/', authenticate, checkRole('AIRLINE', 'ADMIN'), async (req: AuthRequest, res) => {
  const parsed = CreatePlaneSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  let airlineId: string
  if (req.user!.role === 'ADMIN') {
    if (!req.body.airlineId || typeof req.body.airlineId !== 'string') {
      return res.status(400).json({ error: 'airlineId is required for admin-created planes' })
    }
    const airline = await prisma.user.findUnique({ where: { id: req.body.airlineId } })
    if (!airline || airline.role !== 'AIRLINE') {
      return res.status(400).json({ error: 'Selected airline is invalid' })
    }
    airlineId = airline.id
  } else {
    airlineId = req.user!.userId
  }

  const plane = await prisma.plane.create({
    data: { ...parsed.data, airlineId },
    include: { airline: { select: { id: true, name: true } } },
  })
  res.status(201).json(plane)
})

// PATCH /api/planes/:id  — AIRLINE (own) or ADMIN
router.patch('/:id', authenticate, checkRole('AIRLINE', 'ADMIN'), async (req: AuthRequest, res) => {
  const parsed = UpdatePlaneSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const plane = await prisma.plane.findUnique({ where: { id: req.params.id } })
  if (!plane) return res.status(404).json({ error: 'Plane not found' })

  if (req.user!.role === 'AIRLINE' && plane.airlineId !== req.user!.userId) {
    return res.status(403).json({ error: 'You do not own this plane' })
  }

  const updated = await prisma.plane.update({
    where: { id: req.params.id },
    data: parsed.data,
  })
  res.json(updated)
})

// DELETE /api/planes/:id  — AIRLINE (own) or ADMIN
router.delete('/:id', authenticate, checkRole('AIRLINE', 'ADMIN'), async (req: AuthRequest, res) => {
  const plane = await prisma.plane.findUnique({ where: { id: req.params.id } })
  if (!plane) return res.status(404).json({ error: 'Plane not found' })

  if (req.user!.role === 'AIRLINE' && plane.airlineId !== req.user!.userId) {
    return res.status(403).json({ error: 'You do not own this plane' })
  }

  await prisma.plane.delete({ where: { id: req.params.id } })
  res.status(204).send()
})

export default router
