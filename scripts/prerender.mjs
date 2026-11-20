// Пре-рендер раздела чек-листов: вставляет готовую HTML-разметку и теги <head>
// в собранные страницы, чтобы поисковики и нейросети видели контент без JavaScript.
// Запускается после `vite build` и `vite build --ssr` (см. "build" в package.json).
import { readFile, writeFile, rm } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const ssrDir = path.join(root, 'dist-ssr')
const { pages } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href)

for (const page of pages()) {
  const file = path.join(root, 'dist', page.file)
  let html = await readFile(file, 'utf8')
  for (const [marker, value] of [['<!--app-html-->', page.html], ['<!--head-->', page.head]]) {
    if (!html.includes(marker)) throw new Error(`В dist/${page.file} нет метки ${marker}`)
    html = html.replace(marker, () => value)
  }
  await writeFile(file, html)
  console.log(`prerender: dist/${page.file}`)
}

await rm(ssrDir, { recursive: true, force: true })
