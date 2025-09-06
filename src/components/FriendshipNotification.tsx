import React, { useState } from 'react'
import { apiService } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

interface FriendshipNotificationProps {
  notification: {
    id: string
    id_usuario_origen: string
    nombre_usuario_origen: string
    username_usuario_origen: string
    mensaje: string
    tipo: string
    fecha_creacion: string
  }
  onClose: () => void
  onUpdate: () => void
}

const FriendshipNotification: React.FC<FriendshipNotificationProps> = ({ 
  notification, 
  onClose, 
  onUpdate 
}) => {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const handleAccept = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      await apiService.acceptFriendshipRequest(notification.id_usuario_origen, user.id)
      alert('¡Solicitud de amistad aceptada!')
      onUpdate()
      onClose()
    } catch (error) {
      console.error('Error al aceptar solicitud:', error)
      alert('Error al aceptar la solicitud de amistad')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      await apiService.rejectFriendshipRequest(notification.id_usuario_origen, user.id)
      alert('Solicitud de amistad rechazada')
      onUpdate()
      onClose()
    } catch (error) {
      console.error('Error al rechazar solicitud:', error)
      alert('Error al rechazar la solicitud de amistad')
    } finally {
      setLoading(false)
    }
  }

  if (notification.tipo !== 'solicitud_amistad') {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">🤝 Solicitud de Amistad</h2>
            <p className="text-gray-600 text-sm">{notification.fecha_creacion}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <p className="text-gray-800 font-medium">
              {notification.nombre_usuario_origen}
            </p>
            <p className="text-gray-600 text-sm">
              @{notification.username_usuario_origen}
            </p>
          </div>
          
          <p className="text-gray-700 mb-6">
            {notification.mensaje}
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleAccept}
            disabled={loading}
            className="btn btn-success flex-1"
          >
            {loading ? (
              <div className="loading loading-spinner loading-sm"></div>
            ) : (
              '✅ Aceptar'
            )}
          </button>
          
          <button
            onClick={handleReject}
            disabled={loading}
            className="btn btn-error flex-1"
          >
            {loading ? (
              <div className="loading loading-spinner loading-sm"></div>
            ) : (
              '❌ Rechazar'
            )}
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="btn btn-outline btn-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default FriendshipNotification
