import React from 'react';
import { FiCheckCircle, FiEdit3, FiDownload, FiAlertCircle, FiCornerDownRight, FiCheck } from 'react-icons/fi';

export const StageCard = ({ stage, onUpdate, onDownload, icon: Icon, themeColor }) => {
  // Tentukan warna border/text berdasarkan tema
  const isMagang = themeColor.includes('purple');
  const btnBorderClass = isMagang ? 'border-purple-600 text-purple-600 hover:bg-purple-50' : 'border-blue-600 text-blue-600 hover:bg-blue-50';

  // --- HELPER COMPONENT: Action Buttons ---
  // Menerima 'itemStatus' untuk menentukan apakah tombol jadi Hijau (Selesai) atau Biru/Ungu (Isi Data)
  const ActionButtons = ({ id, filename, title, itemStatus }) => {
    // Jika itemStatus 'done', berarti tahap ini sudah selesai diisi
    const isDone = itemStatus === 'done';

    return (
      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto min-w-[240px]">
        {/* Tombol ISI DATA / EDIT */}
        <button 
          onClick={() => onUpdate(id)} 
          // Tombol tetap aktif meski sudah selesai, agar user bisa edit/lihat data
          // Jika ingin disable setelah selesai, tambahkan: disabled={isDone}
          className={`flex-1 px-4 py-2 rounded-lg border font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${
            isDone 
              ? 'border-green-200 text-green-600 bg-green-50 hover:bg-green-100' // Style jika Selesai
              : btnBorderClass // Style default (Biru/Ungu)
          }`}
        >
          {isDone ? <><FiCheck /> Data Terisi</> : <><FiEdit3 /> Isi Data</>}
        </button>

        {/* Tombol DOWNLOAD PDF */}
        <button 
          onClick={() => onDownload(id, filename, title)} 
          disabled={stage.status === 'locked'} // Disable jika tahap utama terkunci
          className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-700 shadow-sm transition-all active:scale-95 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
        >
          <FiDownload /> PDF
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
      {/* --- HEADER CARD --- */}
      <div className={`${themeColor} px-6 py-3 border-b border-gray-100 flex justify-between items-center text-white`}>
         <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-white/50 rounded-full"></div>
            <h3 className="font-bold text-sm tracking-wide uppercase">{stage.title}</h3>
         </div>
         {stage.status === 'done' && (
           <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
             <FiCheckCircle /> Selesai
           </span>
         )}
      </div>

      {/* --- BODY CARD --- */}
      <div className="p-6">
         {/* 1. Info Utama (Icon & Status) */}
         <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl shadow-sm ${stage.status === 'locked' ? 'bg-gray-100 text-gray-400' : 'bg-gray-50 text-gray-700'}`}>
              <Icon />
            </div>
            <div>
              {/* JUDUL KEGIATAN */}
              <h4 className={`font-bold text-lg mb-1 ${stage.status === 'locked' ? 'text-gray-400' : 'text-gray-800'}`}>
                {stage.title}
              </h4>

              <p className="text-sm text-gray-500 flex items-center gap-1">
                Status: 
                <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                  stage.status === 'done' ? 'bg-green-100 text-green-700' : 
                  stage.status === 'open' ? 'bg-orange-100 text-orange-700' : 
                  'bg-gray-100 text-gray-500'
                }`}>
                  {stage.status === 'done' ? 'Selesai' : stage.status === 'open' ? 'Terbuka' : 'Terkunci'}
                </span>
              </p>
              {stage.status === 'locked' && <p className="text-xs text-gray-400 mt-0.5">Selesaikan tahap sebelumnya.</p>}
            </div>
         </div>

         {/* 2. LOGIKA RENDER TOMBOL / SUB-MENU */}
         {stage.subStages && stage.status !== 'locked' ? (
           // --- A. TAMPILAN JIKA ADA SUB-MENU (Daftar Dokumen) ---
           <div className="mt-4 space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100 animate-pop-in">
             <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-3 bg-blue-500 rounded-full"></div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dokumen Yang Diperlukan:</p>
             </div>
             
             {stage.subStages.map((sub) => (
               <div key={sub.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:border-blue-200 transition-colors">
                 <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FiCornerDownRight className="text-gray-400" />
                    {sub.title}
                 </div>
                 {/* Tombol Aksi per Sub-Item (Kirim status sub-item ke sini) */}
                 <ActionButtons id={sub.id} filename={sub.file} title={sub.title} itemStatus={sub.status} />
               </div>
             ))}
           </div>
         ) : (
           // --- B. TAMPILAN SINGLE (Standar) ---
           <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-gray-100 pt-4 mt-2">
              <div className="text-sm text-gray-600">
                 {stage.status === 'locked' 
                    ? 'Tahap ini belum tersedia.' 
                    : 'Lengkapi formulir untuk mengunduh dokumen.'}
              </div>

              {stage.status !== 'locked' ? (
                 // Tombol Aksi Standar
                 <ActionButtons id={stage.id} filename="dokumen_standar.pdf" title={stage.title} itemStatus={stage.status} />
              ) : (
                // Label Terkunci
                <div className="w-full md:w-auto py-2 px-4 bg-gray-50 text-gray-400 text-xs font-medium rounded-lg border border-gray-200 border-dashed flex items-center justify-center gap-2 cursor-not-allowed">
                  <FiAlertCircle /> Terkunci
                </div>
              )}
           </div>
         )}
      </div>
    </div>
  );
};