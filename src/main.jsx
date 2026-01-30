import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Tambahkan import ini:
import { BrowserRouter } from 'react-router-dom'

import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Tambahkan BrowserRouter dengan basename sesuai nama repository */}
    <BrowserRouter basename="/sistemakademikkampus">
      <App />
    </BrowserRouter>
  </StrictMode>,
)