// astro.config.mjs
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Configuración para GitHub Pages
  // Cambia 'itinerary-app' por el nombre de tu repositorio
  base: process.env.NODE_ENV === 'production' ? '/itinerary-app' : '',
  site: 'https://jdgaitanf.github.io',
  
  // Salida estática para GitHub Pages
  output: 'static',
  
  // Configuración del servidor de desarrollo
  server: {
    port: 3000,
    host: true,
  },
  
  // Optimizaciones
  build: {
    // Assets en la raíz para compatibilidad con GitHub Pages
    assets: 'assets',
    // Minificar CSS y JS
    minify: true,
  },
  
  // Vite configuraciones adicionales
  vite: {
    build: {
      // Mejorar rendimiento en móviles
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
  },
});