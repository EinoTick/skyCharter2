import { Router } from 'express'
import { prisma } from '@skycharter/database'
import { UpdateAirlineNameSchema } from '@skycharter/shared-types'
import { authenticate, AuthRequest } from '../middleware/auth'
import { checkRole } from '../middleware/checkRole'

const router = Router()

// GET /api/airlines
// - ADMIN: list all airlines
// - AIRLINE: return only self
router.get('/', authenticate, checkRole('ADMIN', 'AIRLINE'), async (req: AuthRequest, res) => {
  const { role, userId } = req.user!

  const where = role === 'ADMIN' ? { role: 'AIRLINE' } : { id: userId, role: 'AIRLINE' }

  const items = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      _count: {
        select: {
          planes: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  res.json(items)
})

// PATCH /api/airlines/:id
// - ADMIN only: update airline name
router.patch('/:id', authenticate, checkRole('ADMIN'), async (req: AuthRequest, res) => {
  const parsed = UpdateAirlineNameSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const airline = await prisma.user.findUnique({ where: { id: req.params.id } })
  if (!airline || airline.role !== 'AIRLINE') {
    return res.status(404).json({ error: 'Airline not found' })
  }

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { name: parsed.data.name },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      _count: {
        select: {
          planes: true,
        },
      },
    },
  })

  res.json(updated)
})

export default router

