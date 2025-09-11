/**
 * ========================================
 * COMPONENTE PROFILE PAGE DE GEOPLANNER
 * ========================================
 * 
 * Página de perfil del usuario autenticado en GeoPlanner.
 * Permite ver y editar información personal, gestionar
 * privacidad y ver publicaciones propias.
 * 
 * FUNCIONALIDADES PRINCIPALES:
 * - Visualización de perfil del usuario
 * - Edición de información personal
 * - Gestión de usuarios bloqueados
 * - Visualización de publicaciones propias
 * - Configuración de privacidad
 * - Mapa interactivo para ubicación
 * 
 * IMPORTANTE PARA EL EQUIPO:
 * - Centro de gestión personal del usuario
 * - Integración con sistema de mapas
 * - Gestión de privacidad y seguridad
 * - Interfaz de edición intuitiva
 */

import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/api'
import type { UserSettings } from '../services/api'
import UserPosts from '../components/UserPosts'
import '../styles/ProfilePage.css'
// Assets moved to public folder for production compatibility

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
  const [activeTab, setActiveTab] = useState<'profile' | 'friends' | 'privacy' | 'settings'>('profile')
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  
  // Estados para edición
  const [editData, setEditData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
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
      loadUserSettings()
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
      nombre: user?.nombre || '',
      apellido: user?.apellido || '',
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
          (_error) => {
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

  // Estados para configuración
  const [settings, setSettings] = useState<UserSettings>(apiService.getDefaultSettings())
  const [loadingSettings, setLoadingSettings] = useState(false)

  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [deleteData, setDeleteData] = useState({
    reason: '',
    password: '',
    downloadData: true
  })

  const handleSaveSettings = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.updateUserSettings(settings)
      alert(response.mensaje)
    } catch (error) {
      console.error('Error guardando configuraciones:', error)
      alert('Error al guardar las configuraciones')
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar configuraciones del usuario
  const loadUserSettings = async () => {
    try {
      setLoadingSettings(true)
      const userSettings = await apiService.getUserSettings()
      setSettings(userSettings)
    } catch (error) {
      console.error('Error cargando configuraciones:', error)
      // Si no hay configuraciones guardadas, usar las por defecto
      setSettings(apiService.getDefaultSettings())
    } finally {
      setLoadingSettings(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Las contraseñas no coinciden')
      return
    }
    
    try {
      setIsLoading(true)
      const response = await apiService.changePassword(passwordData.currentPassword, passwordData.newPassword)
      alert(response.mensaje)
      setShowPasswordModal(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      console.error('Error cambiando contraseña:', error)
      alert('Error al cambiar la contraseña')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccountDeletion = async () => {
    if (!deleteData.password) {
      alert('Por favor ingresa tu contraseña para confirmar')
      return
    }
    
    try {
      setIsLoading(true)
      const response = await apiService.deleteAccount(deleteData.reason, deleteData.password, deleteData.downloadData)
      alert(response.mensaje)
      navigate('/logout')
    } catch (error) {
      console.error('Error eliminando cuenta:', error)
      alert('Error al eliminar la cuenta')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTwoFactorSetup = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.setupTwoFactor()
      setShowTwoFactorModal(false)
      setSettings(prev => ({ ...prev, twoFactorAuth: true }))
      alert(response.mensaje)
    } catch (error) {
      console.error('Error configurando 2FA:', error)
      alert('Error al configurar la autenticación de dos factores')
    } finally {
      setIsLoading(false)
    }
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
          <button 
            className={`tab ${activeTab === 'settings' ? 'tab-active' : ''}`}
            onClick={() => !isEditing && setActiveTab('settings')}
            disabled={isEditing}
            style={{ 
              background: activeTab === 'settings' ? currentTheme.btnPrimaryBG : 'transparent',
              color: activeTab === 'settings' ? 'white' : currentTheme.cardText,
              opacity: isEditing ? 0.5 : 1,
              cursor: isEditing ? 'not-allowed' : 'pointer'
            }}
          >
            ⚙️ Configuración
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
                        src={friend.foto_perfil_url || '/placeholder.png'} 
                        alt={`Foto de ${friend.nombre}`}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder.png'
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
                          src={blockedUser.foto_perfil_url || '/placeholder.png'} 
                          alt={`Foto de ${blockedUser.nombre}`}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/placeholder.png'
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

        {activeTab === 'settings' && (
          <div>
            <h3 style={{ color: currentTheme.cardText }}>Configuración de Cuenta</h3>
            {loadingSettings && (
              <div className="text-center py-8">
                <div className="loading loading-spinner loading-lg"></div>
                <p className="mt-2 text-gray-500">Cargando configuraciones...</p>
              </div>
            )}
            
            {/* Notificaciones */}
            <div className="mb-8">
              <h4 style={{ color: currentTheme.cardText }} className="text-lg font-semibold mb-4">
                🔔 Notificaciones
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Notificaciones por Email</h5>
                    <p className="text-sm text-gray-500">Recibe actualizaciones importantes por correo</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Notificaciones Push</h5>
                    <p className="text-sm text-gray-500">Notificaciones en tiempo real</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary"
                    checked={settings.pushNotifications}
                    onChange={(e) => setSettings({...settings, pushNotifications: e.target.checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Solicitudes de Amistad</h5>
                    <p className="text-sm text-gray-500">Cuando alguien te envía una solicitud</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary"
                    checked={settings.newFriendRequests}
                    onChange={(e) => setSettings({...settings, newFriendRequests: e.target.checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Invitaciones a Eventos</h5>
                    <p className="text-sm text-gray-500">Cuando te invitan a un evento</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary"
                    checked={settings.eventInvitations}
                    onChange={(e) => setSettings({...settings, eventInvitations: e.target.checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Likes y Comentarios</h5>
                    <p className="text-sm text-gray-500">Actividad en tus publicaciones</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary"
                    checked={settings.likesAndComments}
                    onChange={(e) => setSettings({...settings, likesAndComments: e.target.checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Menciones</h5>
                    <p className="text-sm text-gray-500">Cuando alguien te menciona</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary"
                    checked={settings.mentions}
                    onChange={(e) => setSettings({...settings, mentions: e.target.checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Eventos Cercanos</h5>
                    <p className="text-sm text-gray-500">Eventos cerca de tu ubicación</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary"
                    checked={settings.nearbyEvents}
                    onChange={(e) => setSettings({...settings, nearbyEvents: e.target.checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Resumen Semanal</h5>
                    <p className="text-sm text-gray-500">Resumen de actividad semanal</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary"
                    checked={settings.weeklyDigest}
                    onChange={(e) => setSettings({...settings, weeklyDigest: e.target.checked})}
                  />
                </div>
              </div>
            </div>

            {/* Privacidad Avanzada */}
            <div className="mb-8">
              <h4 style={{ color: currentTheme.cardText }} className="text-lg font-semibold mb-4">
                🔒 Privacidad Avanzada
              </h4>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <label className="block mb-2 font-medium">Visibilidad del Perfil</label>
                  <select 
                    className="select select-bordered w-full"
                    value={settings.profileVisibility}
                    onChange={(e) => setSettings({...settings, profileVisibility: e.target.value as "public" | "friends" | "private"})}
                  >
                    <option value="public">Público - Cualquiera puede ver tu perfil</option>
                    <option value="friends">Solo Amigos - Solo tus amigos pueden ver tu perfil</option>
                    <option value="private">Privado - Solo tú puedes ver tu perfil</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Mostrar Ubicación</h5>
                    <p className="text-sm text-gray-500">Permitir que otros vean tu ubicación</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary"
                    checked={settings.showLocation}
                    onChange={(e) => setSettings({...settings, showLocation: e.target.checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Mostrar Fecha de Nacimiento</h5>
                    <p className="text-sm text-gray-500">Mostrar tu edad en el perfil</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary"
                    checked={settings.showBirthDate}
                    onChange={(e) => setSettings({...settings, showBirthDate: e.target.checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Permitir Solicitudes de Amistad</h5>
                    <p className="text-sm text-gray-500">Otros usuarios pueden enviarte solicitudes</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary"
                    checked={settings.allowFriendRequests}
                    onChange={(e) => setSettings({...settings, allowFriendRequests: e.target.checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Permitir Mensajes</h5>
                    <p className="text-sm text-gray-500">Otros usuarios pueden enviarte mensajes</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary"
                    checked={settings.allowMessages}
                    onChange={(e) => setSettings({...settings, allowMessages: e.target.checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Mostrar Estado en Línea</h5>
                    <p className="text-sm text-gray-500">Mostrar cuando estás activo</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary"
                    checked={settings.showOnlineStatus}
                    onChange={(e) => setSettings({...settings, showOnlineStatus: e.target.checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Permitir Etiquetas</h5>
                    <p className="text-sm text-gray-500">Otros pueden etiquetarte en publicaciones</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary"
                    checked={settings.allowTagging}
                    onChange={(e) => setSettings({...settings, allowTagging: e.target.checked})}
                  />
                </div>
              </div>
            </div>

            {/* Seguridad */}
            <div className="mb-8">
              <h4 style={{ color: currentTheme.cardText }} className="text-lg font-semibold mb-4">
                🔐 Seguridad
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Autenticación de Dos Factores</h5>
                    <p className="text-sm text-gray-500">Añade una capa extra de seguridad a tu cuenta. Necesitarás un código adicional además de tu contraseña para iniciar sesión.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      className="toggle toggle-primary"
                      checked={settings.twoFactorAuth}
                      onChange={(e) => setSettings({...settings, twoFactorAuth: e.target.checked})}
                    />
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => setShowTwoFactorModal(true)}
                    >
                      Configurar
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Alertas de Inicio de Sesión</h5>
                    <p className="text-sm text-gray-500">Notificaciones de nuevos inicios de sesión</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary"
                    checked={settings.loginAlerts}
                    onChange={(e) => setSettings({...settings, loginAlerts: e.target.checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Gestión de Dispositivos</h5>
                    <p className="text-sm text-gray-500">Ver y gestionar sesiones activas</p>
                  </div>
                                     <button 
                     className="btn btn-sm btn-outline"
                     onClick={async () => {
                       try {
                         const sessions = await apiService.getActiveSessions()
                         alert(`Sesiones activas: ${sessions.length}`)
                         // Aquí se podría abrir un modal para mostrar las sesiones
                       } catch (error) {
                         console.error('Error obteniendo sesiones:', error)
                         alert('Error al obtener las sesiones activas')
                       }
                     }}
                   >
                     Gestionar
                   </button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-2">Cambiar Contraseña</h5>
                  <p className="text-sm text-gray-500 mb-3">Actualiza tu contraseña regularmente</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    Cambiar Contraseña
                  </button>
                </div>
              </div>
            </div>

            {/* Preferencias */}
            <div className="mb-8">
              <h4 style={{ color: currentTheme.cardText }} className="text-lg font-semibold mb-4">
                ⚙️ Preferencias
              </h4>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <label className="block mb-2 font-medium">Idioma</label>
                  <select 
                    className="select select-bordered w-full"
                    value={settings.language}
                    onChange={(e) => setSettings({...settings, language: e.target.value})}
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="pt">Português</option>
                  </select>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <label className="block mb-2 font-medium">Zona Horaria</label>
                  <select 
                    className="select select-bordered w-full"
                    value={settings.timezone}
                    onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                  >
                    <option value="America/Caracas">Caracas (UTC-4)</option>
                    <option value="America/New_York">Nueva York (UTC-5)</option>
                    <option value="America/Los_Angeles">Los Ángeles (UTC-8)</option>
                    <option value="Europe/Madrid">Madrid (UTC+1)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <label className="block mb-2 font-medium">Filtro de Contenido</label>
                  <select 
                    className="select select-bordered w-full"
                    value={settings.contentFilter}
                    onChange={(e) => setSettings({...settings, contentFilter: e.target.value as "none" | "moderate" | "strict"})}
                  >
                    <option value="none">Sin filtro</option>
                    <option value="moderate">Moderado</option>
                    <option value="strict">Estricto</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Reproducción Automática de Videos</h5>
                    <p className="text-sm text-gray-500">Reproducir videos automáticamente</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary"
                    checked={settings.autoPlayVideos}
                    onChange={(e) => setSettings({...settings, autoPlayVideos: e.target.checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Mostrar Contenido Tendencia</h5>
                    <p className="text-sm text-gray-500">Eventos y contenido popular</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary"
                    checked={settings.showTrendingContent}
                    onChange={(e) => setSettings({...settings, showTrendingContent: e.target.checked})}
                  />
                </div>
              </div>
            </div>

            {/* Datos y Privacidad */}
            <div className="mb-8">
              <h4 style={{ color: currentTheme.cardText }} className="text-lg font-semibold mb-4">
                📊 Datos y Privacidad
              </h4>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <label className="block mb-2 font-medium">Uso de Datos</label>
                  <select 
                    className="select select-bordered w-full"
                    value={settings.dataUsage}
                    onChange={(e) => setSettings({...settings, dataUsage: e.target.value as "standard" | "reduced"})}
                  >
                    <option value="standard">Estándar - Mejor experiencia</option>
                    <option value="reduced">Reducido - Menos datos</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Compartir Análisis</h5>
                    <p className="text-sm text-gray-500">Ayudar a mejorar la plataforma</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary"
                    checked={settings.analyticsSharing}
                    onChange={(e) => setSettings({...settings, analyticsSharing: e.target.checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium">Anuncios Personalizados</h5>
                    <p className="text-sm text-gray-500">Anuncios basados en tus intereses</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary"
                    checked={settings.personalizedAds}
                    onChange={(e) => setSettings({...settings, personalizedAds: e.target.checked})}
                  />
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-2">Descargar Mis Datos</h5>
                  <p className="text-sm text-gray-500 mb-3">Obtén una copia de toda tu información</p>
                                     <button 
                     className="btn btn-outline"
                     onClick={async () => {
                       try {
                         const response = await apiService.downloadUserData()
                         alert(`Descarga iniciada. URL: ${response.download_url}`)
                         // Aquí se podría abrir la URL en una nueva pestaña
                         window.open(response.download_url, '_blank')
                       } catch (error) {
                         console.error('Error descargando datos:', error)
                         alert('Error al iniciar la descarga de datos')
                       }
                     }}
                   >
                     Descargar Datos
                   </button>
                </div>
              </div>
            </div>

            {/* Cuenta */}
            <div className="mb-8">
              <h4 style={{ color: currentTheme.cardText }} className="text-lg font-semibold mb-4">
                🗑️ Cuenta
              </h4>
              <div className="space-y-4">
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <h5 className="font-medium text-red-800 mb-2">Eliminar Cuenta</h5>
                  <p className="text-sm text-red-600 mb-3">
                    Esta acción es permanente y no se puede deshacer. 
                    Se eliminarán todos tus datos, publicaciones y conexiones.
                  </p>
                  <button 
                    className="btn btn-error"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Eliminar Cuenta
                  </button>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-4 justify-end">
                             <button 
                 className="btn btn-secondary"
                 onClick={() => {
                   setSettings(apiService.getDefaultSettings())
                 }}
               >
                 Restablecer
               </button>
              <button 
                className="btn btn-primary"
                onClick={handleSaveSettings}
                disabled={isLoading}
                style={{ background: currentTheme.btnPrimaryBG }}
              >
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Modal para cambiar contraseña */}
      {showPasswordModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Cambiar Contraseña</h3>
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Contraseña Actual</span>
                </label>
                <input 
                  type="password" 
                  className="input input-bordered w-full"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  placeholder="Ingresa tu contraseña actual"
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Nueva Contraseña</span>
                </label>
                <input 
                  type="password" 
                  className="input input-bordered w-full"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  placeholder="Ingresa tu nueva contraseña"
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Confirmar Nueva Contraseña</span>
                </label>
                <input 
                  type="password" 
                  className="input input-bordered w-full"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  placeholder="Confirma tu nueva contraseña"
                />
              </div>
            </div>
            <div className="modal-action">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowPasswordModal(false)
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                }}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary"
                onClick={handlePasswordChange}
                disabled={isLoading}
              >
                {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para eliminar cuenta */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4 text-red-600">⚠️ Eliminar Cuenta</h3>
            <div className="space-y-4">
              <div className="alert alert-warning">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>Esta acción es permanente y no se puede deshacer.</span>
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Motivo (opcional)</span>
                </label>
                <select 
                  className="select select-bordered w-full"
                  value={deleteData.reason}
                  onChange={(e) => setDeleteData({...deleteData, reason: e.target.value})}
                >
                  <option value="">Selecciona un motivo</option>
                  <option value="privacy">Problemas de privacidad</option>
                  <option value="not_using">No uso la plataforma</option>
                  <option value="created_new">Creé una nueva cuenta</option>
                  <option value="other">Otro motivo</option>
                </select>
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Contraseña</span>
                </label>
                <input 
                  type="password" 
                  className="input input-bordered w-full"
                  value={deleteData.password}
                  onChange={(e) => setDeleteData({...deleteData, password: e.target.value})}
                  placeholder="Ingresa tu contraseña para confirmar"
                />
              </div>
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Descargar mis datos antes de eliminar</span>
                  <input 
                    type="checkbox" 
                    className="checkbox checkbox-primary"
                    checked={deleteData.downloadData}
                    onChange={(e) => setDeleteData({...deleteData, downloadData: e.target.checked})}
                  />
                </label>
              </div>
            </div>
            <div className="modal-action">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteData({ reason: '', password: '', downloadData: true })
                }}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-error"
                onClick={handleAccountDeletion}
                disabled={isLoading}
              >
                {isLoading ? 'Eliminando...' : 'Eliminar Cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para autenticación de dos factores */}
      {showTwoFactorModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">🔐 Configurar Autenticación de Dos Factores</h3>
            <div className="space-y-4">
              <div className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>
                  La autenticación de dos factores añade una capa extra de seguridad a tu cuenta.
                  Necesitarás un código adicional además de tu contraseña para iniciar sesión.
                </span>
              </div>
              
              <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-2xl mb-2">📱</div>
                <p className="text-sm text-gray-600">
                  Escanea este código QR con tu aplicación de autenticación
                </p>
                <div className="bg-gray-100 w-32 h-32 mx-auto mt-4 flex items-center justify-center">
                  <span className="text-gray-400">QR Code</span>
                </div>
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text">Código de Verificación</span>
                </label>
                <input 
                  type="text" 
                  className="input input-bordered w-full"
                  placeholder="Ingresa el código de 6 dígitos"
                  maxLength={6}
                />
              </div>
            </div>
            <div className="modal-action">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowTwoFactorModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleTwoFactorSetup}
                disabled={isLoading}
              >
                {isLoading ? 'Configurando...' : 'Configurar 2FA'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfilePage
