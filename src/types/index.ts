// Tipos para el tema
export type Theme = 'light' | 'dark' | 'geoplanner'

// Tipos para las características
export interface Feature {
  title: string
  description: string
  imageSrc: string
  imageAlt: string
  buttonText: string
  onButtonClick?: () => void
}

// Tipos para las estadísticas
export interface StatItem {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  color: string
}

// Tipos para proyectos
export interface Project {
  id: string
  name: string
  description: string
  createdAt: Date
  updatedAt: Date
  status: 'active' | 'archived' | 'draft'
  tags: string[]
  thumbnail?: string
}

// Tipos para mapas
export interface MapLayer {
  id: string
  name: string
  type: 'vector' | 'raster' | 'tile'
  visible: boolean
  opacity: number
  source: string
}

export interface MapProject {
  id: string
  name: string
  description: string
  center: [number, number]
  zoom: number
  layers: MapLayer[]
  createdAt: Date
  updatedAt: Date
}

// Tipos para análisis
export interface Analysis {
  id: string
  name: string
  type: 'buffer' | 'intersection' | 'overlay' | 'statistics'
  parameters: Record<string, unknown>
  results: unknown
  createdAt: Date
  status: 'pending' | 'running' | 'completed' | 'failed'
}

// Tipos para usuarios
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'user' | 'viewer'
  preferences: {
    theme: Theme
    language: string
    notifications: boolean
  }
} 