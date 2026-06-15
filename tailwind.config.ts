import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        red: {
          DEFAULT: '#D62828',
          dark: '#A81E1E',
          light: '#FDECEA',
        },
        yellow: {
          DEFAULT: '#FFC300',
          dark: '#C49500',
          light: '#FFF8D6',
        },
        dark: '#111111',
        mid: '#444444',
        muted: '#888888',
        border: '#E5E5E0',
        surface: '#F7F6F2',
        white: '#FFFFFF',
        green: {
          DEFAULT: '#1A6B3C',
          light: '#D4EDDA',
        },
        blue: {
          DEFAULT: '#1A4B8C',
          light: '#D6E4F7',
        },
        purple: {
          DEFAULT: '#4A2080',
          light: '#EAE0F7',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
