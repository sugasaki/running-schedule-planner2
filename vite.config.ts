import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  server: {
    port: 3000,
  },
  base: command === 'build' ? '/running-schedule-planner2/' : '/',
}))
