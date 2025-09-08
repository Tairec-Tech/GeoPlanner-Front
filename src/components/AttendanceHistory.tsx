import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import type { HistorialAsistenciaResponse } from '../services/api'

interface AttendanceHistoryProps {
  eventId: string
  eventTitle: string
  onClose: () => void
}

const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({ eventId, eventTitle, onClose }) => {
  const [historial, setHistorial] = useState<HistorialAsistenciaResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadHistorial()
  }, [eventId])

  const loadHistorial = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await apiService.getAttendanceHistory(eventId)
      setHistorial(data)
    } catch (err) {
      console.error('Error al cargar historial:', err)
      setError('Error al cargar el historial de asistencia.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg text-primary"></div>
            <p className="mt-4 text-gray-600">Cargando historial...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">📊 Historial de Asistencia</h2>
            <p className="text-gray-600">{eventTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {historial.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay registros de asistencia aún.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Participante</th>
                  <th>Verificado por</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Ubicación</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div className="font-medium">{record.nombre_usuario}</div>
                    </td>
                    <td>{record.nombre_verificador}</td>
                    <td>{formatDate(record.fecha_verificacion)}</td>
                    <td>
                      <span className={`badge ${
                        record.estado_verificacion === 'verificado' 
                          ? 'badge-success' 
                          : 'badge-warning'
                      }`}>
                        {record.estado_verificacion === 'verificado' ? '✅ Verificado' : '⏳ Pendiente'}
                      </span>
                    </td>
                    <td>
                      {record.ubicacion_verificacion_lat && record.ubicacion_verificacion_lng ? (
                        <span className="text-sm text-gray-600">
                          {record.ubicacion_verificacion_lat.toFixed(4)}, {record.ubicacion_verificacion_lng.toFixed(4)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">No disponible</span>
                      )}
                    </td>
                    <td>
                      {record.notas_verificacion ? (
                        <span className="text-sm">{record.notas_verificacion}</span>
                      ) : (
                        <span className="text-sm text-gray-400">Sin notas</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="text-center mt-6">
          <button
            onClick={onClose}
            className="btn btn-primary"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default AttendanceHistory
