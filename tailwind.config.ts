import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors from logo
        'primary-purple': '#8B7FD6',
        'ocean-wave-start': '#7DD3E0',
        'ocean-wave-end': '#A8E6F0',
        'deep-navy': '#3D4461',
        'lavender-bg': '#E8E5F2',
        'soft-white': '#FFFFFF',
        'light-gray': '#F5F5F7',
        'warm-accent': '#D4A5A5',
        // Semantic colors
        success: '#52C41A',
        warning: '#FAAD14',
        error: '#F5222D',
        info: '#1890FF',
      },
      fontFamily: {
        heading: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
        accent: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['SF Mono', 'Monaco', 'monospace'],
        montserrat: ['Montserrat', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        playfair: ['Playfair Display', 'serif'],
      },
      fontSize: {
        'display': ['64px', { lineHeight: '72px', fontWeight: '700' }],
        'h1': ['56px', { lineHeight: '64px', fontWeight: '700' }],
        'h2': ['42px', { lineHeight: '52px', fontWeight: '600' }],
        'h3': ['32px', { lineHeight: '40px', fontWeight: '600' }],
        'h4': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'h5': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'h6': ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'body-large': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-small': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'quote': ['24px', { lineHeight: '36px', fontWeight: '400' }],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
        '4xl': '96px',
        '5xl': '128px',
      },
      borderRadius: {
        'pill': '50px',
        'card': '20px',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(139, 127, 214, 0.08)',
        'card-hover': '0 12px 32px rgba(139, 127, 214, 0.15)',
        'button': '0 4px 16px rgba(139, 127, 214, 0.3)',
        'button-hover': '0 8px 24px rgba(139, 127, 214, 0.4)',
        'soft': '0 4px 20px rgba(139, 127, 214, 0.15)',
        'medium': '0 8px 32px rgba(139, 127, 214, 0.2)',
        'strong': '0 16px 48px rgba(139, 127, 214, 0.25)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #8B7FD6 0%, #7DD3E0 100%)',
        'gradient-wave': 'linear-gradient(135deg, #7DD3E0 0%, #A8E6F0 100%)',
        'gradient-dark': 'linear-gradient(135deg, #3D4461 0%, #5A5F7A 100%)',
        'gradient-purple-ocean': 'linear-gradient(135deg, #8B7FD6 0%, #7DD3E0 100%)',
        'gradient-lavender': 'linear-gradient(135deg, #E8E5F2 0%, #F5F5F7 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #7DD3E0 0%, #A8E6F0 100%)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'wave': 'wave 20s linear infinite',
        'wave-pulse': 'wavePulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        wave: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        wavePulse: {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(1.2)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
export default config

