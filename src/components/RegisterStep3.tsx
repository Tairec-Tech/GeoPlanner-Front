import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-cropper';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './RegisterStep3.css';

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
  const [showCropper, setShowCropper] = useState(false);
  const [cropperImage, setCropperImage] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState('/src/assets/img/placeholder.png');
  const [currentTheme, setCurrentTheme] = useState<Theme>(temas.default);
  const [markerPosition, setMarkerPosition] = useState<[number, number]>([10.654, -71.612]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropperRef = useRef<any>(null);

  useEffect(() => {
    const step2Data = sessionStorage.getItem('registroStep2');
    if (!step2Data) { navigate('/registro'); return; }
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
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('La imagen no puede superar los 5MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => { setCropperImage(reader.result as string); setShowCropper(true); };
    reader.readAsDataURL(file);
  };

  const handleCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper || typeof cropper.getCroppedCanvas !== "function") {
      alert("El recortador de imágenes no está listo."); return;
    }
    const canvas = cropper.getCroppedCanvas({ width: 150, height: 150, imageSmoothingEnabled: true, imageSmoothingQuality: 'high' });
    if (!canvas) { alert('No se pudo crear la imagen recortada.'); return; }
    const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPreviewUrl(croppedImageUrl);
    canvas.toBlob((blob) => {
      if (blob) setFormData(p => ({ ...p, fotoPerfil: new File([blob], 'profile.jpg', { type: 'image/jpeg' }) }));
    }, 'image/jpeg', 0.9);
    setShowCropper(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
    e.preventDefault(); setIsLoading(true); setError('');
    try {
      const step2Data = sessionStorage.getItem('registroStep2');
      if (!step2Data) { navigate('/registro'); return; }
      const s2 = JSON.parse(step2Data);
      const fechaNacimiento = `${s2.year}-${s2.month.padStart(2, '0')}-${s2.day.padStart(2, '0')}`;
      const userData = {
        nombre_usuario: s2.nombreUsuario, email: s2.email, password: s2.password, nombre: s2.nombre,
        apellido: s2.apellido, fecha_nacimiento: fechaNacimiento, genero: s2.genero === 'Otro' ? s2.otroGenero : s2.genero,
        biografia: formData.bio, latitud: parseFloat(formData.latitud), longitud: parseFloat(formData.longitud),
        ciudad: formData.ciudad, pais: formData.pais, tema_preferido: formData.tema
      };
      if (formData.fotoPerfil) {
        const f = new FormData();
        f.append('file', formData.fotoPerfil);
        f.append('upload_preset', 'geoplanner');
        await fetch('https://api.cloudinary.com/v1_1/dadw1qx7z/image/upload', { method: 'POST', body: f });
      }
      const r = await fetch('http://localhost:8000/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData),
      });
      if (r.ok) { 
        sessionStorage.removeItem('registroStep1');
        sessionStorage.removeItem('registroStep2');
        alert('¡Registro completado con éxito! Ahora puedes iniciar sesión.');
        navigate('/login'); 
      }
      else setError((await r.json()).detail || 'Error en el registro');
    } catch { setError('Error de conexión con el servidor.'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="register-page">
      <div className="register-container-wide" style={{ background: currentTheme.fondo, color: currentTheme.texto }}>
        <div className="logo-drop">
          <img src="/src/assets/img/Logo.png" alt="Logo GeoPlanner" className="logo-spin" />
        </div>

        <h2 className="text-3xl font-bold text-center mb-6">Personaliza tu perfil</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-control text-center">
            <label className="label">
              <span className="label-text text-lg font-semibold">Foto de perfil</span>
            </label>
            <div className="avatar flex justify-center mb-4">
              <div className="w-35 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
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
              <span className="label-text-alt text-light text-base">Sube y recorta tu foto (máx. 5MB)</span>
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-lg font-semibold">Biografía</span>
            </label>
            <textarea 
              className="textarea textarea-bordered w-full text-base" 
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
              <span className="label-text text-lg font-semibold">Selecciona tu ubicación</span>
            </label>
            <div className="map-container">
              <MapContainer 
                center={markerPosition} 
                zoom={13} 
                style={{ height: '350px', borderRadius: '10px' }}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text text-base font-medium">Ciudad</span></label>
              <input type="text" className="input input-bordered w-full text-base" value={formData.ciudad} readOnly placeholder="Ciudad"/>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text text-base font-medium">País</span></label>
              <input type="text" className="input input-bordered w-full text-base" value={formData.pais} readOnly placeholder="País"/>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text text-base font-medium">Latitud</span></label>
              <input type="text" className="input input-bordered w-full text-base" value={formData.latitud} readOnly/>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text text-base font-medium">Longitud</span></label>
              <input type="text" className="input input-bordered w-full text-base" value={formData.longitud} readOnly/>
            </div>
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text text-lg font-semibold">Elige tu tema</span></label>
            <select className="select select-bordered w-full text-base" name="tema" value={formData.tema} onChange={handleInputChange}>
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

          <div className="flex justify-between">
            <button type="button" className="btn btn-outline text-base" onClick={handleBack}>Volver</button>
            <button type="submit" className="btn btn-custom text-base" disabled={isLoading} style={{ backgroundColor: currentTheme.boton.fondo, color: currentTheme.boton.color }}>
              {isLoading ? (<><span className="loading loading-spinner loading-sm"></span>Finalizando...</>) : ('Finalizar Registro')}
            </button>
          </div>

          {error && (<div className="alert alert-error"><span className="text-base">{error}</span></div>)}
        </form>
      </div>

      {/* Modal de Cropper Actualizado */}
      {showCropper && (
        <div className="modal modal-open">
          <div className="modal-box cropper-modal-container">
            <h3 className="font-bold text-xl mb-4 text-center">Recorta tu foto de perfil</h3>
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
            <div className="modal-action">
              <button className="btn btn-info text-base" onClick={handleCrop}>Recortar y aplicar</button>
              <button className="btn btn-ghost text-base" onClick={handleCancelCrop}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer-bar w-full">
        <div className="container-fluid flex flex-wrap justify-between items-center px-4 py-3">
          <span className="footer-text text-base">© 2025 GeoPlanner. Todos los derechos reservados — Creado por The GeoPlanner Group.</span>
          <div className="footer-links flex flex-wrap gap-3">
            <a href="/terminos" className="footer-link text-base" target="_blank">Términos</a>
            <a href="/privacidad" className="footer-link text-base" target="_blank">Privacidad</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RegisterStep3;
