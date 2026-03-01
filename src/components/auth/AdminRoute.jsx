import React from 'react';
import { Navigate } from 'react-router-dom';

export const AdminRoute = ({ children }) => {
  const sessionData = localStorage.getItem('user_akademik');

  // 1. Jika belum login sama sekali
  if (!sessionData) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(sessionData);
    
    // Pastikan user punya role sebelum di-cek
    const userRole = user?.role ? user.role.toLowerCase() : '';

    // 2. Jika BUKAN admin, lempar balik ke dashboard mahasiswa
    if (userRole !== 'admin' && userRole !== 'administrator') {
      alert("Akses Ditolak: Anda login sebagai Mahasiswa.");
      return <Navigate to="/dashboard" replace />;
    }

    // 3. Jika benar Admin, izinkan masuk
    return children;

  } catch (error) {
    // Jika data session rusak
    localStorage.removeItem('user_akademik');
    return <Navigate to="/login" replace />;
  }
};