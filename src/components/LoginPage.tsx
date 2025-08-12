import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

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
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Limpiar error cuando el usuario empiece a escribir
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Primero obtener el token
      const tokenResponse = await fetch('http://localhost:8000/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: formData.username_or_email, // El backend espera username pero puede ser email o username
          password: formData.password
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(errorData.detail || 'Credenciales inválidas');
      }

      const tokenData = await tokenResponse.json();

      // Luego obtener la información del usuario
      const userResponse = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username_or_email: formData.username_or_email,
          password: formData.password
        }),
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.detail || 'Error al obtener información del usuario');
      }

      const userData = await userResponse.json();

      // Guardar el token y la información del usuario
      localStorage.setItem('token', tokenData.access_token);
      localStorage.setItem('user', JSON.stringify(userData.usuario));
      
      // Redirigir al dashboard
      navigate('/dashboard');
    } catch (error) {
      let msg = 'Error de conexión. Verifica tu conexión a internet.';
      if (error instanceof Error) {
        if (error.message === 'Failed to fetch') {
          msg = 'No se pudo conectar con el servidor. Intenta más tarde.';
        } else if (
          error.message.toLowerCase().includes('credenciales inválidas') ||
          error.message.toLowerCase().includes('invalid credentials')
        ) {
          msg = 'Correo/usuario o contraseña inválidos.';
        } else {
          msg = error.message;
        }
      }
      setError(msg);
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

  return (
    <div className="login-page">
      <main className="login-main">
        <div className="login-container text-center">
          <div className="logo-drop text-center">
            <img src="/src/assets/img/Logo.png" alt="Logo GeoPlanner" className="logo-spin" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Bienvenido a GeoPlanner</h2>
          <p className="tagline">Planifica, organiza y colabora desde el mapa.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
          <p className="text-sm">¿Nuevo en GeoPlanner? <a href="/registro" className="link link-primary">Regístrate aquí</a></p>
          <p className="text-sm"><a href="/recuperar" className="link link-primary">¿Olvidó su contraseña o no puede ingresar?</a></p>
        </div>
      </main>

      <footer className="footer-bar">
        <div className="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center">
          <span className="footer-text">© 2025 GeoPlanner. Todos los derechos reservados — Creado por The GeoPlanner Group.</span>
          <div className="footer-links flex flex-wrap gap-3">
            <a href="/terminos" className="footer-link" target="_blank">Términos</a>
            <a href="/privacidad" className="footer-link" target="_blank">Privacidad</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage; 