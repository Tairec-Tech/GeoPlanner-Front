/**
 * ========================================
 * COMPONENTE PRINCIPAL DE GEOPLANNER
 * ========================================
 * 
 * Este es el componente raíz de la aplicación GeoPlanner.
 * Aquí se configura toda la estructura de la aplicación:
 * - Providers de contexto (AuthContext)
 * - Enrutamiento con React Router
 * - Configuración de rutas principales
 * 
 * CONFIGURACIONES IMPORTANTES:
 * 
 * 1. AGREGAR NUEVAS RUTAS (líneas 80-120):
 *    - Añade nuevas rutas en la función AppRoutes()
 *    - Estructura: <Route path="/ruta" element={<Componente />} />
 *    - Para rutas protegidas, usa <ProtectedRoute>
 *    - Para rutas públicas, usa directamente el componente
 * 
 * 2. AGREGAR NUEVOS PROVIDERS (líneas 130-140):
 *    - Si necesitas contextos globales, agrégalos aquí
 *    - Ejemplo: <ThemeProvider>, <ReduxProvider>
 *    - Estructura: <Provider><Router><AppRoutes /></Router></Provider>
 * 
 * 3. IMPORTAR NUEVOS COMPONENTES (líneas 2-9):
 *    - Añade imports para nuevos componentes de página
 *    - Ubicación: src/components/NombreComponente.tsx
 *    - Ejemplo: import MiPagina from './components/MiPagina'
 * 
 * 4. CONFIGURAR RUTAS PROTEGIDAS (líneas 15-35):
 *    - ProtectedRoute asegura autenticación
 *    - Si cambias la lógica de autenticación, modifica aquí
 *    - Ubicación del contexto: src/contexts/AuthContext.tsx
 * 
 * 5. CONFIGURAR REDIRECCIONES (líneas 110-120):
 *    - <Route path="*" element={<Navigate to="/" replace />}
 *    - Cambia "/" por la ruta por defecto que desees
 *    - replace evita que se guarde en el historial
 * 
 * ESTRUCTURA DE RUTAS ACTUAL:
 * - /: LandingPage (página de inicio)
 * - /login: LoginPage (inicio de sesión)
 * - /registro: RegisterStep1 (registro paso 1)
 * - /registro/paso2: RegisterStep2 (registro paso 2)
 * - /registro/paso3: RegisterStep3 (registro paso 3)
 * - /dashboard: Dashboard (panel principal) - PROTEGIDA
 * - /perfil: ProfilePage (perfil usuario) - PROTEGIDA
 * - /usuario/:userId: PublicProfilePage (perfil público) - PROTEGIDA
 * - /about: AboutUs (acerca de nosotros)
 * - /contact: Contact (contacto)
 * - /terms: TermsOfService (términos de uso)
 * - /privacy: PrivacyPolicy (política de privacidad)
 * - /cookies: CookiePolicy (política de cookies)
 * 
 * UBICACIÓN DE ARCHIVOS:
 * - Componentes de página: src/components/
 * - Contexto de autenticación: src/contexts/AuthContext.tsx
 * - Configuración de rutas: Este archivo (líneas 80-120)
 * 
 * NOTA: Cualquier cambio en las rutas debe reflejarse en la navegación
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterStep1 from './pages/RegisterStep1'
import RegisterStep2 from './pages/RegisterStep2'
import RegisterStep3 from './pages/RegisterStep3'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import ProfilePage from './pages/ProfilePage'
import PublicProfilePage from './pages/PublicProfilePage'
import GroupsPage from './pages/GroupsPage'
import GroupDetailPage from './pages/GroupDetailPage'
import AboutUs from './pages/AboutUs'
import Contact from './pages/Contact'
import TermsOfService from './pages/TermsOfService'
import PrivacyPolicy from './pages/PrivacyPolicy'
import CookiePolicy from './pages/CookiePolicy'



import { AuthProvider, useAuth } from './contexts/AuthContext'
import './App.css'

// Componente para proteger rutas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-container">
          <div className="logo-drop">
            <img src="/Logo.png" alt="Logo GeoPlanner" className="logo-spin" />
          </div>
          <p className="loading-text">Cargando GeoPlanner...</p>
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
      <div className="loading-screen">
        <div className="loading-container">
          <div className="logo-drop">
            <img src="/Logo.png" alt="Logo GeoPlanner" className="logo-spin" />
          </div>
          <p className="loading-text">Cargando GeoPlanner...</p>
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
      <Route path="/verificar-email" element={
        <PublicRoute>
          <VerifyEmail />
        </PublicRoute>
      } />
      <Route path="/forgot-password" element={
        <PublicRoute>
          <ForgotPassword />
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
      <Route path="/grupos" element={
        <ProtectedRoute>
          <GroupsPage />
        </ProtectedRoute>
      } />
      <Route path="/grupos/:groupId" element={
        <ProtectedRoute>
          <GroupDetailPage />
        </ProtectedRoute>
      } />

      {/* Páginas del Footer */}
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/cookies" element={<CookiePolicy />} />

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
