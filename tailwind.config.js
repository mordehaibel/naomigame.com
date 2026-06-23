/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B9D',
        secondary: '#4ECDC4',
        'accent-yellow': '#FFD93D',
        'accent-purple': '#9B59B6',
        'accent-orange': '#FF8C42',
        'bg-start': '#FFE5F1',
        'bg-end': '#E5F4FF',
        'success-green': '#48BB78',
        'error-red': '#F56565',
        'text-primary': '#2D3748',
        'text-light': '#FFFFFF',
      },
      fontFamily: {
        sans: ['Rubik', 'Heebo', 'system-ui', 'sans-serif'],
        display: ['Heebo', 'Rubik', 'system-ui', 'sans-serif'],
      },
      animation: {
        'breathe': 'breathe 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 107, 157, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 107, 157, 0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      backgroundImage: {
        'gradient-fun': 'linear-gradient(135deg, #FFE5F1 0%, #E5F4FF 100%)',
        'gradient-button': 'linear-gradient(135deg, #FF6B9D 0%, #9B59B6 100%)',
        'gradient-success': 'linear-gradient(135deg, #4ECDC4 0%, #48BB78 100%)',
      },
    },
  },
  plugins: [],
};
