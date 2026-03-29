import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiDatabase, FiEdit2, FiTrash2, FiFileText, FiCheckSquare, FiEdit, FiPieChart } from 'react-icons/fi';
import { supabase } from '../supabaseClient'; 

// Layout & Komponen
import { Header } from '../components/layout/AdminHeader';
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
import { MitraAdminView } from '../components/views/MitraAdminView'; // IMPORT BARU

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [user, setUser] = useState({ name: 'Loading...', role: 'Admin', email: '', avatar: '' });

  // State Pengumuman & Statistik
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [stats, setStats] = useState({ total: 0, aktif: 0, draft: 0, views: 0 });
  const [loadingData, setLoadingData] = useState(false);
  
  // State Modal Edit (Khusus untuk Pengumuman di Dashboard)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ambil 5 Pengumuman Terbaru
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
      console.error("Error fetching recent data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  // Ambil Statistik Real-time
  const fetchStats = async () => {
    try {
      const { count: totalCount } = await supabase.from('Pengumuman').select('*', { count: 'exact', head: true });
      const { count: aktifCount } = await supabase.from('Pengumuman').select('*', { count: 'exact', head: true }).eq('kategori', 'Umum');
      const { count: draftCount } = await supabase.from('Pengumuman').select('*', { count: 'exact', head: true }).eq('kategori', 'Akademik');

      setStats({
        total: totalCount || 0,
        aktif: aktifCount || 0,
        draft: draftCount || 0,
        views: 8542 
      });
    } catch (error) {
      console.error("Error mengambil statistik:", error);
    }
  };

  useEffect(() => {
    if (activeMenu === 'Dashboard') {
      fetchRecentPengumuman();
      fetchStats();
    }
  }, [activeMenu]);

  useEffect(() => {
    const sessionData = localStorage.getItem('user_akademik');
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      setUser({
        name: parsed.name || 'Administrator',
        role: parsed.role || 'Admin',
        email: parsed.email || 'admin@kampus.ac.id',
        avatar: parsed.avatar || `https://ui-avatars.com/api/?name=${parsed.name || 'Admin'}&background=0f2a4a&color=fff`
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user_akademik');
    navigate('/login');
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus pengumuman ini?")) return;
    try {
      await supabase.from('Pengumuman').delete().eq('id', id);
      fetchRecentPengumuman(); 
      fetchStats();
    } catch (error) {
      console.error("Error deleting data:", error);
    }
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
    } catch (error) {
      console.error("Error saving data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTable = (date) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatTimeTable = (date) => new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');

  const renderContent = () => {
    switch (activeMenu) {
      case 'Dashboard':
        return (
          <div className="space-y-8 animate-pop-in pb-10">
            <h2 className="text-2xl font-bold text-[#0f2a4a] flex items-center gap-2">Dashboard Admin 👋</h2>
            
            {/* STATS CARDS REAL-TIME */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center transition-all hover:shadow-md hover:-translate-y-1 cursor-default">
                <div className="w-12 h-12 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center mb-4">
                  <FiFileText size={20} />
                </div>
                <h3 className="text-3xl font-black text-gray-800">{stats.total}</h3>
                <p className="text-[13px] text-gray-500 font-medium mt-1">Total Pengumuman</p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center transition-all hover:shadow-md hover:-translate-y-1 cursor-default">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mb-4">
                  <FiCheckSquare size={20} />
                </div>
                <h3 className="text-3xl font-black text-gray-800">{stats.aktif}</h3>
                <p className="text-[13px] text-gray-500 font-medium mt-1">Aktif</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center transition-all hover:shadow-md hover:-translate-y-1 cursor-default">
                <div className="w-12 h-12 bg-gray-50 text-gray-600 rounded-xl flex items-center justify-center mb-4">
                  <FiEdit size={20} />
                </div>
                <h3 className="text-3xl font-black text-gray-800">{stats.draft}</h3>
                <p className="text-[13px] text-gray-500 font-medium mt-1">Draft</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center transition-all hover:shadow-md hover:-translate-y-1 cursor-default">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center mb-4">
                  <FiPieChart size={20} />
                </div>
                <h3 className="text-3xl font-black text-gray-800">{stats.views}</h3>
                <p className="text-[13px] text-gray-500 font-medium mt-1">Total Views</p>
              </div>
            </div>

            {/* TABEL PENGUMUMAN TERBARU */}
            <div className="bg-white rounded-[20px] border border-gray-100 shadow-md overflow-hidden flex flex-col">
              <div className="px-7 py-5 flex justify-between items-center bg-white">
                <h3 className="text-lg font-bold text-gray-800">Pengumuman Terbaru</h3>
                <button 
                  onClick={() => setActiveMenu('Pengumuman')} 
                  className="text-blue-600 text-sm font-bold hover:text-blue-800 transition-colors flex items-center gap-1"
                >
                  Lihat Semua &rarr;
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] uppercase tracking-[0.15em] font-bold">
                    <tr>
                      <th className="px-7 py-4 w-36">Tanggal</th>
                      <th className="px-7 py-4">Judul Pengumuman</th>
                      <th className="px-7 py-4 text-center w-32">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loadingData ? (
                      <tr><td colSpan="3" className="text-center py-10 text-gray-400 text-sm">Memproses...</td></tr>
                    ) : recentAnnouncements.length === 0 ? (
                      <tr><td colSpan="3" className="text-center py-10 text-gray-400 text-sm">Kosong.</td></tr>
                    ) : (
                      recentAnnouncements.map((row) => (
                        <tr key={row.id} className="hover:bg-blue-50/40 transition-colors group">
                          <td className="px-7 py-4 align-middle">
                            <div className="text-[13px] font-bold text-gray-800">{formatDateTable(row.created_at)}</div>
                            <div className="text-[11px] text-gray-500 font-medium mt-0.5">{formatTimeTable(row.created_at)} WIB</div>
                          </td>
                          <td className="px-7 py-4 align-middle">
                            <div className="text-[14px] font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                               {row.Judul}
                            </div>
                            <div className="flex gap-2">
                              <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md uppercase tracking-wider border border-blue-100">
                                {row.kategori || 'Umum'}
                              </span>
                            </div>
                          </td>
                          <td className="px-7 py-4 align-middle text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => { setEditingData(row); setIsModalOpen(true); }} className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"><FiEdit2 size={14} /></button>
                              <button onClick={() => handleDelete(row.id)} className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"><FiTrash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      
      case 'Pengumuman':
        return <PengumumanView user={user} />;

      case 'Mitra':
        return <MitraAdminView user={user} />;

      case 'ImportMahasiswa':
        return <AdminImportMahasiswa />;
        
      case 'OCRScanner':
        return <OcrScannerView />;
        
      case 'Verifikasi':
        return <VerifikasiView />;

      case 'Analytics':
        return <AdminAnalyticsView />;

      case 'Chatbot':
        return <ChatbotTrainingCenterView />;

      case 'Backup':
        return <BackupManagementView />;

      default:
        return <PlaceholderView name={activeMenu} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 overflow-hidden relative">
      <AdminSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative w-full bg-gray-50">
        <Header user={user} activeMenu={activeMenu} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto pb-24">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Modal khusus Pengumuman (jika sedang di tab Dashboard) */}
      <AnnouncementFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleSaveEdit} 
        initialData={editingData} 
        isLoading={isSubmitting} 
      />
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