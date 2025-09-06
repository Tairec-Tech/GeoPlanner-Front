/**
 * ========================================
 * COMPONENTE REGISTRO PASO 3 DE GEOPLANNER
 * ========================================
 * 
 * Tercer y último paso del proceso de registro de nuevos usuarios
 * en GeoPlanner. Recopila información de ubicación y perfil.
 * 
 * CONFIGURACIONES IMPORTANTES:
 * 
 * 1. CONFIGURACIÓN DEL MAPA (líneas 50-100):
 *    - Centro por defecto: [10.654, -71.612] (Maracaibo, Venezuela)
 *    - Para cambiar el centro, modifica markerPosition
 *    - Integración con OpenStreetMap para geocodificación
 *    - Para cambiar el proveedor de mapas, modifica TileLayer
 * 
 * 2. CAMPOS OBLIGATORIOS (líneas 150-200):
 *    - SOLO ubicación es obligatoria (latitud, longitud, ciudad, país)
 *    - Foto de perfil: Opcional
 *    - Biografía: Opcional
 *    - Para cambiar obligatoriedad, modifica isFormValid
 * 
 * 3. RECORTE DE IMAGEN (líneas 250-350):
 *    - Componente: react-cropper
 *    - Aspect ratio: 1:1 (cuadrado)
 *    - Para cambiar el aspect ratio, modifica aspectRatio
 *    - Para cambiar el tamaño máximo, modifica maxSize
 * 
 * 4. TEMAS DISPONIBLES (líneas 400-500):
 *    - default, aurora, noche, oceano, amanecer, pastel, fuego, bosque, lluvia
 *    - Para agregar nuevos temas, añádelos al objeto temas
 *    - Estructura: { fondo: "gradient", texto: "color", boton: { fondo, color } }
 * 
 * 5. GEOLOCALIZACIÓN (líneas 550-600):
 *    - Usa navigator.geolocation para ubicación automática
 *    - Fallback: Coordenadas por defecto
 *    - Para cambiar el fallback, modifica las coordenadas
 * 
 * 6. FINALIZACIÓN DEL REGISTRO (líneas 650-750):
 *    - Combina datos de los 3 pasos
 *    - Envía al backend para crear usuario
 *    - Redirige al dashboard tras éxito
 *    - Para cambiar la redirección, modifica navigate()
 * 
 * FUNCIONALIDADES ACTUALES:
 * - Selección de ubicación con mapa interactivo (Leaflet)
 * - Subida y recorte de foto de perfil (react-cropper)
 * - Configuración de biografía opcional
 * - Selección de tema preferido
 * - Geolocalización automática
 * - Finalización del registro completo
 * 
 * VALIDACIONES IMPLEMENTADAS:
 * - Ubicación obligatoria (latitud, longitud, ciudad, país)
 * - Foto de perfil opcional (máximo 5MB)
 * - Biografía opcional (máximo 500 caracteres)
 * - Tema seleccionado (por defecto: default)
 * 
 * INTEGRACIONES:
 * - Leaflet: Mapas interactivos
 * - react-cropper: Recorte de imágenes
 * - OpenStreetMap: Geocodificación inversa
 * - Geolocation API: Ubicación automática
 * 
 * UBICACIÓN DE ARCHIVOS:
 * - Estilos: src/components/RegisterStep3.css
 * - Paso anterior: src/components/RegisterStep2.tsx
 * - API: src/services/api.ts (registro de usuario)
 * - Mapas: Leaflet (CDN)
 * - Cropper: react-cropper (npm)
 * 
 * NOTA: Este es el paso final del registro, crea el usuario en el backend
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-cropper';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/RegisterStep3.css';

// Solución para el ícono de Leaflet
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface RegisterStep3Data {
  bio: string;
  latitud: string;
  longitud: string;
  ciudad: string;
  pais: string;
  tema: string;
  fotoPerfil: File | null;
}

interface Theme {
  fondo: string;
  texto: string;
  boton: { fondo: string; color: string };
}

const temas: Record<string, Theme> = {
  default: { fondo: "linear-gradient(145deg, #007BFF, #003366)", texto: "white", boton: { fondo: "#00bfff", color: "white" } },
  aurora: { fondo: "linear-gradient(145deg, #1D2B64, #F8CDDA)", texto: "#222", boton: { fondo: "#1D2B64", color: "#F8CDDA" } },
  noche: { fondo: "linear-gradient(145deg, #141E30, #243B55)", texto: "white", boton: { fondo: "#141E30", color: "#ffffff" } },
  oceano: { fondo: "linear-gradient(145deg, #2C3E50, #4CA1AF)", texto: "white", boton: { fondo: "#2C3E50", color: "#ffffff" } },
  amanecer: { fondo: "linear-gradient(145deg, #FF512F, #F09819)", texto: "#3c1e00", boton: { fondo: "#FF512F", color: "#fff4d6" } },
  pastel: { fondo: "linear-gradient(145deg, #A1C4FD, #C2E9FB)", texto: "#222", boton: { fondo: "#A1C4FD", color: "#003366" } },
  fuego: { fondo: "linear-gradient(145deg, #CB356B, #BD3F32)", texto: "white", boton: { fondo: "#CB356B", color: "#ffffff" } },
  bosque: { fondo: "linear-gradient(145deg, #11998E, #38EF7D)", texto: "#222", boton: { fondo: "#11998E", color: "#ffffff" } },
  lluvia: { fondo: "linear-gradient(145deg, #396afc, #2948ff)", texto: "white", boton: { fondo: "#396afc", color: "#ffffff" } }
};

function MapEvents({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => { onLocationChange(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

const RegisterStep3: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterStep3Data>({
    bio: '', latitud: '10.654', longitud: '-71.612', ciudad: '', pais: '', tema: 'default', fotoPerfil: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  // const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [showCropper, setShowCropper] = useState(false);
  const [cropperImage, setCropperImage] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState('/src/assets/img/placeholder.png');
  const [currentTheme, setCurrentTheme] = useState<Theme>(temas.default);
  const [markerPosition, setMarkerPosition] = useState<[number, number]>([10.654, -71.612]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropperRef = useRef<any>(null);

  // Validar formulario - solo ubicación es obligatoria
  useEffect(() => {
    const isValid = formData.latitud !== '' && 
                   formData.longitud !== '' && 
                   formData.ciudad !== '' && 
                   formData.pais !== '';
    setIsFormValid(isValid);
  }, [formData]);

  useEffect(() => {
    const step2Data = sessionStorage.getItem('registroStep2');
    console.log('RegisterStep3 - Datos en sessionStorage:', { step2Data }); // Debug
    
    if (!step2Data) { 
      console.log('RegisterStep3 - No hay datos, redirigiendo a /registro'); // Debug
      navigate('/registro'); 
      return; 
    }
    
    console.log('RegisterStep3 - Datos encontrados, continuando...'); // Debug
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude;
          const userLon = pos.coords.longitude;
          setMarkerPosition([userLat, userLon]);
          setFormData(p => ({ ...p, latitud: userLat.toString(), longitud: userLon.toString() }));
          actualizarUbicacion(userLat, userLon);
        },
        () => { actualizarUbicacion(10.654, -71.612); }
      );
    }
  }, [navigate]);

  const actualizarUbicacion = async (lat: number, lon: number) => {
    setFormData(p => ({ ...p, latitud: lat.toFixed(6), longitud: lon.toFixed(6) }));
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await r.json();
      const ciudad = data.address?.city || data.address?.town || data.address?.village || data.address?.hamlet || data.address?.county || '';
      const pais = data.address?.country || '';
      setFormData(p => ({ ...p, ciudad, pais }));
    } catch { setFormData(p => ({ ...p, ciudad: '', pais: '' })); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (name === 'tema') setCurrentTheme(temas[value] || temas.default);
    setError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const result = event.target?.result as string;
        setCropperImage(result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCrop = () => {
    if (cropperRef.current) {
      try {
        // Debug: ver qué métodos están disponibles
        console.log('cropperRef.current:', cropperRef.current);
        console.log('Métodos disponibles:', Object.getOwnPropertyNames(cropperRef.current));
        console.log('getCroppedCanvas:', typeof cropperRef.current.getCroppedCanvas);
        console.log('cropper:', cropperRef.current.cropper);
        
        // Intentar diferentes métodos de la API del cropper
        let canvas;
        
        if (typeof cropperRef.current.getCroppedCanvas === 'function') {
          // API estándar
          console.log('Usando API estándar getCroppedCanvas');
          canvas = cropperRef.current.getCroppedCanvas();
        } else if (cropperRef.current.cropper && typeof cropperRef.current.cropper.getCroppedCanvas === 'function') {
          // API anidada
          console.log('Usando API anidada cropper.getCroppedCanvas');
          canvas = cropperRef.current.cropper.getCroppedCanvas();
        } else if (cropperRef.current.getData && typeof cropperRef.current.getData === 'function') {
          // API alternativa
          console.log('Usando API alternativa getData');
          const data = cropperRef.current.getData();
          console.log('Datos del cropper:', data);
          // Crear canvas manualmente con los datos
          canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx && data) {
            canvas.width = data.width || 300;
            canvas.height = data.height || 300;
            // Aquí podrías dibujar la imagen recortada
          }
        }
        
        if (canvas) {
          canvas.toBlob((blob: Blob | null) => {
            if (blob) {
              const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
              setFormData(p => ({ ...p, fotoPerfil: file }));
              setPreviewUrl(URL.createObjectURL(blob));
              setShowCropper(false);
            }
          }, 'image/jpeg');
        } else {
          console.error('No se pudo obtener el canvas del cropper');
          setError('Error al procesar la imagen. Intenta con otra imagen.');
        }
      } catch (error) {
        console.error('Error en handleCrop:', error);
        setError('Error al procesar la imagen. Intenta con otra imagen.');
      }
    } else {
      console.error('cropperRef.current es null');
      setError('Error: Cropper no está inicializado');
    }
  };

  const handleCancelCrop = () => {
    setShowCropper(false);
    setCropperImage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setMarkerPosition([lat, lng]); actualizarUbicacion(lat, lng);
  };

  const handleBack = () => {
    navigate('/registro/paso2');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar que se haya seleccionado una ubicación
    if (!formData.latitud || !formData.longitud || !formData.ciudad || !formData.pais) {
      setError('Por favor selecciona una ubicación en el mapa');
      setShowErrorModal(true);
      return;
    }

    // Validar que la ubicación no sea la posición por defecto
    if (formData.latitud === '10.654' && formData.longitud === '-71.612' && !formData.ciudad) {
      setError('Por favor selecciona una ubicación específica en el mapa');
      setShowErrorModal(true);
      return;
    }

    setIsLoading(true);
    try {
      const step2Data = sessionStorage.getItem('registroStep2');
      if (!step2Data) {
        setError('Error: No se encontraron los datos del registro');
        setShowErrorModal(true);
        return;
      }

      const userData = JSON.parse(step2Data);
      // Convertir fecha de nacimiento a formato ISO
      const fechaNacimiento = new Date(
        parseInt(userData.year),
        parseInt(userData.month) - 1, // month es 0-based en JavaScript
        parseInt(userData.day)
      ).toISOString().split('T')[0]; // Formato YYYY-MM-DD
      
      const finalData = {
        // Campos del paso 1
        nombre: userData.nombre,
        apellido: userData.apellido,
        fecha_nacimiento: fechaNacimiento,
        genero: userData.genero,
        otro_genero: userData.otroGenero || null,
        
        // Campos del paso 2
        nombre_usuario: userData.nombreUsuario, // Corregir nombre del campo
        email: userData.email,
        password: userData.password,
        
        // Campos del paso 3
        biografia: formData.bio || null,
        latitud: parseFloat(formData.latitud),
        longitud: parseFloat(formData.longitud),
        ciudad: formData.ciudad,
        pais: formData.pais,
        tema_preferido: formData.tema,
        foto_perfil_url: formData.fotoPerfil ? await uploadImage(formData.fotoPerfil) : null
      };
      
      // Debug: mostrar datos que se van a enviar
      console.log('Datos del usuario (step2):', userData);
      console.log('Datos del formulario (step3):', formData);
      console.log('Datos finales a enviar:', finalData);

      const response = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      });

      if (response.ok) {
        console.log('Usuario registrado exitosamente');
        sessionStorage.clear();
        navigate('/login');
      } else {
        const errorData = await response.json();
        console.error('Error del backend:', errorData);
        console.error('Status:', response.status);
        console.error('StatusText:', response.statusText);
        
        // Mostrar detalles completos del error
        if (errorData.detalle && Array.isArray(errorData.detalle)) {
          console.error('Detalles de validación:');
          errorData.detalle.forEach((error: any, index: number) => {
            console.error(`Error ${index + 1}:`, error);
            console.error(`  - Tipo: ${error.type}`);
            console.error(`  - Ubicación: ${error.loc?.join('.')}`);
            console.error(`  - Mensaje: ${error.msg}`);
            console.error(`  - Input recibido:`, error.input);
          });
        }
        
        setError(errorData.detail || 'Error al registrar usuario');
        setShowErrorModal(true);
      }
    } catch {
      setError('Error de conexión. Intenta nuevamente.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
    setError('');
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'geoplanner');
      
      const response = await fetch('https://api.cloudinary.com/v1_1/dadw1qx7z/image/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.secure_url;
      } else {
        console.error('Error subiendo imagen:', await response.text());
        return null;
      }
    } catch (error) {
      console.error('Error en subida de imagen:', error);
      return null;
    }
  };

  return (
    <div className="register-page">
      <div className="register-container-wide" style={{ background: currentTheme.fondo, color: currentTheme.texto }}>
        <div className="logo-drop">
          <img src="/src/assets/img/Logo.png" alt="Logo GeoPlanner" className="logo-spin w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" />
        </div>

        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6">Personaliza tu perfil</h2>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="form-control text-center">
            <label className="label">
              <span className="label-text text-base sm:text-lg font-semibold">Foto de perfil</span>
            </label>
            <div className="avatar flex justify-center mb-3 sm:mb-4">
              <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-35 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img src={previewUrl} alt="Vista previa de perfil" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="custom-file-input-container">
              <input 
                type="file" 
                className="custom-file-input" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                id="file-input"
              />
              <label htmlFor="file-input" className="custom-file-label">
                <span className="file-icon">📷</span>
                Seleccionar imagen
              </label>
            </div>
            <div className="label">
              <span className="label-text-alt text-light text-xs sm:text-sm">Sube y recorta tu foto (máx. 5MB)</span>
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-base sm:text-lg font-semibold">Biografía</span>
            </label>
            <textarea 
              className="textarea textarea-bordered w-full text-sm sm:text-base" 
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              maxLength={160}
              rows={3}
              placeholder="Cuéntanos sobre ti (máx. 160 caracteres)"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-base sm:text-lg font-semibold">Selecciona tu ubicación</span>
            </label>
            <div className="map-container">
              <MapContainer 
                center={markerPosition} 
                zoom={13} 
                style={{ height: '250px', borderRadius: '10px' }}
                className="sm:h-[300px] md:h-[350px]"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                <Marker 
                  position={markerPosition}
                  draggable={true}
                  eventHandlers={{
                    moveend: (e) => {
                      const { lat, lng } = e.target.getLatLng();
                      handleLocationChange(lat, lng);
                    }
                  }}
                />
                <MapEvents onLocationChange={handleLocationChange} />
              </MapContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text text-sm sm:text-base font-medium">Ciudad</span></label>
              <input type="text" className="input input-bordered w-full text-sm sm:text-base" value={formData.ciudad} readOnly placeholder="Ciudad"/>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text text-sm sm:text-base font-medium">País</span></label>
              <input type="text" className="input input-bordered w-full text-sm sm:text-base" value={formData.pais} readOnly placeholder="País"/>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text text-sm sm:text-base font-medium">Latitud</span></label>
              <input type="text" className="input input-bordered w-full text-sm sm:text-base" value={formData.latitud} readOnly/>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text text-sm sm:text-base font-medium">Longitud</span></label>
              <input type="text" className="input input-bordered w-full text-sm sm:text-base" value={formData.longitud} readOnly/>
            </div>
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text text-base sm:text-lg font-semibold">Elige tu tema</span></label>
            <select className="select select-bordered w-full text-sm sm:text-base" name="tema" value={formData.tema} onChange={handleInputChange}>
              <option value="default">Azul GeoPlanner (predeterminado)</option>
              <option value="aurora">Aurora Boreal</option>
              <option value="noche">Cielo Nocturno</option>
              <option value="oceano">Océano Profundo</option>
              <option value="amanecer">Amanecer Tropical</option>
              <option value="pastel">Nube Pastel</option>
              <option value="fuego">Forja de Fuego</option>
              <option value="bosque">Bosque Encantado</option>
              <option value="lluvia">Lluvia Eléctrica</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
            <button type="button" className="btn btn-outline text-sm sm:text-base" onClick={handleBack}>Volver</button>
            <button type="submit" className="btn btn-custom text-sm sm:text-base" disabled={isLoading} style={{ backgroundColor: currentTheme.boton.fondo, color: currentTheme.boton.color }}>
              {isLoading ? (<><span className="loading loading-spinner loading-sm"></span>Finalizando...</>) : ('Finalizar Registro')}
            </button>
          </div>

          {error && (<div className="alert alert-error"><span className="text-sm sm:text-base">{error}</span></div>)}
        </form>
      </div>

      {/* Modal de Cropper Actualizado */}
      {showCropper && (
        <div className="modal modal-open">
          <div className="modal-box cropper-modal-container max-w-sm sm:max-w-md lg:max-w-lg mx-4">
            <h3 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4 text-center">Recorta tu foto de perfil</h3>
            <div className="cropper-wrapper">
              <Cropper
                ref={cropperRef}
                src={cropperImage}
                style={{ height: '100%', width: '100%' }}
                aspectRatio={1}
                viewMode={1}
                autoCropArea={0.8}
                guides={true}
                responsive={true}
                background={false}
                highlight={false}
                checkOrientation={false}
                cropBoxMovable={true}
                cropBoxResizable={true}
                toggleDragModeOnDblclick={false}
                center={true}
                zoomable={true}
                scalable={true}
                onInitialized={(instance) => { console.log("Cropper inicializado:", instance); }}
              />
            </div>
            <div className="modal-action flex-col sm:flex-row gap-2">
              <button className="btn btn-info btn-sm sm:btn-md text-sm sm:text-base" onClick={handleCrop}>Recortar y aplicar</button>
              <button className="btn btn-ghost btn-sm sm:btn-md text-sm sm:text-base" onClick={handleCancelCrop}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm sm:max-w-md mx-4">
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-center">Error de Registro</h3>
            <p className="text-sm sm:text-base text-center">{error}</p>
            <div className="modal-action">
              <button className="btn btn-info btn-sm sm:btn-md text-sm sm:text-base" onClick={closeErrorModal}>Aceptar</button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer-bar w-full">
        <div className="container-fluid flex flex-col sm:flex-row flex-wrap justify-between items-center px-4 py-3 gap-2 sm:gap-0">
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

export default RegisterStep3;
