/**
 * ========================================
 * COMPONENTE LANDING PAGE DE GEOPLANNER
 * ========================================
 * 
 * Esta es la página de inicio de GeoPlanner que se muestra
 * a los usuarios que visitan la aplicación por primera vez.
 * 
 * FUNCIONALIDADES PRINCIPALES:
 * - Presentación de la plataforma GeoPlanner
 * - Animaciones y efectos visuales atractivos
 * - Navegación a registro e inicio de sesión
 * - Información sobre las características principales
 * - Diseño responsivo para todos los dispositivos
 * 
 * IMPORTANTE PARA EL EQUIPO:
 * - Es la primera impresión que tienen los usuarios
 * - Debe ser atractiva y profesional
 * - Incluye animaciones CSS personalizadas
 * - Optimizada para conversión de usuarios
 */

import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/img/Logo.png'
import tierra from '../assets/img/tierra.png'
import mapa from '../assets/img/mapa.png'
import Header from '../components/Header'
import Footer from '../components/Footer'
import '../styles/LandingAnimations.css'

const LandingPage = () => {
  const navigate = useNavigate()
  const starsContainerRef = useRef<HTMLDivElement>(null)
  const planetRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const ctaIconRef = useRef<HTMLDivElement>(null)
  const showFlashRef = useRef(false)

  useEffect(() => {
    // Función para reinicializar animaciones (útil para hot reload)
    const initializeAnimations = () => {
      // Resetear el estado del flash effect
      showFlashRef.current = false
      
      // Asegurar que la estrella esté visible inicialmente
      if (ctaIconRef.current) {
        const starIcon = ctaIconRef.current.querySelector("#starIcon")
        const logoIcon = ctaIconRef.current.querySelector("#logoIcon")
        const flashEffect = document.getElementById("flashEffect")
        
        if (starIcon && logoIcon && flashEffect) {
          (starIcon as HTMLElement).style.display = "block"
          logoIcon.classList.remove("active")
          flashEffect.classList.remove("active")
        }
      }
    }

    // Crear estrellas dinámicamente
    const createStars = () => {
      if (!starsContainerRef.current) return
      starsContainerRef.current.innerHTML = '' // Limpiar estrellas existentes

      // Estrellas distantes
      for (let i = 0; i < 80; i++) {
        const star = document.createElement("div")
        star.className = "star"
        star.style.width = `${0.5 + Math.random() * 1}px`
        star.style.height = star.style.width
        star.style.left = `${Math.random() * 100}%`
        star.style.top = `${Math.random() * 100}%`
        star.style.animationDelay = `${Math.random() * 4}s`
        star.style.animationDuration = `${2 + Math.random() * 3}s`
        starsContainerRef.current?.appendChild(star)
      }

      // Estrellas medianas
      for (let i = 0; i < 40; i++) {
        const star = document.createElement("div")
        star.className = "star medium"
        star.style.width = `${1 + Math.random() * 1.5}px`
        star.style.height = star.style.width
        star.style.left = `${Math.random() * 100}%`
        star.style.top = `${Math.random() * 100}%`
        star.style.animationDelay = `${Math.random() * 3}s`
        star.style.animationDuration = `${1.5 + Math.random() * 2}s`
        starsContainerRef.current?.appendChild(star)
      }

      // Estrellas brillantes
      for (let i = 0; i < 15; i++) {
        const star = document.createElement("div")
        star.className = "star bright"
        star.style.width = `${1.5 + Math.random() * 2}px`
        star.style.height = star.style.width
        star.style.left = `${Math.random() * 100}%`
        star.style.top = `${Math.random() * 100}%`
        star.style.animationDelay = `${Math.random() * 2}s`
        star.style.animationDuration = `${1 + Math.random() * 1.5}s`
        starsContainerRef.current?.appendChild(star)
      }
    }

         // Manejar scroll y animaciones
     const handleScroll = () => {
       const scrollY = window.scrollY
               const ctaThreshold = 900
       const planetThreshold = 1700

       // Actualizar planeta con requestAnimationFrame para mejor rendimiento
       if (planetRef.current) {
         requestAnimationFrame(() => {
           const planetScale = Math.max(0.3, 1 - scrollY * 0.0006)
           const planetY = scrollY * 0.3
           const planetOpacity = Math.max(0, 1 - scrollY * 0.0007)
           const showPlanet = scrollY < planetThreshold

           planetRef.current!.style.display = showPlanet ? "block" : "none"
           if (showPlanet) {
             planetRef.current!.style.transform = `translateX(-50%) scale(${planetScale})`
             planetRef.current!.style.bottom = `${-200 + planetY}px`
             planetRef.current!.style.opacity = `${planetOpacity}`
           }
         })
       }
      
      // Actualizar CTA
      if (ctaIconRef.current) {
        const starIcon = ctaIconRef.current.querySelector("#starIcon")
        const logoIcon = ctaIconRef.current.querySelector("#logoIcon")
        const flashEffect = document.getElementById("flashEffect")

        if (starIcon && logoIcon && flashEffect) {
          const showLogoInCTA = scrollY >= ctaThreshold
                     const hideStarThreshold = ctaThreshold - 200 // La estrella se oculta 200px antes

          if (scrollY >= ctaThreshold && scrollY < ctaThreshold + 50 && !showFlashRef.current) {
            showFlashRef.current = true
            flashEffect.classList.add("active")
            console.log('Flash effect activated!')
            setTimeout(() => {
              flashEffect.classList.remove("active")
              showFlashRef.current = false
            }, 300)
          }

          // La estrella se oculta antes que aparezca el logo
          (starIcon as HTMLElement).style.display = scrollY >= hideStarThreshold ? "none" : "block"
          logoIcon.classList.toggle("active", showLogoInCTA)
          
          if (showLogoInCTA) {
            console.log('Logo should be visible now!')
          }
                }
      }
    }

    // Inicializar animaciones
    initializeAnimations()
    createStars()
     
     // Usar throttling para mejorar el rendimiento del scroll
     let ticking = false
     const throttledHandleScroll = () => {
       if (!ticking) {
         requestAnimationFrame(() => {
           handleScroll()
           ticking = false
         })
         ticking = true
       }
     }
     
     window.addEventListener('scroll', throttledHandleScroll, { passive: true })
     return () => window.removeEventListener('scroll', throttledHandleScroll)
  }, [])

  return (
    <div className="bg-black text-slate-300 font-sans overflow-x-hidden">
      {/* Fondo Animado */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-black"></div>
        <div className="absolute inset-0 radial-gradient"></div>
        
                                   {/* Planeta Tierra */}
                    <div 
             id="planet" 
             ref={planetRef} 
             className="fixed z-5 right-2/100 bottom-[100px] sm:bottom-[150px] md:bottom-[200px] lg:bottom-[250px] xl:bottom-[300px] transform -translate-x-1/2"
             style={{ transition: 'opacity 0.3s ease-out, transform 0.1s ease-out' }}
           >
                       <div className="relative w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] xl:w-[600px] xl:h-[600px]">
             <div className="w-full h-full rounded-full relative overflow-hidden shadow-[inset_-20px_-20px_40px_rgba(0,0,0,0.4),0_0_40px_rgba(34,211,238,0.2),0_0_80px_rgba(34,211,238,0.1)]">
               <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-800 via-blue-600 to-blue-400 flex items-center justify-center text-2xl font-bold text-white/80 border-3 border-dashed border-cyan-400/50">
                 <img 
                   src={tierra} 
                   alt="Planeta Tierra" 
                   className="w-[113%] h-[113%] object-cover animate-[spin_240s_linear_infinite]" 
                 />
               </div>
               <div className="absolute inset-0 rounded-full bg-gradient-radial from-cyan-400/15 via-blue-500/8 to-transparent"></div>
               <div className="absolute inset-0 rounded-full bg-gradient-ellipse from-black/60 via-black/30 to-transparent" style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }}></div>
             </div>
              <div className="absolute -top-12 sm:-top-16 md:-top-20 lg:-top-24 xl:-top-28 right-1/6 transform -translate-x-1/2 z-10">
                    <img 
                    src={logo} 
                    alt="Logo" 
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 transform scale-110 drop-shadow-lg filter drop-shadow-cyan-400/50 animate-bounce" 
                    style={{ 
                      animationDuration: '3s',
                      filter: 'drop-shadow(0 0 15px rgba(34, 211, 238, 0.8))'
                    }}
                  />
               </div>
           </div>
         </div>

        <div id="stars" ref={starsContainerRef} className="stars-container"></div>
        <div className="nebula-container">
          <div className="nebula nebula-1"></div>
          <div className="nebula nebula-2"></div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="relative z-10">
        {/* Header */}
        <Header />

                 {/* Hero Section */}
         <section ref={heroRef} className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 text-center pt-20 sm:pt-24 md:pt-28 lg:pt-32 xl:pt-36">
          <div className="w-full max-w-4xl">
            {/* Contenedor para el título y el botón, con el margen inferior que empuja las tarjetas hacia abajo */}
            <div className="mb-16 sm:mb-20 md:mb-[28rem] md:mt-[3rem]">
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 md:mb-8 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 text-transparent bg-clip-text animate-pulse leading-tight">
                Conecta. Organiza. Explora.
              </h1>
            </div>
            <div className='mb-8 md:mb-[2.5rem]'>
            <button 
                className="btn-primary inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-full font-semibold text-white transition-transform hover:scale-105 text-sm sm:text-base"
                onClick={() => navigate('/login')}
              >
                <i className="fas fa-play"></i>
                Comienza Hoy
              </button>
            </div>

            {/* Tarjetas de previsualización */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
              {/* Tarjeta 1 */}
              <div className="card-preview">
                <i className="fas fa-calendar card-icon"></i>
                <h3 className="card-title flex justify-center">Crea y Descubre Eventos</h3>
                <p className="card-description">
                  Organiza tus planes o únete a eventos cerca de ti. Convierte cada momento en una experiencia memorable.
                </p>
              </div>
              {/* Tarjeta 2 */}
              <div className="card-preview ">
                <i className="fas fa-check-square card-icon"></i>
                <h3 className="card-title flex justify-center">Gestiona Tu Agenda Personal</h3>
                <p className="card-description">
                  Organiza tus actividades diarias de forma intuitiva. Mantén el control de lo que realmente importa.
                </p>
              </div>
              {/* Tarjeta 3 */}
              <div className="card-preview ">
                <i className="fas fa-map-marker-alt card-icon"></i>
                <h3 className="card-title flex justify-center">Explora Tu Ciudad</h3>
                <p className="card-description">
                  Descubre lugares únicos y comparte tus mejores momentos. Tu ciudad tiene más que ofrecer.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-300 text-transparent bg-clip-text leading-tight">Una Plataforma, Infinitas Posibilidades</h2>
              <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-3xl mx-auto px-4">
                Conecta con personas afines, organiza tu vida social y descubre experiencias únicas. Todo en un solo lugar.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div className="flex flex-col gap-8">
                <div className="feature-card">
                  <i className="fas fa-users feature-icon"></i>
                  <h3 className="feature-title">Conecta con Tu Gente</h3>
                  <p className="feature-text">Encuentra personas que comparten tus intereses y crea vínculos auténticos.</p>
                </div>
                <div className="feature-card">
                  <i className="fas fa-bolt feature-icon"></i>
                  <h3 className="feature-title">Inspira y Deja Huella</h3>
                  <p className="feature-text">Documenta tus aventuras, crea rutas y comparte historias que motiven a otros.</p>
                </div>
              </div>
              <div className="feature-showcase">
                <img src={mapa} alt="Mapa interactivo" className="rounded-lg shadow-2xl shadow-cyan-500/10" />
                <div className="showcase-visual1"><i className="fas fa-map-marker-alt text-cyan-400 text-5xl"></i></div>
                <div className="showcase-visual2"><i className="fas fa-map-marker-alt text-red-500 text-5xl"></i></div>
                <div className="showcase-visual3"><i className="fas fa-map-marker-alt text-green-500 text-5xl"></i></div>
                <h3 className="text-xl font-bold mt-4">Tu Mundo Social en Tiempo Real</h3>
                <p className="text-slate-400">Descubre qué está pasando a tu alrededor ahora mismo en nuestro mapa interactivo.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="cta-card text-center relative">
              <div id="flashEffect" className="flash-effect"></div>
              <div ref={ctaIconRef} className="cta-icon">
                <i id="starIcon" className="fas fa-star text-4xl sm:text-5xl md:text-6xl text-indigo-900"></i>
                <div id="logoIcon" className="cta-logo">
                  <div className="cta-logo-image-placeholder">
                    <img src={logo} alt="Logo" className="cta-logo-image " />
                  </div>
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-4 gradient-text leading-tight">Tu Próxima Aventura Comienza Aquí</h2>
              <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-xl mx-auto mb-6 sm:mb-8 px-4">Únete a miles de personas que ya están creando momentos increíbles y conexiones auténticas.</p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button 
                  className="btn-primary px-6 sm:px-8 py-3 rounded-full font-semibold text-white transition-transform hover:scale-105 text-sm sm:text-base"
                  onClick={() => navigate('/login')}
                >
                  Iniciar Sesión
                </button>
                <button 
                  className="btn-primary px-6 sm:px-8 py-3 rounded-full font-semibold text-white transition-transform hover:scale-105 text-sm sm:text-base"
                  onClick={() => navigate('/registro')}
                >
                  Registrarme
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-6 sm:mt-8">Versión beta - Únete a la experiencia temprana y ayúdanos a mejorar.</p>
            </div>
          </div>
        </section>

                 {/* Footer */}
         <div className="py-6 sm:py-8 px-4 sm:px-6 border-t border-slate-500/30 bg-slate-900/50 backdrop-blur-sm">
           <Footer />
         </div>
      </div>
    </div>
  )
}

export default LandingPage 