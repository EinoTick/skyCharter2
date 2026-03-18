import './env' // must be first — loads .env before any other module reads process.env
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import authRoutes from './routes/auth'
import planeRoutes from './routes/planes'
import bookingRoutes from './routes/bookings'
import userRoutes from './routes/users'

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet())
const corsOrigin =
  process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL!
    : (origin: string | undefined, cb: (e: Error | null, allow?: boolean) => void) =>
        cb(null, true) // allow all origins in development

app.use(cors({ origin: corsOrigin, credentials: true }))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/planes', planeRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/users', userRoutes)

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`✈️  SkyCharter backend running on http://localhost:${PORT}`)
})

export default app
