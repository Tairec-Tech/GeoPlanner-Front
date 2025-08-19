# GeoPlanner - Red Social Georreferenciada

GeoPlanner es una plataforma de red social que combina la interacción social tradicional con funcionalidades de geolocalización, permitiendo a los usuarios crear y descubrir eventos basados en su ubicación.

## 🚀 Características Principales

### Frontend (React + TypeScript)
- **Mapa Interactivo**: Integración con Leaflet para visualización de eventos
- **Geolocalización**: Detección automática de ubicación del usuario
- **Rutas**: Cálculo de rutas entre puntos usando Leaflet Routing Machine
- **Temas Personalizables**: 9 temas diferentes para personalizar la experiencia
- **Búsqueda en Tiempo Real**: Filtrado de eventos por tipo y búsqueda textual
- **Creación de Eventos**: Modal completo para crear nuevos eventos
- **Autenticación**: Sistema completo de login/registro con JWT

### Backend (FastAPI + PostgreSQL)
- **API REST**: Endpoints completos para todas las funcionalidades
- **Autenticación JWT**: Sistema seguro de autenticación
- **Base de Datos**: PostgreSQL con SQLAlchemy ORM
- **Migraciones**: Alembic para gestión de esquemas
- **CORS**: Configurado para desarrollo y producción

## 🛠️ Tecnologías Utilizadas

### Frontend
- React 18 + TypeScript
- Vite (Build tool)
- Bootstrap 5 + DaisyUI
- Leaflet (Mapas)
- Leaflet Routing Machine (Rutas)
- React Router DOM

### Backend
- FastAPI (Python)
- SQLAlchemy (ORM)
- PostgreSQL (Base de datos)
- Alembic (Migraciones)
- JWT (Autenticación)
- Pydantic (Validación)

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ y npm
- Python 3.8+
- PostgreSQL

### Instalación Rápida

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd GeoPlanner
```

2. **Ejecutar script de instalación**
```bash
# Windows
start-dev.bat

# Linux/Mac
./start-dev.sh
```

### Instalación Manual

#### Frontend
```bash
cd GeoPlanner-Front
npm install
npm run dev
```

#### Backend
```bash
cd Geoplanner-Back
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o
venv\Scripts\activate     # Windows
pip install -r requirements.txt
python run.py
```

## 🔧 Configuración de Base de Datos

1. **Crear base de datos PostgreSQL**
```sql
CREATE DATABASE geoplanner_social;
```

2. **Configurar variables de entorno**
Crear archivo `.env` en `Geoplanner-Back/`:
```env
DATABASE_URL=postgresql://usuario:password@localhost/geoplanner_social
SECRET_KEY=tu_clave_secreta_aqui
```

3. **Ejecutar migraciones**
```bash
cd Geoplanner-Back
alembic upgrade head
```

## 🚀 Uso

### Desarrollo
1. Iniciar el backend: `http://localhost:8000`
2. Iniciar el frontend: `http://localhost:5173`
3. Acceder a la aplicación en el navegador

### API Documentation
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 📱 Funcionalidades Implementadas

### ✅ Completadas
- [x] Autenticación JWT completa
- [x] Mapa interactivo con Leaflet
- [x] Geolocalización del usuario
- [x] Creación de eventos
- [x] Búsqueda y filtrado
- [x] Rutas entre puntos
- [x] Temas personalizables
- [x] Protección de rutas
- [x] Integración completa frontend-backend

### 🔄 En Desarrollo
- [ ] Sistema de amigos
- [ ] Comentarios en eventos
- [ ] Notificaciones en tiempo real
- [ ] Subida de imágenes
- [ ] Chat entre usuarios

## 🗂️ Estructura del Proyecto

```
GeoPlanner/
├── GeoPlanner-Front/          # Frontend React
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── contexts/          # Contextos (Auth)
│   │   ├── services/          # Servicios API
│   │   └── types/             # Tipos TypeScript
│   └── package.json
├── Geoplanner-Back/           # Backend FastAPI
│   ├── routes/                # Endpoints API
│   ├── models/                # Modelos SQLAlchemy
│   ├── schemas/               # Esquemas Pydantic
│   └── requirements.txt
└── README.md
```

## 🔐 Autenticación

El sistema utiliza JWT (JSON Web Tokens) para la autenticación:

1. **Login**: POST `/auth/token`
2. **Registro**: POST `/auth/register`
3. **Verificar usuario**: GET `/auth/me`

Los tokens se almacenan automáticamente en localStorage y se incluyen en todas las peticiones autenticadas.

## 🗺️ API Endpoints

### Autenticación
- `POST /auth/token` - Login
- `POST /auth/register` - Registro
- `GET /auth/me` - Obtener usuario actual

### Publicaciones
- `GET /posts/` - Obtener publicaciones
- `POST /posts/` - Crear publicación
- `GET /posts/{id}` - Obtener publicación específica
- `PUT /posts/{id}` - Actualizar publicación
- `DELETE /posts/{id}` - Eliminar publicación

### Agenda
- `GET /agenda/` - Obtener agenda del usuario
- `POST /agenda/` - Crear actividad
- `GET /agenda/{id}` - Obtener actividad específica
- `PUT /agenda/{id}` - Actualizar actividad
- `DELETE /agenda/{id}` - Eliminar actividad

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Equipo

- **Desarrollador Principal**: [Tu Nombre]
- **Contacto**: geoplanner.contact@gmail.com

## 🆘 Soporte

Si encuentras algún problema o tienes preguntas:

1. Revisa la [documentación de la API](http://localhost:8000/docs)
2. Abre un issue en GitHub
3. Contacta al equipo: geoplanner.contact@gmail.com

---

**GeoPlanner** - Conectando personas a través de la geolocalización 🌍
