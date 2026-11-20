import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const root = document.getElementById('root')
const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// В production разметка главной уже пре-рендерена (scripts/prerender.mjs) — оживляем её.
// В dev-режиме контейнер пустой, рисуем с нуля.
if (root.hasChildNodes()) {
  ReactDOM.hydrateRoot(root, app)
} else {
  ReactDOM.createRoot(root).render(app)
}
