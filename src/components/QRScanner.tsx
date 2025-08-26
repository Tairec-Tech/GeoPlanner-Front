import React, { useState, useEffect, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { apiService, QRVerificationRequest, QRVerificationResponse } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

interface QRScannerProps {
  onVerificationComplete: (result: QRVerificationResponse) => void
  onClose: () => void
}

const QRScanner: React.FC<QRScannerProps> = ({ onVerificationComplete, onClose }) => {
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    // Crear el escáner
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      false
    )

    // Función que se ejecuta cuando se detecta un código QR
    const onScanSuccess = async (decodedText: string) => {
      try {
        setScanning(true)
        setError(null)
        setSuccess(null)

        // Obtener ubicación actual si está disponible
        let lat: number | undefined
        let lng: number | undefined

        if (navigator.geolocation) {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
            })
            lat = position.coords.latitude
            lng = position.coords.longitude
          } catch (geoError) {
            console.log('No se pudo obtener la ubicación:', geoError)
          }
        }

        // Preparar datos para verificación
        const verificationData: QRVerificationRequest = {
          qr_data: decodedText,
          verificador_id: user.id,
          ubicacion_lat: lat,
          ubicacion_lng: lng,
          notas: `Verificado por ${user.nombre} ${user.apellido}`
        }

        // Enviar verificación al backend
        const result = await apiService.verifyQRCode(verificationData)
        
        if (result.success) {
          setSuccess(result.message)
          onVerificationComplete(result)
        } else {
          setError(result.message)
        }

      } catch (err) {
        console.error('Error al verificar QR:', err)
        setError('Error al verificar el código QR. Inténtalo de nuevo.')
      } finally {
        setScanning(false)
      }
    }

    // Función que se ejecuta cuando hay un error en el escaneo
    const onScanFailure = (error: string) => {
      // Solo mostrar errores importantes, no los de "no se encontró QR"
      if (!error.includes('NotFound') && !error.includes('No QR code found')) {
        console.log('Error de escaneo:', error)
      }
    }

    // Inicializar el escáner
    scannerRef.current.render(onScanSuccess, onScanFailure)

    return () => {
      // Limpiar el escáner al desmontar
      if (scannerRef.current) {
        scannerRef.current.clear()
      }
    }
  }, [user, onVerificationComplete])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">📱 Escáner de QR</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="text-center mb-4">
          <p className="text-gray-600 mb-2">
            Escanea el código QR del participante para verificar su asistencia
          </p>
        </div>

        {/* Contenedor para el escáner */}
        <div id="qr-reader" className="mb-4"></div>

        {/* Estados de carga y error */}
        {scanning && (
          <div className="text-center py-4">
            <div className="loading loading-spinner loading-lg text-primary"></div>
            <p className="mt-2 text-gray-600">Verificando asistencia...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={onClose}
            className="btn btn-primary"
            disabled={scanning}
          >
            Cerrar Escáner
          </button>
        </div>
      </div>
    </div>
  )
}

export default QRScanner
