import { Router } from 'express'
import bcrypt from 'bcrypt'
import { prisma } from '@skycharter/database'
import { UpdateProfileSchema, ChangePasswordSchema, UpdateUserSchema, RegisterSchema } from '@skycharter/shared-types'
import { authenticate, AuthRequest } from '../middleware/auth'
import { checkRole } from '../middleware/checkRole'

const router = Router()

// GET /api/users  — ADMIN only: list all users
router.get('/', authenticate, checkRole('ADMIN'), async (req, res) => {
  const page = Math.max(1, Number(req.query.page ?? 1) || 1)
  const sizeRaw = Number(req.query.size ?? 50) || 50
  const size = Math.min(200, Math.max(1, sizeRaw))
  const skip = (page - 1) * size

  const [total, roleGroups, items] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: size,
    }),
  ])

  const countsByRole = roleGroups.reduce<Record<string, number>>((acc, g) => {
    acc[g.role] = g._count._all
    return acc
  }, {})

  res.json({ items, total, page, size, countsByRole })
})

// GET /api/users/me  — current user's profile
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
  })
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json(user)
})

// POST /api/users — ADMIN only: create user
router.post('/', authenticate, checkRole('ADMIN'), async (req: AuthRequest, res) => {
  const parsed = RegisterSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { name, email, phone, password, role } = parsed.data
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return res.status(409).json({ error: 'Email already in use' })

  const hashed = await bcrypt.hash(password, 10)
  const created = await prisma.user.create({
    data: { name, email, phone: phone || null, password: hashed, role },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
  })
  res.status(201).json(created)
})

// PATCH /api/users/me  — update name / email
router.patch('/me', authenticate, async (req: AuthRequest, res) => {
  const parsed = UpdateProfileSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const updated = await prisma.user.update({
    where: { id: req.user!.userId },
    data: parsed.data,
    select: { id: true, name: true, email: true, phone: true, role: true },
  })
  res.json(updated)
})

// PATCH /api/users/:id — ADMIN only: update name/email/role
router.patch('/:id', authenticate, checkRole('ADMIN'), async (req: AuthRequest, res) => {
  const parsed = UpdateUserSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: parsed.data,
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
  })
  res.json(updated)
})

// PATCH /api/users/me/password  — change password
router.patch('/me/password', authenticate, async (req: AuthRequest, res) => {
  const parsed = ChangePasswordSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } })
  if (!user) return res.status(404).json({ error: 'User not found' })

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.password)
  if (!valid) return res.status(400).json({ error: 'Current password is incorrect' })

  const hashed = await bcrypt.hash(parsed.data.newPassword, 10)
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })
  res.json({ message: 'Password updated successfully' })
})

// DELETE /api/users/:id  — ADMIN only
router.delete('/:id', authenticate, checkRole('ADMIN'), async (req: AuthRequest, res) => {
  await prisma.user.delete({ where: { id: req.params.id } })
  res.status(204).send()
})

export default router
