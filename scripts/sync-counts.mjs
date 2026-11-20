// Обновляет число проверок (n) у карточек в src/checklists/data.js по содержимому чек-листов.
// Разводящая берёт числа из data.js, чтобы не грузить в браузер все чек-листы.
// Запуск: npm run sync-counts. Сборка падает, если числа разошлись (см. prerender.mjs).
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { CONTENT, countChecks } from '../src/checklists/content/index.js'

const file = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/checklists/data.js')
let src = await readFile(file, 'utf8')
let changed = 0
for (const [slug, content] of Object.entries(CONTENT)) {
  const re = new RegExp(`(slug:"${slug}"[^\\n]*?\\bn:)(\\d+)`)
  if (!re.test(src)) throw new Error(`Нет карточки ${slug} в data.js`)
  src = src.replace(re, (m, head, n) => {
    const next = countChecks(content)
    if (Number(n) !== next) changed++
    return head + next
  })
}
await writeFile(file, src)
console.log(`sync-counts: обновлено карточек — ${changed}`)
