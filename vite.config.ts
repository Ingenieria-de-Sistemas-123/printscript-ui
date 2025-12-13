import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    define: {
      'process.env.FRONTEND_URL': JSON.stringify(env.FRONTEND_URL),
      'process.env.BACKEND_URL': JSON.stringify(env.BACKEND_URL),
    },

    plugins: [react()],

    server: {
      port: 5173,

      proxy: {
        "/api": {
          target: "http://localhost:8083",
          changeOrigin: true,
          secure: false,

        }
      }
    }
  }
})
