import { PrismaClient } from '@prisma/client'
import path from 'path'

export { PrismaClient }
export * from '@prisma/client'

// Resolve the database URL to an absolute path.
// SQLite `file:` paths are relative to the *process CWD*, which differs
// depending on which workspace runs the server. Using __dirname (this file's
// directory) makes the path stable regardless of CWD.
// For PostgreSQL (production): set DATABASE_URL to a full postgres:// string
// and it will be used as-is.
function resolveDbUrl(): string {
  const url = process.env.DATABASE_URL

  // Postgres or other non-file URLs — pass through unchanged
  if (url && !url.startsWith('file:')) return url

  // Absolute file path — pass through unchanged
  if (url && url.startsWith('file:/')) return url

  // Relative file path or no URL — resolve to absolute using __dirname
  // __dirname here = packages/database/src  →  dev.db lives one level up
  const dbPath = path.resolve(__dirname, '..', 'dev.db')
  return `file:${dbPath}`
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: { db: { url: resolveDbUrl() } },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
