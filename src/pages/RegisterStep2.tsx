/**
 * ========================================
 * COMPONENTE REGISTRO PASO 2 DE GEOPLANNER
 * ========================================
 * 
 * Segundo paso del proceso de registro de nuevos usuarios
 * en GeoPlanner. Recopila credenciales de acceso.
 * 
 * CONFIGURACIONES IMPORTANTES:
 * 
 * 1. VALIDACIÓN DE CONTRASEÑA (líneas 50-100):
 *    - Longitud mínima: 8 caracteres
 *    - Requisitos: mayúscula, minúscula, número, símbolo
 *    - Para cambiar requisitos, modifica checkPasswordStrength
 *    - Para agregar nuevos criterios, añádelos en la función
 * 
 * 2. VERIFICACIÓN DE DISPONIBILIDAD (líneas 150-200):
 *    - Username: Verifica que no exista en la base de datos
 *    - Email: Verifica formato y disponibilidad
 *    - Para cambiar la lógica, modifica checkUsernameAvailability
 *    - Para agregar más validaciones, añádelas aquí
 * 
 * 3. CAMPOS OBLIGATORIOS (líneas 250-300):
 *    - username, email, password, confirmPassword
 *    - Para agregar/quitar campos, modifica isFormValid
 *    - Para cambiar validaciones, modifica las funciones
 * 
 * 4. ALMACENAMIENTO TEMPORAL (líneas 350-400):
 *    - sessionStorage: 'registroStep2'
 *    - Para cambiar el nombre de la clave, modifica aquí
 *    - Para agregar más datos, añádelos al objeto formData
 * 
 * 5. NAVEGACIÓN (líneas 450-500):
 *    - handleNext: Navega a /registro/paso3
 *    - handleBack: Regresa a /registro/paso1
 *    - Para cambiar rutas, modifica navigate()
 * 
 * 6. MENSAJES DE ERROR (líneas 550-650):
 *    - Modales para username/email duplicados
 *    - Para cambiar mensajes, modifica los textos
 *    - Para agregar nuevos tipos de error, añade modales
 * 
 * FUNCIONALIDADES ACTUALES:
 * - Formulario de credenciales (username, email, password)
 * - Validación de disponibilidad de username y email
 * - Evaluación de fortaleza de contraseña en tiempo real
 * - Verificación de formato de email
 * - Confirmación de contraseña
 * - Navegación entre pasos
 * 
 * VALIDACIONES IMPLEMENTADAS:
 * - Username único y disponible
 * - Email válido y único
 * - Contraseña fuerte (8+ chars, mayúscula, minúscula, número, símbolo)
 * - Confirmación de contraseña
 * - Campos obligatorios completos
 * 
 * CRITERIOS DE CONTRASEÑA:
 * - Mínimo 8 caracteres
 * - Al menos una mayúscula
 * - Al menos una minúscula
 * - Al menos un número
 * - Al menos un símbolo especial
 * - Evitar patrones comunes (consejo)
 * 
 * UBICACIÓN DE ARCHIVOS:
 * - Estilos: src/components/RegisterStep2.css
 * - Paso anterior: src/components/RegisterStep1.tsx
 * - Siguiente paso: src/components/RegisterStep3.tsx
 * - API: src/services/api.ts (verificación de disponibilidad)
 * 
 * NOTA: Las credenciales se validan contra el backend antes de continuar
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, apiRequest } from '../config/api';
import '../styles/RegisterStep2.css';

interface CredentialsInfo {
  nombreUsuario: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
}

interface Step1Data {
  nombre: string;
  apellido: string;
  day: string;
  month: string;
  year: string;
  genero: string;
  otroGenero: string;
}

const RegisterStep2: React.FC = () => {
  const [formData, setFormData] = useState<CredentialsInfo>({
    nombreUsuario: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string>('');
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: 'red'
  });
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const navigate = useNavigate();

  // Función para validar email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Función para evaluar la fortaleza de la contraseña
  const evaluatePasswordStrength = (password: string): PasswordStrength => {
    const feedback: string[] = [];
    let score = 0;

    // Longitud mínima
    if (password.length < 8) {
      feedback.push('Al menos 8 caracteres');
    } else {
      score += 1;
    }

    // Mayúsculas
    if (!/[A-Z]/.test(password)) {
      feedback.push('Al menos una mayúscula');
    } else {
      score += 1;
    }

    // Minúsculas
    if (!/[a-z]/.test(password)) {
      feedback.push('Al menos una minúscula');
    } else {
      score += 1;
    }

    // Números
    if (!/\d/.test(password)) {
      feedback.push('Al menos un número');
    } else {
      score += 1;
    }

    // Símbolos especiales
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      feedback.push('Al menos un símbolo especial');
    } else {
      score += 1;
    }

    // Consejos sobre patrones comunes (no penaliza la puntuación)
    const commonPatterns = [
      /123/, /abc/, /qwe/, /password/, /admin/, /user/, /test/,
      /\d{4,}/, // Secuencias de números
      /[a-z]{4,}/, // Secuencias de letras
      /\d{2,}[a-z]{2,}|\d{2,}[A-Z]{2,}/ // Combinaciones simples
    ];

    const hasCommonPattern = commonPatterns.some(pattern => pattern.test(password.toLowerCase()));
    if (hasCommonPattern) {
      feedback.push('💡 Consejo: Evita patrones comunes como 123, abc, password, etc.');
    }

    // Determinar color basado en el score
    let color = 'red';
    if (score >= 4) color = 'green';
    else if (score >= 3) color = 'orange';
    else if (score >= 2) color = 'yellow';

    return { score, feedback, color };
  };

  // Función para verificar si el usuario existe
  const checkUserExists = async (username: string): Promise<boolean> => {
    try {
      const response = await apiRequest(`${API_ENDPOINTS.CHECK_USERNAME}/${username}`);
      if (response.ok) {
        const data = await response.json();
        return data.exists; // Retorna true si existe, false si está disponible
      }
      return false;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  };

  // Función para verificar si el email existe
  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const response = await apiRequest(`${API_ENDPOINTS.CHECK_EMAIL}/${email}`);
      if (response.ok) {
        const data = await response.json();
        return data.exists; // Retorna true si existe, false si está disponible
      }
      return false;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  useEffect(() => {
    // Recuperar datos del paso 1
    const step1Data = sessionStorage.getItem('registerStep1');
    if (!step1Data) {
      navigate('/registro/paso1');
      return;
    }
    setStep1Data(JSON.parse(step1Data));
  }, [navigate]);

  // Validar formulario completo
  useEffect(() => {
    const isValid = formData.nombreUsuario.trim() !== '' &&
                   validateEmail(formData.email) &&
                   formData.password.length >= 8 &&
                   formData.password === formData.confirmPassword &&
                   passwordStrength.score >= 3;
    
    setIsFormValid(isValid);
  }, [formData, passwordStrength]);

  // Evaluar fortaleza de contraseña cuando cambie
  useEffect(() => {
    if (formData.password) {
      const strength = evaluatePasswordStrength(formData.password);
      setPasswordStrength(strength);
    }
  }, [formData.password]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones básicas
    if (!formData.nombreUsuario.trim()) {
      setError('Por favor ingresa un nombre de usuario');
      setShowErrorModal(true);
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Por favor ingresa un email válido');
      setShowErrorModal(true);
      return;
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setShowErrorModal(true);
      return;
    }

    if (passwordStrength.score < 3) {
      setError('La contraseña no cumple con los requisitos de seguridad mínimos');
      setShowErrorModal(true);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setShowErrorModal(true);
      return;
    }

    // Verificar si el usuario ya existe
    const userExists = await checkUserExists(formData.nombreUsuario);
    if (userExists) {
      setError('El nombre de usuario ya está en uso. Por favor elige otro.');
      setShowErrorModal(true);
      return;
    }

    // Verificar si el email ya existe
    const emailExists = await checkEmailExists(formData.email);
    if (emailExists) {
      setError('El email ya está registrado. Por favor usa otro email o inicia sesión.');
      setShowErrorModal(true);
      return;
    }

    try {
      // Enviar email de verificación
      const verificationResponse = await apiRequest(API_ENDPOINTS.SEND_VERIFICATION, {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email,
          username: formData.nombreUsuario
        })
      });

      if (verificationResponse.ok) {
        // Combinar datos del paso 1 y 2
        const combinedData = {
          ...step1Data,
          ...formData
        };
        
        console.log('Datos combinados a guardar:', combinedData); // Debug
        
        // Guardar datos combinados en sessionStorage
        sessionStorage.setItem('registroStep2', JSON.stringify(combinedData));
        sessionStorage.setItem('registerStep1', JSON.stringify(step1Data));
        
        console.log('Datos guardados en sessionStorage:', {
          registroStep2: sessionStorage.getItem('registroStep2'),
          registerStep1: sessionStorage.getItem('registerStep1')
        }); // Debug
        
        // Navegar a página de verificación en lugar de paso 3
        navigate('/verificar-email');
      } else {
        const errorData = await verificationResponse.json();
        setError(`Error enviando email de verificación: ${errorData.detail || 'Error desconocido'}`);
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      setError('Error de conexión. Verifica tu internet.');
      setShowErrorModal(true);
    }
  };

  const handleBack = () => {
    navigate('/registro/paso1');
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
    setError('');
  };

  if (!step1Data) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="register-page">
      <main className="register-main">
        <div className="register-container text-center">
          <div className="logo-drop text-center">
            <img src="/src/assets/img/Logo.png" alt="Logo GeoPlanner" className="logo-spin w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" />
          </div>
          
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">Crea tus credenciales</h2>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm sm:text-base font-medium">@Nombre de usuario</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full text-sm sm:text-base"
                name="nombreUsuario"
                placeholder="@usuario"
                value={formData.nombreUsuario}
                onChange={handleInputChange}
                required
              />
              <div className="label">
                <span className="label-text-alt text-light text-xs sm:text-sm">
                  Este será tu @nombre único dentro de GeoPlanner.
                </span>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm sm:text-base font-medium">Correo electrónico</span>
              </label>
              <input
                type="email"
                className="input input-bordered w-full text-sm sm:text-base"
                name="email"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm sm:text-base font-medium">Contraseña</span>
              </label>
              <input
                type="password"
                className="input input-bordered w-full text-sm sm:text-base"
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              
              {/* Sistema de validación de contraseña mejorado */}
              {formData.password && (
                <div className="password-strength-indicator">
                  <div className="strength-bars">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`strength-bar ${
                          level <= passwordStrength.score
                            ? passwordStrength.color
                            : 'inactive'
                        }`}
                        style={{ width: '20%' }}
                      />
                    ))}
                  </div>
                  
                  <div className={`strength-text ${passwordStrength.color}`}>
                    {passwordStrength.score >= 4 ? 'Excelente' :
                     passwordStrength.score >= 3 ? 'Buena' :
                     passwordStrength.score >= 2 ? 'Regular' : 'Débil'}
                  </div>
                  
                  <div className="password-requirements">
                    {passwordStrength.feedback.length > 0 ? (
                      passwordStrength.feedback.map((item, index) => (
                        <div key={index} className={`requirement-item ${passwordStrength.color}`}>
                          <span className="requirement-icon">✗</span>
                          {item}
                        </div>
                      ))
                    ) : (
                      <div className="requirement-item green">
                        <span className="requirement-icon">✓</span>
                        Contraseña segura
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm sm:text-base font-medium">Confirmar contraseña</span>
              </label>
              <input
                type="password"
                className="input input-bordered w-full text-sm sm:text-base"
                name="confirmPassword"
                placeholder="Confirmar contraseña"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <div className="label">
                  <span className="label-text-alt text-red-500 text-xs sm:text-sm">Las contraseñas no coinciden</span>
                </div>
              )}
            </div>

            {error && (
              <div className="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-base">{error}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
              <button 
                type="button" 
                className="btn btn-outline text-sm sm:text-base"
                onClick={handleBack}
              >
                Volver
              </button>
              <button 
                type="submit" 
                className="btn btn-custom text-sm sm:text-base"
                disabled={!isFormValid}
                style={{ opacity: isFormValid ? 1 : 0.5, cursor: isFormValid ? 'pointer' : 'not-allowed' }}
              >
                Continuar
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Modal de Error */}
      {showErrorModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm sm:max-w-md mx-4">
            <h3 className="font-bold text-base sm:text-lg text-red-600">Error de Validación</h3>
            <p className="py-3 sm:py-4 text-sm sm:text-base">{error}</p>
            <div className="modal-action">
              <button className="btn btn-primary btn-sm sm:btn-md" onClick={closeErrorModal}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RegisterStep2; 