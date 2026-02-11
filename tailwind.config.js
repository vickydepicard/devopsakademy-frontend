// tailwind.config.js
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 🎨 PALETTE PREMIUM - Optimisée depuis vos couleurs
        primary: {
          50: '#f5f5ff',
          100: '#e8e8ff',
          200: '#c7c2ff',
          300: '#a59cff',
          400: '#8176ff',
          500: '#5653e1',     // Votre #5653e1 - Violet lumineux
          600: '#4a46c9',
          700: '#3b3aab',
          800: '#2d287f',     // Votre #2d287f - Violet profond
          900: '#1f1b5a',
          DEFAULT: '#2d287f',
          light: '#5653e1',
          dark: '#1f1b5a',
          vibrant: '#4f46e5',
        },
        accent: {
          50: '#fffdf0',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',     // Votre #facc15 - Jaune vif
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          DEFAULT: '#facc15',
          light: '#fde047',
          dark: '#ca8a04',
        },
        neutral: {
          50: '#f9fbfc',      // Votre #f9fbfc - Blanc cassé
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          DEFAULT: '#f9fbfc',
        },
        // 🎨 COULEURS TECH MODERNES
        tech: {
          docker: '#0db7ed',
          kubernetes: '#326ce5',
          aws: '#ff9900',
          azure: '#0089d6',
          gcp: '#4285f4',
          terraform: '#7b42bc',
          github: '#181717',
          gitlab: '#fc6d26',
          jenkins: '#d24939',
          ansible: '#000000',
          prometheus: '#e6522c',
          grafana: '#f46800',
          nginx: '#009639',
        },
        // 🎨 COULEURS DE STATUT AVANCÉES
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
          running: '#10b981',
          stopped: '#ef4444',
          pending: '#f59e0b',
          deployed: '#8b5cf6',
          failed: '#dc2626',
          healthy: '#22c55e',
          degraded: '#f59e0b',
          unknown: '#6b7280',
        },
        // 🎨 GRADIENTS PREMIUM
        gradient: {
          'primary': 'linear-gradient(135deg, #2d287f 0%, #5653e1 100%)',
          'primary-reverse': 'linear-gradient(135deg, #5653e1 0%, #2d287f 100%)',
          'accent': 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
          'electric': 'linear-gradient(135deg, #2d287f 0%, #facc15 100%)',
          'tech': 'linear-gradient(135deg, #0db7ed 0%, #326ce5 100%)',
          'dark': 'linear-gradient(135deg, #1f1b5a 0%, #2d287f 100%)',
          'success': 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)',
          'warning': 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
          'error': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          'glass-dark': 'linear-gradient(135deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%)',
        },
      },
      
      // 🎯 BACKGROUND IMAGES & PATTERNS
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #2d287f 0%, #5653e1 100%)',
        'gradient-accent': 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
        'gradient-electric': 'linear-gradient(135deg, #2d287f 0%, #facc15 100%)',
        'gradient-tech': 'linear-gradient(135deg, #0db7ed 0%, #326ce5 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%235653e1' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'circuit-pattern': "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23facc15' fill-opacity='0.07' fill-rule='evenodd'/%3E%3C/svg%3E\")",
        'noise-texture': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E\")",
        'binary-pattern': "url(\"data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='10' y='20' font-family='monospace' font-size='12' fill='%235653e1' fill-opacity='0.05'%3E101010%3C/text%3E%3Ctext x='30' y='40' font-family='monospace' font-size='12' fill='%235653e1' fill-opacity='0.05'%3E010101%3C/text%3E%3Ctext x='50' y='60' font-family='monospace' font-size='12' fill='%235653e1' fill-opacity='0.05'%3E110011%3C/text%3E%3Ctext x='70' y='80' font-family='monospace' font-size='12' fill='%235653e1' fill-opacity='0.05'%3E001100%3C/text%3E%3C/svg%3E\")",
      },
      
      // 🎯 ANIMATIONS PREMIUM
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'spin-fast': 'spin 0.8s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
        'bounce-fast': 'bounce 1s infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-fast': 'float 3s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'gradient-shift-fast': 'gradientShift 3s ease infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'shimmer-slow': 'shimmer 3s infinite linear',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'wave': 'wave 1.5s linear infinite',
        'typing': 'typing 2s steps(20) infinite',
        'terminal-blink': 'terminalBlink 1s step-end infinite',
        'server-spin': 'serverSpin 4s linear infinite',
        'deploy-progress': 'deployProgress 2s ease-in-out infinite',
        'container-scale': 'containerScale 2s ease-in-out infinite',
        'network-flow': 'networkFlow 3s linear infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        fadeInDown: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(-20px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        slideInRight: {
          '0%': { 
            opacity: '0',
            transform: 'translateX(20px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateX(0)'
          },
        },
        slideInLeft: {
          '0%': { 
            opacity: '0',
            transform: 'translateX(-20px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateX(0)'
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        gradientShift: {
          '0%, 100%': { 
            backgroundPosition: '0% 50%',
            backgroundSize: '200% 200%'
          },
          '50%': { 
            backgroundPosition: '100% 50%',
            backgroundSize: '200% 200%'
          },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
        },
        glow: {
          '0%': { 
            boxShadow: '0 0 20px rgba(86, 83, 225, 0.5)',
            filter: 'brightness(1)'
          },
          '100%': { 
            boxShadow: '0 0 40px rgba(86, 83, 225, 0.8)',
            filter: 'brightness(1.1)'
          },
        },
        glowPulse: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(250, 204, 21, 0.5)'
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(250, 204, 21, 0.8)'
          },
        },
        wave: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        typing: {
          '0%, 100%': { width: '0' },
          '50%': { width: '100%' },
        },
        terminalBlink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        serverSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        deployProgress: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        containerScale: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        networkFlow: {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      
      // 🎯 SHADOWS & GLOWS
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -2px rgba(45, 40, 127, 0.1), 0 12px 24px -4px rgba(45, 40, 127, 0.08)',
        'hard': '0 10px 40px -10px rgba(45, 40, 127, 0.15), 0 20px 64px -16px rgba(45, 40, 127, 0.1)',
        'inner-lg': 'inset 0 2px 8px 0 rgba(0, 0, 0, 0.06)',
        'inner-xl': 'inset 0 4px 12px 0 rgba(0, 0, 0, 0.08)',
        'glow-primary': '0 0 25px rgba(86, 83, 225, 0.4)',
        'glow-accent': '0 0 25px rgba(250, 204, 21, 0.4)',
        'glow-success': '0 0 25px rgba(16, 185, 129, 0.4)',
        'glow-warning': '0 0 25px rgba(245, 158, 11, 0.4)',
        'glow-error': '0 0 25px rgba(239, 68, 68, 0.4)',
        'glow-tech': '0 0 25px rgba(13, 183, 237, 0.4)',
        'float': '0 20px 60px rgba(45, 40, 127, 0.15)',
        'float-accent': '0 20px 60px rgba(250, 204, 21, 0.15)',
        'neon': '0 0 10px rgba(86, 83, 225, 0.8), 0 0 20px rgba(86, 83, 225, 0.6), 0 0 30px rgba(86, 83, 225, 0.4)',
        'neon-accent': '0 0 10px rgba(250, 204, 21, 0.8), 0 0 20px rgba(250, 204, 21, 0.6), 0 0 30px rgba(250, 204, 21, 0.4)',
        'depth': '0 1px 0 rgba(255,255,255,0.1), inset 0 1px 0 rgba(0,0,0,0.1)',
      },
      
      // 🎯 BORDER RADIUS ÉLÉGANTS
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '3rem',
        'full': '9999px',
        'tech': '0.75rem',
        'card': '1.25rem',
        'button': '0.875rem',
        'chip': '2rem',
      },
      
      // 🎯 TYPOGRAPHIE TECH
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Consolas', 'monospace'],
        'display': ['Poppins', 'Inter', 'sans-serif'],
        'tech': ['SF Mono', 'JetBrains Mono', 'monospace'],
        'code': ['Fira Code', 'JetBrains Mono', 'monospace'],
      },
      
      fontSize: {
        'xxs': '0.625rem',
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem',
        '8xl': '6rem',
        '9xl': '8rem',
        '10xl': '10rem',
      },
      
      // 🎯 SPACING AVANCÉ
      spacing: {
        '0': '0',
        'px': '1px',
        '0.5': '0.125rem',
        '1': '0.25rem',
        '1.5': '0.375rem',
        '2': '0.5rem',
        '2.5': '0.625rem',
        '3': '0.75rem',
        '3.5': '0.875rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '7': '1.75rem',
        '8': '2rem',
        '9': '2.25rem',
        '10': '2.5rem',
        '11': '2.75rem',
        '12': '3rem',
        '14': '3.5rem',
        '16': '4rem',
        '18': '4.5rem',
        '20': '5rem',
        '24': '6rem',
        '28': '7rem',
        '32': '8rem',
        '36': '9rem',
        '40': '10rem',
        '44': '11rem',
        '48': '12rem',
        '52': '13rem',
        '56': '14rem',
        '60': '15rem',
        '64': '16rem',
        '72': '18rem',
        '80': '20rem',
        '88': '22rem',
        '96': '24rem',
        '100': '25rem',
        '104': '26rem',
        '108': '27rem',
        '112': '28rem',
        '116': '29rem',
        '120': '30rem',
        '124': '31rem',
        '128': '32rem',
      },
      
      // 🎯 SCREENS RESPONSIVE
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
        '4xl': '2560px',
      },
      
      // 🎯 BLUR & BACKDROP
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
      
      // 🎯 OPACITÉ
      opacity: {
        '15': '0.15',
        '35': '0.35',
        '85': '0.85',
        '95': '0.95',
      },
      
      // 🎯 Z-INDEX
      zIndex: {
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
        'auto': 'auto',
      },
      
      // 🎯 WIDTH & HEIGHT
      width: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '104': '26rem',
        '112': '28rem',
        '120': '30rem',
        '128': '32rem',
      },
      
      height: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '104': '26rem',
        '112': '28rem',
        '120': '30rem',
        '128': '32rem',
      },
      
      minHeight: {
        '0': '0',
        'full': '100%',
        'screen': '100vh',
        'screen-75': '75vh',
        'screen-90': '90vh',
        'screen-95': '95vh',
      },
      
      maxWidth: {
        'xs': '20rem',
        'sm': '24rem',
        'md': '28rem',
        'lg': '32rem',
        'xl': '36rem',
        '2xl': '42rem',
        '3xl': '48rem',
        '4xl': '56rem',
        '5xl': '64rem',
        '6xl': '72rem',
        '7xl': '80rem',
        '8xl': '88rem',
        '9xl': '96rem',
        'full': '100%',
        'screen': '100vw',
      },
      
      // 🎯 TRANSITIONS
      transitionDuration: {
        '0': '0ms',
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
        '2000': '2000ms',
      },
      
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'expo': 'cubic-bezier(0.87, 0, 0.13, 1)',
        'circ': 'cubic-bezier(0.6, 0.04, 0.98, 0.335)',
      },
      
      // 🎯 GRID
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
        '14': 'repeat(14, minmax(0, 1fr))',
        '15': 'repeat(15, minmax(0, 1fr))',
        '16': 'repeat(16, minmax(0, 1fr))',
        '24': 'repeat(24, minmax(0, 1fr))',
        'auto-fit-250': 'repeat(auto-fit, minmax(250px, 1fr))',
        'auto-fit-300': 'repeat(auto-fit, minmax(300px, 1fr))',
        'auto-fill-200': 'repeat(auto-fill, minmax(200px, 1fr))',
      },
      
      gridTemplateRows: {
        '8': 'repeat(8, minmax(0, 1fr))',
        '9': 'repeat(9, minmax(0, 1fr))',
        '10': 'repeat(10, minmax(0, 1fr))',
        '11': 'repeat(11, minmax(0, 1fr))',
        '12': 'repeat(12, minmax(0, 1fr))',
      },
      
      // 🎯 LINE HEIGHTS
      lineHeight: {
        'none': '1',
        'tight': '1.25',
        'snug': '1.375',
        'normal': '1.5',
        'relaxed': '1.625',
        'loose': '2',
        '3': '.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '7': '1.75rem',
        '8': '2rem',
        '9': '2.25rem',
        '10': '2.5rem',
      },
    },
  },
  
  plugins: [
    // 🎨 PLUGIN UTILITAIRES PERSONNALISÉS
    function({ addUtilities, addComponents, theme }) {
      
      // 🎯 GRADIENTS TEXT & BACKGROUND
      const gradientUtilities = {
        // Text gradients
        '.gradient-text-primary': {
          background: theme('gradient.primary'),
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.gradient-text-accent': {
          background: theme('gradient.accent'),
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.gradient-text-electric': {
          background: theme('gradient.electric'),
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        
        // Background gradients
        '.gradient-bg-primary': {
          background: theme('gradient.primary'),
        },
        '.gradient-bg-accent': {
          background: theme('gradient.accent'),
        },
        '.gradient-bg-electric': {
          background: theme('gradient.electric'),
        },
        '.gradient-bg-tech': {
          background: theme('gradient.tech'),
        },
        '.gradient-bg-dark': {
          background: theme('gradient.dark'),
        },
        '.gradient-bg-glass': {
          background: theme('gradient.glass'),
          backdropFilter: 'blur(10px)',
        },
        '.gradient-bg-glass-dark': {
          background: theme('gradient.glass-dark'),
          backdropFilter: 'blur(10px)',
        },
        
        // Gradient borders
        '.border-gradient-primary': {
          border: '2px solid transparent',
          background: `linear-gradient(${theme('colors.neutral.50')}, ${theme('colors.neutral.50')}) padding-box, ${theme('gradient.primary')} border-box`,
        },
        '.border-gradient-accent': {
          border: '2px solid transparent',
          background: `linear-gradient(${theme('colors.neutral.50')}, ${theme('colors.neutral.50')}) padding-box, ${theme('gradient.accent')} border-box`,
        },
        '.border-gradient-electric': {
          border: '2px solid transparent',
          background: `linear-gradient(${theme('colors.neutral.50')}, ${theme('colors.neutral.50')}) padding-box, ${theme('gradient.electric')} border-box`,
        },
      }
      
      // 🎯 GLASSMORPHISM
      const glassUtilities = {
        '.glass': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        },
        '.glass-dark': {
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        },
        '.glass-primary': {
          background: 'rgba(86, 83, 225, 0.1)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(86, 83, 225, 0.2)',
          boxShadow: '0 8px 32px rgba(86, 83, 225, 0.1)',
        },
        '.glass-accent': {
          background: 'rgba(250, 204, 21, 0.1)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(250, 204, 21, 0.2)',
          boxShadow: '0 8px 32px rgba(250, 204, 21, 0.1)',
        },
      }
      
      // 🎯 SHADOWS & GLOWS
      const shadowUtilities = {
        '.shadow-float': {
          boxShadow: theme('boxShadow.float'),
        },
        '.shadow-float-accent': {
          boxShadow: theme('boxShadow.float-accent'),
        },
        '.shadow-glow-primary': {
          boxShadow: theme('boxShadow.glow-primary'),
        },
        '.shadow-glow-accent': {
          boxShadow: theme('boxShadow.glow-accent'),
        },
        '.shadow-neon': {
          boxShadow: theme('boxShadow.neon'),
        },
        '.shadow-neon-accent': {
          boxShadow: theme('boxShadow.neon-accent'),
        },
        '.shadow-depth': {
          boxShadow: theme('boxShadow.depth'),
        },
      }
      
      // 🎯 TEXTE TECH
      const textUtilities = {
        '.text-code': {
          fontFamily: theme('fontFamily.code'),
          backgroundColor: theme('colors.neutral.900'),
          color: theme('colors.neutral.200'),
          padding: '0.25rem 0.5rem',
          borderRadius: theme('borderRadius.tech'),
          fontSize: '0.875rem',
          border: `1px solid ${theme('colors.neutral.700')}`,
        },
        '.text-terminal': {
          fontFamily: theme('fontFamily.mono'),
          backgroundColor: '#1a1a1a',
          color: '#00ff00',
          padding: '1rem',
          borderRadius: theme('borderRadius.tech'),
          border: `2px solid ${theme('colors.neutral.700')}`,
          position: 'relative',
          overflow: 'hidden',
        },
        '.text-terminal::before': {
          content: '""',
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          height: '2px',
          background: theme('gradient.primary'),
        },
      }
      
      // 🎯 COMPOSANTS DEVOPS
      const devopsComponents = {
        // Carte DevOps Premium
        '.devops-card': {
          background: `linear-gradient(145deg, ${theme('colors.neutral.50')} 0%, ${theme('colors.white')} 100%)`,
          border: `1px solid ${theme('colors.neutral.200')}`,
          borderRadius: theme('borderRadius.card'),
          boxShadow: theme('boxShadow.medium'),
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
        },
        '.devops-card::before': {
          content: '""',
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          height: '4px',
          background: theme('gradient.primary'),
        },
        '.devops-card:hover': {
          transform: 'translateY(-8px)',
          boxShadow: theme('boxShadow.hard'),
          borderColor: theme('colors.primary.300'),
        },
        
        // Carte Tech (Dark Mode)
        '.tech-card': {
          background: `linear-gradient(145deg, ${theme('colors.neutral.800')} 0%, ${theme('colors.neutral.900')} 100%)`,
          border: `1px solid ${theme('colors.neutral.700')}`,
          borderRadius: theme('borderRadius.card'),
          boxShadow: theme('boxShadow.hard'),
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
        },
        '.tech-card::before': {
          content: '""',
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          height: '4px',
          background: theme('gradient.tech'),
        },
        '.tech-card:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 25px 50px -12px rgba(13, 183, 237, 0.25)',
        },
        
        // Badge DevOps
        '.devops-badge': {
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0.375rem 0.875rem',
          borderRadius: theme('borderRadius.chip'),
          fontSize: '0.75rem',
          fontWeight: '600',
          transition: 'all 0.2s ease',
          border: '1px solid transparent',
        },
        '.devops-badge-primary': {
          background: theme('gradient.primary'),
          color: 'white',
          borderColor: theme('colors.primary.600'),
        },
        '.devops-badge-accent': {
          background: theme('gradient.accent'),
          color: theme('colors.neutral.900'),
          borderColor: theme('colors.accent.600'),
        },
        '.devops-badge-tech': {
          background: theme('gradient.tech'),
          color: 'white',
          borderColor: theme('colors.tech.docker'),
        },
        
        // Badge Statut
        '.status-badge': {
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '500',
          gap: '0.375rem',
        },
        '.status-badge::before': {
          content: '""',
          width: '0.5rem',
          height: '0.5rem',
          borderRadius: '50%',
          display: 'inline-block',
        },
        '.status-badge-success': {
          backgroundColor: theme('colors.status.success') + '20',
          color: theme('colors.status.success'),
          border: `1px solid ${theme('colors.status.success')}30`,
        },
        '.status-badge-success::before': {
          backgroundColor: theme('colors.status.success'),
        },
        '.status-badge-warning': {
          backgroundColor: theme('colors.status.warning') + '20',
          color: theme('colors.status.warning'),
          border: `1px solid ${theme('colors.status.warning')}30`,
        },
        '.status-badge-warning::before': {
          backgroundColor: theme('colors.status.warning'),
        },
        '.status-badge-error': {
          backgroundColor: theme('colors.status.error') + '20',
          color: theme('colors.status.error'),
          border: `1px solid ${theme('colors.status.error')}30`,
        },
        '.status-badge-error::before': {
          backgroundColor: theme('colors.status.error'),
        },
        '.status-badge-info': {
          backgroundColor: theme('colors.status.info') + '20',
          color: theme('colors.status.info'),
          border: `1px solid ${theme('colors.status.info')}30`,
        },
        '.status-badge-info::before': {
          backgroundColor: theme('colors.status.info'),
        },
        
        // Bouton DevOps Premium
        '.btn-devops': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '600',
          padding: '0.75rem 1.75rem',
          borderRadius: theme('borderRadius.button'),
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          gap: '0.5rem',
        },
        '.btn-devops::before': {
          content: '""',
          position: 'absolute',
          top: '0',
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
          transition: 'left 0.7s ease',
        },
        '.btn-devops:hover::before': {
          left: '100%',
        },
        '.btn-devops-primary': {
          background: theme('gradient.primary'),
          color: 'white',
          boxShadow: theme('boxShadow.glow-primary'),
        },
        '.btn-devops-primary:hover': {
          transform: 'translateY(-3px)',
          boxShadow: theme('boxShadow.neon'),
        },
        '.btn-devops-accent': {
          background: theme('gradient.accent'),
          color: theme('colors.neutral.900'),
          boxShadow: theme('boxShadow.glow-accent'),
        },
        '.btn-devops-accent:hover': {
          transform: 'translateY(-3px)',
          boxShadow: theme('boxShadow.neon-accent'),
        },
        '.btn-devops-tech': {
          background: theme('gradient.tech'),
          color: 'white',
          boxShadow: theme('boxShadow.glow-tech'),
        },
        '.btn-devops-tech:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 0 30px rgba(13, 183, 237, 0.6)',
        },
        '.btn-devops-outline': {
          background: 'transparent',
          color: theme('colors.primary.600'),
          border: `2px solid ${theme('colors.primary.500')}`,
        },
        '.btn-devops-outline:hover': {
          background: theme('colors.primary.500'),
          color: 'white',
          transform: 'translateY(-2px)',
        },
        
        // Loading DevOps
        '.devops-loading': {
          display: 'inline-block',
          width: '2rem',
          height: '2rem',
          border: '3px solid rgba(86, 83, 225, 0.1)',
          borderTopColor: theme('colors.primary.500'),
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        },
        '.devops-loading-accent': {
          borderTopColor: theme('colors.accent.400'),
        },
        '.devops-loading-tech': {
          borderTopColor: theme('colors.tech.docker'),
        },
        
        // Barre de progression
        '.devops-progress': {
          height: '0.75rem',
          backgroundColor: theme('colors.neutral.200'),
          borderRadius: '9999px',
          overflow: 'hidden',
          position: 'relative',
        },
        '.devops-progress-bar': {
          height: '100%',
          background: theme('gradient.primary'),
          borderRadius: '9999px',
          position: 'relative',
          transition: 'width 0.6s ease',
        },
        '.devops-progress-bar::after': {
          content: '""',
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
          animation: 'shimmer 2s infinite',
        },
        
        // Container Docker Style
        '.docker-container': {
          background: theme('colors.neutral.50'),
          border: `2px dashed ${theme('colors.neutral.300')}`,
          borderRadius: theme('borderRadius.tech'),
          padding: '1.5rem',
          transition: 'all 0.3s ease',
        },
        '.docker-container:hover': {
          borderColor: theme('colors.tech.docker'),
          backgroundColor: 'rgba(13, 183, 237, 0.05)',
        },
        
        // Terminal Window
        '.terminal-window': {
          background: '#1a1a1a',
          borderRadius: theme('borderRadius.tech'),
          overflow: 'hidden',
          border: `1px solid ${theme('colors.neutral.700')}`,
        },
        '.terminal-header': {
          background: theme('colors.neutral.800'),
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          borderBottom: `1px solid ${theme('colors.neutral.700')}`,
        },
        '.terminal-button': {
          width: '0.75rem',
          height: '0.75rem',
          borderRadius: '50%',
        },
        '.terminal-button-close': {
          backgroundColor: '#ff5f56',
        },
        '.terminal-button-minimize': {
          backgroundColor: '#ffbd2e',
        },
        '.terminal-button-maximize': {
          backgroundColor: '#27c93f',
        },
        '.terminal-content': {
          padding: '1rem',
          fontFamily: theme('fontFamily.mono'),
          color: '#00ff00',
          fontSize: '0.875rem',
          lineHeight: '1.5',
          minHeight: '200px',
        },
        
        // Grid de Services
        '.services-grid': {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
        },
        
        // Avatar DevOps
        '.devops-avatar': {
          width: '3rem',
          height: '3rem',
          borderRadius: '50%',
          background: theme('gradient.primary'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: '600',
          fontSize: '1.25rem',
          border: `2px solid ${theme('colors.neutral.200')}`,
        },
        
        // Chip de Technologie
        '.tech-chip': {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.375rem 0.875rem',
          backgroundColor: theme('colors.neutral.100'),
          borderRadius: theme('borderRadius.chip'),
          fontSize: '0.875rem',
          fontWeight: '500',
          transition: 'all 0.2s ease',
          border: `1px solid ${theme('colors.neutral.200')}`,
        },
        '.tech-chip:hover': {
          backgroundColor: theme('colors.neutral.200'),
          transform: 'translateY(-2px)',
        },
        '.tech-chip-icon': {
          width: '1.25rem',
          height: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        
        // Alert DevOps
        '.devops-alert': {
          padding: '1rem 1.25rem',
          borderRadius: theme('borderRadius.tech'),
          borderLeft: '4px solid',
          backgroundColor: theme('colors.neutral.50'),
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
        },
        '.devops-alert-success': {
          borderLeftColor: theme('colors.status.success'),
          backgroundColor: theme('colors.status.success') + '10',
        },
        '.devops-alert-warning': {
          borderLeftColor: theme('colors.status.warning'),
          backgroundColor: theme('colors.status.warning') + '10',
        },
        '.devops-alert-error': {
          borderLeftColor: theme('colors.status.error'),
          backgroundColor: theme('colors.status.error') + '10',
        },
        '.devops-alert-info': {
          borderLeftColor: theme('colors.status.info'),
          backgroundColor: theme('colors.status.info') + '10',
        },
        
        // Table DevOps
        '.devops-table': {
          width: '100%',
          borderCollapse: 'separate',
          borderSpacing: '0',
          borderRadius: theme('borderRadius.tech'),
          overflow: 'hidden',
          border: `1px solid ${theme('colors.neutral.200')}`,
        },
        '.devops-table th': {
          backgroundColor: theme('colors.neutral.50'),
          padding: '1rem',
          textAlign: 'left',
          fontWeight: '600',
          color: theme('colors.neutral.700'),
          borderBottom: `1px solid ${theme('colors.neutral.200')}`,
        },
        '.devops-table td': {
          padding: '1rem',
          borderBottom: `1px solid ${theme('colors.neutral.100')}`,
        },
        '.devops-table tr:hover': {
          backgroundColor: theme('colors.neutral.50'),
        },
        '.devops-table tr:last-child td': {
          borderBottom: 'none',
        },
        
        // Dashboard Widget
        '.dashboard-widget': {
          background: theme('colors.neutral.50'),
          border: `1px solid ${theme('colors.neutral.200')}`,
          borderRadius: theme('borderRadius.card'),
          padding: '1.5rem',
          transition: 'all 0.3s ease',
          position: 'relative',
        },
        '.dashboard-widget:hover': {
          borderColor: theme('colors.primary.300'),
          boxShadow: theme('boxShadow.medium'),
        },
        '.dashboard-widget-header': {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        },
        '.dashboard-widget-title': {
          fontSize: '1.125rem',
          fontWeight: '600',
          color: theme('colors.neutral.800'),
        },
        '.dashboard-widget-value': {
          fontSize: '2rem',
          fontWeight: '700',
          background: theme('gradient.primary'),
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },
        
        // Network Node
        '.network-node': {
          width: '4rem',
          height: '4rem',
          borderRadius: '50%',
          background: theme('gradient.primary'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: '600',
          position: 'relative',
          boxShadow: theme('boxShadow.glow-primary'),
          animation: 'pulse-slow 3s infinite',
        },
        '.network-node::after': {
          content: '""',
          position: 'absolute',
          width: '5rem',
          height: '5rem',
          borderRadius: '50%',
          border: `2px solid ${theme('colors.primary.300')}`,
          opacity: '0.3',
          animation: 'containerScale 2s ease-in-out infinite',
        },
        
        // Pipeline Stage
        '.pipeline-stage': {
          padding: '1rem',
          background: theme('colors.neutral.50'),
          border: `2px solid ${theme('colors.neutral.200')}`,
          borderRadius: theme('borderRadius.tech'),
          position: 'relative',
          transition: 'all 0.3s ease',
        },
        '.pipeline-stage::before': {
          content: '""',
          position: 'absolute',
          top: '50%',
          right: '-1rem',
          transform: 'translateY(-50%)',
          width: '0',
          height: '0',
          borderTop: '0.75rem solid transparent',
          borderBottom: '0.75rem solid transparent',
          borderLeft: `0.75rem solid ${theme('colors.neutral.200')}`,
        },
        '.pipeline-stage:last-child::before': {
          display: 'none',
        },
        '.pipeline-stage:hover': {
          borderColor: theme('colors.primary.400'),
          transform: 'translateY(-2px)',
        },
        '.pipeline-stage-success': {
          borderLeftColor: theme('colors.status.success'),
          borderLeftWidth: '4px',
        },
        '.pipeline-stage-failed': {
          borderLeftColor: theme('colors.status.error'),
          borderLeftWidth: '4px',
        },
        '.pipeline-stage-running': {
          borderLeftColor: theme('colors.status.info'),
          borderLeftWidth: '4px',
          animation: 'pulse-fast 1.5s infinite',
        },
      }
      
      // Fusionner tous les utilitaires
      addUtilities(gradientUtilities)
      addUtilities(glassUtilities)
      addUtilities(shadowUtilities)
      addUtilities(textUtilities)
      addComponents(devopsComponents)
      
      // 🎯 UTILITAIRES ANIMATION
      addUtilities({
        '.animate-float': {
          animation: 'float 6s ease-in-out infinite',
        },
        '.animate-glow': {
          animation: 'glow 2s ease-in-out infinite alternate',
        },
        '.animate-shimmer': {
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite linear',
        },
        '.animate-terminal-blink': {
          animation: 'terminalBlink 1s step-end infinite',
        },
        '.animate-deploy-progress': {
          animation: 'deployProgress 2s ease-in-out infinite',
        },
      })
      
      // 🎯 UTILITAIRES SPÉCIAUX
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
        '.scrollbar-hide::-webkit-scrollbar': {
          display: 'none',
        },
        '.text-balance': {
          textWrap: 'balance',
        },
        '.perspective-1000': {
          perspective: '1000px',
        },
        '.backface-hidden': {
          backfaceVisibility: 'hidden',
        },
        '.transform-3d': {
          transformStyle: 'preserve-3d',
        },
        '.filter-grayscale': {
          filter: 'grayscale(100%)',
        },
        '.filter-grayscale-0': {
          filter: 'grayscale(0%)',
        },
      })
    }
  ],
}