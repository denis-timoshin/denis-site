import React from 'react'
import ReactDOM from 'react-dom/client'
import PrivacyPage from './PrivacyPage.jsx'
import '../index.css'

const root = document.getElementById('root')
const app = (
  <React.StrictMode>
    <PrivacyPage />
  </React.StrictMode>
)

// В production разметка пре-рендерена — оживляем её, в dev рисуем с нуля
if (root.hasChildNodes()) {
  ReactDOM.hydrateRoot(root, app)
} else {
  ReactDOM.createRoot(root).render(app)
}
