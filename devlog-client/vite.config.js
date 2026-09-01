/** Configura el pipeline de desarrollo y build con React y Tailwind CSS. */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import process from 'node:process'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    allowedHosts: ['frontend'],
    proxy: {
      '/api': {
        target: process.env.DEV_API_PROXY_TARGET || 'http://127.0.0.1:5050',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    clearMocks: true,
    include: ['src/**/*.{test,spec}.{js,jsx}'],
  },
})
