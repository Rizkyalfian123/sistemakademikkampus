import React from 'react';
import { FiMenu } from 'react-icons/fi';

// PENTING: Gunakan 'export const', BUKAN 'export default'
export const Header = ({ user, activeMenu, onMenuClick }) => {
  const getTitle = (menu) => {
    if (menu === 'Dashboard') return 'Dashboard Mahasiswa';
    // Menambahkan spasi sebelum huruf kapital (camelCase to Title Case)
    return menu.replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <header className="h-20 bg-white shadow-sm flex items-center justify-between px-4 md:px-8 z-10 shrink-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick} 
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 md:hidden focus:outline-none"
        >
          <FiMenu size={24} />
        </button>
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
          {getTitle(activeMenu)}
        </h2>
      </div>
      
      <div className="flex items-center gap-3 md:gap-6">
        <div className="text-right hidden md:block">
          <p className="text-sm font-bold text-gray-800">{user.name}</p>
          <p className="text-xs text-gray-500">{user.role}</p>
        </div>
        <img 
          src={user.avatar || 'https://via.placeholder.com/40'} 
          alt="Profile" 
          className="w-10 h-10 rounded-full border-2 border-gray-100 shadow-sm object-cover bg-gray-200" 
        />
      </div>
    </header>
  );
};