/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'glitch': 'glitch 0.3s ease-in-out',
        'typing': 'typing 3.5s steps(40, end)',
        'flicker': 'flicker 2s ease-in-out infinite',
        'orbit': 'orbit 15s linear infinite',
        'blink': 'blink 1.5s infinite',
        'glow': 'glow 2s infinite',
        'scroll-text': 'scroll-text 20s linear infinite',
        'spin-3d': 'spin-3d 8s linear infinite',
        'scroll-binary': 'scroll-binary 20s linear infinite',
        'fade-in': 'fadeIn 1s ease-out forwards',
        'gradient-shift': 'gradientShift 15s ease infinite',
        'scanning-line': 'scanning-line 2s ease-in-out infinite',
        'pulse-border': 'pulse-border 2s infinite',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
        typing: {
          from: { width: '0' },
          to: { width: '100%' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        orbit: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(100px, 50px) rotate(360deg)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(96, 165, 250, 0.5)' },
          '50%': { boxShadow: '0 0 15px rgba(96, 165, 250, 0.7)' },
        },
        'scroll-text': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'spin-3d': {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
        'scroll-binary': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(-100%)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'scanning-line': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-border': {
          '0%, 100%': { borderColor: 'rgba(96, 165, 250, 0.5)' },
          '50%': { borderColor: 'rgba(96, 165, 250, 0.9)' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};