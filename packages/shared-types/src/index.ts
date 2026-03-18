import { z } from 'zod'

// ---------------------------------------------------------------------------
// Role & Status constants
// These match the String values stored in the DB (no Prisma enums used).
// ---------------------------------------------------------------------------

export const UserRole = {
  ADMIN: 'ADMIN',
  AIRLINE: 'AIRLINE',
  BOOKING: 'BOOKING',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export const BookingStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
} as const

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus]

// ---------------------------------------------------------------------------
// Zod schemas – single source of truth for validation (frontend + backend)
// ---------------------------------------------------------------------------

export const UserRoleSchema = z.enum(['ADMIN', 'AIRLINE', 'BOOKING'])
export const BookingStatusSchema = z.enum(['PENDING', 'ACCEPTED', 'REJECTED'])

// Auth
export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: UserRoleSchema,
})

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Plane
export const CreatePlaneSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  model: z.string().min(1, 'Model is required'),
  capacity: z.number().int().positive('Capacity must be a positive integer'),
  pricePerHour: z.number().positive('Price must be positive'),
  description: z.string().optional(),
})

export const UpdatePlaneSchema = CreatePlaneSchema.partial()

// Booking
export const CreateBookingSchema = z.object({
  planeId: z.string().min(1, 'Plane is required'),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
  notes: z.string().optional(),
})

export const UpdateBookingStatusSchema = z.object({
  status: BookingStatusSchema,
})

// Profile
export const UpdateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
})

// Admin user management
export const UpdateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  role: UserRoleSchema.optional(),
})

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
})

// ---------------------------------------------------------------------------
// Inferred TypeScript types
// ---------------------------------------------------------------------------

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type CreatePlaneInput = z.infer<typeof CreatePlaneSchema>
export type UpdatePlaneInput = z.infer<typeof UpdatePlaneSchema>
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>
export type UpdateBookingStatusInput = z.infer<typeof UpdateBookingStatusSchema>
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>
