# 🌍 GeoPlanner Frontend - Interfaz de Usuario React

## 📋 Descripción General

GeoPlanner Frontend es la interfaz de usuario moderna y responsiva de la plataforma GeoPlanner, desarrollada con React 18 y TypeScript. Esta aplicación web proporciona una experiencia de usuario intuitiva para crear, descubrir y participar en eventos basados en ubicación geográfica.

### 🎯 Propósito del Frontend
- **Interfaz intuitiva** para la gestión de eventos y actividades
- **Experiencia de usuario fluida** con navegación moderna
- **Integración con mapas** para visualización geográfica
- **Sistema de autenticación** seguro y amigable
- **Componentes reutilizables** para mantenimiento eficiente

---

## 🏗️ Arquitectura Frontend

### Stack Tecnológico
- **Framework**: React 18 con TypeScript
- **Bundler**: Vite (desarrollo rápido)
- **Estilos**: Tailwind CSS + DaisyUI
- **Enrutamiento**: React Router v6
- **Estado Global**: Context API (AuthContext)
- **Mapas**: Leaflet.js con react-leaflet
- **Procesamiento de Imágenes**: Cropper.js
- **Escáner QR**: html5-qrcode
- **Gráficos**: Chart.js con react-chartjs-2

### Estructura de Carpetas
```
src/
├── components/          # Componentes React reutilizables
│   ├── Dashboard.tsx    # Panel principal de la aplicación
│   ├── LandingPage.tsx  # Página de bienvenida
│   ├── LoginPage.tsx    # Autenticación de usuarios
│   ├── RegisterStep1.tsx # Registro - Información personal
│   ├── RegisterStep2.tsx # Registro - Credenciales
│   ├── RegisterStep3.tsx # Registro - Ubicación y foto
│   ├── ProfilePage.tsx  # Gestión de perfil de usuario
│   ├── QRScanner.tsx    # Escáner de códigos QR
│   ├── QRCodeDisplay.tsx # Visualización de códigos QR
│   ├── AttendanceHistory.tsx # Historial de asistencia
│   └── FriendshipNotification.tsx # Notificaciones de amistad
├── contexts/           # Contextos de React
│   └── AuthContext.tsx # Gestión de autenticación global
├── services/           # Servicios de API
│   └── api.ts         # Comunicación con el backend
├── App.tsx            # Componente raíz de la aplicación
├── main.tsx           # Punto de entrada
└── index.css          # Estilos globales
```

---

## 🚀 Características del Frontend

### 👤 Sistema de Autenticación
- **Login intuitivo**: Formulario con validaciones en tiempo real
- **Registro en 3 pasos**: Proceso guiado y amigable
  - Paso 1: Información personal con validación de edad
  - Paso 2: Credenciales con verificación de fortaleza de contraseña
  - Paso 3: Ubicación en mapa y foto de perfil con recorte
- **Protección de rutas**: Acceso controlado a páginas privadas
- **Persistencia de sesión**: Tokens JWT en localStorage

### 📍 Integración con Mapas
- **Mapa interactivo**: Leaflet.js con OpenStreetMap
- **Geolocalización**: Detección automática de ubicación
- **Selección de ubicación**: Click en mapa para establecer coordenadas
- **Geocodificación**: Conversión de direcciones a coordenadas
- **Rutas múltiples**: Múltiples puntos por evento
- **Marcadores dinámicos**: Visualización de eventos en mapa

### 📝 Gestión de Eventos
- **Creación de eventos**: Modal completo con validaciones
- **Tipos de eventos**: Social, Deporte, Estudio, Otros
- **Niveles de privacidad**: Público, Amigos, Privado
- **Filtros avanzados**: Por tipo, fecha, ubicación, privacidad
- **Búsqueda en tiempo real**: Filtrado instantáneo de resultados

### 🎫 Sistema de Inscripciones
- **Inscripción/Desinscripción**: Botones dinámicos según estado
- **Generación de QR**: Códigos únicos para verificación
- **Visualización de QR**: Componente dedicado con opciones de descarga
- **Estado de participación**: Indicadores visuales claros

### 📊 Sistema QR y Asistencia
- **Escáner QR**: Herramienta para organizadores
- **Historial de asistencia**: Vista detallada con estadísticas
- **Gráficos interactivos**: Chart.js para métricas visuales
- **Estadísticas por evento**: Porcentajes, género, horarios

### 🔔 Sistema de Notificaciones
- **Notificaciones en tiempo real**: Actualizaciones automáticas
- **Contador de no leídas**: Indicador visual en tiempo real
- **Tipos de notificación**: Amistad, actividad, asistencia
- **Gestión de notificaciones**: Marcar como leída, eliminar

### 👥 Sistema de Amistades
- **Solicitudes de amistad**: Envío y gestión
- **Notificaciones de amistad**: Componente dedicado
- **Estados de amistad**: Pendiente, aceptada, rechazada, bloqueada
- **Lista de amigos**: Vista organizada de relaciones

