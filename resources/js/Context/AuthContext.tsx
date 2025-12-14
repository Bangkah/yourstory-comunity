import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../Services/api'

interface User {
  id: number
  name: string
  email: string
  role?: string
  followers_count?: number
  following_count?: number
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize auth from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }

    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      const { token: newToken, user: newUser } = await api.login({
        email,
        password,
      })
      setToken(newToken)
      setUser(newUser)
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Login failed. Please try again.'
      setError(message)
      throw err
    }
  }

  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) => {
    try {
      setError(null)
      const { token: newToken, user: newUser } = await api.register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
      setToken(newToken)
      setUser(newUser)
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        'Registration failed. Please try again.'
      setError(message)
      throw err
    }
  }

  const logout = async () => {
    try {
      await api.logout()
    } finally {
      setToken(null)
      setUser(null)
    }
  }

  const value: AuthContextType = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
