import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/api'
import UserPosts from './UserPosts'
import './ProfilePage.css'
import placeholder from '../assets/img/placeholder.png'

interface ProfileStats {
  totalPosts: number
  totalLikes: number
  totalComments: number
  savedEvents: number
  agendaItems: number
}

interface Friend {
  id: string
  nombre: string
  apellido: string
  nombre_usuario: string
  foto_perfil_url?: string
  verificado: boolean
  fecha_amistad: string
}

interface BlockedUser {
  id: string
  nombre: string
  apellido: string
  nombre_usuario: string
  foto_perfil_url?: string
  verificado: boolean
  fecha_bloqueo?: string
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<ProfileStats>({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    savedEvents: 0,
    agendaItems: 0
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showImageCropper, setShowImageCropper] = useState(false)
  const [friends, setFriends] = useState<Friend[]>([])
  const [loadingFriends, setLoadingFriends] = useState(false)
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [loadingBlocked, setLoadingBlocked] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'friends' | 'privacy'>('profile')
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  
  // Estados para edición
  const [editData, setEditData] = useState({
    biografia: user?.biografia || '',
    latitud: user?.latitud || 0,
    longitud: user?.longitud || 0,
    ciudad: user?.ciudad || '',
    pais: user?.pais || '',
    tema_preferido: user?.tema_preferido || 'default'
  })

  // Temas disponibles
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

  // Obtener el tema actual del usuario
  const getCurrentTheme = () => {
    const themeName = user?.tema_preferido || 'default'
    return temas[themeName as keyof typeof temas] || temas.default
  }

  const currentTheme = getCurrentTheme()

  useEffect(() => {
    if (user) {
      loadUserStats()
      loadFriends()
      loadBlockedUsers()
    }
  }, [user])

  const loadUserStats = async () => {
    try {
      const [posts, savedEvents, agenda] = await Promise.all([
        apiService.getPosts(),
        apiService.getSavedEvents(),
        apiService.getAgenda()
      ])

      const userPosts = posts.filter(post => post.id_autor === user?.id)
      const totalLikes = userPosts.reduce((sum, post) => sum + post.likes, 0)
      const totalComments = userPosts.reduce((sum, post) => sum + (post.comentarios?.length || 0), 0)

      setStats({
        totalPosts: userPosts.length,
        totalLikes,
        totalComments,
        savedEvents: savedEvents.length,
        agendaItems: agenda.length
      })
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
    }
  }

  const loadFriends = async () => {
    if (!user) return
    
    try {
      setLoadingFriends(true)
      const friendsData = await apiService.getUserFriends(user.id)
      setFriends(friendsData)
    } catch (error) {
      console.error('Error cargando amigos:', error)
    } finally {
      setLoadingFriends(false)
    }
  }

  const loadBlockedUsers = async () => {
    if (!user) return

    try {
      setLoadingBlocked(true)
      const blockedData = await apiService.getBlockedUsers()
      setBlockedUsers(blockedData)
    } catch (error) {
      console.error('Error cargando usuarios bloqueados:', error)
    } finally {
      setLoadingBlocked(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
        setShowImageCropper(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageCrop = async () => {
    if (!selectedFile) return

    try {
      setIsLoading(true)
      const response = await apiService.uploadProfilePhoto(selectedFile)
      await updateUser(response.usuario)
      setSelectedFile(null)
      setPreviewUrl(null)
      setShowImageCropper(false)
    } catch (error) {
      console.error('Error subiendo foto:', error)
      alert('Error al subir la foto de perfil')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true)
      await updateUser(editData)
      setIsEditing(false)
    } catch (error) {
      console.error('Error guardando perfil:', error)
      alert('Error al guardar el perfil')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditData({
      biografia: user?.biografia || '',
      latitud: user?.latitud || 0,
      longitud: user?.longitud || 0,
      ciudad: user?.ciudad || '',
      pais: user?.pais || '',
      tema_preferido: user?.tema_preferido || 'default'
    })
    setIsEditing(false)
    
    // Limpiar mapa
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
      markerRef.current = null
      setMapLoaded(false)
    }
  }

  const handleStartEdit = () => {
    setIsEditing(true)
    setActiveTab('profile') // Cambiar a la pestaña de perfil
  }

  const initializeMap = async () => {
    if (!mapRef.current || mapLoaded) return

    try {
      // Usar Leaflet desde la variable global
      const L = (window as any).L
      if (!L) {
        console.error('Leaflet no está disponible')
        return
      }
      
      // Coordenadas iniciales (usar las del usuario o Maracaibo por defecto)
      const latInicial = editData.latitud || 10.654
      const lonInicial = editData.longitud || -71.612

      // Inicializar mapa
      const map = L.map(mapRef.current).setView([latInicial, lonInicial], 13)
      mapInstanceRef.current = map

      // Capa base OSM
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map)

      // Icono personalizado
      const geoPlannerIcon = L.icon({
        iconUrl: '/src/assets/img/LogoMini.png',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      })

      // Marcador arrastrable
      const marker = L.marker([latInicial, lonInicial], {
        draggable: true,
        icon: geoPlannerIcon
      }).addTo(map)
      markerRef.current = marker

      // Función para actualizar ubicación
      const actualizarUbicacion = async (lat: number, lon: number) => {
        setEditData(prev => ({
          ...prev,
          latitud: lat,
          longitud: lon
        }))

        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
          const data = await response.json()
          
          const ciudad = data.address.city || data.address.town || data.address.village || data.address.hamlet || data.address.county || ''
          const pais = data.address.country || ''
          
          setEditData(prev => ({
            ...prev,
            ciudad,
            pais
          }))
        } catch (error) {
          console.error('Error obteniendo ubicación:', error)
        }
      }

      // Eventos del marcador
      marker.on('moveend', (e: any) => {
        const { lat, lng } = e.target.getLatLng()
        actualizarUbicacion(lat, lng)
      })

      // Evento de clic en el mapa
      map.on('click', (e: any) => {
        marker.setLatLng(e.latlng)
        actualizarUbicacion(e.latlng.lat, e.latlng.lng)
      })

      // Geolocalización del usuario
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLat = position.coords.latitude
            const userLon = position.coords.longitude

            map.setView([userLat, userLon], 13)
            marker.setLatLng([userLat, userLon])
            actualizarUbicacion(userLat, userLon)
          },
          (error) => {
            console.warn("Geolocalización rechazada o no disponible, usando ubicación por defecto.")
          }
        )
      }

      setMapLoaded(true)
    } catch (error) {
      console.error('Error cargando el mapa:', error)
    }
  }

  // Inicializar mapa cuando se entra en modo edición
  useEffect(() => {
    if (isEditing && activeTab === 'profile') {
      setTimeout(() => {
        initializeMap()
      }, 100)
    }
  }, [isEditing, activeTab])

  const handleRemoveFriend = async (friendId: string) => {
    if (!user) return
    
    try {
      await apiService.removeFriendship(user.id, friendId)
      loadFriends() // Recargar la lista de amigos
    } catch (error) {
      console.error('Error eliminando amigo:', error)
    }
  }

  const handleUnblockUser = async (blockedUserId: string) => {
    if (!user) return

    try {
      await apiService.unblockUser(user.id, blockedUserId)
      loadBlockedUsers() // Recargar la lista de usuarios bloqueados
    } catch (error) {
      console.error('Error desbloqueando usuario:', error)
    }
  }

  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="profile-container"
      style={{ 
        background: currentTheme.bodyBG,
        color: currentTheme.cardText
      }}
    >
      {/* Modal para recortar imagen */}
      {showImageCropper && (
        <div className="image-cropper-modal">
          <div className="cropper-content">
            <h3>Recortar imagen de perfil</h3>
            <div className="image-preview">
              <img src={previewUrl || ''} alt="Vista previa" />
            </div>
            <div className="cropper-actions">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowImageCropper(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleImageCrop}
                disabled={isLoading}
              >
                {isLoading ? 'Subiendo...' : 'Aplicar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header del perfil */}
      <div 
        className="profile-header"
        style={{ 
          background: currentTheme.cardBG,
          color: currentTheme.cardText
        }}
      >
        <div 
          className="profile-cover"
          style={{ background: currentTheme.headerBG }}
        >
          <div className="profile-avatar-container">
            {user.foto_perfil_url ? (
              <img 
                src={user.foto_perfil_url} 
                alt="Foto de perfil" 
                className="profile-avatar"
              />
                          ) : (
                <div 
                  className="profile-avatar-placeholder"
                  style={{ background: currentTheme.headerBG }}
                >
                  {getInitials(user.nombre, user.apellido)}
                </div>
              )}
            <div className="avatar-upload">
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <label 
                htmlFor="avatar-upload" 
                className="upload-btn"
                style={{ background: currentTheme.btnPrimaryBG }}
              >
                <i className="bi bi-camera"></i>
              </label>
            </div>
          </div>
        </div>
        
        <div className="profile-info">
          <div className="profile-name-section">
            <h1 
              className="profile-name"
              style={{ color: currentTheme.cardText }}
            >
              {isEditing ? (
                <div className="name-edit">
                  <input
                    type="text"
                    value={editData.nombre}
                    onChange={(e) => setEditData({...editData, nombre: e.target.value})}
                    className="form-control"
                    placeholder="Nombre"
                  />
                  <input
                    type="text"
                    value={editData.apellido}
                    onChange={(e) => setEditData({...editData, apellido: e.target.value})}
                    className="form-control"
                    placeholder="Apellido"
                  />
                </div>
              ) : (
                `${user.nombre} ${user.apellido}`
              )}
            </h1>
            <p className="profile-username">@{user.nombre_usuario}</p>
            {user.fecha_nacimiento && (
              <p className="profile-birthdate">
                <i 
                  className="bi bi-calendar"
                  style={{ color: currentTheme.btnPrimaryBG }}
                ></i>
                {formatDate(user.fecha_nacimiento)}
              </p>
            )}
          </div>

          <div className="profile-actions">
            {isEditing ? (
              <div className="edit-actions">
                <button 
                  className="btn btn-success" 
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                >
                  {isLoading ? 'Guardando...' : 'Guardar'}
                </button>
                <button 
                  className="btn btn-outline-secondary" 
                  onClick={handleCancelEdit}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="action-buttons">
                <button 
                  className="btn btn-primary" 
                  onClick={handleStartEdit}
                  style={{ background: currentTheme.btnPrimaryBG }}
                >
                  <i className="bi bi-pencil"></i>
                  Editar Perfil
                </button>
                <button 
                  className="btn btn-outline-primary" 
                  onClick={() => navigate('/dashboard')}
                >
                  <i className="bi bi-arrow-left"></i>
                  Volver al Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="profile-stats">
        <div 
          className="stat-card"
          style={{ 
            background: currentTheme.cardBG,
            color: currentTheme.cardText
          }}
        >
          <div 
            className="stat-icon"
            style={{ background: currentTheme.headerBG }}
          >
            <i className="bi bi-file-text"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalPosts}</h3>
            <p>Publicaciones</p>
          </div>
        </div>
        
        <div 
          className="stat-card"
          style={{ 
            background: currentTheme.cardBG,
            color: currentTheme.cardText
          }}
        >
          <div 
            className="stat-icon"
            style={{ background: currentTheme.headerBG }}
          >
            <i className="bi bi-heart"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalLikes}</h3>
            <p>Me gusta</p>
          </div>
        </div>
        
        <div 
          className="stat-card"
          style={{ 
            background: currentTheme.cardBG,
            color: currentTheme.cardText
          }}
        >
          <div 
            className="stat-icon"
            style={{ background: currentTheme.headerBG }}
          >
            <i className="bi bi-chat"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalComments}</h3>
            <p>Comentarios</p>
          </div>
        </div>
        
        <div 
          className="stat-card"
          style={{ 
            background: currentTheme.cardBG,
            color: currentTheme.cardText
          }}
        >
          <div 
            className="stat-icon"
            style={{ background: currentTheme.headerBG }}
          >
            <i className="bi bi-bookmark"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.savedEvents}</h3>
            <p>Eventos guardados</p>
          </div>
        </div>
        
        <div 
          className="stat-card"
          style={{ 
            background: currentTheme.cardBG,
            color: currentTheme.cardText
          }}
        >
          <div 
            className="stat-icon"
            style={{ background: currentTheme.headerBG }}
          >
            <i className="bi bi-calendar-event"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.agendaItems}</h3>
            <p>Actividades</p>
          </div>
        </div>
      </div>

      {/* Sistema de Pestañas */}
      <div className="profile-section">
        <div className="tabs tabs-boxed mb-6" style={{ background: currentTheme.cardBG }}>
          <button 
            className={`tab ${activeTab === 'profile' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('profile')}
            style={{ 
              background: activeTab === 'profile' ? currentTheme.btnPrimaryBG : 'transparent',
              color: activeTab === 'profile' ? 'white' : currentTheme.cardText
            }}
          >
            📝 Perfil
          </button>
          <button 
            className={`tab ${activeTab === 'friends' ? 'tab-active' : ''}`}
            onClick={() => !isEditing && setActiveTab('friends')}
            disabled={isEditing}
            style={{ 
              background: activeTab === 'friends' ? currentTheme.btnPrimaryBG : 'transparent',
              color: activeTab === 'friends' ? 'white' : currentTheme.cardText,
              opacity: isEditing ? 0.5 : 1,
              cursor: isEditing ? 'not-allowed' : 'pointer'
            }}
          >
            👥 Amigos ({friends.length})
          </button>
          <button 
            className={`tab ${activeTab === 'privacy' ? 'tab-active' : ''}`}
            onClick={() => !isEditing && setActiveTab('privacy')}
            disabled={isEditing}
            style={{ 
              background: activeTab === 'privacy' ? currentTheme.btnPrimaryBG : 'transparent',
              color: activeTab === 'privacy' ? 'white' : currentTheme.cardText,
              opacity: isEditing ? 0.5 : 1,
              cursor: isEditing ? 'not-allowed' : 'pointer'
            }}
          >
            🔒 Privacidad
          </button>
        </div>

        {/* Contenido de las pestañas */}
        {activeTab === 'profile' && (
          <div>
            {/* Botones de acción cuando se está editando */}
            {isEditing && (
              <div className="flex gap-3 mb-6">
                <button 
                  className="btn btn-success" 
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  style={{ background: currentTheme.btnPrimaryBG }}
                >
                  <i className="bi bi-check"></i>
                  {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleCancelEdit}
                >
                  <i className="bi bi-x"></i>
                  Cancelar
                </button>
              </div>
            )}

            {/* Contenido del perfil - se mantiene igual */}
            <div className="profile-content">
              <div 
                className="profile-main"
                style={{ 
                  background: currentTheme.cardBG,
                  color: currentTheme.cardText
                }}
              >
                {/* Biografía */}
                <div className="profile-section">
                  <h3 style={{ color: currentTheme.cardText }}>Biografía</h3>
                  {isEditing ? (
                    <textarea
                      value={editData.biografia}
                      onChange={(e) => setEditData({...editData, biografia: e.target.value})}
                      className="form-control"
                      rows={4}
                      placeholder="Cuéntanos sobre ti..."
                    />
                  ) : (
                    <p 
                      className="profile-bio"
                      style={{ 
                        color: currentTheme.cardText,
                        borderLeftColor: currentTheme.btnPrimaryBG
                      }}
                    >
                      {user.biografia || 'No has agregado una biografía aún.'}
                    </p>
                  )}
                </div>

                {/* Ubicación */}
                <div className="profile-section">
                  <h3 style={{ color: currentTheme.cardText }}>Ubicación</h3>
                  {isEditing ? (
                    <div className="location-edit">
                      {/* Mapa interactivo */}
                      <div className="mb-4">
                        <label className="form-label">Selecciona tu ubicación en el mapa</label>
                        <div 
                          ref={mapRef}
                          style={{ 
                            height: '300px', 
                            borderRadius: '10px', 
                            border: '2px solid #e2e8f0',
                            marginBottom: '1rem'
                          }}
                        />
                      </div>
                      
                      {/* Campos rellenados automáticamente */}
                      <div className="row mb-3">
                        <div className="col">
                          <label className="form-label">Ciudad</label>
                          <input
                            type="text"
                            value={editData.ciudad}
                            onChange={(e) => setEditData({...editData, ciudad: e.target.value})}
                            className="form-control"
                            placeholder="Ciudad"
                          />
                        </div>
                        <div className="col">
                          <label className="form-label">País</label>
                          <input
                            type="text"
                            value={editData.pais}
                            onChange={(e) => setEditData({...editData, pais: e.target.value})}
                            className="form-control"
                            placeholder="País"
                          />
                        </div>
                      </div>
                      
                      <div className="row mb-3">
                        <div className="col">
                          <label className="form-label">Latitud</label>
                          <input
                            type="number"
                            step="any"
                            value={editData.latitud}
                            onChange={(e) => setEditData({...editData, latitud: parseFloat(e.target.value)})}
                            className="form-control"
                            placeholder="Latitud"
                          />
                        </div>
                        <div className="col">
                          <label className="form-label">Longitud</label>
                          <input
                            type="number"
                            step="any"
                            value={editData.longitud}
                            onChange={(e) => setEditData({...editData, longitud: parseFloat(e.target.value)})}
                            className="form-control"
                            placeholder="Longitud"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="profile-location">
                      <i 
                        className="bi bi-geo-alt"
                        style={{ color: currentTheme.btnPrimaryBG }}
                      ></i>
                      <span>
                        {user.ciudad && user.pais 
                          ? `${user.ciudad}, ${user.pais}`
                          : user.ciudad || user.pais || 'Ubicación no especificada'
                        }
                      </span>
                    </div>
                  )}
                </div>

                {/* Tema */}
                <div className="profile-section">
                  <h3 style={{ color: currentTheme.cardText }}>Tema Preferido</h3>
                  {isEditing ? (
                    <select
                      value={editData.tema_preferido}
                      onChange={(e) => setEditData({...editData, tema_preferido: e.target.value})}
                      className="form-control"
                    >
                      <option value="amanecer">Amanecer</option>
                      <option value="aurora">Aurora</option>
                      <option value="bosque">Bosque</option>
                      <option value="fuego">Fuego</option>
                      <option value="lluvia">Lluvia</option>
                      <option value="noche">Noche</option>
                      <option value="oceano">Océano</option>
                      <option value="pastel">Pastel</option>
                    </select>
                  ) : (
                    <div className="profile-theme">
                      <span className="theme-name">{editData.tema_preferido}</span>
                      <div 
                        className="theme-preview"
                        style={{ background: currentTheme.headerBG }}
                      ></div>
                    </div>
                  )}
                </div>

                {/* Publicaciones del usuario */}
                <div className="profile-section">
                  <h3 style={{ color: currentTheme.cardText }}>Mis Publicaciones</h3>
                  <UserPosts userId={user.id} maxPosts={5} theme={currentTheme} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'friends' && (
          <div>
            <h3 style={{ color: currentTheme.cardText }}>Mis Amigos ({friends.length})</h3>
            {loadingFriends ? (
              <div className="text-center py-8">
                <div className="loading loading-spinner loading-lg"></div>
                <p className="mt-2 text-gray-500">Cargando amigos...</p>
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">👥</div>
                <p>Aún no tienes amigos</p>
                <p className="text-sm">¡Conecta con otros usuarios para verlos aquí!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {friends.map((friend) => (
                  <div key={friend.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <img 
                        src={friend.foto_perfil_url || placeholder} 
                        alt={`Foto de ${friend.nombre}`}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = placeholder
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{friend.nombre} {friend.apellido}</h3>
                          {friend.verificado && (
                            <svg className="w-4 h-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm5.71,7.29-6,6a1,1,0,0,1-1.42,0l-3-3a1,1,0,0,1,1.42-1.42L11,13.59l5.29-5.3a1,1,0,0,1,1.42,1.42Z"/>
                            </svg>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">@{friend.nombre_usuario}</p>
                        <p className="text-xs text-gray-400">
                          Amigos desde {new Date(friend.fecha_amistad).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        className="btn btn-sm btn-primary flex-1"
                        onClick={() => window.location.href = `/usuario/${friend.id}`}
                      >
                        👁️ Ver Perfil
                      </button>
                      <button 
                        className="btn btn-sm btn-error"
                        onClick={() => handleRemoveFriend(friend.id)}
                        title="Dejar de seguir"
                      >
                        🚫
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'privacy' && (
          <div>
            <h3 style={{ color: currentTheme.cardText }}>Privacidad y Seguridad</h3>
            
            {/* Usuarios Bloqueados */}
            <div className="mb-8">
              <h4 style={{ color: currentTheme.cardText }} className="text-lg font-semibold mb-4">
                🚫 Personas Bloqueadas ({blockedUsers.length})
              </h4>
              {loadingBlocked ? (
                <div className="text-center py-8">
                  <div className="loading loading-spinner loading-lg"></div>
                  <p className="mt-2 text-gray-500">Cargando usuarios bloqueados...</p>
                </div>
              ) : blockedUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">🔓</div>
                  <p>No has bloqueado a ningún usuario</p>
                  <p className="text-sm">Los usuarios bloqueados no pueden ver tu contenido</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {blockedUsers.map((blockedUser) => (
                    <div key={blockedUser.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <img 
                          src={blockedUser.foto_perfil_url || placeholder} 
                          alt={`Foto de ${blockedUser.nombre}`}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = placeholder
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{blockedUser.nombre} {blockedUser.apellido}</h3>
                            {blockedUser.verificado && (
                              <svg className="w-4 h-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm5.71,7.29-6,6a1,1,0,0,1-1.42,0l-3-3a1,1,0,0,1,1.42-1.42L11,13.59l5.29-5.3a1,1,0,0,1,1.42,1.42Z"/>
                              </svg>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">@{blockedUser.nombre_usuario}</p>
                          {blockedUser.fecha_bloqueo && (
                            <p className="text-xs text-gray-400">
                              Bloqueado el {new Date(blockedUser.fecha_bloqueo).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          className="btn btn-sm btn-warning flex-1"
                          onClick={() => handleUnblockUser(blockedUser.id)}
                          title="Desbloquear usuario"
                        >
                          🔓 Desbloquear
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Información de Privacidad */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-blue-800 mb-2">ℹ️ Información sobre el Bloqueo</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Los usuarios bloqueados no pueden ver tu perfil ni tus publicaciones</li>
                <li>• Tú tampoco puedes ver el contenido de usuarios que has bloqueado</li>
                <li>• El bloqueo es bidireccional y se aplica automáticamente</li>
                <li>• Puedes desbloquear usuarios en cualquier momento desde esta sección</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
