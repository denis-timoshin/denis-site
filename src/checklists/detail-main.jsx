import React from 'react'
import ReactDOM from 'react-dom/client'
import ChecklistDetail from './ChecklistDetail.jsx'
import { CONTENT } from './content/index.js'
import '../index.css'

// Какой чек-лист показать, говорит data-slug в HTML-обёртке страницы
const root = document.getElementById('root')
const app = (
  <React.StrictMode>
    <ChecklistDetail content={CONTENT[root.dataset.slug]} />
  </React.StrictMode>
)

// В production разметка уже пре-рендерена — оживляем её, в dev рисуем с нуля
if (root.hasChildNodes()) {
  ReactDOM.hydrateRoot(root, app)
} else {
  ReactDOM.createRoot(root).render(app)
}
