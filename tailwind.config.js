/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2E8B57', // Green color from favicon
        secondary: '#1E90FF', // Blue color from favicon
        'primary-light': '#3ea06a',
        'primary-dark': '#236744',
        'secondary-light': '#4ba3ff',
        'secondary-dark': '#1670c5',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'auth-gradient': 'linear-gradient(135deg, #1E90FF 0%, #2E8B57 100%)',
      },
      boxShadow: {
        input: '0 2px 4px rgba(0, 0, 0, 0.05)',
        card: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        button: '0 4px 6px -1px rgba(46, 139, 87, 0.2), 0 2px 4px -1px rgba(46, 139, 87, 0.1)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
