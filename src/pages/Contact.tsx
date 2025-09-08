import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import AnimatedBackground from '../components/AnimatedBackground'

const Contact = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí se manejaría el envío del formulario
    console.log('Formulario enviado:', formData)
    alert('¡Gracias por tu mensaje! Te responderemos pronto.')
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="text-slate-300 font-sans min-h-screen relative">
      {/* Fondo Animado */}
      <AnimatedBackground />
      
      {/* Header */}
      <Header />

      {/* Contenido Principal */}
      <div className="pt-20 pb-16">
        <div className="container mx-auto max-w-6xl px-6">
                     {/* Título */}
           <div className="text-center mb-16 animate-slide-in-top">
             <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text animate-title-glow">
               Contáctanos
             </h1>
             <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto animate-fade-in-up delay-200">
               ¿Tienes preguntas, sugerencias o quieres colaborar? Nos encantaría escucharte.
             </p>
           </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Información de Contacto */}
            <div className="animate-fade-in-left delay-300">
              <h2 className="text-3xl font-bold mb-8 text-white animate-title-glow">Información de Contacto</h2>
              
              <div className="space-y-8">
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 animate-card-hover animate-scale-in delay-400">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mr-4 animate-glow-pulse">
                      <i className="fas fa-envelope text-xl text-cyan-400 animate-icon-bounce"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Email</h3>
                      <p className="text-slate-400">support@geoplanner.com</p>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm">
                    Para consultas generales, soporte técnico y colaboraciones.
                  </p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 animate-card-hover animate-scale-in delay-500">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mr-4 animate-glow-pulse">
                      <i className="fas fa-clock text-xl text-cyan-400 animate-icon-bounce"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Horarios de Atención</h3>
                      <p className="text-slate-400">Lunes a Viernes: 9:00 AM - 6:00 PM</p>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm">
                    Respondemos a todos los mensajes dentro de 24 horas.
                  </p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 animate-card-hover animate-scale-in delay-600">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mr-4 animate-glow-pulse">
                      <i className="fas fa-map-marker-alt text-xl text-cyan-400 animate-icon-bounce"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Ubicación</h3>
                      <p className="text-slate-400">Remoto - Equipo Global</p>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm">
                    Trabajamos de forma remota para servir a usuarios de todo el mundo.
                  </p>
                </div>
              </div>

              {/* FAQ Rápido */}
              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-6 text-white">Preguntas Frecuentes</h3>
                <div className="space-y-4">
                  <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">¿Cómo funciona GeoPlanner?</h4>
                    <p className="text-slate-400 text-sm">
                      GeoPlanner te permite crear eventos, encontrar actividades cercanas y conectar con personas que comparten tus intereses.
                    </p>
                  </div>
                  <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">¿Es seguro compartir mi ubicación?</h4>
                    <p className="text-slate-400 text-sm">
                      Sí, tu privacidad es nuestra prioridad. Solo compartes tu ubicación cuando tú lo decides.
                    </p>
                  </div>
                  <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">¿Hay algún costo por usar la plataforma?</h4>
                    <p className="text-slate-400 text-sm">
                      GeoPlanner es completamente gratuito. No hay costos ocultos ni suscripciones.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario de Contacto */}
            <div className="animate-fade-in-right delay-300">
              <h2 className="text-3xl font-bold mb-8 text-white animate-title-glow">Envíanos un Mensaje</h2>
              
              <form onSubmit={handleSubmit} className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 animate-card-hover">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:border-cyan-400 focus:outline-none text-white"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:border-cyan-400 focus:outline-none text-white"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">
                      Asunto *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:border-cyan-400 focus:outline-none text-white"
                    >
                      <option value="">Selecciona un asunto</option>
                      <option value="soporte">Soporte Técnico</option>
                      <option value="sugerencia">Sugerencia</option>
                      <option value="colaboracion">Colaboración</option>
                      <option value="prensa">Prensa y Medios</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                      Mensaje *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:border-cyan-400 focus:outline-none text-white resize-none"
                      placeholder="Cuéntanos en qué podemos ayudarte..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full btn-primary py-3 rounded-lg font-semibold text-white transition-transform hover:scale-105 animate-button-pulse"
                  >
                    Enviar Mensaje
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <h2 className="text-3xl font-bold mb-6 text-white">¿Listo para empezar?</h2>
            <p className="text-lg text-slate-400 mb-8">
              Únete a miles de personas que ya están creando experiencias increíbles con GeoPlanner.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/registro')}
                className="btn-primary px-8 py-3 rounded-full font-semibold text-white transition-transform hover:scale-105"
              >
                Registrarme
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

export default Contact
