import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import LandingPage from './pages/LandingPage'
import AdminDashboard from './pages/AdminDashboard';

// PERBAIKAN: Gunakan kurung kurawal { } untuk memperbaiki error "does not provide an export named 'default'"
import { MitraProfilesView } from './components/views/MitraProfilesView';

// --- IMPORT KOMPONEN PENJAGA RUTE ADMIN ---
import { AdminRoute } from './components/auth/AdminRoute';

export default function App() {
  return (
    <Routes>
      {/* 1. HALAMAN DEPAN (PENGUMUMAN) - Diakses Pertama Kali */}
      <Route path="/" element={<LandingPage />} />

      {/* 2. HALAMAN LOGIN - Diakses saat tombol 'Login' ditekan */}
      <Route path="/login" element={<Login />} />
      
      {/* 3. DASHBOARD - Hanya bisa diakses setelah login */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* 4. DASHBOARD ADMIN - Dilindungi oleh AdminRoute */}
      <Route 
        path="/admin/*" // Gunakan /* jika admin memiliki sub-rute internal
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } 
      />

      {/* 5. HALAMAN PROFIL MITRA - Publik */}
      <Route path="/mitra" element={<MitraProfilesView />} />
      
    </Routes>
  )
}