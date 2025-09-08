import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import '../styles/ForgotPassword.css';

// Tipos para validación de contraseña
interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
}

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<'email' | 'code' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [message, setMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: 'red'
  });

  const navigate = useNavigate();

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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.FORGOT_PASSWORD), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage('Si el email existe en nuestro sistema, recibirás un código de recuperación');
        setStep('code');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Error al enviar código de recuperación');
        setShowErrorModal(true);
      }
    } catch (error) {
      setError('Error de conexión. Verifica tu internet.');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setShowErrorModal(true);
      return;
    }

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setShowErrorModal(true);
      return;
    }

    if (passwordStrength.score < 3) {
      setError('La contraseña debe ser más segura. Incluye mayúsculas, minúsculas, números y símbolos.');
      setShowErrorModal(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔄 Enviando solicitud de reset de contraseña:', {
        email,
        code,
        passwordLength: newPassword.length,
        passwordStrength: passwordStrength.score
      });

      const response = await fetch(buildApiUrl(API_ENDPOINTS.RESET_PASSWORD), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code,
          new_password: newPassword,
        }),
      });

      console.log('📡 Respuesta del servidor:', response.status, response.statusText);

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Reset exitoso:', responseData);
        setStep('success');
      } else {
        const errorData = await response.json();
        console.error('❌ Error en reset:', errorData);
        setError(errorData.detail || 'Error al restablecer contraseña');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      setError('Error de conexión. Verifica tu internet.');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.RESEND_RESET_CODE), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage('Nuevo código de recuperación enviado');
      } else {
        const errorData = await response.json();
        
        // Si no hay código pendiente, ofrecer enviar uno nuevo
        if (errorData.detail && errorData.detail.includes('No hay solicitud de recuperación pendiente')) {
          setError('No hay código pendiente. ¿Quieres solicitar uno nuevo?');
          setShowErrorModal(true);
        } else {
          setError(errorData.detail || 'Error al reenviar código');
          setShowErrorModal(true);
        }
      }
    } catch (error) {
      setError('Error de conexión. Verifica tu internet.');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestNewCode = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.FORGOT_PASSWORD), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage('Nuevo código de recuperación enviado');
        setShowErrorModal(false);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Error al solicitar nuevo código');
        setShowErrorModal(true);
      }
    } catch (error) {
      setError('Error de conexión. Verifica tu internet.');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setNewPassword(password);
    setPasswordStrength(evaluatePasswordStrength(password));
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <h1>Recuperar Contraseña</h1>
          <p>Te ayudaremos a restablecer tu contraseña</p>
        </div>

        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa tu email"
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Código'}
            </button>

            <div className="back-to-login">
              <Link to="/login">← Volver al Login</Link>
            </div>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleCodeSubmit} className="forgot-password-form">
            {message && (
              <div className="success-message">
                <p>{message}</p>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="code">Código de Verificación</label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ingresa el código de 6 dígitos"
                maxLength={6}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">Nueva Contraseña</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={handlePasswordChange}
                placeholder="Ingresa tu nueva contraseña"
                required
                disabled={loading}
              />
              {newPassword && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className={`strength-fill ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    ></div>
                  </div>
                  <div className="strength-feedback">
                    {passwordStrength.feedback.map((item, index) => (
                      <div key={index} className={`feedback-item ${passwordStrength.color}`}>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirma tu nueva contraseña"
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
            </button>

            <div className="resend-code">
              <button type="button" onClick={handleResendCode} disabled={loading}>
                Reenviar Código
              </button>
            </div>

            <div className="back-to-login">
              <Link to="/login">← Volver al Login</Link>
            </div>
          </form>
        )}

        {step === 'success' && (
          <div className="success-container">
            <div className="success-icon">✅</div>
            <h2>¡Contraseña Restablecida!</h2>
            <p>Tu contraseña ha sido restablecida exitosamente.</p>
            <p>Ahora puedes iniciar sesión con tu nueva contraseña.</p>
            
            <button onClick={handleBackToLogin} className="submit-button">
              Ir al Login
            </button>
          </div>
        )}
      </div>

      {showErrorModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>⚠️ Error</h3>
              <button 
                className="modal-close" 
                onClick={() => setShowErrorModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>{error}</p>
              {error.includes('No hay código pendiente') && (
                <div className="modal-actions">
                  <button 
                    className="btn-primary" 
                    onClick={handleRequestNewCode}
                    disabled={loading}
                  >
                    {loading ? 'Enviando...' : 'Solicitar Nuevo Código'}
                  </button>
                  <button 
                    className="btn-secondary" 
                    onClick={() => setShowErrorModal(false)}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
