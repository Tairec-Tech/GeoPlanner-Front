// Componente de fondo animado

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradiente base */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-slate-900" />
      
      {/* Círculos animados - Tema Default (Cyan/Blue) */}
      <div className="absolute inset-0">
        <div 
          className="absolute rounded-full opacity-40"
          style={{
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(34, 211, 238, 0.7) 0%, rgba(59, 130, 246, 0.5) 50%, transparent 70%)',
            top: '20%',
            left: '10%',
            animation: 'floatCircle 12s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute rounded-full opacity-35"
          style={{
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(34, 211, 238, 0.4) 60%, transparent 80%)',
            top: '60%',
            right: '15%',
            animation: 'floatCircle 15s ease-in-out infinite 3s'
          }}
        />
      </div>
      
      {/* Círculos animados - Tema Aurora (Verde/Azul verdoso) */}
      <div className="absolute inset-0">
        <div 
          className="absolute rounded-full opacity-38"
          style={{
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.6) 0%, rgba(5, 150, 105, 0.4) 50%, transparent 70%)',
            top: '30%',
            right: '25%',
            animation: 'floatCircle 18s ease-in-out infinite 2s'
          }}
        />
        <div 
          className="absolute rounded-full opacity-32"
          style={{
            width: '350px',
            height: '350px',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.5) 0%, rgba(8, 145, 178, 0.3) 60%, transparent 80%)',
            bottom: '20%',
            left: '20%',
            animation: 'floatCircle 20s ease-in-out infinite 7s'
          }}
        />
      </div>
      
      {/* Círculos animados - Tema Noche (Púrpura/Azul profundo) */}
      <div className="absolute inset-0">
        <div 
          className="absolute rounded-full opacity-42"
          style={{
            width: '700px',
            height: '700px',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(124, 58, 237, 0.4) 50%, transparent 70%)',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            animation: 'floatCircle 25s ease-in-out infinite 1s'
          }}
        />
        <div 
          className="absolute rounded-full opacity-36"
          style={{
            width: '450px',
            height: '450px',
            background: 'radial-gradient(circle, rgba(30, 58, 138, 0.6) 0%, rgba(30, 64, 175, 0.4) 60%, transparent 80%)',
            bottom: '30%',
            right: '10%',
            animation: 'floatCircle 22s ease-in-out infinite 5s'
          }}
        />
      </div>
      
      {/* Círculos animados - Tema Fuego (Naranja/Rojo) */}
      <div className="absolute inset-0">
        <div 
          className="absolute rounded-full opacity-39"
          style={{
            width: '550px',
            height: '550px',
            background: 'radial-gradient(circle, rgba(251, 146, 60, 0.6) 0%, rgba(245, 101, 101, 0.4) 50%, transparent 70%)',
            top: '50%',
            left: '30%',
            animation: 'floatCircle 16s ease-in-out infinite 4s'
          }}
        />
        <div 
          className="absolute rounded-full opacity-33"
          style={{
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.5) 0%, rgba(220, 38, 127, 0.3) 60%, transparent 80%)',
            top: '15%',
            right: '5%',
            animation: 'floatCircle 19s ease-in-out infinite 8s'
          }}
        />
      </div>
      
      {/* Partículas flotantes mejoradas */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: `${3 + Math.random() * 4}px`,
              height: `${3 + Math.random() * 4}px`,
              background: `rgba(${34 + Math.random() * 50}, ${211 - Math.random() * 50}, ${238 - Math.random() * 50}, ${0.6 + Math.random() * 0.4})`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${4 + Math.random() * 6}s`
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default AnimatedBackground
