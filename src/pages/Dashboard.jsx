import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
// Import Icon
import { 
  FiHome, FiBell, FiFileText, FiBriefcase, 
  FiLogOut, FiMenu, FiX, FiMessageSquare, FiSend, 
  FiClock, FiFolder, FiChevronRight, FiCheckCircle, FiDownload, FiEdit3, FiAlertCircle
} from 'react-icons/fi'

export default function Dashboard() {
  const navigate = useNavigate()
  
  // --- STATE USER & UI ---
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState('Dashboard')
  const [user, setUser] = useState({ name: 'Loading...', role: '...', email: '', avatar: null })

  // --- STATE TUGAS AKHIR (6 TAHAP) ---
  const [taStages, setTaStages] = useState([
    { id: 1, title: 'Pengajuan Judul TA', status: 'done', date: '20 Jan 2026' },
    { id: 2, title: 'Seminar Proposal', status: 'open', date: '-' },
    { id: 3, title: 'Revisi Seminar Proposal', status: 'locked', date: '-' },
    { id: 4, title: 'Seminar Hasil', status: 'locked', date: '-' },
    { id: 5, title: 'Revisi Seminar Hasil', status: 'locked', date: '-' },
    { id: 6, title: 'Yudisium', status: 'locked', date: '-' },
  ])

  // --- STATE MAGANG (4 TAHAP) ---
  const [magangStages, setMagangStages] = useState([
    { id: 1, title: 'Pengajuan Magang', status: 'done', date: '15 Des 2025' },
    { id: 2, title: 'Pelaksanaan Magang', status: 'open', date: '-' }, // Sedang berlangsung
    { id: 3, title: 'Diseminasi Magang', status: 'locked', date: '-' },
    { id: 4, title: 'Revisi Diseminasi', status: 'locked', date: '-' },
  ])

  // --- LOGIKA PROGRESS DINAMIS (TA) ---
  const taCompleted = taStages.filter(s => s.status === 'done').length
  const taPercent = Math.round((taCompleted / taStages.length) * 100)
  const taActive = taStages.find(s => s.status === 'open')
  const taLabel = taPercent === 100 ? 'Selesai' : taActive ? `Tahap: ${taActive.title}` : 'Belum Dimulai'

  // --- LOGIKA PROGRESS DINAMIS (MAGANG) ---
  const magangCompleted = magangStages.filter(s => s.status === 'done').length
  const magangPercent = Math.round((magangCompleted / magangStages.length) * 100)
  const magangActive = magangStages.find(s => s.status === 'open')
  const magangLabel = magangPercent === 100 ? 'Selesai' : magangActive ? `Tahap: ${magangActive.title}` : 'Belum Dimulai'

  // --- STATE PENGUMUMAN ---
  const [announcements, setAnnouncements] = useState([])
  const [loadingAnnounce, setLoadingAnnounce] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)

  // --- STATE CHATBOT ---
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatHistory, setChatHistory] = useState([
    { sender: 'bot', text: 'Halo! Saya asisten akademik AI. Ada yang bisa saya bantu?' }
  ])
  const chatEndRef = useRef(null)

  // --- 1. PROTEKSI HALAMAN ---
  useEffect(() => {
    const sessionData = localStorage.getItem('user_akademik')
    if (!sessionData) {
      navigate('/login', { replace: true }) 
    } else {
      const parsedUser = JSON.parse(sessionData)
      setUser({
        name: parsedUser.name || 'Mahasiswa',
        role: parsedUser.role || 'Mahasiswa',
        email: parsedUser.email,
        avatar: parsedUser.avatar || `https://ui-avatars.com/api/?name=${parsedUser.name}&background=0D8ABC&color=fff`
      })
    }
  }, [navigate])

  // --- 2. FETCH PENGUMUMAN ---
  useEffect(() => {
    if (activeMenu === 'Pengumuman') {
      const fetchData = async () => {
        setLoadingAnnounce(true)
        try {
          const { data, error } = await supabase
            .from('Pengumuman')
            .select('*')
            .order('created_at', { ascending: false })
          if (error) throw error
          setAnnouncements(data || [])
        } catch (err) {
          console.error("Gagal ambil pengumuman:", err.message)
        } finally {
          setLoadingAnnounce(false)
        }
      }
      fetchData()
    }
  }, [activeMenu])

  // --- 3. SIMULASI UPDATE STATUS ---
  const handleUpdateStatusTA = (id) => {
    const updated = taStages.map(s => {
      if (s.id === id) return { ...s, status: 'done', date: new Date().toLocaleDateString('id-ID') }
      if (s.id === id + 1) return { ...s, status: 'open' }
      return s
    })
    setTaStages(updated)
  }

  const handleUpdateStatusMagang = (id) => {
    const updated = magangStages.map(s => {
      if (s.id === id) return { ...s, status: 'done', date: new Date().toLocaleDateString('id-ID') }
      if (s.id === id + 1) return { ...s, status: 'open' }
      return s
    })
    setMagangStages(updated)
  }

  // --- 4. LOGIC CHATBOT ---
  const handleSendChat = (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    const newChat = [...chatHistory, { sender: 'user', text: chatInput }]
    setChatHistory(newChat)
    setChatInput('')
    setTimeout(() => {
      setChatHistory(prev => [...prev, { sender: 'bot', text: 'Maaf, fitur koneksi AI Gemini sedang dalam tahap integrasi final.' }])
    }, 1000)
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatHistory, isChatOpen])

  // --- 5. LOGOUT ---
  const handleLogout = () => {
    localStorage.removeItem('user_akademik')
    navigate('/login', { replace: true })
  }

  const menus = [
    { name: 'Dashboard', icon: FiHome, id: 'Dashboard' },
    { name: 'Pengumuman', icon: FiBell, id: 'Pengumuman' },
    { name: 'Tugas Akhir', icon: FiFileText, id: 'TugasAkhir' },
    { name: 'Magang', icon: FiBriefcase, id: 'Magang' },
  ]

  const styles = {
    sidebar: { backgroundColor: '#0f172a', color: 'white' },
    gradientCard: { background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)' },
    glass: { backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)' },
    chatUser: { background: '#2563eb', color: 'white', borderRadius: '15px 15px 0 15px' },
    chatBot: { background: '#f3f4f6', color: '#1f2937', borderRadius: '15px 15px 15px 0' },
    truncate: { display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
    modalOverlay: { zIndex: 9999 },
    progressBarTA: { background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)', width: `${taPercent}%`, transition: 'width 1s ease-in-out' },
    progressBarMagang: { background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)', width: `${magangPercent}%`, transition: 'width 1s ease-in-out' }
  }

  const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

  // --- MODAL COMPONENT ---
  const AnnouncementModal = ({ item, onClose }) => {
    if (!item) return null
    return (
      <div className="fixed inset-0 flex items-center justify-center p-4" style={styles.modalOverlay}>
        <div className="absolute inset-0 bg-gray-900 bg-opacity-80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-pop-in">
          <div className="p-6 md:p-8 flex justify-between items-start text-white flex-shrink-0" style={styles.gradientCard}>
            <div className="pr-6">
              <span className="bg-white/20 border border-white/20 text-xs font-bold px-3 py-1 rounded-full uppercase mb-4 inline-block tracking-wider">{item.kategori || 'INFORMASI'}</span>
              <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-2">{item.Judul}</h2>
              <div className="flex items-center gap-2 text-blue-100 text-sm"><FiClock /> <span>{formatDate(item.created_at)}</span></div>
            </div>
            <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition focus:outline-none"><FiX size={24} /></button>
          </div>
          <div className="p-8 overflow-y-auto text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">{item.isi_pengumuman}</div>
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end flex-shrink-0">
            <button onClick={onClose} className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition">Tutup</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 overflow-hidden relative">
      <style>{`@keyframes popIn { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } } .animate-pop-in { animation: popIn 0.2s cubic-bezier(0.165, 0.84, 0.44, 1) forwards; }`}</style>

      {selectedAnnouncement && <AnnouncementModal item={selectedAnnouncement} onClose={() => setSelectedAnnouncement(null)} />}
      {mobileSidebarOpen && <div onClick={() => setMobileSidebarOpen(false)} className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity"></div>}

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

      {/* CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative w-full bg-gray-50">
        <header className="h-20 bg-white shadow-sm flex items-center justify-between px-4 md:px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileSidebarOpen(true)} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 md:hidden focus:outline-none"><FiMenu size={24} /></button>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">{activeMenu === 'Dashboard' ? 'Dashboard Mahasiswa' : activeMenu.replace(/([A-Z])/g, ' $1').trim()}</h2>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <div className="text-right hidden md:block"><p className="text-sm font-bold text-gray-800">{user.name}</p><p className="text-xs text-gray-500">{user.role}</p></div>
            <img src={user.avatar || 'https://via.placeholder.com/40'} alt="Profile" className="w-10 h-10 rounded-full border-2 border-gray-100 shadow-sm object-cover bg-gray-200" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto pb-24">
            
            {/* --- MENU 1: DASHBOARD --- */}
            {activeMenu === 'Dashboard' && (
              <div className="space-y-8 animate-pop-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card TA Shortcut */}
                  <div style={{background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)'}} className="relative rounded-2xl p-8 h-64 flex flex-col justify-center overflow-hidden text-white shadow-lg hover:scale-[1.01] transition-transform duration-300">
                    <div className="absolute right-0 top-0 w-40 h-40 bg-white opacity-10 rounded-full transform translate-x-10 -translate-y-10"></div>
                    <div className="relative z-10">
                      <div className="flex items-start gap-4 mb-4">
                        <div style={styles.glass} className="p-3 rounded-xl"><FiFileText size={28} /></div>
                        <div><h3 className="text-2xl font-bold">Tugas Akhir</h3><p className="text-blue-50 text-sm mt-1 opacity-90">Progress: <b>{taPercent}%</b></p></div>
                      </div>
                      <button onClick={() => setActiveMenu('TugasAkhir')} className="mt-6 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-gray-50 transition-colors">Lihat Detail</button>
                    </div>
                  </div>
                  {/* Card Magang Shortcut */}
                  <div style={{background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)'}} className="relative rounded-2xl p-8 h-64 flex flex-col justify-center overflow-hidden text-white shadow-lg hover:scale-[1.01] transition-transform duration-300">
                    <div className="absolute right-0 bottom-0 w-40 h-40 bg-white opacity-10 rounded-full transform translate-x-10 translate-y-10"></div>
                    <div className="relative z-10">
                      <div className="flex items-start gap-4 mb-4">
                        <div style={styles.glass} className="p-3 rounded-xl"><FiBriefcase size={28} /></div>
                        <div><h3 className="text-2xl font-bold">Magang</h3><p className="text-purple-50 text-sm mt-1 opacity-90">Progress: <b>{magangPercent}%</b></p></div>
                      </div>
                      <button onClick={() => setActiveMenu('Magang')} style={{border: '2px solid rgba(255,255,255,0.5)', background: 'transparent'}} className="mt-6 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-white hover:text-purple-600 transition-colors">Lihat Detail</button>
                    </div>
                  </div>
                </div>

                {/* PROGRESS BAR DINAMIS */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-8">Progress Akademik</h3>
                  <div className="space-y-8">
                    {/* TA Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-gray-700">Tugas Akhir</span>
                        <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${taPercent === 100 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{taLabel}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden"><div className="h-full rounded-full" style={styles.progressBarTA}></div></div>
                      <p className="text-xs text-gray-400 mt-2 text-right">{taPercent}% Selesai</p>
                    </div>
                    {/* Magang Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-gray-700">Magang</span>
                        <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${magangPercent === 100 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{magangLabel}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden"><div className="h-full rounded-full" style={styles.progressBarMagang}></div></div>
                      <p className="text-xs text-gray-400 mt-2 text-right">{magangPercent}% Selesai</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- MENU 2: PENGUMUMAN --- */}
            {activeMenu === 'Pengumuman' && (
              <div className="animate-pop-in">
                {loadingAnnounce ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400"><FiBell className="animate-bounce text-4xl mb-4 text-blue-500" /><p>Mengambil data pengumuman...</p></div>
                ) : announcements.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-300"><p className="text-gray-400">Belum ada pengumuman saat ini.</p></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {announcements.map((item) => (
                      <div key={item.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col overflow-hidden hover:-translate-y-1">
                        <div className="h-3 w-full bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-4">
                             <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide border border-blue-100">{item.kategori || 'Umum'}</span>
                             <span className="text-gray-400 text-xs flex items-center gap-1"><FiClock size={12} /> {formatDate(item.created_at)}</span>
                          </div>
                          <h3 onClick={() => setSelectedAnnouncement(item)} className="text-lg font-bold text-gray-800 leading-snug cursor-pointer group-hover:text-blue-600 transition-colors mb-3">{item.Judul}</h3>
                          <p className="text-gray-500 text-sm mb-6 flex-1 leading-relaxed" style={styles.truncate}>{item.isi_pengumuman}</p>
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

            {/* --- MENU 3: TUGAS AKHIR --- */}
            {activeMenu === 'TugasAkhir' && (
              <div className="space-y-6 animate-pop-in">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
                   <h2 className="text-xl font-bold text-blue-900 mb-2">Tugas Akhir - Form & Dokumen</h2>
                   <p className="text-blue-700 text-sm">Lengkapi setiap tahapan tugas akhir di bawah ini.</p>
                </div>
                <div className="space-y-6">
                  {taStages.map((stage) => (
                    <div key={stage.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="bg-[#0f2a4a] px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                         <div className="flex items-center gap-2"><div className="w-1 h-6 bg-blue-500 rounded-full"></div><h3 className="font-bold text-white text-sm tracking-wide">{stage.title}</h3></div>
                         {stage.status === 'done' && <span className="text-green-400 text-xs font-bold flex items-center gap-1"><FiCheckCircle /> Selesai</span>}
                      </div>
                      <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                         <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${stage.status === 'locked' ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600'}`}><FiFileText /></div>
                            <div><h4 className={`font-bold text-base ${stage.status === 'locked' ? 'text-gray-400' : 'text-gray-800'}`}>Form {stage.title}</h4><p className="text-xs text-gray-500 mt-1">Status: <span className={`ml-1 font-bold ${stage.status === 'done' ? 'text-green-600' : stage.status === 'open' ? 'text-orange-500' : 'text-gray-400'}`}>{stage.status === 'done' ? 'Sudah Diisi' : stage.status === 'open' ? 'Belum Diisi' : 'Terkunci'}</span></p></div>
                         </div>
                         <div className="flex items-center gap-3 w-full md:w-auto">
                            {stage.status !== 'locked' ? (
                               <>
                                 <button onClick={() => handleUpdateStatusTA(stage.id)} className={`flex-1 md:flex-none px-4 py-2 rounded-lg border flex items-center justify-center gap-2 text-sm font-bold transition-all ${stage.status === 'done' ? 'border-gray-300 text-gray-500 bg-gray-50 cursor-not-allowed' : 'border-blue-600 text-blue-600 hover:bg-blue-50'}`} disabled={stage.status === 'done'}><FiEdit3 /> {stage.status === 'done' ? 'Terisi' : 'Isi Form'}</button>
                                 <button className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-md"><FiDownload /> Download PDF</button>
                               </>
                            ) : (<div className="text-gray-400 text-sm flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg w-full md:w-auto justify-center"><FiAlertCircle /> Tahap Belum Terbuka</div>)}
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- MENU 4: MAGANG (NEW) --- */}
            {activeMenu === 'Magang' && (
              <div className="space-y-6 animate-pop-in">
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-6 mb-8">
                   <h2 className="text-xl font-bold text-purple-900 mb-2">Program Magang Industri</h2>
                   <p className="text-purple-700 text-sm">Lengkapi tahapan magang mulai dari pengajuan hingga diseminasi laporan.</p>
                </div>
                <div className="space-y-6">
                  {magangStages.map((stage) => (
                    <div key={stage.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="bg-purple-900 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                         <div className="flex items-center gap-2"><div className="w-1 h-6 bg-purple-400 rounded-full"></div><h3 className="font-bold text-white text-sm tracking-wide">{stage.title}</h3></div>
                         {stage.status === 'done' && <span className="text-green-400 text-xs font-bold flex items-center gap-1"><FiCheckCircle /> Selesai</span>}
                      </div>
                      <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                         <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${stage.status === 'locked' ? 'bg-gray-100 text-gray-400' : 'bg-purple-50 text-purple-600'}`}><FiBriefcase /></div>
                            <div><h4 className={`font-bold text-base ${stage.status === 'locked' ? 'text-gray-400' : 'text-gray-800'}`}>Form {stage.title}</h4><p className="text-xs text-gray-500 mt-1">Status: <span className={`ml-1 font-bold ${stage.status === 'done' ? 'text-green-600' : stage.status === 'open' ? 'text-orange-500' : 'text-gray-400'}`}>{stage.status === 'done' ? 'Sudah Diisi' : stage.status === 'open' ? 'Belum Diisi' : 'Terkunci'}</span></p></div>
                         </div>
                         <div className="flex items-center gap-3 w-full md:w-auto">
                            {stage.status !== 'locked' ? (
                               <>
                                 <button onClick={() => handleUpdateStatusMagang(stage.id)} className={`flex-1 md:flex-none px-4 py-2 rounded-lg border flex items-center justify-center gap-2 text-sm font-bold transition-all ${stage.status === 'done' ? 'border-gray-300 text-gray-500 bg-gray-50 cursor-not-allowed' : 'border-purple-600 text-purple-600 hover:bg-purple-50'}`} disabled={stage.status === 'done'}><FiEdit3 /> {stage.status === 'done' ? 'Terisi' : 'Isi Form'}</button>
                                 <button className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-md"><FiDownload /> Download PDF</button>
                               </>
                            ) : (<div className="text-gray-400 text-sm flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg w-full md:w-auto justify-center"><FiAlertCircle /> Tahap Belum Terbuka</div>)}
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* CHATBOT */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-none">
        {isChatOpen && (
          <div className="mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col pointer-events-auto animate-pop-in origin-bottom-right" style={{height: '500px'}}>
            <div className="p-4 flex justify-between items-center text-white shadow-md" style={styles.gradientCard}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30"><FiMessageSquare /></div>
                <div><h4 className="font-bold text-sm">Akademik AI</h4><div className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span><p className="text-[10px] text-blue-100">Online</p></div></div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition"><FiX /></button>
            </div>
            <div className="flex-1 bg-gray-50 p-4 overflow-y-auto space-y-4">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-pop-in`}>
                  <div className="p-3 text-sm max-w-[85%] shadow-sm leading-relaxed" style={msg.sender === 'user' ? styles.chatUser : styles.chatBot}>{msg.text}</div>
                </div>
              ))}
              <div ref={chatEndRef}></div>
            </div>
            <form onSubmit={handleSendChat} className="p-3 bg-white border-t border-gray-100 flex gap-2">
              <input type="text" className="flex-1 bg-gray-100 border-transparent rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" placeholder="Ketik pesan..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} />
              <button type="submit" className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition shadow-md flex items-center justify-center transform active:scale-95"><FiSend /></button>
            </form>
          </div>
        )}
        <button onClick={() => setIsChatOpen(!isChatOpen)} className={`pointer-events-auto p-4 rounded-full shadow-2xl text-white flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-90 ${isChatOpen ? 'bg-red-500 rotate-90' : 'bg-blue-600 rotate-0 hover:bg-blue-700'}`} style={{ width: '60px', height: '60px' }}>
          {isChatOpen ? <FiX size={28} /> : <FiMessageSquare size={28} />}
        </button>
      </div>
    </div>
  )
}