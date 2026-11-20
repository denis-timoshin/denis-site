// Вход для пре-рендера: собирается отдельно (vite build --ssr) и вызывается из scripts/prerender.mjs
import React from 'react'
import { renderToString } from 'react-dom/server'
import ChecklistsPage, { checklistsJsonLd } from './ChecklistsPage.jsx'

export function render() {
  return renderToString(
    <React.StrictMode>
      <ChecklistsPage />
    </React.StrictMode>
  )
}

export function jsonLd() {
  return JSON.stringify(checklistsJsonLd()).replace(/</g, '\\u003c')
}
