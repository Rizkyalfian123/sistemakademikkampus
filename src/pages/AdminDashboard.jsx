import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiDatabase, FiEdit2, FiTrash2, FiFileText, FiCheckSquare, 
  FiEdit, FiPieChart, FiMenu, FiChevronDown, FiUser, FiLogOut, FiImage 
} from 'react-icons/fi';
import { supabase } from '../supabaseClient'; 

// Layout & Komponen
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { AnnouncementFormModal } from '../components/modals/AnnouncementFormModal'; 
import { OcrScannerView } from '../components/views/OCRScannerView';
import { VerifikasiView } from '../components/views/VerifikasiView';
import AdminImportMahasiswa from '../components/views/admin/AdminImportMahasiswa';
import AdminAnalyticsView from '../components/views/admin/AdminAnalyticsView';
import ChatbotTrainingCenterView from '../components/views/admin/ChatbotTrainingCenterView';
import BackupManagementView from '../components/views/admin/BackupManagementView.jsx';

// VIEWS (Halaman Konten)
import { PengumumanView } from '../components/views/PengumumanView'; 
import { MitraAdminView } from '../components/views/MitraAdminView';

// =========================================================
// KOMPONEN HEADER ADMIN (STYLE SUPER ADMIN - NO CROWN)
// =========================================================
const AdminHeader = ({ user, activeMenu, onMenuClick, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getInitials = (name) => {
    if (!name || name === 'Loading...') return 'AD';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

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
    if (!menu || menu === 'Dashboard') return 'Dashboard Admin';
    return menu.replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <header className="h-20 bg-white shadow-sm flex items-center justify-between px-4 md:px-8 z-10 shrink-0 border-b border-gray-100">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 md:hidden focus:outline-none transition-colors">
          <FiMenu size={24} />
        </button>
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">{getTitle(activeMenu)}</h2>
      </div>
      
      <div className="relative" ref={dropdownRef}>
        <div 
          className="flex items-center gap-3 md:gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors select-none" 
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-blue-600">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email || 'admin@kampus.ac.id'}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-400 shadow-sm flex items-center justify-center text-blue-700 font-bold text-sm">
              {getInitials(user?.name)}
            </div>
            <FiChevronDown className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-pop-in">
            <div className="px-4 py-2 border-b border-gray-100 mb-1 block md:hidden">
               <p className="text-sm font-bold text-blue-600">Administrator</p>
            </div>
            <button onClick={() => { setDropdownOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
              <FiUser className="text-gray-400" size={16} /> Pengaturan Akun
            </button>
            <div className="h-px bg-gray-100 my-1"></div>
            <button onClick={() => { setDropdownOpen(false); onLogout(); }} className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 font-medium transition-colors">
              <FiLogOut size={16} /> Logout Sistem
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

// =========================================================
// KOMPONEN UTAMA DASHBOARD
// =========================================================
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState({ name: 'Loading...', role: 'Admin', email: '', avatar: '' });

  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [stats, setStats] = useState({ total: 0, aktif: 0, draft: 0, views: 0 });
  const [loadingData, setLoadingData] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // STATE UNTUK POPUP LOGOUT
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  useEffect(() => {
    const sessionData = localStorage.getItem('user_akademik');
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      setUser({
        name: parsed.name || 'Administrator',
        role: parsed.role || 'Admin',
        email: parsed.email || 'admin@kampus.ac.id',
      });
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchRecentPengumuman = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('Pengumuman')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      setRecentAnnouncements(data || []);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { count: total } = await supabase.from('Pengumuman').select('*', { count: 'exact', head: true });
      const { count: aktif } = await supabase.from('Pengumuman').select('*', { count: 'exact', head: true }).eq('status', 'Approved');
      const { count: draft } = await supabase.from('Pengumuman').select('*', { count: 'exact', head: true }).eq('status', 'pending');

      setStats({
        total: total || 0,
        aktif: aktif || 0,
        draft: draft || 0,
        views: 8542 
      });
    } catch (error) {
      console.error("Stats Error:", error);
    }
  };

  useEffect(() => {
    if (activeMenu === 'Dashboard') {
      fetchRecentPengumuman();
      fetchStats();
    }
  }, [activeMenu]);

  // LOGIKA LOGOUT
  const handleLogoutClick = () => {
    setIsLogoutConfirmOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('user_akademik');
    navigate('/'); // Redirect ke Landing Page
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus pengumuman ini?")) return;
    try {
      await supabase.from('Pengumuman').delete().eq('id', id);
      fetchRecentPengumuman(); 
      fetchStats();
    } catch (error) { console.error(error); }
  };

  const handleSaveEdit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingData) {
        await supabase.from('Pengumuman').update(formData).eq('id', editingData.id);
      }
      setIsModalOpen(false);
      setEditingData(null);
      fetchRecentPengumuman(); 
    } catch (error) { console.error(error); } 
    finally { setIsSubmitting(false); }
  };

  const formatDateTable = (date) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatTimeTable = (date) => new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');

  const renderContent = () => {
    switch (activeMenu) {
      case 'Dashboard':
        return (
          <div className="space-y-8 animate-pop-in pb-10">
            <h2 className="text-2xl font-bold text-[#0f2a4a] flex items-center gap-2">Dashboard Admin 👋</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md hover:-translate-y-1 cursor-default">
                <div className="w-12 h-12 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center mb-4"><FiFileText size={20} /></div>
                <h3 className="text-3xl font-black text-gray-800">{stats.total}</h3>
                <p className="text-[13px] text-gray-500 font-medium mt-1">Total Pengumuman</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md hover:-translate-y-1 cursor-default">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mb-4"><FiCheckSquare size={20} /></div>
                <h3 className="text-3xl font-black text-gray-800">{stats.aktif}</h3>
                <p className="text-[13px] text-gray-500 font-medium mt-1">Approved</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md hover:-translate-y-1 cursor-default">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4"><FiEdit size={20} /></div>
                <h3 className="text-3xl font-black text-gray-800">{stats.draft}</h3>
                <p className="text-[13px] text-gray-500 font-medium mt-1">Pending</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md hover:-translate-y-1 cursor-default">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center mb-4"><FiPieChart size={20} /></div>
                <h3 className="text-3xl font-black text-gray-800">{stats.views}</h3>
                <p className="text-[13px] text-gray-500 font-medium mt-1">Total Views</p>
              </div>
            </div>

            <div className="bg-white rounded-[20px] border border-gray-100 shadow-md overflow-hidden flex flex-col">
              <div className="px-7 py-5 flex justify-between items-center bg-white border-b border-gray-50">
                <h3 className="text-lg font-bold text-gray-800">Pengumuman Terbaru</h3>
                <button onClick={() => setActiveMenu('Pengumuman')} className="text-blue-600 text-sm font-bold hover:text-blue-800 transition-colors flex items-center gap-1">Lihat Semua &rarr;</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-blue-600 text-white text-[11px] uppercase tracking-wider font-bold">
                    <tr>
                      <th className="px-7 py-4 w-36">Tanggal</th>
                      <th className="px-7 py-4">Judul Pengumuman</th>
                      <th className="px-7 py-4 text-center w-32">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loadingData ? (
                      <tr><td colSpan="3" className="text-center py-10 text-gray-400 text-xs italic animate-pulse">Memproses...</td></tr>
                    ) : recentAnnouncements.map((row) => (
                      <tr key={row.id} className="hover:bg-blue-50/40 transition-colors group">
                        <td className="px-7 py-4 align-middle">
                          <div className="text-[13px] font-bold text-gray-800">{formatDateTable(row.created_at)}</div>
                          <div className="text-[11px] text-gray-500 font-medium mt-0.5 uppercase">{formatTimeTable(row.created_at)} WIB</div>
                        </td>
                        <td className="px-7 py-4 align-middle">
                          <div className="text-[14px] font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">{row.Judul}</div>
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded border border-blue-100 uppercase tracking-tighter">{row.kategori || 'Umum'}</span>
                        </td>
                        <td className="px-7 py-4 align-middle text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => { setEditingData(row); setIsModalOpen(true); }} className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"><FiEdit2 size={14} /></button>
                            <button onClick={() => handleDelete(row.id)} className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"><FiTrash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'Pengumuman': return <PengumumanView user={user} />;
      case 'Mitra': return <MitraAdminView user={user} />;
      case 'ImportMahasiswa': return <AdminImportMahasiswa />;
      case 'OCRScanner': return <OcrScannerView />;
      case 'Verifikasi': return <VerifikasiView />;
      case 'Analytics': return <AdminAnalyticsView />;
      case 'Chatbot': return <ChatbotTrainingCenterView />;
      case 'Backup': return <BackupManagementView />;
      default: return <PlaceholderView name={activeMenu} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 overflow-hidden relative">
      {/* Sidebar - Menggunakan handleLogoutClick */}
      <AdminSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} onLogout={handleLogoutClick} />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative w-full bg-gray-50">
        {/* Header - Menggunakan handleLogoutClick */}
        <AdminHeader user={user} activeMenu={activeMenu} onMenuClick={() => setIsSidebarOpen(true)} onLogout={handleLogoutClick} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto pb-24">
            {renderContent()}
          </div>
        </main>
      </div>

      <AnnouncementFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSaveEdit} initialData={editingData} isLoading={isSubmitting} />

      {/* ========================================================= */}
      {/* MODAL KONFIRMASI LOGOUT DENGAN BACKGROUND GELAP */}
      {/* ========================================================= */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-pop-in">
            <div className="p-8 text-center">
              {/* Icon Keluar */}
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                <FiLogOut size={28} />
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">Anda yakin ingin keluar?</h3>
              <p className="text-gray-500 text-sm leading-relaxed px-2">
                Sesi Anda akan dihentikan dan Anda akan dialihkan kembali ke halaman utama.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex border-t border-gray-100">
              <button 
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="flex-1 px-6 py-4 text-xs font-bold text-gray-400 hover:bg-gray-50 transition-colors border-r border-gray-100 uppercase tracking-widest"
              >
                Batal
              </button>
              <button 
                onClick={confirmLogout}
                className="flex-1 px-6 py-4 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors uppercase tracking-widest"
              >
                Ya, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PlaceholderView = ({ name }) => (
  <div className="flex flex-col items-center justify-center py-32 text-gray-400 animate-pop-in">
    <FiDatabase size={64} className="mb-4 text-gray-300 opacity-50" />
    <h2 className="text-xl font-bold text-gray-500">Menu {name}</h2>
    <p className="text-sm mt-2">Halaman ini sedang dalam tahap pengembangan.</p>
  </div>
);

export default AdminDashboard;