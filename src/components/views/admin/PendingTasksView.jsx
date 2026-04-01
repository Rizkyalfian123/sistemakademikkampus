import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // PENTING: Untuk narik modal ke tengah layar
import { 
  FiSearch, FiEye, FiSettings, 
  FiCheck, FiX, FiClock, FiImage, FiXCircle 
} from 'react-icons/fi';
import { supabase } from '../../../supabaseClient';

export const PendingTasksView = ({ user }) => {
  const [tasks, setTasks] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKategori, setFilterKategori] = useState('-- Semua --');
  
  const [viewingData, setViewingData] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // --- AMBIL DATA HANYA YANG PENDING ---
  const fetchTasks = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('Pengumuman')
        .select('*')
        .eq('status', 'pending') // HANYA TAMPILKAN PENDING
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => { 
    fetchTasks(); 
    const closeDropdown = () => setActiveMenuId(null);
    window.addEventListener('click', closeDropdown);
    return () => window.removeEventListener('click', closeDropdown);
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      const { error } = await supabase
        .from('Pengumuman')
        .update({ status: status }) 
        .eq('id', id);
      if (error) throw error;
      
      // Refresh data agar yang sudah di-update hilang dari list pending
      fetchTasks();
      // Tutup semua overlay
      setActiveMenuId(null);
      setViewingData(null);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const formatDateTable = (date) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatTimeTable = (date) => new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
  const formatDateModal = (date) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const filteredData = tasks.filter((item) => {
    const matchSearch = item.Judul?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchKategori = filterKategori === '-- Semua --' || item.kategori === filterKategori;
    return matchSearch && matchKategori;
  });

  return (
    <div className="flex flex-col space-y-6 animate-pop-in">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Antrean Moderasi</h2>
          <p className="text-sm text-gray-400 font-medium">Daftar pengumuman yang menunggu persetujuan (Pending).</p>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="text-[10px] font-bold text-gray-400 mb-2 block uppercase tracking-wider">Cari Pengumuman</label>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>
        <div className="w-full md:w-64">
          <label className="text-[10px] font-bold text-gray-400 mb-2 block uppercase tracking-wider">Kategori</label>
          <select 
            value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer font-semibold text-gray-600"
          >
            <option>-- Semua --</option>
            <option>Umum</option>
            <option>Akademik</option>
            <option>Prestasi</option>
            <option>Beasiswa</option>
          </select>
        </div>
      </div>

      {/* TABLE LIST */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <thead className="bg-blue-600 text-white text-[10px] uppercase tracking-[0.15em] font-bold">
              <tr>
                <th className="px-6 py-4 w-32">Tanggal</th>
                <th className="px-6 py-4 w-40">Penulis</th>
                <th className="px-6 py-4">Judul</th>
                <th className="px-6 py-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loadingData ? (
                <tr><td colSpan="4" className="text-center py-20 text-gray-400 text-xs italic">Memproses data...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-20 text-gray-400 text-xs italic">Antrean moderasi kosong. ✨</td></tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5 align-top">
                      <div className="text-[13px] font-bold text-gray-800 leading-tight">{formatDateTable(row.created_at)}</div>
                      <div className="text-[10px] text-gray-400 font-medium mt-0.5 uppercase">{formatTimeTable(row.created_at)} WIB</div>
                    </td>
                    <td className="px-6 py-5 align-top text-[12px] text-gray-600 font-medium">
                      {user?.name || 'Kurokawa'}
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="flex flex-col gap-1 w-full overflow-hidden">
                        <h3 
                          className="text-[14px] font-bold text-gray-800 uppercase truncate cursor-pointer hover:text-blue-600 transition-colors" 
                          onClick={() => setViewingData(row)}
                        >
                           {row.Judul}
                           {row.image_url && <FiImage className="text-blue-400 shrink-0 ml-1 inline" size={14}/>}
                        </h3>
                        <p 
                          className="text-[12px] text-gray-500 leading-relaxed break-words"
                          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                        >
                          {row.isi_pengumuman}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase">{row.kategori || 'Umum'}</span>
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded uppercase">Moderasi</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => setViewingData(row)} 
                          className="w-12 h-9 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <FiEye size={16} />
                        </button>
                        <div className="relative">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === row.id ? null : row.id); }}
                            className={`w-9 h-9 flex items-center justify-center rounded-full transition-all border ${activeMenuId === row.id ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400 hover:text-gray-800 border-transparent hover:border-gray-200'}`}
                          >
                            <FiSettings size={16} />
                          </button>
                          {activeMenuId === row.id && (
                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 z-[100] overflow-hidden py-1 animate-pop-in">
                              <button 
                                onClick={() => handleStatusUpdate(row.id, 'Approved')} 
                                className="w-full px-4 py-2.5 text-left text-[11px] hover:bg-emerald-50 text-emerald-600 flex items-center gap-2 font-bold border-b border-gray-50"
                              >
                                <FiCheck size={14}/> Approved
                              </button>
                              <button 
                                onClick={() => handleStatusUpdate(row.id, 'Rejected')} 
                                className="w-full px-4 py-2.5 text-left text-[11px] hover:bg-red-50 text-red-500 flex items-center gap-2 font-bold"
                              >
                                <FiX size={14}/> Rejected
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PORTAL MODAL - PINDAH KE BODY AGAR SELALU DI TENGAH LAYAR */}
      {viewingData && createPortal(
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-sm animate-fade-in">
                <div 
                  className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-pop-in" 
                  style={{ maxHeight: '75vh' }}
                >
                  {/* Header Biru */}
                  <div className="p-6 md:p-8 bg-blue-700 text-white shrink-0 relative">
                    <div className="flex items-center mb-4">
                      <span className="border border-white/80 text-white text-[12px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                        {viewingData.kategori || 'UMUM'}
                      </span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold leading-snug uppercase pr-12">
                      📢 {viewingData.Judul}
                    </h2>
                    <div className="flex items-center gap-2 text-blue-100 text-sm mt-3 font-medium">
                      <FiClock size={16} /> 
                      <span>{formatDateModal(viewingData.created_at)}</span>
                    </div>
                    <button onClick={() => setViewingData(null)} className="absolute top-6 right-6 hover:bg-blue-600 p-2 rounded-full transition-all text-white flex items-center justify-center">
                      <FiX size={24} />
                    </button>
                  </div>
      
                  {/* Content Area */}
                  <div className="p-6 md:p-8 overflow-y-auto flex-grow bg-white custom-scrollbar">
                    
                    {/* TAMPILAN GAMBAR / QR CODE VERIFIKASI */}
                    {viewingData.image_url && (
                      viewingData.image_url.toLowerCase().includes('qr') ? (
                        /* 1. GAYA KHUSUS QR CODE (Rapi di Tengah) */
                        <div className="mb-8 flex flex-col items-center justify-center p-8 bg-blue-50/30 rounded-3xl border-2 border-dashed border-blue-100">
                          <div className="bg-white p-4 rounded-2xl shadow-xl border border-blue-50">
                            <img src={viewingData.image_url} alt="QR Verification" className="w-40 h-40 object-contain" />
                          </div>
                          <div className="mt-4 text-center">
                            <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em]">E-Signature Verified</p>
                            <p className="text-[10px] text-gray-400 mt-1">Scan untuk verifikasi keaslian dokumen</p>
                          </div>
                        </div>
                      ) : (
                        /* 2. GAYA LAMPIRAN DOKUMEN OCR (Lebar Kertas) */
                        <div className="mb-6 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 group relative">
                          <img 
                            src={viewingData.image_url} 
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
                      {viewingData.isi_pengumuman}
                    </div>
                    
                    <div className="mt-10 pt-6 border-t border-gray-100 text-gray-400 text-[13px] italic text-center">
                      Dokumen ini dipublikasikan secara resmi melalui sistem informasi akademik.
                    </div>
                  </div>
      
                  {/* Footer Modal */}
                  <div className="px-6 py-4 flex flex-wrap justify-end items-center gap-3 bg-gray-50 border-t border-gray-100 shrink-0">
                    
                    {/* Tombol Reject / Tolak */}
                    <button 
                      onClick={() => handleStatusUpdate(viewingData.id, 'Rejected')} 
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-rose-500/30"
                    >
                      <FiXCircle size={18} />
                      Tolak
                    </button>

                    {/* Tombol Approve / Setujui */}
                    <button 
                      onClick={() => handleStatusUpdate(viewingData.id, 'Approved')} 
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-all active:scale-95 shadow-lg shadow-emerald-500/30"
                    >
                      <FiCheck size={18} />
                      Setujui
                    </button>

                    {/* Spacer */}
                    <div className="h-8 w-[1px] bg-gray-300 mx-1 hidden md:block"></div>

                    {/* Tombol Tutup */}
                    <button 
                      onClick={() => setViewingData(null)} 
                      className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/30"
                    >
                      Tutup Pengumuman
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}
    </div>
  );
};