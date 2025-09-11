import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface Group {
  id: string
  nombre: string
  descripcion: string
  miembros: number
  max_miembros: number
  privacidad: 'publico' | 'privado'
  categoria: string
  isMember: boolean
  isAdmin: boolean
  fecha_creacion: string
  id_creador: string
  nombre_creador: string
  tags: string[]
}

interface GroupMember {
  id: string
  nombre: string
  apellido: string
  nombre_usuario: string
  foto_perfil_url?: string
  fecha_union: string
  rol: 'admin' | 'moderador' | 'miembro'
  verificado: boolean
}

interface GroupPost {
  id: string
  texto: string
  fecha_creacion: string
  autor: {
    id: string
    nombre: string
    apellido: string
    nombre_usuario: string
    foto_perfil_url?: string
  }
  likes: number
  comentarios: number
  media_url?: string
}

const GroupDetailPage = () => {
  const navigate = useNavigate()
  const { groupId } = useParams()
  const { user } = useAuth()
  
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [posts, setPosts] = useState<GroupPost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'posts'>('overview')
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [newPost, setNewPost] = useState('')
  const [showCreatePost, setShowCreatePost] = useState(false)

  useEffect(() => {
    if (groupId) {
      loadGroupDetails()
    }
  }, [groupId])

  const loadGroupDetails = async () => {
    try {
      // Simular carga de datos del grupo
      const groupData: Group = {
        id: groupId || '1',
        nombre: 'Amantes del Deporte',
        descripcion: 'Grupo para compartir actividades deportivas y eventos relacionados con el fitness. Aquí podrás encontrar compañeros para entrenar, compartir rutinas, participar en eventos deportivos y mantener un estilo de vida saludable.',
        miembros: 45,
        max_miembros: 100,
        privacidad: 'publico',
        categoria: 'Deporte',
        isMember: true,
        isAdmin: false,
        fecha_creacion: '2024-01-15',
        id_creador: 'user1',
        nombre_creador: 'Juan Pérez',
        tags: ['deporte', 'fitness', 'salud', 'entrenamiento', 'running']
      }

      const membersData: GroupMember[] = [
        {
          id: '1',
          nombre: 'Juan',
          apellido: 'Pérez',
          nombre_usuario: 'juanperez',
          fecha_union: '2024-01-15',
          rol: 'admin',
          verificado: true
        },
        {
          id: '2',
          nombre: 'María',
          apellido: 'García',
          nombre_usuario: 'mariagarcia',
          fecha_union: '2024-01-16',
          rol: 'moderador',
          verificado: true
        },
        {
          id: '3',
          nombre: 'Carlos',
          apellido: 'López',
          nombre_usuario: 'carloslopez',
          fecha_union: '2024-01-17',
          rol: 'miembro',
          verificado: false
        },
        {
          id: '4',
          nombre: 'Ana',
          apellido: 'Martínez',
          nombre_usuario: 'anamartinez',
          fecha_union: '2024-01-18',
          rol: 'miembro',
          verificado: true
        }
      ]

      const postsData: GroupPost[] = [
        {
          id: '1',
          texto: '¡Hola a todos! ¿Alguien quiere unirse a mi rutina de running mañana por la mañana? Saldremos a las 7:00 AM desde el parque central.',
          fecha_creacion: '2024-01-20T10:30:00Z',
          autor: {
            id: '1',
            nombre: 'Juan',
            apellido: 'Pérez',
            nombre_usuario: 'juanperez',
            foto_perfil_url: undefined
          },
          likes: 12,
          comentarios: 5
        },
        {
          id: '2',
          texto: 'Compartiendo mi rutina de entrenamiento de fuerza para esta semana. ¡Espero que les sirva! 💪',
          fecha_creacion: '2024-01-19T15:45:00Z',
          autor: {
            id: '2',
            nombre: 'María',
            apellido: 'García',
            nombre_usuario: 'mariagarcia',
            foto_perfil_url: undefined
          },
          likes: 8,
          comentarios: 3
        }
      ]

      setGroup(groupData)
      setMembers(membersData)
      setPosts(postsData)
      setLoading(false)
    } catch (error) {
      console.error('Error cargando detalles del grupo:', error)
      setLoading(false)
    }
  }

  const handleJoinGroup = async () => {
    if (!group) return
    
    try {
      setGroup(prev => prev ? { ...prev, isMember: true, miembros: prev.miembros + 1 } : null)
      setShowJoinModal(false)
      alert('¡Te has unido al grupo exitosamente!')
    } catch (error) {
      console.error('Error uniéndose al grupo:', error)
    }
  }

  const handleLeaveGroup = async () => {
    if (!group) return
    
    try {
      setGroup(prev => prev ? { ...prev, isMember: false, miembros: Math.max(0, prev.miembros - 1) } : null)
      setShowLeaveModal(false)
      alert('Has salido del grupo')
      navigate('/grupos')
    } catch (error) {
      console.error('Error saliendo del grupo:', error)
    }
  }

  const handleCreatePost = async () => {
    if (!newPost.trim() || !group) return

    try {
      const post: GroupPost = {
        id: Date.now().toString(),
        texto: newPost,
        fecha_creacion: new Date().toISOString(),
        autor: {
          id: user?.id || '',
          nombre: user?.nombre || '',
          apellido: user?.apellido || '',
          nombre_usuario: user?.nombre_usuario || '',
          foto_perfil_url: user?.foto_perfil_url
        },
        likes: 0,
        comentarios: 0
      }

      setPosts(prev => [post, ...prev])
      setNewPost('')
      setShowCreatePost(false)
      alert('Publicación creada exitosamente')
    } catch (error) {
      console.error('Error creando publicación:', error)
    }
  }

  const handleBackToGroups = () => {
    navigate('/grupos')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando grupo...</p>
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Grupo no encontrado</h3>
          <p className="text-gray-600 mb-6">El grupo que buscas no existe o ha sido eliminado</p>
          <button 
            className="btn btn-primary"
            onClick={handleBackToGroups}
          >
            Volver a Grupos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              className="btn btn-ghost btn-sm md:btn-md text-blue-600 hover:text-blue-800 transition-colors"
              onClick={handleBackToGroups}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver a Grupos
            </button>
            <h1 className="text-lg md:text-xl font-bold text-gray-800">{group.nombre}</h1>
            <div className="flex gap-2">
              {group.isMember ? (
                <button 
                  className="btn btn-error btn-sm md:btn-md"
                  onClick={() => setShowLeaveModal(true)}
                >
                  Salir del Grupo
                </button>
              ) : (
                <button 
                  className="btn btn-success btn-sm md:btn-md"
                  onClick={() => setShowJoinModal(true)}
                >
                  Unirse al Grupo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute top-4 right-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                group.privacidad === 'publico' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {group.privacidad === 'publico' ? 'Público' : 'Privado'}
              </span>
            </div>
            {group.isAdmin && (
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Admin
                </span>
              </div>
            )}
            <div className="absolute bottom-4 left-4 text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{group.nombre}</h2>
              <p className="text-white/90 text-sm md:text-base">{group.descripcion}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{group.miembros}</div>
            <div className="text-sm text-gray-600">Miembros</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{posts.length}</div>
            <div className="text-sm text-gray-600">Publicaciones</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{group.categoria}</div>
            <div className="text-sm text-gray-600">Categoría</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{new Date(group.fecha_creacion).toLocaleDateString()}</div>
            <div className="text-sm text-gray-600">Creado</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'overview' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Resumen
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'members' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('members')}
            >
              <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Miembros ({members.length})
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'posts' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('posts')}
            >
              <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Publicaciones ({posts.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Información del Grupo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <p><strong>Creado por:</strong> {group.nombre_creador}</p>
                    <p><strong>Fecha de creación:</strong> {new Date(group.fecha_creacion).toLocaleDateString()}</p>
                    <p><strong>Categoría:</strong> {group.categoria}</p>
                    <p><strong>Privacidad:</strong> {group.privacidad === 'publico' ? 'Público' : 'Privado'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {group.tags.map((tag, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Descripción</h3>
                <p className="text-gray-700 leading-relaxed">{group.descripcion}</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Actividad Reciente</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">María García creó una nueva publicación</span>
                    <span className="text-xs text-gray-400 ml-auto">hace 2 horas</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Carlos López se unió al grupo</span>
                    <span className="text-xs text-gray-400 ml-auto">hace 1 día</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Miembros del Grupo</h3>
                <span className="text-sm text-gray-500">{members.length} de {group.max_miembros} miembros</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <img 
                      src={member.foto_perfil_url || '/placeholder.png'} 
                      alt={`Foto de ${member.nombre}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{member.nombre} {member.apellido}</div>
                      <div className="text-sm text-gray-500">@{member.nombre_usuario}</div>
                      <div className="text-xs text-gray-400">Se unió {new Date(member.fecha_union).toLocaleDateString()}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      member.rol === 'admin' ? 'bg-red-100 text-red-800' :
                      member.rol === 'moderador' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {member.rol}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'posts' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Publicaciones del Grupo</h3>
                {group.isMember && (
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowCreatePost(true)}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Crear Publicación
                  </button>
                )}
              </div>
              
              {posts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📝</div>
                  <p className="text-gray-500">No hay publicaciones en este grupo</p>
                  {group.isMember && (
                    <button 
                      className="btn btn-primary mt-4"
                      onClick={() => setShowCreatePost(true)}
                    >
                      Crear la Primera Publicación
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <img 
                          src={post.autor.foto_perfil_url || '/placeholder.png'} 
                          alt={`Foto de ${post.autor.nombre}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-medium text-gray-800">{post.autor.nombre} {post.autor.apellido}</div>
                          <div className="text-sm text-gray-500">@{post.autor.nombre_usuario}</div>
                        </div>
                        <span className="text-xs text-gray-400 ml-auto">
                          {new Date(post.fecha_creacion).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{post.texto}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <button className="flex items-center gap-1 hover:text-blue-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {post.likes}
                        </button>
                        <button className="flex items-center gap-1 hover:text-blue-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {post.comentarios}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Unirse al Grupo</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres unirte al grupo "{group.nombre}"?
            </p>
            <div className="modal-action">
              <button 
                className="btn btn-ghost"
                onClick={() => setShowJoinModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-success"
                onClick={handleJoinGroup}
              >
                Unirse
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Modal */}
      {showLeaveModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Salir del Grupo</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres salir del grupo "{group.nombre}"? No podrás ver las publicaciones ni participar en las actividades del grupo.
            </p>
            <div className="modal-action">
              <button 
                className="btn btn-ghost"
                onClick={() => setShowLeaveModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-error"
                onClick={handleLeaveGroup}
              >
                Salir del Grupo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Crear Publicación</h3>
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">¿Qué quieres compartir con el grupo?</span>
                </label>
                <textarea 
                  className="textarea textarea-bordered w-full h-32"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Escribe tu publicación aquí..."
                />
              </div>
            </div>
            <div className="modal-action">
              <button 
                className="btn btn-ghost"
                onClick={() => setShowCreatePost(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleCreatePost}
                disabled={!newPost.trim()}
              >
                Publicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GroupDetailPage
