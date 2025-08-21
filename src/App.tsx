import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import LoginPage from './components/LoginPage'
import RegisterStep1 from './components/RegisterStep1'
import RegisterStep2 from './components/RegisterStep2'
import RegisterStep3 from './components/RegisterStep3'
import Dashboard from './components/Dashboard'
import ProfilePage from './components/ProfilePage'
import PublicProfilePage from './components/PublicProfilePage'


import { AuthProvider, useAuth } from './contexts/AuthContext'
import './App.css'

// Componente para proteger rutas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Componente para rutas públicas (redirigir si ya está autenticado)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route path="/registro" element={
        <PublicRoute>
          <RegisterStep1 />
        </PublicRoute>
      } />
      <Route path="/registro/paso1" element={
        <PublicRoute>
          <RegisterStep1 />
        </PublicRoute>
      } />
      <Route path="/registro/paso2" element={
        <PublicRoute>
          <RegisterStep2 />
        </PublicRoute>
      } />
      <Route path="/registro/paso3" element={
        <PublicRoute>
          <RegisterStep3 />
        </PublicRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/perfil" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/usuario/:userId" element={
        <ProtectedRoute>
          <PublicProfilePage />
        </ProtectedRoute>
      } />

    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
