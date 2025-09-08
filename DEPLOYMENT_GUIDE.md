# Guía de Despliegue a Producción - GeoPlanner Frontend

## ✅ Configuraciones Completadas

### 1. Configuración de API
- **Archivo**: `src/config/api.ts`
- **Cambio**: URL del backend actualizada a `https://geoplanner-back.onrender.com`
- **Funcionalidad**: Detección automática de entorno (desarrollo/producción)

### 2. Optimización de Vite
- **Archivo**: `vite.config.ts`
- **Mejoras**:
  - Chunks optimizados para mejor carga
  - Configuración de producción mejorada
  - Soporte para Render.com

### 3. Scripts de Build
- **Archivo**: `package.json`
- **Nuevos comandos**:
  - `npm run build:prod` - Build optimizado para producción
  - `npm run preview:prod` - Preview de producción
  - `npm run lint:fix` - Corrección automática de linting

### 4. Configuración de Render
- **Archivo**: `render.yaml`
- **Configuración**: Lista para despliegue automático

## 🚀 Pasos para Desplegar en Render

### Opción 1: Despliegue Automático (Recomendado)

1. **Conecta tu repositorio a Render**:
   - Ve a [render.com](https://render.com)
   - Conecta tu repositorio de GitHub
   - Selecciona el proyecto GeoPlanner-Front

2. **Configuración del servicio**:
   - **Tipo**: Web Service
   - **Entorno**: Node
   - **Plan**: Free (o el que prefieras)
   - **Build Command**: `npm install && npm run build:prod`
   - **Start Command**: `npm run preview:prod`

3. **Variables de entorno**:
   ```
   NODE_ENV=production
   VITE_API_URL=https://geoplanner-back.onrender.com
   ```

### Opción 2: Despliegue Manual

1. **Build local**:
   ```bash
   npm install
   npm run build:prod
   ```

2. **Subir archivos**:
   - Sube la carpeta `dist/` a tu servidor
   - Configura un servidor web (nginx, Apache, etc.)

## 🔧 Verificaciones Post-Despliegue

### 1. Verificar Conexión con Backend
- Abre las herramientas de desarrollador (F12)
- Ve a la pestaña Network
- Verifica que las peticiones van a `https://geoplanner-back.onrender.com`

### 2. Verificar Funcionalidades
- [ ] Login funciona correctamente
- [ ] Registro de usuarios funciona
- [ ] Carga de publicaciones
- [ ] Funcionalidades de mapa
- [ ] Sistema QR

### 3. Verificar Performance
- [ ] Tiempo de carga < 3 segundos
- [ ] Assets cargan correctamente
- [ ] No hay errores en consola

## 🐛 Solución de Problemas Comunes

### Error: "Cannot connect to backend"
**Solución**: Verifica que la variable `VITE_API_URL` esté configurada correctamente

### Error: "CORS policy"
**Solución**: El backend ya está configurado para permitir CORS desde cualquier origen

### Error: "Build failed"
**Solución**: 
```bash
npm install
npm run lint:fix
npm run build:prod
```

### Error: "Assets not loading"
**Solución**: Verifica que el servidor esté sirviendo archivos estáticos correctamente

## 📋 Checklist de Despliegue

- [ ] Código actualizado en el repositorio
- [ ] Build local exitoso (`npm run build:prod`)
- [ ] Variables de entorno configuradas
- [ ] Servicio desplegado en Render
- [ ] URL del frontend funcionando
- [ ] Conexión con backend verificada
- [ ] Funcionalidades principales probadas

## 🔗 URLs Importantes

- **Backend**: https://geoplanner-back.onrender.com
- **Frontend**: [Tu URL de Render]
- **Documentación API**: https://geoplanner-back.onrender.com/docs

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs en Render Dashboard
2. Verifica la consola del navegador
3. Confirma que el backend esté funcionando
4. Revisa las variables de entorno

---

**Nota**: Este proyecto está configurado para funcionar automáticamente en producción. Solo necesitas desplegarlo siguiendo los pasos anteriores.
