/**
 * ========================================
 * COMPONENTE DASHBOARD DE GEOPLANNER
 * ========================================
 * 
 * Este es el componente principal de la aplicación GeoPlanner.
 * Es el panel de control donde los usuarios pueden:
 * - Ver todas las publicaciones y eventos
 * - Crear nuevas publicaciones
 * - Gestionar su perfil
 * - Ver notificaciones
 * - Interactuar con otros usuarios
 * 
 * CONFIGURACIONES IMPORTANTES:
 * 
 * 1. AGREGAR NUEVAS FUNCIONALIDADES (líneas 100-200):
 *    - Añade nuevos estados con useState
 *    - Ubicación: Después de los estados existentes
 *    - Ejemplo: const [nuevaFuncion, setNuevaFuncion] = useState(false)
 * 
 * 2. CONFIGURAR MAPA (líneas 300-400):
 *    - mapContainerRef: Referencia al contenedor del mapa
 *    - mapInstanceRef: Instancia de Leaflet
 *    - markerRef: Marcador en el mapa
 *    - Para cambiar el centro del mapa, modifica las coordenadas
 * 
 * 3. AGREGAR NUEVOS FILTROS (líneas 500-600):
 *    - Añade opciones en el array de filtros
 *    - Estructura: { value: 'valor', label: 'Etiqueta' }
 *    - Para agregar lógica de filtrado, modifica handleFilterChange
 * 
 * 4. CONFIGURAR NOTIFICACIONES (líneas 700-800):
 *    - showNotifications: Estado para mostrar/ocultar
 *    - Para agregar nuevos tipos de notificaciones, modifica aquí
 *    - Integración con el sistema de notificaciones del backend
 * 
 * 5. AGREGAR NUEVOS MODALES (líneas 900-1000):
 *    - Añade estados para nuevos modales
 *    - Ejemplo: const [showMiModal, setShowMiModal] = useState(false)
 *    - Para agregar el modal, añádelo en el JSX al final
 * 
 * 6. CONFIGURAR VISTA DE MAPA (líneas 1100-1200):
 *    - viewMode: 'map' | 'classic' controla la vista
 *    - Para agregar nuevas vistas, añade opciones al selector
 *    - Integración con Leaflet para mapas interactivos
 * 
 * FUNCIONALIDADES ACTUALES:
 * - Feed de publicaciones con filtros por tipo y ubicación
 * - Vista de mapa (Leaflet) y vista clásica (cards)
 * - Sistema de likes y comentarios en tiempo real
 * - Inscripciones a eventos con códigos QR
 * - Notificaciones push y en tiempo real
 * - Gestión de amistades y solicitudes
 * - Búsqueda y filtrado avanzado
 * - Modales para crear publicaciones y eventos
 * 
 * ESTADOS PRINCIPALES:
 * - posts: Array de publicaciones del feed
 * - viewMode: Tipo de vista (map/classic)
 * - selectedFilter: Filtro activo
 * - showCreateModal: Modal de crear publicación
 * - notifications: Array de notificaciones
 * - mapLoaded: Estado de carga del mapa
 * 
 * UBICACIÓN DE ARCHIVOS:
 * - Estilos: src/components/Dashboard.css
 * - API: src/services/api.ts
 * - Contexto: src/contexts/AuthContext.tsx
 * - Componentes hijos: src/components/ (varios archivos)
 * 
 * NOTA: Este es el componente más complejo, maneja múltiples estados
 */

import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/api'
// import type { QRVerificationResponse } from '../services/api'
import type { Post, AgendaItem, SavedEvent } from '../services/api'
import logo from '../assets/img/LogoMini.png'
import logoNoche from '../assets/img/logo_noche.png'
import placeholder from '../assets/img/placeholder.png'
// import QRScanner from './QRScanner'
import QRCodeDisplay from '../components/QRCodeDisplay'
import AttendanceHistory from '../components/AttendanceHistory'
import FriendshipNotification from '../components/FriendshipNotification'
import ErrorModal from '../components/ErrorModal'

import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'

// Importar Leaflet y Routing Machine dinámicamente
let L: any = null
let LRouting: any = null
if (typeof window !== 'undefined') {
  import('leaflet').then(leaflet => {
    L = leaflet.default;
  });
  import('leaflet-routing-machine').then(routing => {
    LRouting = routing.default;
  });
}

/**
 * ========================================
 * COMPONENTE PRINCIPAL DEL DASHBOARD
 * ========================================
 * 
 * Dashboard es el corazón de GeoPlanner donde los usuarios
 * pasan la mayor parte del tiempo interactuando con la aplicación.
 */

