/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores personalizados para GeoPlanner
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'spin-slow': 'spin 240s linear infinite',
        'twinkle': 'twinkle 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'drop-in': 'dropIn 1s ease-out',
        'logo-spin': 'logoSpin 6s linear infinite',
        'flash-burst': 'flashBurst 0.3s ease-out',
        'logo-appear': 'logoAppear 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        twinkle: {
          '0%': { opacity: '0.3', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(34, 211, 238, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(34, 211, 238, 0.4)' },
        },
        dropIn: {
          '0%': { transform: 'translateY(-100px) scale(1.2)', opacity: '0' },
          '70%': { transform: 'translateY(10px) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(0)' },
        },
        logoSpin: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
        flashBurst: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
        logoAppear: {
          '0%': { transform: 'scale(0) rotate(180deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
      },
      backgroundImage: {
        'space-gradient': 'linear-gradient(to bottom, #0f172a, #1e293b, #000)',
        'radial-gradient': 'radial-gradient(circle at center, transparent, rgba(30, 58, 138, 0.2), rgba(51, 65, 85, 0.4))',
        'planet-gradient': 'linear-gradient(to bottom right, #1e3a8a, #2563eb, #60a5fa)',
      },
    },
  },
  plugins: [
    require('daisyui')
  ],
  daisyui: {
    themes: [
      {
        geoplanner: {
          "primary": "#0ea5e9",
          "secondary": "#64748b",
          "accent": "#f59e0b",
          "neutral": "#1e293b",
          "base-100": "#ffffff",
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272",
        },
      },
      {
        aurora: {
          "primary": "#1D2B64",
          "secondary": "#F8CDDA",
          "accent": "#FF6B6B",
          "neutral": "#2A2A2A",
          "base-100": "#fdeff2",
          "info": "#4ECDC4",
          "success": "#45B7D1",
          "warning": "#96CEB4",
          "error": "#FFEAA7",
        },
      },
      {
        noche: {
          "primary": "#38bdf8",
          "secondary": "#475569",
          "accent": "#f59e0b",
          "neutral": "#1e293b",
          "base-100": "#0f172a",
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272",
        },
      },
      {
        oceano: {
          "primary": "#4CA1AF",
          "secondary": "#2C3E50",
          "accent": "#E74C3C",
          "neutral": "#34495E",
          "base-100": "#eef6f7",
          "info": "#3498DB",
          "success": "#2ECC71",
          "warning": "#F1C40F",
          "error": "#E74C3C",
        },
      },
      {
        amanecer: {
          "primary": "#FF512F",
          "secondary": "#F09819",
          "accent": "#FF6B6B",
          "neutral": "#5c2a07",
          "base-100": "#fff8f2",
          "info": "#4ECDC4",
          "success": "#45B7D1",
          "warning": "#96CEB4",
          "error": "#FFEAA7",
        },
      },
      {
        pastel: {
          "primary": "#A1C4FD",
          "secondary": "#C2E9FB",
          "accent": "#FFB6C1",
          "neutral": "#003366",
          "base-100": "#f5f9ff",
          "info": "#87CEEB",
          "success": "#98FB98",
          "warning": "#F0E68C",
          "error": "#FFB6C1",
        },
      },
      {
        fuego: {
          "primary": "#CB356B",
          "secondary": "#BD3F32",
          "accent": "#FF6B6B",
          "neutral": "#4d1024",
          "base-100": "#f9f2f3",
          "info": "#FF8C00",
          "success": "#FF4500",
          "warning": "#FF6347",
          "error": "#DC143C",
        },
      },
      {
        bosque: {
          "primary": "#11998E",
          "secondary": "#38EF7D",
          "accent": "#FF6B6B",
          "neutral": "#043d38",
          "base-100": "#f2fcf8",
          "info": "#4ECDC4",
          "success": "#45B7D1",
          "warning": "#96CEB4",
          "error": "#FFEAA7",
        },
      },
      {
        lluvia: {
          "primary": "#396afc",
          "secondary": "#2948ff",
          "accent": "#FF6B6B",
          "neutral": "#192d8b",
          "base-100": "#f0f2ff",
          "info": "#4ECDC4",
          "success": "#45B7D1",
          "warning": "#96CEB4",
          "error": "#FFEAA7",
        },
      },
      "light",
      "dark",
    ],
    darkTheme: "noche",
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: true,
    themeRoot: ":root",
  },
} 