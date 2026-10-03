import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// منع تضمين الموقع داخل إطار موقع آخر (clickjacking)
try { if (window.top !== window.self) window.top.location = window.self.location } catch { document.documentElement.style.display = 'none' }

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
