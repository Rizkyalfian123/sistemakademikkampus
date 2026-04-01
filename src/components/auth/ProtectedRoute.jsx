import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const sessionData = localStorage.getItem('user_akademik');
  
  // 1. Jika belum login, lempar ke landing page/login
  if (!sessionData) {
    return <Navigate to="/" replace />;
  }

  const user = JSON.parse(sessionData);

  // Helper untuk menentukan rumah masing-masing role
  const getHomePath = (role) => {
    if (role === 'super_admin') return '/super-admin';
    if (role === 'Admin') return '/admin';
    return '/dashboard'; // Default untuk Mahasiswa
  };

  // 2. Cek apakah role user diizinkan untuk rute ini
  const isAllowed = allowedRoles.includes(user.role);

  // 3. Jika TIDAK diizinkan, redirect ke halaman milik role-nya sendiri
  if (!isAllowed) {
    const targetPath = getHomePath(user.role);
    return <Navigate to={targetPath} replace />;
  }

  // 4. Jika diizinkan, tampilkan halamannya
  return children;
};  