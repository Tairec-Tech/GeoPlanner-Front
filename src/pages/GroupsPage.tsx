import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

// interface GroupMember {
//   id: string
//   nombre: string
//   apellido: string
//   nombre_usuario: string
//   foto_perfil_url?: string
//   fecha_union: string
//   rol: 'admin' | 'moderador' | 'miembro'
//   verificado: boolean
// }

const GroupsPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [groups, setGroups] = useState<Group[]>([])
  const [myGroups, setMyGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  const [newGroup, setNewGroup] = useState({
    nombre: '',
    descripcion: '',
    categoria: 'Social',
    privacidad: 'publico' as 'publico' | 'privado',
    max_miembros: 50,
    tags: [] as string[],
    nuevoTag: ''
  })

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    const sampleGroups: Group[] = [
      {
        id: '1',
        nombre: 'Amantes del Deporte',
        descripcion: 'Grupo para compartir actividades deportivas y eventos relacionados con el fitness',
        miembros: 45,
        max_miembros: 100,
        privacidad: 'publico',
        categoria: 'Deporte',
        isMember: true,
        isAdmin: false,
        fecha_creacion: '2024-01-15',
        id_creador: 'user1',
        nombre_creador: 'Juan Pérez',
        tags: ['deporte', 'fitness', 'salud']
      },
      {
        id: '2',
        nombre: 'Estudiantes de Programación',
        descripcion: 'Comunidad para estudiantes y profesionales de programación',
        miembros: 78,
        max_miembros: 150,
        privacidad: 'publico',
        categoria: 'Estudio',
        isMember: false,
        isAdmin: false,
        fecha_creacion: '2024-02-01',
        id_creador: 'user2',
        nombre_creador: 'María García',
        tags: ['programación', 'tecnología', 'desarrollo']
      },
      {
        id: '3',
        nombre: 'Cine Club',
        descripcion: 'Discusiones sobre películas, series y eventos cinematográficos',
        miembros: 32,
        max_miembros: 80,
        privacidad: 'privado',
        categoria: 'Cultural',
        isMember: true,
        isAdmin: true,
        fecha_creacion: '2024-01-20',
        id_creador: 'user3',
        nombre_creador: 'Carlos López',
        tags: ['cine', 'películas', 'entretenimiento']
      }
    ]
    
    setGroups(sampleGroups)
    setMyGroups(sampleGroups.filter(g => g.isMember))
    setLoading(false)
  }

  const handleCreateGroup = async () => {
    if (!newGroup.nombre.trim() || !newGroup.descripcion.trim()) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    const nuevoGrupo: Group = {
      id: Date.now().toString(),
      nombre: newGroup.nombre,
      descripcion: newGroup.descripcion,
      categoria: newGroup.categoria,
      privacidad: newGroup.privacidad,
      max_miembros: newGroup.max_miembros,
      miembros: 1,
      isMember: true,
      isAdmin: true,
      fecha_creacion: new Date().toISOString(),
      id_creador: user?.id || '',
      nombre_creador: `${user?.nombre} ${user?.apellido}`,
      tags: newGroup.tags
    }

    setGroups(prev => [nuevoGrupo, ...prev])
    setMyGroups(prev => [nuevoGrupo, ...prev])
    
    setNewGroup({
      nombre: '',
      descripcion: '',
      categoria: 'Social',
      privacidad: 'publico',
      max_miembros: 50,
      tags: [],
      nuevoTag: ''
    })
    
    setShowCreateModal(false)
    alert('¡Grupo creado exitosamente!')
  }

  const handleJoinGroup = async (groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, isMember: true, miembros: group.miembros + 1 }
        : group
    ))
    setMyGroups(prev => {
      const groupToAdd = groups.find(g => g.id === groupId)
      return groupToAdd ? [groupToAdd, ...prev] : prev
    })
    alert('¡Te has unido al grupo exitosamente!')
  }

  const handleLeaveGroup = async (groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, isMember: false, miembros: Math.max(0, group.miembros - 1) }
        : group
    ))
    setMyGroups(prev => prev.filter(group => group.id !== groupId))
    alert('Has salido del grupo')
  }

  const handleViewGroup = (group: Group) => {
    navigate(`/grupos/${group.id}`)
  }

  const handleAddTag = () => {
    if (newGroup.nuevoTag.trim() && !newGroup.tags.includes(newGroup.nuevoTag.trim())) {
      setNewGroup(prev => ({
        ...prev,
        tags: [...prev.tags, prev.nuevoTag.trim()],
        nuevoTag: ''
      }))
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setNewGroup(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleBackToDashboard = () => {
    navigate('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando grupos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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
            <h1 className="text-lg md:text-xl font-bold text-gray-800">Grupos</h1>
            <button 
              className="btn btn-primary btn-sm md:btn-md"
              onClick={() => setShowCreateModal(true)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear Grupo
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'all' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('all')}
            >
              <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Todos los Grupos ({groups.length})
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'my' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('my')}
            >
              <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Mis Grupos ({myGroups.length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeTab === 'all' ? groups : myGroups).map((group) => (
            <div key={group.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    group.privacidad === 'publico' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {group.privacidad === 'publico' ? 'Público' : 'Privado'}
                  </span>
                </div>
                {group.isAdmin && (
                  <div className="absolute top-4 left-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Admin
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{group.nombre}</h3>
                <p className="text-gray-600 mb-4">{group.descripcion}</p>
                
                <div className="mb-4">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mb-2">
                    {group.categoria}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {group.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>👥 {group.miembros}/{group.max_miembros}</span>
                    <span>📅 {new Date(group.fecha_creacion).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    className="btn btn-primary btn-sm flex-1"
                    onClick={() => handleViewGroup(group)}
                  >
                    Ver Grupo
                  </button>
                  {group.isMember ? (
                    <button 
                      className="btn btn-error btn-sm"
                      onClick={() => handleLeaveGroup(group.id)}
                    >
                      Salir
                    </button>
                  ) : (
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => handleJoinGroup(group.id)}
                    >
                      Unirse
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {(activeTab === 'all' ? groups : myGroups).length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {activeTab === 'all' ? 'No hay grupos disponibles' : 'No perteneces a ningún grupo'}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'all' 
                ? 'Los grupos aparecerán aquí cuando se creen' 
                : 'Únete a grupos para verlos aquí'
              }
            </p>
            {activeTab === 'my' && (
              <button 
                className="btn btn-primary"
                onClick={() => setActiveTab('all')}
              >
                Explorar Grupos
              </button>
            )}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Crear Nuevo Grupo</h3>
            
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Nombre del Grupo *</span>
                </label>
                <input 
                  type="text" 
                  className="input input-bordered w-full"
                  value={newGroup.nombre}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej: Amantes del Deporte"
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Descripción *</span>
                </label>
                <textarea 
                  className="textarea textarea-bordered w-full h-24"
                  value={newGroup.descripcion}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Describe el propósito y actividades del grupo..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Categoría</span>
                  </label>
                  <select 
                    className="select select-bordered w-full"
                    value={newGroup.categoria}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, categoria: e.target.value }))}
                  >
                    <option value="Social">Social</option>
                    <option value="Deporte">Deporte</option>
                    <option value="Estudio">Estudio</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Privacidad</span>
                  </label>
                  <select 
                    className="select select-bordered w-full"
                    value={newGroup.privacidad}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, privacidad: e.target.value as 'publico' | 'privado' }))}
                  >
                    <option value="publico">Público</option>
                    <option value="privado">Privado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Máximo de Miembros</span>
                </label>
                <input 
                  type="number" 
                  className="input input-bordered w-full"
                  value={newGroup.max_miembros}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, max_miembros: parseInt(e.target.value) }))}
                  min="2"
                  max="1000"
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Tags (opcional)</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input 
                    type="text" 
                    className="input input-bordered flex-1"
                    value={newGroup.nuevoTag}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, nuevoTag: e.target.value }))}
                    placeholder="Agregar tag..."
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={handleAddTag}
                  >
                    Agregar
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {newGroup.tags.map((tag, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      #{tag}
                      <button 
                        onClick={() => handleRemoveTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-action">
              <button 
                className="btn btn-ghost"
                onClick={() => setShowCreateModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleCreateGroup}
                disabled={!newGroup.nombre.trim() || !newGroup.descripcion.trim()}
              >
                Crear Grupo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GroupsPage
