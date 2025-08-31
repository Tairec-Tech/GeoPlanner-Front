import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/api'
import placeholder from '../assets/img/placeholder.png'

interface User {
  id: string
  nombre: string
  apellido: string
  nombre_usuario: string
  email: string
  foto_perfil_url?: string
  fecha_registro: string
  tema_preferido: string
  verificado: boolean
}

interface Post {
  id: string
  texto: string
  fecha_creacion: string
  fecha_evento: string
  privacidad: string
  media_url?: string
  id_autor: string
  nombre_autor: string
  username_autor: string
  foto_autor?: string
  verificado: boolean
  likes: number
  likers: string[]
  comentarios: any[]
  rutas?: any[]
}

interface FriendshipStatus {
  status: 'none' | 'pending' | 'accepted' | 'blocked'
  isBlockedByMe: boolean
  isBlockedByThem: boolean
}

const PublicProfilePage = () => {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [profileUser, setProfileUser] = useState<User | null>(null)
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus>({
    status: 'none',
    isBlockedByMe: false,
    isBlockedByThem: false
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setError('ID de usuario no válido')
      setLoading(false)
      return
    }

    loadUserProfile()
  }, [userId])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      
      // Cargar información del usuario
      const userData = await apiService.getUserById(userId!)
      setProfileUser(userData)
      
      // Cargar publicaciones del usuario
      const posts = await apiService.getUserPosts(userId!)
      setUserPosts(posts)
      
      // Verificar estado de amistad
      if (user && user.id !== userId) {
        const friendship = await apiService.getFriendshipStatus(user.id, userId!)
        setFriendshipStatus(friendship)
      }
      
    } catch (error: any) {
      console.error('Error cargando perfil:', error)
      
      // Manejar errores específicos de bloqueo
      if (error.message && error.message.includes('403')) {
        setError('No puedes ver este perfil porque hay un bloqueo entre usuarios')
      } else {
        setError('Error al cargar el perfil del usuario')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddFriend = async () => {
    if (!user || !profileUser) return
    
    try {
      await apiService.sendFriendRequest(user.id, profileUser.id)
      setFriendshipStatus(prev => ({ ...prev, status: 'pending' }))
    } catch (error) {
      console.error('Error enviando solicitud de amistad:', error)
    }
  }

  const handleCancelFriendRequest = async () => {
    if (!user || !profileUser) return
    
    try {
      await apiService.cancelFriendRequest(user.id, profileUser.id)
      setFriendshipStatus(prev => ({ ...prev, status: 'none' }))
    } catch (error) {
      console.error('Error cancelando solicitud de amistad:', error)
    }
  }

  const handleRemoveFriendship = async () => {
    if (!user || !profileUser) return
    
    try {
      await apiService.removeFriendship(user.id, profileUser.id)
      setFriendshipStatus(prev => ({ ...prev, status: 'none' }))
    } catch (error) {
      console.error('Error eliminando amistad:', error)
    }
  }

  const handleBlockUser = async () => {
    if (!user || !profileUser) return
    
    try {
      await apiService.blockUser(user.id, profileUser.id)
      setFriendshipStatus(prev => ({ ...prev, isBlockedByMe: true }))
    } catch (error) {
      console.error('Error bloqueando usuario:', error)
    }
  }

  const handleUnblockUser = async () => {
    if (!user || !profileUser) return
    
    try {
      await apiService.unblockUser(user.id, profileUser.id)
      setFriendshipStatus(prev => ({ ...prev, isBlockedByMe: false }))
    } catch (error) {
      console.error('Error desbloqueando usuario:', error)
    }
  }

  const handleBackToDashboard = () => {
    navigate('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    )
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Usuario no encontrado'}</p>
          <button 
            className="btn btn-primary"
            onClick={handleBackToDashboard}
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Si el usuario está bloqueado por el perfil que está viendo
  if (friendshipStatus.isBlockedByThem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Perfil No Disponible</h2>
          <p className="text-gray-600 mb-4">Este usuario ha bloqueado su perfil</p>
          <button 
            className="btn btn-primary"
            onClick={handleBackToDashboard}
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  const isOwnProfile = user?.id === profileUser.id

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              className="btn btn-ghost"
              onClick={handleBackToDashboard}
            >
              ← Volver al Dashboard
            </button>
            <h1 className="text-xl font-semibold">Perfil de Usuario</h1>
            <div className="w-20"></div> {/* Espaciador */}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Información del Perfil */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start gap-6">
            {/* Foto de Perfil */}
            <div className="flex-shrink-0">
              <img 
                src={profileUser.foto_perfil_url || placeholder} 
                alt={`Foto de ${profileUser.nombre}`}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = placeholder
                }}
              />
            </div>

            {/* Información del Usuario */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">
                  {profileUser.nombre} {profileUser.apellido}
                </h2>
                {profileUser.verificado && (
                  <svg className="w-6 h-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm5.71,7.29-6,6a1,1,0,0,1-1.42,0l-3-3a1,1,0,0,1,1.42-1.42L11,13.59l5.29-5.3a1,1,0,0,1,1.42,1.42Z"/>
                  </svg>
                )}
              </div>
              
              <p className="text-gray-600 mb-1">@{profileUser.nombre_usuario}</p>
              <p className="text-sm text-gray-500 mb-4">
                Miembro desde {new Date(profileUser.fecha_registro).toLocaleDateString()}
              </p>

              {/* Estadísticas */}
              <div className="flex gap-6 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{userPosts.length}</div>
                  <div className="text-sm text-gray-600">Publicaciones</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {userPosts.reduce((total, post) => total + post.likes, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Likes Totales</div>
                </div>
              </div>

              {/* Botones de Acción */}
              {!isOwnProfile && (
                <div className="flex gap-3">
                  {friendshipStatus.status === 'none' && !friendshipStatus.isBlockedByMe && (
                    <button 
                      className="btn btn-primary"
                      onClick={handleAddFriend}
                    >
                      👥 Agregar Amigo
                    </button>
                  )}
                  
                  {friendshipStatus.status === 'pending' && (
                    <div className="flex gap-2">
                      <button 
                        className="btn btn-secondary"
                        onClick={handleCancelFriendRequest}
                      >
                        ❌ Cancelar Solicitud
                      </button>
                    </div>
                  )}
                  
                  {friendshipStatus.status === 'accepted' && (
                    <div className="flex gap-2">
                      <button className="btn btn-success" disabled>
                        ✅ Ya Somos Amigos
                      </button>
                      <button 
                        className="btn btn-error"
                        onClick={handleRemoveFriendship}
                      >
                        🚫 Dejar de Seguir
                      </button>
                    </div>
                  )}

                  {!friendshipStatus.isBlockedByMe ? (
                    <button 
                      className="btn btn-error"
                      onClick={handleBlockUser}
                    >
                      🚫 Bloquear Usuario
                    </button>
                  ) : (
                    <button 
                      className="btn btn-warning"
                      onClick={handleUnblockUser}
                    >
                      🔓 Desbloquear Usuario
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Publicaciones del Usuario */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-4">Publicaciones</h3>
          
          {userPosts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">📝</div>
              <p>Este usuario aún no ha hecho publicaciones</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userPosts
                .sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime())
                .map((post) => (
                  <div key={post.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <img 
                        src={post.foto_autor || placeholder} 
                        alt={`Foto de ${post.nombre_autor}`}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = placeholder
                        }}
                      />
                      <div>
                        <div className="font-semibold">{post.nombre_autor}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(post.fecha_creacion).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <p className="mb-3">{post.texto}</p>
                    
                    {post.media_url && (
                      <img 
                        src={post.media_url} 
                        alt="Media" 
                        className="w-full h-48 object-cover rounded mb-3"
                        onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                      />
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>❤️ {post.likes} likes</span>
                      <span>💬 {post.comentarios?.length || 0} comentarios</span>
                      <span>📅 {new Date(post.fecha_evento).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PublicProfilePage
