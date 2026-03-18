import { Router } from 'express'
import bcrypt from 'bcrypt'
import { prisma } from '@skycharter/database'
import { UpdateProfileSchema, ChangePasswordSchema } from '@skycharter/shared-types'
import { authenticate, AuthRequest } from '../middleware/auth'
import { checkRole } from '../middleware/checkRole'

const router = Router()

// GET /api/users  — ADMIN only: list all users
router.get('/', authenticate, checkRole('ADMIN'), async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  res.json(users)
})

// GET /api/users/me  — current user's profile
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json(user)
})

// PATCH /api/users/me  — update name / email
router.patch('/me', authenticate, async (req: AuthRequest, res) => {
  const parsed = UpdateProfileSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const updated = await prisma.user.update({
    where: { id: req.user!.userId },
    data: parsed.data,
    select: { id: true, name: true, email: true, role: true },
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
