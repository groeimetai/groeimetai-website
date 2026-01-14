import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Nieuwe kleuren palette
        black: {
          DEFAULT: '#000000',
          50: '#141414',
          100: '#0A0A0A',
          200: '#000000',
        },
        orange: {
          DEFAULT: '#FF6600',
          50: '#FFAA66',
          100: '#FF8833',
          200: '#FF6600',
        },
        green: {
          DEFAULT: '#125312',
          50: '#1A5C1A',
          100: '#125312',
          200: '#0A4A0A',
        },
        white: {
          DEFAULT: '#FFFFFF',
          50: '#FFFFFF',
          100: '#FAFAFA',
          200: '#F5F5F5',
        },
        // Legacy brand colors for compatibility
        brand: {
          DEFAULT: '#FF6600',
          50: '#FFAA66',
          100: '#FF8833',
          200: '#FF6600',
          300: '#E55A00',
          400: '#CC5200',
          500: '#B34700',
          600: '#993D00',
          700: '#803300',
          800: '#662900',
          900: '#4D1F00',
        },
        brandAccent: {
          DEFAULT: '#125312',
          50: '#2A7D2A',
          100: '#216621',
          200: '#1A5C1A',
          300: '#125312',
          400: '#0F4A0F',
          500: '#0C400C',
          600: '#0A3A0A',
          700: '#083308',
          800: '#062606',
          900: '#041A04',
        },
        neutral: {
          50: '#FFFFFF',
          100: '#FAFAFA',
          200: '#F5F5F5',
          300: '#E5E5E5',
          400: '#404040',
          500: '#2B2B2B',
          600: '#1F1F1F',
          700: '#141414',
          800: '#0A0A0A',
          900: '#000000',
        },
      },
      fontFamily: {
        sans: ['Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Helvetica Neue', 'Arial', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'pulse-slower': 'pulse-slow 6s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        'agent-move': 'agentMove 4s ease-in-out infinite',
        'memory-pulse': 'memoryPulse 2s ease-in-out infinite',
        'connection-flow': 'connectionFlow 1.5s ease-in-out infinite',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.6' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        agentMove: {
          '0%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(30px, -30px)' },
          '50%': { transform: 'translate(60px, 0)' },
          '75%': { transform: 'translate(30px, 30px)' },
          '100%': { transform: 'translate(0, 0)' },
        },
        memoryPulse: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' },
        },
        connectionFlow: {
          '0%': { opacity: '0', transform: 'scaleX(0)' },
          '50%': { opacity: '1', transform: 'scaleX(1)' },
          '100%': { opacity: '0', transform: 'scaleX(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
