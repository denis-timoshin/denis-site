// Пре-рендер главной и раздела чек-листов: вставляет готовую HTML-разметку и теги <head>
// в собранные страницы, чтобы поисковики и нейросети видели контент без JavaScript.
// Запускается после `vite build` и `vite build --ssr` (см. "build" в package.json).
import { readFile, writeFile, rm } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const ssrDir = path.join(root, 'dist-ssr')
const { pages, countMismatches, sitemapEntries } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href)

const mismatches = countMismatches()
if (mismatches.length) {
  throw new Error(`Число проверок на разводящей устарело — выполните npm run sync-counts:\n${mismatches.join('\n')}`)
}

for (const page of pages()) {
  const file = path.join(root, 'dist', page.file)
  let html = await readFile(file, 'utf8')
  const fills = [['<!--app-html-->', page.html]]
  if (page.head) fills.push(['<!--head-->', page.head])
  for (const [marker, value] of fills) {
    if (!html.includes(marker)) throw new Error(`В dist/${page.file} нет метки ${marker}`)
    html = html.replace(marker, () => value)
  }
  await writeFile(file, html)
  console.log(`prerender: dist/${page.file}`)
}

// sitemap.xml: к главной из public/ дописываем раздел чек-листов
const sitemapFile = path.join(root, 'dist', 'sitemap.xml')
const urls = sitemapEntries().map(e => `  <url>
    <loc>https://denis-timoshin.ru${e.path}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <priority>${e.priority}</priority>
  </url>`).join('\n')
let sitemap = await readFile(sitemapFile, 'utf8')
if (!sitemap.includes('</urlset>')) throw new Error('В public/sitemap.xml нет </urlset>')
sitemap = sitemap.replace('</urlset>', () => `${urls}\n</urlset>`)
await writeFile(sitemapFile, sitemap)
console.log(`prerender: sitemap.xml — ${sitemapEntries().length} адресов (чек-листы и политика)`)

await rm(ssrDir, { recursive: true, force: true })
