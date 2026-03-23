import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg:         '#0d0f0e',
        bg2:        '#141815',
        surface:    '#1c211d',
        sage:       '#7fa882',
        'sage-light':'#a8c5aa',
        'sage-dark': '#4a6b4c',
        sand:       '#c8b89a',
        'sand-light':'#e0d4c0',
        cream:      '#f5f0e8',
        mist:       '#8fb5c4',
        gold:       '#c9a96e',
        text:       '#e8ede9',
        muted:      '#7a8b7c',
        dim:        '#3d4a3e',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body:    ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      transitionTimingFunction: {
        breath:  'cubic-bezier(0.16, 1, 0.3, 1)',
        bloom:   'cubic-bezier(0.34, 1.1, 0.64, 1)',
        release: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '900': '900ms',
        '1400':'1400ms',
      },
      borderRadius: {
        'xl2': '20px',
        'xl3': '24px',
        'xl4': '32px',
      },
    },
  },
  plugins: [],
}
export default config
