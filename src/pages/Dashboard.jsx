import React, { useState } from 'react';
import { FiFileText, FiBriefcase, FiBell, FiClock, FiChevronRight } from 'react-icons/fi';

// IMPORTS
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { StageCard } from '../components/cards/StageCard';
import { ChatWidget } from '../components/shared/ChatWidget';
import { AnnouncementModal } from '../components/modals/AnnouncementModal';
import { FormModal } from '../components/modals/FormModal';
import { useDashboardLogic } from '../hooks/useDashboardLogic';
import { generateAndDownloadPDF } from '../utils/pdfGenerator';
// import { supabase } from '../supabaseClient'; 

export default function Dashboard() {
  const logic = useDashboardLogic();

  const [selectedAnnounce, setSelectedAnnounce] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentStageId, setCurrentStageId] = useState(null);

  // FIX: STATE 'LOCAL DB' (Simulasi Database Sementara)
  // Format: { [stageId]: { ...dataForm } }
  const [localDB, setLocalDB] = useState({}); 

  const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const styles = {
    glass: { backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)' },
    progressBarTA: { background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)', width: `${logic.taProgress?.percent || 0}%`, transition: 'width 1s ease-in-out' },
    progressBarMagang: { background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)', width: `${logic.magangProgress?.percent || 0}%`, transition: 'width 1s ease-in-out' }
  };

  // --- HANDLERS ---

  const handleOpenForm = (stageId) => {
    setCurrentStageId(stageId);
    // FormModal otomatis akan membaca data dari props 'initialData' di bawah
    setIsFormOpen(true);
  };

  const handleSaveToDB = async (dataInput) => {
    try {
      console.log("Menyimpan Data:", dataInput);
      
      // 1. SIMPAN KE LOCAL STATE (Agar bisa diambil saat download PDF)
      setLocalDB(prev => ({
        ...prev,
        [currentStageId]: dataInput // Key = Stage ID
      }));

      // 2. SIMPAN KE SUPABASE (Uncomment jika sudah connect DB)
      /* const { error } = await supabase.from('submission_ta').upsert({
         stage_id: currentStageId,
         user_id: logic.user.id,
         ...dataInput
      });
      if (error) throw error; 
      */

      // 3. Update Status UI
      logic.handleUpdateStatus(currentStageId, 'TA'); 
      alert("Data berhasil disimpan! Tombol Download PDF sekarang aktif.");
      setIsFormOpen(false);

    } catch (err) {
      alert("Gagal menyimpan: " + err.message);
    }
  };

  const handleDownloadPDF = async (stageId, stageTitle) => {
    try {
      // FIX: AMBIL DATA DARI 'LOCAL DB' (Bukan Dummy)
      const savedData = localDB[stageId];

      if (!savedData) {
        alert("Data belum ditemukan! Silakan klik tombol 'Isi Form' lalu 'Simpan' terlebih dahulu.");
        return;
      }

      console.log("Mendownload PDF dengan data:", savedData);

      // Siapkan object untuk PDF
      const pdfData = {
         nama_mahasiswa: savedData.nama_mahasiswa,
         nim: savedData.nim, 
         judul_ta: savedData.judul_ta,
         hari_tanggal: savedData.hari_tanggal,
         ruang_waktu: savedData.ruang_waktu
      };

      await generateAndDownloadPDF(
          '/templates/berita_acara.pdf', // Pastikan path ini sesuai lokasi file di folder public
          pdfData, 
          `Dokumen_${stageTitle.replace(/\s/g, '_')}.pdf`
      );

    } catch (err) {
      console.error(err);
      alert("Gagal generate PDF. Pastikan template tersedia.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 overflow-hidden relative">
      <style>{`@keyframes popIn { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } } .animate-pop-in { animation: popIn 0.2s cubic-bezier(0.165, 0.84, 0.44, 1) forwards; }`}</style>

      {/* SIDEBAR */}
      <Sidebar 
        activeMenu={logic.activeMenu} setActiveMenu={logic.setActiveMenu}
        isOpen={logic.mobileSidebarOpen} setIsOpen={logic.setMobileSidebarOpen}
        onLogout={logic.logout}
      />

      {/* CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative w-full bg-gray-50">
        <Header user={logic.user} activeMenu={logic.activeMenu} onMenuClick={() => logic.setMobileSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto pb-24">
            
            {/* VIEW: DASHBOARD */}
            {logic.activeMenu === 'Dashboard' && (
              <div className="space-y-8 animate-pop-in">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div style={{background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)'}} className="relative rounded-2xl p-8 h-64 flex flex-col justify-center overflow-hidden text-white shadow-lg">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold">Tugas Akhir</h3>
                            <p className="text-blue-50 text-sm mt-1 opacity-90">Progress: <b>{logic.taProgress?.percent}%</b></p>
                            <button onClick={() => logic.setActiveMenu('TugasAkhir')} className="mt-6 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold text-sm shadow-md">Lihat Detail</button>
                        </div>
                    </div>
                    <div style={{background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)'}} className="relative rounded-2xl p-8 h-64 flex flex-col justify-center overflow-hidden text-white shadow-lg">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold">Magang</h3>
                            <p className="text-purple-50 text-sm mt-1 opacity-90">Progress: <b>{logic.magangProgress?.percent}%</b></p>
                            <button onClick={() => logic.setActiveMenu('Magang')} className="mt-6 border-2 border-white text-white px-6 py-3 rounded-xl font-bold text-sm">Lihat Detail</button>
                        </div>
                    </div>
                 </div>

                 {/* Progress Bars */}
                 <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-8">Progress Akademik</h3>
                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between items-center mb-3"><span className="font-semibold text-gray-700">Tugas Akhir</span><span className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">{logic.taProgress?.label}</span></div>
                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden"><div className="h-full rounded-full" style={styles.progressBarTA}></div></div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-3"><span className="font-semibold text-gray-700">Magang</span><span className="px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase">{logic.magangProgress?.label}</span></div>
                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden"><div className="h-full rounded-full" style={styles.progressBarMagang}></div></div>
                        </div>
                    </div>
                 </div>
              </div>
            )}

            {/* VIEW: PENGUMUMAN */}
            {logic.activeMenu === 'Pengumuman' && (
              <div className="animate-pop-in">
                 {logic.loadingAnnounce ? (
                    <div className="text-center py-10 text-gray-400">Loading...</div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {logic.announcements.map((item) => (
                           <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition border border-gray-100">
                              <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded uppercase">{item.kategori || 'Info'}</span>
                              <h3 onClick={() => setSelectedAnnounce(item)} className="font-bold mt-2 mb-2 cursor-pointer hover:text-blue-600">{item.Judul}</h3>
                              <p className="text-sm text-gray-500 line-clamp-3">{item.isi_pengumuman}</p>
                           </div>
                        ))}
                    </div>
                 )}
              </div>
            )}

            {/* VIEW: TUGAS AKHIR */}
            {logic.activeMenu === 'TugasAkhir' && (
              <div className="space-y-6 animate-pop-in">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
                   <h2 className="text-xl font-bold text-blue-900 mb-2">Tugas Akhir</h2>
                   <p className="text-blue-700 text-sm">Lengkapi form di bawah ini untuk mengunduh dokumen.</p>
                </div>
                <div className="space-y-6">
                  {logic.taStages.map(stage => (
                    <StageCard 
                      key={stage.id} 
                      stage={stage} 
                      icon={FiFileText} 
                      themeColor="bg-[#0f2a4a]" 
                      onUpdate={() => handleOpenForm(stage.id)} 
                      onDownload={() => handleDownloadPDF(stage.id, stage.title)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* VIEW: MAGANG */}
            {logic.activeMenu === 'Magang' && (
              <div className="space-y-6 animate-pop-in">
                 {/* ... Sama seperti TA, pakai StageCard ... */}
                 <div className="space-y-6">
                  {logic.magangStages.map(stage => (
                     <StageCard 
                       key={stage.id} 
                       stage={stage} 
                       icon={FiBriefcase} 
                       themeColor="bg-purple-900" 
                       onUpdate={() => handleOpenForm(stage.id)} 
                       onDownload={() => handleDownloadPDF(stage.id, stage.title)}
                     />
                  ))}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      <ChatWidget announcements={logic.announcements} taPercent={logic.taProgress?.percent} magangPercent={logic.magangProgress?.percent} />
      {selectedAnnounce && <AnnouncementModal item={selectedAnnounce} onClose={() => setSelectedAnnounce(null)} />}
      
      {/* FORM MODAL - PASSING DATA LOCALDB */}
      <FormModal 
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleSaveToDB}
          user={logic.user}
          // Load data yang tersimpan di LocalDB jika ada
          initialData={localDB[currentStageId]} 
       />
    </div>
  );
}