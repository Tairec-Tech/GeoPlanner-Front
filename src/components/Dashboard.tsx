import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/api'
import type { Post, AgendaItem, SavedEvent } from '../services/api'
import logo from '../assets/img/LogoMini.png'
import placeholder from '../assets/img/placeholder.png'

import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'


// Importar Leaflet dinámicamente
let L: any = null
if (typeof window !== 'undefined') {
  import('leaflet').then(leaflet => {
    L = leaflet.default;
  });
}

const Dashboard = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  
  // Estados
  const [currentView, setCurrentView] = useState<'map' | 'classic'>('map')
  const [currentMapStyle, setCurrentMapStyle] = useState('openstreetmap')
  const [currentTheme, setCurrentTheme] = useState('default')
  const [filterType, setFilterType] = useState('all')
  const [isMapLoading, setIsMapLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [userLocationMarker, setUserLocationMarker] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [eventMarkers, setEventMarkers] = useState<any[]>([])
  const [routingControl, setRoutingControl] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredEvents, setFilteredEvents] = useState<any[]>([])
  const [showCreateEventModal, setShowCreateEventModal] = useState(false)
  const [showAgendaModal, setShowAgendaModal] = useState(false)
  const [showSavedEventsModal, setShowSavedEventsModal] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'Social',
    date: '',
    time: '',
    maxAttendees: 10
  })
  const [newAgendaItem, setNewAgendaItem] = useState({
    title: '',
    description: '',
    date: '',
    location: ''
  })
  const [posts, setPosts] = useState<Post[]>([])
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([])
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([])
  const [showCalendarView, setShowCalendarView] = useState(false)
  const [agendaSearchTerm, setAgendaSearchTerm] = useState('')
  const [agendaFilter, setAgendaFilter] = useState('all') // all, upcoming, past, today
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)

  const [isLoadingData, setIsLoadingData] = useState(false)
  
  // Estados para creación de publicaciones
  const [showCreatePostModal, setShowCreatePostModal] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [routeType, setRouteType] = useState<'simple' | 'multiple'>('simple')
  const [selectedMarkers, setSelectedMarkers] = useState<any[]>([])
  const [locationDisplay, setLocationDisplay] = useState('No se ha seleccionado ninguna ubicación.')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [additionalTerms, setAdditionalTerms] = useState('')
  
  // Estados para nueva publicación
  const [newPost, setNewPost] = useState({
    text: '',
    type: 'Social',
    eventDate: '',
    privacy: 'publica',
    mediaFile: null as File | null
  })
  
  // Estados para funcionalidades del header
  const [addressSearchTerm, setAddressSearchTerm] = useState('')
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([])
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false)
  const [searchMarker, setSearchMarker] = useState<any>(null)
  
  // Estado para controlar dropdowns abiertos
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  
  // Configuración de mapas
  const mapStyles = {
    openstreetmap: {
      name: 'OpenStreetMap',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors'
    },
    satellite: {
      name: 'Vista Satelital',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '© Esri'
    },
    hybrid_esri: {
      name: 'Satélite con Calles (Esri)',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '© Esri',
    }
  }

  // Datos de ejemplo de eventos (vacío)
  const sampleEvents: any[] = []

  // Términos y condiciones predeterminados de GeoPlanner
  const DEFAULT_GEOPLANNER_TERMS = `TÉRMINOS Y CONDICIONES DE GEOPLANNER

1. Responsabilidad Exclusiva del Organizador:
   Usted es el único responsable de la legalidad, seguridad (permisos, control de multitudes, etc.) y contenido de su evento.

2. Deslinde de GeoPlanner:
   GeoPlanner es solo una plataforma tecnológica y no se hace responsable por ningún incidente, daño o consecuencia legal relacionada con el evento.

3. Prohibiciones Estrictas:
   Se prohíben terminantemente eventos con actividades ilegales, armas, sustancias ilícitas, violencia o discursos de odio.

4. Cooperación con Autoridades:
   Al publicar, confirma que su identidad fue verificada y acepta que su información puede ser compartida con las autoridades si se detecta alguna ilegalidad.

5. Verificación de Identidad:
   Usted declara que ha proporcionado información veraz y que su identidad ha sido verificada por la plataforma.

⚠️ Al publicar, declara que ha leído y aceptado estos términos en su totalidad.`

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
      headerBG: "linear-gradient(145deg, #1D2B64, #F8CDDA)",
      headerText: "#FFFFFF",
      bodyBG: "#fdeff2",
      sidebarBG: "linear-gradient(145deg, #1D2B64, #F8CDDA)",
      sidebarText: "#FFFFFF",
      cardBG: "#ffffff",
      cardText: "#1D2B64",
      btnPrimaryBG: "#1D2B64"
    },
    noche: {
      headerBG: "linear-gradient(145deg, #141E30, #243B55)",
      headerText: "white",
      bodyBG: "#0f172a",
      sidebarBG: "linear-gradient(145deg, #141E30, #243B55)",
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

  const centerMapOnAddress = (lat: number, lon: number, label: string) => {
    if (!mapInstanceRef.current) return
    
    mapInstanceRef.current.setView([lat, lon], 16, { animate: true })
    
    // Remover marcador anterior
    if (searchMarker) {
      mapInstanceRef.current.removeLayer(searchMarker)
    }
    
    // Crear nuevo marcador
    if (L) {
      const newMarker = L.marker([lat, lon], {
        icon: L.divIcon({
          html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="#007bff" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
          className: 'search-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -36]
        })
      }).addTo(mapInstanceRef.current).bindPopup(`<b>${label}</b>`).openPopup()
      
      setSearchMarker(newMarker)
    }
    
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

  // Maneja la apertura y cierre de los menús desplegables
  const handleDropdown = (dropdownName: string) => {
    console.log('handleDropdown llamado con:', dropdownName)
    setOpenDropdown(prev => {
      const newState = prev === dropdownName ? null : dropdownName
      console.log('Estado anterior:', prev, 'Nuevo estado:', newState)
      return newState
    })
  }

  const closeAllDropdowns = () => {
    setOpenDropdown(null)
  }

  // Funciones para perfil
  const handleProfile = () => {
    navigate('/perfil')
    closeAllDropdowns();
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    closeAllDropdowns();
  }

  // Función helper para cerrar dropdowns
  const closeDropdown = () => {
    setOpenDropdown(null)
  }

  // Cargar Leaflet dinámicamente
  const loadLeaflet = async () => {
    if (typeof window !== 'undefined' && !L) {
      try {
        const leafletModule = await import('leaflet')
        L = leafletModule.default
        console.log('Leaflet cargado exitosamente')
        return true
      } catch (error) {
        console.error('Error cargando Leaflet:', error)
        return false
      }
    }
    return !!L
  }

  // Crear ruta entre dos puntos
  const createRoute = (startPoint: [number, number], endPoint: [number, number]) => {
    if (!mapInstanceRef.current || !L) return

    try {
      // Limpiar rutas existentes
      clearRoutes()

      // Crear control de ruta usando L.Routing
      const routingControl = L.Routing.control({
        waypoints: [
          L.latLng(startPoint[0], startPoint[1]),
          L.latLng(endPoint[0], endPoint[1])
        ],
        routeWhileDragging: true,
        showAlternatives: false,
        fitSelectedRoutes: true,
        lineOptions: {
          styles: [
            { color: '#007BFF', opacity: 0.8, weight: 6 }
          ]
        }
      }).addTo(mapInstanceRef.current)

      // Guardar referencia del control de ruta
      setRoutingControl(routingControl)
      console.log('Ruta creada exitosamente')
    } catch (error) {
      console.error('Error creando ruta:', error)
    }
  }

  // Limpiar rutas
  const clearRoutes = () => {
    if (routingControl && mapInstanceRef.current) {
      mapInstanceRef.current.removeControl(routingControl)
      setRoutingControl(null)
    }
  }

  // Crear ruta desde la ubicación del usuario a un evento
  const routeToEvent = (eventLat: number, eventLng: number) => {
    if (userLocation) {
      createRoute([userLocation.lat, userLocation.lng], [eventLat, eventLng])
    } else {
      alert('No se puede crear la ruta. Ubicación del usuario no disponible.')
    }
  }

  // Crear icono personalizado para la ubicación del usuario
  const createUserLocationIcon = (zoomLevel: number) => {
    if (!L) return null
    
    const iconSize = Math.max(20, Math.min(50, zoomLevel * 3))
    return L.divIcon({
      html: `<img src="${logo}" style="width: ${iconSize}px; height: ${iconSize}px; border-radius: 50%; border: 3px solid #007BFF; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);" alt="Tu ubicación">`,
      className: 'user-location-marker',
      iconSize: [iconSize, iconSize],
      iconAnchor: [iconSize / 2, iconSize / 2]
    })
  }

  // Obtener ubicación del usuario
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
          addUserLocationToMap(location)
          console.log('Ubicación del usuario obtenida:', location)
        },
        (error) => {
          console.warn('No se pudo obtener la ubicación del usuario:', error)
          // Ubicación por defecto (Maracaibo, Venezuela)
          const defaultLocation = { lat: 10.654, lng: -71.612 }
          setUserLocation(defaultLocation)
          addUserLocationToMap(defaultLocation)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      )
    } else {
      console.warn('Geolocalización no soportada por este navegador')
      const defaultLocation = { lat: 10.654, lng: -71.612 }
      setUserLocation(defaultLocation)
      addUserLocationToMap(defaultLocation)
    }
  }

  // Agregar ubicación del usuario al mapa
  const addUserLocationToMap = (location: {lat: number, lng: number}) => {
    if (!mapInstanceRef.current || !L || !location) return

    // Remover marcador anterior si existe
    if (userLocationMarker) {
      mapInstanceRef.current.removeLayer(userLocationMarker)
    }

    const currentZoom = mapInstanceRef.current.getZoom()
    const icon = createUserLocationIcon(currentZoom)
    
    if (icon) {
      const marker = L.marker([location.lat, location.lng], { icon }).addTo(mapInstanceRef.current)
      marker.bindPopup('<b>Tu ubicación actual</b><br>¡Aquí estás tú!')
      setUserLocationMarker(marker)

      // Actualizar icono cuando cambie el zoom
      mapInstanceRef.current.on('zoomend', () => {
        if (marker) {
          const newZoom = mapInstanceRef.current.getZoom()
          const newIcon = createUserLocationIcon(newZoom)
          if (newIcon) {
            marker.setIcon(newIcon)
          }
        }
      })
    }
  }

  // Centrar mapa en ubicación del usuario
  const centerMapOnUser = () => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], mapInstanceRef.current.getZoom(), { animate: true })
    } else {
      alert('Ubicación de usuario no disponible.')
    }
  }

  // Crear icono para eventos
  const createEventIcon = (eventType: string) => {
    if (!L) return null
    
    const colors = {
      'Deporte': '#28a745',
      'Estudio': '#007bff',
      'Social': '#ffc107',
      'Cultural': '#dc3545',
      'Otro': '#6c757d'
    }
    
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
      ">${eventType.charAt(0)}</div>`,
      className: 'event-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    })
  }

  // Agregar eventos al mapa
  const addEventsToMap = (eventsToShow: any[] = []) => {
    if (!mapInstanceRef.current || !L) return

    // Limpiar marcadores existentes
    eventMarkers.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker)
    })

    const newMarkers: any[] = []

    // Usar eventos filtrados si no se proporcionan eventos específicos
    const eventsToDisplay = eventsToShow.length > 0 ? eventsToShow : filterEvents()

    eventsToDisplay.forEach(event => {
      const icon = createEventIcon(event.type)
      if (icon) {
        const marker = L.marker([event.lat, event.lng], { icon }).addTo(mapInstanceRef.current)
        
        // Crear contenido del popup
        const popupContent = `
          <div style="min-width: 200px;">
            <h6 style="margin: 0 0 8px 0; color: #333;">${event.title}</h6>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${event.description}</p>
            <div style="font-size: 11px; color: #888;">
              <div><strong>Organizador:</strong> ${event.organizer}</div>
              <div><strong>Fecha:</strong> ${event.date} a las ${event.time}</div>
              <div><strong>Asistentes:</strong> ${event.attendees}/${event.maxAttendees}</div>
              <div><strong>Tipo:</strong> ${event.type}</div>
            </div>
            <div style="margin-top: 8px;">
              <button class="btn btn-sm btn-primary" onclick="alert('Función de inscripción próximamente')">
                Inscribirse
              </button>
              <button class="btn btn-sm btn-outline-secondary" onclick="alert('Función de guardar próximamente')">
                ${event.saved ? '❤️' : '🤍'} Guardar
              </button>
              <button class="btn btn-sm btn-success" onclick="window.routeToEvent(${event.lat}, ${event.lng})">
                🗺️ Ruta
              </button>
            </div>
          </div>
        `
        
        marker.bindPopup(popupContent)
        newMarkers.push(marker)
      }
    })

    setEventMarkers(newMarkers)
  }

  // Filtrar eventos por búsqueda y tipo
  const filterEvents = () => {
    let filtered = sampleEvents

    // Filtrar por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(event => event.type === filterType)
    }

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(term) ||
        event.description.toLowerCase().includes(term) ||
        event.organizer.toLowerCase().includes(term) ||
        event.type.toLowerCase().includes(term)
      )
    }

    setFilteredEvents(filtered)
    return filtered
  }

  // Manejar búsqueda
  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  // Función para actualizar tema de modales
  const updateModalTheme = () => {
    const modals = document.querySelectorAll('.modal-box')
    modals.forEach(modal => {
      if (modal instanceof HTMLElement) {
        modal.setAttribute('data-theme', currentTheme)
      }
    })
  }

  // Manejar creación de eventos
  const handleCreateEvent = async () => {
    if (!userLocation) {
      alert('No se puede crear el evento. Ubicación del usuario no disponible.')
      return
    }

    if (!newEvent.title || !newEvent.description || !newEvent.date || !newEvent.time) {
      alert('Por favor completa todos los campos obligatorios.')
      return
    }

    try {
      // Crear publicación en el backend
      const postData = {
        texto: `${newEvent.title}\n\n${newEvent.description}\n\nFecha: ${newEvent.date} a las ${newEvent.time}\nMáximo asistentes: ${newEvent.maxAttendees}`,
        tipo: newEvent.type,
        fecha_evento: new Date(`${newEvent.date}T${newEvent.time}`).toISOString(),
        privacidad: 'publica'
      }

      const newPost = await apiService.createPost(postData)
      
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
      
      // Actualizar mapa
      addEventsToMap()
      
      console.log('Evento creado:', newPost)
    } catch (error) {
      console.error('Error creando evento:', error)
      alert('Error al crear el evento. Intenta de nuevo.')
    }
  }

  // Manejar cambios en el formulario de nuevo evento
  const handleNewEventChange = (field: string, value: string | number) => {
    setNewEvent(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Funciones para manejar la agenda
  const handleNewAgendaItemChange = (field: string, value: string) => {
    setNewAgendaItem(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCreateAgendaItem = async () => {
    if (!newAgendaItem.title || !newAgendaItem.date) {
      alert('El título y la fecha son obligatorios')
      return
    }

    try {
      // Crear actividad en el backend
      const agendaItem = await apiService.createAgendaItem({
        titulo: newAgendaItem.title,
        descripcion: newAgendaItem.description,
        fecha_actividad: newAgendaItem.date
      })

      // Actualizar estado
      setAgendaItems(prev => [...prev, agendaItem])
      
      // Limpiar formulario
      setNewAgendaItem({
        title: '',
        description: '',
        date: '',
        location: ''
      })

      alert('Actividad agregada a tu agenda')
    } catch (error) {
      console.error('Error creando actividad:', error)
      alert('Error al crear la actividad')
    }
  }

  const handleDeleteAgendaItem = async (itemId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta actividad?')) {
      try {
        await apiService.deleteAgendaItem(itemId)
        // Actualizar estado
        setAgendaItems(prev => prev.filter(item => item.id !== itemId))
      } catch (error) {
        console.error('Error eliminando actividad:', error)
        alert('Error al eliminar la actividad')
      }
    }
  }

  const handleSaveEvent = async (eventId: string) => {
    try {
      const isCurrentlySaved = savedEvents.some(event => event.id_publicacion === eventId)
      
      if (isCurrentlySaved) {
        // Remover de guardados
        await apiService.unsaveEvent(eventId)
        setSavedEvents(prev => prev.filter(event => event.id_publicacion !== eventId))
      } else {
        // Agregar a guardados
        const savedEvent = await apiService.saveEvent(eventId)
        setSavedEvents(prev => [...prev, savedEvent])
      }
    } catch (error) {
      console.error('Error guardando/quitando evento:', error)
      alert('Error al guardar/quitar el evento')
    }
  }

  // Funciones para likes
  const handleLike = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId)
      if (!post) return

      if (post.likers.includes(user?.id || '')) {
        // Quitar like
        await apiService.unlikePost(postId)
        console.log('✅ Like removido')
      } else {
        // Dar like
        await apiService.likePost(postId)
        console.log('✅ Like agregado')
      }
      
      // Recargar posts para actualizar likes
      await loadRealData()
    } catch (error) {
      console.error('❌ Error manejando like:', error)
    }
  }

  // Funciones para comentarios
  const [commentTexts, setCommentTexts] = useState<{[key: string]: string}>({})
  const [showComments, setShowComments] = useState<{[key: string]: boolean}>({})
  const [replyToComment, setReplyToComment] = useState<string | null>(null)
  const [userNotifications, setUserNotifications] = useState<import('../services/api').Notification[]>([])
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  const handleAddComment = async (postId: string, isReply = false) => {
    let texto: string
    if (isReply && replyToComment) {
      texto = commentTexts[`${postId}-reply-${replyToComment}`]?.trim()
    } else {
      texto = commentTexts[postId]?.trim()
    }
    
    if (!texto) return

    try {
      const newComment = await apiService.addComment(postId, texto, isReply && replyToComment ? replyToComment : undefined)
      console.log('✅ Comentario agregado:', newComment)
      
      // Limpiar input y recargar posts
      if (isReply && replyToComment) {
        setCommentTexts(prev => ({ ...prev, [`${postId}-reply-${replyToComment}`]: '' }))
      } else {
        setCommentTexts(prev => ({ ...prev, [postId]: '' }))
      }
      setReplyToComment(null)
      await loadRealData()
    } catch (error) {
      console.error('❌ Error agregando comentario:', error)
    }
  }

  const handleReplyToComment = (commentId: string) => {
    setReplyToComment(commentId)
  }

  const cancelReply = () => {
    setReplyToComment(null)
  }

  // Función para renderizar texto con menciones como links
  const renderTextWithMentions = (text: string) => {
    if (!text) return ''
    
    // Buscar menciones en el texto (@username)
    const mentionRegex = /@(\w+)/g
    const parts = text.split(mentionRegex)
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // Es un username (índice impar)
        return (
          <a
            key={index}
            href={`/perfil/${part}`}
            className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
            onClick={(e) => {
              e.preventDefault()
              // Aquí puedes navegar al perfil del usuario
              console.log(`Navegar al perfil de @${part}`)
            }}
          >
            @{part}
          </a>
        )
      }
      return part
    })
  }

  const handleDeleteComment = async (commentId: string, authorId: string) => {
    try {
      await apiService.deleteComment(commentId, authorId)
      console.log('✅ Comentario eliminado')
      await loadRealData()
    } catch (error) {
      console.error('❌ Error eliminando comentario:', error)
    }
  }

  const toggleComments = (postId: string) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }))
  }

  // Cargar datos guardados al inicializar
  const loadSavedData = async () => {
    try {
      if (user) {
        // Cargar agenda desde el backend
        const agendaData = await apiService.getAgenda()
        setAgendaItems(agendaData)

        // Cargar eventos guardados desde el backend
        const savedEventsData = await apiService.getSavedEventsWithDetails()
        setSavedEvents(savedEventsData)
      }
    } catch (error) {
      console.error('Error cargando datos guardados:', error)
    }
  }

  // Funciones avanzadas para la agenda
  const getFilteredAgendaItems = () => {
    let filtered = agendaItems

    // Filtrar por búsqueda
    if (agendaSearchTerm) {
      filtered = filtered.filter(item => 
        item.titulo.toLowerCase().includes(agendaSearchTerm.toLowerCase()) ||
        (item.descripcion && item.descripcion.toLowerCase().includes(agendaSearchTerm.toLowerCase()))
      )
    }

    // Filtrar por tipo
    const now = new Date()
    switch (agendaFilter) {
      case 'upcoming':
        filtered = filtered.filter(item => new Date(item.fecha_actividad) > now)
        break
      case 'past':
        filtered = filtered.filter(item => new Date(item.fecha_actividad) < now)
        break
      case 'today':
        const today = new Date()
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
        filtered = filtered.filter(item => {
          const itemDate = new Date(item.fecha_actividad)
          return itemDate >= todayStart && itemDate < todayEnd
        })
        break
    }

    return filtered.sort((a, b) => new Date(a.fecha_actividad).getTime() - new Date(b.fecha_actividad).getTime())
  }

  // Sistema de notificaciones
  const checkUpcomingActivities = () => {
    const now = new Date()
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

    const upcomingNotifications = agendaItems.filter(item => {
      const itemDate = new Date(item.fecha_actividad)
      return itemDate >= now && itemDate <= tomorrow
    }).map(item => ({
      id: `notif_${item.id}`,
      type: 'activity',
      title: `Actividad próxima: ${item.titulo}`,
      message: `Tu actividad "${item.titulo}" está programada para ${new Date(item.fecha_actividad).toLocaleString()}`,
      time: new Date(item.fecha_actividad),
      read: false
    }))

    setNotifications(upcomingNotifications)
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
      
      // Cargar agenda
      const agendaData = await apiService.getAgenda()
      
      // Cargar notificaciones
      await loadNotifications()
      
      // Limpiar eventos del feed clásico
      setEvents([])
      setFilteredEvents([])
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
    setEvents([])
    setFilteredEvents([])
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
          coords: `${marker.getLatLng().lat},${marker.getLatLng().lng}`,
          label: `Punto ${i + 1}`
        })),
        terms: {
          geoplanner: DEFAULT_GEOPLANNER_TERMS,
          additional: additionalTerms
        }
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
    let actionButton = null
    
    if (isOwner) {
      if (eventDate > now) {
        actionButton = <button className="btn btn-sm btn-warning">Ver Inscritos</button>
      } else {
        actionButton = <button className="btn btn-sm btn-success">Verificar Asistentes</button>
      }
    } else {
      actionButton = <button className="btn btn-sm btn-primary">Inscribirse</button>
    }

    return (
      <div key={post.id} className="post card shadow-sm mb-4 event-card" style={{
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
              <strong>{post.nombre_autor}</strong>
              <div className="text-sm text-gray-500">@{post.username_autor}</div>
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
          <div className="map-container mb-3 h-48" id={`map-${post.id}`}>
            {/* Aquí se renderizará el mapa */}
          </div>
          
          {/* Lista de rutas si hay múltiples */}
          {post.rutas && post.rutas.length > 1 && (
            <ol className="list-group list-group-flush list-group-numbered mb-3 text-sm">
              {post.rutas.map((ruta: any, index: number) => (
                <li key={index} className="list-group-item">{ruta.label}</li>
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
            <button className="btn btn-sm btn-outline-info">
              📜 Ver Términos
            </button>
            {actionButton}
          </div>

          {/* Sección de comentarios */}
          {showComments[post.id] && (
            <div className="comentarios mt-3 p-3 bg-gray-50 rounded">
              <div className="comentarios-list mb-3">
                {post.comentarios && post.comentarios.length > 0 ? (
                  post.comentarios.map((comentario) => (
                    <div key={comentario.id} className="mb-3">
                      {/* Comentario principal */}
                      <div className="flex items-start gap-2 p-2 bg-white rounded">
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
                            <div key={respuesta.id} className="flex items-start gap-2 p-2 bg-gray-100 rounded">
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
                        <div className="ml-6 mt-2 p-2 bg-blue-50 rounded">
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              className="input input-sm flex-1"
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
                  className="input input-sm flex-1"
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
            const latlngs = rutas.map((ruta: any) => ruta.coords.split(',').map(Number))
            const postMap = L.map(mapElement, {
              zoomControl: false,
              scrollWheelZoom: false
            }).setView(latlngs[0], 13)

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
              L.marker(latlng, { icon: eventIcon }).addTo(postMap)
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
                const waypoints = latlngs.map(latlng => L.latLng(latlng[0], latlng[1]))
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
              postMap.setView(latlngs[0], 15)
            }
          }
        }, 100)
      } catch (error) {
        console.error('Error renderizando mapa de publicación:', error)
      }
    }
    
    initPostMap()
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
      }

      // Aplicar background según el tema
      if (themeName === 'noche') {
        // Para tema noche, usar el color del tema
        if (mainContainer && mainContainer instanceof HTMLElement) {
          mainContainer.style.background = theme.bodyBG
        }
        if (contentArea && contentArea instanceof HTMLElement) {
          contentArea.style.background = theme.bodyBG
        }
        
        // Aplicar color blanco hueso SOLO al título GeoPlanner
        const geoPlannerTitle = document.querySelector('header strong')
        if (geoPlannerTitle && geoPlannerTitle instanceof HTMLElement) {
          geoPlannerTitle.style.color = '#f5f5dc' // Blanco hueso para tema noche
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
      } else {
        // Para otros temas, mantener fondo blanco
        if (mainContainer && mainContainer instanceof HTMLElement) {
          mainContainer.style.background = '#ffffff'
        }
        if (contentArea && contentArea instanceof HTMLElement) {
          contentArea.style.background = '#ffffff'
        }
        
        // Restaurar color del título GeoPlanner para otros temas
        const geoPlannerTitle = document.querySelector('header strong')
        if (geoPlannerTitle && geoPlannerTitle instanceof HTMLElement) {
          geoPlannerTitle.style.color = '' // Restaurar color por defecto
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
      }

      if (sidebar && sidebar instanceof HTMLElement) {
        sidebar.style.background = theme.sidebarBG
        sidebar.style.color = theme.sidebarText
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
          document.documentElement.setAttribute('data-theme', 'night')
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
    }
    
    if (savedMapStyle) setCurrentMapStyle(savedMapStyle)
  }

  // Efectos
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initData()
      // Hacer la función de ruta disponible globalmente para los popups
      ;(window as any).routeToEvent = routeToEvent
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
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Lógica consolidada de inicialización y limpieza del mapa
  useEffect(() => {
    // Solo se ejecuta si la vista actual es 'map' y el contenedor del mapa está en el DOM
    if (currentView === 'map' && mapContainerRef.current) {
      setIsMapLoading(true)

      // Si ya existe una instancia de mapa (de una vista anterior), la eliminamos primero
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      // Cargar Leaflet si no está cargado
      const setupMap = async () => {
        const leafletLoaded = await loadLeaflet()
        if (leafletLoaded && mapContainerRef.current) {
          // Inicializamos el mapa en el contenedor actual
          mapInstanceRef.current = L.map(mapContainerRef.current).setView([10.654, -71.612], 12)

          // Aplicamos el estilo de mapa actual
          const style = mapStyles[currentMapStyle as keyof typeof mapStyles]
          L.tileLayer(style.url, { attribution: style.attribution }).addTo(mapInstanceRef.current)
          
          // Obtenemos la ubicación del usuario y cargamos eventos
          getUserLocation()
          loadEvents()
          // No agregar eventos al mapa (feed clásico vacío)

          setIsMapLoading(false)
          console.log('Mapa inicializado correctamente')
        }
      }

      setupMap()

      // La función de limpieza se ejecutará cuando el componente se desmonte o
      // cuando currentView cambie (es decir, al pasar al feed clásico)
      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
          console.log('Mapa destruido y limpiado')
        }
      }
    }
  }, [currentView]) // Este efecto depende SOLAMENTE de 'currentView'

  // useEffect simplificado para actualizar los marcadores cuando cambian los filtros
  useEffect(() => {
    if (currentView === 'map' && mapInstanceRef.current && !isMapLoading) {
      const filtered = filterEvents()
      addEventsToMap(filtered)
    }
  }, [filterType, searchTerm]) // Se ejecuta cuando cambian los filtros

  // Cargar tema inicial y aplicar estilos
  useEffect(() => {
    // El tema se carga desde el backend en initData()
    // No necesitamos cargar desde localStorage
  }, [])

  // Aplicar tema cuando cambie currentTheme
  useEffect(() => {
    if (currentTheme) {
      // Aplicar tema con delay adicional para asegurar que el DOM esté listo
      setTimeout(() => {
        applyTheme(currentTheme)
      }, 200)
      
      // Actualizar data-theme del document.documentElement según el tema seleccionado
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
  }, [currentTheme])

  // Actualizar tema de modales cuando se abran
  useEffect(() => {
    if (showAgendaModal || showCreateEventModal || showSavedEventsModal || showCreatePostModal || showLocationModal) {
      setTimeout(() => {
        updateModalTheme()
      }, 100)
    }
  }, [showAgendaModal, showCreateEventModal, showSavedEventsModal, showCreatePostModal, showLocationModal, currentTheme])

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

  return (
    <div className="min-h-screen bg-white main-container">
      {/* Header */}
      <header className="flex justify-between items-center text-primary-content p-4 shadow-lg bg-primary">
        <a href="#" className="flex items-center gap-2 text-primary-content no-underline">
          <img src={logo} alt="Logo" className="w-9 h-9" />
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
            className="btn btn-outline btn-sm"
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
                className="btn btn-ghost btn-circle"
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
                className="btn btn-ghost btn-circle"
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
                className="btn btn-ghost btn-circle"
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
                {notifications.length === 0 ? (
                  <li><a className="text-gray-500">No hay notificaciones nuevas</a></li>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <li key={notification.id}>
                      <a onClick={() => {
                        // Marcar como leída y abrir agenda si es una notificación de actividad
                        if (notification.type === 'activity') {
                          setShowAgendaModal(true)
                        }
                      }}>
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                          📅
                        </div>
                        <div className="flex-1">
                          <div><strong>{notification.title}</strong></div>
                          <small className="text-gray-500">{notification.message}</small>
                        </div>
                      </a>
                    </li>
                  ))
                )}
                {notifications.length > 5 && (
                  <li><a className="text-primary">Ver todas las notificaciones ({notifications.length})</a></li>
                )}
              </ul>
            </div>

            {/* Perfil - MÁS ANCHO */}
            <div className={`dropdown dropdown-end ${openDropdown === 'perfil' ? 'dropdown-open' : ''}`}>
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle"
                title="Perfil"
                onClick={() => handleDropdown('perfil')}
              >
                <img 
                  className="w-8 h-8 rounded-full object-cover border border-gray-300" 
                  src={user?.foto_perfil_url || '/src/assets/img/placeholder.png'} 
                  alt="Foto de perfil"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/src/assets/img/placeholder.png'
                  }}
                />
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
      <div className="flex h-screen bg-white">
        {/* Sidebar */}
        <div className="w-64 bg-primary text-primary-content sidebar">
          <div className="p-4">
            <ul className="menu bg-transparent text-primary-content">
                              <li><a className="text-primary-content hover:bg-primary-focus cursor-pointer" onClick={() => setShowAgendaModal(true)}>📅 Mi Agenda</a></li>
                <li><a className="text-primary-content hover:bg-primary-focus cursor-pointer">🎟️ Mis Inscripciones</a></li>
                <li><a className="text-primary-content hover:bg-primary-focus cursor-pointer" onClick={() => setShowSavedEventsModal(true)}>⭐ Eventos Guardados</a></li>
              <li><a className="text-primary-content hover:bg-primary-focus">👨‍👩‍👧‍👦 Grupos</a></li>
            </ul>
          </div>
          <div className="p-4 border-t border-primary-focus">
            <ul className="menu bg-transparent text-primary-content">
              <li><a 
                className={filterType === 'all' ? 'bg-primary-focus text-primary-content' : 'text-primary-content hover:bg-primary-focus'}
                onClick={() => setFilterType('all')}
              >
                Todos los tipos
              </a></li>
              <li><a 
                className={filterType === 'Deporte' ? 'bg-primary-focus text-primary-content' : 'text-primary-content hover:bg-primary-focus'}
                onClick={() => setFilterType('Deporte')}
              >
                Deporte
              </a></li>
              <li><a 
                className={filterType === 'Estudio' ? 'bg-primary-focus text-primary-content' : 'text-primary-content hover:bg-primary-focus'}
                onClick={() => setFilterType('Estudio')}
              >
                Estudio
              </a></li>
              <li><a 
                className={filterType === 'Social' ? 'bg-primary-focus text-primary-content' : 'text-primary-content hover:bg-primary-focus'}
                onClick={() => setFilterType('Social')}
              >
                Social
              </a></li>
              <li><a 
                className={filterType === 'Cultural' ? 'bg-primary-focus text-primary-content' : 'text-primary-content hover:bg-primary-focus'}
                onClick={() => setFilterType('Cultural')}
              >
                Cultural
              </a></li>
              <li><a 
                className={filterType === 'Otro' ? 'bg-primary-focus text-primary-content' : 'text-primary-content hover:bg-primary-focus'}
                onClick={() => setFilterType('Otro')}
              >
                Otro
              </a></li>
            </ul>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden bg-white content-area">
          {currentView === 'map' ? (
            <div className="relative h-full w-full">
              <div 
                id="feed-map" 
                ref={mapContainerRef} 
                className="h-full w-full min-h-[500px]"
                style={{ 
                  height: '100%', 
                  width: '100%',
                  minHeight: '500px',
                  position: 'relative'
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
            <div className="h-full overflow-y-auto">
              <div className="p-4">
                {/* Widget de crear publicación */}
                <div className="create-post-widget mb-6 flex justify-center">
                  <div className="w-1/2 p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <img 
                        src={placeholder} 
                        className="w-10 h-10 rounded-full"
                        alt="user"
                      />
                      <div 
                        className="flex-1 p-3 bg-white border rounded-lg cursor-pointer hover:bg-gray-50"
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
                    className="btn btn-outline btn-sm mt-2"
                    onClick={() => setShowTerms(!showTerms)}
                  >
                    {showTerms ? '👁️ Ocultar términos' : '👁️ Ver términos completos'}
                  </button>
                </div>

                {/* Términos colapsables */}
                {showTerms && (
                  <div className="collapse-content bg-gray-50 p-3 rounded-lg mb-3 max-h-40 overflow-y-auto">
                    <h6 className="font-bold text-primary mb-2">Términos y Condiciones de GeoPlanner</h6>
                    <div className="text-sm space-y-2">
                      <p><strong>1. Responsabilidad Exclusiva del Organizador:</strong> Usted es el único responsable de la legalidad, seguridad (permisos, control de multitudes, etc.) y contenido de su evento.</p>
                      <p><strong>2. Deslinde de GeoPlanner:</strong> GeoPlanner es solo una plataforma tecnológica y no se hace responsable por ningún incidente, daño o consecuencia legal relacionada con el evento.</p>
                      <p><strong>3. Prohibiciones Estrictas:</strong> Se prohíben terminantemente eventos con actividades ilegales, armas, sustancias ilícitas, violencia o discursos de odio.</p>
                      <p><strong>4. Cooperación con Autoridades:</strong> Al publicar, confirma que su identidad fue verificada y acepta que su información puede ser compartida con las autoridades si se detecta alguna ilegalidad.</p>
                      <p><strong>5. Verificación de Identidad:</strong> Usted declara que ha proporcionado información veraz y que su identidad ha sido verificada por la plataforma.</p>
                      <p className="text-warning font-bold">⚠️ Al publicar, declara que ha leído y aceptado estos términos en su totalidad.</p>
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
    </div>
  )
}

export default Dashboard