### 🗓️ Agenda Personal
- **Vista de actividades**: Lista cronológica de eventos
- **Creación de actividades**: Formulario simplificado
- **Recordatorios**: Notificaciones automáticas
- **Organización temporal**: Filtros por fecha

### 🎨 Temas y Personalización
- **9 temas disponibles**: Clara, Noche, Café, Cian, Verde, Rosa, Púrpura, Naranja, Rojo
- **Cambio dinámico**: Actualización instantánea de tema
- **Persistencia**: Tema guardado en localStorage
- **Diseño responsivo**: Adaptación a diferentes dispositivos

---

## 🔧 Configuración e Instalación

### Requisitos Previos
- **Node.js** 18+ 
- **npm** o **yarn**
- **Git** (control de versiones)

### Instalación Rápida
```bash
# Clonar el repositorio
git clone <repository-url>
cd GeoPlanner-Front

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### Scripts Disponibles
```bash
npm run dev          # Servidor de desarrollo (http://localhost:5173)
npm run build        # Construir para producción
npm run preview      # Vista previa de producción
npm run lint         # Verificar código con ESLint
npm run type-check   # Verificar tipos TypeScript
```

### Configuración de Variables de Entorno
Crear archivo `.env` en la raíz del proyecto:
```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=GeoPlanner
VITE_APP_VERSION=1.0.0
```

---

## 📱 Componentes Principales

### Dashboard.tsx
**Propósito**: Panel principal de la aplicación
- **Funcionalidades**:
  - Vista de eventos con filtros
  - Mapa interactivo
  - Sistema de notificaciones
  - Gestión de QR y asistencia
  - Creación de eventos
- **Estados principales**:
  - Lista de eventos
  - Filtros aplicados
  - Modales activos
  - Notificaciones

### LandingPage.tsx
**Propósito**: Página de bienvenida
- **Características**:
  - Presentación de la plataforma
  - Navegación a login/registro
  - Información sobre funcionalidades
  - Diseño atractivo y moderno

### LoginPage.tsx
**Propósito**: Autenticación de usuarios
- **Funcionalidades**:
  - Formulario de login
  - Validaciones en tiempo real
  - Manejo de errores
  - Redirección post-login

### RegisterStep*.tsx
**Propósito**: Proceso de registro en 3 pasos
- **RegisterStep1.tsx**: Información personal
- **RegisterStep2.tsx**: Credenciales
- **RegisterStep3.tsx**: Ubicación y foto
- **Características**:
  - Validación progresiva
  - Navegación entre pasos
  - Almacenamiento temporal
  - Integración con mapas

### ProfilePage.tsx
**Propósito**: Gestión de perfil de usuario
- **Funcionalidades**:
  - Edición de información personal
  - Cambio de foto de perfil
  - Gestión de amigos
  - Configuraciones de privacidad

### QRScanner.tsx
**Propósito**: Escáner de códigos QR
- **Características**:
  - Escaneo en tiempo real
  - Validación de códigos
  - Registro de asistencia
  - Interfaz intuitiva

### AttendanceHistory.tsx
**Propósito**: Historial de asistencia
- **Funcionalidades**:
  - Lista de verificaciones
  - Estadísticas detalladas
  - Gráficos interactivos
  - Filtros por fecha

---

## 🎨 Sistema de Estilos

### Tailwind CSS
- **Framework de utilidades**: Clases CSS predefinidas
- **Responsive design**: Breakpoints automáticos
- **Temas personalizables**: Configuración en `tailwind.config.js`
- **Optimización**: Purge CSS para producción

### DaisyUI
- **Componentes predefinidos**: Botones, modales, formularios
- **Temas integrados**: 9 temas disponibles
- **Accesibilidad**: Componentes accesibles por defecto
- **Consistencia**: Diseño uniforme en toda la aplicación

### Estilos Personalizados
- **index.css**: Estilos globales y variables CSS
- **Componentes específicos**: Estilos dedicados cuando es necesario
- **Animaciones**: Transiciones suaves y efectos visuales

---

## 🔄 Gestión de Estado

### Context API (AuthContext)
```typescript
// Gestión de autenticación global
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Estados principales
const [user, setUser] = useState<User | null>(null)
const [isAuthenticated, setIsAuthenticated] = useState(false)
const [isLoading, setIsLoading] = useState(true)
```

### Estados Locales
- **useState**: Para estados de componentes individuales
- **useEffect**: Para efectos secundarios y sincronización
- **useRef**: Para referencias a elementos DOM

### Persistencia de Datos
- **localStorage**: Tokens JWT y configuraciones de usuario
- **sessionStorage**: Datos temporales de sesión
- **Cookies**: Configuraciones de preferencias

---

## 🌐 Comunicación con Backend

### Servicio API (api.ts)
```typescript
// Configuración base
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Interceptor para tokens JWT
const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}
```

### Endpoints Principales
- **Autenticación**: `/auth/token`, `/auth/register`, `/auth/me`
- **Publicaciones**: `/posts/`, `/posts/{id}`
- **Usuarios**: `/users/`, `/users/{id}`
- **Amistades**: `/friendship/`
- **Notificaciones**: `/notifications/`
- **QR y Asistencia**: `/qr-attendance/`

### Manejo de Errores
- **Interceptores**: Captura automática de errores HTTP
- **Mensajes de usuario**: Errores amigables y descriptivos
- **Reintentos**: Lógica de reintento para fallos temporales
- **Logout automático**: En caso de token expirado

---

## 🗺️ Integración con Mapas

### Leaflet.js
```typescript
// Configuración del mapa
const mapConfig = {
  center: [10.654, -71.612], // Maracaibo, Venezuela
  zoom: 13,
  scrollWheelZoom: true
}

