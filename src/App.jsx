import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import LandingPage from './pages/LandingPage' // Kita akan buat file ini

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 1. HALAMAN DEPAN (PENGUMUMAN) - Diakses Pertama Kali */}
        <Route path="/" element={<LandingPage />} />

        {/* 2. HALAMAN LOGIN - Diakses saat tombol 'Login' ditekan */}
        <Route path="/login" element={<Login />} />
        
        {/* 3. DASHBOARD - Hanya bisa diakses setelah login */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}