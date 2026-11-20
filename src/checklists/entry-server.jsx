// Вход для пре-рендера: собирается отдельно (vite build --ssr) и вызывается из scripts/prerender.mjs
import React from 'react'
import { renderToString } from 'react-dom/server'
import ChecklistsPage, { checklistsJsonLd } from './ChecklistsPage.jsx'
import ChecklistDetail, { detailJsonLd } from './ChecklistDetail.jsx'
import { CONTENT } from './content/index.js'

const ld = data => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`
const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const SITE = 'https://denis-timoshin.ru'

// Список страниц: путь к HTML в dist, разметка и теги для <head>
export function pages() {
  return [
    {
      file: 'checklists/index.html',
      html: renderToString(<React.StrictMode><ChecklistsPage /></React.StrictMode>),
      head: ld(checklistsJsonLd()),
    },
    ...Object.values(CONTENT).map(c => {
      const url = `${SITE}/checklists/${c.slug}/`
      return {
        file: `checklists/${c.slug}/index.html`,
        html: renderToString(<React.StrictMode><ChecklistDetail content={c} /></React.StrictMode>),
        head: [
          `<title>${esc(c.title)} — Денис Тимошин</title>`,
          `<meta name="description" content="${esc(c.description)}" />`,
          `<link rel="canonical" href="${url}" />`,
          `<meta property="og:title" content="${esc(c.title)}" />`,
          `<meta property="og:description" content="${esc(c.description)}" />`,
          `<meta property="og:url" content="${url}" />`,
          ld(detailJsonLd(c)),
        ].join('\n    '),
      }
    }),
  ]
}
