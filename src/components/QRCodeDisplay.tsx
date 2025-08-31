import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import type { QRCodeResponse } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

interface QRCodeDisplayProps {
  eventId: string
  eventTitle: string
  onClose: () => void
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ eventId, eventTitle, onClose }) => {
  const [qrData, setQrData] = useState<QRCodeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      generateQRCode()
    }
  }, [user, eventId])

  const generateQRCode = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      
      const response = await apiService.generateQRCode(eventId, user.id)
      setQrData(response)
    } catch (err) {
      console.error('Error al generar QR:', err)
      setError('Error al generar el código QR. Asegúrate de estar inscrito en el evento.')
    } finally {
      setLoading(false)
    }
  }

  const downloadQR = () => {
    if (!qrData) return

    const link = document.createElement('a')
    link.download = `qr-${eventId}-${user?.id}.png`
    link.href = `data:image/png;base64,${qrData.qr_image_base64}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg text-primary"></div>
            <p className="mt-4 text-gray-600">Generando código QR...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="alert alert-error mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
            <button onClick={onClose} className="btn btn-primary">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">📱 Tu Código QR</h2>
            <p className="text-gray-600 text-sm">{eventTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="text-center mb-4">
          <p className="text-gray-600 mb-4">
            Muestra este código QR al organizador del evento para verificar tu asistencia
          </p>
        </div>

        {qrData && (
          <div className="text-center">
            {/* Código QR */}
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block mb-4">
              <img
                src={`data:image/png;base64,${qrData.qr_image_base64}`}
                alt="Código QR"
                className="w-48 h-48"
              />
            </div>

            {/* Información adicional */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
              <h4 className="font-semibold text-gray-800 mb-2">Información del QR:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Evento:</strong> {eventTitle}</p>
                <p><strong>Participante:</strong> {user?.nombre} {user?.apellido}</p>
                <p><strong>ID de Inscripción:</strong> {qrData.inscription_id}</p>
                <p><strong>Generado:</strong> {new Date().toLocaleString('es-ES')}</p>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={downloadQR}
                className="btn btn-outline btn-primary"
              >
                📥 Descargar QR
              </button>
              <button
                onClick={onClose}
                className="btn btn-primary"
              >
                ✅ Entendido
              </button>
            </div>
          </div>
        )}

        {/* Instrucciones */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">💡 Instrucciones:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Guarda este código QR en tu teléfono</li>
            <li>• Preséntalo al organizador al llegar al evento</li>
            <li>• El organizador escaneará tu QR para confirmar asistencia</li>
            <li>• Este QR es único y solo válido para este evento</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default QRCodeDisplay
