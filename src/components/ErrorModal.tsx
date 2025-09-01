/**
 * ========================================
 * COMPONENTE ERROR MODAL DE GEOPLANNER
 * ========================================
 * 
 * Modal personalizado para mostrar errores de manera elegante
 * y consistente con el diseño de GeoPlanner.
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * - Diseño consistente con la marca
 * - Diferentes tipos de errores (error, warning, info)
 * - Animaciones suaves
 * - Botones de acción personalizables
 * - Responsive design
 * 
 * IMPORTANTE PARA EL EQUIPO:
 * - Reemplaza los alerts del navegador
 * - Mantiene consistencia visual
 * - Mejora la experiencia de usuario
 * - Fácil de usar en cualquier componente
 */

import React from 'react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'error',
  onConfirm,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  showCancel = false
}) => {
  if (!isOpen) return null;

  // Configuración según el tipo de error
  const getTypeConfig = () => {
    switch (type) {
      case 'error':
        return {
          icon: '❌',
          bgColor: 'bg-red-500',
          textColor: 'text-red-600',
          borderColor: 'border-red-200',
          buttonClass: 'btn-error'
        };
      case 'warning':
        return {
          icon: '⚠️',
          bgColor: 'bg-yellow-500',
          textColor: 'text-yellow-600',
          borderColor: 'border-yellow-200',
          buttonClass: 'btn-warning'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          bgColor: 'bg-blue-500',
          textColor: 'text-blue-600',
          borderColor: 'border-blue-200',
          buttonClass: 'btn-info'
        };
      case 'success':
        return {
          icon: '✅',
          bgColor: 'bg-green-500',
          textColor: 'text-green-600',
          borderColor: 'border-green-200',
          buttonClass: 'btn-success'
        };
      default:
        return {
          icon: '❌',
          bgColor: 'bg-red-500',
          textColor: 'text-red-600',
          borderColor: 'border-red-200',
          buttonClass: 'btn-error'
        };
    }
  };

  const config = getTypeConfig();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all duration-300 ease-out scale-100">
        {/* Header */}
        <div className={`flex items-center gap-3 p-4 ${config.bgColor} text-white rounded-t-lg`}>
          <span className="text-2xl">{config.icon}</span>
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={handleClose}
            className="ml-auto text-white hover:text-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <p className={`text-gray-700 leading-relaxed ${config.textColor}`}>
            {message}
          </p>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
          {showCancel && (
            <button
              onClick={handleClose}
              className="btn btn-outline"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`btn ${config.buttonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
