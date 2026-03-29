import React, { useState } from 'react';
import { 
  FiHome, FiBell, FiFileText, FiBriefcase, FiLogOut, FiX, FiChevronDown 
} from 'react-icons/fi';

export const Sidebar = ({ 
  activeMenu, 
  setActiveMenu, 
  isOpen, 
  setIsOpen, 
  onLogout,
  taStages = [],      // Data tahapan TA dari logic
  magangStages = [],  // Data tahapan Magang dari logic
  onStageClick        // Fungsi handler untuk scroll statis
}) => {
  const [openSubMenu, setOpenSubMenu] = useState(null);

  const toggleSubMenu = (menuId) => {
    setOpenSubMenu(openSubMenu === menuId ? null : menuId);
  };

  const menus = [
    { name: 'Dashboard', icon: FiHome, id: 'Dashboard' },
    { name: 'Pengumuman', icon: FiBell, id: 'Pengumuman' },
    { 
      name: 'Tugas Akhir', 
      icon: FiFileText, 
      id: 'TugasAkhir', 
      subItems: taStages 
    },
    { 
      name: 'Magang', 
      icon: FiBriefcase, 
      id: 'Magang', 
      subItems: magangStages 
    },
  ];

  const sidebarStyle = { backgroundColor: '#0f172a', color: 'white' };

  return (
    <>
      {/* Overlay Mobile */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity duration-300"
        ></div>
      )}

      <aside 
        style={sidebarStyle} 
        className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 shadow-xl flex flex-col`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-800">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">S</div>
              <h1 className="font-bold text-lg tracking-wide text-white">SIAKAD</h1>
           </div>
           <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400 hover:text-white focus:outline-none">
             <FiX size={24} />
           </button>
        </div>
        
        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {menus.map((menu) => (
            <div key={menu.id} className="space-y-1">
              <button 
                onClick={() => {
                  if (menu.subItems) {
                    toggleSubMenu(menu.id);
                  } else {
                    setActiveMenu(menu.id);
                    setIsOpen(false);
                  }
                }} 
                className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 group focus:outline-none ${activeMenu === menu.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
              >
                <div className="flex items-center">
                  <menu.icon className={`w-5 h-5 ${activeMenu === menu.id ? 'text-white' : 'group-hover:text-white'}`} />
                  <span className={`ml-4 font-medium ${activeMenu === menu.id ? 'font-bold' : ''}`}>{menu.name}</span>
                </div>
                {menu.subItems && (
                  <FiChevronDown className={`transition-transform duration-200 ${openSubMenu === menu.id ? 'rotate-180' : ''}`} />
                )}
              </button>

              {/* Tampilan Sub-Menu (Stages) */}
              {menu.subItems && openSubMenu === menu.id && (
                <div className="ml-9 space-y-1 animate-fade-in border-l border-gray-800 py-1">
                  {menu.subItems.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setActiveMenu(menu.id); // Pindah tampilan (View)
                        onStageClick(sub.id);   // Jalankan scroll statis ke target ID
                        setIsOpen(false);       // Tutup sidebar di mode mobile
                      }}
                      className="flex items-center w-full px-4 py-2 text-[13px] text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-left"
                    >
                      {/* Titik Indikator: Hijau jika status 'Selesai' */}
                      <div className={`w-1.5 h-1.5 rounded-full mr-3 ${sub.status === 'Selesai' ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.6)]' : 'bg-gray-600'}`}></div>
                      <span className="truncate">{sub.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-800">
          <button onClick={onLogout} className="flex items-center w-full py-3 px-4 rounded-xl border border-gray-700 hover:bg-red-600 hover:border-red-600 hover:text-white text-gray-400 transition-all duration-300 group focus:outline-none">
            <FiLogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="ml-3 font-medium">Keluar Akun</span>
          </button>
        </div>
      </aside>
    </>
  );
};