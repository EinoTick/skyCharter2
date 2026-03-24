import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../lib/api'

export interface AuthUser {
  id: string
  name: string
  email: string
  phone?: string | null
  role: string
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    name: string
    email: string
    phone?: string
    password: string
    role: string
  }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('skycharter_token')
    if (stored) {
      setToken(stored)
      api.defaults.headers.common['Authorization'] = `Bearer ${stored}`
      api
        .get<AuthUser>('/users/me')
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('skycharter_token')
          setToken(null)
          delete api.defaults.headers.common['Authorization']
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await api.post<{ user: AuthUser; token: string }>('/auth/login', { email, password })
    const { user, token } = res.data
    localStorage.setItem('skycharter_token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
    setToken(token)
  }

  const register = async (data: {
    name: string
    email: string
    phone?: string
    password: string
    role: string
  }) => {
    const res = await api.post<{ user: AuthUser; token: string }>('/auth/register', data)
    const { user, token } = res.data
    localStorage.setItem('skycharter_token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
    setToken(token)
  }

  const logout = () => {
    localStorage.removeItem('skycharter_token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
