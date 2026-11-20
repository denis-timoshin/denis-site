// Реестр готовых чек-листов: slug → содержимое.
// Новый чек-лист: файл в этой папке + строка здесь + checklists/<slug>/index.html.
import forma from './forma.js'
import modalnayaForma from './modalnaya-forma.js'

export const CONTENT = {
  forma,
  'modalnaya-forma': modalnayaForma,
}

export const countChecks = c => c.sections.reduce((s, sec) => s + sec.items.length, 0)
