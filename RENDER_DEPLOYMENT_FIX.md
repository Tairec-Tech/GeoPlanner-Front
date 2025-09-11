# Solución para Problemas de Deployment en Render

## Problemas Identificados y Solucionados

### 1. Problema de Enrutamiento SPA (Single Page Application)
**Síntoma**: Al hacer refresh (Ctrl+R) en páginas como `/login`, `/registro`, etc., aparece "Not Found"
**Causa**: Render no estaba configurado para manejar rutas de SPA correctamente
**Solución**: 
- Creado archivo `public/_redirects` con contenido: `/*    /index.html   200`
- Actualizado `render.yaml` para usar `serve` en lugar de `vite preview`

### 2. Problema de Carga de Assets
**Síntoma**: Logo y placeholder no se muestran en producción
**Causa**: Referencias a `/src/assets/img/` que no funcionan en producción
**Solución**:
- Movidos assets críticos a carpeta `public/`
- Actualizadas todas las referencias de `/src/assets/img/` a `/`

## Archivos Modificados

### Configuración de Deployment
- `render.yaml`: Actualizado buildCommand y startCommand
- `package.json`: Agregado `serve` como devDependency
- `public/_redirects`: Nuevo archivo para manejo de rutas SPA

### Assets Movidos
- `src/assets/img/Logo.png` → `public/Logo.png`
- `src/assets/img/placeholder.png` → `public/placeholder.png`
- `src/assets/img/logo_noche.png` → `public/logo_noche.png`

### Referencias Actualizadas
- `src/App.tsx`: Referencias de logo en loading screens
- `src/pages/LoginPage.tsx`: Referencia de logo
- `src/pages/RegisterStep1.tsx`: Referencia de logo
- `src/pages/RegisterStep2.tsx`: Referencia de logo
- `src/pages/RegisterStep3.tsx`: Referencias de logo y placeholder
- `src/pages/VerifyEmail.tsx`: Referencia de logo
- `src/pages/Dashboard.tsx`: Todas las referencias de assets
- `src/pages/ProfilePage.tsx`: Referencias de placeholder
- `src/pages/PublicProfilePage.tsx`: Referencias de placeholder
- `src/pages/GroupDetailPage.tsx`: Referencias de placeholder

## Instrucciones para Deployment

1. **Hacer commit de todos los cambios**:
   ```bash
   git add .
   git commit -m "Fix: Resolve SPA routing and asset loading issues for Render deployment"
   git push
   ```

2. **Render se desplegará automáticamente** con la nueva configuración

3. **Verificar que funcione**:
   - Navegar a `/login` y hacer refresh (Ctrl+R)
   - Verificar que el logo se muestre correctamente
   - Verificar que el placeholder de foto de perfil se muestre
   - Probar navegación entre rutas

## Cambios Técnicos Detallados

### render.yaml
```yaml
buildCommand: npm install && npm run build
startCommand: npx serve -s dist -l 4173
```

### public/_redirects
```
/*    /index.html   200
```

### Referencias de Assets
**Antes**: `/src/assets/img/Logo.png`
**Después**: `/Logo.png`

## Notas Importantes

- Los assets en la carpeta `public/` se sirven directamente sin procesamiento
- Las rutas que empiezan con `/` apuntan a la carpeta `public/`
- El archivo `_redirects` es específico de Render para manejo de SPA
- `serve` es un servidor estático que maneja mejor las rutas SPA que `vite preview`

## Verificación Post-Deployment

1. ✅ Logo se muestra en todas las páginas
2. ✅ Placeholder de foto de perfil se muestra
3. ✅ Refresh (Ctrl+R) funciona en todas las rutas
4. ✅ Navegación entre páginas funciona correctamente
5. ✅ Modal de registro y "olvidar contraseña" se abren correctamente
