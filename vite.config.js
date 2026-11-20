import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const page = p => fileURLToPath(new URL(p, import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      // Многостраничная сборка: главная и раздел чек-листов
      input: {
        main: page('./index.html'),
        checklists: page('./checklists/index.html'),
      },
    },
  },
})
