import React, { useState, useRef, useEffect } from 'react';
import { FiMenu, FiChevronDown, FiUser, FiMail, FiLogOut } from 'react-icons/fi';

// PENTING: Gunakan 'export const', BUKAN 'export default'
export const Header = ({ user, activeMenu, onMenuClick, onOpenEmail, onOpenProfile, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Menutup dropdown otomatis jika user klik di luar area menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Logika Judul Halaman
  const getTitle = (menu) => {
    if (!menu) return 'Dashboard';
    if (menu === 'Dashboard') return 'Dashboard Mahasiswa';
    // Menambahkan spasi sebelum huruf kapital (camelCase to Title Case)
    return menu.replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <header className="h-20 bg-white shadow-sm flex items-center justify-between px-4 md:px-8 z-10 shrink-0">
      
      {/* BAGIAN KIRI: Menu Hamburger & Judul Halaman */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick} 
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 md:hidden focus:outline-none transition-colors"
        >
          <FiMenu size={24} />
        </button>
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
          {getTitle(activeMenu)}
        </h2>
      </div>
      
      {/* BAGIAN KANAN: Profil & Dropdown Menu */}
      <div className="relative" ref={dropdownRef}>
        <div 
          className="flex items-center gap-3 md:gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors select-none"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          {/* Teks Info User (Sembunyi di HP, Tampil di Laptop) */}
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-800">{user?.name || 'Mahasiswa'}</p>
            {/* Memprioritaskan NIM, jika kosong pakai Role */}
            <p className="text-xs text-gray-500">{user?.nim || user?.role || '-'}</p>
          </div>
          
          {/* Avatar & Ikon Panah */}
          <div className="flex items-center gap-2">
            <img 
              src={user?.avatar || 'https://via.placeholder.com/40'} 
              alt="Profile" 
              className="w-10 h-10 rounded-full border-2 border-gray-100 shadow-sm object-cover bg-gray-200" 
            />
            <FiChevronDown className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* DROPDOWN MENU */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-pop-in">
            <button 
              onClick={() => { setDropdownOpen(false); if(onOpenProfile) onOpenProfile(); }}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <FiUser className="text-gray-400" size={16} /> Ubah Profil
            </button>
            <button 
              onClick={() => { setDropdownOpen(false); if(onOpenEmail) onOpenEmail(); }}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <FiMail className="text-gray-400" size={16} /> Daftarkan Email
            </button>
            
            <div className="h-px bg-gray-100 my-1"></div>
            
            <button 
              onClick={() => { setDropdownOpen(false); if(onLogout) onLogout(); }}
              className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 font-medium transition-colors"
            >
              <FiLogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};