// Marcadores dinámicos
const renderMarkers = (events: Event[]) => {
  return events.map(event => (
    <Marker key={event.id} position={[event.lat, event.lng]}>
      <Popup>{event.title}</Popup>
    </Marker>
  ))
}
```

### Funcionalidades de Mapa
- **Geolocalización**: Detección automática de ubicación
- **Selección de puntos**: Click para establecer coordenadas
- **Geocodificación**: Búsqueda de direcciones
- **Rutas múltiples**: Visualización de itinerarios
- **Marcadores personalizados**: Iconos específicos por tipo de evento

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Adaptaciones
- **Navegación**: Menú hamburguesa en móvil
- **Mapa**: Tamaño adaptativo según pantalla
- **Formularios**: Layouts optimizados para touch
- **Modales**: Tamaños responsivos

---

## 🔒 Seguridad Frontend

### Validaciones
- **Formularios**: Validación en tiempo real
- **Tipos TypeScript**: Verificación de tipos en compilación
- **Sanitización**: Limpieza de datos de entrada
- **XSS Prevention**: Escape de contenido dinámico

### Autenticación
- **Tokens JWT**: Almacenamiento seguro
- **Expiración**: Manejo automático de tokens expirados
- **Logout**: Limpieza completa de datos de sesión
- **Protección de rutas**: Redirección automática

---

## 🚀 Optimización y Rendimiento

### Lazy Loading
```typescript
// Carga diferida de componentes
const QRScanner = lazy(() => import('./QRScanner'))
const AttendanceHistory = lazy(() => import('./AttendanceHistory'))
```

### Memoización
```typescript
// Optimización de re-renders
const MemoizedEventCard = memo(EventCard)
const MemoizedMap = memo(MapComponent)
```

### Bundle Optimization
- **Code splitting**: División automática de código
- **Tree shaking**: Eliminación de código no utilizado
- **Compresión**: Gzip para archivos estáticos
- **Caching**: Headers de caché optimizados

---

## 🧪 Testing

### Estrategias de Testing
- **Unit tests**: Pruebas de componentes individuales
- **Integration tests**: Pruebas de flujos completos
- **E2E tests**: Pruebas de usuario real
- **Visual regression**: Pruebas de interfaz

### Herramientas
- **Jest**: Framework de testing
- **React Testing Library**: Testing de componentes
- **Cypress**: Testing end-to-end
- **Storybook**: Documentación de componentes

---

## 📦 Despliegue

### Construcción para Producción
```bash
npm run build
```

### Servidor de Producción
```bash
# Usar nginx o similar
npm run preview
```

### Configuración de Servidor
```nginx
# Ejemplo de configuración nginx
server {
    listen 80;
    server_name geoplanner.com;
    root /var/www/geoplanner;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 🔧 Configuración de Desarrollo

### ESLint
```javascript
// eslint.config.js
module.exports = {
  extends: [
    '@eslint/js',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    // Reglas personalizadas
  }
}
```

### TypeScript
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "strict": true
  }
}
```

### Vite
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
})
```

---

## 🤝 Contribución

### Estándares de Código
- **Convenciones**: ESLint + Prettier
- **Documentación**: Comentarios en español
- **Commits**: Mensajes descriptivos
- **Branches**: Feature branches

### Flujo de Desarrollo
1. **Fork** del repositorio
2. **Branch** para nueva funcionalidad
3. **Desarrollo** con tests
4. **Pull Request** con descripción
5. **Code Review** y aprobación
6. **Merge** a main

---

## 📞 Soporte

### Documentación
- **Component Library**: Guía de componentes
- **API Documentation**: Endpoints del backend
- **Deployment Guide**: Instrucciones de despliegue

### Contacto
- **Equipo**: Desarrolladores GeoPlanner
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

*GeoPlanner Frontend - Interfaz moderna para conectar personas* 🌍✨
