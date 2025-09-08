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
  const [likingPosts, setLikingPosts] = useState<{[key: string]: boolean}>({})
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'friends'>('posts')

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
      setProfileUser(userData as any)
      
      // Cargar publicaciones del usuario con comentarios actualizados
      const posts = await apiService.getUserPosts(userId!)
      
      // Cargar comentarios para cada publicación para tener contadores actualizados
      const postsWithComments = await Promise.all(
        posts.map(async (post) => {
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
      
      setUserPosts(postsWithComments as any)
      
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

  // Función para manejar likes de publicaciones
  const handleLike = async (postId: string) => {
    if (likingPosts[postId]) return // Evitar múltiples clicks
    
    try {
      setLikingPosts(prev => ({ ...prev, [postId]: true }))
      
      const post = userPosts.find(p => p.id === postId)
      if (!post) return

      // Verificar si el usuario ya dio like
      const hasLiked = post.likers?.includes(user?.id || '')
      
      if (hasLiked) {
        // Quitar like
        await apiService.unlikePost(postId)
        console.log('✅ Like removido')
      } else {
        // Dar like
        await apiService.likePost(postId)
        console.log('✅ Like agregado')
      }
      
      // Recargar el perfil para actualizar contadores
      await loadUserProfile()
    } catch (error) {
      console.error('❌ Error manejando like:', error)
    } finally {
      setLikingPosts(prev => ({ ...prev, [postId]: false }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Usuario no encontrado'}</p>
          <button 
            className="btn btn-primary btn-lg"
            onClick={handleBackToDashboard}
          >
            ← Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Si el usuario está bloqueado por el perfil que está viendo
  if (friendshipStatus.isBlockedByThem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Perfil No Disponible</h2>
          <p className="text-gray-600 mb-6">Este usuario ha bloqueado su perfil</p>
          <button 
            className="btn btn-primary btn-lg"
            onClick={handleBackToDashboard}
          >
            ← Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  const isOwnProfile = user?.id === profileUser.id

  // Calcular estadísticas
  const totalLikes = userPosts.reduce((total, post) => total + (post.likes || 0), 0)
  const totalComments = userPosts.reduce((total, post) => total + (post.comentarios?.length || 0), 0)
  const activeEvents = userPosts.filter(post => new Date(post.fecha_evento) > new Date()).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header con navegación */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              className="btn btn-ghost btn-sm md:btn-md text-blue-600 hover:text-blue-800 transition-colors"
              onClick={handleBackToDashboard}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver al Dashboard
            </button>
            <h1 className="text-lg md:text-xl font-bold text-gray-800">Perfil de Usuario</h1>
            <div className="w-20 md:w-24"></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {/* Hero Section - Información Principal del Perfil */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Banner de fondo */}
          <div className="h-32 md:h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
          
          {/* Información del perfil */}
          <div className="relative px-6 md:px-8 pb-6 md:pb-8">
            {/* Foto de perfil */}
            <div className="absolute -top-16 md:-top-20 left-6 md:left-8">
              <div className="relative">
                <img 
                  src={profileUser.foto_perfil_url || placeholder} 
                  alt={`Foto de ${profileUser.nombre}`}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = placeholder
                  }}
                />
                {profileUser.verificado && (
                  <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2 shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Información del usuario */}
            <div className="ml-0 md:ml-48 pt-20 md:pt-24">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                    {profileUser.nombre} {profileUser.apellido}
                  </h2>
                  <p className="text-blue-600 font-medium mb-1">@{profileUser.nombre_usuario}</p>
                  <p className="text-gray-500 text-sm mb-4">
                    Miembro desde {new Date(profileUser.fecha_registro).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Botones de acción */}
                {!isOwnProfile && (
                  <div className="flex flex-wrap gap-2 md:gap-3 mt-4 md:mt-0">
                    {friendshipStatus.status === 'none' && !friendshipStatus.isBlockedByMe && (
                      <button 
                        className="btn btn-primary btn-sm md:btn-md"
                        onClick={handleAddFriend}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Agregar Amigo
                      </button>
                    )}
                    
                    {friendshipStatus.status === 'pending' && (
                      <button 
                        className="btn btn-secondary btn-sm md:btn-md"
                        onClick={handleCancelFriendRequest}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancelar Solicitud
                      </button>
                    )}
                    
                    {friendshipStatus.status === 'accepted' && (
                      <div className="flex gap-2">
                        <button className="btn btn-success btn-sm md:btn-md" disabled>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Amigos
                        </button>
                        <button 
                          className="btn btn-error btn-sm md:btn-md"
                          onClick={handleRemoveFriendship}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                          </svg>
                          Dejar de Seguir
                        </button>
                      </div>
                    )}

                    {!friendshipStatus.isBlockedByMe ? (
                      <button 
                        className="btn btn-error btn-sm md:btn-md"
                        onClick={handleBlockUser}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                        </svg>
                        Bloquear
                      </button>
                    ) : (
                      <button 
                        className="btn btn-warning btn-sm md:btn-md"
                        onClick={handleUnblockUser}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                        </svg>
                        Desbloquear
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">{userPosts.length}</div>
            <div className="text-sm text-gray-600">Publicaciones</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1">{totalLikes}</div>
            <div className="text-sm text-gray-600">Likes Totales</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-1">{totalComments}</div>
            <div className="text-sm text-gray-600">Comentarios</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-2xl md:text-3xl font-bold text-orange-600 mb-1">{activeEvents}</div>
            <div className="text-sm text-gray-600">Eventos Activos</div>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'posts' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('posts')}
            >
              <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Publicaciones
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'about' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('about')}
            >
              <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Acerca de
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'friends' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('friends')}
            >
              <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              Amigos
            </button>
          </div>
        </div>

        {/* Contenido de las tabs */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {activeTab === 'posts' && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6">Publicaciones</h3>
              
              {userPosts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-gray-500 text-lg">Este usuario aún no ha hecho publicaciones</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {userPosts
                    .sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime())
                    .map((post) => (
                      <div key={post.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 mb-4">
                          <img 
                            src={post.foto_autor || placeholder} 
                            alt={`Foto de ${post.nombre_autor}`}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = placeholder
                            }}
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800">{post.nombre_autor}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(post.fecha_creacion).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {post.verificado && (
                              <div className="text-blue-500">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              post.privacidad === 'publica' ? 'bg-green-100 text-green-800' :
                              post.privacidad === 'amigos' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {post.privacidad === 'publica' ? 'Pública' :
                               post.privacidad === 'amigos' ? 'Amigos' : 'Privada'}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-4 leading-relaxed">{post.texto}</p>
                        
                        {post.media_url && (
                          <img 
                            src={post.media_url} 
                            alt="Media" 
                            className="w-full h-48 md:h-64 object-cover rounded-lg mb-4"
                            onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                          />
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <button 
                              className={`flex items-center gap-2 transition-colors ${
                                post.likers?.includes(user?.id || '') 
                                  ? 'text-red-500' 
                                  : 'text-gray-500 hover:text-red-500'
                              } ${likingPosts[post.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                              onClick={() => handleLike(post.id)}
                              disabled={likingPosts[post.id]}
                            >
                              <span className="text-lg">
                                {likingPosts[post.id] 
                                  ? '⏳' 
                                  : post.likers?.includes(user?.id || '') 
                                    ? '❤️' 
                                    : '🤍'
                                }
                              </span>
                              <span className="font-medium">{post.likes || 0}</span>
                            </button>
                            
                            <div className="flex items-center gap-2 text-gray-500">
                              <span className="text-lg">💬</span>
                              <span className="font-medium">{post.comentarios?.length || 0}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-gray-500">
                              <span className="text-lg">📅</span>
                              <span className="font-medium">
                                {new Date(post.fecha_evento).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6">Acerca de {profileUser.nombre}</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Nombre completo</div>
                    <div className="text-gray-600">{profileUser.nombre} {profileUser.apellido}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Nombre de usuario</div>
                    <div className="text-gray-600">@{profileUser.nombre_usuario}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-8 6h8" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Miembro desde</div>
                    <div className="text-gray-600">
                      {new Date(profileUser.fecha_registro).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Tema preferido</div>
                    <div className="text-gray-600 capitalize">{profileUser.tema_preferido}</div>
                  </div>
                </div>
                
                {profileUser.verificado && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Estado de verificación</div>
                      <div className="text-green-600 font-medium">Cuenta verificada</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'friends' && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6">Amigos</h3>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <p className="text-gray-500 text-lg">Funcionalidad de amigos próximamente</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PublicProfilePage
