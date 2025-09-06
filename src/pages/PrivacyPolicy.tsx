import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import AnimatedBackground from '../components/AnimatedBackground'

const PrivacyPolicy = () => {
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
              Política de Privacidad
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
              Última actualización: Enero 2025
            </p>
          </div>

          {/* Contenido */}
          <div className="space-y-12">
            {/* Introducción */}
            <section>
              <h2 className="text-3xl font-bold mb-6 text-white">1. Introducción</h2>
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
                <p className="text-lg leading-relaxed mb-4">
                  En The GeoPlanner Group ("nosotros", "nuestro", "la Compañía"), 
                  valoramos tu privacidad y nos comprometemos a proteger tu información personal.
                </p>
                <p className="text-lg leading-relaxed">
                  Esta Política de Privacidad describe cómo recopilamos, usamos, almacenamos 
                  y protegemos tu información cuando usas GeoPlanner.
                </p>
              </div>
            </section>

            {/* Información que Recopilamos */}
            <section>
              <h2 className="text-3xl font-bold mb-6 text-white">2. Información que Recopilamos</h2>
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
                <h3 className="text-xl font-semibold mb-4 text-cyan-400">2.1 Información que Proporcionas</h3>
                <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed mb-6">
                  <li>Información de registro (nombre, email, contraseña)</li>
                  <li>Información de perfil (foto, biografía, intereses)</li>
                  <li>Contenido que compartes (eventos, publicaciones, comentarios)</li>
                  <li>Comunicaciones con nosotros</li>
                </ul>

                <h3 className="text-xl font-semibold mb-4 text-cyan-400">2.2 Información Recopilada Automáticamente</h3>
                <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed mb-6">
                  <li>Información de ubicación (cuando la compartes)</li>
                  <li>Información del dispositivo (tipo, sistema operativo, navegador)</li>
                  <li>Datos de uso (páginas visitadas, tiempo de uso, interacciones)</li>
                  <li>Información de cookies y tecnologías similares</li>
                </ul>

                <h3 className="text-xl font-semibold mb-4 text-cyan-400">2.3 Información de Terceros</h3>
                <p className="text-lg leading-relaxed">
                  Podemos recibir información sobre ti de proveedores de servicios, 
                  redes sociales y otras fuentes públicas.
                </p>
              </div>
            </section>

            {/* Cómo Usamos tu Información */}
            <section>
              <h2 className="text-3xl font-bold mb-6 text-white">3. Cómo Usamos tu Información</h2>
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
                <p className="text-lg leading-relaxed mb-4">
                  Usamos tu información para:
                </p>
                <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed mb-6">
                  <li>Proporcionar y mejorar nuestros servicios</li>
                  <li>Personalizar tu experiencia</li>
                  <li>Procesar transacciones y enviar notificaciones</li>
                  <li>Comunicarnos contigo sobre actualizaciones y cambios</li>
                  <li>Detectar y prevenir fraudes y abusos</li>
                  <li>Cumplir con obligaciones legales</li>
                </ul>
                <p className="text-lg leading-relaxed">
                  Solo usamos tu información para los fines descritos en esta política 
                  o con tu consentimiento explícito.
                </p>
              </div>
            </section>

            {/* Compartir Información */}
            <section>
              <h2 className="text-3xl font-bold mb-6 text-white">4. Compartir tu Información</h2>
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
                <p className="text-lg leading-relaxed mb-4">
                  No vendemos, alquilamos ni intercambiamos tu información personal 
                  con terceros, excepto en las siguientes circunstancias:
                </p>
                <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed mb-6">
                  <li><strong>Con tu consentimiento:</strong> Cuando nos autorizas explícitamente</li>
                  <li><strong>Proveedores de servicios:</strong> Empresas que nos ayudan a operar</li>
                  <li><strong>Cumplimiento legal:</strong> Cuando la ley lo requiere</li>
                  <li><strong>Protección de derechos:</strong> Para proteger nuestros derechos y seguridad</li>
                  <li><strong>Transacciones empresariales:</strong> En caso de fusión o adquisición</li>
                </ul>
                <p className="text-lg leading-relaxed">
                  Todos los proveedores de servicios están obligados a proteger tu información 
                  de acuerdo con esta política.
                </p>
              </div>
            </section>

            {/* Seguridad de Datos */}
            <section>
              <h2 className="text-3xl font-bold mb-6 text-white">5. Seguridad de Datos</h2>
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
                <p className="text-lg leading-relaxed mb-4">
                  Implementamos medidas de seguridad técnicas y organizativas apropiadas 
                  para proteger tu información personal:
                </p>
                <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed mb-6">
                  <li>Encriptación de datos en tránsito y en reposo</li>
                  <li>Acceso restringido a información personal</li>
                  <li>Monitoreo regular de seguridad</li>
                  <li>Actualizaciones regulares de sistemas</li>
                  <li>Capacitación del personal en seguridad</li>
                </ul>
                <p className="text-lg leading-relaxed">
                  Sin embargo, ningún método de transmisión por internet es 100% seguro. 
                  No podemos garantizar la seguridad absoluta de tu información.
                </p>
              </div>
            </section>

            {/* Retención de Datos */}
            <section>
              <h2 className="text-3xl font-bold mb-6 text-white">6. Retención de Datos</h2>
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
                <p className="text-lg leading-relaxed mb-4">
                  Conservamos tu información personal solo durante el tiempo necesario 
                  para cumplir con los fines descritos en esta política:
                </p>
                <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed mb-6">
                  <li>Mientras tu cuenta esté activa</li>
                  <li>Para cumplir con obligaciones legales</li>
                  <li>Para resolver disputas</li>
                  <li>Para hacer cumplir nuestros acuerdos</li>
                </ul>
                <p className="text-lg leading-relaxed">
                  Cuando ya no necesitemos tu información, la eliminaremos de forma segura 
                  o la anonimizaremos.
                </p>
              </div>
            </section>

            {/* Tus Derechos */}
            <section>
              <h2 className="text-3xl font-bold mb-6 text-white">7. Tus Derechos</h2>
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
                <p className="text-lg leading-relaxed mb-4">
                  Tienes los siguientes derechos sobre tu información personal:
                </p>
                <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed mb-6">
                  <li><strong>Acceso:</strong> Solicitar una copia de tu información</li>
                  <li><strong>Rectificación:</strong> Corregir información inexacta</li>
                  <li><strong>Eliminación:</strong> Solicitar que eliminemos tu información</li>
                  <li><strong>Portabilidad:</strong> Recibir tu información en formato estructurado</li>
                  <li><strong>Oposición:</strong> Oponerte al procesamiento de tu información</li>
                  <li><strong>Restricción:</strong> Limitar cómo usamos tu información</li>
                </ul>
                <p className="text-lg leading-relaxed">
                  Para ejercer estos derechos, contáctanos en privacy@geoplanner.com
                </p>
              </div>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-3xl font-bold mb-6 text-white">8. Cookies y Tecnologías Similares</h2>
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
                <p className="text-lg leading-relaxed mb-4">
                  Usamos cookies y tecnologías similares para:
                </p>
                <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed mb-6">
                  <li>Recordar tus preferencias</li>
                  <li>Analizar el uso del sitio</li>
                  <li>Mejorar nuestros servicios</li>
                  <li>Proporcionar contenido personalizado</li>
                </ul>
                <p className="text-lg leading-relaxed">
                  Puedes controlar el uso de cookies a través de la configuración de tu navegador. 
                  Consulta nuestra Política de Cookies para más detalles.
                </p>
              </div>
            </section>

            {/* Menores de Edad */}
            <section>
              <h2 className="text-3xl font-bold mb-6 text-white">9. Menores de Edad</h2>
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
                <p className="text-lg leading-relaxed mb-4">
                  GeoPlanner no está dirigido a menores de 13 años. No recopilamos 
                  intencionalmente información personal de menores de 13 años.
                </p>
                <p className="text-lg leading-relaxed">
                  Si eres padre o tutor y crees que tu hijo nos ha proporcionado 
                  información personal, contáctanos inmediatamente.
                </p>
              </div>
            </section>

            {/* Cambios a esta Política */}
            <section>
              <h2 className="text-3xl font-bold mb-6 text-white">10. Cambios a esta Política</h2>
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
                <p className="text-lg leading-relaxed mb-4">
                  Podemos actualizar esta Política de Privacidad ocasionalmente. 
                  Te notificaremos sobre cambios significativos por email o 
                  mediante un aviso en nuestro sitio web.
                </p>
                <p className="text-lg leading-relaxed">
                  Te recomendamos revisar esta política periódicamente para 
                  mantenerte informado sobre cómo protegemos tu información.
                </p>
              </div>
            </section>

            {/* Contacto */}
            <section>
              <h2 className="text-3xl font-bold mb-6 text-white">11. Contacto</h2>
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
                <p className="text-lg leading-relaxed mb-4">
                  Si tienes preguntas sobre esta Política de Privacidad, contáctanos en:
                </p>
                <p className="text-lg leading-relaxed">
                  <strong>Email:</strong> privacy@geoplanner.com<br />
                  <strong>Asunto:</strong> Política de Privacidad
                </p>
              </div>
            </section>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <h2 className="text-3xl font-bold mb-6 text-white">¿Tienes preguntas sobre privacidad?</h2>
            <p className="text-lg text-slate-400 mb-8">
              Estamos aquí para ayudarte a entender cómo protegemos tu información.
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

export default PrivacyPolicy
