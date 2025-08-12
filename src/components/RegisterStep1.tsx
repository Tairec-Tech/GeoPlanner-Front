import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterStep1.css';

interface PersonalInfo {
  nombre: string;
  apellido: string;
  day: string;
  month: string;
  year: string;
  genero: string;
  otroGenero: string;
}

const RegisterStep1: React.FC = () => {
  const [formData, setFormData] = useState<PersonalInfo>({
    nombre: '',
    apellido: '',
    day: '',
    month: '',
    year: '',
    genero: '',
    otroGenero: ''
  });
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const meses = [
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ];

  const [dias, setDias] = useState<number[]>([]);
  const currentYear = new Date().getFullYear();
  const anos = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  // Actualizar días según mes y año
  useEffect(() => {
    if (formData.month && formData.year) {
      const mes = parseInt(formData.month);
      const anio = parseInt(formData.year);
      let diasEnMes = 31;

      if ([4, 6, 9, 11].includes(mes)) {
        diasEnMes = 30;
      } else if (mes === 2) {
        const bisiesto = anio % 4 === 0 && (anio % 100 !== 0 || anio % 400 === 0);
        diasEnMes = bisiesto ? 29 : 28;
      }

      setDias(Array.from({ length: diasEnMes }, (_, i) => i + 1));
    }
  }, [formData.month, formData.year]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      setError('Por favor completa nombre y apellido');
      return;
    }

    if (!formData.day || !formData.month || !formData.year) {
      setError('Por favor completa tu fecha de nacimiento');
      return;
    }

    if (!formData.genero) {
      setError('Por favor selecciona tu género');
      return;
    }

    if (formData.genero === 'Otro' && !formData.otroGenero.trim()) {
      setError('Por favor especifica tu género');
      return;
    }

    // Guardar datos en sessionStorage para el siguiente paso
    sessionStorage.setItem('registerStep1', JSON.stringify(formData));
    navigate('/registro/paso2');
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="register-page">
      <main className="register-main">
        <div className="register-container text-center">
          <div className="logo-drop text-center">
            <img src="/src/assets/img/Logo.png" alt="Logo GeoPlanner" className="logo-spin" />
          </div>
          
          <h2 className="text-3xl font-bold mb-6">Regístrate en GeoPlanner</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base font-medium">Primer nombre</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full text-base"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base font-medium">Apellido</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full text-base"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Fecha de nacimiento */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-base font-medium">Fecha de nacimiento</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <select 
                  className="select select-bordered w-full text-black" 
                  name="year" 
                  value={formData.year} 
                  onChange={handleInputChange}
                  required
                >
                  <option value="" className="text-gray-500">Año</option>
                  {anos.map(year => (
                    <option key={year} value={year} className="text-black">
                      {year}
                    </option>
                  ))}
                </select>
                
                <select 
                  className="select select-bordered w-full text-black" 
                  name="month" 
                  value={formData.month} 
                  onChange={handleInputChange}
                  required
                >
                  <option value="" className="text-gray-500">Mes</option>
                  {meses.map((mes, index) => (
                    <option key={index + 1} value={index + 1} className="text-black">
                      {mes.label}
                    </option>
                  ))}
                </select>
                
                <select 
                  className="select select-bordered w-full text-black" 
                  name="day" 
                  value={formData.day} 
                  onChange={handleInputChange}
                  required
                >
                  <option value="" className="text-gray-500">Día</option>
                  {dias.map(day => (
                    <option key={day} value={day} className="text-black">
                      {day}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Género */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-base font-medium">Género</span>
              </label>
              <div className="flex flex-wrap gap-4">
                <label className="label cursor-pointer">
                  <input
                    type="radio"
                    name="genero"
                    value="Masculino"
                    checked={formData.genero === 'Masculino'}
                    onChange={handleInputChange}
                    className="radio radio-primary"
                  />
                  <span className="label-text ml-2 text-base">Masculino</span>
                </label>
                
                <label className="label cursor-pointer">
                  <input
                    type="radio"
                    name="genero"
                    value="Femenino"
                    checked={formData.genero === 'Femenino'}
                    onChange={handleInputChange}
                    className="radio radio-primary"
                  />
                  <span className="label-text ml-2 text-base">Femenino</span>
                </label>
                
                <label className="label cursor-pointer">
                  <input
                    type="radio"
                    name="genero"
                    value="Otro"
                    checked={formData.genero === 'Otro'}
                    onChange={handleInputChange}
                    className="radio radio-primary"
                  />
                  <span className="label-text ml-2 text-base">Otro</span>
                </label>
                
                <label className="label cursor-pointer">
                  <input
                    type="radio"
                    name="genero"
                    value="Prefiero no decir"
                    checked={formData.genero === 'Prefiero no decir'}
                    onChange={handleInputChange}
                    className="radio radio-primary"
                  />
                  <span className="label-text ml-2 text-base">Prefiero no decir</span>
                </label>
              </div>
            </div>

            {/* Campo para especificar género si es "Otro" */}
            {formData.genero === 'Otro' && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base font-medium">Especifica tu género</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full text-base"
                  name="otroGenero"
                  value={formData.otroGenero}
                  onChange={handleInputChange}
                  placeholder="Especifica tu género"
                  required
                />
              </div>
            )}

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

export default RegisterStep1; 