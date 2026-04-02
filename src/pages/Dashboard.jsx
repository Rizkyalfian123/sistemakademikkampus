import React, { useState, useEffect, useRef } from 'react';
import { 
  FiFileText, FiBriefcase, FiBell, FiClock, FiChevronRight,
  FiSearch, FiImage, FiX, FiMenu, FiChevronDown, FiUser, FiMail, FiLogOut, FiFolder
} from 'react-icons/fi';

// --- IMPORTS COMPONENTS ---
import { Sidebar } from '../components/layout/Sidebar';
import { StageCard } from '../components/cards/StageCard';
import { ChatWidget } from '../components/shared/ChatWidget';
import { FormModal } from '../components/modals/FormModal';

// --- IMPORTS LOGIC & UTILS ---
import { useDashboardLogic } from '../hooks/useDashboardLogic';
import { generateAndDownloadPDF } from '../utils/pdfGenerator';
import { supabase } from '../supabaseClient'; 

// =========================================================
// KOMPONEN HEADER
// =========================================================
const Header = ({ user, activeMenu, onMenuClick, onOpenEmail, onOpenProfile, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTitle = (menu) => {
    if (!menu) return 'Dashboard';
    if (menu === 'Dashboard') return 'Dashboard Mahasiswa';
    return menu.replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <header className="h-20 bg-white shadow-sm flex items-center justify-between px-4 md:px-8 z-10 shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 md:hidden focus:outline-none transition-colors">
          <FiMenu size={24} />
        </button>
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">{getTitle(activeMenu)}</h2>
      </div>
      
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center gap-3 md:gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors select-none" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-800">{user?.name || 'Mahasiswa'}</p>
            <p className="text-xs text-gray-500">{user?.nim || user?.role || '-'}</p>
          </div>
          <div className="flex items-center gap-2">
            <img src={user?.avatar || 'https://via.placeholder.com/40'} alt="Profile" className="w-10 h-10 rounded-full border-2 border-gray-100 shadow-sm object-cover bg-gray-200" />
            <FiChevronDown className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-pop-in">
            <button onClick={() => { setDropdownOpen(false); if(onOpenProfile) onOpenProfile(); }} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
              <FiUser className="text-gray-400" size={16} /> Ubah Profil
            </button>
            <button onClick={() => { setDropdownOpen(false); if(onOpenEmail) onOpenEmail(); }} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
              <FiMail className="text-gray-400" size={16} /> Daftarkan Email
            </button>
            <div className="h-px bg-gray-100 my-1"></div>
            <button onClick={() => { setDropdownOpen(false); if(onLogout) onLogout(); }} className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 font-medium transition-colors">
              <FiLogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

// =========================================================
// KOMPONEN EMAIL MODAL 
// =========================================================
const EmailModal = ({ isOpen, onClose, onSubmit, currentEmail, isLoading }) => {
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (isOpen) setEmail(currentEmail || '');
  }, [isOpen, currentEmail]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-pop-in">
        <div className="p-6 md:p-8 bg-blue-700 text-white shrink-0 relative">
          <h2 className="text-xl font-bold leading-snug uppercase pr-12 flex items-center gap-2">
            <FiMail size={22} /> Daftarkan Email
          </h2>
          <button onClick={onClose} className="absolute top-6 right-6 hover:bg-blue-600 p-2 rounded-full transition-all text-white flex items-center justify-center">
            <FiX size={24} />
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(email); }} className="flex flex-col flex-grow">
          <div className="p-6 md:p-8 overflow-y-auto flex-grow bg-white custom-scrollbar">
            <div className="mb-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Alamat Email Anda</label>
              <input 
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="contoh: budi@gmail.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
                {currentEmail ? "Email Anda sudah terdaftar. Anda bisa menggantinya di sini." : "Tambahkan email aktif untuk menerima notifikasi akademik penting."}
              </p>
            </div>
          </div>
          <div className="px-6 py-4 flex justify-end gap-3 bg-gray-50 border-t border-gray-100 shrink-0">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-200 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={isLoading} className="px-8 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/30 disabled:bg-blue-400">
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// =========================================================
// KOMPONEN UTAMA DASHBOARD
// =========================================================
export default function Dashboard() {
  const logic = useDashboardLogic();

  console.log("DATA PENGUMUMAN DARI LOGIC:", logic.announcements);

  const [selectedAnnounce, setSelectedAnnounce] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentStageId, setCurrentStageId] = useState(null);
  const [localDB, setLocalDB] = useState({}); 
  const [realProfile, setRealProfile] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterKategori, setFilterKategori] = useState('-- Semua --');

  // STATE MODAL EMAIL
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);

