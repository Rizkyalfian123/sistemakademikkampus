import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiDatabase, FiEdit2, FiTrash2, FiUsers, FiActivity, FiCheckSquare, 
  FiBell, FiMenu, FiChevronDown, FiUser, FiLogOut, FiLoader 
} from 'react-icons/fi';
import { supabase } from '../supabaseClient'; 

// Import Sidebar Super Admin
import { SuperAdminSidebar } from '../components/layout/SuperAdminSidebar';
import { PendingTasksView } from '../components/views/admin/PendingTasksView';
import { PengumumanView } from '../components/views/PengumumanView';

// =========================================================
// KOMPONEN HEADER SUPER ADMIN
// =========================================================
const SuperAdminHeader = ({ user, activeMenu, onMenuClick, onLogout }) => {
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
    if (menu === 'RoleManagement') return 'Role Management';
    if (menu === 'AuditLog') return 'Audit Log';
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
        <div className="flex items-center gap-3 md:gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors select-none" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-yellow-600">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email || 'admin@kampus.ac.id'}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-yellow-100 border-2 border-yellow-400 shadow-sm flex items-center justify-center text-lg">👑</div>
            <FiChevronDown className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-pop-in">
            <div className="px-4 py-2 border-b border-gray-100 mb-1 block md:hidden">
               <p className="text-sm font-bold text-yellow-600">Super Admin</p>
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
// KOMPONEN PLACEHOLDER
// =========================================================
const PlaceholderView = ({ name }) => (
  <div className="flex flex-col items-center justify-center py-32 text-gray-400 animate-pop-in">
    <FiDatabase size={64} className="mb-4 text-gray-300 opacity-50" />
    <h2 className="text-xl font-bold text-gray-500">Menu {name}</h2>
    <p className="text-sm mt-2">Halaman ini sedang dalam tahap pengembangan.</p>
  </div>
);

// =========================================================
// KOMPONEN UTAMA SUPER ADMIN DASHBOARD
// =========================================================
export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState({ name: 'Super Admin', email: '' });
  
  const [adminsList, setAdminsList] = useState([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  // STATE STATS REAL-TIME
  const [stats, setStats] = useState({ 
    totalAdmin: 0, 
    adminOnline: 0, 
    totalPengumuman: 0, 
    pendingTasks: 0 
  });

  // STATE UNTUK POPUP LOGOUT
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  useEffect(() => {
    const sessionData = localStorage.getItem('user_akademik');
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      setUser({ name: parsed.name, email: parsed.email });
    }

    fetchAdminsData();
    fetchPendingTasks();
    fetchAllCounts();
  }, []);

  const fetchAllCounts = async () => {
    try {
      const { count: resAdmin } = await supabase.from('user').select('*', { count: 'exact', head: true }).neq('Role', 'Mahasiswa').neq('Role', 'super_admin');
      const { count: resOnline } = await supabase.from('user').select('*', { count: 'exact', head: true }).eq('status_online', true).neq('Role', 'Mahasiswa');
      const { count: resAnnounce } = await supabase.from('Pengumuman').select('*', { count: 'exact', head: true });
      const { count: resPending } = await supabase.from('Pengumuman').select('*', { count: 'exact', head: true }).eq('status', 'pending');

      setStats({
        totalAdmin: resAdmin || 0,
        adminOnline: resOnline || 0,
        totalPengumuman: resAnnounce || 0,
        pendingTasks: resPending || 0
      });
    } catch (err) {
      console.error("Gagal mengambil statistik:", err);
    }
  };

  const fetchAdminsData = async () => {
    setIsLoadingAdmins(true);
    try {
      const { data, error } = await supabase.from('user').select('*').neq('Role', 'Mahasiswa').neq('Role', 'super_admin').order('created_at', { ascending: false }).limit(5);
      if (error) throw error;
      if (data) setAdminsList(data);
    } catch (error) { console.error(error); } finally { setIsLoadingAdmins(false); }
  };

  const fetchPendingTasks = async () => {
    setIsLoadingTasks(true);
    try {
      const { data, error } = await supabase.from('Pengumuman').select('*').eq('status', 'pending').order('created_at', { ascending: false });
      if (error) throw error;
      setPendingTasks(data || []);
      setStats(prev => ({ ...prev, pendingTasks: data?.length || 0 }));
    } catch (error) { console.error(error); } finally { setIsLoadingTasks(false); }
  };

  const handleApprove = async (id) => {
    try {
      const { error } = await supabase.from('Pengumuman').update({ status: 'Approved' }).eq('id', id);
      if (error) throw error;
      fetchPendingTasks();
      fetchAllCounts();
      alert("Pengumuman berhasil disetujui!");
    } catch (error) { alert("Gagal: " + error.message); }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Yakin ingin menolak?")) return;
    try {
      const { error } = await supabase.from('Pengumuman').update({ status: 'Rejected' }).eq('id', id);
      if (error) throw error;
      fetchPendingTasks();
      fetchAllCounts();
    } catch (error) { alert("Gagal: " + error.message); }
  };

  // LOGIKA TRIGGER LOGOUT
  const handleLogoutTrigger = () => {
    setIsLogoutConfirmOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('user_akademik');
    navigate('/'); // Redirect ke Landing Page
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'Dashboard':
        return (
          <div className="space-y-8 animate-pop-in pb-10">
            <h2 className="text-2xl font-bold text-[#0f2a4a] flex items-center gap-2">Control Center Super Admin 👑</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center transition-all hover:shadow-md hover:-translate-y-1">
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-4"><FiUsers size={20} /></div>
                <h3 className="text-3xl font-black text-gray-800">{stats.totalAdmin}</h3>
                <p className="text-[13px] text-gray-500 font-medium mt-1">Total Admin</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center transition-all hover:shadow-md hover:-translate-y-1">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mb-4"><FiActivity size={20} /></div>
                <h3 className="text-3xl font-black text-gray-800">{stats.adminOnline}</h3>
                <p className="text-[13px] text-gray-500 font-medium mt-1">Admin Online</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center transition-all hover:shadow-md hover:-translate-y-1">
                <div className="w-12 h-12 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center mb-4"><FiBell size={20} /></div>
                <h3 className="text-3xl font-black text-gray-800">{stats.totalPengumuman}</h3>
                <p className="text-[13px] text-gray-500 font-medium mt-1">Total Pengumuman</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center transition-all hover:shadow-md hover:-translate-y-1">
                <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center mb-4"><FiCheckSquare size={20} /></div>
                <h3 className="text-3xl font-black text-gray-800">{stats.pendingTasks}</h3>
                <p className="text-[13px] text-gray-500 font-medium mt-1">Pending Tasks</p>
              </div>
            </div>

            <div className="bg-white rounded-[16px] border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-5 flex justify-between items-center border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800">Admin Management</h3>
                <button onClick={() => setActiveMenu('RoleManagement')} className="text-blue-600 text-sm font-semibold hover:text-blue-800 flex items-center gap-1">Kelola Semua &rarr;</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-blue-600 text-white text-[13px] font-semibold tracking-wide">
                    <tr><th className="px-6 py-4">Data Admin & Role</th><th className="px-6 py-4">Status Aktivitas</th><th className="px-6 py-4 text-center w-32">Aksi</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {isLoadingAdmins ? (
                      <tr><td colSpan="3" className="px-6 py-12 text-center"><FiLoader className="animate-spin text-blue-500 mx-auto" size={24} /></td></tr>
                    ) : adminsList.map((admin) => (
                      <tr key={admin.id} className="hover:bg-blue-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="text-[14px] font-bold text-gray-800 mb-0.5 group-hover:text-blue-600 transition-colors">{admin.Username || 'Tanpa Nama'}</div>
                          <div className="text-[12px] text-gray-500 font-medium mb-1.5">{admin.Email}</div>
                          {admin.Role && <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase tracking-wider">{admin.Role}</span>}
                        </td>
                        <td className="px-6 py-4 align-middle"><div className="text-[13px] text-gray-500 font-medium">Terdaftar: {admin.created_at ? new Date(admin.created_at).toLocaleDateString('id-ID') : '-'}</div></td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button className="w-8 h-8 text-blue-600 hover:bg-blue-100 rounded-lg"><FiEdit2 size={16} /></button>
                            <button className="w-8 h-8 text-red-500 hover:bg-red-100 rounded-lg"><FiTrash2 size={16} /></button>
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
      case 'Pending Task':
        return <PendingTasksView tasks={pendingTasks} isLoading={isLoadingTasks} onApprove={handleApprove} onReject={handleReject} />;
      case 'Pengumuman': return <PengumumanView user={user} />;
      default:
        return <PlaceholderView name={activeMenu} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 overflow-hidden relative">
      {/* Sidebar - Gunakan handleLogoutTrigger */}
      <SuperAdminSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} onLogout={handleLogoutTrigger} pendingCount={stats.pendingTasks} />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative w-full bg-gray-50">
        {/* Header - Gunakan handleLogoutTrigger */}
        <SuperAdminHeader user={user} activeMenu={activeMenu} onMenuClick={() => setIsSidebarOpen(true)} onLogout={handleLogoutTrigger} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto pb-24">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* ========================================================= */}
      {/* MODAL KONFIRMASI LOGOUT DENGAN BACKGROUND GELAP */}
      {/* ========================================================= */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-pop-in">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                <FiLogOut size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Anda yakin ingin keluar?</h3>
              <p className="text-gray-500 text-sm leading-relaxed px-2">
                Sesi Super Admin akan dihentikan dan Anda akan dialihkan kembali ke halaman utama.
              </p>
            </div>

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
}