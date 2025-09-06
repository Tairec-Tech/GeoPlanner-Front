/**
 * ========================================
 * CONTEXTO DE AUTENTICACIÓN DE GEOPLANNER
 * ========================================
 * 
 * Gestiona el estado de autenticación global de la aplicación,
 * incluyendo login, registro, logout y verificación de tokens.
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * - Gestión de tokens JWT
 * - Verificación automática de autenticación
 * - Pantalla de carga con delays diferenciados:
 *   * Login: 1.5s (para tapar parpadeo del dashboard)
 *   * Registro/Verificación: 1s (delay estándar)
 * - Manejo de errores de autenticación
 * 
 * IMPORTANTE PARA EL EQUIPO:
 * - Delay extendido en login evita parpadeo de colores
 * - Mantiene consistencia visual
 * - Centraliza toda la lógica de auth
 * - Integra con el sistema de rutas protegidas
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { apiService } from '../services/api'
import type { User } from '../services/api'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { useAuth }

interface AuthProviderProps {
  children: ReactNode
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar si hay un token al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      const startTime = Date.now()
      const token = localStorage.getItem('authToken')
      
      if (token) {
        try {
          const currentUser = await apiService.getCurrentUser()
          setUser(currentUser)
        } catch (error) {
          console.error('Error verificando autenticación:', error)
          apiService.clearToken()
        }
      }
      
      // Delay estándar para verificación inicial (1s)
      const elapsedTime = Date.now() - startTime
      const minLoadingTime = 1000 // 1 segundo para verificación inicial
      
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime))
      }
      
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true)
      const startTime = Date.now()
      
      const response = await apiService.login({ username_or_email: username, password })
      setUser(response.user)
      
      // Delay extendido para login (1.5s) para tapar el parpadeo del dashboard
      const elapsedTime = Date.now() - startTime
      const minLoadingTime = 1500 // 1.5 segundos para login
      
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime))
      }
    } catch (error) {
      console.error('Error en login:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: any) => {
    try {
      setIsLoading(true)
      const startTime = Date.now()
      
      const newUser = await apiService.register(userData)
      setUser(newUser)
      
      // Delay estándar para registro (1s)
      const elapsedTime = Date.now() - startTime
      const minLoadingTime = 1000 // 1 segundo para registro
      
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime))
      }
    } catch (error) {
      console.error('Error en registro:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    apiService.clearToken()
    setUser(null)
  }

  const updateUser = async (userData: Partial<User>) => {
    if (!user) throw new Error('No hay usuario autenticado')
    
    try {
      setIsLoading(true)
      const response = await apiService.updateCurrentUserProfile(userData)
      setUser(response.usuario)
    } catch (error) {
      console.error('Error actualizando usuario:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthProvider }
