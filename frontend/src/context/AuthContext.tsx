import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { API_BASE } from '../utils/api'

interface User {
  role: string
  user_id: string
  username: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (loginType: string, username?: string, password?: string, empleadoId?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('jwt_token')
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser(payload)
      }
    } catch (error) {
      localStorage.removeItem('jwt_token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (loginType: string, username?: string, password?: string, empleadoId?: string) => {
    try {
      const response = await axios.post(`${API_BASE}/login`, {
        login_type: loginType,
        username,
        password,
        empleado_id: empleadoId
      })

      if (response.data.success) {
        const token = response.data.token
        localStorage.setItem('jwt_token', token)
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser(payload)
      }
    } catch (error) {
      throw new Error('Error en el login')
    }
  }

  const logout = async () => {
    try {
      await axios.post(`${API_BASE}/logout`)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('jwt_token')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
