import React from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/img/Logo.png'

interface HeaderProps {
  showAuthButtons?: boolean
  className?: string
}

const Header: React.FC<HeaderProps> = ({ showAuthButtons = true, className = '' }) => {
  const navigate = useNavigate()

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 flex items-center h-16 px-4 sm:px-6 border-b border-slate-500/30 bg-slate-900/50 backdrop-blur-sm ${className}`}>
      <div 
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate('/')}
      >
        <img src={logo} alt="Logo GeoPlanner" className="h-6 w-6 sm:h-8 sm:w-8" />
        <span 
          className="text-lg sm:text-xl font-bold gradient-text"
        >
          GeoPlanner
        </span>
      </div>
      
      {showAuthButtons && (
        <nav className="hidden sm:flex items-center gap-4 sm:gap-6 ml-auto">
          <button 
            onClick={() => navigate('/login')}
            className="text-sm sm:text-base font-medium text-slate-300 hover:text-cyan-400 transition-colors"
          >
            Iniciar Sesión
          </button>
          <button 
            onClick={() => navigate('/registro')}
            className="text-sm sm:text-base font-medium text-slate-300 hover:text-cyan-400 transition-colors"
          >
            Registrarse
          </button>
        </nav>
      )}
    </header>
  )
}

export default Header
