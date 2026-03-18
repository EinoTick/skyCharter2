import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plane, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: wire up a backend /auth/forgot-password endpoint
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-2">
            <Plane className="text-primary" size={32} />
            <h1 className="text-2xl font-bold text-primary">SkyCharter</h1>
          </div>
          <h2 className="card-title text-lg">Reset Password</h2>

          {submitted ? (
            <div className="alert alert-success mt-2">
              <span>If that email is registered, a reset link will be sent shortly.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email address</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <button type="submit" className="btn btn-primary w-full">
                Send Reset Link
              </button>
            </form>
          )}

          <Link to="/login" className="flex items-center gap-1 link link-primary text-sm mt-3">
            <ArrowLeft size={14} /> Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
