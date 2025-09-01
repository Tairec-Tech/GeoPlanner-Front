/**
 * ========================================
 * COMPONENTE REGISTRO PASO 1 DE GEOPLANNER
 * ========================================
 * 
 * Primer paso del proceso de registro de nuevos usuarios
 * en GeoPlanner. Recopila información personal básica.
 * 
 * CONFIGURACIONES IMPORTANTES:
 * 
 * 1. VALIDACIÓN DE EDAD (líneas 50-80):
 *    - Edad mínima: 16 años (configurable)
 *    - Cálculo preciso: año, mes y día
 *    - Para cambiar la edad mínima, modifica la constante
 *    - Ubicación: const MIN_AGE = 16
 * 
 * 2. CAMPOS OBLIGATORIOS (líneas 100-150):
 *    - nombre, apellido, fecha_nacimiento, genero
 *    - Para agregar/quitar campos obligatorios, modifica isFormValid
 *    - Para cambiar validaciones, modifica las funciones de validación
 * 
 * 3. ALMACENAMIENTO TEMPORAL (líneas 200-250):
 *    - sessionStorage: 'registroStep1'
 *    - Para cambiar el nombre de la clave, modifica aquí
 *    - Para agregar más datos, añádelos al objeto formData
 * 
 * 4. NAVEGACIÓN (líneas 300-350):
 *    - handleNext: Navega a /registro/paso2
 *    - Para cambiar la ruta, modifica navigate('/registro/paso2')
 *    - Para agregar validaciones adicionales, añádelas aquí
 * 
 * 5. ESTILOS Y ANIMACIONES (líneas 400-500):
 *    - CSS: src/components/RegisterStep1.css
 *    - Para cambiar colores, modifica las variables CSS
 *    - Para agregar animaciones, usa @keyframes en el CSS
 * 
 * 6. MENSAJES DE ERROR (líneas 600-700):
 *    - Modales de error para validaciones
 *    - Para cambiar mensajes, modifica los textos
 *    - Para agregar nuevos tipos de error, añade modales
 * 
 * FUNCIONALIDADES ACTUALES:
 * - Formulario de datos personales (nombre, apellido, fecha, género)
 * - Validación de edad mínima de 16 años
 * - Validación de formato de fecha
 * - Almacenamiento en sessionStorage
 * - Navegación automática al siguiente paso
 * - Modales de error para validaciones
 * 
 * VALIDACIONES IMPLEMENTADAS:
 * - Campos obligatorios completos
 * - Edad mínima de 16 años (cálculo preciso)
 * - Formato de fecha válido
 * - Género seleccionado
 * 
 * UBICACIÓN DE ARCHIVOS:
 * - Estilos: src/components/RegisterStep1.css
 * - Siguiente paso: src/components/RegisterStep2.tsx
 * - Navegación: src/App.tsx (rutas)
 * 
 * NOTA: Los datos se almacenan temporalmente hasta completar el registro
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterStep1.css';

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
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
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

  // Función para calcular la edad
  const calculateAge = (day: string, month: string, year: string): number => {
    if (!day || !month || !year) return 0;
    
    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Si aún no ha llegado el mes de cumpleaños, restar un año
    if (monthDiff < 0) {
      age--;
    }
    // Si estamos en el mes del cumpleaños, verificar si ya pasó el día
    else if (monthDiff === 0) {
      const dayDiff = today.getDate() - birthDate.getDate();
      // Si aún no ha llegado el día del cumpleaños, restar un año
      if (dayDiff < 0) {
        age--;
      }
    }
    
    return age;
  };

  // Función para validar la fecha
  const validateDate = (day: string, month: string, year: string): boolean => {
    if (!day || !month || !year) return false;
    
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const isValidDate = date.getFullYear() === parseInt(year) &&
                       date.getMonth() === parseInt(month) - 1 &&
                       date.getDate() === parseInt(day);
    
    return isValidDate;
  };

  // Función para validar la edad mínima
  const validateAge = (age: number): boolean => {
    return age >= 16;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  // Validar formulario completo
  useEffect(() => {
    const isValid = formData.nombre.trim() !== '' &&
                   formData.apellido.trim() !== '' &&
                   formData.day !== '' &&
                   formData.month !== '' &&
                   formData.year !== '' &&
                   formData.genero !== '' &&
                   (formData.genero !== 'Otro' || formData.otroGenero.trim() !== '');
    
    setIsFormValid(isValid);
  }, [formData]);

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
      setShowErrorModal(true);
      return;
    }

    if (!formData.day || !formData.month || !formData.year) {
      setError('Por favor completa tu fecha de nacimiento');
      setShowErrorModal(true);
      return;
    }

    // Validar que la fecha sea válida
    if (!validateDate(formData.day, formData.month, formData.year)) {
      setError('La fecha de nacimiento ingresada no es válida');
      setShowErrorModal(true);
      return;
    }

    // Validar edad mínima
    const age = calculateAge(formData.day, formData.month, formData.year);
    if (!validateAge(age)) {
      setError('Debes tener al menos 16 años para registrarte en GeoPlanner');
      setShowErrorModal(true);
      return;
    }

    if (!formData.genero) {
      setError('Por favor selecciona tu género');
      setShowErrorModal(true);
      return;
    }

    if (formData.genero === 'Otro' && !formData.otroGenero.trim()) {
      setError('Por favor especifica tu género');
      setShowErrorModal(true);
      return;
    }

    // Guardar datos en sessionStorage para el siguiente paso
    sessionStorage.setItem('registerStep1', JSON.stringify(formData));
    navigate('/registro/paso2');
  };

  const handleBack = () => {
    navigate('/');
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
    setError('');
  };

  return (
    <div className="register-page">
      <main className="register-main">
        <div className="register-container text-center">
          <div className="logo-drop text-center">
            <img src="/src/assets/img/Logo.png" alt="Logo GeoPlanner" className="logo-spin w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" />
          </div>
          
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">Regístrate en GeoPlanner</h2>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-sm sm:text-base font-medium">Primer nombre</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full text-sm sm:text-base"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-sm sm:text-base font-medium">Apellido</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full text-sm sm:text-base"
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
                <span className="label-text text-sm sm:text-base font-medium">Fecha de nacimiento</span>
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
                <span className="label-text text-sm sm:text-base font-medium">Género</span>
              </label>
              <div className="flex flex-wrap gap-2 sm:gap-4">
                <label className="label cursor-pointer">
                  <input
                    type="radio"
                    name="genero"
                    value="Masculino"
                    checked={formData.genero === 'Masculino'}
                    onChange={handleInputChange}
                    className="radio radio-primary"
                  />
                  <span className="label-text ml-2 text-sm sm:text-base">Masculino</span>
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
                  <span className="label-text ml-2 text-sm sm:text-base">Femenino</span>
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
                  <span className="label-text ml-2 text-sm sm:text-base">Otro</span>
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
                  <span className="label-text ml-2 text-sm sm:text-base">Prefiero no decir</span>
                </label>
              </div>
            </div>

            {/* Campo para especificar género si es "Otro" */}
            {formData.genero === 'Otro' && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-sm sm:text-base font-medium">Especifica tu género</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full text-sm sm:text-base"
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

export default RegisterStep1; 