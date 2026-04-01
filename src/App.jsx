import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import LandingPage from './pages/LandingPage'
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard'

// PERBAIKAN: Gunakan kurung kurawal { } untuk memperbaiki error "does not provide an export named 'default'"
import { MitraProfilesView } from './components/views/MitraProfilesView';

// --- IMPORT KOMPONEN PENJAGA (Saya ganti namanya jadi ProtectedRoute agar lebih umum) ---
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      {/* 1. HALAMAN PUBLIK */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/mitra" element={<MitraProfilesView />} />

      {/* 2. DASHBOARD MAHASISWA (Semua yang login bisa akses) */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['Mahasiswa', 'Admin', 'super_admin']}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      {/* 3. DASHBOARD ADMIN (Hanya Admin & Super Admin) */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['Admin', 'super_admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />

      {/* 4. DASHBOARD SUPER ADMIN (HANYA Super Admin) */}
      <Route 
        path="/super-admin" 
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Jika user nyasar ke URL yang tidak ada */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}