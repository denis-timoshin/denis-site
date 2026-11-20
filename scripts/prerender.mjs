// Пре-рендер страницы чек-листов: вставляет готовую HTML-разметку и JSON-LD
// в dist/checklists/index.html, чтобы поисковики и нейросети видели контент без JavaScript.
// Запускается после `vite build` и `vite build --ssr` (см. "build" в package.json).
import { readFile, writeFile, rm } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const htmlPath = path.join(root, 'dist/checklists/index.html')
const ssrDir = path.join(root, 'dist-ssr')

const { render, jsonLd } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href)

let html = await readFile(htmlPath, 'utf8')
const fill = (marker, value) => {
  if (!html.includes(marker)) throw new Error(`В dist/checklists/index.html нет метки ${marker}`)
  html = html.replace(marker, () => value)
}
fill('<!--app-html-->', render())
fill('<!--json-ld-->', `<script type="application/ld+json">${jsonLd()}</script>`)

await writeFile(htmlPath, html)
await rm(ssrDir, { recursive: true, force: true })
console.log('prerender: dist/checklists/index.html готов')
