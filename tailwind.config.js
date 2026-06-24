/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        canvas: '#070a12',
        panel: '#0d1320',
        'panel-2': '#111a2b',
        line: '#1d2740',
        'line-soft': '#161f33',
        ink: '#e7ecf6',
        'ink-dim': '#8b97b3',
        'ink-faint': '#5b6784',
      },
    },
  },
  plugins: [],
};
