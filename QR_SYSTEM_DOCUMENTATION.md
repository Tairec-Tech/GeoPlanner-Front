# 📱 Sistema de QR e Invitaciones Digitales - GeoPlanner

## 🎯 Descripción General

El sistema de QR de GeoPlanner permite a los usuarios generar invitaciones digitales únicas para verificar su asistencia a eventos. Cada QR contiene información segura y encriptada que permite a los organizadores confirmar la participación de los usuarios.

## 🔧 Funcionamiento Técnico

### Backend (FastAPI)

#### 1. Generación de QR
- **Endpoint**: `POST /qr-attendance/generate-qr/{event_id}/{user_id}`
- **Validaciones**:
  - Usuario existe y está autenticado
  - Evento existe
  - Usuario está inscrito en el evento
  - Cualquier tipo de evento puede generar QR (público, amigos, privado)

#### 2. Proceso de Generación
```python
# 1. Crear firma única
signature = hashlib.sha256(f"{event_id}:{user_id}:{inscription_id}:{timestamp}")

# 2. Datos del QR
qr_data = {
    "event_id": event_id,
    "user_id": user_id,
    "inscription_id": inscription_id,
    "timestamp": timestamp,
    "signature": signature
}

# 3. Generar imagen QR en base64
qr_image = qrcode.make(json.dumps(qr_data))
```

#### 3. Verificación de QR
- **Endpoint**: `POST /qr-attendance/verify-qr`
- **Proceso**:
  - Decodificar datos del QR
  - Verificar firma de seguridad
  - Confirmar que el usuario está inscrito
  - Registrar asistencia en historial
  - Actualizar estado de inscripción

### Frontend (React)

#### 1. Componente QRCodeDisplay
- **Funcionalidades**:
  - Genera QR llamando al backend
  - Muestra imagen QR en tiempo real
  - Permite descargar la invitación
  - Muestra información del evento y usuario
  - Incluye instrucciones de uso

#### 2. Integración en Dashboard
- **Botón "Ver Invitación QR"**:
  - Aparece al lado del botón de inscripción/desinscripción
  - Habilitado solo si el usuario está inscrito
  - Deshabilitado con tooltip si no está inscrito
  - Funciona para cualquier tipo de evento

## 🎨 Interfaz de Usuario

### Estados del Botón QR

#### 1. Usuario NO Inscrito
```jsx
<button 
  className="btn btn-sm btn-disabled"
  disabled
  title="Debes inscribirte primero para ver tu QR"
>
  📱 Ver Invitación QR
</button>
```

#### 2. Usuario Inscrito
```jsx
<button 
  className="btn btn-sm btn-primary"
  onClick={() => handleShowQRCodeDisplay(post.id, post.texto)}
>
  📱 Ver Invitación QR
</button>
```

### Modal de Invitación QR

#### Información Mostrada
- 🎯 **Evento**: Título del evento
- 👤 **Participante**: Nombre completo del usuario
- 🆔 **Usuario**: Nombre de usuario (@username)
- 🔢 **ID de Inscripción**: Identificador único
- 📅 **Generado**: Fecha y hora de generación
- 🔐 **Estado**: Badge "Válido"

#### Botones de Acción
- 📥 **Descargar Invitación**: Guarda la imagen QR
- ✅ **Entendido**: Cierra el modal

#### Instrucciones
- 📱 Guarda esta invitación QR en tu teléfono
- 🎫 Preséntala al organizador al llegar al evento
- 📷 El organizador escaneará tu QR para confirmar asistencia
- 🔒 Esta invitación es única y solo válida para este evento
- ⏰ La invitación se genera en tiempo real y es segura

## 🔒 Seguridad

### Medidas Implementadas
1. **Firma Digital**: Hash SHA256 único para cada QR
2. **Timestamp**: Verificación de tiempo de generación
3. **Validación de Inscripción**: Solo usuarios inscritos pueden generar QR
4. **Verificación de Firma**: Backend valida la autenticidad del QR
5. **Datos Encriptados**: Información sensible protegida

### Flujo de Seguridad
```
Usuario Inscrito → Genera QR → Firma Digital → Verificación → Asistencia Confirmada
```

## 📊 Casos de Uso

### 1. Evento Público
- Usuario se inscribe
- Genera QR de invitación
- Organizador escanea QR
- Asistencia confirmada

### 2. Evento Privado/Amigos
- Usuario se inscribe
- Genera QR de invitación
- Organizador escanea QR
- Asistencia confirmada
- Control de acceso adicional

### 3. Verificación de Asistencia
- Organizador usa QRScanner
- Escanea QR del participante
- Sistema confirma asistencia
- Historial actualizado

## 🚀 Mejoras Implementadas

### Antes
- QR solo para eventos privados/amigos
- Botón "Mi QR" solo visible en ciertos casos
- Interfaz menos intuitiva

### Después
- QR para todos los tipos de eventos
- Botón "Ver Invitación QR" siempre visible
- Estado dinámico (habilitado/deshabilitado)
- Mejor UX con tooltips informativos
- Interfaz más clara y profesional

## 🔧 Configuración

### Variables de Entorno (Backend)
```env
SECRET_KEY=tu_clave_secreta_aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### Dependencias
```json
// Backend
"qrcode": "^1.0.0"
"hashlib": "built-in"

// Frontend
"qrcode.react": "^4.2.0"
"html5-qrcode": "^2.3.8"
```

## 📝 Notas de Desarrollo

### Consideraciones Técnicas
1. **Performance**: QR se genera en tiempo real
2. **Escalabilidad**: Sistema preparado para múltiples eventos
3. **Mantenibilidad**: Código modular y bien documentado
4. **UX**: Interfaz intuitiva y responsive

### Próximas Mejoras
1. **Cache de QR**: Evitar regeneración innecesaria
2. **QR Dinámico**: Actualización en tiempo real
3. **Estadísticas**: Métricas de uso de QR
4. **Notificaciones**: Alertas de verificación

---

**Desarrollado por The GeoPlanner Group**  
**Versión**: 5.0.0  
**Última actualización**: Enero 2025
