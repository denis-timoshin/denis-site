import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const page = p => fileURLToPath(new URL(p, import.meta.url))

// Детальные страницы чек-листов: каждая папка checklists/<slug>/ с index.html
const checklistPages = Object.fromEntries(
  readdirSync(page('./checklists'), { withFileTypes: true })
    .filter(d => d.isDirectory() && existsSync(page(`./checklists/${d.name}/index.html`)))
    .map(d => [`checklist-${d.name}`, page(`./checklists/${d.name}/index.html`)])
)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      // Многостраничная сборка: главная, разводящая чек-листов и детальные чек-листы
      input: {
        main: page('./index.html'),
        checklists: page('./checklists/index.html'),
        ...checklistPages,
      },
    },
  },
})
