import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import AnimatedBackground from '../components/AnimatedBackground'

const TermsOfService = () => {
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
          <div className="text-center mb-16 animate-slide-in-top">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text animate-title-glow">
              Términos de Uso
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto animate-fade-in-up delay-200">
              Última actualización: Enero 2025
            </p>
          </div>

          {/* Contenido */}
          <div className="space-y-12">
            {/* Introducción */}
            <section className="animate-fade-in-up delay-300">
              <h2 className="text-3xl font-bold mb-6 text-white animate-title-glow">1. Aceptación de los Términos</h2>
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 animate-card-hover">
                <p className="text-lg leading-relaxed mb-4">
                  Al acceder y utilizar GeoPlanner, aceptas estar sujeto a estos Términos de Uso. 
                  Si no estás de acuerdo con alguna parte de estos términos, no debes usar nuestro servicio.
                </p>
                <p className="text-lg leading-relaxed">
                  Estos términos constituyen un acuerdo legal entre tú y The GeoPlanner Group 
                  ("nosotros", "nuestro", "la Compañía").
                </p>
              </div>
            </section>

            {/* Descripción del Servicio */}
            <section className="animate-fade-in-up delay-400">
              <h2 className="text-3xl font-bold mb-6 text-white animate-title-glow">2. Descripción del Servicio</h2>
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 animate-card-hover">
                <p className="text-lg leading-relaxed mb-4">
                  GeoPlanner es una plataforma de organización de eventos y geolocalización que permite a los usuarios:
                </p>
                <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed">
                  <li className="animate-list-item delay-500">Crear y gestionar eventos</li>
                  <li className="animate-list-item delay-600">Encontrar eventos cercanos a su ubicación</li>
                  <li className="animate-list-item delay-700">Conectar con otros usuarios</li>
                  <li className="animate-list-item delay-800">Compartir ubicaciones y rutas</li>
                  <li className="animate-list-item delay-900">Organizar actividades grupales</li>
                </ul>
              </div>
            </section>

            {/* Cuenta de Usuario */}
            <section>
              <h2 className="text-3xl font-bold mb-6 text-white">3. Cuenta de Usuario</h2>
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
                <h3 className="text-xl font-semibold mb-4 text-cyan-400">3.1 Registro</h3>
                <p className="text-lg leading-relaxed mb-4">
                  Para usar ciertas funciones de GeoPlanner, debes crear una cuenta. 
                  Eres responsable de mantener la confidencialidad de tu información de inicio de sesión.
                </p>
                
                <h3 className="text-xl font-semibold mb-4 text-cyan-400">3.2 Información Precisa</h3>
                <p className="text-lg leading-relaxed mb-4">
                  Debes proporcionar información precisa y completa al registrarte. 
                  Es tu responsabilidad mantener esta información actualizada.
                </p>
                
                <h3 className="text-xl font-semibold mb-4 text-cyan-400">3.3 Seguridad de la Cuenta</h3>
                <p className="text-lg leading-relaxed">
                  Eres responsable de todas las actividades que ocurran bajo tu cuenta. 
                  Notifícarnos inmediatamente si sospechas un uso no autorizado.
                </p>
              </div>
            </section>

            {/* Uso Aceptable */}
            <section>
              <h2 className="text-3xl font-bold mb-6 text-white">4. Uso Aceptable</h2>
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
                <p className="text-lg leading-relaxed mb-4">
                  Al usar GeoPlanner, te comprometes a:
                </p>
                <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed mb-6">
                  <li>Usar el servicio solo para fines legales y apropiados</li>
                  <li>No violar derechos de propiedad intelectual</li>
                  <li>No transmitir contenido ofensivo, abusivo o inapropiado</li>
                  <li>No intentar acceder a cuentas de otros usuarios</li>
                  <li>No usar el servicio para spam o actividades comerciales no autorizadas</li>
                </ul>
                
                <p className="text-lg leading-relaxed">
                  Nos reservamos el derecho de suspender o terminar cuentas que violen estos términos.
                </p>
              </div>
            </section>

            {/* Privacidad y Datos */}
            <section>
              <h2 className="text-3xl font-bold mb-6 text-white">5. Privacidad y Datos</h2>
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
                <p className="text-lg leading-relaxed mb-4">
                  Tu privacidad es importante para nosotros. El uso de tu información personal 
                  se rige por nuestra Política de Privacidad, que forma parte de estos términos.
                </p>
                <p className="text-lg leading-relaxed">
                  Al usar GeoPlanner, consientes en que recopilemos, usemos y compartamos 
                  tu información de acuerdo con nuestra Política de Privacidad.
                </p>
              </div>
            </section>

            {/* Propiedad Intelectual */}
            <section>
              <h2 className="text-3xl font-bold mb-6 text-white">6. Propiedad Intelectual</h2>
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
                <p className="text-lg leading-relaxed mb-4">
                  GeoPlanner y todo su contenido, incluyendo pero no limitado a texto, gráficos, 
                  logos, iconos, imágenes, clips de audio, descargas digitales y compilaciones 
                  de datos, son propiedad de The GeoPlanner Group o sus proveedores de contenido.
                </p>
                <p className="text-lg leading-relaxed">
                  Se te otorga una licencia limitada, no exclusiva y revocable para usar 
                  GeoPlanner únicamente para tu uso personal y no comercial.
                </p>
              </div>
            </section>

            {/* Limitación de Responsabilidad */}
            <section>
              <h2 className="text-3xl font-bold mb-6 text-white">7. Limitación de Responsabilidad</h2>
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
                <p className="text-lg leading-relaxed mb-4">
                  En ningún caso The GeoPlanner Group será responsable por daños indirectos, 
                  incidentales, especiales, consecuentes o punitivos, incluyendo pero no 
                  limitado a pérdida de beneficios, datos o uso.
                </p>
                <p className="text-lg leading-relaxed">
                  Nuestra responsabilidad total no excederá la cantidad pagada por ti, 
                  si corresponde, por el uso del servicio en los 12 meses anteriores.
                </p>
              </div>
            </section>

            {/* Modificaciones */}
            <section>
              <h2 className="text-3xl font-bold mb-6 text-white">8. Modificaciones</h2>
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
                <p className="text-lg leading-relaxed mb-4">
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                  Los cambios entrarán en vigor inmediatamente después de su publicación.
                </p>
                <p className="text-lg leading-relaxed">
                  Es tu responsabilidad revisar periódicamente estos términos. 
                  El uso continuado del servicio después de los cambios constituye 
                  aceptación de los nuevos términos.
                </p>
              </div>
            </section>

            {/* Terminación */}
            <section>
              <h2 className="text-3xl font-bold mb-6 text-white">9. Terminación</h2>
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
                <p className="text-lg leading-relaxed mb-4">
                  Puedes terminar tu cuenta en cualquier momento eliminando tu perfil 
                  desde la configuración de tu cuenta.
                </p>
                <p className="text-lg leading-relaxed">
                  Podemos suspender o terminar tu acceso al servicio en cualquier momento, 
                  con o sin causa, con o sin previo aviso.
                </p>
              </div>
            </section>

            {/* Contacto */}
            <section>
              <h2 className="text-3xl font-bold mb-6 text-white">10. Contacto</h2>
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
                <p className="text-lg leading-relaxed mb-4">
                  Si tienes preguntas sobre estos Términos de Uso, contáctanos en:
                </p>
                <p className="text-lg leading-relaxed">
                  <strong>Email:</strong> legal@geoplanner.com<br />
                  <strong>Asunto:</strong> Términos de Uso
                </p>
              </div>
            </section>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <h2 className="text-3xl font-bold mb-6 text-white">¿Tienes preguntas?</h2>
            <p className="text-lg text-slate-400 mb-8">
              Si necesitas aclaración sobre estos términos, no dudes en contactarnos.
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

export default TermsOfService
