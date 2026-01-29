import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { 
  FiSearch, FiBell, FiLoader, FiX, FiClock, FiFolder, FiArrowRight, 
  FiCalendar, FiGrid, FiCheckCircle, FiInfo
} from 'react-icons/fi'

export default function LandingPage() {
  const navigate = useNavigate()
  
  // --- STATE ---
  const [allAnnouncements, setAllAnnouncements] = useState([])
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('Semua')
  const [showNotif, setShowNotif] = useState(false)

  const notifRef = useRef(null)

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('Pengumuman')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setAllAnnouncements(data || [])
        setFilteredAnnouncements(data || [])
      } catch (error) {
        console.error("Error fetching:", error.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAnnouncements()
  }, [])

  // --- FILTER LOGIC ---
  useEffect(() => {
    let result = allAnnouncements
    if (activeCategory !== 'Semua') {
      result = result.filter(item => 
        item.kategori && item.kategori.toLowerCase() === activeCategory.toLowerCase()
      )
    }
    if (searchTerm) {
      result = result.filter(item => 
        item.Judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.isi_pengumuman.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    setFilteredAnnouncements(result)
  }, [searchTerm, activeCategory, allAnnouncements])

  // --- CLICK OUTSIDE NOTIF ---
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [notifRef])

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', { 
      day: 'numeric', month: 'long', year: 'numeric' 
    })
  }

  // --- STYLES MANUAL (Agar Anti-Bug Z-Index) ---
  const styles = {
    // Memaksa Modal selalu paling depan
    modalOverlay: {
      zIndex: 9999, 
    },
    // Memaksa Navbar di atas konten Hero
    navbar: {
      zIndex: 50,
      position: 'relative'
    },
    // Memaksa Dropdown Notifikasi di atas segalanya di navbar
    dropdown: {
      zIndex: 60,
      position: 'absolute',
      right: 0,
      top: '100%',
    },
    heroGradient: {
      background: 'linear-gradient(120deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
      zIndex: 0
    },
    cardHeaderGradient: {
      background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
    },
    truncate: {
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }

  const categories = ['Semua', 'Akademik', 'Beasiswa', 'Kegiatan', 'Prestasi']
  const notifications = [
    { id: 1, title: 'Pengingat UTS', desc: 'UTS dimulai 3 hari lagi.', type: 'urgent', icon: FiClock },
    { id: 2, title: 'Jadwal Baru', desc: 'Jadwal semester genap rilis.', type: 'info', icon: FiCalendar },
  ]

  // --- MODAL COMPONENT ---
  const AnnouncementModal = ({ item, onClose }) => {
    if (!item) return null
    return (
      <div className="fixed inset-0 flex items-center justify-center p-4" style={styles.modalOverlay}>
        {/* Backdrop Gelap */}
        <div 
          className="absolute inset-0 bg-gray-900 bg-opacity-80 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Kotak Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-screen flex flex-col overflow-hidden transform scale-100 transition-all">
          
          {/* Header Modal */}
          <div className="p-6 md:p-8 flex justify-between items-start text-white flex-shrink-0" style={styles.cardHeaderGradient}>
            <div className="pr-6">
              <span className="bg-white bg-opacity-20 border border-white border-opacity-20 text-xs font-bold px-3 py-1 rounded-full uppercase mb-4 inline-block tracking-wider">
                {item.kategori || 'INFORMASI'}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-2">{item.Judul}</h2>
              <div className="flex items-center gap-2 text-blue-100 text-sm">
                <FiClock /> <span>{formatDate(item.created_at)}</span>
              </div>
            </div>
            <button onClick={onClose} className="bg-white bg-opacity-10 hover:bg-opacity-20 p-2 rounded-full transition focus:outline-none">
              <FiX size={24} />
            </button>
          </div>

          {/* Isi Pengumuman */}
          <div className="p-8 overflow-y-auto text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
            {item.isi_pengumuman}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end flex-shrink-0">
            <button onClick={onClose} className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition">
              Tutup
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-gray-50 relative">
      
      {/* 1. MODAL (Pop-up) - Pasti Paling Depan karena zIndex 9999 */}
      {selectedAnnouncement && (
        <AnnouncementModal 
          item={selectedAnnouncement} 
          onClose={() => setSelectedAnnouncement(null)} 
        />
      )}

      {/* 2. HERO SECTION */}
      <div className="relative pb-32 pt-6 overflow-hidden" style={styles.heroGradient}>
        
        {/* Dekorasi Background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full transform translate-x-20 -translate-y-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 opacity-10 rounded-full transform -translate-x-10 translate-y-10 pointer-events-none"></div>

        {/* NAVBAR (Diberi z-index 50 agar notifikasi muncul di atas judul hero) */}
        <nav className="flex items-center justify-between px-6 max-w-7xl mx-auto mb-16" style={styles.navbar}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-10 backdrop-blur-md rounded-xl flex items-center justify-center text-white font-bold border border-white border-opacity-20 shadow-lg">PP</div>
            <h1 className="text-xl font-bold text-white tracking-wide">Kampus Portal</h1>
          </div>

          <div className="hidden md:flex gap-8 text-sm font-medium text-blue-100">
             <a href="#" className="text-white font-bold border-b-2 border-blue-400 pb-1">Beranda</a>
             <a href="#" className="hover:text-white transition">Akademik</a>
             <a href="#" className="hover:text-white transition">Arsip</a>
             <a href="#" className="hover:text-white transition">Tentang</a>
          </div>

          <div className="flex items-center gap-6">
             {/* NOTIFIKASI */}
             <div className="relative" ref={notifRef}>
                <button onClick={() => setShowNotif(!showNotif)} className="p-2 rounded-full hover:bg-white hover:bg-opacity-10 transition relative focus:outline-none">
                   <FiBell className="text-blue-100 text-2xl hover:text-white" />
                   <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-blue-900 shadow animate-pulse"></span>
                </button>

                {/* Dropdown Notif (zIndex 60) */}
                {showNotif && (
                  <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-80 mt-2" style={styles.dropdown}>
                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                      <h3 className="font-bold text-gray-800">Notifikasi</h3>
                      <button onClick={() => setShowNotif(false)} className="text-gray-400 hover:text-gray-600"><FiX /></button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div key={notif.id} className="px-5 py-4 border-b border-gray-50 hover:bg-blue-50 transition cursor-pointer flex gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.type === 'urgent' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                            <notif.icon />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 text-sm">{notif.title}</h4>
                            <p className="text-xs text-gray-500 mt-1">{notif.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
             </div>

             <button onClick={() => navigate('/login')} className="bg-white text-blue-900 px-6 py-2.5 rounded-full font-bold shadow-lg hover:bg-blue-50 transition transform hover:-translate-y-0.5">
                Masuk
             </button>
          </div>
        </nav>

        {/* Hero Content (z-index 0 agar di bawah notifikasi) */}
        <div className="relative z-0 text-center px-4 max-w-5xl mx-auto">
           <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight drop-shadow-md">
             Portal Informasi <br/> 
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-300">
               Politeknik Negeri Madiun
             </span>
           </h2>
           
           <div className="relative max-w-3xl mx-auto mb-10 transform hover:scale-[1.01] transition-transform duration-300">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                 <FiSearch className="text-blue-500 text-2xl" />
              </div>
              <input 
                type="text" 
                placeholder="Cari pengumuman..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-36 py-5 rounded-full focus:outline-none shadow-2xl text-gray-700 text-lg border-4 border-white/10 bg-white"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-full font-bold transition shadow-md">
                 Cari
              </button>
           </div>

           <div className="flex flex-wrap justify-center gap-3">
              {categories.map((cat, idx) => (
                 <button 
                    key={idx}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2 rounded-full text-xs font-bold border transition-all hover:-translate-y-1
                       ${activeCategory === cat 
                          ? 'bg-white text-blue-900 border-white shadow-lg' 
                          : 'bg-blue-900/30 border-blue-400/30 text-blue-100 hover:bg-blue-900/50 hover:text-white'
                       }`}
                 >
                    {cat}
                 </button>
              ))}
           </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-16 -mt-10 relative z-10">
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { title: 'Kalender Event', icon: FiCalendar, color: 'text-blue-500', bg: 'bg-blue-50' },
              { title: 'Arsip Lama', icon: FiFolder, color: 'text-yellow-500', bg: 'bg-yellow-50' },
              { title: 'Fasilitas', icon: FiGrid, color: 'text-green-500', bg: 'bg-green-50' },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer flex items-center gap-4 border border-gray-100 transform hover:-translate-y-1">
                 <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center`}>
                    <item.icon size={28} />
                 </div>
                 <div>
                    <h3 className="font-bold text-gray-800 text-lg">{item.title}</h3>
                    <p className="text-xs text-gray-400">Akses cepat menu</p>
                 </div>
              </div>
            ))}
         </div>

         <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-800 border-l-4 border-blue-600 pl-4">
              Pengumuman Terbaru
            </h3>
         </div>

         {/* GRID PENGUMUMAN */}
         {loading ? (
             <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <FiLoader className="animate-spin text-4xl mb-3 text-blue-600" /> 
                <p>Sedang memuat data...</p>
             </div>
         ) : filteredAnnouncements.length === 0 ? (
             <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-300">
                <FiFolder className="mx-auto text-6xl text-gray-200 mb-4" />
                <p className="text-gray-500 font-bold text-lg">Tidak ada pengumuman ditemukan.</p>
             </div>
         ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {filteredAnnouncements.map((item) => (
                 <div 
                   key={item.id} 
                   className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col h-full transform hover:-translate-y-2 cursor-default"
                 >
                   {/* HEADER KARTU */}
                   <div className="h-48 relative flex items-center justify-center overflow-hidden" style={styles.cardHeaderGradient}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full transform translate-x-10 -translate-y-10"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full transform -translate-x-5 translate-y-5"></div>
                      
                      <FiFolder className="text-white text-7xl opacity-80 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 drop-shadow-md" />
                      
                      <span className="absolute top-4 left-4 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        {item.kategori || 'AKADEMIK'}
                      </span>
                   </div>

                   {/* BODY KARTU */}
                   <div className="p-7 flex-1 flex flex-col">
                     <h3 
                       className="text-xl font-bold text-gray-800 mb-3 leading-snug cursor-pointer group-hover:text-blue-600 transition-colors line-clamp-2"
                       onClick={() => setSelectedAnnouncement(item)}
                     >
                       {item.Judul}
                     </h3>
                     
                     <p className="text-gray-500 text-sm mb-6 flex-1 leading-relaxed" style={styles.truncate}>
                       {item.isi_pengumuman}
                     </p>
                     
                     <div className="flex items-center justify-between pt-5 border-t border-gray-50 mt-auto">
                       <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                         <FiClock className="text-blue-500" /> {formatDate(item.created_at)}
                       </span>
                       <button 
                         onClick={() => setSelectedAnnouncement(item)}
                         className="flex items-center gap-1 text-blue-600 font-bold text-sm hover:gap-2 transition-all focus:outline-none group-hover:text-blue-700"
                       >
                         Baca Detail <FiArrowRight />
                       </button>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
         )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-10 text-center">
         <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">PP</div>
            <span className="font-bold text-gray-700">Kampus Portal</span>
         </div>
         <p className="text-gray-400 text-xs">&copy; 2026 Politeknik Negeri Madiun. All rights reserved.</p>
      </footer>
    </div>
  )
}