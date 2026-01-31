import React from 'react';
import { FiCheckCircle, FiFileText, FiEdit3, FiDownload, FiAlertCircle } from 'react-icons/fi';

export const StageCard = ({ stage, onUpdate, onDownload, icon: Icon, themeColor }) => {
  // Tentukan warna border/text berdasarkan tema
  const isMagang = themeColor.includes('purple');
  const btnBorderClass = isMagang ? 'border-purple-600 text-purple-600 hover:bg-purple-50' : 'border-blue-600 text-blue-600 hover:bg-blue-50';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
      {/* Header Card */}
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

      {/* Body Card */}
      <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
         
         {/* Info Kiri (Icon & Status) */}
         <div className="flex items-center gap-4 w-full md:w-auto">
            <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl shadow-sm ${stage.status === 'locked' ? 'bg-gray-100 text-gray-400' : 'bg-gray-50 text-gray-700'}`}>
              <Icon />
            </div>
            <div>
              <h4 className={`font-bold text-base md:text-lg ${stage.status === 'locked' ? 'text-gray-400' : 'text-gray-800'}`}>
                Form {stage.title}
              </h4>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                Status: 
                <span className={`font-bold px-2 py-0.5 rounded text-xs uppercase ${
                  stage.status === 'done' ? 'bg-green-100 text-green-700' : 
                  stage.status === 'open' ? 'bg-orange-100 text-orange-700' : 
                  'bg-gray-100 text-gray-500'
                }`}>
                  {stage.status === 'done' ? 'Selesai' : stage.status === 'open' ? 'Terbuka' : 'Terkunci'}
                </span>
              </p>
            </div>
         </div>

         {/* Tombol Kanan (Action Buttons) */}
         <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto min-w-[300px]">
            {stage.status !== 'locked' ? (
               <>
                 {/* Tombol ISI FORM */}
                 <button 
                   onClick={onUpdate} 
                   // Logic: Jika sudah done, tombol ini disable (atau bisa dibuat enable untuk edit)
                   disabled={stage.status === 'done'} 
                   className={`flex-1 px-5 py-2.5 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                     stage.status === 'done' 
                       ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed' 
                       : btnBorderClass
                   }`}
                 >
                   <FiEdit3 size={16} /> 
                   {stage.status === 'done' ? 'Sudah Diisi' : 'Isi Form'}
                 </button>

                 {/* Tombol DOWNLOAD PDF (FIXED: Ditambahkan onClick) */}
                 <button 
                   onClick={onDownload} 
                   className="flex-1 px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-700 shadow-md shadow-red-200 transition-all active:scale-95"
                 >
                   <FiDownload size={16} /> 
                   Download PDF
                 </button>
               </>
            ) : (
              /* State Terkunci */
              <div className="w-full py-3 bg-gray-50 text-gray-400 text-sm font-medium rounded-xl border border-gray-200 border-dashed flex items-center justify-center gap-2 cursor-not-allowed">
                <FiAlertCircle /> Tahap Belum Terbuka
              </div>
            )}
         </div>
      </div>
    </div>
  );
};