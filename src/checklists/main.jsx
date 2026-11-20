import React from 'react'
import ReactDOM from 'react-dom/client'
import ChecklistsPage from './ChecklistsPage.jsx'
import '../index.css'

const root = document.getElementById('root')
const app = (
  <React.StrictMode>
    <ChecklistsPage />
  </React.StrictMode>
)

// В production-сборке разметка уже отрендерена заранее (scripts/prerender.mjs) — оживляем её.
// В dev-режиме контейнер пустой, рисуем с нуля.
if (root.hasChildNodes()) {
  ReactDOM.hydrateRoot(root, app)
} else {
  ReactDOM.createRoot(root).render(app)
}
