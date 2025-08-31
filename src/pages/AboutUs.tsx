import React from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import AnimatedBackground from '../components/AnimatedBackground'

const AboutUs = () => {
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
               Acerca de GeoPlanner
             </h1>
             <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto animate-fade-in-up delay-200">
               Conectando personas, organizando experiencias y transformando la forma en que exploramos el mundo.
             </p>
           </div>

                                           {/* Historia */}
            <section className="mb-16 animate-fade-in-up delay-300">
              <h2 className="text-3xl font-bold mb-8 text-white animate-title-glow">Nuestra Historia</h2>
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 animate-card-hover">
               <p className="text-lg leading-relaxed mb-6">
                 GeoPlanner nació en las aulas de la Universidad URBE (Universidad Privada Doctor Rafael Belloso Chacín) 
                 de Maracaibo, Venezuela, como un proyecto académico que cambiaría para siempre la forma en que 
                 concebimos la organización de eventos y la conexión social.
               </p>
               <p className="text-lg leading-relaxed mb-6">
                 Todo comenzó en la materia de Computación Gráfica, bajo la guía del Profesor MSc. Luis Uribe. 
                 Un grupo de estudiantes de Ingeniería Informática - Juan Sarcos, Daniel González, César Acurero, 
                 Valeria Socorro y Willys Petit - se unieron para crear algo extraordinario. Entre las opciones 
                 de un gestor de tareas o un GPS interactivo, surgió la idea revolucionaria: ¿por qué no combinar 
                 ambos conceptos?
               </p>
               <p className="text-lg leading-relaxed mb-6">
                 Así nació la primera versión de GeoPlanner: una agenda con mapa integrado que permitía a las 
                 personas tener mejor control de sus tareas cuando estas incluían desplazamientos. El nombre 
                 "GeoPlanner" fue propuesto por Valeria y resultó perfecto: un planificador geolocalizado de tareas. 
                 César creó el logo que hoy conocemos - moderno, simple y llamativo - que se convertiría en el 
                 símbolo de nuestra plataforma.
               </p>
               <p className="text-lg leading-relaxed mb-6">
                 El proyecto inicial fue desarrollado en Java 8, con cada miembro del equipo aportando su 
                 experiencia: Willys en la base de datos, Juan en la estructura del proyecto, Daniel en la lógica, 
                 César en el diseño visual y Valeria en la implementación del mapa. Aunque era un proyecto académico, 
                 el resultado superó las expectativas del profesor Uribe.
               </p>
               <p className="text-lg leading-relaxed mb-6">
                 Pero la historia no terminó ahí. Durante una de las correcciones, el profesor Uribe planteo una 
                 pregunta que cambiaría todo: "¿Y si lo convierten en algo social?" Esta simple pregunta despertó 
                 una visión más ambiciosa: transformar GeoPlanner en una red social enfocada en eventos, similar 
                 a Facebook pero con el propósito específico de conectar personas a través de experiencias reales.
               </p>
               <p className="text-lg leading-relaxed mb-6">
                 En el siguiente trimestre, durante la materia de Multimedia y Diseño Web, el equipo se reformó 
                 con nuevos integrantes: Luis Villalobos y Franger Alastre se unieron al proyecto. Juan, quien 
                 había comenzado un diplomado en Full Stack Web Development, lideró la transformación de GeoPlanner 
                 hacia una plataforma web moderna, utilizando HTML, CSS, Bootstrap y JavaScript.
               </p>
                               <p className="text-lg leading-relaxed mb-6">
                  GeoPlanner 2.0 nació como una red social completa. El equipo mejoró cada aspecto: Valeria y Luis 
                  perfeccionaron la integración de mapas, Daniel optimizó la lógica de JavaScript, y Franger elevó 
                  los estándares visuales. Los temas de color de GeoPlanner se convirtieron en una de sus características 
                  más distintivas y admiradas.
                </p>
                <p className="text-lg leading-relaxed mb-6">
                  Pero la evolución de GeoPlanner no se detuvo ahí. Durante el desarrollo del diplomado en Full Stack 
                  Web Development, Juan Sarcos enfrentó el desafío de crear un proyecto final que demostrara todas las 
                  habilidades adquiridas. Fue entonces cuando decidió llevar GeoPlanner al siguiente nivel, transformándolo 
                  en GeoPlanner 3.0.
                </p>
                <p className="text-lg leading-relaxed mb-6">
                  Esta nueva versión representó un salto tecnológico significativo, implementando las tecnologías más 
                  modernas del desarrollo web: React para la interfaz de usuario, Tailwind CSS para el diseño responsivo, 
                  DaisyUI para componentes elegantes, y un backend robusto con Python y Flask. Esta transformación 
                  demostró no solo el crecimiento técnico del proyecto, sino también la visión de futuro que siempre 
                  ha caracterizado a GeoPlanner.
                </p>
                <p className="text-lg leading-relaxed">
                  Hoy, GeoPlanner continúa evolucionando. Lo que comenzó como un proyecto académico para "salir bien 
                  en una materia" se ha transformado en una plataforma con el potencial de rivalizar con las grandes 
                  redes sociales. Nuestra misión es llevar GeoPlanner a nuevas alturas, manteniendo siempre la esencia 
                  de conectar personas a través de experiencias reales y significativas.
                </p>
             </div>
           </section>

                     {/* Misión y Visión */}
           <section className="mb-16 animate-fade-in-up delay-400">
             <div className="grid md:grid-cols-2 gap-8">
               <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 animate-card-hover">
                 <h3 className="text-2xl font-bold mb-4 text-cyan-400 animate-title-glow">Nuestra Misión</h3>
                 <p className="text-lg leading-relaxed">
                   Facilitar la creación de experiencias memorables conectando personas a través de 
                   la tecnología de geolocalización y herramientas de organización intuitivas.
                 </p>
               </div>
               <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 animate-card-hover">
                 <h3 className="text-2xl font-bold mb-4 text-cyan-400 animate-title-glow">Nuestra Visión</h3>
                 <p className="text-lg leading-relaxed">
                   Ser la plataforma líder mundial que transforme la forma en que las personas 
                   descubren, organizan y comparten experiencias en el mundo real.
                 </p>
               </div>
             </div>
           </section>

                     {/* Valores */}
           <section className="mb-16 animate-fade-in-up delay-500">
             <h2 className="text-3xl font-bold mb-8 text-white animate-title-glow">Nuestros Valores</h2>
             <div className="grid md:grid-cols-3 gap-6">
               <div className="text-center animate-scale-in delay-600">
                 <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-glow-pulse">
                   <i className="fas fa-users text-2xl text-cyan-400 animate-icon-bounce"></i>
                 </div>
                 <h3 className="text-xl font-semibold mb-3 text-white">Comunidad</h3>
                 <p className="text-slate-400">
                   Creemos en el poder de las conexiones humanas auténticas y significativas.
                 </p>
               </div>
               <div className="text-center animate-scale-in delay-700">
                 <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-glow-pulse">
                   <i className="fas fa-lightbulb text-2xl text-cyan-400 animate-icon-bounce"></i>
                 </div>
                 <h3 className="text-xl font-semibold mb-3 text-white">Innovación</h3>
                 <p className="text-slate-400">
                   Constantemente buscamos nuevas formas de mejorar la experiencia del usuario.
                 </p>
               </div>
               <div className="text-center animate-scale-in delay-800">
                 <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-glow-pulse">
                   <i className="fas fa-shield-alt text-2xl text-cyan-400 animate-icon-bounce"></i>
                 </div>
                 <h3 className="text-xl font-semibold mb-3 text-white">Confianza</h3>
                 <p className="text-slate-400">
                   La privacidad y seguridad de nuestros usuarios son nuestra máxima prioridad.
                 </p>
               </div>
             </div>
           </section>

                                           {/* Equipo */}
            <section className="mb-16 animate-fade-in-up delay-600">
              <h2 className="text-3xl font-bold mb-8 text-white animate-title-glow">El Equipo Fundador</h2>
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 animate-card-hover">
               <p className="text-lg leading-relaxed mb-6">
                 GeoPlanner fue creado por un equipo de estudiantes de Ingeniería Informática de la Universidad URBE, 
                 unidos por la pasión por la tecnología y la innovación. Cada miembro aportó su experiencia única 
                 para dar vida a esta plataforma revolucionaria.
               </p>
               
                               <div className="grid md:grid-cols-2 gap-6 mt-8">
                  <div className="space-y-4 animate-fade-in-left delay-700">
                    <h3 className="text-xl font-semibold text-cyan-400 mb-4 animate-title-glow">Equipo Original (Computación Gráfica)</h3>
                    <ul className="space-y-2 text-slate-300">
                      <li className="animate-list-item delay-800"><strong>Juan Sarcos:</strong> Estructura del proyecto y desarrollo web</li>
                      <li className="animate-list-item delay-900"><strong>Daniel González:</strong> Lógica de programación</li>
                      <li className="animate-list-item delay-1000"><strong>César Acurero:</strong> Diseño visual y logo</li>
                      <li className="animate-list-item delay-1100"><strong>Valeria Socorro:</strong> Integración de mapas</li>
                      <li className="animate-list-item delay-1200"><strong>Willys Petit:</strong> Base de datos</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4 animate-fade-in-right delay-800">
                    <h3 className="text-xl font-semibold text-cyan-400 mb-4 animate-title-glow">Equipo Expandido (Multimedia y Diseño Web)</h3>
                    <ul className="space-y-2 text-slate-300">
                      <li className="animate-list-item delay-900"><strong>Juan Sarcos:</strong> Desarrollo web y liderazgo técnico</li>
                      <li className="animate-list-item delay-1000"><strong>Daniel González:</strong> Lógica JavaScript</li>
                      <li className="animate-list-item delay-1100"><strong>Valeria Socorro:</strong> Mapas y geolocalización</li>
                      <li className="animate-list-item delay-1200"><strong>Luis Villalobos:</strong> Integración de mapas</li>
                      <li className="animate-list-item delay-1300"><strong>Franger Alastre:</strong> Diseño visual y UX</li>
                    </ul>
                  </div>
                </div>
               
               <p className="text-lg leading-relaxed mt-6">
                 Bajo la guía del Profesor MSc. Luis Uribe, este equipo transformó una idea académica en una 
                 plataforma con potencial global. Hoy, GeoPlanner continúa evolucionando, manteniendo la visión 
                 original de conectar personas a través de experiencias reales.
               </p>
             </div>
           </section>

          {/* CTA */}
          <section className="text-center animate-fade-in-up delay-700">
            <h2 className="text-3xl font-bold mb-6 text-white animate-title-glow">¿Listo para unirte a la aventura?</h2>
            <p className="text-lg text-slate-400 mb-8">
              Descubre cómo GeoPlanner puede transformar la forma en que organizas y experimentas la vida.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/registro')}
                className="btn-primary px-8 py-3 rounded-full font-semibold text-white transition-transform hover:scale-105 animate-button-pulse"
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
          </section>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 px-6 border-t border-slate-500/30 bg-slate-900/50 backdrop-blur-sm">
        <Footer />
      </div>
    </div>
  )
}

export default AboutUs
