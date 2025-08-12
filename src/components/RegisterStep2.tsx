import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterStep2.css';

interface CredentialsInfo {
  nombreUsuario: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterStep2: React.FC = () => {
  const [formData, setFormData] = useState<CredentialsInfo>({
    nombreUsuario: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string>('');
  const [step1Data, setStep1Data] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Recuperar datos del paso 1
    const step1Data = sessionStorage.getItem('registerStep1');
    if (!step1Data) {
      navigate('/registro/paso1');
      return;
    }
    setStep1Data(JSON.parse(step1Data));
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.nombreUsuario.trim()) {
      setError('Por favor ingresa un nombre de usuario');
      return;
    }

    if (!formData.email.trim()) {
      setError('Por favor ingresa un email válido');
      return;
    }

    if (!formData.password) {
      setError('Por favor ingresa una contraseña');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Combinar datos del paso 1 y 2
    const combinedData = {
      ...step1Data,
      ...formData
    };

    // Guardar datos combinados en sessionStorage
    sessionStorage.setItem('registroStep2', JSON.stringify(combinedData));
    sessionStorage.setItem('registerStep1', JSON.stringify(step1Data)); // Mantener también los datos del paso 1
    navigate('/registro/paso3');
  };

  const handleBack = () => {
    navigate('/registro');
  };

  if (!step1Data) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="register-page">
      <main className="register-main">
        <div className="register-container text-center">
          <div className="logo-drop text-center">
            <img src="/src/assets/img/Logo.png" alt="Logo GeoPlanner" className="logo-spin" />
          </div>
          
          <h2 className="text-3xl font-bold mb-6">Crea tus credenciales</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-base font-medium">@Nombre de usuario</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full text-base"
                name="nombreUsuario"
                placeholder="@usuario"
                value={formData.nombreUsuario}
                onChange={handleInputChange}
                required
              />
              <div className="label">
                <span className="label-text-alt text-light text-base">
                  Este será tu @nombre único dentro de GeoPlanner.
                </span>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-base font-medium">Correo electrónico</span>
              </label>
              <input
                type="email"
                className="input input-bordered w-full text-base"
                name="email"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-base font-medium">Contraseña</span>
              </label>
              <input
                type="password"
                className="input input-bordered w-full text-base"
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-base font-medium">Confirmar contraseña</span>
              </label>
              <input
                type="password"
                className="input input-bordered w-full text-base"
                name="confirmPassword"
                placeholder="Confirmar contraseña"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>

            {error && (
              <div className="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-base">{error}</span>
              </div>
            )}

            <div className="flex justify-between">
              <button 
                type="button" 
                className="btn btn-outline text-base"
                onClick={handleBack}
              >
                Volver
              </button>
              <button type="submit" className="btn btn-custom text-base">
                Continuar
              </button>
            </div>
          </form>
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

export default RegisterStep2; 