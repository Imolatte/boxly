/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        boxly: {
          bg: '#FAF7F2',
          peach: '#E8B4A0',
          mint: '#A8C5B8',
          text: '#2A2620',
          border: '#E5DFD6',
        },
        tg: {
          bg: 'var(--tg-bg, #FAF7F2)',
          text: 'var(--tg-text, #2A2620)',
          hint: 'var(--tg-hint, #9E9589)',
          link: 'var(--tg-link, #E8B4A0)',
          button: 'var(--tg-button, #E8B4A0)',
          'button-text': 'var(--tg-button-text, #FFFFFF)',
          'secondary-bg': 'var(--tg-secondary-bg, #F0EBE3)',
        },
      },
    },
  },
  plugins: [],
};