useEffect(() => {
    const catatKunjungan = async () => {
      // Kita hapus dulu check sessionStorage sementara buat ngetes
      // if (sessionStorage.getItem('sudah_dicatat_kunjungan')) return;

      let tipeDevice = 'Desktop';
      if (window.innerWidth < 768) tipeDevice = 'Mobile';
      else if (window.innerWidth < 1024) tipeDevice = 'Tablet';

      console.log("CCTV: Mencoba mencatat kunjungan...");

      try {
        const { data, error } = await supabase
          .from('log_pengunjung')
          .insert([{ device_type: tipeDevice }]);

        if (error) {
          // INI PENTING: Liat error-nya di Console F12
          console.error("CCTV GAGAL:", error.message, error.details, error.hint);
        } else {
          console.log("CCTV BERHASIL: Data masuk!", data);
          sessionStorage.setItem('sudah_dicatat_kunjungan', 'true');
        }
      } catch (err) {
        console.error("CCTV CRASH:", err);
      }
    };

    catatKunjungan();
  }, []);
  useEffect(() => {
    const fetchRealProfile = async () => {
      const sessionData = localStorage.getItem('user_akademik');
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        
        const { data: mhsData } = await supabase.from('data_mahasiswa').select('nama_lengkap, nim').eq('id_user', parsed.id).single();
        const { data: userData } = await supabase.from('user').select('Email').eq('id', parsed.id).single();

        setRealProfile({
          nama_lengkap: mhsData?.nama_lengkap || '',
          nim: mhsData?.nim || '-',
          email: userData?.Email || ''
        }); 
      }
    };
    fetchRealProfile();
  }, []);

  const activeUser = {
    ...logic.user,
    name: realProfile?.nama_lengkap ? realProfile.nama_lengkap : logic.user?.name,
    nim: realProfile?.nim ? realProfile.nim : '-'
  };

  useEffect(() => {
    const fetchProgressFromCloud = async () => {
      const sessionData = localStorage.getItem('user_akademik');
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        
        const { data } = await supabase.from('progress_akademik').select('stage_id, data_json').eq('user_id', parsed.id);

        if (data) {
          const formattedDB = {};
          data.forEach(item => { 
            formattedDB[item.stage_id] = item.data_json; 
            if (logic.handleUpdateStatus) {
              logic.handleUpdateStatus(item.stage_id, 'TA'); 
            }
          });
          setLocalDB(formattedDB);
        }
      }
    };
    fetchProgressFromCloud();
  }, [logic.user?.id]); 

  // --- KODE CCTV 2: PELACAK BACA PENGUMUMAN ---
  const handleBukaPengumuman = async (item) => {
    setSelectedAnnounce(item); // Buka modal pengumuman di UI

    // Catat log secara diam-diam di background
    try {
      let tipeDevice = 'Desktop';
      const lebar = window.innerWidth;
      if (lebar < 768) tipeDevice = 'Mobile';
      else if (lebar < 1024) tipeDevice = 'Tablet';

      await supabase.from('log_pengunjung').insert([{ 
        device_type: tipeDevice,
        pengumuman_id: item.id // Mengirim ID spesifik untuk Top 5 & Kategori
      }]);
    } catch (error) {
      console.error("Gagal mencatat log pengumuman", error);
    }
  };

  const formatDateCard = (date) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatDateModal = (date) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const styles = {
    glass: { backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)' },
    progressBarTA: { background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)', width: `${logic.taProgress?.percent || 0}%`, transition: 'width 1s ease-in-out' },
    progressBarMagang: { background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)', width: `${logic.magangProgress?.percent || 0}%`, transition: 'width 1s ease-in-out' }
  };

  const scrollToStage = (stageId) => {
    setTimeout(() => {
      const element = document.getElementById(`stage-target-${stageId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  const handleOpenForm = (stageId) => {
    setCurrentStageId(stageId);
    setIsFormOpen(true);
  };

  const handleSaveToDB = async (dataInput) => {
    try {
      const sessionData = localStorage.getItem('user_akademik');
      const parsedUser = JSON.parse(sessionData);

      const { error } = await supabase.from('progress_akademik').upsert({
          user_id: parsedUser.id, stage_id: currentStageId, data_json: dataInput, updated_at: new Date()
        }, { onConflict: 'user_id, stage_id' });

      if (error) throw error;

      setLocalDB(prev => ({ ...prev, [currentStageId]: dataInput }));
      logic.handleUpdateStatus(currentStageId, 'TA'); 
      alert("Data berhasil disinkronisasi ke Cloud! 🚀");
      setIsFormOpen(false);
    } catch (err) {
      console.error("Error Simpan Cloud:", err);
      alert("Gagal menyimpan ke database: " + err.message);
    }
  };

  const handleSaveEmail = async (newEmail) => {
    setIsSavingEmail(true);
    try {
      const sessionData = localStorage.getItem('user_akademik');
      const parsedUser = JSON.parse(sessionData);

      const { error } = await supabase.from('user').update({ Email: newEmail }).eq('id', parsedUser.id);
      if (error) throw error;

      setRealProfile(prev => ({ ...prev, email: newEmail }));
      alert("Alamat email berhasil disimpan!");
      setIsEmailModalOpen(false);
    } catch (err) {
      alert("Terjadi kesalahan saat menyimpan email: " + err.message);
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleDownloadPDF = async (id, filename, title) => {
    try {
      const savedData = localDB[id];
      if (!savedData) {
        alert(`Data untuk ${title} belum diisi! Silakan klik 'Isi Data' dan 'Simpan' terlebih dahulu.`);
        return;
      }

      const split1 = (savedData.dosen_penguji_1 || ' | ').split('|');
      const split2 = (savedData.dosen_penguji_2 || ' | ').split('|');
      const split3 = (savedData.dosen_penguji_3 || ' | ').split('|');

      const pdfData = {
         nama_mahasiswa: savedData.nama_mahasiswa, nim: savedData.nim, judul_ta: savedData.judul_ta, hari_tanggal: savedData.hari_tanggal, ruang_waktu: savedData.ruang_waktu,
         nama_penguji_1: split1[0]?.trim(), nip_penguji_1: split1[1]?.trim(), nama_penguji_2: split2[0]?.trim(), nip_penguji_2: split2[1]?.trim(), nama_penguji_3: split3[0]?.trim(), nip_penguji_3: split3[1]?.trim()
      };

      const baseUrl = import.meta.env.BASE_URL;
      const targetFile = filename || 'berita_acara.pdf'; 
      const templatePath = `${baseUrl}/templates/${targetFile}`.replace(/\/+/g, '/');
      const outputFilename = `${title.replace(/\s/g, '_')}.pdf`;

      await generateAndDownloadPDF(templatePath, pdfData, outputFilename);
    } catch (err) {
      console.error("Error Download PDF:", err);
      alert(`Gagal mendownload. Pastikan file '${filename}' tersedia di folder public/templates/`);
    }
  };

  const filteredAnnouncements = (logic.announcements || []).filter((item) => {
    const matchSearch = item.Judul?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchKategori = filterKategori === '-- Semua --' || item.kategori === filterKategori;
    return matchSearch && matchKategori;
  });
  
  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 overflow-hidden relative">
      <style>{`
        @keyframes popIn { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } } 
        .animate-pop-in { animation: popIn 0.2s cubic-bezier(0.165, 0.84, 0.44, 1) forwards; }
        [id^="stage-target-"] { scroll-margin-top: 100px; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
      `}</style>

      <Sidebar 
        activeMenu={logic.activeMenu} setActiveMenu={logic.setActiveMenu}
        isOpen={logic.mobileSidebarOpen} setIsOpen={logic.setMobileSidebarOpen}
        onLogout={logic.logout} taStages={logic.taStages} magangStages={logic.magangStages}
        onStageClick={scrollToStage} 
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative w-full bg-gray-50">
        
        <Header 
            user={activeUser} 
            activeMenu={logic.activeMenu} 
            onMenuClick={() => logic.setMobileSidebarOpen(true)} 
            onOpenProfile={() => alert("Fitur Ubah Profil segera hadir!")} 
            onOpenEmail={() => setIsEmailModalOpen(true)}
            onLogout={logic.logout} 
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto pb-24">
            
            {logic.activeMenu === 'Dashboard' && (
              <div className="space-y-8 animate-pop-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div style={{background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)'}} className="relative rounded-2xl p-8 h-64 flex flex-col justify-center overflow-hidden text-white shadow-lg hover:scale-[1.01] transition-transform duration-300">
                    <div className="absolute right-0 top-0 w-40 h-40 bg-white opacity-10 rounded-full transform translate-x-10 -translate-y-10"></div>
                    <div className="relative z-10">
                      <div className="flex items-start gap-4 mb-4">
                        <div style={styles.glass} className="p-3 rounded-xl"><FiFileText size={28} /></div>
                        <div>
                          <h3 className="text-2xl font-bold">Tugas Akhir</h3>
                          <p className="text-blue-50 text-sm mt-1 opacity-90">Progress: <b>{logic.taProgress?.percent}%</b></p>
                        </div>
                      </div>
                      <button onClick={() => logic.setActiveMenu('TugasAkhir')} className="mt-6 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-gray-50 transition-colors">Lihat Detail</button>
                    </div>
                  </div>

                  <div style={{background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)'}} className="relative rounded-2xl p-8 h-64 flex flex-col justify-center overflow-hidden text-white shadow-lg hover:scale-[1.01] transition-transform duration-300">
                    <div className="absolute right-0 bottom-0 w-40 h-40 bg-white opacity-10 rounded-full transform translate-x-10 translate-y-10"></div>
                    <div className="relative z-10">
                      <div className="flex items-start gap-4 mb-4">
                        <div style={styles.glass} className="p-3 rounded-xl"><FiBriefcase size={28} /></div>
                        <div>
                          <h3 className="text-2xl font-bold">Magang</h3>
                          <p className="text-purple-50 text-sm mt-1 opacity-90">Progress: <b>{logic.magangProgress?.percent}%</b></p>
                        </div>
                      </div>
                      <button onClick={() => logic.setActiveMenu('Magang')} className="mt-6 border-2 border-white/50 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-white hover:text-purple-600 transition-colors bg-transparent">Lihat Detail</button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-8">Progress Akademik</h3>
                  <div className="space-y-8">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-gray-700">Tugas Akhir</span>
                        <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${logic.taProgress?.percent === 100 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{logic.taProgress?.label}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full" style={styles.progressBarTA}></div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2 text-right">{logic.taProgress?.percent}% Selesai</p>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-gray-700">Magang</span>
                        <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${logic.magangProgress?.percent === 100 ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>{logic.magangProgress?.label}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full" style={styles.progressBarMagang}></div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2 text-right">{logic.magangProgress?.percent}% Selesai</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {logic.activeMenu === 'Pengumuman' && (
              <div className="animate-pop-in">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Pengumuman</h2>
                  <p className="text-sm text-gray-400 font-medium">Daftar Pengumuman Kampus Terkini</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-end mb-6">
                  <div className="flex-1 w-full">
                    <label className="text-[10px] font-bold text-gray-400 mb-2 block uppercase tracking-wider">Cari Pengumuman</label>
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari berdasarkan judul..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                    </div>
                  </div>
                  <div className="w-full md:w-64">
                    <label className="text-[10px] font-bold text-gray-400 mb-2 block uppercase tracking-wider">Kategori</label>
                    <select value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer font-semibold text-gray-600">
                      <option>-- Semua --</option><option>Umum</option><option>Akademik</option><option>Prestasi</option><option>Beasiswa</option>
                    </select>
                  </div>
                </div>

                {logic.loadingAnnounce ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400"><FiBell className="animate-bounce text-4xl mb-4 text-blue-500" /><p>Mengambil data pengumuman...</p></div>
                ) : filteredAnnouncements.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-300"><p className="text-gray-400">Tidak ada pengumuman yang sesuai dengan pencarian.</p></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAnnouncements.map((item) => (
                      <div key={item.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full overflow-hidden hover:-translate-y-1">
                        
                        <div 
                          className="w-full h-40 md:h-48 flex-shrink-0 cursor-pointer relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 border-b border-gray-100" 
                          onClick={() => handleBukaPengumuman(item)}
                        >
                          <div className="absolute inset-0 flex items-center justify-center text-white/20 group-hover:scale-110 transition-transform duration-500">
                            <FiFolder size={72} strokeWidth={1.5} />
                          </div>
                          {(item.image_url || item.gambar) && (
                            <img 
                              src={item.image_url || item.gambar} 
                              alt={item.Judul} 
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 z-10"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          )}
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-4">
                              <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide border border-blue-100">{item.kategori || 'UMUM'}</span>
                              <span className="text-gray-400 text-xs flex items-center gap-1"><FiClock size={12} /> {formatDateCard(item.created_at)}</span>
                          </div>
                          <h3 onClick={() => handleBukaPengumuman(item)} className="text-lg font-bold text-gray-800 leading-snug cursor-pointer group-hover:text-blue-600 transition-colors mb-3">{item.Judul}</h3>
                          <p className="text-gray-500 text-sm mb-6 flex-1 leading-relaxed" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.isi_pengumuman}</p>
                          <div className="mt-auto border-t border-gray-100 pt-4 flex justify-end">
                             <button onClick={() => handleBukaPengumuman(item)} className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all focus:outline-none">Baca Detail <FiChevronRight /></button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {logic.activeMenu === 'TugasAkhir' && (
              <div className="space-y-6 animate-pop-in">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
                   <h2 className="text-xl font-bold text-blue-900 mb-2">Tugas Akhir - Form & Dokumen</h2>
                   <p className="text-blue-700 text-sm">Lengkapi setiap tahapan tugas akhir di bawah ini.</p>
                </div>
                <div className="space-y-6">
                  {logic.taStages.map(stage => (
                    <div id={`stage-target-${stage.id}`} key={stage.id} className="transition-all">
                      <StageCard stage={stage} icon={FiFileText} themeColor="bg-[#0f2a4a]" onUpdate={handleOpenForm} onDownload={handleDownloadPDF} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {logic.activeMenu === 'Magang' && (
              <div className="space-y-6 animate-pop-in">
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-6 mb-8">
                   <h2 className="text-xl font-bold text-purple-900 mb-2">Program Magang Industri</h2>
                   <p className="text-purple-700 text-sm">Lengkapi tahapan magang mulai dari pengajuan hingga diseminasi laporan.</p>
                </div>
                <div className="space-y-6">
                  {logic.magangStages.map(stage => (
                     <div id={`stage-target-${stage.id}`} key={stage.id} className="transition-all">
                        <StageCard stage={stage} icon={FiBriefcase} themeColor="bg-purple-900" onUpdate={handleOpenForm} onDownload={handleDownloadPDF} />
                     </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      <ChatWidget announcements={logic.announcements} taPercent={logic.taProgress?.percent} magangPercent={logic.magangProgress?.percent} />
      
      {/* MODAL PENGUMUMAN */}
      {selectedAnnounce && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-pop-in" style={{ maxHeight: '75vh' }}>
            <div className="p-6 md:p-8 bg-blue-700 text-white shrink-0 relative">
              <div className="flex items-center mb-4"><span className="border border-white/80 text-white text-[12px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">{selectedAnnounce.kategori || 'UMUM'}</span></div>
              <h2 className="text-xl md:text-2xl font-bold leading-snug uppercase pr-12">📢 {selectedAnnounce.Judul}</h2>
              <div className="flex items-center gap-2 text-blue-100 text-sm mt-3 font-medium"><FiClock size={16} /> <span>{formatDateModal(selectedAnnounce.created_at)}</span></div>
              <button onClick={() => setSelectedAnnounce(null)} className="absolute top-6 right-6 hover:bg-blue-600 p-2 rounded-full transition-all text-white flex items-center justify-center"><FiX size={24} /></button>
            </div>
            <div className="p-6 md:p-8 overflow-y-auto flex-grow bg-white custom-scrollbar">
              {(selectedAnnounce.image_url || selectedAnnounce.gambar) && (
                (selectedAnnounce.image_url || selectedAnnounce.gambar).toLowerCase().includes('qr') ? (
                  <div className="mb-8 flex flex-col items-center justify-center p-8 bg-blue-50/30 rounded-3xl border-2 border-dashed border-blue-100">
                    <div className="bg-white p-4 rounded-2xl shadow-xl border border-blue-50"><img src={selectedAnnounce.image_url || selectedAnnounce.gambar} alt="QR" className="w-40 h-40 object-contain" /></div>
                    <div className="mt-4 text-center"><p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em]">E-Signature Verified</p><p className="text-[10px] text-gray-400 mt-1">Scan verifikasi</p></div>
                  </div>
                ) : (
                  <div className="mb-6 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 group relative">
                    <img src={selectedAnnounce.image_url || selectedAnnounce.gambar} alt="Lampiran" className="w-full h-auto object-contain max-h-[450px] mx-auto" onError={(e) => { e.target.style.display = 'none'; }} />
                    <div className="bg-gray-50/80 backdrop-blur-sm py-2 px-4 border-t border-gray-100 text-center"><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest"><FiImage className="inline" /> Lampiran Digital</p></div>
                  </div>
                )
              )}
              <div className="text-gray-700 text-[15px] leading-[1.8] whitespace-pre-wrap break-words">{selectedAnnounce.isi_pengumuman}</div>
              <div className="mt-10 pt-6 border-t border-gray-100 text-gray-400 text-[13px] italic text-center">Dipublikasikan secara resmi.</div>
            </div>
            <div className="px-6 py-4 flex justify-end bg-gray-50 border-t border-gray-100 shrink-0">
               <button onClick={() => setSelectedAnnounce(null)} className="px-8 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-lg">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EMAIL */}
      <EmailModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} onSubmit={handleSaveEmail} currentEmail={realProfile?.email} isLoading={isSavingEmail} />

      {/* MODAL FORM TUGAS AKHIR / MAGANG */}
      <FormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={handleSaveToDB} user={activeUser} initialData={localDB[currentStageId]} />
    </div>
  );
}