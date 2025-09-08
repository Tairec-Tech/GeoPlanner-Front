/**
 * ========================================
 * PUNTO DE ENTRADA PRINCIPAL DE GEOPLANNER
 * ========================================
 * 
 * Este archivo es el punto de entrada principal de la aplicación React.
 * Aquí se inicializa React, se configura el renderizado y se monta
 * la aplicación en el DOM.
 * 
 * CONFIGURACIONES IMPORTANTES:
 * 
 * 1. ID DEL CONTENEDOR (línea 13):
 *    - document.getElementById('root') debe coincidir con index.html
 *    - Si cambias el ID en index.html, actualiza también aquí
 *    - Ubicación en index.html: <div id="root"></div>
 * 
 * 2. COMPONENTE RAIZ (línea 15):
 *    - <App /> es el componente principal
 *    - Si quieres cambiar el componente raíz, modifica esta línea
 *    - Ubicación del componente: src/App.tsx
 * 
 * 3. MODO ESTRICTO (líneas 12-16):
 *    - React.StrictMode ayuda a detectar problemas
 *    - Solo funciona en desarrollo, no en producción
 *    - Puedes deshabilitarlo removiendo <StrictMode>
 * 
 * 4. AGREGAR PROVIDERS GLOBALES:
 *    - Si necesitas contextos globales, agrégalos aquí
 *    - Ejemplo: <ThemeProvider>, <ReduxProvider>
 *    - Estructura: <Provider><App /></Provider>
 * 
 * 5. IMPORTACIONES DE ESTILOS:
 *    - index.css: Estilos globales (línea 5)
 *    - Si agregas más estilos globales, impórtalos aquí
 * 
 * UBICACIÓN DE ARCHIVOS:
 * - Componente App: src/App.tsx
 * - Estilos globales: src/index.css
 * - HTML principal: index.html
 * 
 * NOTA: Este archivo no debe modificarse frecuentemente
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
