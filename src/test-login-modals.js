/**
 * Script de prueba para los modales de error del login
 * 
 * Este archivo contiene funciones para simular diferentes tipos de errores
 * y verificar que los modales se muestren correctamente.
 */

// Función para simular error de credenciales inválidas
function simulateCredentialsError() {
  const error = new Error('Invalid credentials');
  error.message = 'credenciales inválidas';
  throw error;
}

// Función para simular error de contraseña incorrecta
function simulatePasswordError() {
  const error = new Error('Wrong password');
  error.message = 'contraseña incorrecta';
  throw error;
}

// Función para simular error de conexión
function simulateConnectionError() {
  const error = new Error('Failed to fetch');
  throw error;
}

// Función para simular error del servidor
function simulateServerError() {
  const error = new Error('Internal server error');
  error.message = 'Error interno del servidor';
  throw error;
}

// Función para probar el manejo de errores
function testErrorHandling(errorType) {
  console.log(`🧪 Probando error: ${errorType}`);
  
  try {
    switch (errorType) {
      case 'credentials':
        simulateCredentialsError();
        break;
      case 'password':
        simulatePasswordError();
        break;
      case 'connection':
        simulateConnectionError();
        break;
      case 'server':
        simulateServerError();
        break;
      default:
        throw new Error('Error desconocido');
    }
  } catch (error) {
    console.log(`❌ Error capturado: ${error.message}`);
    
    // Simular el procesamiento de errores del componente
    let msg = 'Error de conexión. Verifica tu conexión a internet.';
    let type = 'connection';
    
    if (error.message === 'Failed to fetch') {
      msg = 'No se pudo conectar con el servidor. Intenta más tarde.';
      type = 'server';
    } else if (
      error.message.toLowerCase().includes('credenciales inválidas') ||
      error.message.toLowerCase().includes('invalid credentials') ||
      error.message.toLowerCase().includes('user not found') ||
      error.message.toLowerCase().includes('usuario no encontrado')
    ) {
      msg = 'Correo/usuario o contraseña inválidos.';
      type = 'credentials';
    } else if (
      error.message.toLowerCase().includes('contraseña incorrecta') ||
      error.message.toLowerCase().includes('password incorrect') ||
      error.message.toLowerCase().includes('wrong password')
    ) {
      msg = 'La contraseña ingresada es incorrecta.';
      type = 'password';
    } else {
      msg = error.message;
      type = 'server';
    }
    
    console.log(`📝 Mensaje procesado: ${msg}`);
    console.log(`🏷️  Tipo de error: ${type}`);
    console.log(`✅ Modal que se mostraría: ${getModalTitle(type)}`);
    console.log('---');
  }
}

// Función auxiliar para obtener el título del modal
function getModalTitle(errorType) {
  const titles = {
    'credentials': 'Usuario o Correo Incorrecto',
    'password': 'Contraseña Incorrecta',
    'connection': 'Error de Conexión',
    'server': 'Error del Servidor'
  };
  return titles[errorType] || 'Error de Inicio de Sesión';
}

// Ejecutar todas las pruebas
console.log('🚀 Iniciando pruebas de modales de error del login...\n');

const errorTypes = ['credentials', 'password', 'connection', 'server'];

errorTypes.forEach(type => {
  testErrorHandling(type);
});

console.log('✅ Todas las pruebas completadas');

// Exportar funciones para uso en el navegador
if (typeof window !== 'undefined') {
  window.testLoginModals = {
    simulateCredentialsError,
    simulatePasswordError,
    simulateConnectionError,
    simulateServerError,
    testErrorHandling
  };
}
