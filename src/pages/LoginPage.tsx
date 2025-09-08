/**
 * ========================================
 * COMPONENTE LOGIN PAGE DE GEOPLANNER
 * ========================================
 * 
 * Página de inicio de sesión para usuarios existentes
 * de GeoPlanner. Permite autenticarse con email/username
 * y contraseña.
 * 
 * FUNCIONALIDADES PRINCIPALES:
 * - Formulario de login con validación
 * - Integración con el sistema de autenticación
 * - Navegación a registro para nuevos usuarios
 * - Manejo de errores de autenticación
 * - Diseño responsivo y accesible
 * 
 * IMPORTANTE PARA EL EQUIPO:
 * - Punto de entrada principal para usuarios existentes
 * - Debe ser seguro y confiable
 * - Integra con AuthContext para gestión de estado
 * - Maneja redirecciones automáticas
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import '../styles/LoginPage.css';

// Tipos de error para los modales
type ErrorType = 'credentials' | 'password' | 'connection' | 'server' | null;

interface LoginForm {
  username_or_email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginForm>({
    username_or_email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [errorType, setErrorType] = useState<ErrorType>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Limpiar error cuando el usuario empiece a escribir
    setErrorType(null);
    setShowErrorModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setErrorType(null);
    setShowErrorModal(false);

    try {
      // Usar el AuthContext para el login
      await login(formData.username_or_email, formData.password);
      
      // Si llegamos aquí, el login fue exitoso
      navigate('/dashboard');
    } catch (error) {
      let msg = 'Error de conexión. Verifica tu conexión a internet.';
      let type: ErrorType = 'connection';
      
      if (error instanceof Error) {
        if (error.message === 'Failed to fetch') {
          msg = 'No se pudo conectar con el servidor. Intenta más tarde.';
          type = 'server';
        } else if (
          error.message.toLowerCase().includes('credenciales inválidas') ||
          error.message.toLowerCase().includes('invalid credentials') ||
          error.message.toLowerCase().includes('user not found') ||
          error.message.toLowerCase().includes('usuario no encontrado')
        ) {
          msg = 'Correo/usuario o contraseña inválidos.';
          type = 'credentials';
        } else if (
          error.message.toLowerCase().includes('contraseña incorrecta') ||
          error.message.toLowerCase().includes('password incorrect') ||
          error.message.toLowerCase().includes('wrong password')
        ) {
          msg = 'La contraseña ingresada es incorrecta.';
          type = 'password';
        } else {
          msg = error.message;
          type = 'server';
        }
      }
      
      setError(msg);
      setErrorType(type);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRippleEffect = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    button.style.setProperty('--x', `${x}px`);
    button.style.setProperty('--y', `${y}px`);
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
    setErrorType(null);
  };

  const getErrorModalContent = () => {
    switch (errorType) {
      case 'credentials':
        return {
          title: 'Usuario o Correo Incorrecto',
          icon: '👤',
          message: 'El correo electrónico o nombre de usuario que ingresaste no está registrado en GeoPlanner.',
          suggestions: [
            'Verifica que el correo o usuario esté escrito correctamente',
            'Asegúrate de que no haya espacios adicionales',
            'Si no tienes una cuenta, puedes registrarte aquí'
          ],
          primaryAction: 'Intentar de nuevo',
          secondaryAction: 'Registrarse'
        };
      case 'password':
        return {
          title: 'Contraseña Incorrecta',
          icon: '🔒',
          message: 'La contraseña que ingresaste no coincide con la cuenta.',
          suggestions: [
            'Verifica que la contraseña esté escrita correctamente',
            'Asegúrate de que las mayúsculas y minúsculas sean correctas',
            'Si olvidaste tu contraseña, puedes recuperarla'
          ],
          primaryAction: 'Intentar de nuevo',
          secondaryAction: 'Recuperar contraseña'
        };
      case 'connection':
        return {
          title: 'Error de Conexión',
          icon: '🌐',
          message: 'No se pudo establecer conexión con el servidor de GeoPlanner.',
          suggestions: [
            'Verifica tu conexión a internet',
            'Asegúrate de que no haya problemas de red',
            'Intenta nuevamente en unos momentos'
          ],
          primaryAction: 'Reintentar',
          secondaryAction: 'Verificar conexión'
        };
      case 'server':
        return {
          title: 'Error del Servidor',
          icon: '⚙️',
          message: 'El servidor de GeoPlanner está experimentando problemas temporales.',
          suggestions: [
            'El problema es temporal, intenta nuevamente en unos minutos',
            'Si el problema persiste, contacta al soporte técnico',
            'Puedes verificar el estado del servicio'
          ],
          primaryAction: 'Reintentar',
          secondaryAction: 'Contactar soporte'
        };
      default:
        return {
          title: 'Error de Inicio de Sesión',
          icon: '❌',
          message: 'Ocurrió un error inesperado durante el inicio de sesión.',
          suggestions: [
            'Intenta nuevamente',
            'Si el problema persiste, contacta al soporte',
            'Verifica que todos los campos estén completos'
          ],
          primaryAction: 'Intentar de nuevo',
          secondaryAction: 'Cerrar'
        };
    }
  };

  const handleSecondaryAction = () => {
    switch (errorType) {
      case 'credentials':
        navigate('/registro');
        break;
      case 'password':
        navigate('/recuperar');
        break;
      case 'connection':
        window.open('https://www.speedtest.net/', '_blank');
        break;
      case 'server':
        window.open('mailto:soporte@geoplanner.com', '_blank');
        break;
      default:
        closeErrorModal();
    }
  };

  return (
    <div className="login-page">
      <main className="login-main">
        <div className="login-container text-center">
          <div className="logo-drop text-center">
            <img src="/src/assets/img/Logo.png" alt="Logo GeoPlanner" className="logo-spin w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">Bienvenido a GeoPlanner</h2>
          <p className="tagline text-sm sm:text-base">Planifica, organiza y colabora desde el mapa.</p>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Correo o Usuario</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                id="username_or_email"
                name="username_or_email"
                placeholder="Correo o usuario"
                value={formData.username_or_email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Contraseña</span>
              </label>
              <input
                type="password"
                className="input input-bordered w-full"
                id="password"
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            
            {error && (
              <div className="alert alert-error" role="alert">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{error}</span>
              </div>
            )}
            
            <button 
              type="submit" 
              className="btn btn-custom w-full"
              disabled={isLoading}
              onMouseDown={handleRippleEffect}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="divider">O</div>
          <p className="text-xs sm:text-sm">¿Nuevo en GeoPlanner? <a href="/registro" className="link link-primary">Regístrate aquí</a></p>
          <p className="text-xs sm:text-sm"><a href="/forgot-password" className="link link-primary">¿Olvidó su contraseña o no puede ingresar?</a></p>
        </div>
      </main>

      {/* Modal de Error */}
      {showErrorModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm sm:max-w-md mx-4">
            <div className="text-center">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">{getErrorModalContent().icon}</div>
              <h3 className="font-bold text-base sm:text-lg mb-2">{getErrorModalContent().title}</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">{getErrorModalContent().message}</p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
                <h4 className="font-semibold text-blue-800 mb-1 sm:mb-2 text-sm">Sugerencias:</h4>
                <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
                  {getErrorModalContent().suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="modal-action flex-col sm:flex-row gap-2">
              <button 
                className="btn btn-outline btn-sm sm:btn-md w-full sm:w-auto" 
                onClick={closeErrorModal}
              >
                {getErrorModalContent().primaryAction}
              </button>
              <button 
                className="btn btn-primary btn-sm sm:btn-md w-full sm:w-auto" 
                onClick={handleSecondaryAction}
              >
                {getErrorModalContent().secondaryAction}
              </button>
            </div>
          </div>
          
          {/* Overlay para cerrar el modal */}
          <div 
            className="modal-backdrop" 
            onClick={closeErrorModal}
          ></div>
        </div>
      )}

      <footer className="footer-bar">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row flex-wrap justify-between items-center gap-2 sm:gap-0">
          <span className="footer-text text-xs sm:text-sm text-center sm:text-left">© 2025 GeoPlanner. Todos los derechos reservados — Creado por The GeoPlanner Group.</span>
          <div className="footer-links flex flex-wrap gap-3 justify-center sm:justify-end">
            <a href="/terminos" className="footer-link text-xs sm:text-sm" target="_blank">Términos</a>
            <a href="/privacidad" className="footer-link text-xs sm:text-sm" target="_blank">Privacidad</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage; 