const Dashboard = () => {
  // ========================================
  // REFERENCIAS Y HOOKS PRINCIPALES
  // ========================================
  // Estas referencias se usan para interactuar con el mapa de Leaflet
  const mapContainerRef = useRef<HTMLDivElement>(null)  // Referencia al contenedor del mapa
  const mapInstanceRef = useRef<any>(null)              // Instancia de Leaflet
  const navigate = useNavigate()                        // Hook para navegación entre páginas
  const { user, logout } = useAuth()                    // Hook de autenticación (usuario actual y función de logout)
  
  // ========================================
  // ESTADOS DE CONFIGURACIÓN GENERAL
  // ========================================
  // CORRECCIÓN: Añadido estado de carga para el tema para evitar el parpadeo
  const [isThemeLoading, setIsThemeLoading] = useState(true)
  const [showInternalLoading, setShowInternalLoading] = useState(true) // Pantalla de carga interna del dashboard (0.5s adicionales para tapar parpadeo)
  const [myInscriptions, setMyInscriptions] = useState<any[]>([]) // Inscripciones del usuario actual
  const [showMyInscriptionsModal, setShowMyInscriptionsModal] = useState(false) // Modal de mis inscripciones
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'error' | 'warning' | 'info' | 'success';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'error'
  })

  // ========================================
  // ESTADOS DE VISTA Y CONFIGURACIÓN
  // ========================================
  // Controlan cómo se muestra la información al usuario
  const [currentView, setCurrentView] = useState<'map' | 'classic'>('map')        // Vista actual: mapa o clásica
  const [currentMapStyle, setCurrentMapStyle] = useState('openstreetmap')         // Estilo del mapa (openstreetmap, satellite, etc.)
  const [currentTheme, setCurrentTheme] = useState('default')                     // Tema de color actual
  const [filterType, setFilterType] = useState('all')                             // Tipo de filtro aplicado
  const [isMapLoading, setIsMapLoading] = useState(true)                          // Estado de carga del mapa
  
  // ========================================
  // ESTADOS DE UBICACIÓN Y MAPA
  // ========================================
  // Manejan la ubicación del usuario y los marcadores en el mapa
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)  // Coordenadas del usuario
  const [userLocationMarker, setUserLocationMarker] = useState<any>(null)                   // Marcador de ubicación del usuario
  const [events, setEvents] = useState<any[]>([])                                           // Lista de eventos
  const [eventMarkers, setEventMarkers] = useState<any[]>([])                               // Marcadores de eventos en el mapa
  const [routingControl, setRoutingControl] = useState<any>(null)                           // Control de rutas en el mapa
  const [searchTerm, setSearchTerm] = useState('')                                          // Término de búsqueda
  const [filteredEvents, setFilteredEvents] = useState<any[]>([])                           // Eventos filtrados (no usado actualmente)
  
  // ========================================
  // ESTADOS DE MODALES PRINCIPALES
  // ========================================
  // Controlan la visibilidad de los modales principales
  const [showCreateEventModal, setShowCreateEventModal] = useState(false)         // Modal para crear eventos
  const [showAgendaModal, setShowAgendaModal] = useState(false)                   // Modal de agenda
  const [showSavedEventsModal, setShowSavedEventsModal] = useState(false)         // Modal de eventos guardados
  // ========================================
  // ESTADOS DE FORMULARIOS DE EVENTOS
  // ========================================
  // Datos para crear nuevos eventos y elementos de agenda
  const [newEvent, setNewEvent] = useState({
    title: '',              // Título del evento
    description: '',        // Descripción del evento
    type: 'Social',         // Tipo de evento (Social, Deportivo, Cultural, etc.)
    date: '',               // Fecha del evento
    time: '',               // Hora del evento
    maxAttendees: 10        // Número máximo de asistentes
  })
  const [newAgendaItem, setNewAgendaItem] = useState({
    title: '',              // Título del elemento de agenda
    description: '',        // Descripción del elemento
    date: '',               // Fecha del elemento
    location: ''            // Ubicación del elemento
  })
  // ========================================
  // ESTADOS DE DATOS PRINCIPALES
  // ========================================
  // Almacenan los datos principales de la aplicación
  const [posts, setPosts] = useState<Post[]>([])                    // Lista de publicaciones del feed
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([])  // Elementos de la agenda personal
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([])  // Eventos guardados por el usuario
  const [showCalendarView, setShowCalendarView] = useState(false)   // Mostrar vista de calendario
  const [agendaSearchTerm, setAgendaSearchTerm] = useState('')      // Término de búsqueda en agenda
  const [agendaFilter, setAgendaFilter] = useState('all')           // Filtro de agenda (all, upcoming, past, today)
  const [notifications, setNotifications] = useState<any[]>([])     // Lista de notificaciones
  const [showNotifications, setShowNotifications] = useState(false) // Mostrar panel de notificaciones

  // ========================================
  // ESTADOS DE CARGA Y PROCESAMIENTO
  // ========================================
  const [isLoadingData, setIsLoadingData] = useState(false)  // Estado de carga de datos
  
  // ========================================
  // ESTADOS PARA CREACIÓN DE PUBLICACIONES
  // ========================================
  // Controlan el flujo de creación de nuevas publicaciones
  const [showCreatePostModal, setShowCreatePostModal] = useState(false)  // Modal principal de crear publicación
  const [showLocationModal, setShowLocationModal] = useState(false)      // Modal para seleccionar ubicación
  const [routeType, setRouteType] = useState<'simple' | 'multiple'>('simple')  // Tipo de ruta (simple o múltiple)
  const [selectedMarkers, setSelectedMarkers] = useState<any[]>([])      // Marcadores seleccionados en el mapa
  const [locationDisplay, setLocationDisplay] = useState('No se ha seleccionado ninguna ubicación.')  // Texto de ubicación
  const [acceptTerms, setAcceptTerms] = useState(false)                  // Aceptación de términos y condiciones
  const [showTerms, setShowTerms] = useState(false)                      // Mostrar modal de términos
  const [additionalTerms, setAdditionalTerms] = useState('')             // Términos adicionales personalizados
  const [showPostTermsModal, setShowPostTermsModal] = useState(false)    // Modal para mostrar términos de publicación
  const [selectedPostTerms, setSelectedPostTerms] = useState<{geoplanner: string, additional: string} | null>(null)
  
  // ========================================
  // ESTADO DEL FORMULARIO DE NUEVA PUBLICACIÓN
  // ========================================
  // Datos del formulario para crear una nueva publicación
  const [newPost, setNewPost] = useState({
    text: '',                    // Texto de la publicación
    type: 'Social',              // Tipo de publicación (Social, Deportivo, Cultural, etc.)
    eventDate: '',               // Fecha del evento (si aplica)
    privacy: 'publica',          // Privacidad (publica, amigos, privada)
    mediaFile: null as File | null  // Archivo multimedia adjunto
  })
  
  // ========================================
  // ESTADOS PARA FUNCIONALIDADES DEL HEADER
  // ========================================
  // Controlan la búsqueda de direcciones y la navegación
  const [addressSearchTerm, setAddressSearchTerm] = useState('')        // Término de búsqueda de dirección
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([])  // Sugerencias de direcciones
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false)  // Mostrar sugerencias
  const [searchMarker, setSearchMarker] = useState<any>(null)           // Marcador de búsqueda en el mapa
  
  // ========================================
  // ESTADO PARA CONTROLAR DROPDOWNS
  // ========================================
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)  // Controla qué dropdown está abierto
  
  // ========================================
  // ESTADOS PARA SISTEMA DE QR Y ASISTENCIA
  // ========================================
  // Controlan la funcionalidad de códigos QR para eventos
  // const [showQRScanner, setShowQRScanner] = useState(false)  // Modal del escáner QR (comentado)
  const [showQRCodeDisplay, setShowQRCodeDisplay] = useState(false)  // Mostrar código QR generado
  const [showAttendanceHistory, setShowAttendanceHistory] = useState(false)  // Mostrar historial de asistencia
  const [selectedEventForQR, setSelectedEventForQR] = useState<{id: string, title: string} | null>(null)  // Evento seleccionado para QR
  const [selectedEventForHistory, setSelectedEventForHistory] = useState<{id: string, title: string} | null>(null)  // Evento para historial
  
  // ========================================
  // ESTADOS PARA NOTIFICACIONES DE AMISTAD
  // ========================================
  // Controlan las notificaciones de solicitudes de amistad
  const [showFriendshipNotification, setShowFriendshipNotification] = useState(false)  // Mostrar modal de notificación
  const [selectedFriendshipNotification, setSelectedFriendshipNotification] = useState<any>(null)  // Notificación seleccionada
  

  // const [lastVerificationResult, setLastVerificationResult] = useState<QRVerificationResponse | null>(null)
  
  // ========================================
  // CONFIGURACIÓN DE ESTILOS DE MAPA
  // ========================================
  // Define los diferentes estilos de mapa disponibles en la aplicación
  const mapStyles = {
    openstreetmap: {
      name: 'OpenStreetMap',  // Nombre mostrado en la interfaz
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',  // URL de las tiles
      attribution: '© OpenStreetMap contributors'  // Atribución requerida
    },
    satellite: {
      name: 'Vista Satelital',  // Vista satelital de Esri
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '© Esri'
    },
    hybrid_esri: {
      name: 'Satélite con Calles (Esri)',  // Vista híbrida con calles
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '© Esri',
    }
  }

  // Datos de ejemplo de eventos (vacío)
  const sampleEvents: any[] = []

  // Términos y condiciones predeterminados de GeoPlanner
  const DEFAULT_GEOPLANNER_TERMS = `TÉRMINOS Y CONDICIONES DE GEOPLANNER

1. RESPONSABILIDAD EXCLUSIVA DEL ORGANIZADOR:
   Usted es el ÚNICO responsable de la legalidad, seguridad, permisos, control de multitudes, cumplimiento normativo, y todo el contenido y desarrollo de su evento. GeoPlanner NO asume NINGUNA responsabilidad por incidentes, daños, lesiones, muertes, pérdidas materiales o consecuencias legales de cualquier naturaleza.

2. DESLINDE TOTAL DE GEOPLANNER:
   GeoPlanner es ÚNICAMENTE una plataforma tecnológica de intermediación. NO somos organizadores, promotores, ni responsables de eventos. NO nos hacemos responsables por incidentes, accidentes, daños, lesiones, muertes, pérdidas materiales, consecuencias legales, penales, civiles o administrativas de cualquier naturaleza relacionadas con el evento.

3. PROHIBICIONES ABSOLUTAS:
   Se prohíben TERMINANTEMENTE eventos que involucren: actividades ilegales, armas, sustancias ilícitas, violencia, discursos de odio, discriminación, actividades terroristas, tráfico de personas, pornografía, actividades que pongan en riesgo la vida o integridad física de los participantes.

4. COOPERACIÓN OBLIGATORIA CON AUTORIDADES:
   Al publicar, usted AUTORIZA EXPRESAMENTE a GeoPlanner a compartir TODA su información personal, datos de ubicación, historial de actividades, y cualquier información relevante con autoridades judiciales, policiales, gubernamentales o administrativas que lo soliciten, sin necesidad de notificación previa, en caso de investigaciones, denuncias, o sospechas de actividades ilegales.

5. VERIFICACIÓN DE IDENTIDAD Y CUMPLIMIENTO:
   Usted declara bajo juramento que: a) Ha proporcionado información veraz y completa; b) Su identidad ha sido verificada; c) Cumple con todas las leyes aplicables; d) Tiene los permisos necesarios para organizar el evento; e) El evento no viola ninguna normativa local, nacional o internacional.

6. RENUNCIA A RECLAMACIONES:
   Usted renuncia EXPRESAMENTE a presentar cualquier tipo de reclamo, demanda, acción legal o administrativa contra GeoPlanner por cualquier motivo relacionado con el uso de la plataforma o la organización de eventos.

7. JURISDICCIÓN Y LEY APLICABLE:
   Estos términos se rigen por las leyes de Venezuela. Cualquier disputa será resuelta exclusivamente en los tribunales competentes de Venezuela.

⚠️ AL PUBLICAR, USTED DECLARA BAJO JURAMENTO QUE HA LEÍDO, ENTENDIDO Y ACEPTADO ESTOS TÉRMINOS EN SU TOTALIDAD, RECONOCIENDO QUE SON LEGALMENTE VINCULANTES.`

  // Temas disponibles - Copiados del dashboard original
  const temas = {
    default: {
      headerBG: "linear-gradient(145deg, #007BFF, #003366)",
      headerText: "white",
      bodyBG: "#f0f2f5",
      sidebarBG: "linear-gradient(145deg, #007BFF, #003366)",
      sidebarText: "white",
      cardBG: "#ffffff",
      cardText: "#333",
      btnPrimaryBG: "#00bfff"
    },

    aurora: {
      headerBG: "linear-gradient(145deg, #F8CDDA, #E8B4D9, #D19BB8, #B76E99, #8B5A9B, #6B4E8B, #1D2B64)",
      headerText: "#FFFFFF",
      bodyBG: "#fdeff2",
      sidebarBG: "linear-gradient(145deg, #F8CDDA, #E8B4D9, #D19BB8, #B76E99, #8B5A9B, #6B4E8B, #1D2B64)",
      sidebarText: "#FFFFFF",
      cardBG: "#ffffff",
      cardText: "#1D2B64",
      btnPrimaryBG: "#1D2B64"
    },
    noche: {
      headerBG: "linear-gradient(145deg, #0f172a, #1e293b, #334155, #475569, #64748b)",
      headerText: "white",
      bodyBG: "#0f172a",
      sidebarBG: "linear-gradient(145deg, #0f172a, #1e293b, #334155, #475569, #64748b)",
      sidebarText: "white",
      cardBG: "#1e293b",
      cardText: "#e2e8f0",
      btnPrimaryBG: "#38bdf8"
    },
    oceano: {
      headerBG: "linear-gradient(145deg, #2C3E50, #4CA1AF)",
      headerText: "white",
      bodyBG: "#eef6f7",
      sidebarBG: "linear-gradient(145deg, #2C3E50, #4CA1AF)",
      sidebarText: "white",
      cardBG: "#ffffff",
      cardText: "#2C3E50",
      btnPrimaryBG: "#4CA1AF"
    },
    amanecer: {
      headerBG: "linear-gradient(145deg, #FF512F, #F09819)",
      headerText: "white",
      bodyBG: "#fff8f2",
      sidebarBG: "linear-gradient(145deg, #FF512F, #F09819)",
      sidebarText: "white",
      cardBG: "#ffffff",
      cardText: "#5c2a07",
      btnPrimaryBG: "#FF512F"
    },
    pastel: {
      headerBG: "linear-gradient(145deg, #A1C4FD, #C2E9FB)",
      headerText: "#003366",
      bodyBG: "#f5f9ff",
      sidebarBG: "linear-gradient(145deg, #A1C4FD, #C2E9FB)",
      sidebarText: "#003366",
      cardBG: "#ffffff",
      cardText: "#333",
      btnPrimaryBG: "#A1C4FD"
    },
    fuego: {
      headerBG: "linear-gradient(145deg, #CB356B, #BD3F32)",
      headerText: "white",
      bodyBG: "#f9f2f3",
      sidebarBG: "linear-gradient(145deg, #CB356B, #BD3F32)",
      sidebarText: "white",
      cardBG: "#ffffff",
      cardText: "#4d1024",
      btnPrimaryBG: "#CB356B"
    },
    bosque: {
      headerBG: "linear-gradient(145deg, #11998E, #38EF7D)",
      headerText: "white",
      bodyBG: "#f2fcf8",
      sidebarBG: "linear-gradient(145deg, #11998E, #38EF7D)",
      sidebarText: "white",
      cardBG: "#ffffff",
      cardText: "#043d38",
      btnPrimaryBG: "#11998E"
    },
    lluvia: {
      headerBG: "linear-gradient(145deg, #396afc, #2948ff)",
      headerText: "white",
      bodyBG: "#f0f2ff",
      sidebarBG: "linear-gradient(145deg, #396afc, #2948ff)",
      sidebarText: "white",
      cardBG: "#ffffff",
      cardText: "#192d8b",
      btnPrimaryBG: "#396afc"
    }
  }

  // Funciones para búsqueda de direcciones
  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([])
      return
    }

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&countrycodes=ve`
      const response = await fetch(url, { headers: { 'Accept-Language': 'es' } })
      const results = await response.json()
      
      if (results.length === 0) {
        setAddressSuggestions([{ display_name: 'No se encontraron resultados.' }])
      } else {
        setAddressSuggestions(results)
      }
      setShowAddressSuggestions(true)
    } catch (error) {
      console.error('Error buscando dirección:', error)
      setAddressSuggestions([{ display_name: 'Error de conexión.' }])
      setShowAddressSuggestions(true)
    }
  }

  // ========================================
  // FUNCIÓN PARA CENTRAR MAPA EN DIRECCIÓN
  // ========================================
  // Centra el mapa en una ubicación específica y agrega un marcador
  const centerMapOnAddress = (lat: number, lon: number, label: string) => {
    if (!mapInstanceRef.current) return  // Verificar que el mapa esté inicializado
    
    // Centrar el mapa en las coordenadas con animación
    mapInstanceRef.current.setView([lat, lon], 16, { animate: true })
    
    // Remover marcador anterior si existe
    if (searchMarker) {
      mapInstanceRef.current.removeLayer(searchMarker)
    }
    
    // Crear nuevo marcador personalizado con icono SVG
    if (L) {
      const newMarker = L.marker([lat, lon], {
        icon: L.divIcon({
          html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="#007bff" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
          className: 'search-marker',  // Clase CSS para estilos
          iconSize: [32, 32],          // Tamaño del icono
          iconAnchor: [16, 32],        // Punto de anclaje
          popupAnchor: [0, -36]        // Posición del popup
        })
      }).addTo(mapInstanceRef.current).bindPopup(`<b>${label}</b>`).openPopup()
      
      setSearchMarker(newMarker)  // Guardar referencia al marcador
    }
    
    // Limpiar interfaz de búsqueda
    setShowAddressSuggestions(false)
    setAddressSearchTerm(label)
  }

  const handleAddressSearch = async () => {
    if (!addressSearchTerm.trim()) return
    
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressSearchTerm)}&addressdetails=1&limit=1&countrycodes=ve`
      const response = await fetch(url, { headers: { 'Accept-Language': 'es' } })
      const results = await response.json()
      
      if (results.length > 0) {
        const lat = parseFloat(results[0].lat)
        const lon = parseFloat(results[0].lon)
        centerMapOnAddress(lat, lon, results[0].display_name)
      } else {
        alert('No se encontró la dirección.')
      }
    } catch (error) {
      alert('Error de conexión.')
    }
    
    setShowAddressSuggestions(false)
  }

  // ========================================
  // FUNCIONES DE CONTROL DE DROPDOWNS
  // ========================================
  // Maneja la apertura y cierre de los menús desplegables
  const handleDropdown = (dropdownName: string) => {
    console.log('handleDropdown llamado con:', dropdownName)
    setOpenDropdown(prev => {
      const newState = prev === dropdownName ? null : dropdownName  // Toggle del dropdown
      console.log('Estado anterior:', prev, 'Nuevo estado:', newState)
      return newState
    })
  }

  // Cerrar todos los dropdowns abiertos
  const closeAllDropdowns = () => {
    setOpenDropdown(null)
  }

  // ========================================
  // FUNCIONES DE NAVEGACIÓN Y PERFIL
  // ========================================
  // Navegar a la página de perfil del usuario
  const handleProfile = () => {
    navigate('/perfil')
    closeAllDropdowns();  // Cerrar dropdowns al navegar
  }

  // Cerrar sesión y redirigir al inicio
  const handleLogout = () => {
    // Limpiar ubicación del localStorage al hacer logout
    localStorage.removeItem('geoplanner_user_location')
    console.log('📍 Ubicación limpiada del localStorage al hacer logout')
    
    logout()  // Función del contexto de autenticación
    navigate('/')  // Redirigir a la página principal
    closeAllDropdowns();  // Cerrar dropdowns
  }

  // Función helper para cerrar dropdowns (alias de closeAllDropdowns)
  const closeDropdown = () => {
    setOpenDropdown(null)
  }

  // ========================================
  // FUNCIÓN PARA CARGAR LEAFLET DINÁMICAMENTE
  // ========================================
  // Carga la librería Leaflet de forma asíncrona para optimizar el rendimiento
  const loadLeaflet = async () => {
    if (typeof window !== 'undefined' && !L) {  // Verificar que estemos en el navegador y Leaflet no esté cargado
      try {
        const leafletModule = await import('leaflet')  // Importación dinámica de Leaflet
        L = leafletModule.default  // Asignar a la variable global L
        console.log('Leaflet cargado exitosamente')
        return true
      } catch (error) {
        console.error('Error cargando Leaflet:', error)
        return false
      }
    }
    return !!L  // Retornar true si Leaflet ya está cargado
  }

  // ========================================
  // FUNCIÓN PARA CREAR RUTA ENTRE DOS PUNTOS
  // ========================================
  // Crea una ruta visual en el mapa entre dos coordenadas usando Leaflet Routing Machine
  const createRoute = async (startPoint: [number, number], endPoint: [number, number]) => {
    console.log('🗺️ createRoute llamado con:', { startPoint, endPoint })
    
    if (!mapInstanceRef.current) {
      console.error('❌ Mapa no disponible')
      showError('Error de Mapa', 'El mapa no está disponible. Recarga la página.', 'error')
      return
    }
    
    if (!L) {
      console.error('❌ Leaflet no disponible')
      showError('Error de Mapa', 'Leaflet no está disponible. Recarga la página.', 'error')
      return
    }

    try {
      // Limpiar rutas existentes antes de crear una nueva
      clearRoutes()

      // Ocultar todos los eventos excepto el destino
      console.log('📍 Ocultando otros eventos del mapa...')
      eventMarkers.forEach(marker => {
        const markerLatLng = marker.getLatLng()
        const isDestination = Math.abs(markerLatLng.lat - endPoint[0]) < 0.001 && Math.abs(markerLatLng.lng - endPoint[1]) < 0.001
        
        if (!isDestination) {
          marker.remove()
        }
      })

      // Obtener ruta real usando OSRM API
      console.log('📍 Obteniendo ruta real desde OSRM...')
      
      const startLng = startPoint[1]
      const startLat = startPoint[0]
      const endLng = endPoint[1]
      const endLat = endPoint[0]
      
      const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0]
        const coordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]) // OSRM usa [lng, lat], Leaflet usa [lat, lng]
        
        console.log('📍 Ruta obtenida:', {
          distance: (route.distance / 1000).toFixed(2) + ' km',
          duration: Math.round(route.duration / 60) + ' min',
          coordinates: coordinates.length
        })
        
        // Crear línea de ruta con las coordenadas reales
        const routeLine = L.polyline(coordinates, {
          color: '#007BFF',
          weight: 6,
          opacity: 0.8,
          dashArray: '10, 10'
        }).addTo(mapInstanceRef.current)

        // Ajustar la vista para mostrar toda la ruta
        const bounds = L.latLngBounds(coordinates)
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] })

        // Guardar referencia de la línea para poder eliminarla después
        setRoutingControl(routeLine)
        console.log('✅ Ruta real creada exitosamente')
        
      } else {
        throw new Error('No se pudo obtener la ruta desde OSRM')
      }
      
    } catch (error) {
      console.error('❌ Error creando ruta:', error)
      console.error('❌ Detalles del error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      
      // Fallback: crear ruta directa si falla OSRM
      console.log('📍 Creando ruta directa como fallback...')
      
      const routeLine = L.polyline([
        [startPoint[0], startPoint[1]],
        [endPoint[0], endPoint[1]]
      ], {
        color: '#FF6B6B',
        weight: 4,
        opacity: 0.6,
        dashArray: '5, 5'
      }).addTo(mapInstanceRef.current)

      const bounds = L.latLngBounds([
        [startPoint[0], startPoint[1]],
        [endPoint[0], endPoint[1]]
      ])
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] })

      setRoutingControl(routeLine)
      console.log('✅ Ruta directa creada como fallback')
    }
  }

  // ========================================
  // FUNCIÓN PARA LIMPIAR RUTAS
  // ========================================
  // Elimina todas las rutas visuales del mapa
  const clearRoutes = () => {
    console.log('🗑️ clearRoutes llamado, routingControl:', !!routingControl)
    
    if (routingControl && mapInstanceRef.current) {  // Verificar que exista una ruta y el mapa
      if (routingControl.remove) {
        // Si es un control de ruta (leaflet-routing-machine)
        mapInstanceRef.current.removeControl(routingControl)
      } else {
        // Si es una línea simple (polyline)
        mapInstanceRef.current.removeLayer(routingControl)
      }
      setRoutingControl(null)  // Limpiar la referencia
      console.log('🗑️ Ruta limpiada exitosamente')
    } else {
      console.log('🗑️ No hay ruta activa para limpiar')
    }
  }

  // ========================================
  // FUNCIÓN PARA RESTAURAR TODOS LOS EVENTOS
  // ========================================
  // Restaura todos los eventos en el mapa después de limpiar una ruta
  const restoreAllEvents = () => {
    console.log('🔄 Restaurando todos los eventos en el mapa...')
    
    if (!mapInstanceRef.current || !L) {
      console.log('❌ No se puede restaurar eventos: mapa o L no disponible')
      return
    }

    // Paleta de colores para diferentes tipos de eventos
    const colors = {
      'Deporte': '#28a745',    // Verde para deportes
      'Estudio': '#007bff',    // Azul para estudio
      'Social': '#ffc107',     // Amarillo para eventos sociales
      'Cultural': '#dc3545',   // Rojo para eventos culturales
      'Otro': '#6c757d'        // Gris para otros tipos
    }

    // Obtener eventos filtrados actuales
    const eventsToDisplay = filterEvents()
    console.log('🔄 Eventos a restaurar:', eventsToDisplay.length)

    // Limpiar marcadores existentes
    eventMarkers.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker)
    })

    // Crear nuevos marcadores para todos los eventos
    const newMarkers: any[] = []
    
    eventsToDisplay.forEach(event => {
      const icon = createEventIcon(event.type)
      if (icon) {
        const marker = L.marker([event.lat, event.lng], { icon }).addTo(mapInstanceRef.current)
        
        // Crear contenido del popup mejorado
        const popupContent = `
          <div style="min-width: 320px; max-width: 400px; padding: 8px;">
            <div style="display: flex; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #f0f0f0;">
              <div style="
                width: 40px; 
                height: 40px; 
                background: ${colors[event.type as keyof typeof colors] || colors.Otro}; 
                border-radius: 50%; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                margin-right: 12px;
                color: white;
                font-weight: bold;
                font-size: 16px;
              ">${event.type.charAt(0)}</div>
              <div>
                <h5 style="margin: 0; color: #333; font-size: 16px; font-weight: bold;">${event.title}</h5>
                <p style="margin: 4px 0 0 0; color: #666; font-size: 12px;">${event.type}</p>
              </div>
            </div>
            
            <div style="margin-bottom: 12px;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #555; line-height: 1.4;">${event.description.substring(0, 150)}${event.description.length > 150 ? '...' : ''}</p>
            </div>
            
            <div class="event-info" style="background: #f8f9fa; padding: 8px; border-radius: 6px; margin-bottom: 12px;">
              <div style="font-size: 12px; color: #666; line-height: 1.6;">
                <div style="margin-bottom: 4px;"><strong>👤 Organizador:</strong> ${event.organizer}</div>
                <div style="margin-bottom: 4px;"><strong>📅 Fecha:</strong> ${event.date} a las ${event.time}</div>
                <div style="margin-bottom: 4px;"><strong>👥 Asistentes:</strong> ${event.attendees}/${event.maxAttendees}</div>
              </div>
            </div>
            
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button class="btn btn-sm btn-primary" style="font-size: 11px; padding: 6px 10px;" onclick="alert('Función de inscripción próximamente')">
                ✅ Inscribirse
              </button>
              <button class="btn btn-sm btn-outline-secondary" style="font-size: 11px; padding: 6px 10px;" onclick="alert('Función de guardar próximamente')">
                ${event.saved ? '❤️' : '🤍'} Guardar
              </button>
              <button class="btn btn-sm btn-success" style="font-size: 11px; padding: 6px 10px;" onclick="window.routeToEvent(${event.lat}, ${event.lng})">
                🗺️ Ruta
              </button>
              <button class="btn btn-sm btn-warning" style="font-size: 11px; padding: 6px 10px;" onclick="window.clearRouteAndRestoreEvents()">
                🗑️ Limpiar
              </button>
            </div>
          </div>
        `
        
        marker.bindPopup(popupContent)
        
        // Agregar eventos para distancia y restauración
        marker.on('popupopen', async () => {
          const savedLocation = localStorage.getItem('geoplanner_user_location')
          if (savedLocation) {
            try {
              const userLocation = JSON.parse(savedLocation)
              const startLng = userLocation.lng
              const startLat = userLocation.lat
              const endLng = event.lng
              const endLat = event.lat
              
              const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=false`
              
              const response = await fetch(url)
              const data = await response.json()
              
              if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                const route = data.routes[0]
                const distance = (route.distance / 1000).toFixed(1)
                const duration = Math.round(route.duration / 60)
                
                const popupElement = marker.getPopup().getElement()
                if (popupElement) {
                  const infoDiv = popupElement.querySelector('.event-info')
                  if (infoDiv) {
                    const existingDistance = infoDiv.querySelector('.distance-info')
                    if (existingDistance) {
                      existingDistance.remove()
                    }
                    
                    const distanceInfo = document.createElement('div')
                    distanceInfo.className = 'distance-info'
                    distanceInfo.innerHTML = `
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>🚗 <strong>Distancia:</strong></span>
                        <span><strong>${distance} km</strong> (${duration} min)</span>
                      </div>
                    `
                    infoDiv.appendChild(distanceInfo)
                  }
                }
              }
            } catch (error) {
              console.log('📍 Error calculando distancia:', error)
            }
          }
        })
        
        marker.on('popupclose', () => {
          if (routingControl) {
            console.log('📍 Popup cerrado, limpiando ruta y restaurando eventos...')
            clearRoutes()
            restoreAllEvents()
          }
        })
        
        newMarkers.push(marker)
      }
    })

    setEventMarkers(newMarkers)
    console.log('✅ Todos los eventos restaurados')
  }

  // ========================================
  // FUNCIÓN PARA CREAR RUTA A UN EVENTO
  // ========================================
  // Crea una ruta desde la ubicación del usuario hasta un evento específico
  const routeToEvent = async (eventLat: number, eventLng: number) => {
    console.log('🗺️ routeToEvent llamado con:', { eventLat, eventLng })
    console.log('🗺️ userLocation actual:', userLocation)
    
    // Función para obtener ubicación desde localStorage o geolocalización
    const getLocationForRoute = async (): Promise<{lat: number, lng: number}> => {
      // Primero intentar desde localStorage
      const savedLocation = localStorage.getItem('geoplanner_user_location')
      if (savedLocation) {
        try {
          const location = JSON.parse(savedLocation)
          console.log('📍 Usando ubicación del localStorage:', location)
          return location
        } catch (error) {
          console.warn('📍 Error parseando ubicación del localStorage:', error)
          localStorage.removeItem('geoplanner_user_location')
        }
      }
      
      // Si no hay en localStorage, obtener desde geolocalización
      console.log('📍 Obteniendo ubicación desde geolocalización...')
      return new Promise<{lat: number, lng: number}>((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
              console.log('✅ Ubicación obtenida desde geolocalización:', location)
              
              // Guardar en localStorage para futuras referencias
              localStorage.setItem('geoplanner_user_location', JSON.stringify(location))
              console.log('📍 Ubicación guardada en localStorage')
              
              setUserLocation(location)
              addUserLocationToMap(location)
              resolve(location)
            },
            (error) => {
              console.error('❌ Error obteniendo ubicación:', error)
              let errorMessage = 'Error desconocido'
              
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  errorMessage = 'Permisos de ubicación denegados. Ve a Configuración > Privacidad y Seguridad > Ubicación y permite el acceso.'
                  break
                case error.POSITION_UNAVAILABLE:
                  errorMessage = 'La información de ubicación no está disponible. Verifica tu conexión a internet.'
                  break
                case error.TIMEOUT:
                  errorMessage = 'Tiempo de espera agotado. Intenta nuevamente.'
                  break
                default:
                  errorMessage = 'Error obteniendo ubicación. Verifica tu conexión y permisos.'
              }
              
              showError('Error de Ubicación', errorMessage, 'warning')
              reject(error)
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000
            }
          )
        } else {
          reject(new Error('Geolocalización no soportada'))
        }
      })
    }
    
    try {
      // Obtener ubicación (desde localStorage o geolocalización)
      const location = await getLocationForRoute()
      
      // Crear la ruta
      console.log('✅ Creando ruta desde:', location, 'hasta:', { eventLat, eventLng })
      await createRoute([location.lat, location.lng], [eventLat, eventLng])
      
    } catch (error) {
      console.error('❌ Error en routeToEvent:', error)
      showError('Ubicación No Disponible', 'No se puede crear la ruta. Haz clic en el botón de ubicación (📍) para actualizar tu posición.', 'warning')
    }
  }

  // ========================================
  // FUNCIÓN PARA CREAR ICONO DE UBICACIÓN DEL USUARIO
  // ========================================
  // Crea un icono personalizado para mostrar la ubicación del usuario en el mapa
  const createUserLocationIcon = (zoomLevel: number) => {
    if (!L) return null  // Verificar que Leaflet esté disponible
    
    // Calcular tamaño del icono basado en el nivel de zoom (entre 20px y 50px)
    const iconSize = Math.max(20, Math.min(50, zoomLevel * 3))
    return L.divIcon({
      html: `<img src="${logo}" style="width: ${iconSize}px; height: ${iconSize}px; border-radius: 50%; border: 3px solid #007BFF; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);" alt="Tu ubicación">`,
      className: 'user-location-marker',  // Clase CSS para estilos adicionales
      iconSize: [iconSize, iconSize],     // Tamaño del icono
      iconAnchor: [iconSize / 2, iconSize / 2]  // Punto de anclaje (centro del icono)
    })
  }

  // ========================================
  // FUNCIÓN PARA OBTENER UBICACIÓN DEL USUARIO
  // ========================================
  // Utiliza la API de geolocalización del navegador para obtener la ubicación actual
  const getUserLocation = () => {
    console.log('📍 getUserLocation llamado')
    console.log('📍 navigator.geolocation disponible:', !!navigator.geolocation)
    
    // Primero intentar obtener del localStorage
    const savedLocation = localStorage.getItem('geoplanner_user_location')
    if (savedLocation) {
      try {
        const location = JSON.parse(savedLocation)
        console.log('📍 Ubicación encontrada en localStorage:', location)
        setUserLocation(location)
        addUserLocationToMap(location)
        return
      } catch (error) {
        console.warn('📍 Error parseando ubicación del localStorage:', error)
        localStorage.removeItem('geoplanner_user_location')
      }
    }
    
    if (navigator.geolocation) {  // Verificar que el navegador soporte geolocalización
      console.log('📍 Solicitando ubicación del usuario...')
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Éxito: crear objeto de ubicación con coordenadas
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          console.log('✅ Ubicación del usuario obtenida exitosamente:', location)
          console.log('📍 Precisión:', position.coords.accuracy, 'metros')
          
          // Guardar en localStorage
          localStorage.setItem('geoplanner_user_location', JSON.stringify(location))
          console.log('📍 Ubicación guardada en localStorage')
          
          setUserLocation(location)  // Guardar ubicación en el estado
          addUserLocationToMap(location)  // Agregar marcador al mapa
        },
        (error) => {
          // Error: usar ubicación por defecto (Maracaibo, Venezuela)
          console.error('❌ Error obteniendo ubicación del usuario:', error)
          console.error('📍 Código de error:', error.code)
          console.error('📍 Mensaje de error:', error.message)
          
          const defaultLocation = { lat: 10.654, lng: -71.612 }
          console.log('📍 Usando ubicación por defecto:', defaultLocation)
          setUserLocation(defaultLocation)
          addUserLocationToMap(defaultLocation)
        },
        {
          enableHighAccuracy: true,  // Solicitar alta precisión
          timeout: 15000,            // Timeout de 15 segundos (aumentado)
          maximumAge: 300000         // Cache de 5 minutos
        }
      )
    } else {
      // Navegador no soporta geolocalización
      console.warn('❌ Geolocalización no soportada por este navegador')
      const defaultLocation = { lat: 10.654, lng: -71.612 }
      console.log('📍 Usando ubicación por defecto:', defaultLocation)
      setUserLocation(defaultLocation)
      addUserLocationToMap(defaultLocation)
    }
  }

  // ========================================
  // FUNCIÓN PARA AGREGAR UBICACIÓN DEL USUARIO AL MAPA
  // ========================================
  // Agrega un marcador personalizado en el mapa para mostrar la ubicación del usuario
  const addUserLocationToMap = (location: {lat: number, lng: number}) => {
    if (!mapInstanceRef.current || !L || !location) return  // Verificar dependencias

    // Remover marcador anterior si existe para evitar duplicados
    if (userLocationMarker) {
      mapInstanceRef.current.removeLayer(userLocationMarker)
    }

    const currentZoom = mapInstanceRef.current.getZoom()  // Obtener nivel de zoom actual
    const icon = createUserLocationIcon(currentZoom)      // Crear icono personalizado
    
    if (icon) {
      // Crear y agregar marcador al mapa
      const marker = L.marker([location.lat, location.lng], { icon }).addTo(mapInstanceRef.current)
      marker.bindPopup('<b>Tu ubicación actual</b><br>¡Aquí estás tú!')  // Agregar popup informativo
      setUserLocationMarker(marker)  // Guardar referencia del marcador

      // Actualizar icono cuando cambie el zoom para mantener proporciones
      mapInstanceRef.current.on('zoomend', () => {
        if (marker) {
          const newZoom = mapInstanceRef.current.getZoom()
          const newIcon = createUserLocationIcon(newZoom)
          if (newIcon) {
            marker.setIcon(newIcon)  // Cambiar icono con nuevo tamaño
          }
        }
      })
    }
  }

  // ========================================
  // FUNCIÓN PARA CENTRAR MAPA EN USUARIO
  // ========================================
  // Centra la vista del mapa en la ubicación actual del usuario
  const centerMapOnUser = () => {
    if (mapInstanceRef.current && userLocation) {  // Verificar que el mapa y la ubicación estén disponibles
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], mapInstanceRef.current.getZoom(), { animate: true })  // Centrar con animación
    } else {
      alert('Ubicación de usuario no disponible.')  // Mensaje de error si no hay ubicación
    }
  }

  // ========================================
  // FUNCIÓN PARA CREAR ICONO DE EVENTOS
  // ========================================
  // Crea iconos personalizados para diferentes tipos de eventos en el mapa
  const createEventIcon = (eventType: string) => {
    if (!L) return null  // Verificar que Leaflet esté disponible
    
    // Paleta de colores para diferentes tipos de eventos
    const colors = {
      'Deporte': '#28a745',    // Verde para deportes
      'Estudio': '#007bff',    // Azul para estudio
      'Social': '#ffc107',     // Amarillo para eventos sociales
      'Cultural': '#dc3545',   // Rojo para eventos culturales
      'Otro': '#6c757d'        // Gris para otros tipos
    }
    
    // Obtener color del tipo de evento o usar color por defecto
    const color = colors[eventType as keyof typeof colors] || colors.Otro
    

    
    return L.divIcon({
      html: `<div style="
        width: 30px; 
        height: 30px; 
        background: ${color}; 
        border: 3px solid white; 
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        color: white; 
        font-weight: bold; 
        font-size: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">${eventType.charAt(0)}</div>`,  // Mostrar primera letra del tipo
      className: 'event-marker',        // Clase CSS para estilos adicionales
      iconSize: [30, 30],              // Tamaño del icono original
      iconAnchor: [15, 15]             // Punto de anclaje (centro)
    })
  }

  // ========================================
  // FUNCIÓN PARA AGREGAR EVENTOS AL MAPA
  // ========================================
  // Agrega marcadores de eventos al mapa con popups informativos
  const addEventsToMap = (eventsToShow: any[] = []) => {
    // Paleta de colores para diferentes tipos de eventos (necesaria para el popup)
    const colors = {
      'Deporte': '#28a745',    // Verde para deportes
      'Estudio': '#007bff',    // Azul para estudio
      'Social': '#ffc107',     // Amarillo para eventos sociales
      'Cultural': '#dc3545',   // Rojo para eventos culturales
      'Otro': '#6c757d'        // Gris para otros tipos
    }
    console.log('🗺️ addEventsToMap llamado con:', eventsToShow.length, 'eventos')
    console.log('🗺️ mapInstanceRef.current existe:', !!mapInstanceRef.current)
    console.log('🗺️ L existe:', !!L)
    
    if (!mapInstanceRef.current || !L) {  // Verificar que el mapa y Leaflet estén disponibles
      console.log('❌ No se puede agregar eventos: mapa o L no disponible')
      return
    }

    // Limpiar marcadores existentes para evitar duplicados
    console.log('🗺️ Limpiando', eventMarkers.length, 'marcadores existentes')
    eventMarkers.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker)
    })

    const newMarkers: any[] = []  // Array para almacenar nuevos marcadores

    // Usar eventos filtrados si no se proporcionan eventos específicos
    const eventsToDisplay = eventsToShow.length > 0 ? eventsToShow : filterEvents()
    console.log('🗺️ Eventos a mostrar:', eventsToDisplay.length)
    console.log('🗺️ Eventos:', eventsToDisplay)

    eventsToDisplay.forEach(event => {
      const icon = createEventIcon(event.type)
      if (icon) {
        const marker = L.marker([event.lat, event.lng], { icon }).addTo(mapInstanceRef.current)
        
        // Crear contenido del popup mejorado
        const popupContent = `
          <div style="min-width: 320px; max-width: 400px; padding: 8px;">
            <div style="display: flex; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #f0f0f0;">
              <div style="
                width: 40px; 
                height: 40px; 
                background: ${colors[event.type as keyof typeof colors] || colors.Otro}; 
                border-radius: 50%; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                margin-right: 12px;
                color: white;
                font-weight: bold;
                font-size: 16px;
              ">${event.type.charAt(0)}</div>
              <div>
                <h5 style="margin: 0; color: #333; font-size: 16px; font-weight: bold;">${event.title}</h5>
                <p style="margin: 4px 0 0 0; color: #666; font-size: 12px;">${event.type}</p>
              </div>
            </div>
            
            <div style="margin-bottom: 12px;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #555; line-height: 1.4;">${event.description.substring(0, 150)}${event.description.length > 150 ? '...' : ''}</p>
            </div>
            
            <div class="event-info" style="background: #f8f9fa; padding: 8px; border-radius: 6px; margin-bottom: 12px;">
              <div style="font-size: 12px; color: #666; line-height: 1.6;">
                <div style="margin-bottom: 4px;"><strong>👤 Organizador:</strong> ${event.organizer}</div>
                <div style="margin-bottom: 4px;"><strong>📅 Fecha:</strong> ${event.date} a las ${event.time}</div>
                <div style="margin-bottom: 4px;"><strong>👥 Asistentes:</strong> ${event.attendees}/${event.maxAttendees}</div>
              </div>
            </div>
            
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button class="btn btn-sm btn-primary" style="font-size: 11px; padding: 6px 10px;" onclick="alert('Función de inscripción próximamente')">
                ✅ Inscribirse
              </button>
              <button class="btn btn-sm btn-outline-secondary" style="font-size: 11px; padding: 6px 10px;" onclick="alert('Función de guardar próximamente')">
                ${event.saved ? '❤️' : '🤍'} Guardar
              </button>
              <button class="btn btn-sm btn-success" style="font-size: 11px; padding: 6px 10px;" onclick="window.routeToEvent(${event.lat}, ${event.lng})">
                🗺️ Ruta
              </button>
              <button class="btn btn-sm btn-warning" style="font-size: 11px; padding: 6px 10px;" onclick="window.clearRouteAndRestoreEvents()">
                🗑️ Limpiar
              </button>
            </div>
          </div>
        `
        
        marker.bindPopup(popupContent)
        
        // Agregar evento para calcular distancia cuando se abra el popup
        marker.on('popupopen', async () => {
          const savedLocation = localStorage.getItem('geoplanner_user_location')
          if (savedLocation) {
            try {
              const userLocation = JSON.parse(savedLocation)
              const startLng = userLocation.lng
              const startLat = userLocation.lat
              const endLng = event.lng
              const endLat = event.lat
              
              const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=false`
              
              const response = await fetch(url)
              const data = await response.json()
              
              if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                const route = data.routes[0]
                const distance = (route.distance / 1000).toFixed(1)
                const duration = Math.round(route.duration / 60)
                
                // Actualizar el popup con la información de distancia
                const popupElement = marker.getPopup().getElement()
                if (popupElement) {
                  const infoDiv = popupElement.querySelector('.event-info')
                  if (infoDiv) {
                    // Verificar si ya existe información de distancia
                    const existingDistance = infoDiv.querySelector('.distance-info')
                    if (existingDistance) {
                      existingDistance.remove()
                    }
                    
                    const distanceInfo = document.createElement('div')
                    distanceInfo.className = 'distance-info'
                    distanceInfo.innerHTML = `
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>🚗 <strong>Distancia:</strong></span>
                        <span><strong>${distance} km</strong> (${duration} min)</span>
                      </div>
                    `
                    infoDiv.appendChild(distanceInfo)
                  }
                }
              }
            } catch (error) {
              console.log('📍 Error calculando distancia:', error)
            }
          }
        })
        
        // Agregar evento para restaurar eventos cuando se cierre el popup
        marker.on('popupclose', () => {
          console.log('📍 Popup cerrado detectado')
          // Si hay una ruta activa, limpiarla y restaurar todos los eventos
          if (routingControl) {
            console.log('📍 Hay ruta activa, limpiando y restaurando eventos...')
            clearRoutes()
            restoreAllEvents()
          }
        })
        
        // También agregar evento para cuando se haga clic fuera del popup
        marker.on('popupclose', () => {
          console.log('📍 Popup cerrado (segundo evento)')
          setTimeout(() => {
            if (routingControl) {
              console.log('📍 Limpiando ruta después de timeout...')
              clearRoutes()
              restoreAllEvents()
            }
          }, 100)
        })
        
        newMarkers.push(marker)
      }
    })

    setEventMarkers(newMarkers)
  }

  // ========================================
  // FUNCIÓN PARA FILTRAR EVENTOS
  // ========================================
  // Filtra los eventos por tipo y término de búsqueda
  const filterEvents = () => {
    console.log('🔍 filterEvents llamado')
    console.log('🔍 events.length:', events.length)
    console.log('🔍 filterType:', filterType)
    console.log('🔍 searchTerm:', searchTerm)
    
    let filtered = events  // Comenzar con todos los eventos

    // Filtrar por tipo de evento (si no es 'all')
    if (filterType !== 'all') {
      filtered = filtered.filter(event => event.type === filterType)
      console.log('🔍 Después de filtrar por tipo:', filtered.length)
    }

    // Filtrar por término de búsqueda (título, descripción, organizador, tipo)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(term) ||      // Buscar en título
        event.description.toLowerCase().includes(term) || // Buscar en descripción
        event.organizer.toLowerCase().includes(term) ||   // Buscar en organizador
        event.type.toLowerCase().includes(term)           // Buscar en tipo
      )
      console.log('🔍 Después de filtrar por búsqueda:', filtered.length)
    }

    console.log('🔍 Eventos filtrados finales:', filtered.length)
    setFilteredEvents(filtered)  // Actualizar estado con eventos filtrados
    return filtered  // Retornar eventos filtrados
  }

  // ========================================
  // FUNCIÓN PARA MANEJAR BÚSQUEDA
  // ========================================
  // Actualiza el término de búsqueda para filtrar eventos
  const handleSearch = (term: string) => {
    setSearchTerm(term)  // Actualizar estado de búsqueda
  }

  // ========================================
  // FUNCIÓN PARA ACTUALIZAR TEMA DE MODALES
  // ========================================
  // Aplica el tema actual a todos los modales de la aplicación
  const updateModalTheme = () => {
    const modals = document.querySelectorAll('.modal-box')  // Seleccionar todos los modales
    modals.forEach(modal => {
      if (modal instanceof HTMLElement) {  // Verificar que sea un elemento HTML
        modal.setAttribute('data-theme', currentTheme)  // Aplicar tema actual
      }
    })
  }

  // ========================================
  // FUNCIÓN PARA MANEJAR CREACIÓN DE EVENTOS
  // ========================================
  // Crea un nuevo evento y lo publica en el backend
  const handleCreateEvent = async () => {
    if (!userLocation) {  // Verificar que tengamos la ubicación del usuario
      alert('No se puede crear el evento. Ubicación del usuario no disponible.')
      return
    }

    if (!newEvent.title || !newEvent.description || !newEvent.date || !newEvent.time) {  // Validar campos obligatorios
      alert('Por favor completa todos los campos obligatorios.')
      return
    }

    try {
      // Preparar datos para crear publicación en el backend
      const postData = {
        texto: `${newEvent.title}\n\n${newEvent.description}\n\nFecha: ${newEvent.date} a las ${newEvent.time}\nMáximo asistentes: ${newEvent.maxAttendees}`,  // Texto descriptivo del evento
        tipo: newEvent.type,  // Tipo de evento
        fecha_evento: new Date(`${newEvent.date}T${newEvent.time}`).toISOString(),  // Fecha y hora en formato ISO
        privacidad: 'publica',  // Privacidad por defecto
        rutas: [
          {
            latitud: userLocation.lat,  // Latitud de la ubicación del usuario
            longitud: userLocation.lng, // Longitud de la ubicación del usuario
            etiqueta: 'Ubicación del evento',  // Etiqueta descriptiva
            orden: 0  // Orden de la ruta
          }
        ]
      }

      const newPost = await apiService.createPost(postData)  // Crear publicación en el backend
      
      // Recargar datos
      await loadRealData()
      
      // Limpiar formulario
      setNewEvent({
        title: '',
        description: '',
        type: 'Social',
        date: '',
        time: '',
        maxAttendees: 10
      })
      
      // Cerrar modal
      setShowCreateEventModal(false)
      
      // Los eventos se cargarán automáticamente a través del useEffect
      
      console.log('Evento creado:', newPost)  // Log de confirmación
    } catch (error) {
      console.error('Error creando evento:', error)  // Log de error
      alert('Error al crear el evento. Intenta de nuevo.')  // Mensaje al usuario
    }
  }

  // ========================================
  // FUNCIÓN PARA MANEJAR CAMBIOS EN FORMULARIO DE EVENTO
  // ========================================
  // Actualiza un campo específico del formulario de nuevo evento
  const handleNewEventChange = (field: string, value: string | number) => {
    setNewEvent(prev => ({
      ...prev,  // Mantener valores anteriores
      [field]: value  // Actualizar solo el campo específico
    }))
  }

  // ========================================
  // FUNCIONES PARA MANEJAR LA AGENDA
  // ========================================
  // Actualiza un campo específico del formulario de nueva actividad de agenda
  const handleNewAgendaItemChange = (field: string, value: string) => {
    setNewAgendaItem(prev => ({
      ...prev,  // Mantener valores anteriores
      [field]: value  // Actualizar solo el campo específico
    }))
  }

  // ========================================
  // FUNCIÓN PARA CREAR NUEVA ACTIVIDAD DE AGENDA
  // ========================================
  // Crea una nueva actividad en la agenda del usuario
  const handleCreateAgendaItem = async () => {
    if (!newAgendaItem.title || !newAgendaItem.date) {  // Validar campos obligatorios
      alert('El título y la fecha son obligatorios')
      return
    }

    try {
      // Crear actividad en el backend usando la API
      const agendaItem = await apiService.createAgendaItem({
        titulo: newAgendaItem.title,           // Título de la actividad
        descripcion: newAgendaItem.description, // Descripción opcional
        fecha_actividad: newAgendaItem.date     // Fecha de la actividad
      })

      // Actualizar estado local agregando la nueva actividad
      setAgendaItems(prev => [...prev, agendaItem])
      
      // Limpiar formulario para nueva entrada
      setNewAgendaItem({
        title: '',
        description: '',
        date: '',
        location: ''
      })

      alert('Actividad agregada a tu agenda')  // Confirmación al usuario
    } catch (error) {
      console.error('Error creando actividad:', error)  // Log de error
      alert('Error al crear la actividad')  // Mensaje de error al usuario
    }
  }

  // ========================================
  // FUNCIÓN PARA ELIMINAR ACTIVIDAD DE AGENDA
  // ========================================
  // Elimina una actividad específica de la agenda del usuario
  const handleDeleteAgendaItem = async (itemId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta actividad?')) {  // Confirmación del usuario
      try {
        await apiService.deleteAgendaItem(itemId)  // Eliminar del backend
        // Actualizar estado local removiendo la actividad
        setAgendaItems(prev => prev.filter(item => item.id !== itemId))
      } catch (error) {
        console.error('Error eliminando actividad:', error)  // Log de error
        alert('Error al eliminar la actividad')  // Mensaje de error al usuario
      }
    }
  }

  // ========================================
  // FUNCIÓN PARA GUARDAR/QUITAR EVENTO
  // ========================================
  // Alterna el estado de guardado de un evento (guardar o quitar de guardados)
  const handleSaveEvent = async (eventId: string) => {
    try {
      const isCurrentlySaved = savedEvents.some(event => event.id_publicacion === eventId)  // Verificar si ya está guardado
      
      if (isCurrentlySaved) {
        // Remover de guardados si ya está guardado
        await apiService.unsaveEvent(eventId)  // Quitar del backend
        setSavedEvents(prev => prev.filter(event => event.id_publicacion !== eventId))  // Remover del estado local
      } else {
        // Agregar a guardados si no está guardado
        const savedEvent = await apiService.saveEvent(eventId)  // Guardar en el backend
        setSavedEvents(prev => [...prev, savedEvent])  // Agregar al estado local
      }
    } catch (error) {
      console.error('Error guardando/quitando evento:', error)  // Log de error
      alert('Error al guardar/quitar el evento')  // Mensaje de error al usuario
    }
  }

  // ========================================
  // FUNCIÓN PARA MANEJAR LIKES
  // ========================================
  // Alterna el estado de like de una publicación (dar o quitar like)
  const handleLike = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId)  // Buscar la publicación
      if (!post) return  // Si no existe la publicación, salir

      if (post.likers.includes(user?.id || '')) {  // Verificar si el usuario ya dio like
        // Quitar like si ya lo había dado
        await apiService.unlikePost(postId)  // Remover like del backend
        console.log('✅ Like removido')
      } else {
        // Dar like si no lo había dado
        await apiService.likePost(postId)  // Agregar like al backend
        console.log('✅ Like agregado')
      }
      
      // Recargar posts para actualizar la interfaz con los nuevos likes
      await loadRealData()
    } catch (error) {
      console.error('❌ Error manejando like:', error)  // Log de error
    }
  }

  // ========================================
  // ESTADOS PARA SISTEMA DE COMENTARIOS Y NOTIFICACIONES
  // ========================================
  // Estados para manejar comentarios y respuestas
  const [commentTexts, setCommentTexts] = useState<{[key: string]: string}>({})  // Textos de comentarios por post
  const [showComments, setShowComments] = useState<{[key: string]: boolean}>({})  // Mostrar/ocultar comentarios por post
  const [replyToComment, setReplyToComment] = useState<string | null>(null)  // ID del comentario al que se está respondiendo
  
  // Estados para notificaciones del usuario
  const [userNotifications, setUserNotifications] = useState<import('../services/api').Notification[]>([])  // Lista de notificaciones
  const [unreadNotifications, setUnreadNotifications] = useState(0)  // Contador de notificaciones no leídas

  // ========================================
  // FUNCIÓN PARA AGREGAR COMENTARIOS
  // ========================================
  // Agrega un comentario nuevo o una respuesta a un comentario existente
  const handleAddComment = async (postId: string, isReply = false) => {
    let texto: string
    if (isReply && replyToComment) {
      // Obtener texto de respuesta específico
      texto = commentTexts[`${postId}-reply-${replyToComment}`]?.trim()
    } else {
      // Obtener texto de comentario normal
      texto = commentTexts[postId]?.trim()
    }
    
    if (!texto) return  // No hacer nada si no hay texto

    try {
      // Agregar comentario al backend (puede ser respuesta si isReply es true)
      const newComment = await apiService.addComment(postId, texto, isReply && replyToComment ? replyToComment : undefined)
      console.log('✅ Comentario agregado:', newComment)
      
      // Limpiar input y recargar posts
      if (isReply && replyToComment) {
        // Limpiar campo de respuesta específico
        setCommentTexts(prev => ({ ...prev, [`${postId}-reply-${replyToComment}`]: '' }))
      } else {
        // Limpiar campo de comentario normal
        setCommentTexts(prev => ({ ...prev, [postId]: '' }))
      }
      setReplyToComment(null)  // Resetear estado de respuesta
      await loadRealData()  // Recargar datos para mostrar el nuevo comentario
    } catch (error) {
      console.error('❌ Error agregando comentario:', error)  // Log de error
    }
  }

  // ========================================
  // FUNCIONES PARA MANEJAR RESPUESTAS A COMENTARIOS
  // ========================================
  // Establece el comentario al que se va a responder
  const handleReplyToComment = (commentId: string) => {
    setReplyToComment(commentId)  // Guardar ID del comentario padre
  }

  // Cancela la respuesta a un comentario
  const cancelReply = () => {
    setReplyToComment(null)  // Limpiar estado de respuesta
  }

  // ========================================
  // FUNCIÓN PARA RENDERIZAR TEXTO CON MENCIONES
  // ========================================
  // Convierte menciones (@username) en enlaces clickeables
  const renderTextWithMentions = (text: string) => {
    if (!text) return ''  // Retornar vacío si no hay texto
    
    // Buscar menciones en el texto usando regex (@username)
    const mentionRegex = /@(\w+)/g
    const parts = text.split(mentionRegex)  // Dividir texto en partes
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {  // Los índices impares son usernames
        // Es un username (índice impar) - crear enlace clickeable
        return (
          <a
            key={index}
            href={`/perfil/${part}`}  // Enlace al perfil del usuario
            className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
            onClick={(e) => {
              e.preventDefault()  // Prevenir navegación por defecto
              // Aquí puedes navegar al perfil del usuario
              console.log(`Navegar al perfil de @${part}`)
            }}
          >
            @{part}
          </a>
        )
      }
      return part  // Retornar texto normal (no es mención)
    })
  }

  // ========================================
  // FUNCIÓN PARA ELIMINAR COMENTARIOS
  // ========================================
  // Elimina un comentario específico (solo el autor puede eliminarlo)
  const handleDeleteComment = async (commentId: string, authorId: string) => {
    try {
      await apiService.deleteComment(commentId, authorId)  // Eliminar del backend
      console.log('✅ Comentario eliminado')
      await loadRealData()  // Recargar datos para actualizar interfaz
    } catch (error) {
      console.error('❌ Error eliminando comentario:', error)  // Log de error
    }
  }

  // Función para mostrar términos de una publicación
  const handleShowPostTerms = (post: Post) => {
    const terms = {
      geoplanner: DEFAULT_GEOPLANNER_TERMS,
      additional: post.terminos_adicionales || ''
    }
    setSelectedPostTerms(terms)
    setShowPostTermsModal(true)
  }

  // ========================================
  // FUNCIÓN PARA MOSTRAR/OCULTAR COMENTARIOS
  // ========================================
  // Alterna la visibilidad de los comentarios de una publicación
  const toggleComments = (postId: string) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }))  // Toggle del estado
  }

  // ========================================
  // FUNCIÓN PARA CARGAR DATOS GUARDADOS
  // ========================================
  // Carga la agenda y eventos guardados del usuario desde el backend
  const loadSavedData = async () => {
    try {
      if (user) {  // Verificar que el usuario esté autenticado
        // Cargar agenda personal del usuario desde el backend
        const agendaData = await apiService.getAgenda()
        setAgendaItems(agendaData)  // Actualizar estado de agenda

        // Cargar eventos guardados por el usuario desde el backend
        const savedEventsData = await apiService.getSavedEventsWithDetails()
        setSavedEvents(savedEventsData)  // Actualizar estado de eventos guardados
      }
    } catch (error) {
      console.error('Error cargando datos guardados:', error)  // Log de error
    }
  }

  // ========================================
  // FUNCIÓN PARA FILTRAR ELEMENTOS DE AGENDA
  // ========================================
  // Filtra y ordena los elementos de la agenda según búsqueda y filtros de tiempo
  const getFilteredAgendaItems = () => {
    let filtered = agendaItems  // Comenzar con todos los elementos

    // Filtrar por término de búsqueda (título y descripción)
    if (agendaSearchTerm) {
      filtered = filtered.filter(item => 
        item.titulo.toLowerCase().includes(agendaSearchTerm.toLowerCase()) ||  // Buscar en título
        (item.descripcion && item.descripcion.toLowerCase().includes(agendaSearchTerm.toLowerCase()))  // Buscar en descripción
      )
    }

    // Filtrar por tipo de tiempo (futuras, pasadas, hoy)
    const now = new Date()
    switch (agendaFilter) {
      case 'upcoming':  // Actividades futuras
        filtered = filtered.filter(item => new Date(item.fecha_actividad) > now)
        break
      case 'past':  // Actividades pasadas
        filtered = filtered.filter(item => new Date(item.fecha_actividad) < now)
        break
      case 'today':  // Actividades de hoy
        const today = new Date()
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())  // Inicio del día
        const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)  // Fin del día
        filtered = filtered.filter(item => {
          const itemDate = new Date(item.fecha_actividad)
          return itemDate >= todayStart && itemDate < todayEnd  // Dentro del rango de hoy
        })
        break
    }

    // Ordenar por fecha de actividad (más antigua primero)
    return filtered.sort((a, b) => new Date(a.fecha_actividad).getTime() - new Date(b.fecha_actividad).getTime())
  }

  // ========================================
  // SISTEMA DE NOTIFICACIONES DE ACTIVIDADES
  // ========================================
  // Verifica actividades próximas y genera notificaciones automáticas
  const checkUpcomingActivities = () => {
    const now = new Date()  // Fecha y hora actual
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)  // Una hora desde ahora
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())  // Inicio del día actual
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)  // Inicio del día siguiente

    // Filtrar actividades que están próximas (hoy o mañana)
    const upcomingNotifications = agendaItems.filter(item => {
      const itemDate = new Date(item.fecha_actividad)
      return itemDate >= now && itemDate <= tomorrow  // Actividades en las próximas 24 horas
    }).map(item => ({
      id: `notif_${item.id}`,  // ID único para la notificación
      type: 'activity',  // Tipo de notificación
      title: `Actividad próxima: ${item.titulo}`,  // Título descriptivo
      message: `Tu actividad "${item.titulo}" está programada para ${new Date(item.fecha_actividad).toLocaleString()}`,  // Mensaje detallado
      time: new Date(item.fecha_actividad),  // Hora de la actividad
      read: false  // Estado inicial: no leída
    }))

    setNotifications(upcomingNotifications)  // Actualizar estado de notificaciones
  }

  // Exportar agenda
  const exportAgenda = () => {
    const csvContent = [
      ['Título', 'Descripción', 'Fecha', 'Hora'],
      ...agendaItems.map(item => [
        item.titulo,
        item.descripcion || '',
        new Date(item.fecha_actividad).toLocaleDateString(),
        new Date(item.fecha_actividad).toLocaleTimeString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `agenda_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Estadísticas de agenda
  const getAgendaStats = () => {
    const now = new Date()
    const total = agendaItems.length
    const upcoming = agendaItems.filter(item => new Date(item.fecha_actividad) > now).length
    const past = agendaItems.filter(item => new Date(item.fecha_actividad) < now).length
    const today = agendaItems.filter(item => {
      const itemDate = new Date(item.fecha_actividad)
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      return itemDate >= todayStart && itemDate < todayEnd
    }).length

    return { total, upcoming, past, today }
  }

  // Cargar datos reales del backend
  const loadRealData = async () => {
    if (!user) return
    
    setIsLoadingData(true)
    try {
      // Cargar publicaciones
      const postsData = await apiService.getPosts()
      
      // Cargar comentarios para cada publicación
      const postsWithComments = await Promise.all(
        postsData.map(async (post) => {
          try {
            const comments = await apiService.getPostComments(post.id)
            return {
              ...post,
              comentarios: comments
            }
          } catch (error) {
            console.error(`Error cargando comentarios para publicación ${post.id}:`, error)
            return {
              ...post,
              comentarios: []
            }
          }
        })
      )
      
      setPosts(postsWithComments)
      
      // Convertir los posts que son eventos en objetos para el mapa
      const mappedEvents = postsWithComments
        .filter(p => p.fecha_evento && p.rutas && p.rutas.length > 0 && p.privacidad === 'publica') // Solo posts públicos con fecha de evento y rutas
        .map(p => {
          const firstRoute = p.rutas![0] // Usar non-null assertion ya que el filtro garantiza que rutas existe
          
          return {
            id: p.id,
            title: p.texto.split("\n")[0] || "Evento",
            description: p.texto,
            type: p.tipo || 'Social',
            date: new Date(p.fecha_evento).toLocaleDateString(),
            time: new Date(p.fecha_evento).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            organizer: p.nombre_autor || "Desconocido",
            attendees: 0, // Por ahora 0, se puede implementar después
            maxAttendees: 10, // Por ahora 10, se puede implementar después
            lat: firstRoute.latitud,
            lng: firstRoute.longitud,
            saved: false,
            post: p // Guardar referencia a la publicación original
          }
        })

      console.log('📊 Posts cargados:', postsWithComments.length)
      console.log('🎯 Posts con fecha de evento:', postsWithComments.filter(p => p.fecha_evento).length)
      console.log('📍 Posts con rutas:', postsWithComments.filter(p => p.rutas && p.rutas.length > 0).length)
      console.log('🗺️ Eventos mapeados para el mapa:', mappedEvents.length)
      console.log('📋 Eventos mapeados:', mappedEvents)

      setEvents(mappedEvents)
      setFilteredEvents(mappedEvents)
      
      // Cargar agenda
      const agendaData = await apiService.getAgenda()
      
      // Cargar notificaciones
      await loadNotifications()
      
      // Cargar inscripciones del usuario
      try {
        const inscriptionsData = await apiService.getMyInscriptions()
        setMyInscriptions(inscriptionsData)
      } catch (error) {
        console.error('Error cargando inscripciones:', error)
      }
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setIsLoadingData(false)
    }
  }

  // Cargar notificaciones
  const loadNotifications = async () => {
    try {
      const notificationsData = await apiService.getNotifications()
      setUserNotifications(notificationsData)
      
      const unreadCount = await apiService.getUnreadNotificationsCount()
      setUnreadNotifications(unreadCount.unread_count)
    } catch (error) {
      console.error('Error cargando notificaciones:', error)
    }
  }

  // Marcar notificación como leída
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await apiService.markNotificationAsRead(notificationId)
      await loadNotifications() // Recargar notificaciones
    } catch (error) {
      console.error('Error marcando notificación como leída:', error)
    }
  }

  // Cargar eventos iniciales
  const loadEvents = () => {
    // Cargar eventos de ejemplo cuando no hay usuario autenticado
    const sampleEvents = [
      {
        id: '1',
        title: 'Fútbol en el Parque',
        description: 'Partido de fútbol casual en el parque central',
        type: 'Deporte',
        date: '2024-01-15',
        time: '16:00',
        lat: 10.654,
        lng: -71.612,
        organizer: 'Juan Pérez',
        attendees: 8,
        maxAttendees: 20,
        saved: false
      },
      {
        id: '2',
        title: 'Estudio Grupal',
        description: 'Sesión de estudio para el examen de matemáticas',
        type: 'Estudio',
        date: '2024-01-16',
        time: '14:00',
        lat: 10.660,
        lng: -71.610,
        organizer: 'María García',
        attendees: 5,
        maxAttendees: 10,
        saved: true
      }
    ]
    
    setEvents(sampleEvents)
    setFilteredEvents(sampleEvents)
  }

  // Funciones para creación de publicaciones
  const handleCreatePost = async () => {
    if (!newPost.text.trim() || selectedMarkers.length === 0) {
      alert("El texto de la publicación y la ubicación son obligatorios.")
      return
    }

    if (!acceptTerms) {
      alert("Debes aceptar los Términos y Condiciones de GeoPlanner para poder publicar.")
      return
    }

    try {
      let mediaUrl = ''
      
      // Subir imagen a Cloudinary si existe
      if (newPost.mediaFile) {
        const formData = new FormData()
        formData.append('file', newPost.mediaFile)
        formData.append('upload_preset', 'geoplanner_posts') // Preset de Cloudinary
        
        // Subir a Cloudinary (reemplaza 'your-cloud-name' con tu nombre de cloud)
        const cloudinaryResponse = await fetch('https://api.cloudinary.com/v1_1/your-cloud-name/image/upload', {
          method: 'POST',
          body: formData
        })
        
        if (cloudinaryResponse.ok) {
          const cloudinaryData = await cloudinaryResponse.json()
          mediaUrl = cloudinaryData.secure_url
          console.log('✅ Imagen subida a Cloudinary:', mediaUrl)
        } else {
          console.error('❌ Error subiendo imagen a Cloudinary')
        }
      }

      const postData = {
        texto: newPost.text,
        tipo: newPost.type,
        fecha_evento: newPost.eventDate,
        privacidad: newPost.privacy,
        media_url: mediaUrl,
        rutas: selectedMarkers.map((marker: any, i: number) => ({
          latitud: marker.getLatLng().lat,
          longitud: marker.getLatLng().lng,
          etiqueta: `Punto ${i + 1}`,
          orden: i
        })),
        terminos_adicionales: additionalTerms
      }

      await apiService.createPost(postData)
      
      // Limpiar formulario
      setNewPost({
        text: '',
        type: 'Social',
        eventDate: '',
        privacy: 'publica',
        mediaFile: null
      })
      setSelectedMarkers([])
      setLocationDisplay('No se ha seleccionado ninguna ubicación.')
      setAcceptTerms(false)
      setAdditionalTerms('')
      setShowCreatePostModal(false)
      
      // Recargar datos
      await loadRealData()
      
    } catch (error) {
      console.error('Error creando publicación:', error)
      alert('Error al crear la publicación')
    }
  }

  const handleNewPostChange = (field: string, value: string | File | null) => {
    setNewPost(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleLocationSelection = () => {
    if (selectedMarkers.length > 0) {
      const latlngs = selectedMarkers.map((marker: any) => marker.getLatLng())
      setLocationDisplay(routeType === 'simple' 
        ? `Ubicación: [${latlngs[0].lat.toFixed(4)}, ${latlngs[0].lng.toFixed(4)}]`
        : `Ruta Múltiple (${selectedMarkers.length} puntos)`
      )
      setShowLocationModal(false)
    } else {
      alert("Por favor, selecciona al menos un punto.")
    }
  }

  const clearSelectedMarkers = () => {
    selectedMarkers.forEach((marker: any) => {
      if (marker && marker.remove) marker.remove()
    })
    setSelectedMarkers([])
  }

  // Función para manejar zoom de mapas en publicaciones
  const handleMapZoom = (postId: string, direction: 'in' | 'out') => {
    // Buscar el mapa específico de la publicación
    const mapElement = document.getElementById(`map-${postId}`)
    if (mapElement && (mapElement as any)._leaflet_map) {
      // Si el mapa está inicializado, usar la API de Leaflet
      const map = (mapElement as any)._leaflet_map
      if (map) {
        if (direction === 'in') {
          map.zoomIn()
        } else {
          map.zoomOut()
        }
      }
    }
  }

  // Funciones para renderizar publicaciones en el feed
  const renderPost = (post: Post) => {
    const privacyBadgeMap = {
      publica: '🔓 Pública',
      amigos: '👥 Amigos',
      privada: '🔒 Privada'
    }
    const privacyBadge = privacyBadgeMap[post.privacidad as keyof typeof privacyBadgeMap] || '🔓 Pública'
    
    const isLiked = post.likers?.includes(user?.id || '') || false
    const isSaved = savedEvents.some(saved => saved.id_publicacion === post.id)
    const isOwner = post.id_autor === user?.id
    
    const verifiedIcon = (
      <svg className="geoplanner-verified-icon w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm5.71,7.29-6,6a1,1,0,0,1-1.42,0l-3-3a1,1,0,0,1,1.42-1.42L11,13.59l5.29-5.3a1,1,0,0,1,1.42,1.42Z"/>
      </svg>
    )
    
    const saveStarIcon = (
      <svg 
        className={`save-star-icon w-6 h-6 cursor-pointer ${isSaved ? 'text-yellow-500' : 'text-gray-400'}`} 
        data-post-id={post.id}
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor"
        onClick={() => handleSaveEvent(post.id)}
      >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
      </svg>
    )

    const now = new Date()
    const eventDate = new Date(post.fecha_evento)
    let actionButtons = []
    
    if (isOwner) {
      if (eventDate > now) {
        actionButtons.push(
          <button key="inscritos" className="btn btn-sm btn-warning">Ver Inscritos</button>
        )
      } else {
        actionButtons.push(
          <button 
            key="scanner" 
            className="btn btn-sm btn-success"
                            // onClick={() => handleShowQRScanner(post.id, post.texto)}
          >
            📱 Escanear QR
          </button>
        )
        actionButtons.push(
          <button 
            key="historial" 
            className="btn btn-sm btn-info"
                            onClick={() => handleShowAttendanceHistory(post.id, post.texto)}
          >
            📊 Historial
          </button>
        )
      }
    } else {
      // Verificar si el usuario está inscrito en este evento
      const isInscribed = isUserInscribed(post.id)
      
      if (isInscribed) {
        // Si está inscrito, mostrar botón de desinscribirse
        actionButtons.push(
          <button 
            key="desinscribirse" 
            className="btn btn-sm btn-error"
            onClick={() => handleDesinscribirse(post.id)}
          >
            ❌ Cancelar Inscripción
          </button>
        )
        
        // Mostrar botón de QR si está inscrito (para cualquier tipo de evento)
        actionButtons.push(
          <button 
            key="qr" 
            className="btn btn-sm btn-primary"
            onClick={() => handleShowQRCodeDisplay(post.id, post.texto)}
          >
            📱 Ver Invitación QR
          </button>
        )
      } else {
        // Si no está inscrito, mostrar botón de inscribirse
        actionButtons.push(
          <button 
            key="inscribirse" 
            className="btn btn-sm btn-primary"
            onClick={() => handleInscribirse(post.id)}
          >
            ✅ Inscribirse
          </button>
        )
        
        // Mostrar botón de QR deshabilitado si no está inscrito
        actionButtons.push(
          <button 
            key="qr-disabled" 
            className="btn btn-sm btn-disabled"
            disabled
            title="Debes inscribirte primero para ver tu QR"
          >
            📱 Ver Invitación QR
          </button>
        )
      }
    }

    return (
      <div key={post.id} className="post-card post card shadow-sm mb-4 event-card" style={{
        backgroundColor: 'var(--card-bg)',
        color: 'var(--card-text-color)'
      }}>
        <div className="card-body">
          {/* Header de la publicación */}
          <div className="post-header flex items-center gap-2 mb-3">
            {/* Foto de perfil del autor */}
            <div className="flex-shrink-0">
              <img 
                src={post.foto_autor || '/src/assets/img/placeholder.png'} 
                alt={`Foto de ${post.nombre_autor}`}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/src/assets/img/placeholder.png'
                }}
              />
            </div>
            <div className="flex-1">
              <button 
                className="font-semibold hover:text-blue-600 transition-colors cursor-pointer"
                onClick={() => navigate(`/usuario/${post.id_autor}`)}
              >
                {post.nombre_autor}
              </button>
              <button 
                className="text-sm text-gray-500 hover:text-blue-600 transition-colors cursor-pointer block"
                onClick={() => navigate(`/usuario/${post.id_autor}`)}
              >
                @{post.username_autor}
              </button>
            </div>
            {post.verificado && verifiedIcon}
            <span className="badge badge-secondary">{privacyBadge}</span>
            <div className="ml-auto">{saveStarIcon}</div>
          </div>
          
          {/* Texto de la publicación */}
          <p className="mb-3">{post.texto}</p>
          
          {/* Imagen si existe */}
          {post.media_url && (
            <img 
              src={post.media_url} 
              alt="Media" 
              className="img-fluid rounded mb-3 w-full h-48 object-cover"
              onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
            />
          )}
          
          {/* Mapa de la publicación */}
          <div className="map-container mb-3 h-96 w-250 mx-auto relative" id={`map-${post.id}`}>
            {/* Aquí se renderizará el mapa */}
            {/* Botones de zoom */}
            <div className="absolute top-4 right-4 z-[9999] flex flex-col gap-2">
              <button 
                className="btn btn-sm btn-circle bg-white shadow-xl hover:bg-gray-100 border-2 border-gray-400"
                onClick={() => handleMapZoom(post.id, 'in')}
                title="Zoom In"
              >
                <i className="fas fa-plus text-gray-800 font-bold"></i>
              </button>
              <button 
                className="btn btn-sm btn-circle bg-white shadow-xl hover:bg-gray-100 border-2 border-gray-400"
                onClick={() => handleMapZoom(post.id, 'out')}
                title="Zoom Out"
              >
                <i className="fas fa-minus text-gray-800 font-bold"></i>
              </button>
            </div>
          </div>
          
          {/* Lista de rutas si hay múltiples */}
          {post.rutas && post.rutas.length > 1 && (
            <ol className="list-group list-group-flush list-group-numbered mb-3 text-sm">
              {post.rutas.map((ruta: any, index: number) => (
                <li key={index} className="list-group-item">{ruta.etiqueta}</li>
              ))}
            </ol>
          )}
          
          {/* Botones de acción */}
          <div className="flex gap-2 mt-3 flex-wrap">
            <button 
              className="btn btn-sm btn-outline-danger"
              onClick={() => handleLike(post.id)}
            >
              {isLiked ? '💔 Quitar Like' : '❤️ Like'} ({post.likes})
            </button>
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={() => toggleComments(post.id)}
            >
              💬 Comentarios ({post.comentarios?.length || 0})
            </button>
            <button 
              className="btn btn-sm btn-outline-info"
              onClick={() => handleShowPostTerms(post)}
            >
              📜 Ver Términos
            </button>
            {actionButtons.map((button, index) => (
            <React.Fragment key={index}>
              {button}
            </React.Fragment>
          ))}
          </div>

          {/* Sección de comentarios */}
          {showComments[post.id] && (
            <div className="comentarios mt-3 p-3 rounded comment-section">
              <div className="comentarios-list mb-3">
                {post.comentarios && post.comentarios.length > 0 ? (
                  post.comentarios.map((comentario) => (
                    <div key={comentario.id} className="mb-3">
                      {/* Comentario principal */}
                      <div className="comment-box flex items-start gap-2 p-2 rounded">
                        {/* Foto de perfil del autor del comentario */}
                        <div className="flex-shrink-0">
                          <img 
                            src={comentario.foto_autor || '/src/assets/img/placeholder.png'} 
                            alt={`Foto de ${comentario.nombre_autor}`}
                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = '/src/assets/img/placeholder.png'
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <strong className="text-sm">{comentario.nombre_autor}</strong>
                            <span className="text-xs text-gray-500">@{comentario.username_autor}</span>
                            <span className="text-xs text-gray-400">
                              {new Date(comentario.fecha_creacion).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm mt-1">
                            {renderTextWithMentions(comentario.texto)}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <button 
                              className="btn btn-xs btn-outline"
                              onClick={() => handleReplyToComment(comentario.id)}
                            >
                              💬 Responder
                            </button>
                            {comentario.id_autor === user?.id && (
                              <button 
                                className="btn btn-xs btn-error"
                                onClick={() => handleDeleteComment(comentario.id, comentario.id_autor)}
                              >
                                🗑️ Eliminar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Respuestas al comentario */}
                      {comentario.respuestas && comentario.respuestas.length > 0 && (
                        <div className="ml-6 mt-2 space-y-2">
                          {comentario.respuestas.map((respuesta) => (
                            <div key={respuesta.id} className="comment-box flex items-start gap-2 p-2 rounded">
                              {/* Foto de perfil del autor de la respuesta */}
                              <div className="flex-shrink-0">
                                <img 
                                  src={respuesta.foto_autor || '/src/assets/img/placeholder.png'} 
                                  alt={`Foto de ${respuesta.nombre_autor}`}
                                  className="w-6 h-6 rounded-full object-cover border border-gray-200"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = '/src/assets/img/placeholder.png'
                                  }}
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <strong className="text-sm">{respuesta.nombre_autor}</strong>
                                  <span className="text-xs text-gray-500">@{respuesta.username_autor}</span>
                                  <span className="text-xs text-gray-400">
                                    {new Date(respuesta.fecha_creacion).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm mt-1">
                                  {renderTextWithMentions(respuesta.texto)}
                                </p>
                                {respuesta.id_autor === user?.id && (
                                  <button 
                                    className="btn btn-xs btn-error mt-1"
                                    onClick={() => handleDeleteComment(respuesta.id, respuesta.id_autor)}
                                  >
                                    🗑️
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Input para responder */}
                      {replyToComment === comentario.id && (
                        <div className="ml-6 mt-2 p-2 rounded reply-section">
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              className="create-post-input input-sm flex-1"
                              placeholder={`Responder a @${comentario.username_autor}...`}
                              value={commentTexts[`${post.id}-reply-${comentario.id}`] || ''}
                              onChange={(e) => setCommentTexts(prev => ({ ...prev, [`${post.id}-reply-${comentario.id}`]: e.target.value }))}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id, true)}
                            />
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => handleAddComment(post.id, true)}
                            >
                              Enviar
                            </button>
                            <button 
                              className="btn btn-sm btn-outline"
                              onClick={cancelReply}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No hay comentarios aún.</p>
                )}
              </div>
              
              {/* Input para nuevo comentario */}
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="create-post-input input-sm flex-1"
                  placeholder="Escribe un comentario... (usa @username para mencionar)"
                  value={commentTexts[post.id] || ''}
                  onChange={(e) => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                />
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => handleAddComment(post.id)}
                >
                  Enviar
                </button>
              </div>
            </div>
          )}
          
          {/* Botón de eliminar para el propietario */}
          {isOwner && (
            <button className="btn btn-sm btn-danger w-full mt-3">
              🗑️ Eliminar Publicación
            </button>
          )}
        </div>
      </div>
    )
  }

  // Función para renderizar el mapa de cada publicación
  const renderPostMap = (postId: string, rutas: any[]) => {
    const initPostMap = async () => {
      try {
        const L = await import('leaflet')
        
        setTimeout(() => {
          const mapElement = document.getElementById(`map-${postId}`)
          if (mapElement && !mapElement.classList.contains('leaflet-container')) {
            const latlngs = rutas.map((ruta: any) => [ruta.latitud, ruta.longitud] as [number, number])
            const postMap = L.map(mapElement, {
              zoomControl: false,
              scrollWheelZoom: false,
              dragging: false,
              touchZoom: false,
              doubleClickZoom: false,
              boxZoom: false,
              keyboard: false
            }).setView(latlngs[0] as [number, number], 13)

            // Guardar referencia al mapa para poder controlar el zoom
            ;(mapElement as any)._leaflet_map = postMap

            const style = mapStyles[currentMapStyle as keyof typeof mapStyles]
            L.tileLayer(style.url, {
              attribution: style.attribution
            }).addTo(postMap)

            // Agregar marcadores
            latlngs.forEach(latlng => {
              const eventIcon = L.divIcon({
                html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28"><path fill="#dc3545" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`,
                className: 'public-event-marker',
                iconSize: [28, 28],
                iconAnchor: [14, 28],
                popupAnchor: [0, -28],
              })
              L.marker(latlng as [number, number], { icon: eventIcon }).addTo(postMap)
            })

            // Agregar ubicación del usuario si está disponible
            if (userLocation) {
              const userIcon = createUserLocationIcon(13)
              L.marker([userLocation.lat, userLocation.lng], {
                icon: userIcon
              }).addTo(postMap).bindPopup('Tu ubicación')
            }

            // Crear ruta si hay múltiples puntos
            if (latlngs.length > 1) {
              // Usar leaflet-routing-machine para rutas que sigan las calles
              import('leaflet-routing-machine').then((Lrm) => {
                const waypoints = latlngs.map(latlng => L.latLng((latlng as [number, number])[0], (latlng as [number, number])[1]))
                ;(Lrm.default as any).control({
                  waypoints: waypoints,
                  createMarker: function() { return null; },
                  routeWhileDragging: false,
                  show: false,
                  addWaypoints: false,
                  lineOptions: {
                    styles: [{color: '#007BFF', opacity: 0.8, weight: 5}]
                  },
                  router: (Lrm.default as any).osrm({
                    serviceUrl: 'https://router.project-osrm.org/route/v1'
                  })
                }).addTo(postMap)
                
                postMap.fitBounds(L.latLngBounds(waypoints), {
                  padding: [20, 20]
                })
              })
            } else {
              postMap.setView(latlngs[0] as [number, number], 15)
            }
          }
        }, 100)
      } catch (error) {
        console.error('Error renderizando mapa de publicación:', error)
      }
    }
    
    initPostMap()
  }

  // Funciones para sistema de QR y asistencia - Temporalmente deshabilitadas
  // const handleShowQRScanner = (eventId: string, eventTitle: string) => {
  //   setSelectedEventForQR({ id: eventId, title: eventTitle })
  //   setShowQRScanner(true)
  // }

  const handleShowQRCodeDisplay = (eventId: string, eventTitle: string) => {
    setSelectedEventForQR({ id: eventId, title: eventTitle })
    setShowQRCodeDisplay(true)
  }

  const handleShowAttendanceHistory = (eventId: string, eventTitle: string) => {
    setSelectedEventForHistory({ id: eventId, title: eventTitle })
    setShowAttendanceHistory(true)
  }

  // const handleQRVerificationComplete = (result: QRVerificationResponse) => {
  //   setLastVerificationResult(result)
  //   // Mostrar notificación de éxito
  //   if (result.success) {
  //     // Aquí podrías mostrar una notificación toast
  //     console.log('✅ Verificación exitosa:', result.message)
  //   }
  // }

  // const handleCloseQRScanner = () => {
  //   setShowQRScanner(false)
  //   setSelectedEventForQR(null)
  // }

  const handleCloseQRCodeDisplay = () => {
    setShowQRCodeDisplay(false)
    setSelectedEventForQR(null)
  }

  const handleCloseAttendanceHistory = () => {
    setShowAttendanceHistory(false)
    setSelectedEventForHistory(null)
  }

  // Funciones para notificaciones de amistad
  const handleShowFriendshipNotification = (notification: any) => {
    setSelectedFriendshipNotification(notification)
    setShowFriendshipNotification(true)
  }

  const handleCloseFriendshipNotification = () => {
    setShowFriendshipNotification(false)
    setSelectedFriendshipNotification(null)
  }

  const handleFriendshipNotificationUpdate = () => {
    // Recargar notificaciones
    loadNotifications()
  }

  // Funciones para inscripción en eventos
  const handleInscribirse = async (postId: string) => {
    try {
      await apiService.inscribirseEvento(postId)
      // Recargar las publicaciones para mostrar el estado actualizado
      loadRealData()
      // Mostrar notificación de éxito
      showError('¡Éxito!', 'Inscripción realizada correctamente', 'success')
    } catch (error) {
      console.error('Error al inscribirse:', error)
      showError('Error de Inscripción', 'No se pudo completar la inscripción. Intenta nuevamente.')
    }
  }

  const handleDesinscribirse = async (postId: string) => {
    try {
      await apiService.desinscribirseEvento(postId)
      // Recargar las publicaciones para mostrar el estado actualizado
      loadRealData()
      // Mostrar notificación de éxito
      showError('¡Éxito!', 'Inscripción cancelada correctamente', 'success')
    } catch (error) {
      console.error('Error al desinscribirse:', error)
      showError('Error de Cancelación', 'No se pudo cancelar la inscripción. Intenta nuevamente.')
    }
  }

  // Función para cargar las inscripciones del usuario
  const loadMyInscriptions = async () => {
    try {
      const inscriptions = await apiService.getMyInscriptions()
      setMyInscriptions(inscriptions)
    } catch (error) {
      console.error('Error cargando inscripciones:', error)
    }
  }

  // Función para mostrar el modal de mis inscripciones
  const handleShowMyInscriptions = () => {
    loadMyInscriptions()
    setShowMyInscriptionsModal(true)
  }

  // Función para verificar si el usuario está inscrito en un evento
  const isUserInscribed = (postId: string): boolean => {
    return myInscriptions.some(inscription => inscription.id_publicacion === postId)
  }

  // Función para mostrar errores con el modal personalizado
  const showError = (title: string, message: string, type: 'error' | 'warning' | 'info' | 'success' = 'error') => {
    setErrorModal({
      isOpen: true,
      title,
      message,
      type
    })
  }

  // Función para verificar el estado de geolocalización
  const checkGeolocationStatus = () => {
    console.log('📍 Verificando estado de geolocalización...')
    
    if (!navigator.geolocation) {
      showError('Geolocalización No Soportada', 'Tu navegador no soporta geolocalización. Actualiza tu navegador o usa uno más moderno.', 'error')
      return false
    }
    
    // Verificar permisos si el navegador lo soporta
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        console.log('📍 Estado de permisos de geolocalización:', result.state)
        
        if (result.state === 'denied') {
          showError('Permisos Denegados', 'Has denegado el acceso a tu ubicación. Ve a Configuración > Privacidad y Seguridad > Ubicación y permite el acceso para este sitio.', 'warning')
        } else if (result.state === 'prompt') {
          showError('Permisos Pendientes', 'Necesitas permitir el acceso a tu ubicación para usar esta función. Haz clic en "Permitir" cuando tu navegador lo solicite.', 'info')
        }
      })
    }
    
    return true
  }

  // Función para mostrar información de debug de ubicación
  const showLocationDebugInfo = () => {
    const savedLocation = localStorage.getItem('geoplanner_user_location')
    const currentLocation = userLocation
    
    console.log('📍 === DEBUG INFO DE UBICACIÓN ===')
    console.log('📍 Ubicación en localStorage:', savedLocation ? JSON.parse(savedLocation) : 'No hay')
    console.log('📍 Ubicación en estado (userLocation):', currentLocation)
    console.log('📍 Navegador soporta geolocalización:', !!navigator.geolocation)
    
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        console.log('📍 Estado de permisos:', result.state)
      })
    }
    
    console.log('📍 ================================')
  }

  // Función para cerrar el modal de errores
  const closeErrorModal = () => {
    setErrorModal(prev => ({ ...prev, isOpen: false }))
  }

  // Función para mezclar color con blanco (para dropdowns)
  const mixWithWhite = (color: string, ratio: number = 0.8): string => {
    // Convertir color hex a RGB
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    
    // Mezclar con blanco
    const mixedR = Math.round(r * (1 - ratio) + 255 * ratio)
    const mixedG = Math.round(g * (1 - ratio) + 255 * ratio)
    const mixedB = Math.round(b * (1 - ratio) + 255 * ratio)
    
    return `rgb(${mixedR}, ${mixedG}, ${mixedB})`
  }

  // Función para extraer color principal del gradiente
  const extractMainColor = (gradient: string): string => {
    // Extraer el primer color del gradiente
    const match = gradient.match(/#[0-9A-Fa-f]{6}/)
    return match ? match[0] : '#007BFF'
  }

  // Aplicar tema - Copiado del dashboard original
  const applyTheme = (themeName: string) => {
    const theme = temas[themeName as keyof typeof temas] || temas.default
    console.log('Aplicando tema:', themeName, theme)

    // Aplicar variables CSS al documento
    const root = document.documentElement
    root.style.setProperty('--body-bg', theme.bodyBG)
    root.style.setProperty('--card-bg', theme.cardBG)
    root.style.setProperty('--card-text-color', theme.cardText)
    root.style.setProperty('--card-border', themeName === 'noche' ? '#374151' : '#e5e7eb')
    root.style.setProperty('--btn-primary-bg', theme.btnPrimaryBG)
    root.style.setProperty('--btn-primary-hover', themeName === 'noche' ? '#1e40af' : '#0056b3')

    // Usar setTimeout para asegurar que el DOM esté listo
    setTimeout(() => {
      // Aplicar estilos directamente a los elementos del DOM
      const header = document.querySelector('header')
      const body = document.body
      const sidebar = document.querySelector('.sidebar')
      const cards = document.querySelectorAll('.card, .event-card')
      const buttons = document.querySelectorAll('.btn-primary')
      const mainContainer = document.querySelector('.main-container')
      const contentArea = document.querySelector('.content-area')

      if (header && header instanceof HTMLElement) {
        header.style.background = theme.headerBG
        header.style.color = theme.headerText
        
        // Aplicar animación aurora solo para el tema aurora
        if (themeName === 'aurora') {
          header.classList.add('aurora-animation')
          // header.classList.remove('night-header')
        } else if (themeName === 'noche') {
          // header.classList.add('night-header')
          header.classList.remove('aurora-animation')
        } else {
          header.classList.remove('aurora-animation')
          // header.classList.remove('night-header')
        }
      }

      // Aplicar background según el tema
      if (themeName === 'noche') {
        // Para tema noche, usar el color del tema
        // Aplicar al contenedor principal (el div con bg-white)
        const mainContentDiv = document.querySelector('.flex.bg-white')
        if (mainContentDiv && mainContentDiv instanceof HTMLElement) {
          mainContentDiv.style.background = theme.bodyBG
        }
        if (contentArea && contentArea instanceof HTMLElement) {
          contentArea.style.background = theme.bodyBG
        }
        
        // Aplicar color específico al título GeoPlanner según el tema
        const geoPlannerTitle = document.querySelector('header strong')
        if (geoPlannerTitle && geoPlannerTitle instanceof HTMLElement) {
          geoPlannerTitle.style.color = '#f5f5dc' // Blanco hueso para tema noche
          geoPlannerTitle.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)' // Sombra para acentuar
        }
        
        // Aplicar color blanco hueso SOLO a los eventos del feed clásico
        const eventCards = document.querySelectorAll('.event-card')
        eventCards.forEach(card => {
          if (card instanceof HTMLElement) {
            const eventTexts = card.querySelectorAll('h4, p, span, div')
            eventTexts.forEach(text => {
              if (text instanceof HTMLElement && 
                  !text.closest('button') && 
                  !text.closest('.badge')) {
                text.style.color = '#f5f5dc' // Blanco hueso para tema noche
              }
            })
          }
        })

        // Aplicar tema al contenedor de publicaciones (feed clásico)
        const feedContainer = document.querySelector('.p-4.rounded-2xl.bg-gray-50.m-4.shadow-lg')
        if (feedContainer && feedContainer instanceof HTMLElement) {
          feedContainer.style.background = theme.cardBG
        }


      } else {
        // Para otros temas, mantener fondo blanco
        // Restaurar el contenedor principal a fondo blanco
        const mainContentDiv = document.querySelector('.flex.bg-white')
        if (mainContentDiv && mainContentDiv instanceof HTMLElement) {
          mainContentDiv.style.background = '#ffffff'
        }
        if (contentArea && contentArea instanceof HTMLElement) {
          contentArea.style.background = '#ffffff'
        }
        
        // Aplicar color específico al título GeoPlanner según el tema
        const geoPlannerTitle = document.querySelector('header strong')
        if (geoPlannerTitle && geoPlannerTitle instanceof HTMLElement) {
          // Colores específicos para cada tema
          switch (themeName) {
            case 'default':
              geoPlannerTitle.style.color = '#1e40af' // Azul oscuro
              geoPlannerTitle.style.textShadow = '1px 1px 2px rgba(30, 64, 175, 0.3)'
              break
            case 'aurora':
              geoPlannerTitle.style.color = '#1d2b64' // Azul aurora
              geoPlannerTitle.style.textShadow = '1px 1px 2px rgba(29, 43, 100, 0.3)'
              break
            case 'oceano':
              geoPlannerTitle.style.color = '#2C3E50' // Azul oceano
              geoPlannerTitle.style.textShadow = '1px 1px 2px rgba(44, 62, 80, 0.3)'
              break
            case 'amanecer':
              geoPlannerTitle.style.color = '#FF512F' // Naranja amanecer
              geoPlannerTitle.style.textShadow = '1px 1px 2px rgba(255, 81, 47, 0.3)'
              break
            case 'pastel':
              geoPlannerTitle.style.color = '#003366' // Azul pastel
              geoPlannerTitle.style.textShadow = '1px 1px 2px rgba(0, 51, 102, 0.3)'
              break
            case 'fuego':
              geoPlannerTitle.style.color = '#CB356B' // Rosa fuego
              geoPlannerTitle.style.textShadow = '1px 1px 2px rgba(203, 53, 107, 0.3)'
              break
            case 'bosque':
              geoPlannerTitle.style.color = '#11998E' // Verde bosque
              geoPlannerTitle.style.textShadow = '1px 1px 2px rgba(17, 153, 142, 0.3)'
              break
            case 'lluvia':
              geoPlannerTitle.style.color = '#396afc' // Azul lluvia
              geoPlannerTitle.style.textShadow = '1px 1px 2px rgba(57, 106, 252, 0.3)'
              break
            default:
              geoPlannerTitle.style.color = '#1e40af' // Azul por defecto
              geoPlannerTitle.style.textShadow = '1px 1px 2px rgba(30, 64, 175, 0.3)'
          }
        }
        
        // Restaurar colores SOLO de los eventos del feed clásico
        const eventCards = document.querySelectorAll('.event-card')
        eventCards.forEach(card => {
          if (card instanceof HTMLElement) {
            const eventTexts = card.querySelectorAll('h4, p, span, div')
            eventTexts.forEach(text => {
              if (text instanceof HTMLElement && 
                  !text.closest('button') && 
                  !text.closest('.badge')) {
                text.style.color = '' // Restaurar color por defecto
              }
            })
          }
        })

        // Restaurar contenedor de publicaciones para otros temas
        const feedContainer = document.querySelector('.p-4.rounded-2xl.bg-gray-50.m-4.shadow-lg')
        if (feedContainer && feedContainer instanceof HTMLElement) {
          feedContainer.style.background = '#f9fafb' // bg-gray-50
        }


      }

      if (sidebar && sidebar instanceof HTMLElement) {
        sidebar.style.background = theme.sidebarBG
        sidebar.style.color = theme.sidebarText
      }

      // Aplicar estilos al sidebar de filtros
      const filterSidebar = document.querySelector('.filter-sidebar')
      if (filterSidebar && filterSidebar instanceof HTMLElement) {
        filterSidebar.style.background = theme.sidebarBG
        filterSidebar.style.color = theme.sidebarText
      }



      cards.forEach(card => {
        if (card instanceof HTMLElement) {
          card.style.background = theme.cardBG
          card.style.color = theme.cardText
          
          // Aplicar colores de texto específicos para tema noche
          if (themeName === 'noche') {
            const cardTexts = card.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div')
            cardTexts.forEach(text => {
              if (text instanceof HTMLElement && !text.closest('.dropdown-content')) {
                text.style.color = '#f5f5dc' // Blanco hueso para tema noche
              }
            })
          }
        }
      })

      buttons.forEach(button => {
        if (button instanceof HTMLElement) {
          button.style.background = theme.btnPrimaryBG
        }
      })

      // Configurar colores de dropdown
      const mainColor = extractMainColor(theme.headerBG)
      const dropdownBg = mixWithWhite(mainColor, 0.9) // 90% blanco, 10% color del tema
      const dropdownBorder = mainColor
      
      // Configurar colores de texto según el tema
      const dropdownTextColor = '#000000' // Siempre negro para dropdowns (tienen fondo claro)
      const dropdownTextColorSecondary = '#333333' // Siempre gris oscuro para texto secundario

      // Aplicar estilos a todos los dropdowns
      const dropdowns = document.querySelectorAll('.dropdown-content')
      dropdowns.forEach(dropdown => {
        if (dropdown instanceof HTMLElement) {
          dropdown.style.background = dropdownBg
          dropdown.style.border = `1px solid ${dropdownBorder}`
          dropdown.style.boxShadow = `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
          dropdown.style.color = dropdownTextColor
          
          // Aplicar colores a los elementos internos del dropdown
          const dropdownItems = dropdown.querySelectorAll('li a, li span, .menu-title span')
          dropdownItems.forEach(item => {
            if (item instanceof HTMLElement) {
              item.style.color = dropdownTextColor
            }
          })
          
          // Aplicar colores específicos a los textos secundarios (small)
          const secondaryTexts = dropdown.querySelectorAll('small')
          secondaryTexts.forEach(text => {
            if (text instanceof HTMLElement) {
              text.style.color = dropdownTextColorSecondary
            }
          })
        }
      })

      // Aplicar estilos a las sugerencias de direcciones
      const addressSuggestions = document.querySelectorAll('.dropdown-content-container')
      addressSuggestions.forEach(container => {
        if (container instanceof HTMLElement) {
          container.style.background = dropdownBg
          container.style.border = `1px solid ${dropdownBorder}`
          container.style.boxShadow = `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
          container.style.color = dropdownTextColor
          
          // Aplicar colores a los botones de sugerencias
          const suggestionButtons = container.querySelectorAll('button')
          suggestionButtons.forEach(button => {
            if (button instanceof HTMLElement) {
              button.style.color = dropdownTextColor
              button.style.background = 'transparent'
              button.style.border = 'none'
              button.style.textAlign = 'left'
              button.style.width = '100%'
              button.style.padding = '8px 12px'
              button.style.cursor = 'pointer'
              
              // Hover effect
              button.addEventListener('mouseenter', () => {
                button.style.background = themeName === 'noche' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
              })
              button.addEventListener('mouseleave', () => {
                button.style.background = 'transparent'
              })
            }
          })
        }
      })
    }, 100)

    setCurrentTheme(themeName)
    
    // Actualizar en el backend para todos los usuarios registrados
    try {
      apiService.updateCurrentUserProfile({ tema_preferido: themeName })
        .then(response => {
          console.log('✅ Tema actualizado en el backend:', response.mensaje)
        })
        .catch(error => {
          console.error('❌ Error actualizando tema en el backend:', error)
        })
    } catch (error) {
      console.error('❌ Error al actualizar tema:', error)
    }
  }

  // Cambiar estilo de mapa
  const changeMapStyle = async (styleName: string) => {
    if (!mapStyles[styleName as keyof typeof mapStyles]) return
    
    setCurrentMapStyle(styleName)
    localStorage.setItem('geoplanner_map_style', styleName)

    // Actualizar mapa si está cargado
    if (mapInstanceRef.current && L) {
      try {
        // Remover capas existentes
        mapInstanceRef.current.eachLayer((layer: any) => {
          if (layer instanceof L.TileLayer) {
            mapInstanceRef.current.removeLayer(layer)
          }
        })

        // Agregar nueva capa
        const style = mapStyles[styleName as keyof typeof mapStyles]
        L.tileLayer(style.url, {
          attribution: style.attribution
        }).addTo(mapInstanceRef.current)

        console.log(`Estilo de mapa cambiado a: ${styleName}`)
      } catch (error) {
        console.error('Error cambiando estilo de mapa:', error)
      }
    }
  }

  // Toggle de vista
  const toggleView = () => {
    setCurrentView(prevView => prevView === 'map' ? 'classic' : 'map')
  }

  // Inicializar datos
  const initData = async () => {
    const savedMapStyle = localStorage.getItem('geoplanner_map_style')
    
    // Cargar tema desde el backend para todos los usuarios registrados
    try {
      const userData = await apiService.getCurrentUser()
      if (userData && userData.tema_preferido) {
        console.log('🎨 Cargando tema desde el backend:', userData.tema_preferido)
        applyTheme(userData.tema_preferido)
        
        // Actualizar data-theme del document.documentElement según el tema del backend
        if (userData.tema_preferido === 'noche') {
          document.documentElement.setAttribute('data-theme', 'dracula')
        } else {
          document.documentElement.setAttribute('data-theme', 'light')
        }
      } else {
        console.log('🎨 Aplicando tema por defecto')
        applyTheme('default')
        document.documentElement.setAttribute('data-theme', 'light')
      }
    } catch (error) {
      console.log('❌ Error cargando tema del backend, aplicando tema por defecto:', error)
      console.log('🎨 Aplicando tema por defecto')
      applyTheme('default')
      document.documentElement.setAttribute('data-theme', 'light')
    } finally {
        // CORRECCIÓN: Termina la carga del tema aquí
        setIsThemeLoading(false);
        
        // Delay interno de 0.5s para tapar el parpadeo de colores
        setTimeout(() => {
          setShowInternalLoading(false);
        }, 1000);
    }
    
    if (savedMapStyle) setCurrentMapStyle(savedMapStyle)
  }

  // Efectos
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initData()
      // Hacer la función de ruta disponible globalmente para los popups
      ;(window as any).routeToEvent = routeToEvent
;(window as any).clearRouteAndRestoreEvents = () => {
  console.log('🗑️ clearRouteAndRestoreEvents llamado desde global')
  if (routingControl) {
    clearRoutes()
    restoreAllEvents()
  }
}
    }
  }, []) // Remover user como dependencia ya que ahora funciona para todos los usuarios

  // Cargar datos reales cuando el usuario esté autenticado
  useEffect(() => {
    if (user) {
      loadRealData()
    } else {
      loadEvents()
    }
    loadSavedData()
  }, [user])

  // Verificar notificaciones cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      checkUpcomingActivities()
    }, 60000) // Cada minuto

    return () => clearInterval(interval)
  }, [agendaItems])

  // useEffect simplificado que cierra CUALQUIER menú activo si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      // Si el clic no fue dentro de un dropdown...
      if (!target.closest('.dropdown')) {
        setOpenDropdown(null) // Cierra cualquier dropdown abierto
      }
      // Si el clic no fue dentro del contenedor de búsqueda de direcciones...
      if (!target.closest('.address-search-container')) {
        setShowAddressSuggestions(false) // Cierra las sugerencias
      }
      // Si hay una ruta activa y se hace clic fuera del popup, limpiar
      if (routingControl && !target.closest('.leaflet-popup') && !target.closest('.leaflet-marker-icon')) {
        console.log('📍 Clic fuera del popup detectado, limpiando ruta...')
        setTimeout(() => {
          if (routingControl) {
            clearRoutes()
            restoreAllEvents()
          }
        }, 200)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [routingControl])

  // CORRECCIÓN: Lógica consolidada de inicialización y limpieza del mapa
  useEffect(() => {
    if (currentView === 'map' && mapContainerRef.current && !isThemeLoading) {
      // Si ya hay un mapa, no hacemos nada para evitar reinicializar.
      if (mapInstanceRef.current) {
        return;
      }
      
      setIsMapLoading(true);

      const setupMap = async () => {
        const leafletLoaded = await loadLeaflet();
        // Verificamos que el contenedor siga existiendo y que no haya ya un mapa
        if (leafletLoaded && mapContainerRef.current && !mapInstanceRef.current) {
          // Pequeño delay para asegurar que el DOM esté completamente listo
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const map = L.map(mapContainerRef.current).setView([10.654, -71.612], 12);

          const style = mapStyles[currentMapStyle as keyof typeof mapStyles];
          L.tileLayer(style.url, { attribution: style.attribution }).addTo(map);

          mapInstanceRef.current = map;
          
          getUserLocation();
          
          setIsMapLoading(false);
          console.log('Mapa inicializado correctamente');
        }
      };

      setupMap();

      // La función de limpieza se ejecutará cuando el componente se desmonte o
      // cuando `currentView` cambie.
      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
          console.log('Mapa destruido y limpiado');
        }
      };
    }
  }, [currentView, isThemeLoading]); // CAMBIO: Añadimos isThemeLoading como dependencia

  // useEffect simplificado para actualizar los marcadores cuando cambian los filtros
  useEffect(() => {
    if (currentView === 'map' && mapInstanceRef.current && !isMapLoading) {
      const filtered = filterEvents()
      addEventsToMap(filtered)
    }
  }, [filterType, searchTerm, events]) // CAMBIO: Añadimos 'events' como dependencia

  // useEffect para cargar eventos automáticamente cuando se cargan los datos
  useEffect(() => {
    console.log('🔄 useEffect eventos - currentView:', currentView, 'events.length:', events.length, 'isMapLoading:', isMapLoading)
    if (currentView === 'map' && mapInstanceRef.current && events.length > 0 && !isMapLoading) {
      console.log('🗺️ Agregando eventos al mapa:', events.length, 'eventos')
      addEventsToMap(events)
    }
  }, [events, currentView, isMapLoading])

  // Cargar tema inicial y aplicar estilos
  useEffect(() => {
    // El tema se carga desde el backend en initData()
    // No necesitamos cargar desde localStorage
  }, [])

  // Aplicar tema cuando cambie currentTheme
  useEffect(() => {
    if (currentTheme && !isThemeLoading) { // CAMBIO: No aplicar hasta que la carga inicial termine
      applyTheme(currentTheme)
      
      if (currentTheme === 'noche') {
        document.documentElement.setAttribute('data-theme', 'night')
      } else {
        document.documentElement.setAttribute('data-theme', 'light')
      }
      
      // Forzar actualización de modales abiertos
      const modals = document.querySelectorAll('.modal-box')
      modals.forEach(modal => {
        if (modal instanceof HTMLElement) {
          modal.setAttribute('data-theme', currentTheme)
        }
      })
    }
  }, [currentTheme, isThemeLoading])

  // Actualizar tema de modales cuando se abran
  useEffect(() => {
    if (showAgendaModal || showCreateEventModal || showSavedEventsModal || showCreatePostModal || showLocationModal || showPostTermsModal) {
      setTimeout(() => {
        updateModalTheme()
      }, 100)
    }
  }, [showAgendaModal, showCreateEventModal, showSavedEventsModal, showCreatePostModal, showLocationModal, showPostTermsModal, currentTheme])

  // Inicializar mapa de ubicación cuando se abra el modal
  useEffect(() => {
    if (showLocationModal) {
      const initLocationMap = async () => {
        try {
          const L = await import('leaflet')
          
          // Esperar a que el DOM esté listo
          setTimeout(() => {
            const mapContainer = document.getElementById('location-map-container')
            if (mapContainer && !mapContainer.classList.contains('leaflet-container')) {
              // Limpiar contenido previo
              mapContainer.innerHTML = ''
              
              // Crear mapa
              const locationMap = L.map(mapContainer).setView([10.654, -71.612], 13)
              
              // Agregar capa de tiles
              const style = mapStyles[currentMapStyle as keyof typeof mapStyles]
              L.tileLayer(style.url, {
                attribution: style.attribution
              }).addTo(locationMap)
              
              // Evento de clic en el mapa
              locationMap.on('click', (e) => {
                if (routeType === 'simple' && selectedMarkers.length > 0) {
                  // Limpiar marcadores previos para ruta simple
                  selectedMarkers.forEach((marker: any) => {
                    if (marker && marker.remove) marker.remove()
                  })
                  setSelectedMarkers([])
                }
                
                // Crear nuevo marcador
                const newMarker = L.marker(e.latlng).addTo(locationMap)
                setSelectedMarkers(prev => [...prev, newMarker])
                
                                 // Crear ruta si es múltiple y hay más de un punto
                 if (routeType === 'multiple' && selectedMarkers.length > 0) {
                   const waypoints = [...selectedMarkers, newMarker].map((marker: any) => marker.getLatLng())
                   
                   // Importar leaflet-routing-machine dinámicamente
                   import('leaflet-routing-machine').then((Lrm) => {
                     const mapWithRouting = locationMap as any
                     if (mapWithRouting.routingControl) {
                       locationMap.removeControl(mapWithRouting.routingControl)
                     }
                     
                     mapWithRouting.routingControl = (Lrm.default as any).control({
                       waypoints: waypoints,
                       createMarker: function() { return null; },
                       routeWhileDragging: true,
                       show: true,
                       addWaypoints: false,
                       lineOptions: {
                         styles: [{color: '#007BFF', opacity: 0.8, weight: 5}]
                       },
                       router: (Lrm.default as any).osrm({
                         serviceUrl: 'https://router.project-osrm.org/route/v1'
                       })
                     }).addTo(locationMap)
                   })
                 }
              })
              
              // Guardar referencia del mapa
              ;(mapContainer as any).locationMap = locationMap
              
              // Invalidar tamaño después de un breve delay
              setTimeout(() => {
                locationMap.invalidateSize()
              }, 100)
            }
          }, 100)
        } catch (error) {
          console.error('Error inicializando mapa de ubicación:', error)
        }
      }
      
      initLocationMap()
    }
  }, [showLocationModal, routeType, currentMapStyle])

  // CORRECCIÓN: Renderizado condicional basado en la carga del tema
  if (isThemeLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-gray-600">Cargando tema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen main-container ${currentTheme === 'noche' ? 'bg-slate-900' : 'bg-white'}`}>
      {/* Pantalla de carga interna del dashboard */}
      {showInternalLoading && (
        <div className={`loading-screen ${currentTheme === 'noche' ? 'bg-slate-900' : 'bg-white'}`}>
          <div className="loading-container">
            <div className="logo-drop">
              <img 
                src={currentTheme === 'noche' ? logoNoche : "/src/assets/img/Logo.png"} 
                alt="Logo GeoPlanner" 
                className="logo-spin" 
              />
            </div>
            <p className={`loading-text ${currentTheme === 'noche' ? 'text-white' : 'text-gray-800'}`}>Cargando dashboard...</p>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="flex justify-between items-center text-primary-content p-4 shadow-lg bg-primary">
        <a href="#" className="flex items-center gap-2 text-primary-content no-underline">
          <img 
            src={currentTheme === 'noche' ? logoNoche : logo} 
            alt="Logo" 
            className="w-9 h-9" 
          />
          <strong className="text-xl">GeoPlanner</strong>
        </a>
        
        {/* Búsqueda de direcciones */}
        <div className="relative min-w-[300px] address-search-container">
          <div className="join">
            <input 
              type="text" 
              className="input input-bordered join-item w-full"
              placeholder="Buscar dirección o lugar..." 
              autoComplete="off" 
              value={addressSearchTerm}
              onFocus={() => addressSearchTerm.length >= 3 && setShowAddressSuggestions(true)}
              onChange={(e) => {
                setAddressSearchTerm(e.target.value)
                searchAddress(e.target.value)
              }}
            />
            <button className="btn btn-primary join-item" onClick={handleAddressSearch}>
              <i className="fas fa-search"></i>
            </button>
          </div>
          
          {/* Sugerencias de direcciones */}
          {showAddressSuggestions && addressSuggestions.length > 0 && (
            <div className="absolute w-full z-[3000] top-full mt-1 bg-base-100 rounded-lg shadow-lg border dropdown-content-container">
              {addressSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="w-full text-left px-4 py-2 hover:bg-base-200 border-b last:border-b-0 text-base-content"
                  onClick={() => {
                    if (suggestion.lat && suggestion.lon) {
                      centerMapOnAddress(parseFloat(suggestion.lat), parseFloat(suggestion.lon), suggestion.display_name)
                    }
                  }}
                >
                  {suggestion.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            className={`btn btn-sm font-bold transition-all duration-300 ${
              currentTheme === 'noche' 
                ? 'bg-slate-800 text-white border-2 border-cyan-400 hover:bg-cyan-400 hover:text-white hover:shadow-lg hover:shadow-cyan-400/40 hover:-translate-y-0.5' 
                : 'bg-white text-gray-800 border-2 border-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5'
            }`}
            onClick={toggleView}
          >
            {currentView === 'map' ? 'Ver Feed Clásico' : 'Ver Vista de Mapa'}
          </button>
          
          <div className="flex gap-2">
            {/* ===== CAMBIOS: Reemplazar <details> por <div> para un control total con React ===== */}
            
            {/* ELIMINAR TEMPORALMENTE EL BOTÓN DE CONTACTO */}
            {/* <div className={`dropdown dropdown-end ${openDropdown === 'contacto' ? 'dropdown-open' : ''}`}>
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle"
                title="Contacto"
                onClick={() => handleDropdown('contacto')}
              >
                👷
              </div>
              <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                <li className="menu-title"><span>Contacto</span></li>
                <li><a onClick={handleContactEmail}>
                  <span>✉️</span>
                  <div>Enviar un correo a soporte</div>
                </a></li>
                <li><a onClick={handleContactPhone}>
                  <span>📞</span>
                  <div>Contactar por teléfono</div>
                </a></li>
                <li><a onClick={handleFAQ}>
                  <span>❓</span>
                  <div>Ver Preguntas Frecuentes</div>
                </a></li>
                <li><a onClick={handleTerms}>
                  <span>📜</span>
                  <div>Leer Términos y Condiciones</div>
                </a></li>
                <li><a onClick={handlePrivacy}>
                  <span>🔒</span>
                  <div>Leer Política de Privacidad</div>
                </a></li>
              </ul>
            </div> */}

            {/* Selector de tema - CAMBIADO A VERTICAL */}
            <div className={`dropdown dropdown-end ${openDropdown === 'tema' ? 'dropdown-open' : ''}`}>
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle text-xl"
                title="Cambiar Tema"
                onClick={() => handleDropdown('tema')}
              >
                🎨
              </div>
              <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[3000] w-64 max-h-180 overflow-y-auto p-2 shadow">
                <li className="menu-title"><span>Seleccionar Tema</span></li>
                {Object.entries(temas).map(([themeName, theme]) => (
                  <li key={themeName}>
                    <a 
                      className={currentTheme === themeName ? 'active' : ''}
                      style={{
                        border: currentTheme === themeName ? '2px solid #007BFF' : '2px solid transparent',
                        borderRadius: '8px',
                        backgroundColor: currentTheme === themeName ? 'rgba(0, 123, 255, 0.1)' : 'transparent'
                      }}
                      onClick={() => {
                        applyTheme(themeName)
                        closeDropdown()
                      }}
                    >
                      <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-purple-500"></div>
                      <div className="flex-1">
                        <strong>{themeName.charAt(0).toUpperCase() + themeName.slice(1)}</strong>
                        <br />
                        <small>{themeName === 'default' ? 'Azul clásico' : 
                                themeName === 'geoplanner' ? 'Azul clásico' :
                                themeName === 'aurora' ? 'Rosa y azul' :
                                themeName === 'noche' ? 'Modo oscuro' :
                                themeName === 'oceano' ? 'Azul marino' :
                                themeName === 'amanecer' ? 'Naranja y rojo' :
                                themeName === 'pastel' ? 'Azul suave' :
                                themeName === 'fuego' ? 'Rojo intenso' :
                                themeName === 'bosque' ? 'Verde natural' :
                                'Azul eléctrico'}</small>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Estilos de mapa */}
            <div className={`dropdown dropdown-end ${openDropdown === 'mapa' ? 'dropdown-open' : ''}`}>
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle text-xl"
                title="Estilos de Mapa"
                onClick={() => handleDropdown('mapa')}
              >
                🗺️
              </div>
              <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[3000] w-52 p-2 shadow">
                <li className="menu-title"><span>Estilos de Mapa</span></li>
                {Object.entries(mapStyles).map(([styleName, style]) => (
                  <li key={styleName}>
                    <a 
                      className={currentMapStyle === styleName ? 'active' : ''}
                      style={{
                        border: currentMapStyle === styleName ? '2px solid #007BFF' : '2px solid transparent',
                        borderRadius: '8px',
                        backgroundColor: currentMapStyle === styleName ? 'rgba(0, 123, 255, 0.1)' : 'transparent'
                      }}
                      onClick={() => {
                        changeMapStyle(styleName)
                        closeDropdown()
                      }}
                    >
                      <div className="w-4 h-4 rounded bg-gray-300"></div>
                      <div>
                        <strong>{style.name}</strong>
                        <br />
                        <small>{styleName === 'openstreetmap' ? 'Mapa estándar con calles' :
                                styleName === 'satellite' ? 'Imágenes satelitales' :
                                'Imágenes + calles'}</small>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Notificaciones - MÁS ANCHO */}
            <div className={`dropdown dropdown-end ${openDropdown === 'notificaciones' ? 'dropdown-open' : ''}`}>
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle text-xl"
                title="Notificaciones"
                onClick={() => handleDropdown('notificaciones')}
              >
                <div className="relative">
                  🔔
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </div>
              </div>
              <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[3000] w-80 p-2 shadow">
                <li className="menu-title"><span>Notificaciones</span></li>
                {userNotifications.length === 0 ? (
                  <li><a className="text-gray-500">No hay notificaciones nuevas</a></li>
                ) : (
                  userNotifications.slice(0, 5).map((notification) => (
                    <li key={notification.id}>
                      <a onClick={() => {
                        // Manejar diferentes tipos de notificaciones
                        if (notification.tipo === 'solicitud_amistad') {
                          handleShowFriendshipNotification(notification)
                        } else if (notification.tipo === 'activity') {
                          setShowAgendaModal(true)
                        }
                        // Marcar como leída
                        markNotificationAsRead(notification.id)
                      }}>
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                          {notification.tipo === 'solicitud_amistad' ? '🤝' : 
                           notification.tipo === 'amistad_aceptada' ? '✅' :
                           notification.tipo === 'amistad_rechazada' ? '❌' : '📅'}
                        </div>
                        <div className="flex-1">
                          <div><strong>{notification.nombre_usuario_origen}</strong></div>
                          <small className="text-gray-500">{notification.mensaje}</small>
                        </div>
                      </a>
                    </li>
                  ))
                )}
                {userNotifications.length > 5 && (
                  <li><a className="text-primary">Ver todas las notificaciones ({userNotifications.length})</a></li>
                )}
              </ul>
            </div>

            {/* Perfil - MÁS ANCHO */}
            <div className={`dropdown dropdown-end ${openDropdown === 'perfil' ? 'dropdown-open' : ''}`}>
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle text-xl"
                title="Perfil"
                onClick={() => handleDropdown('perfil')}
              >
                👤
              </div>
              <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[3000] w-72 p-2 shadow">
                <li><a onClick={handleProfile}>
                  <img 
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200" 
                    src={user?.foto_perfil_url || '/src/assets/img/placeholder.png'} 
                    alt="Foto de perfil"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/src/assets/img/placeholder.png'
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{user ? `${user.nombre} ${user.apellido}` : 'Usuario'}</span>
                      <svg className="w-4 h-4 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm5.71,7.29-6,6a1,1,0,0,1-1.42,0l-3-3a1,1,0,0,1,1.42-1.42L11,13.59l5.29-5.3a1,1,0,0,1,1.42,1.42Z" />
                      </svg>
                    </div>
                    <small className="text-gray-500">@{user?.nombre_usuario || 'usuario'}</small>
                  </div>
                </a></li>
                <li><a onClick={handleProfile}>
                  <span className="text-blue-500">👤</span>
                  <div className="flex-1">
                    <div><strong className="text-blue-500">Mi Perfil</strong></div>
                    <small className="text-gray-500">Ver y editar mi perfil</small>
                  </div>
                </a></li>
                <li><hr className="my-2" /></li>
                <li><a onClick={handleLogout}>
                  <span className="text-red-500">➡️</span>
                  <div className="flex-1">
                    <div><strong className="text-red-500">Cerrar sesión</strong></div>
                    <small className="text-gray-500">Salir de tu cuenta</small>
                  </div>
                </a></li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex bg-white" style={{ height: 'calc(100vh - 80px)' }} data-theme={currentTheme}>
        {/* Sidebar Column */}
        <div className="w-64 flex flex-col gap-4 mr-4 pt-4 ml-4" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          {/* Sidebar Principal */}
          <div className="bg-primary text-primary-content sidebar rounded-2xl shadow-lg">
            <div className="p-4">
              <ul className="menu bg-transparent text-primary-content">
                <li><a className="text-primary-content hover:bg-primary-focus cursor-pointer text-[#f5f5dc] font-semibold" onClick={() => setShowAgendaModal(true)}>📅 Mi Agenda</a></li>
                <li><a className="text-primary-content hover:bg-primary-focus cursor-pointer text-[#f5f5dc] font-semibold" onClick={handleShowMyInscriptions}>🎟️ Mis Inscripciones</a></li>
                <li><a className="text-primary-content hover:bg-primary-focus cursor-pointer text-[#f5f5dc] font-semibold" onClick={() => setShowSavedEventsModal(true)}>⭐ Eventos Guardados</a></li>
                <li><a className="text-primary-content hover:bg-primary-focus text-[#f5f5dc] font-semibold">👨‍👩‍👧‍👦 Grupos</a></li>

              </ul>
            </div>
          </div>

          {/* Sidebar de Filtros */}
          <div className="bg-primary text-primary-content rounded-2xl shadow-lg filter-sidebar">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-3 ">Filtros</h3>
              <ul className="menu bg-transparent text-primary-content">
                <li><a 
                  className={filterType === 'all' ? 'bg-primary-focus text-primary-content text-[#f5f5dc] font-semibold' : 'text-primary-content hover:bg-primary-focus text-[#f5f5dc] font-semibold'}
                  onClick={() => setFilterType('all')}
                >
                  Todos los tipos
                </a></li>
                <li><a 
                  className={filterType === 'Deporte' ? 'bg-primary-focus text-primary-content text-[#f5f5dc] font-semibold' : 'text-primary-content hover:bg-primary-focus text-[#f5f5dc] font-semibold'}
                  onClick={() => setFilterType('Deporte')}
                >
                  Deporte
                </a></li>
                <li><a 
                  className={filterType === 'Estudio' ? 'bg-primary-focus text-primary-content text-[#f5f5dc] font-semibold' : 'text-primary-content hover:bg-primary-focus text-[#f5f5dc] font-semibold'}
                  onClick={() => setFilterType('Estudio')}
                >
                  Estudio
                </a></li>
                <li><a 
                  className={filterType === 'Social' ? 'bg-primary-focus text-primary-content text-[#f5f5dc] font-semibold' : 'text-primary-content hover:bg-primary-focus text-[#f5f5dc] font-semibold'}
                  onClick={() => setFilterType('Social')}
                >
                  Social
                </a></li>
                <li><a 
                  className={filterType === 'Cultural' ? 'bg-primary-focus text-primary-content text-[#f5f5dc] font-semibold' : 'text-primary-content hover:bg-primary-focus text-[#f5f5dc] font-semibold'}
                  onClick={() => setFilterType('Cultural')}
                >
                  Cultural
                </a></li>
                <li><a 
                  className={filterType === 'Otro' ? 'bg-primary-focus text-primary-content text-[#f5f5dc] font-semibold' : 'text-primary-content hover:bg-primary-focus text-[#f5f5dc] font-semibold'}
                  onClick={() => setFilterType('Otro')}
                >
                  Otro
                </a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white content-area" style={{ height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
          {currentView === 'map' ? (
            <div className="relative h-full w-full p-4">
              <div 
                id="feed-map" 
                ref={mapContainerRef} 
                className="h-full w-full rounded-2xl shadow-lg"
                style={{ 
                  height: 'calc(100vh - 120px)', 
                  width: '100%',
                  position: 'relative',
                  borderRadius: '16px',
                  overflow: 'hidden'
                }}
              >
                {isMapLoading && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <p className="mt-2">Cargando mapa...</p>
                  </div>
                )}
                
                {/* Botón flotante para crear publicación */}
                <button 
                  className="btn btn-primary shadow-lg absolute bottom-6 right-6 z-50"
                  title="Crear evento"
                  onClick={() => setShowCreateEventModal(true)}
                >
                  <i className="fas fa-plus"></i>
                  <span className="ml-2">Crear Evento</span>
                </button>
                
                {/* Botón para centrar en ubicación del usuario */}
                <button 
                  className="btn btn-circle btn-neutral shadow absolute bottom-24 right-7 z-50"
                  title="Centrar en mi ubicación"
                  onClick={centerMapOnUser}
                >
                  <i className="fas fa-crosshairs"></i>
                </button>
                
                {/* Botón para forzar obtención de ubicación */}
                <button 
                  className="btn btn-circle btn-warning shadow absolute bottom-40 right-7 z-50"
                  title="Actualizar mi ubicación"
                  onClick={() => {
                    console.log('📍 Forzando actualización de ubicación...')
                    // Limpiar localStorage para forzar nueva obtención
                    localStorage.removeItem('geoplanner_user_location')
                    getUserLocation()
                  }}
                >
                  <i className="fas fa-location-arrow"></i>
                </button>
                
                {/* Botón de debug temporal */}
                <button 
                  className="btn btn-circle btn-info shadow absolute bottom-56 right-7 z-50"
                  title="Debug de ubicación"
                  onClick={showLocationDebugInfo}
                >
                  <i className="fas fa-bug"></i>
                </button>
                
                {/* Botón para limpiar ruta */}
                {routingControl && (
                  <button 
                    className="btn btn-circle btn-warning shadow absolute bottom-72 right-7 z-50"
                    title="Limpiar ruta y restaurar eventos"
                    onClick={() => {
                      console.log('🗑️ Botón limpiar ruta presionado')
                      clearRoutes()
                      restoreAllEvents()
                    }}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                )}
                
                {/* Botón flotante para crear publicación (vista mapa) */}
                <button 
                  className="btn btn-primary shadow-lg absolute bottom-6 right-7 z-50 w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                  onClick={() => setShowCreatePostModal(true)}
                  title="Crear publicación"
                >
                  <i className="bi bi-plus-lg"></i>
                </button>

                {/* Botón para limpiar rutas */}
                {routingControl && (
                  <button 
                    className="btn btn-circle btn-warning shadow absolute bottom-42 right-7 z-50"
                    title="Limpiar rutas"
                    onClick={clearRoutes}
                  >
                    🗑️
                  </button>
                )}
              </div>
              <div id="event-detail-sidebar"></div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto flex justify-center" style={{ height: 'calc(100vh - 80px)' }}>
              <div className="feed-container w-11/12 max-w-6xl transform scale-105">
                {/* Widget de crear publicación */}
                <div className="create-post-widget mb-6 flex justify-center mt-15">
                  <div className="w-3/5 p-3 border rounded-lg create-post-widget">
                    <div className="flex items-center gap-3">
                      <img 
                        src={placeholder} 
                        className="w-7 h-7 rounded-full"
                        alt="user"
                      />
                      <div 
                        className="create-post-input cursor-pointer p-3 border rounded-lg hover:bg-gray-50 flex-1"
                        onClick={() => setShowCreatePostModal(true)}
                      >
                        ¿Qué estás organizando, <span className="font-semibold">{user?.nombre?.split(' ')[0] || 'Usuario'}</span>?
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Feed de publicaciones */}
                
                {/* Renderizar publicaciones en el feed clásico */}
                {posts.length > 0 ? (
                  posts
                    .sort((a, b) => new Date(b.fecha_evento).getTime() - new Date(a.fecha_evento).getTime())
                    .map((post) => {
                      const postElement = renderPost(post)
                      
                      // Renderizar mapa después de que el componente se monte
                      setTimeout(() => {
                        if (post.rutas && post.rutas.length > 0) {
                          renderPostMap(post.id.toString(), post.rutas)
                        }
                      }, 200)
                      
                      return postElement
                    })
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    <div className="text-4xl mb-4">📝</div>
                    <p>No hay publicaciones aún</p>
                    <p className="text-sm">¡Sé el primero en crear una publicación!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botón flotante para crear publicación (vista clásica) */}
      <button 
        className="btn btn-primary btn-circle fixed bottom-6 right-6 z-50 shadow-lg"
        onClick={() => setShowCreatePostModal(true)}
        title="Crear publicación"
      >
        +
      </button>

      {/* Footer removido del dashboard para mejor UX */}

      {/* Modal de Crear Evento */}
      {showCreateEventModal && (
        <dialog open className="modal">
          <div className="modal-box w-11/12 max-w-5xl" data-theme={currentTheme}>
            <h3 className="font-bold text-lg mb-4">Crear Nuevo Evento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Título del Evento *</span>
                  </label>
                  <input 
                    type="text" 
                    className="input input-bordered"
                    value={newEvent.title}
                    onChange={(e) => handleNewEventChange('title', e.target.value)}
                    placeholder="Ej: Fútbol en el Parque"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Descripción *</span>
                  </label>
                  <textarea 
                    className="textarea textarea-bordered"
                    rows={3}
                    value={newEvent.description}
                    onChange={(e) => handleNewEventChange('description', e.target.value)}
                    placeholder="Describe tu evento..."
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Tipo de Evento</span>
                  </label>
                  <select 
                    className="select select-bordered"
                    value={newEvent.type}
                    onChange={(e) => handleNewEventChange('type', e.target.value)}
                  >
                    <option value="Social">Social</option>
                    <option value="Deporte">Deporte</option>
                    <option value="Estudio">Estudio</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>
              <div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Fecha *</span>
                  </label>
                  <input 
                    type="date" 
                    className="input input-bordered"
                    value={newEvent.date}
                    onChange={(e) => handleNewEventChange('date', e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Hora *</span>
                  </label>
                  <input 
                    type="time" 
                    className="input input-bordered"
                    value={newEvent.time}
                    onChange={(e) => handleNewEventChange('time', e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Máximo de Asistentes</span>
                  </label>
                  <input 
                    type="number" 
                    className="input input-bordered"
                    value={newEvent.maxAttendees}
                    onChange={(e) => handleNewEventChange('maxAttendees', parseInt(e.target.value))}
                    min="1"
                    max="100"
                  />
                </div>
                <div className="alert alert-info">
                  <i className="fas fa-info-circle"></i>
                  <div>
                    <strong>Ubicación:</strong> El evento se creará en tu ubicación actual
                    {userLocation && (
                      <div className="text-xs mt-1">
                        Lat: {userLocation.lat.toFixed(6)}, Lng: {userLocation.lng.toFixed(6)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-action">
              <button 
                className="btn btn-ghost" 
                onClick={() => setShowCreateEventModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleCreateEvent}
              >
                Crear Evento
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowCreateEventModal(false)}>close</button>
          </form>
        </dialog>
      )}

      {/* Modal de Crear Publicación */}
      {showCreatePostModal && (
        <dialog open className="modal">
          <div className="modal-box w-11/12 max-w-4xl border-2 border-white" data-theme={currentTheme}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                {/* Foto de perfil del usuario */}
                <img 
                  src={user?.foto_perfil_url || '/src/assets/img/placeholder.png'} 
                  alt="Tu foto de perfil"
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/src/assets/img/placeholder.png'
                  }}
                />
                <div>
                  <h3 className="font-bold text-lg">Crear Nueva Publicación</h3>
                  <p className="text-sm text-gray-500">Como {user?.nombre} {user?.apellido}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Texto de la publicación */}
              <div className="form-control">
                <textarea 
                  className="textarea textarea-bordered w-full"
                  rows={3}
                  placeholder="¿Qué estás organizando?..."
                  value={newPost.text}
                  onChange={(e) => handleNewPostChange('text', e.target.value)}
                />
              </div>

              {/* Campos de configuración */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Tipo de Evento</span>
                  </label>
                  <select 
                    className="select select-bordered"
                    value={newPost.type}
                    onChange={(e) => handleNewPostChange('type', e.target.value)}
                  >
                    <option value="Social">Social</option>
                    <option value="Deporte">Deporte</option>
                    <option value="Estudio">Estudio</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Fecha y Hora</span>
                  </label>
                  <input 
                    type="datetime-local" 
                    className="input input-bordered"
                    value={newPost.eventDate}
                    onChange={(e) => handleNewPostChange('eventDate', e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Privacidad</span>
                  </label>
                  <select 
                    className="select select-bordered"
                    value={newPost.privacy}
                    onChange={(e) => handleNewPostChange('privacy', e.target.value)}
                  >
                    <option value="publica">Pública</option>
                    <option value="amigos">Solo amigos</option>
                    <option value="privada">Privada con invitación</option>
                  </select>
                </div>
              </div>

              {/* Archivo multimedia */}
              <div className="form-control">
                <fieldset className="fieldset border-2 border-gray-300 rounded-lg p-4">
                  <legend className="fieldset-legend px-2 text-sm font-medium">Seleccionar archivo</legend>
                  <input 
                    type="file" 
                    className="file-input file-input-ghost w-full"
                    accept="image/*"
                    onChange={(e) => handleNewPostChange('mediaFile', e.target.files?.[0] || null)}
                  />
                  <label className="label">
                    <span className="label-text-alt">Max size 5MB</span>
                  </label>
                </fieldset>
              </div>

              {/* Selección de ubicación */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Ubicación *</span>
                </label>
                <button 
                  type="button"
                  className="btn btn-outline w-full"
                  onClick={() => setShowLocationModal(true)}
                >
                  📍 Seleccionar Ubicación
                </button>
                <div className="mt-2 text-sm text-gray-600">
                  {locationDisplay}
                </div>
              </div>

              {/* Términos y condiciones */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold">Términos y Condiciones</span>
                </label>
                
                {/* Checkbox obligatorio */}
                <div className={`border-2 rounded-lg p-3 mb-3 transition-colors duration-200 ${acceptTerms ? 'border-blue-500 bg-blue-50' : 'border-red-500 bg-red-50'}`}>
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <input 
                        type="checkbox" 
                        className={`checkbox transition-all duration-200 ${acceptTerms 
                          ? 'border-blue-600 bg-blue-500 checked:border-blue-500 checked:bg-blue-400 checked:text-blue-800' 
                          : 'border-red-600 bg-red-500 checked:border-red-500 checked:bg-red-400 checked:text-red-800'
                        }`}
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        required
                      />
                      <span className={`label-text font-semibold transition-colors duration-200 ${acceptTerms ? 'text-blue-700' : 'text-red-700'}`}>
                        <span className={acceptTerms ? 'text-blue-500' : 'text-red-500'}>*</span> Acepto los Términos y Condiciones de GeoPlanner
                      </span>
                    </label>
                  </div>
                  <button 
                    type="button"
                    className={`btn btn-outline btn-sm mt-2 transition-colors duration-200 ${
                      acceptTerms 
                        ? 'text-blue-600 border-blue-600 hover:bg-blue-50' 
                        : 'text-red-600 border-red-600 hover:bg-red-50'
                    }`}
                    onClick={() => setShowTerms(!showTerms)}
                  >
                    {showTerms ? '👁️ Ocultar términos' : '👁️ Ver términos completos'}
                  </button>
                </div>

                {/* Términos colapsables */}
                {showTerms && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-3 border border-gray-200">
                    <h6 className="font-bold text-primary mb-3">Términos y Condiciones de GeoPlanner</h6>
                    <div className="text-sm space-y-3 text-gray-800">
                      <p><strong>1. RESPONSABILIDAD EXCLUSIVA DEL ORGANIZADOR:</strong> Usted es el ÚNICO responsable de la legalidad, seguridad, permisos, control de multitudes, cumplimiento normativo, y todo el contenido y desarrollo de su evento. GeoPlanner NO asume NINGUNA responsabilidad por incidentes, daños, lesiones, muertes, pérdidas materiales o consecuencias legales de cualquier naturaleza.</p>
                      <p><strong>2. DESLINDE TOTAL DE GEOPLANNER:</strong> GeoPlanner es ÚNICAMENTE una plataforma tecnológica de intermediación. NO somos organizadores, promotores, ni responsables de eventos. NO nos hacemos responsables por incidentes, accidentes, daños, lesiones, muertes, pérdidas materiales, consecuencias legales, penales, civiles o administrativas de cualquier naturaleza relacionadas con el evento.</p>
                      <p><strong>3. PROHIBICIONES ABSOLUTAS:</strong> Se prohíben TERMINANTEMENTE eventos que involucren: actividades ilegales, armas, sustancias ilícitas, violencia, discursos de odio, discriminación, actividades terroristas, tráfico de personas, pornografía, actividades que pongan en riesgo la vida o integridad física de los participantes.</p>
                      <p><strong>4. COOPERACIÓN OBLIGATORIA CON AUTORIDADES:</strong> Al publicar, usted AUTORIZA EXPRESAMENTE a GeoPlanner a compartir TODA su información personal, datos de ubicación, historial de actividades, y cualquier información relevante con autoridades judiciales, policiales, gubernamentales o administrativas que lo soliciten, sin necesidad de notificación previa, en caso de investigaciones, denuncias, o sospechas de actividades ilegales.</p>
                      <p><strong>5. VERIFICACIÓN DE IDENTIDAD Y CUMPLIMIENTO:</strong> Usted declara bajo juramento que: a) Ha proporcionado información veraz y completa; b) Su identidad ha sido verificada; c) Cumple con todas las leyes aplicables; d) Tiene los permisos necesarios para organizar el evento; e) El evento no viola ninguna normativa local, nacional o internacional.</p>
                      <p><strong>6. RENUNCIA A RECLAMACIONES:</strong> Usted renuncia EXPRESAMENTE a presentar cualquier tipo de reclamo, demanda, acción legal o administrativa contra GeoPlanner por cualquier motivo relacionado con el uso de la plataforma o la organización de eventos.</p>
                      <p><strong>7. JURISDICCIÓN Y LEY APLICABLE:</strong> Estos términos se rigen por las leyes de Venezuela. Cualquier disputa será resuelta exclusivamente en los tribunales competentes de Venezuela.</p>
                      <p className="text-red-800 font-bold bg-red-100 p-3 rounded-lg border border-red-300">⚠️ AL PUBLICAR, USTED DECLARA BAJO JURAMENTO QUE HA LEÍDO, ENTENDIDO Y ACEPTADO ESTOS TÉRMINOS EN SU TOTALIDAD, RECONOCIENDO QUE SON LEGALMENTE VINCULANTES.</p>
                    </div>
                  </div>
                )}

                {/* Términos adicionales */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Términos Adicionales (Opcional)</span>
                  </label>
                  <textarea 
                    className="textarea textarea-bordered w-full"
                    rows={3}
                    placeholder="Ejemplo: Traer identificación, llegar 15 minutos antes, vestimenta deportiva requerida, etc."
                    value={additionalTerms}
                    onChange={(e) => setAdditionalTerms(e.target.value)}
                  />
                  <div className="label">
                    <span className="label-text-alt text-gray-500">
                      Estos términos se añadirán a los términos básicos de GeoPlanner.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-action">
              <button 
                className="btn btn-primary"
                onClick={handleCreatePost}
              >
                Publicar
              </button>
              <button 
                className="btn btn-outline"
                onClick={() => setShowCreatePostModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowCreatePostModal(false)}>close</button>
          </form>
        </dialog>
      )}

      {/* Modal de Selección de Ubicación */}
      {showLocationModal && (
        <dialog open className="modal">
          <div className="modal-backdrop bg-black bg-opacity-50 backdrop-blur-sm"></div>
          <div className="modal-box w-11/12 max-w-4xl border-2 border-white" data-theme={currentTheme}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Define la ubicación</h3>
              <button 
                className="btn btn-sm btn-outline"
                onClick={() => setShowLocationModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="tabs tabs-boxed mb-4">
              <button 
                className={`tab ${routeType === 'simple' ? 'tab-active' : ''}`}
                onClick={() => setRouteType('simple')}
              >
                📍 Ruta Simple
              </button>
              <button 
                className={`tab ${routeType === 'multiple' ? 'tab-active' : ''}`}
                onClick={() => setRouteType('multiple')}
              >
                ➯ Ruta Múltiple
              </button>
            </div>

            <div className="text-sm mb-4">
              <p><strong>Ruta Simple:</strong> Un único marcador.</p>
              <p><strong>Ruta Múltiple:</strong> Traza una ruta con varios puntos.</p>
            </div>

            {/* Buscador de direcciones */}
            <div className="form-control mb-4">
              <div className="input-group">
                <input 
                  type="text" 
                  className="input input-bordered w-full"
                  placeholder="Buscar dirección o lugar..."
                  autoComplete="off"
                />
                <button className="btn btn-primary">
                  <i className="bi bi-search"></i>
                </button>
              </div>
            </div>

            {/* Contenedor del mapa */}
            <div 
              id="location-map-container" 
              className="w-full h-96 border rounded-lg mb-4 bg-gray-100"
              style={{ backgroundColor: '#f0f0f0' }}
            >
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">🗺️</div>
                  <p>Haz clic en el mapa para seleccionar ubicación</p>
                </div>
              </div>
            </div>

            <div className="modal-action">
              <button 
                className="btn btn-warning"
                onClick={clearSelectedMarkers}
              >
                Limpiar Mapa
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleLocationSelection}
              >
                Aceptar
              </button>
              <button 
                className="btn btn-outline"
                onClick={() => setShowLocationModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowLocationModal(false)}>close</button>
          </form>
        </dialog>
      )}

      {/* Modal de Términos de Publicación */}
      {showPostTermsModal && selectedPostTerms && (
        <dialog open className="modal">
          <div className="modal-box w-11/12 max-w-4xl" data-theme={currentTheme}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">📜 Términos y Condiciones del Evento</h3>
              <button 
                className="btn btn-sm btn-circle btn-outline"
                onClick={() => setShowPostTermsModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Términos de GeoPlanner */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-2">Términos y Condiciones de GeoPlanner</h4>
                <div className="text-sm text-blue-700 space-y-2">
                  <p><strong>1. RESPONSABILIDAD EXCLUSIVA DEL ORGANIZADOR:</strong> Usted es el ÚNICO responsable de la legalidad, seguridad, permisos, control de multitudes, cumplimiento normativo, y todo el contenido y desarrollo de su evento. GeoPlanner NO asume NINGUNA responsabilidad por incidentes, daños, lesiones, muertes, pérdidas materiales o consecuencias legales de cualquier naturaleza.</p>
                  <p><strong>2. DESLINDE TOTAL DE GEOPLANNER:</strong> GeoPlanner es ÚNICAMENTE una plataforma tecnológica de intermediación. NO somos organizadores, promotores, ni responsables de eventos. NO nos hacemos responsables por incidentes, accidentes, daños, lesiones, muertes, pérdidas materiales, consecuencias legales, penales, civiles o administrativas de cualquier naturaleza relacionadas con el evento.</p>
                  <p><strong>3. PROHIBICIONES ABSOLUTAS:</strong> Se prohíben TERMINANTEMENTE eventos que involucren: actividades ilegales, armas, sustancias ilícitas, violencia, discursos de odio, discriminación, actividades terroristas, tráfico de personas, pornografía, actividades que pongan en riesgo la vida o integridad física de los participantes.</p>
                  <p><strong>4. COOPERACIÓN OBLIGATORIA CON AUTORIDADES:</strong> Al publicar, usted AUTORIZA EXPRESAMENTE a GeoPlanner a compartir TODA su información personal, datos de ubicación, historial de actividades, y cualquier información relevante con autoridades judiciales, policiales, gubernamentales o administrativas que lo soliciten, sin necesidad de notificación previa, en caso de investigaciones, denuncias, o sospechas de actividades ilegales.</p>
                  <p><strong>5. VERIFICACIÓN DE IDENTIDAD Y CUMPLIMIENTO:</strong> Usted declara bajo juramento que: a) Ha proporcionado información veraz y completa; b) Su identidad ha sido verificada; c) Cumple con todas las leyes aplicables; d) Tiene los permisos necesarios para organizar el evento; e) El evento no viola ninguna normativa local, nacional o internacional.</p>
                  <p><strong>6. RENUNCIA A RECLAMACIONES:</strong> Usted renuncia EXPRESAMENTE a presentar cualquier tipo de reclamo, demanda, acción legal o administrativa contra GeoPlanner por cualquier motivo relacionado con el uso de la plataforma o la organización de eventos.</p>
                  <p><strong>7. JURISDICCIÓN Y LEY APLICABLE:</strong> Estos términos se rigen por las leyes de Venezuela. Cualquier disputa será resuelta exclusivamente en los tribunales competentes de Venezuela.</p>
                </div>
              </div>

              {/* Términos adicionales del organizador */}
              {selectedPostTerms.additional && (
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-bold text-orange-800 mb-2">Términos Adicionales del Organizador</h4>
                  <div className="text-sm text-orange-700 whitespace-pre-wrap">
                    {selectedPostTerms.additional}
                  </div>
                </div>
              )}

              <div className="bg-red-100 p-3 rounded-lg border border-red-300">
                <p className="text-red-800 font-bold text-center">
                  ⚠️ Al inscribirte en este evento, declaras que has leído y aceptado estos términos en su totalidad.
                </p>
              </div>
            </div>

            <div className="modal-action">
              <button 
                className="btn btn-primary"
                onClick={() => setShowPostTermsModal(false)}
              >
                Entendido
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowPostTermsModal(false)}>close</button>
          </form>
        </dialog>
      )}

      {/* Modal de Mi Agenda */}
      {showAgendaModal && (
        <dialog open className="modal">
          <div className="modal-box w-11/12 max-w-7xl" data-theme={currentTheme}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Mi Agenda Privada</h3>
              <div className="flex gap-2">
                <button 
                  className="btn btn-sm btn-outline"
                  onClick={exportAgenda}
                >
                  📊 Exportar CSV
                </button>
                <button 
                  className="btn btn-sm btn-outline"
                  onClick={() => setShowCalendarView(!showCalendarView)}
                >
                  {showCalendarView ? '📋 Vista Lista' : '📅 Vista Calendario'}
                </button>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="stats shadow mb-4" style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--card-border, #e5e7eb)'
            }}>
              {(() => {
                const stats = getAgendaStats()
                return (
                  <>
                    <div className="stat">
                      <div className="stat-title">Total</div>
                      <div className="stat-value text-primary">{stats.total}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Próximas</div>
                      <div className="stat-value text-success">{stats.upcoming}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Hoy</div>
                      <div className="stat-value text-warning">{stats.today}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Pasadas</div>
                      <div className="stat-value text-info">{stats.past}</div>
                    </div>
                  </>
                )
              })()}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Formulario para nueva actividad */}
              <div className="lg:col-span-1">
                <h4 className="font-semibold mb-3">Nueva Actividad</h4>
                <div className="space-y-3">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Título *</span>
                    </label>
                    <input 
                      type="text" 
                      className="input input-bordered"
                      value={newAgendaItem.title}
                      onChange={(e) => handleNewAgendaItemChange('title', e.target.value)}
                      placeholder="Título de la actividad"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Descripción</span>
                    </label>
                    <textarea 
                      className="textarea textarea-bordered"
                      rows={3}
                      value={newAgendaItem.description}
                      onChange={(e) => handleNewAgendaItemChange('description', e.target.value)}
                      placeholder="Descripción de la actividad..."
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Fecha y Hora *</span>
                    </label>
                    <input 
                      type="datetime-local" 
                      className="input input-bordered"
                      value={newAgendaItem.date}
                      onChange={(e) => handleNewAgendaItemChange('date', e.target.value)}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Ubicación</span>
                    </label>
                    <input 
                      type="text" 
                      className="input input-bordered"
                      value={newAgendaItem.location}
                      onChange={(e) => handleNewAgendaItemChange('location', e.target.value)}
                      placeholder="Ubicación de la actividad"
                    />
                  </div>
                  <button 
                    className="btn btn-primary w-full"
                    onClick={handleCreateAgendaItem}
                  >
                    Guardar Actividad
                  </button>
                </div>
              </div>

              {/* Lista de actividades */}
              <div className="lg:col-span-3">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold">Mis Actividades</h4>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="input input-bordered input-sm"
                      placeholder="Buscar actividades..."
                      value={agendaSearchTerm}
                      onChange={(e) => setAgendaSearchTerm(e.target.value)}
                    />
                    <select 
                      className="select select-bordered select-sm"
                      value={agendaFilter}
                      onChange={(e) => setAgendaFilter(e.target.value)}
                    >
                      <option value="all">Todas</option>
                      <option value="upcoming">Próximas</option>
                      <option value="past">Pasadas</option>
                      <option value="today">Hoy</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {(() => {
                    const filteredItems = getFilteredAgendaItems()
                    return filteredItems.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">
                          {agendaItems.length === 0 
                            ? "No tienes actividades en tu agenda." 
                            : "No se encontraron actividades con los filtros aplicados."}
                        </p>
                      </div>
                    ) : (
                      filteredItems.map((item) => (
                        <div key={item.id} className="card" style={{
                          backgroundColor: 'var(--card-bg)',
                          border: '1px solid var(--card-border, #e5e7eb)'
                        }}>
                          <div className="card-body p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h5 className="font-semibold">{item.titulo}</h5>
                                {item.descripcion && (
                                  <p className="text-sm text-gray-600 mt-1">{item.descripcion}</p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-sm">
                                  <span>📅 {new Date(item.fecha_actividad).toLocaleDateString()}</span>
                                  <span>🕒 {new Date(item.fecha_actividad).toLocaleTimeString()}</span>
                                </div>
                              </div>
                              <button 
                                className="btn btn-sm btn-error"
                                onClick={() => handleDeleteAgendaItem(item.id)}
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )
                  })()}
                </div>
              </div>
            </div>
            <div className="modal-action">
              <button 
                className="btn"
                onClick={() => setShowAgendaModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowAgendaModal(false)}>close</button>
          </form>
        </dialog>
      )}

      {/* Modal de Eventos Guardados */}
      {showSavedEventsModal && (
        <dialog open className="modal">
          <div className="modal-box w-11/12 max-w-4xl" data-theme={currentTheme}>
            <h3 className="font-bold text-lg mb-4">Mis Eventos Guardados</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {savedEvents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No tienes eventos guardados.</p>
                </div>
              ) : (
                events
                  .filter(event => savedEvents.includes(event.id.toString()))
                  .map((event) => (
                    <div key={event.id} className="card bg-base-200">
                      <div className="card-body p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-semibold">{event.title}</h5>
                            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span>📅 {event.date}</span>
                              <span>🕒 {event.time}</span>
                              <span>👤 {event.organizer}</span>
                              <span className="badge badge-primary">{event.type}</span>
                            </div>
                          </div>
                          <button 
                            className="btn btn-sm btn-outline"
                            onClick={() => handleSaveEvent(event.id.toString())}
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
            <div className="modal-action">
              <button 
                className="btn"
                onClick={() => setShowSavedEventsModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowSavedEventsModal(false)}>close</button>
          </form>
        </dialog>
      )}

      {/* Componentes de QR y Asistencia */}
      {/* {showQRScanner && selectedEventForQR && (
        <QRScanner
          onVerificationComplete={handleQRVerificationComplete}
          onClose={handleCloseQRScanner}
        />
      )} */}

      {showQRCodeDisplay && selectedEventForQR && (
        <QRCodeDisplay
          eventId={selectedEventForQR.id}
          eventTitle={selectedEventForQR.title}
          onClose={handleCloseQRCodeDisplay}
        />
      )}

      {showAttendanceHistory && selectedEventForHistory && (
        <AttendanceHistory
          eventId={selectedEventForHistory.id}
          eventTitle={selectedEventForHistory.title}
          onClose={handleCloseAttendanceHistory}
        />
      )}

      {/* Notificación de solicitud de amistad */}
      {showFriendshipNotification && selectedFriendshipNotification && (
        <FriendshipNotification
          notification={selectedFriendshipNotification}
          onClose={handleCloseFriendshipNotification}
          onUpdate={handleFriendshipNotificationUpdate}
        />
      )}

      {/* Modal de Errores */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={closeErrorModal}
        title={errorModal.title}
        message={errorModal.message}
        type={errorModal.type}
      />

      {/* Modal de Mis Inscripciones */}
      {showMyInscriptionsModal && (
        <dialog className="modal modal-open">
          <div className="modal-box w-11/12 max-w-4xl" data-theme={currentTheme}>
            <h3 className="font-bold text-lg mb-4">🎟️ Mis Inscripciones</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {myInscriptions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No tienes inscripciones activas.</p>
                </div>
              ) : (
                myInscriptions.map((inscription) => (
                  <div key={inscription.id} className="card bg-base-200">
                    <div className="card-body p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="font-semibold">{inscription.publicacion.texto.split('\n')[0]}</h5>
                          <p className="text-sm text-gray-600 mt-1">{inscription.publicacion.texto}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span>👤 {inscription.publicacion.autor.nombre} {inscription.publicacion.autor.apellido}</span>
                            <span>📅 {new Date(inscription.fecha_inscripcion).toLocaleDateString()}</span>
                            <span className="badge badge-primary">{inscription.publicacion.tipo}</span>
                            <span className={`badge ${inscription.publicacion.privacidad === 'publica' ? 'badge-success' : 'badge-warning'}`}>
                              {inscription.publicacion.privacidad === 'publica' ? 'Público' : 
                               inscription.publicacion.privacidad === 'amigos' ? 'Solo Amigos' : 'Privado'}
                            </span>
                            {inscription.publicacion.fecha_evento && (
                              <span>🕒 {new Date(inscription.publicacion.fecha_evento).toLocaleDateString()}</span>
                            )}
                          </div>
                          <div className="mt-2">
                            <span className={`badge ${inscription.estado_asistencia === 'pendiente' ? 'badge-warning' : 
                                               inscription.estado_asistencia === 'confirmado' ? 'badge-success' : 'badge-error'}`}>
                              {inscription.estado_asistencia === 'pendiente' ? 'Pendiente' :
                               inscription.estado_asistencia === 'confirmado' ? 'Confirmado' : 'Cancelado'}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button 
                            className="btn btn-sm btn-error"
                            onClick={() => handleDesinscribirse(inscription.id_publicacion)}
                          >
                            ❌ Cancelar
                          </button>
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => handleShowQRCodeDisplay(inscription.id_publicacion, inscription.publicacion.texto)}
                          >
                            📱 Ver Invitación QR
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="modal-action">
              <button 
                className="btn"
                onClick={() => setShowMyInscriptionsModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowMyInscriptionsModal(false)}>close</button>
          </form>
        </dialog>
      )}


    </div>
  )
}

/**
 * ========================================
 * ESTILOS CSS PARA ANIMACIONES
 * ========================================
 */

// Estilos para la animación de aurora
  const auroraStyles = `
    @keyframes auroraWave {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }

    .aurora-animation {
      background-size: 400% 400% !important;
      animation: auroraWave 12s ease-in-out infinite;
    }

    /* @keyframes twinkle {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }

    @keyframes twinkle2 {
      0%, 100% { opacity: 0.2; }
      50% { opacity: 0.8; }
    }

    @keyframes twinkle3 {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 1; }
    }

    .night-header {
      position: relative;
      overflow: hidden;
      z-index: auto;
    }

    .night-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        radial-gradient(2px 2px at 20px 30px, #94a3b8, transparent),
        radial-gradient(2px 2px at 40px 70px, rgba(34, 211, 238, 0.6), transparent),
        radial-gradient(1px 1px at 90px 40px, #67e8f9, transparent),
        radial-gradient(1px 1px at 130px 80px, #94a3b8, transparent),
        radial-gradient(2px 2px at 160px 30px, rgba(34, 211, 238, 0.6), transparent),
        radial-gradient(1px 1px at 200px 60px, #67e8f9, transparent),
        radial-gradient(2px 2px at 240px 20px, #94a3b8, transparent),
        radial-gradient(1px 1px at 280px 70px, rgba(34, 211, 238, 0.6), transparent),
        radial-gradient(2px 2px at 320px 40px, #67e8f9, transparent),
        radial-gradient(1px 1px at 360px 80px, #94a3b8, transparent),
        radial-gradient(2px 2px at 400px 30px, rgba(34, 211, 238, 0.6), transparent),
        radial-gradient(1px 1px at 440px 60px, #67e8f9, transparent),
        radial-gradient(2px 2px at 480px 20px, #94a3b8, transparent),
        radial-gradient(1px 1px at 520px 70px, rgba(34, 211, 238, 0.6), transparent),
        radial-gradient(2px 2px at 560px 40px, #67e8f9, transparent),
        radial-gradient(1px 1px at 600px 80px, #94a3b8, transparent);
      background-repeat: repeat;
      background-size: 640px 100px;
      animation: twinkle 4s ease-in-out infinite;
      pointer-events: none;
      z-index: 0;
    }

    .night-header::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        radial-gradient(1px 1px at 60px 50px, #94a3b8, transparent),
        radial-gradient(2px 2px at 100px 20px, rgba(34, 211, 238, 0.6), transparent),
        radial-gradient(1px 1px at 140px 90px, #67e8f9, transparent),
        radial-gradient(2px 2px at 180px 10px, #94a3b8, transparent),
        radial-gradient(1px 1px at 220px 50px, rgba(34, 211, 238, 0.6), transparent),
        radial-gradient(2px 2px at 260px 80px, #67e8f9, transparent),
        radial-gradient(1px 1px at 300px 30px, #94a3b8, transparent),
        radial-gradient(2px 2px at 340px 60px, rgba(34, 211, 238, 0.6), transparent),
        radial-gradient(1px 1px at 380px 90px, #67e8f9, transparent),
        radial-gradient(2px 2px at 420px 20px, #94a3b8, transparent),
        radial-gradient(1px 1px at 460px 50px, rgba(34, 211, 238, 0.6), transparent),
        radial-gradient(2px 2px at 500px 80px, #67e8f9, transparent),
        radial-gradient(1px 1px at 540px 30px, #94a3b8, transparent),
        radial-gradient(2px 2px at 580px 60px, rgba(34, 211, 238, 0.6), transparent),
        radial-gradient(1px 1px at 620px 90px, #67e8f9, transparent);
      background-repeat: repeat;
      background-size: 640px 100px;
      animation: twinkle2 6s ease-in-out infinite;
      pointer-events: none;
      z-index: 0;
    } */
  `;

// Inyectar estilos en el head del documento
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = auroraStyles;
  document.head.appendChild(styleElement);
}

/**
 * ========================================
 * EXPORTACIÓN DEL COMPONENTE DASHBOARD
 * ========================================
 * 
 * Se exporta el componente Dashboard para ser utilizado
 * en el sistema de rutas de GeoPlanner.
 */

export default Dashboard
