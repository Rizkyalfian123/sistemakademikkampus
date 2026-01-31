import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
// Import Icon
import { 
  FiHome, FiBell, FiFileText, FiBriefcase, 
  FiLogOut, FiMenu, FiX, FiMessageSquare, FiSend, 
  FiClock, FiChevronRight, FiCheckCircle, FiDownload, FiEdit3, FiAlertCircle, FiKey
} from 'react-icons/fi';
// Import PDF Generator
import { generateAndDownloadPDF } from '../utils/pdfGenerator';
// Import Components
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { StageCard } from '../components/cards/StageCard';
import { ChatWidget } from '../components/shared/ChatWidget';
import { AnnouncementModal } from '../components/modals/AnnouncementModal';
import { FormModal } from '../components/modals/FormModal';
import { useDashboardLogic } from '../hooks/useDashboardLogic';

export default function Dashboard() {
  const navigate = useNavigate();
  const logic = useDashboardLogic();

  // --- STATE ---
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentStageId, setCurrentStageId] = useState(null);
  
  // STATE MOCK DATABASE (Menyimpan data input form sementara)
  const [localDB, setLocalDB] = useState({}); 

  // --- STYLES ---
  const styles = {
    gradientCard: { background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)' },
    glass: { backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)' },
    progressBarTA: { background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)', width: `${logic.taProgress?.percent || 0}%`, transition: 'width 1s ease-in-out' },
    progressBarMagang: { background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)', width: `${logic.magangProgress?.percent || 0}%`, transition: 'width 1s ease-in-out' }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  // --- HANDLERS ---

  // 1. BUKA FORM
  const handleOpenForm = (stageId) => {
    setCurrentStageId(stageId);
    setIsFormOpen(true);
  };

  // 2. SIMPAN DATA
  const handleSaveToDB = async (dataInput) => {
    try {
      console.log("Menyimpan Data:", dataInput);
      setLocalDB(prev => ({
        ...prev,
        [currentStageId]: dataInput 
      }));

      // Update status visual
      logic.handleUpdateStatus(currentStageId, 'TA'); 
      alert("Data berhasil disimpan! Tombol Download PDF sekarang bisa digunakan.");
      setIsFormOpen(false);

    } catch (err) {
      alert("Gagal menyimpan: " + err.message);
    }
  };

  // --- 3. FUNGSI KHUSUS URL PDF (FIX GITHUB PAGES) ---
  const getPdfTemplateUrl = () => {
    // ============================================================
    // ⚠️ GANTI 'nama-repo-kamu' DI BAWAH INI SESUAI GITHUB KAMU! ⚠️
    // Contoh: jika linknya rizky.github.io/siakad-app/, tulis 'siakad-app'
    // Jika di localhost, biarkan saja, kode ini otomatis mendeteksi.
    const REPO_NAME = 'sistemakademikkampus'; 
    // ============================================================

    const isGithubPages = window.location.hostname.includes('github.io');
    const filename = 'templates/berita_acara.pdf';

    if (isGithubPages) {
      // Jika di GitHub, tambahkan nama repo di depan
      // Hasil: /nama-repo/templates/berita_acara.pdf
      return `/${REPO_NAME}/${filename}`;
    } else {
      // Jika di Localhost
      // Hasil: /templates/berita_acara.pdf
      return `/${filename}`;
    }
  };

  // 4. DOWNLOAD PDF
  const handleDownloadPDF = async (stageId, stageTitle) => {
    try {
      // Ambil data dari state lokal
      const savedData = localDB[stageId];

      if (!savedData) {
        alert("Data belum ditemukan! Silakan klik 'Isi Form' dan 'Simpan' terlebih dahulu.");
        return;
      }

      // Mapping data
      const pdfData = {
         nama_mahasiswa: savedData.nama_mahasiswa,
         nim: savedData.nim, 
         judul_ta: savedData.judul_ta,
         hari_tanggal: savedData.hari_tanggal,
         ruang_waktu: savedData.ruang_waktu
      };

      // Ambil URL Template yang sudah diperbaiki
      const templatePath = getPdfTemplateUrl();
      console.log("Mencoba download template dari:", templatePath);

      await generateAndDownloadPDF(
          templatePath, 
          pdfData, 
          `Dokumen_${stageTitle.replace(/\s/g, '_')}.pdf`
      );

    } catch (err) {
      console.error(err);
      alert(`Gagal mendownload PDF. \nSystem mencoba mengambil dari: ${getPdfTemplateUrl()} \nPastikan file ada di folder 'public/templates/'.`);
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

      {/* CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative w-full bg-gray-50">
        
        <Header user={logic.user} activeMenu={logic.activeMenu} onMenuClick={() => logic.setMobileSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto pb-24">
            
            {/* VIEW: DASHBOARD */}
            {logic.activeMenu === 'Dashboard' && (
              <div className="space-y-8 animate-pop-in">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div style={{background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)'}} className="relative rounded-2xl p-8 h-64 flex flex-col justify-center overflow-hidden text-white shadow-lg hover:scale-[1.01] transition-transform duration-300">
                        <div className="absolute right-0 top-0 w-40 h-40 bg-white opacity-10 rounded-full transform translate-x-10 -translate-y-10"></div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold">Tugas Akhir</h3>
                            <p className="text-blue-50 text-sm mt-1 opacity-90">Progress: <b>{logic.taProgress?.percent}%</b></p>
                            <button onClick={() => logic.setActiveMenu('TugasAkhir')} className="mt-6 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-gray-50 transition-colors">Lihat Detail</button>
                        </div>
                    </div>
                    <div style={{background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)'}} className="relative rounded-2xl p-8 h-64 flex flex-col justify-center overflow-hidden text-white shadow-lg hover:scale-[1.01] transition-transform duration-300">
                        <div className="absolute right-0 bottom-0 w-40 h-40 bg-white opacity-10 rounded-full transform translate-x-10 translate-y-10"></div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold">Magang</h3>
                            <p className="text-purple-50 text-sm mt-1 opacity-90">Progress: <b>{logic.magangProgress?.percent}%</b></p>
                            <button onClick={() => logic.setActiveMenu('Magang')} className="mt-6 border-2 border-white text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-white hover:text-purple-600 transition-colors bg-transparent">Lihat Detail</button>
                        </div>
                    </div>
                 </div>

                 {/* Progress Bars */}
                 <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-8">Progress Akademik</h3>
                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between items-center mb-3"><span className="font-semibold text-gray-700">Tugas Akhir</span><span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${logic.taProgress?.percent === 100 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{logic.taProgress?.label}</span></div>
                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden"><div className="h-full rounded-full" style={styles.progressBarTA}></div></div>
                            <p className="text-xs text-gray-400 mt-2 text-right">{logic.taProgress?.percent}% Selesai</p>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-3"><span className="font-semibold text-gray-700">Magang</span><span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${logic.magangProgress?.percent === 100 ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>{logic.magangProgress?.label}</span></div>
                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden"><div className="h-full rounded-full" style={styles.progressBarMagang}></div></div>
                            <p className="text-xs text-gray-400 mt-2 text-right">{logic.magangProgress?.percent}% Selesai</p>
                        </div>
                    </div>
                 </div>
              </div>
            )}

            {/* VIEW: PENGUMUMAN */}
            {logic.activeMenu === 'Pengumuman' && (
              <div className="animate-pop-in">
                 {logic.loadingAnnounce ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <FiBell className="animate-bounce text-4xl mb-4 text-blue-500" />
                        <p>Mengambil data pengumuman...</p>
                    </div>
                 ) : logic.announcements.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-300"><p className="text-gray-400">Belum ada pengumuman saat ini.</p></div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {logic.announcements.map((item) => (
                           <div key={item.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full overflow-hidden hover:-translate-y-1">
                              <div className="h-3 w-full bg-gradient-to-r from-blue-500 to-indigo-600 flex-shrink-0"></div>
                              <div className="p-6 flex-1 flex flex-col">
                                  <div className="flex justify-between items-start mb-4">
                                      <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide border border-blue-100">{item.kategori || 'Umum'}</span>
                                      <span className="text-gray-400 text-xs flex items-center gap-1"><FiClock size={12} /> {formatDate(item.created_at)}</span>
                                  </div>
                                  <h3 onClick={() => setSelectedAnnouncement(item)} className="text-lg font-bold text-gray-800 leading-snug cursor-pointer group-hover:text-blue-600 transition-colors mb-3">{item.Judul}</h3>
                                  <p className="text-gray-500 text-sm mb-6 flex-1 leading-relaxed" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.isi_pengumuman}</p>
                                  <div className="mt-auto border-t border-gray-100 pt-4 flex justify-end">
                                      <button onClick={() => setSelectedAnnouncement(item)} className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all focus:outline-none">Baca Detail <FiChevronRight /></button>
                                  </div>
                              </div>
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
                   <h2 className="text-xl font-bold text-blue-900 mb-2">Tugas Akhir - Form & Dokumen</h2>
                   <p className="text-blue-700 text-sm">Lengkapi setiap tahapan tugas akhir di bawah ini.</p>
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
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-6 mb-8">
                   <h2 className="text-xl font-bold text-purple-900 mb-2">Program Magang Industri</h2>
                   <p className="text-purple-700 text-sm">Lengkapi tahapan magang mulai dari pengajuan hingga diseminasi laporan.</p>
                </div>
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
      {selectedAnnouncement && <AnnouncementModal item={selectedAnnouncement} onClose={() => setSelectedAnnouncement(null)} />}
      
      {/* FORM MODAL */}
      <FormModal 
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleSaveToDB}
          user={logic.user}
          initialData={localDB[currentStageId]} 
       />
    </div>
  );
}