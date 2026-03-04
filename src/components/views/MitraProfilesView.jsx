import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { 
  FiSearch, FiLoader, FiX, FiClock, FiArrowRight, 
  FiGrid, FiImage, FiBriefcase, FiGlobe, FiExternalLink
} from 'react-icons/fi'

// NAMED EXPORT: Memastikan tidak ada error import di App.jsx
export const MitraProfilesView = () => {
  const navigate = useNavigate()
  
  // --- STATE ---
  const [allMitra, setAllMitra] = useState([])
  const [filteredMitra, setFilteredMitra] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [selectedMitra, setSelectedMitra] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('Semua')

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchMitra = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('Mitra')
          .select('*')
          .order('nama_perusahaan', { ascending: true })

        if (error) throw error
        setAllMitra(data || [])
        setFilteredMitra(data || [])
      } catch (error) {
        console.error("Error fetching mitra:", error.message)
      } finally {
        setLoading(false)
      }
    }
    fetchMitra()
  }, [])

  // --- FILTER LOGIC (Identik Landing Page) ---
  useEffect(() => {
    let result = allMitra
    if (activeCategory !== 'Semua') {
      result = result.filter(item => 
        item.bidang_industri && item.bidang_industri === activeCategory
      )
    }
    if (searchTerm) {
      result = result.filter(item => 
        item.nama_perusahaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    setFilteredMitra(result)
  }, [searchTerm, activeCategory, allMitra])

  // --- FUNGSI SEARCH TRIGGER ---
  const handleSearchTrigger = () => {
    const element = document.getElementById('mitra-results');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const ensureAbsoluteUrl = (url) => {
    if (!url) return '#';
    const link = url.trim();
    return (link.startsWith('http://') || link.startsWith('https://')) ? link : `https://${link}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', { 
      day: 'numeric', month: 'long', year: 'numeric' 
    })
  }

  // --- STYLES MANUAL (Sama Persis Landing Page) ---
  const styles = {
    modalOverlay: { zIndex: 9999 },
    navbar: { zIndex: 50, position: 'relative' },
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

  // Kategori dinamis dari data database
  const categories = ['Semua', ...new Set(allMitra.map(m => m.bidang_industri).filter(Boolean))]

  // --- MODAL COMPONENT (Gaya Identik AnnouncementModal) ---
  const MitraModal = ({ item, onClose }) => {
    if (!item) return null
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-sm animate-fade-in" style={styles.modalOverlay}>
        <div className="absolute inset-0" onClick={onClose}></div>
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-pop-in relative" 
          style={{ maxHeight: '85vh' }}
        >
          <div className="p-6 md:p-8 bg-blue-700 text-white shrink-0 relative">
            <div className="flex items-center mb-4">
              <span className="border border-white/80 text-white text-[12px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                {item.bidang_industri || 'PARTNER'}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold leading-snug uppercase pr-12">🏢 {item.nama_perusahaan}</h2>
            <div className="flex items-center gap-2 text-blue-100 text-sm mt-3 font-medium">
              <FiBriefcase size={16} /> <span>Partner Resmi Kerjasama</span>
            </div>
            <button onClick={onClose} className="absolute top-6 right-6 hover:bg-blue-600 p-2 rounded-full transition-all text-white flex items-center justify-center">
              <FiX size={24} />
            </button>
          </div>

          <div className="p-6 md:p-8 overflow-y-auto flex-grow bg-white custom-scrollbar">
            <div className="flex flex-col items-center mb-8">
              <div className="w-32 h-32 bg-white rounded-3xl border border-gray-100 p-4 flex items-center justify-center mb-4 shadow-sm">
                <img src={item.logo_url} alt={item.nama_perusahaan} className="max-w-full max-h-full object-contain" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${item.nama_perusahaan}&background=random&color=fff&size=128`; }} />
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">Profil Perusahaan</p>
            </div>
            <div className="text-gray-700 text-[15px] leading-[1.8] whitespace-pre-wrap break-words">
              {item.deskripsi || "Informasi detail belum tersedia."}
            </div>
          </div>

          <div className="px-6 py-4 flex justify-end bg-gray-50 border-t border-gray-100 shrink-0 gap-3">
             <a href={ensureAbsoluteUrl(item.website_url)} target="_blank" rel="noreferrer" className="px-6 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 transition-all flex items-center gap-2 uppercase tracking-widest">
                <FiGlobe /> Website
             </a>
             <button onClick={onClose} className="px-8 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/30 uppercase tracking-widest">
              Tutup Profil
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-gray-50 relative">
      {selectedMitra && <MitraModal item={selectedMitra} onClose={() => setSelectedMitra(null)} />}

      {/* HERO SECTION */}
      <div className="relative pb-32 pt-6 overflow-hidden" style={styles.heroGradient}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full transform translate-x-20 -translate-y-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 opacity-10 rounded-full transform -translate-x-10 translate-y-10 pointer-events-none"></div>

        <nav className="flex items-center justify-between px-6 max-w-7xl mx-auto mb-16" style={styles.navbar}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-10 backdrop-blur-md rounded-xl flex items-center justify-center text-white font-bold border border-white border-opacity-20 shadow-lg cursor-pointer" onClick={() => navigate('/')}>PNM</div>
            <h1 className="text-xl font-bold text-white tracking-wide">Kampus Portal</h1>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-blue-100">
             <Link to="/" className="hover:text-white transition">Beranda</Link>
             <a href="#" className="hover:text-white transition">Akademik</a>
             <a href="#" className="hover:text-white transition">Arsip</a>
             <Link to="/mitra" className="text-white font-bold border-b-2 border-blue-400 pb-1 flex items-center gap-1.5">
               Profil Mitra <FiBriefcase size={14} className="text-blue-300" />
             </Link>
          </div>
          <button onClick={() => navigate('/login')} className="bg-white text-blue-900 px-6 py-2.5 rounded-full font-bold shadow-lg hover:bg-blue-50 transition transform hover:-translate-y-0.5">
            Masuk
          </button>
        </nav>

        <div className="relative z-0 text-center px-4 max-w-5xl mx-auto">
           <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight drop-shadow-md uppercase tracking-tight">
             Profil Mitra <br/> 
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-300">
               Industri & Kerjasama
             </span>
           </h2>
           <div className="relative max-w-3xl mx-auto mb-10 transform hover:scale-[1.01] transition-transform duration-300">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                 <FiSearch className="text-blue-500 text-2xl" />
              </div>
              <input 
                type="text" placeholder="Cari perusahaan..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchTrigger()}
                className="w-full pl-16 pr-36 py-5 rounded-full focus:outline-none shadow-2xl text-gray-700 text-lg border-4 border-white/10 bg-white"
              />
              <button onClick={handleSearchTrigger} className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-full font-bold transition shadow-md active:scale-95">
                 Cari
              </button>
           </div>
           <div className="flex flex-wrap justify-center gap-3">
              {categories.map((cat, idx) => (
                 <button key={idx} onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2 rounded-full text-xs font-bold border transition-all hover:-translate-y-1
                       ${activeCategory === cat ? 'bg-white text-blue-900 border-white shadow-lg' : 'bg-blue-900/30 border-blue-400/30 text-blue-100 hover:bg-blue-900/50 hover:text-white'}`}>
                    {cat}
                 </button>
              ))}
           </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-16 -mt-10 relative z-10">
         <div id="mitra-results" className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-800 border-l-4 border-blue-600 pl-4 uppercase tracking-wider">
              Daftar Mitra Resmi
            </h3>
         </div>

         {loading ? (
             <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <FiLoader className="animate-spin text-4xl mb-3 text-blue-600" /> 
                <p>Memproses data mitra...</p>
             </div>
         ) : filteredMitra.length === 0 ? (
             <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-300">
                <FiBriefcase className="mx-auto text-6xl text-gray-200 mb-4" />
                <p className="text-gray-500 font-bold text-lg uppercase tracking-widest">Tidak ada mitra ditemukan.</p>
             </div>
         ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {filteredMitra.map((item) => (
                 <div key={item.id} className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col h-full transform hover:-translate-y-2">
                   <div className="h-44 relative overflow-visible" style={styles.cardHeaderGradient}>
                      <div className="absolute inset-0 bg-blue-900/10"></div>
                      <span className="absolute top-4 left-4 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider z-10">
                        {item.bidang_industri || 'PARTNER'}
                      </span>

                      {/* LOGO BOX: Putih Solid di Kanan Bawah agar tidak nabrak kategori */}
                      <div 
                        className="absolute -bottom-8 right-6 w-20 h-20 bg-white rounded-2xl flex items-center justify-center p-3 border-4 border-white shadow-xl cursor-pointer transform group-hover:scale-110 transition-transform duration-500 z-20" 
                        onClick={() => setSelectedMitra(item)}
                      >
                        <img 
                          src={item.logo_url} 
                          className="max-w-full max-h-full object-contain" 
                          onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${item.nama_perusahaan}&background=random&color=fff`; }} 
                        />
                      </div>
                   </div>

                   {/* Card Content dengan Padding Atas (pt-12) untuk ruang logo melayang */}
                   <div className="p-7 pt-12 flex-1 flex flex-col">
                     <h3 className="text-lg font-bold text-gray-800 mb-3 leading-snug cursor-pointer group-hover:text-blue-600 transition-colors uppercase" onClick={() => setSelectedMitra(item)}>{item.nama_perusahaan}</h3>
                     <p className="text-gray-500 text-sm mb-6 flex-1 leading-relaxed font-medium" style={styles.truncate}>{item.deskripsi}</p>
                     <div className="flex items-center justify-between pt-5 border-t border-gray-50 mt-auto">
                       <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest flex items-center gap-2">
                         <FiGlobe /> Website
                       </span>
                       <button onClick={() => setSelectedMitra(item)} className="flex items-center gap-1 text-blue-600 font-black text-xs hover:gap-2 transition-all group-hover:text-blue-700 uppercase tracking-wider">
                         Detail Profil <FiArrowRight />
                       </button>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
         )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-12 text-center mt-auto">
         <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">PNM</div>
            <span className="font-bold text-gray-700 uppercase tracking-tighter text-lg">Kampus <span className="text-blue-600">Portal</span></span>
         </div>
         <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">&copy; 2026 Politeknik Negeri Madiun. All rights reserved.</p>
      </footer>
    </div>
  )
}