import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import '../styles/VerifyEmail.css';

interface VerificationData {
  email: string;
  username: string;
}

const VerifyEmail: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  
  const navigate = useNavigate();
  // const [searchParams] = useSearchParams();

  useEffect(() => {
    // Prevenir ejecución múltiple
    let isMounted = true;
    let redirectTimeout: NodeJS.Timeout;
    
    const loadVerificationData = () => {
      // Si la verificación ya fue exitosa, no hacer nada
      if (success) {
        console.log('Verificación ya exitosa, no cargando datos');
        return;
      }
      
      // Recuperar datos del registro
      const step2Data = sessionStorage.getItem('registroStep2');
      const step1Data = sessionStorage.getItem('registerStep1');
      
      console.log('Datos en sessionStorage:', { step2Data, step1Data }); // Debug
      
      if (!isMounted) return; // Evitar ejecución si componente se desmontó
      
      if (step2Data) {
        try {
          const data = JSON.parse(step2Data);
          console.log('Datos parseados:', data); // Debug
          
          if (isMounted) {
            const newData = {
              email: data.email,
              username: data.nombreUsuario
            };
            console.log('Estableciendo verificationData:', newData);
            setVerificationData(newData);
            return; // Salir aquí, no redirigir
          }
        } catch (error) {
          console.error('Error parseando datos:', error);
          // Si hay error parseando, intentar con step1
          if (step1Data && isMounted) {
            try {
              const data = JSON.parse(step1Data);
              setVerificationData({
                email: data.email || '',
                username: data.nombreUsuario || ''
              });
              return; // Salir aquí, no redirigir
            } catch (e) {
              console.error('Error parseando step1:', e);
              // Solo redirigir si realmente no hay datos válidos
              if (isMounted && !step2Data) {
                redirectTimeout = setTimeout(() => {
                  if (isMounted) navigate('/registro/paso1');
                }, 1000); // Esperar 1 segundo antes de redirigir
              }
            }
          } else if (isMounted && !step2Data) {
            // Solo redirigir si realmente no hay datos
            redirectTimeout = setTimeout(() => {
              if (isMounted) navigate('/registro/paso1');
            }, 1000); // Esperar 1 segundo antes de redirigir
          }
        }
      } else if (step1Data && isMounted) {
        // Si no hay step2, intentar con step1
        try {
          const data = JSON.parse(step1Data);
          setVerificationData({
            email: data.email || '',
            username: data.nombreUsuario || ''
          });
          return; // Salir aquí, no redirigir
        } catch (e) {
          console.error('Error parseando step1:', e);
          // Solo redirigir si realmente no hay datos válidos
          if (isMounted) {
            redirectTimeout = setTimeout(() => {
              if (isMounted) navigate('/registro/paso1');
            }, 1000); // Esperar 1 segundo antes de redirigir
          }
        }
      } else {
        // Solo redirigir si realmente no hay datos después de un tiempo
        console.log('No hay datos en sessionStorage, esperando antes de redirigir...');
        redirectTimeout = setTimeout(() => {
          if (isMounted) {
            console.log('Redirigiendo a paso1 después de timeout');
            navigate('/registro/paso1');
          }
        }, 2000); // Esperar 2 segundos antes de redirigir
      }
    };
    
    loadVerificationData();
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, [navigate, success]); // Agregar success como dependencia

  useEffect(() => {
    // Countdown para reenvío
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerification = async () => {
    if (!verificationData || !verificationCode.trim()) {
      setError('Por favor ingresa el código de verificación');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.VERIFY_EMAIL), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: verificationData.email,
          code: verificationCode.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        console.log('Verificación exitosa, preparando redirección a paso3...');
        
        // NO limpiar sessionStorage aquí - RegisterStep3 lo necesita
        // Los datos se limpiarán después del registro completo
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          console.log('Redirigiendo a paso3...');
          navigate('/registro/paso3');
        }, 2000);
      } else {
        setError(data.detail || 'Error en la verificación');
      }
    } catch (error) {
      setError('Error de conexión. Verifica tu internet.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!verificationData) return;

    setResendLoading(true);
    setError('');

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.RESEND_VERIFICATION), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: verificationData.email
        })
      });

      const data = await response.json();

      if (response.ok) {
        setCountdown(60); // 60 segundos de espera
        setError('');
      } else {
        setError(data.detail || 'Error reenviando código');
      }
    } catch (error) {
      setError('Error de conexión. Verifica tu internet.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToRegister = () => {
    navigate('/registro/paso2');
  };

  // Debug: mostrar estado actual
  console.log('Estado actual de verificationData:', verificationData);
  console.log('¿verificationData es null?', verificationData === null);
  console.log('¿verificationData es undefined?', verificationData === undefined);
  
  if (!verificationData) {
    console.log('Renderizando loading porque verificationData es falsy');
    return (
      <div className="verify-email-page">
        <div className="verify-container">
          <div className="loading-spinner">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="verify-email-page">
      <main className="verify-main">
        <div className="verify-container text-center">
          <div className="logo-drop text-center">
            <img 
              src="/Logo.png" 
              alt="Logo GeoPlanner" 
              className="logo-spin w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" 
            />
          </div>
          
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">
            Verifica tu correo electrónico
          </h2>

          <div className="verification-info">
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Hemos enviado un código de verificación a:
            </p>
            <p className="text-base sm:text-lg font-semibold text-blue-600 mb-2">
              {verificationData.email}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              Usuario: <span className="font-medium">@{verificationData.username}</span>
            </p>
          </div>

          <div className="verification-form">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm sm:text-base font-medium">
                  Código de verificación
                </span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full text-center text-lg sm:text-xl font-mono tracking-widest"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setVerificationCode(value);
                  setError('');
                }}
                maxLength={6}
                disabled={loading || success}
              />
              <div className="label">
                <span className="label-text-alt text-light text-xs sm:text-sm">
                  Ingresa el código de 6 dígitos que recibiste
                </span>
              </div>
            </div>

            {error && (
              <div className="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-base">{error}</span>
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-base">¡Verificación exitosa! Redirigiendo...</span>
              </div>
            )}

            <div className="verification-actions">
              <button 
                onClick={handleVerification}
                disabled={loading || success || !verificationCode.trim()}
                className="btn btn-custom text-sm sm:text-base w-full"
                style={{ 
                  opacity: (loading || success || !verificationCode.trim()) ? 0.5 : 1, 
                  cursor: (loading || success || !verificationCode.trim()) ? 'not-allowed' : 'pointer' 
                }}
              >
                {loading ? 'Verificando...' : 'Verificar mi cuenta'}
              </button>

              <div className="resend-section">
                <button 
                  onClick={handleResendCode}
                  disabled={resendLoading || countdown > 0}
                  className="btn btn-outline btn-sm text-xs sm:text-sm"
                  style={{ 
                    opacity: (resendLoading || countdown > 0) ? 0.5 : 1,
                    cursor: (resendLoading || countdown > 0) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {resendLoading ? 'Enviando...' : 
                   countdown > 0 ? `Reenviar en ${countdown}s` : 'Reenviar código'}
                </button>
              </div>
            </div>
          </div>

          <div className="verification-help">
            <div className="help-steps">
              <h4 className="text-sm sm:text-base font-medium mb-2">¿No recibiste el código?</h4>
              <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                <li>• Revisa tu carpeta de spam o correo no deseado</li>
                <li>• Verifica que el email esté correcto</li>
                <li>• Espera unos minutos y usa "Reenviar código"</li>
              </ul>
            </div>
          </div>

          <div className="verification-navigation">
            <button 
              onClick={handleBackToRegister}
              className="btn btn-ghost btn-sm text-xs sm:text-sm"
            >
              ← Volver al registro
            </button>
          </div>
        </div>
      </main>

      <footer className="footer-bar">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row flex-wrap justify-between items-center gap-2 sm:gap-0">
          <span className="footer-text text-xs sm:text-sm text-center sm:text-left">
            © 2025 GeoPlanner. Todos los derechos reservados — Creado por The GeoPlanner Group.
          </span>
          <div className="footer-links flex flex-wrap gap-3 justify-center sm:justify-end">
            <button onClick={() => navigate('/terms')} className="footer-link text-xs sm:text-sm">Términos</button>
            <button onClick={() => navigate('/privacy')} className="footer-link text-xs sm:text-sm">Privacidad</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VerifyEmail;
