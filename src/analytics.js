// Яндекс Метрика. Загружается только после согласия на cookie (плашка в подвале).
// Код и параметры — из настроек счётчика в metrika.yandex.ru. <noscript>-пиксель не ставим:
// без JavaScript посетитель не может дать согласие, значит и считать его нельзя.
import { getConsent, onConsentChange } from './consent'

export const METRIKA_ID = 114415835

let loaded = false

function loadMetrika() {
  if (loaded || !METRIKA_ID) return
  loaded = true
  const src = `https://mc.yandex.ru/metrika/tag.js?id=${METRIKA_ID}`
  window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments) }
  window.ym.l = Date.now()
  if (![...document.scripts].some(s => s.src === src)) {
    const s = document.createElement('script')
    s.async = true
    s.src = src
    document.head.appendChild(s)
  }
  window.ym(METRIKA_ID, 'init', {
    ssr: true,
    webvisor: true,
    clickmap: true,
    ecommerce: 'dataLayer',
    referrer: document.referrer,
    url: location.href,
    accurateTrackBounce: true,
    trackLinks: true,
  })
}

// Вызывается один раз на странице: грузит Метрику сейчас или после согласия
export function initAnalytics() {
  if (getConsent() === 'accepted') loadMetrika()
  return onConsentChange(value => { if (value === 'accepted') loadMetrika() })
}

// Цели Метрики (JavaScript-события). Создайте их в настройках счётчика с такими же идентификаторами.
export const GOALS = {
  copyTable: 'checklist_copy_table',   // «Копировать таблицей» на странице чек-листа
  downloadCsv: 'checklist_csv',        // «CSV»
  copyExample: 'checklist_copy_example', // копирование примера тестовых данных
  courseClick: 'course_click',         // переход на курс из раздела чек-листов
}

// Отправить цель; без согласия или без счётчика — ничего не делает
export function reachGoal(name, params) {
  if (loaded && window.ym) window.ym(METRIKA_ID, 'reachGoal', name, params)
}
