import React from 'react';
import { FiHome, FiBell, FiFileText, FiBriefcase, FiLogOut, FiX } from 'react-icons/fi';

export const Sidebar = ({ activeMenu, setActiveMenu, isOpen, setIsOpen, onLogout }) => {
  const menus = [
    { name: 'Dashboard', icon: FiHome, id: 'Dashboard' },
    { name: 'Pengumuman', icon: FiBell, id: 'Pengumuman' },
    { name: 'Tugas Akhir', icon: FiFileText, id: 'TugasAkhir' },
    { name: 'Magang', icon: FiBriefcase, id: 'Magang' },
  ];

  // Style manual untuk menjamin warna keluar
  const sidebarStyle = { backgroundColor: '#0f172a', color: 'white' };

  return (
    <>
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity"
        ></div>
      )}

      <aside 
        style={sidebarStyle} 
        className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 shadow-xl flex flex-col`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-800">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg font-bold text-white">S</div>
              <h1 className="font-bold text-lg tracking-wide text-white">SIAKAD</h1>
           </div>
           <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400 hover:text-white focus:outline-none"><FiX size={24} /></button>
        </div>
        
        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menus.map((menu) => (
            <button 
              key={menu.id} 
              onClick={() => { setActiveMenu(menu.id); setIsOpen(false); }} 
              className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 group focus:outline-none ${activeMenu === menu.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <menu.icon className={`w-5 h-5 ${activeMenu === menu.id ? 'text-white' : 'group-hover:text-white'}`} />
              <span className={`ml-4 font-medium ${activeMenu === menu.id ? 'font-bold' : ''}`}>{menu.name}</span>
            </button>
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-800">
          <button onClick={onLogout} className="flex items-center w-full py-3 px-4 rounded-xl border border-gray-700 hover:bg-red-600 hover:border-red-600 hover:text-white text-gray-400 transition-all duration-300 group focus:outline-none">
            <FiLogOut className="w-5 h-5" />
            <span className="ml-3 font-medium">Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
};