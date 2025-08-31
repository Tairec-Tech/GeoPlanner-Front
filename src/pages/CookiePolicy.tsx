import React from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import AnimatedBackground from '../components/AnimatedBackground'

const CookiePolicy = () => {
  const navigate = useNavigate()

  return (
    <div className="text-slate-300 font-sans min-h-screen relative">
      {/* Fondo Animado */}
      <AnimatedBackground />
      
      {/* Header */}
      <Header />

      {/* Contenido Principal */}
      <div className="pt-20 pb-16">
        <div className="container mx-auto max-w-4xl px-6">
          {/* Título */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
              Política de Cookies
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
              Última actualización: Enero 2025
            </p>
          </div>

          {/* Contenido */}
          <div className="space-y-12">
            {/* Introducción */}
            <section>
              <h2 className="text-3xl font-bold mb-6 text-white">1. ¿Qué son las Cookies?</h2>
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
                <p className="text-lg leading-relaxed mb-4">
                  Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo 
                  cuando visitas nuestro sitio web. Estas cookies nos ayudan a mejorar tu 
                  experiencia y a entender cómo usas GeoPlanner.
                </p>
                <p className="text-lg leading-relaxed">
                  Las cookies pueden ser creadas por nosotros (cookies propias) o por 
                  terceros (cookies de terceros) que proporcionan servicios en nuestro sitio.
                </p>
              </div>
            </section>

            {/* Tipos de Cookies */}
            <section>
              <h2 className="text-3xl font-bold mb-6 text-white">2. Tipos de Cookies que Usamos</h2>
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
                <h3 className="text-xl font-semibold mb-4 text-cyan-400">2.1 Cookies Esenciales</h3>
                <p className="text-lg leading-relaxed mb-4">
                  Estas cookies son necesarias para el funcionamiento básico del sitio web. 
                  Incluyen cookies que permiten que te registres e inicies sesión, 
                  y que mantengan tu sesión activa.
                </p>
                <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed mb-6">
                  <li>Cookies de autenticación</li>
                  <li>Cookies de sesión</li>
                  <li>Cookies de seguridad</li>
                </ul>

                <h3 className="text-xl font-semibold mb-4 text-cyan-400">2.2 Cookies de Rendimiento</h3>
                <p className="text-lg leading-relaxed mb-4">
                  Estas cookies nos ayudan a entender cómo interactúas con nuestro sitio web 
                  recopilando información anónima sobre el uso.
                </p>
                <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed mb-6">
                  <li>Cookies de análisis (Google Analytics)</li>
                  <li>Cookies de rendimiento del sitio</li>
                  <li>Cookies de errores y debugging</li>
                </ul>

                <h3 className="text-xl font-semibold mb-4 text-cyan-400">2.3 Cookies de Funcionalidad</h3>
                <p className="text-lg leading-relaxed mb-4">
                  Estas cookies permiten que el sitio web recuerde las elecciones que haces 
                  y proporcionen funcionalidades mejoradas y más personales.
                </p>
                <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed mb-6">
                  <li>Cookies de preferencias de idioma</li>
                  <li>Cookies de configuración de usuario</li>
                  <li>Cookies de personalización</li>
                </ul>

                <h3 className="text-xl font-semibold mb-4 text-cyan-400">2.4 Cookies de Marketing</h3>
                <p className="text-lg leading-relaxed mb-4">
                  Estas cookies se utilizan para rastrear visitantes en sitios web. 
                  La intención es mostrar anuncios que sean relevantes y atractivos 
                  para el usuario individual.
                </p>
                <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed">
                  <li>Cookies de publicidad</li>
                  <li>Cookies de redes sociales</li>
                  <li>Cookies de seguimiento de conversiones</li>
                </ul>
              </div>
            </section>

            {/* Cookies Específicas */}
            <section>
              <h2 className="text-3xl font-bold mb-6 text-white">3. Cookies Específicas que Usamos</h2>
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Google Analytics</h4>
                    <p className="text-slate-400 mb-2">
                      <strong>Propósito:</strong> Analizar el uso del sitio web y mejorar nuestros servicios
                    </p>
                    <p className="text-slate-400 mb-2">
                      <strong>Duración:</strong> Hasta 2 años
                    </p>
                    <p className="text-slate-400">
                      <strong>Información recopilada:</strong> Páginas visitadas, tiempo en el sitio, 
                      fuente de tráfico, ubicación geográfica
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Cookies de Sesión</h4>
                    <p className="text-slate-400 mb-2">
                      <strong>Propósito:</strong> Mantener tu sesión activa mientras navegas
                    </p>
                    <p className="text-slate-400 mb-2">
                      <strong>Duración:</strong> Hasta que cierres el navegador
                    </p>
                    <p className="text-slate-400">
                      <strong>Información recopilada:</strong> ID de sesión, preferencias temporales
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Cookies de Preferencias</h4>
                    <p className="text-slate-400 mb-2">
                      <strong>Propósito:</strong> Recordar tus configuraciones y preferencias
                    </p>
                    <p className="text-slate-400 mb-2">
                      <strong>Duración:</strong> Hasta 1 año
                    </p>
                    <p className="text-slate-400">
                      <strong>Información recopilada:</strong> Idioma, tema, configuración de notificaciones
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Control de Cookies */}
            <section>
              <h2 className="text-3xl font-bold mb-6 text-white">4. Cómo Controlar las Cookies</h2>
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
                <h3 className="text-xl font-semibold mb-4 text-cyan-400">4.1 Configuración del Navegador</h3>
                <p className="text-lg leading-relaxed mb-4">
                  Puedes controlar y/o eliminar cookies según desees. Puedes eliminar todas 
                  las cookies que ya están en tu dispositivo y puedes configurar la mayoría 
                  de navegadores para que no las acepten.
                </p>
                <p className="text-lg leading-relaxed mb-6">
                  Sin embargo, si haces esto, es posible que tengas que ajustar manualmente 
                  algunas preferencias cada vez que visites un sitio.
                </p>

                <h3 className="text-xl font-semibold mb-4 text-cyan-400">4.2 Configuración por Navegador</h3>
                <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed mb-6">
                  <li><strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies</li>
                  <li><strong>Firefox:</strong> Opciones → Privacidad y seguridad → Cookies</li>
                  <li><strong>Safari:</strong> Preferencias → Privacidad → Cookies</li>
                  <li><strong>Edge:</strong> Configuración → Cookies y permisos del sitio</li>
                </ul>

                <h3 className="text-xl font-semibold mb-4 text-cyan-400">4.3 Panel de Control de Cookies</h3>
                <p className="text-lg leading-relaxed">
                  Próximamente implementaremos un panel de control de cookies que te permitirá 
                  gestionar tus preferencias de cookies directamente desde nuestro sitio web.
                </p>
              </div>
            </section>

            {/* Cookies de Terceros */}
            <section>
              <h2 className="text-3xl font-bold mb-6 text-white">5. Cookies de Terceros</h2>
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
                <p className="text-lg leading-relaxed mb-4">
                  Algunos servicios de terceros pueden colocar cookies en tu dispositivo. 
                  Estos servicios incluyen:
                </p>
                <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed mb-6">
                  <li><strong>Google Analytics:</strong> Para análisis del sitio web</li>
                  <li><strong>Redes sociales:</strong> Para compartir contenido</li>
                  <li><strong>Servicios de pago:</strong> Para procesar transacciones</li>
                  <li><strong>Servicios de chat:</strong> Para soporte al cliente</li>
                </ul>
                <p className="text-lg leading-relaxed">
                  Te recomendamos revisar las políticas de privacidad de estos servicios 
                  para entender cómo usan las cookies.
                </p>
              </div>
            </section>

            {/* Actualizaciones */}
            <section>
              <h2 className="text-3xl font-bold mb-6 text-white">6. Actualizaciones de esta Política</h2>
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
                <p className="text-lg leading-relaxed mb-4">
                  Podemos actualizar esta Política de Cookies ocasionalmente para reflejar 
                  cambios en nuestras prácticas o por otras razones operativas, legales o reglamentarias.
                </p>
                <p className="text-lg leading-relaxed">
                  Te notificaremos sobre cambios significativos por email o mediante 
                  un aviso prominente en nuestro sitio web.
                </p>
              </div>
            </section>

            {/* Contacto */}
            <section>
              <h2 className="text-3xl font-bold mb-6 text-white">7. Contacto</h2>
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
                <p className="text-lg leading-relaxed mb-4">
                  Si tienes preguntas sobre nuestra Política de Cookies, contáctanos en:
                </p>
                <p className="text-lg leading-relaxed">
                  <strong>Email:</strong> privacy@geoplanner.com<br />
                  <strong>Asunto:</strong> Política de Cookies
                </p>
              </div>
            </section>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <h2 className="text-3xl font-bold mb-6 text-white">¿Tienes preguntas sobre cookies?</h2>
            <p className="text-lg text-slate-400 mb-8">
              Estamos aquí para ayudarte a entender cómo usamos las cookies en GeoPlanner.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/contact')}
                className="btn-primary px-8 py-3 rounded-full font-semibold text-white transition-transform hover:scale-105"
              >
                Contactar
              </button>
              <button 
                onClick={() => navigate('/')}
                className="px-8 py-3 rounded-full font-semibold text-slate-300 border border-slate-600 hover:border-cyan-400 hover:text-cyan-400 transition-colors"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 px-6 border-t border-slate-500/30 bg-slate-900/50 backdrop-blur-sm">
        <Footer />
      </div>
    </div>
  )
}

export default CookiePolicy
