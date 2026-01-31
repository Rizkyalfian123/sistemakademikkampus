import React from 'react';
import { FiX, FiClock } from 'react-icons/fi';
import { PortalOverlay } from '../shared/PortalOverlay';

export const AnnouncementModal = ({ item, onClose }) => {
  if (!item) return null;

  const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <PortalOverlay onClose={onClose}>
      {/* CONTAINER UTAMA:
         1. maxHeight: '85vh' -> Agar tidak pernah melebihi tinggi layar
         2. display: 'flex', flexDirection: 'column' -> Agar header/footer/content tertata vertikal
         3. overflow: 'hidden' -> Agar sudut rounded tidak tembus
      */}
      <div 
        className="bg-white w-full rounded-2xl shadow-2xl animate-pop-in"
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          maxHeight: '75vh', // PENTING: Batasi tinggi modal
          overflow: 'hidden' 
        }}
      >
        
        {/* === HEADER (FIXED - Tidak Ikut Scroll) === */}
        <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-800 text-white flex-shrink-0 relative">
           <span className="bg-white/20 border border-white/20 text-xs font-bold px-3 py-1 rounded-full uppercase mb-3 inline-block tracking-wider">
              {item.kategori || 'INFORMASI'}
           </span>
           
           {/* Padding kanan agar judul tidak nabrak tombol close */}
           <h2 className="text-xl md:text-2xl font-bold leading-tight mb-2 pr-12">
              {item.Judul}
           </h2>
           
           <div className="flex items-center gap-2 text-blue-100 text-sm">
              <FiClock /> <span>{formatDate(item.created_at)}</span>
           </div>

           {/* Tombol Close Absolute */}
           <button 
             onClick={onClose} 
             className="absolute top-6 right-6 bg-white/10 hover:bg-white/30 p-2 rounded-full transition focus:outline-none"
           >
             <FiX size={24} className="text-white" />
           </button>
        </div>

        {/* === CONTENT (SCROLLABLE AREA) === 
            overflowY: 'auto' -> Scrollbar muncul di sini jika teks panjang
            flex: 1 -> Mengisi sisa ruang antara Header dan Footer
        */}
        <div 
          className="p-6 bg-gray-50"
          style={{ 
            overflowY: 'auto', 
            flex: 1 
          }}
        >
          <div className="prose max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap text-base md:text-lg">
             {item.isi_pengumuman}
          </div>
        </div>

        {/* === FOOTER (FIXED - Tidak Ikut Scroll) === */}
        <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-8 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition w-full md:w-auto"
          >
            Tutup
          </button>
        </div>

      </div>
    </PortalOverlay>
  );
};