import React from 'react'
import ReactDOM from 'react-dom/client'
import ChecklistDetail from './ChecklistDetail.jsx'
import '../index.css'

// Каждый чек-лист — отдельный чанк: страница грузит только своё содержимое, а не все 50+
const loaders = import.meta.glob(['./content/*.js', '!./content/index.js'])

// Какой чек-лист показать, говорит data-slug в HTML-обёртке страницы
const root = document.getElementById('root')
const load = loaders[`./content/${root.dataset.slug}.js`]

load().then(({ default: content }) => {
  const app = (
    <React.StrictMode>
      <ChecklistDetail content={content} />
    </React.StrictMode>
  )
  // В production разметка уже пре-рендерена — оживляем её, в dev рисуем с нуля
  if (root.hasChildNodes()) {
    ReactDOM.hydrateRoot(root, app)
  } else {
    ReactDOM.createRoot(root).render(app)
  }
})
