import React from 'react'
import logo from '../assets/img/LogoMini.png'

const Footer: React.FC = () => {
  return (
         <footer className="container mx-auto max-w-7xl px-8">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
         {/* Logo y descripción */}
         <div className="flex flex-col items-start">
           <div className="flex items-center gap-3 mb-6">
             <img src={logo} alt="GeoPlanner Logo" className="h-16 w-16" />
             <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
               GeoPlanner
             </span>
           </div>
           <p className="text-base text-slate-400 leading-relaxed">
             © 2025 GeoPlanner.
             <br />
             Todos los derechos reservados — Creado por The GeoPlanner Group.
           </p>
         </div>
         
                    {/* Compañía */}
           <div>
             <h6 className="text-base font-semibold text-slate-300 mb-6">Compañía</h6>
             <div className="flex flex-col gap-3">
               <a href="/about" className="text-base text-slate-400 hover:text-cyan-400 transition-colors">Acerca de nosotros</a>
               <a href="/contact" className="text-base text-slate-400 hover:text-cyan-400 transition-colors">Contacto</a>
             </div>
           </div>

           {/* Legal */}
           <div>
             <h6 className="text-base font-semibold text-slate-300 mb-6">Legal</h6>
             <div className="flex flex-col gap-3">
               <a href="/terms" className="text-base text-slate-400 hover:text-cyan-400 transition-colors">Términos de uso</a>
               <a href="/privacy" className="text-base text-slate-400 hover:text-cyan-400 transition-colors">Política de privacidad</a>
               <a href="/cookies" className="text-base text-slate-400 hover:text-cyan-400 transition-colors">Política de cookies</a>
             </div>
           </div>
       </div>
     </footer>
  )
}

export default Footer
