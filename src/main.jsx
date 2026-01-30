import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// LOGIKA OTOMATIS:
// Jika sedang mode 'development' (di laptop), pakai '/'
// Jika sedang mode 'production' (di GitHub), pakai '/sistemakademikkampus'
const basename = import.meta.env.DEV ? '/' : '/sistemakademikkampus'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)