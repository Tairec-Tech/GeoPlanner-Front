// Configuración de la API
const isDevelopment = import.meta.env.DEV;

// URLs del backend
export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:8000'  // Desarrollo local
  : 'https://geoplanner-back.onrender.com';  // Producción - CAMBIA ESTA URL

// Endpoints de la API
export const API_ENDPOINTS = {
  // Autenticación
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  SEND_VERIFICATION: '/auth/send-verification',
  VERIFY_EMAIL: '/auth/verify-email',
  RESEND_VERIFICATION: '/auth/resend-verification',
  RESEND_RESET_CODE: '/auth/resend-reset-code',
  
  // Usuarios
  CHECK_USERNAME: '/users/check-username',
  CHECK_EMAIL: '/users/check-email',
  
  // Otros endpoints...
} as const;

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// Función helper para hacer requests
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = buildApiUrl(endpoint);
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };
  
  return fetch(url, { ...defaultOptions, ...options });
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  buildApiUrl,
  apiRequest,
};
