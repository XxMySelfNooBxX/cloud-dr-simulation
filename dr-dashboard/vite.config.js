import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080, 
    strictPort: false, // Vite will now try 8080, then 8081, 8082, etc., until it finds an open one!
  }
})