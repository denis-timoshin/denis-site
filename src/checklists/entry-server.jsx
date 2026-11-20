// Вход для пре-рендера главной и раздела чек-листов: собирается отдельно (vite build --ssr) и вызывается из scripts/prerender.mjs
import React from 'react'
import { renderToString } from 'react-dom/server'
import ChecklistsPage, { checklistsJsonLd } from './ChecklistsPage.jsx'
import ChecklistDetail, { detailJsonLd } from './ChecklistDetail.jsx'
import { CONTENT, countChecks } from './content/index.js'
import { CHECKLISTS } from './data.js'
import App from '../App.jsx'
import PrivacyPage, { PRIVACY } from '../privacy/PrivacyPage.jsx'

const ld = data => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`
const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const SITE = 'https://denis-timoshin.ru'
const SUFFIX = ' — Денис Тимошин'

// Теги <head> для поисковиков и соцсетей. Картинки — public/og/*.jpg (scripts/gen-og.py)
function seoHead({ title, ogTitle = title, description, path, image, imageAlt, type, modified, jsonLd }) {
  const url = `${SITE}${path}`
  const img = image && `${SITE}/og/${image}`
  // Суффикс с именем — только если title не вылезет за ~65 символов в выдаче
  const fullTitle = (title + SUFFIX).length <= 65 ? title + SUFFIX : title
  return [
    `<title>${esc(fullTitle)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<meta name="author" content="Денис Тимошин" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:title" content="${esc(ogTitle)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    img && `<meta property="og:image" content="${img}" />`,
    img && `<meta property="og:image:width" content="1200" />`,
    img && `<meta property="og:image:height" content="630" />`,
    img && `<meta property="og:image:type" content="image/jpeg" />`,
    img && `<meta property="og:image:alt" content="${esc(imageAlt)}" />`,
    type === 'article' && modified && `<meta property="article:modified_time" content="${modified}" />`,
    type === 'article' && `<meta property="article:author" content="Денис Тимошин" />`,
    `<meta name="twitter:card" content="${img ? 'summary_large_image' : 'summary'}" />`,
    `<meta name="twitter:title" content="${esc(ogTitle)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    img && `<meta name="twitter:image" content="${img}" />`,
    ld(jsonLd),
  ].filter(Boolean).join('\n    ')
}

export const HUB = {
  title: 'Чек-листы для тестировщика по компонентам',
  description: 'Бесплатные чек-листы тестирования веб-компонентов: формы, аккордеон, hero, фильтры, корзина, оплата, API. Готовые проверки от руководителя QA-отдела.',
}

// Список страниц: путь к HTML в dist, разметка и теги для <head>
export function pages() {
  return [
    // Главная: только разметка, теги <head> у неё свои в index.html
    { file: 'index.html', html: renderToString(<React.StrictMode><App /></React.StrictMode>) },
    {
      file: 'privacy/index.html',
      html: renderToString(<React.StrictMode><PrivacyPage /></React.StrictMode>),
      head: seoHead({
        title: 'Политика обработки персональных данных',
        description: 'Какие данные собирает сайт denis-timoshin.ru, зачем, кому передаёт и как отказаться от cookie и Яндекс Метрики.',
        path: '/privacy/', type: 'website', image: null, modified: PRIVACY.updated,
        jsonLd: { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Политика обработки персональных данных', url: `${SITE}/privacy/`, dateModified: PRIVACY.updated },
      }),
    },
    {
      file: 'checklists/index.html',
      html: renderToString(<React.StrictMode><ChecklistsPage /></React.StrictMode>),
      head: seoHead({
        ...HUB, path: '/checklists/', image: 'checklists.jpg', type: 'website',
        imageAlt: 'Чек-листы тестирования для каждого компонента',
        jsonLd: checklistsJsonLd(),
      }),
    },
    ...Object.values(CONTENT).map(c => ({
      file: `checklists/${c.slug}/index.html`,
      html: renderToString(<React.StrictMode><ChecklistDetail content={c} /></React.StrictMode>),
      head: seoHead({
        title: c.title, description: c.description, path: `/checklists/${c.slug}/`,
        image: `${c.slug}.jpg`, imageAlt: c.h1, type: 'article', modified: c.updated,
        jsonLd: detailJsonLd(c),
      }),
    })),
  ]
}

// Адреса для sitemap.xml: путь и дата изменения
export function sitemapEntries() {
  const dates = Object.values(CONTENT).map(c => c.updated).sort()
  return [
    { path: '/checklists/', lastmod: dates[dates.length - 1], priority: '0.9' },
    ...Object.values(CONTENT).map(c => ({ path: `/checklists/${c.slug}/`, lastmod: c.updated, priority: '0.7' })),
    { path: '/privacy/', lastmod: PRIVACY.updated, priority: '0.2' },
  ]
}

// Карточки, у которых число проверок в data.js не совпадает с содержимым
export function countMismatches() {
  return CHECKLISTS
    .filter(c => CONTENT[c.slug] && c.n !== countChecks(CONTENT[c.slug]))
    .map(c => `${c.slug}: в data.js ${c.n}, в чек-листе ${countChecks(CONTENT[c.slug])}`)
}
