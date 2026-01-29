import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
// Import Icon
import { 
  FiHome, FiUser, FiFileText, FiBriefcase, 
  FiLogOut, FiMenu, FiX 
} from 'react-icons/fi'

export default function Dashboard() {
  const navigate = useNavigate()
  
  // State UI
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState('Dashboard')

  // State User (Default kosong)
  const [user, setUser] = useState({
    name: 'Loading...',
    role: '...',
    email: '',
    avatar: null
  })

  // --- 1. FITUR PROTEKSI (SATPAM) ---
  useEffect(() => {
    // Cek apakah ada data 'user_akademik' di penyimpanan browser
    const sessionData = localStorage.getItem('user_akademik')

    if (!sessionData) {
      // JIKA TIDAK ADA DATA: Tendang paksa ke halaman Login
      // 'replace: true' agar user tidak bisa back ke dashboard
      navigate('/login', { replace: true }) 
    } else {
      // JIKA ADA: Muat data user ke state agar tampil namanya
      const parsedUser = JSON.parse(sessionData)
      setUser({
        name: parsedUser.name || 'Mahasiswa',
        role: parsedUser.role || 'Mahasiswa',
        email: parsedUser.email,
        avatar: parsedUser.avatar || `https://ui-avatars.com/api/?name=${parsedUser.name}&background=0D8ABC&color=fff`
      })
    }
  }, [navigate])

  // --- 2. FUNGSI LOGOUT ---
  const handleLogout = () => {
    // Hapus sesi dari browser (Robek tiketnya)
    localStorage.removeItem('user_akademik')
    // Arahkan ke halaman login
    navigate('/login', { replace: true })
  }

  const menus = [
    { name: 'Dashboard', icon: FiHome, id: 'Dashboard' },
    { name: 'Profil', icon: FiUser, id: 'Profil' },
    { name: 'Tugas Akhir', icon: FiFileText, id: 'TugasAkhir' },
    { name: 'Magang', icon: FiBriefcase, id: 'Magang' },
  ]

  // Styles
  const styles = {
    sidebar: { backgroundColor: '#0f172a', color: 'white' },
    cardTA: { background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)' },
    cardMagang: { background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)', boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.4)' },
    glassEffect: { backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(8px)' },
    progressBarTA: { background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)', width: '35%' },
    progressBarMagang: { background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)', width: '70%' }
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800 overflow-hidden relative">
      
      {/* Overlay Mobile */}
      {mobileSidebarOpen && (
        <div onClick={() => setMobileSidebarOpen(false)} className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity"></div>
      )}

      {/* SIDEBAR */}
      <aside style={styles.sidebar} className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 shadow-xl flex flex-col`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-800">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg font-bold text-white">S</div>
              <h1 className="font-bold text-lg tracking-wide">SIAKAD</h1>
           </div>
           <button onClick={() => setMobileSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white focus:outline-none"><FiX size={24} /></button>
        </div>

        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menus.map((menu) => (
            <button key={menu.id} onClick={() => { setActiveMenu(menu.id); setMobileSidebarOpen(false) }} className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 group focus:outline-none ${activeMenu === menu.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              <menu.icon className={`w-5 h-5 ${activeMenu === menu.id ? 'text-white' : 'group-hover:text-white'}`} />
              <span className={`ml-4 font-medium ${activeMenu === menu.id ? 'font-bold' : ''}`}>{menu.name}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="flex items-center w-full py-3 px-4 rounded-xl border border-gray-700 hover:bg-red-600 hover:border-red-600 hover:text-white text-gray-400 transition-all duration-300 group focus:outline-none">
            <FiLogOut className="w-5 h-5" />
            <span className="ml-3 font-medium">Keluar</span>
          </button>
        </div>
      </aside>

      {/* KONTEN */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative w-full bg-gray-50">
        <header className="h-20 bg-white shadow-sm flex items-center justify-between px-4 md:px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileSidebarOpen(true)} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 md:hidden focus:outline-none"><FiMenu size={24} /></button>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Dashboard Mahasiswa</h2>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <div className="text-right hidden md:block"><p className="text-sm font-bold text-gray-800">{user.name}</p><p className="text-xs text-gray-500">{user.role}</p></div>
            <img src={user.avatar || 'https://via.placeholder.com/40'} alt="Profile" className="w-10 h-10 rounded-full border-2 border-gray-100 shadow-sm object-cover bg-gray-200" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8 pb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div style={styles.cardTA} className="relative rounded-2xl p-8 h-64 flex flex-col justify-center overflow-hidden text-white transform hover:scale-105 transition-transform duration-300">
                <div className="absolute right-0 top-0 w-40 h-40 bg-white opacity-10 rounded-full transform translate-x-10 -translate-y-10"></div>
                <div className="relative z-10">
                  <div className="flex items-start gap-4 mb-4">
                    <div style={styles.glassEffect} className="p-3 rounded-xl"><FiFileText size={28} /></div>
                    <div><h3 className="text-2xl font-bold">Tugas Akhir</h3><p className="text-blue-50 text-sm mt-1 opacity-90">Kelola dokumen dan form TA</p></div>
                  </div>
                  <button className="mt-6 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-gray-50 transition-colors">Lihat Detail</button>
                </div>
              </div>
              <div style={styles.cardMagang} className="relative rounded-2xl p-8 h-64 flex flex-col justify-center overflow-hidden text-white transform hover:scale-105 transition-transform duration-300">
                <div className="absolute right-0 bottom-0 w-40 h-40 bg-white opacity-10 rounded-full transform translate-x-10 translate-y-10"></div>
                <div className="relative z-10">
                  <div className="flex items-start gap-4 mb-4">
                    <div style={styles.glassEffect} className="p-3 rounded-xl"><FiBriefcase size={28} /></div>
                    <div><h3 className="text-2xl font-bold">Magang</h3><p className="text-purple-50 text-sm mt-1 opacity-90">Kelola dokumen form magang</p></div>
                  </div>
                  <button style={{ border: '2px solid rgba(255,255,255,0.5)', background: 'transparent' }} className="mt-6 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-white hover:text-purple-600 transition-colors">Lihat Detail</button>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-8">Progress Akademik</h3>
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-3"><span className="font-semibold text-gray-700">Tugas Akhir</span><span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Pengajuan</span></div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden"><div className="h-full rounded-full" style={styles.progressBarTA}></div></div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-3"><span className="font-semibold text-gray-700">Magang</span><span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Monitoring</span></div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden"><div className="h-full rounded-full" style={styles.progressBarMagang}></div></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}