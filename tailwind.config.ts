import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#07090d',
        surface: '#0e131b',
        muted: '#8b95a7',
        primary: '#38bdf8',
        accent: '#22c55e'
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,0.25)'
      }
    }
  },
  plugins: []
}

export default config
