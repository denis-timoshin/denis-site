// Согласие на cookie и аналитику. Хранится в браузере посетителя (localStorage).
// Значения: 'accepted' | 'declined' | null (ещё не выбрал).

const KEY = 'cookie-consent'
const EVENT = 'cookie-consent-change'

export function getConsent() {
  try {
    return JSON.parse(localStorage.getItem(KEY))?.value ?? null
  } catch {
    return null
  }
}

export function setConsent(value) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ value, date: new Date().toISOString() }))
  } catch { /* приватный режим — решение действует до перезагрузки */ }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: value }))
}

// Сбросить выбор — плашка покажется снова (ссылка «Настройки cookie» на странице политики)
export function resetConsent() {
  try { localStorage.removeItem(KEY) } catch { /* ничего */ }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: null }))
}

export function onConsentChange(cb) {
  const handler = e => cb(e.detail)
  window.addEventListener(EVENT, handler)
  return () => window.removeEventListener(EVENT, handler)
}
