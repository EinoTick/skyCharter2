import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth'

/**
 * RBAC middleware. Pass one or more allowed roles.
 * Must be used after `authenticate`.
 *
 * Example:
 *   router.post('/', authenticate, checkRole('ADMIN', 'AIRLINE'), handler)
 */
export const checkRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: requires one of [${roles.join(', ')}]`,
      })
    }
    next()
  }
}
