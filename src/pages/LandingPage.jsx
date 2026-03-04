import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { 
  FiSearch, FiBell, FiLoader, FiX, FiClock, FiFolder, FiArrowRight, 
  FiCalendar, FiGrid, FiCheckCircle, FiInfo, FiImage, FiBriefcase
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

  // --- FUNGSI SEARCH TRIGGER ---
  const handleSearchTrigger = () => {
    const element = document.getElementById('announcement-results');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

  // --- STYLES MANUAL ---
  const styles = {
    modalOverlay: { zIndex: 9999 },
    navbar: { zIndex: 50, position: 'relative' },
    dropdown: { zIndex: 60, position: 'absolute', right: 0, top: '100%' },
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

  // --- MODAL COMPONENT (GABUNGAN DARI PENGUMUMAN VIEW) ---
  const AnnouncementModal = ({ item, onClose }) => {
    if (!item) return null
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-sm animate-fade-in" style={styles.modalOverlay}>
        
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-pop-in" 
          style={{ maxHeight: '85vh' }}
        >
          {/* Header Biru ala Admin */}
          <div className="p-6 md:p-8 bg-blue-700 text-white shrink-0 relative">
            <div className="flex items-center mb-4">
              <span className="border border-white/80 text-white text-[12px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                {item.kategori || 'UMUM'}
              </span>
            </div>
            
            <h2 className="text-xl md:text-2xl font-bold leading-snug uppercase pr-12">
              📢 {item.Judul}
            </h2>
            
            <div className="flex items-center gap-2 text-blue-100 text-sm mt-3 font-medium">
              <FiClock size={16} /> 
              <span>{formatDate(item.created_at)}</span>
            </div>
            
            <button 
              onClick={onClose} 
              className="absolute top-6 right-6 hover:bg-blue-600 p-2 rounded-full transition-all text-white flex items-center justify-center"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Content Area (Logika Pembeda QR/Scan) */}
          <div className="p-6 md:p-8 overflow-y-auto flex-grow bg-white custom-scrollbar">
            
            {item.image_url && (
              item.image_url.toLowerCase().includes('qr') ? (
                // 1. GAYA KHUSUS QR CODE
                <div className="mb-8 flex flex-col items-center justify-center p-8 bg-blue-50/30 rounded-3xl border-2 border-dashed border-blue-100">
                  <div className="bg-white p-4 rounded-2xl shadow-xl border border-blue-50">
                    <img src={item.image_url} alt="QR Verification" className="w-40 h-40 object-contain" />
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em]">E-Signature Verified</p>
                    <p className="text-[10px] text-gray-400 mt-1">Scan untuk verifikasi keaslian dokumen</p>
                  </div>
                </div>
              ) : (
                // 2. GAYA LAMPIRAN DOKUMEN OCR
                <div className="mb-6 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 group relative">
                  <img 
                    src={item.image_url} 
                    alt="Lampiran Dokumen"
                    className="w-full h-auto object-contain max-h-[450px] mx-auto transition-transform duration-500 group-hover:scale-[1.02]"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div className="bg-gray-50/80 backdrop-blur-sm py-2 px-4 border-t border-gray-100 text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                      <FiImage /> Lampiran Dokumen Digital
                    </p>
                  </div>
                </div>
              )
            )}

            {/* TEKS PENGUMUMAN */}
            <div className="text-gray-700 text-[15px] leading-[1.8] whitespace-pre-wrap break-words">
              {item.isi_pengumuman}
            </div>
            
            <div className="mt-10 pt-6 border-t border-gray-100 text-gray-400 text-[13px] italic text-center">
              Dokumen ini dipublikasikan secara resmi melalui sistem informasi akademik.
            </div>
          </div>

          {/* Footer Modal */}
          <div className="px-6 py-4 flex justify-end bg-gray-50 border-t border-gray-100 shrink-0">
             <button 
              onClick={onClose} 
              className="px-8 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/30"
            >
              Tutup Pengumuman
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-gray-50 relative">
      
      {/* 1. MODAL (Pop-up) */}
      {selectedAnnouncement && (
        <AnnouncementModal 
          item={selectedAnnouncement} 
          onClose={() => setSelectedAnnouncement(null)} 
        />
      )}

      {/* 2. HERO SECTION */}
      <div className="relative pb-32 pt-6 overflow-hidden" style={styles.heroGradient}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full transform translate-x-20 -translate-y-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 opacity-10 rounded-full transform -translate-x-10 translate-y-10 pointer-events-none"></div>

        {/* NAVBAR */}
        <nav className="flex items-center justify-between px-6 max-w-7xl mx-auto mb-16" style={styles.navbar}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-10 backdrop-blur-md rounded-xl flex items-center justify-center text-white font-bold border border-white border-opacity-20 shadow-lg cursor-pointer" onClick={() => window.location.reload()}>PNM</div>
            <h1 className="text-xl font-bold text-white tracking-wide">Kampus Portal</h1>
          </div>

          <div className="hidden md:flex gap-8 text-sm font-medium text-blue-100">
             <Link to="/" className="text-white font-bold border-b-2 border-blue-400 pb-1">Beranda</Link>
             <a href="#" className="hover:text-white transition">Akademik</a>
             <a href="#" className="hover:text-white transition">Arsip</a>
             <Link to="/mitra" className="hover:text-white transition flex items-center gap-1.5">
               Profil Mitra <FiBriefcase size={14} className="text-blue-300" />
             </Link>
          </div>

          <div className="flex items-center gap-6">

             <button onClick={() => navigate('/login')} className="bg-white text-blue-900 px-6 py-2.5 rounded-full font-bold shadow-lg hover:bg-blue-50 transition transform hover:-translate-y-0.5">
                Masuk
             </button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-0 text-center px-4 max-w-5xl mx-auto">
           <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight drop-shadow-md uppercase tracking-tight">
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
                onKeyPress={(e) => e.key === 'Enter' && handleSearchTrigger()}
                className="w-full pl-16 pr-36 py-5 rounded-full focus:outline-none shadow-2xl text-gray-700 text-lg border-4 border-white/10 bg-white"
              />
              <button 
                onClick={handleSearchTrigger}
                className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-full font-bold transition shadow-md active:scale-95"
              >
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
            <Link to="/mitra" className="bg-white p-5 rounded-2xl shadow-lg hover:shadow-2xl transition-all flex items-center gap-4 border border-gray-100 transform hover:-translate-y-1 group">
               <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FiBriefcase size={28} />
               </div>
               <div>
                  <h3 className="font-bold text-gray-800 text-lg">Profil Mitra</h3>
                  <p className="text-xs text-gray-400">Daftar Perusahaan Kerjasama</p>
               </div>
            </Link>

            <div className="bg-white p-5 rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer flex items-center gap-4 border border-gray-100 transform hover:-translate-y-1">
               <div className="w-14 h-14 bg-yellow-50 text-yellow-500 rounded-2xl flex items-center justify-center">
                  <FiCalendar size={28} />
               </div>
               <div>
                  <h3 className="font-bold text-gray-800 text-lg">Kalender Event</h3>
                  <p className="text-xs text-gray-400">Jadwal kegiatan kampus</p>
               </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer flex items-center gap-4 border border-gray-100 transform hover:-translate-y-1">
               <div className="w-14 h-14 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center">
                  <FiGrid size={28} />
               </div>
               <div>
                  <h3 className="font-bold text-gray-800 text-lg">Fasilitas</h3>
                  <p className="text-xs text-gray-400">Informasi sarana prasarana</p>
               </div>
            </div>
         </div>

         <div className="flex items-center justify-between mb-8">
            <h3 id="announcement-results" className="text-2xl font-bold text-gray-800 border-l-4 border-blue-600 pl-4 uppercase tracking-wider">
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
                   className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col h-full transform hover:-translate-y-2"
                 >
                   <div className="h-44 relative flex items-center justify-center overflow-hidden" style={styles.cardHeaderGradient}>
                      <div className="absolute inset-0 bg-blue-900/10"></div>
                      <FiFolder className="text-white text-7xl opacity-40 transform group-hover:scale-110 transition-transform duration-500" />
                      <span className="absolute top-4 left-4 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {item.kategori || 'INFO'}
                      </span>
                      {item.image_url && (
                        <div className="absolute top-4 right-4 w-7 h-7 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 text-white">
                          <FiImage size={14} />
                        </div>
                      )}
                   </div>

                   <div className="p-7 flex-1 flex flex-col">
                     <h3 
                       className="text-lg font-bold text-gray-800 mb-3 leading-snug cursor-pointer group-hover:text-blue-600 transition-colors line-clamp-2 uppercase"
                       onClick={() => setSelectedAnnouncement(item)}
                     >
                       {item.Judul}
                     </h3>
                     <p className="text-gray-500 text-sm mb-6 flex-1 leading-relaxed" style={styles.truncate}>
                       {item.isi_pengumuman}
                     </p>
                     <div className="flex items-center justify-between pt-5 border-t border-gray-50 mt-auto">
                       <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1.5 uppercase">
                         <FiCalendar className="text-blue-500" /> {formatDate(item.created_at)}
                       </span>
                       <button 
                         onClick={() => setSelectedAnnouncement(item)}
                         className="flex items-center gap-1 text-blue-600 font-black text-xs hover:gap-2 transition-all group-hover:text-blue-700 uppercase tracking-wider"
                       >
                         Detail <FiArrowRight />
                       </button>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
         )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-12 text-center">
         <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">PNM</div>
            <span className="font-bold text-gray-700 uppercase tracking-tighter text-lg">Kampus <span className="text-blue-600">Portal</span></span>
         </div>
         <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">&copy; 2026 Politeknik Negeri Madiun. All rights reserved.</p>
      </footer>
    </div>
  )
}