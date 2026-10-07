import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { getLocale } from './lib/locale'
import { initializeTheme } from './lib/theme'
import './index.css'

document.documentElement.lang = getLocale()
initializeTheme()
const container = document.getElementById('root')
if (!container) throw new Error('#root not found')

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
