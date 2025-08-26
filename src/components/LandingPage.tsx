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
import './LandingAnimations.css'

const LandingPage = () => {
  const navigate = useNavigate()
  const starsContainerRef = useRef<HTMLDivElement>(null)
  const planetRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const ctaIconRef = useRef<HTMLDivElement>(null)
  const showFlashRef = useRef(false)

  useEffect(() => {
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
      const ctaThreshold = 1650
      const planetThreshold = 1700

      // Actualizar planeta
      if (planetRef.current) {
        const planetScale = Math.max(0.3, 1 - scrollY * 0.0006)
        const planetY = scrollY * 0.3
        const planetOpacity = Math.max(0, 1 - scrollY * 0.0007)
        const showPlanet = scrollY < planetThreshold

        planetRef.current.style.display = showPlanet ? "block" : "none"
        if (showPlanet) {
          planetRef.current.style.transform = `translateX(-50%) scale(${planetScale})`
          planetRef.current.style.bottom = `${-200 + planetY}px`
          planetRef.current.style.opacity = `${planetOpacity}`
        }
      }
      
      // Actualizar CTA
      if (ctaIconRef.current) {
        const starIcon = ctaIconRef.current.querySelector("#starIcon")
        const logoIcon = ctaIconRef.current.querySelector("#logoIcon")
        const flashEffect = document.getElementById("flashEffect")

        if (starIcon && logoIcon && flashEffect) {
          const showLogoInCTA = scrollY >= ctaThreshold

          if (scrollY >= ctaThreshold && scrollY < ctaThreshold + 50 && !showFlashRef.current) {
            showFlashRef.current = true
            flashEffect.classList.add("active")
            setTimeout(() => {
              flashEffect.classList.remove("active")
              showFlashRef.current = false
            }, 300)
          }

          (starIcon as HTMLElement).style.display = showLogoInCTA ? "none" : "block"
          logoIcon.classList.toggle("active", showLogoInCTA)
        }
      }
    }

    createStars()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="bg-black text-slate-300 font-sans overflow-x-hidden">
      {/* Fondo Animado */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-black"></div>
        <div className="absolute inset-0 radial-gradient"></div>
        
        {/* Planeta Tierra */}
        <div id="planet" ref={planetRef} className="planet-container">
          <div className="planet-wrapper">
            <div className="planet-earth">
              <div className="planet-image-placeholder">
                <img src={tierra} alt="Planeta Tierra" className="planet-image" />
              </div>
              <div className="planet-atmosphere"></div>
              <div className="planet-shadow"></div>
            </div>
            <div className="planet-logo">
              <div className="logo-circle">
                <div className="logo-image-placeholder">
                  <img src={logo} alt="Logo" className="logo-image" />
                </div>
              </div>
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
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center h-16 px-6 border-b border-slate-500/30 bg-slate-900/50 backdrop-blur-sm">
          <a href="#" className="flex items-center gap-2 text-decoration-none">
            <img src={logo} alt="Logo GeoPlanner" className="h-8 w-8" />
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
              GeoPlanner
            </span>
          </a>
          <nav className="hidden md:flex items-center gap-6 ml-auto">
            <a href="/login" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">Iniciar Sesión</a>
            <a href="/registro" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">Registrarse</a>
          </nav>
        </header>

        {/* Hero Section */}
        <section ref={heroRef} className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <div className="w-full max-w-4xl">
            {/* Contenedor para el título y el botón, con el margen inferior que empuja las tarjetas hacia abajo */}
            <div className="mb-[22rem] md:mb-[28rem] md:mt-[3rem]">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 text-transparent bg-clip-text animate-pulse">
                Conecta. Organiza. Explora.
              </h1>
            </div>
            <div className='md:mb-[2.5rem]'>
            <button 
                className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-semibold text-white transition-transform hover:scale-105"
                onClick={() => navigate('/login')}
              >
                <i className="fas fa-play"></i>
                Comienza Hoy
              </button>
            </div>

            {/* Tarjetas de previsualización */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
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
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-300 text-transparent bg-clip-text">Una Plataforma, Infinitas Posibilidades</h2>
              <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto">
                Conecta con personas afines, organiza tu vida social y descubre experiencias únicas. Todo en un solo lugar.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
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
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="cta-card text-center relative">
              <div id="flashEffect" className="flash-effect"></div>
              <div ref={ctaIconRef} className="cta-icon">
                <i id="starIcon" className="fas fa-star text-6xl text-indigo-900"></i>
                <div id="logoIcon" className="cta-logo">
                  <div className="cta-logo-image-placeholder">
                    <img src={logo} alt="Logo" className="cta-logo-image" />
                  </div>
                </div>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">Tu Próxima Aventura Comienza Aquí</h2>
              <p className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto mb-8">Únete a miles de personas que ya están creando momentos increíbles y conexiones auténticas.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  className="btn-primary px-8 py-3 rounded-full font-semibold text-white transition-transform hover:scale-105"
                  onClick={() => navigate('/login')}
                >
                  Iniciar Sesión
                </button>
                <button 
                  className="btn-primary px-8 py-3 rounded-full font-semibold text-white transition-transform hover:scale-105"
                  onClick={() => navigate('/registro')}
                >
                  Registrarme
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-8">Versión beta - Únete a la experiencia temprana y ayúdanos a mejorar.</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-slate-500/30">
          <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <img src={logo} alt="Logo" className="h-6 w-6" />
              <span className="text-sm text-slate-400">© 2024 GeoPlanner. Todos los derechos reservados.</span>
            </div>
            <div className="text-sm text-slate-500">
              2025 • Creado por The GeoPlanner Group
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default LandingPage 