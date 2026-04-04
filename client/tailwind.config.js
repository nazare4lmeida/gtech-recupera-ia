/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy:    '#1E3A5F',
        blue:    '#2E6DA4',
        sky:     '#A8C5E0',
        slate:   '#2F4F4F',
        surface: '#FFFFFF',
        border:  '#D0DFF0',
        muted:   '#6B8299',
        green:   '#2D7A4A',
        'green-bg': '#E6F4EE',
        red:     '#B03030',
        'red-bg':   '#FDEAEA',
        gold:    '#B8820A',
        'gold-bg':  '#FEF5E0',
      },
      fontFamily: {
        mono:    ['"Space Mono"', 'monospace'],
        sans:    ['"DM Sans"', 'sans-serif'],
        display: ['"DM Sans"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(30,58,95,.10)',
        'card-lg': '0 12px 48px rgba(30,58,95,.16)',
      },
      borderRadius: {
        card: '16px',
      },
      animation: {
        'fade-up':  'fadeUp .38s ease both',
        'scale-in': 'scaleIn .32s ease both',
        'shake':    'shake .4s ease',
        'reveal':   'reveal .3s ease both',
        'pulse-bar':'pulseBar .6s ease',
        'spin-slow':'spin .6s linear infinite',
      },
      keyframes: {
        fadeUp:   { from:{ opacity:'0', transform:'translateY(20px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        scaleIn:  { from:{ opacity:'0', transform:'scale(.92)' },       to:{ opacity:'1', transform:'scale(1)' } },
        shake:    { '0%,100%':{ transform:'translateX(0)' }, '20%':{ transform:'translateX(-7px)' }, '40%':{ transform:'translateX(7px)' }, '60%':{ transform:'translateX(-4px)' }, '80%':{ transform:'translateX(4px)' } },
        reveal:   { from:{ opacity:'0', transform:'translateY(10px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        pulseBar: { '0%':{ boxShadow:'0 0 0 0 rgba(46,109,164,.5)' }, '70%':{ boxShadow:'0 0 0 8px rgba(46,109,164,0)' }, '100%':{ boxShadow:'0 0 0 0 rgba(46,109,164,0)' } },
      },
    },
  },
  plugins: [],
}
