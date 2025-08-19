import React from 'react'
import logo from '../assets/img/LogoMini.png'

const Footer: React.FC = () => {
  return (
    <footer className="footer sm:footer-horizontal p-10 bg-[#f8f9fa] [box-shadow:0_-2px_8px_rgba(0,0,0,0.1)] text-[#007bff]">
      <aside>
        <img src={logo} alt="GeoPlanner Logo" className="w-12 h-12" />
        <p>
          © 2025 GeoPlanner.
          <br />
          Todos los derechos reservados — Creado por The GeoPlanner Group.
        </p>
      </aside>
      <nav>
        <h6 className="footer-title text-[#007bff]">Servicios</h6>
        <a className="link link-hover text-[#007bff] hover:text-[#0056b3]">Organización de Eventos</a>
        <a className="link link-hover text-[#007bff] hover:text-[#0056b3]">Geolocalización</a>
        <a className="link link-hover text-[#007bff] hover:text-[#0056b3]">Redes Sociales</a>
        <a className="link link-hover text-[#007bff] hover:text-[#0056b3]">Planificación</a>
      </nav>
      <nav>
        <h6 className="footer-title text-[#007bff]">Compañía</h6>
        <a className="link link-hover text-[#007bff] hover:text-[#0056b3]">Acerca de nosotros</a>
        <a className="link link-hover text-[#007bff] hover:text-[#0056b3]">Contacto</a>
        <a className="link link-hover text-[#007bff] hover:text-[#0056b3]">Trabajos</a>
        <a className="link link-hover text-[#007bff] hover:text-[#0056b3]">Kit de prensa</a>
      </nav>
      <nav>
        <h6 className="footer-title text-[#007bff]">Legal</h6>
        <a className="link link-hover text-[#007bff] hover:text-[#0056b3]">Términos de uso</a>
        <a className="link link-hover text-[#007bff] hover:text-[#0056b3]">Política de privacidad</a>
        <a className="link link-hover text-[#007bff] hover:text-[#0056b3]">Política de cookies</a>
      </nav>
    </footer>
  )
}

export default Footer
