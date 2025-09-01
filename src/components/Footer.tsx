import React from 'react'
import logo from '../assets/img/LogoMini.png'

const Footer: React.FC = () => {
  return (
         <footer className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
         {/* Logo y descripción */}
         <div className="flex flex-col items-start">
           <div className="flex items-center gap-3 mb-4 sm:mb-6">
             <img src={logo} alt="GeoPlanner Logo" className="h-12 w-12 sm:h-16 sm:w-16" />
             <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
               GeoPlanner
             </span>
           </div>
           <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
             © 2025 GeoPlanner.
             <br />
             Todos los derechos reservados — Creado por The GeoPlanner Group.
           </p>
         </div>
         
                    {/* Compañía */}
           <div>
             <h6 className="text-sm sm:text-base font-semibold text-slate-300 mb-4 sm:mb-6">Compañía</h6>
             <div className="flex flex-col gap-2 sm:gap-3">
               <a href="/about" className="text-sm sm:text-base text-slate-400 hover:text-cyan-400 transition-colors">Acerca de nosotros</a>
               <a href="/contact" className="text-sm sm:text-base text-slate-400 hover:text-cyan-400 transition-colors">Contacto</a>
             </div>
           </div>

           {/* Legal */}
           <div>
             <h6 className="text-sm sm:text-base font-semibold text-slate-300 mb-4 sm:mb-6">Legal</h6>
             <div className="flex flex-col gap-2 sm:gap-3">
               <a href="/terms" className="text-sm sm:text-base text-slate-400 hover:text-cyan-400 transition-colors">Términos de uso</a>
               <a href="/privacy" className="text-sm sm:text-base text-slate-400 hover:text-cyan-400 transition-colors">Política de privacidad</a>
               <a href="/cookies" className="text-sm sm:text-base text-slate-400 hover:text-cyan-400 transition-colors">Política de cookies</a>
             </div>
           </div>
       </div>
     </footer>
  )
}

export default Footer
