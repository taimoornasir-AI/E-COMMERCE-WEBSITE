/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base
        base: {
          DEFAULT: '#0f0f0f',
          surface: '#1a1a1a',
          elevated: '#242424',
          border: '#2a2a2a',
          hover: '#333333',
        },
        // Text
        text: {
          DEFAULT: '#f5f0e8',
          muted: '#a8a29e',
          subtle: '#78716c',
          inverse: '#0f0f0f',
        },
        // Accent - Amber Gold
        accent: {
          DEFAULT: '#d4a853',
          light: '#e8c47a',
          dark: '#b8892e',
          muted: 'rgba(212, 168, 83, 0.15)',
        },
        // Status
        success: '#22c55e',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-2xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-xl': ['3.75rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-lg': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'display-sm': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        'sm': '0.25rem',
        DEFAULT: '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'glow-accent': '0 0 30px rgba(212, 168, 83, 0.15)',
        'glow-sm': '0 0 15px rgba(212, 168, 83, 0.1)',
        'elevation-1': '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.6)',
        'elevation-2': '0 4px 6px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.5)',
        'elevation-3': '0 10px 25px rgba(0,0,0,0.5), 0 5px 10px rgba(0,0,0,0.4)',
        'elevation-4': '0 25px 50px rgba(0,0,0,0.6)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-up': 'fadeUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-subtle': 'pulseSubtle 2s infinite',
        'grain': 'grain 0.5s steps(1) infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-1%, -2%)' },
          '20%': { transform: 'translate(2%, 1%)' },
          '30%': { transform: 'translate(-2%, 2%)' },
          '40%': { transform: 'translate(1%, -1%)' },
          '50%': { transform: 'translate(-1%, 2%)' },
          '60%': { transform: 'translate(2%, -2%)' },
          '70%': { transform: 'translate(-2%, 1%)' },
          '80%': { transform: 'translate(1%, 2%)' },
          '90%': { transform: 'translate(-1%, -1%)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [],
}
