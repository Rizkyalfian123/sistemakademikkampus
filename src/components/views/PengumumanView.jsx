import React, { useState, useEffect } from 'react';
import { 
  FiPlus, FiSearch, FiEye, FiSettings, 
  FiEdit2, FiTrash2, FiX, FiClock, FiImage 
} from 'react-icons/fi';
import { supabase } from '../../supabaseClient';
import { AnnouncementFormModal } from '../modals/AnnouncementFormModal';

export const PengumumanView = ({ user }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKategori, setFilterKategori] = useState('-- Semua --');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [viewingData, setViewingData] = useState(null);

  const fetchPengumuman = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('Pengumuman')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAnnouncements(data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => { fetchPengumuman(); }, []);

  const handleSavePengumuman = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingData) {
        await supabase.from('Pengumuman').update(formData).eq('id', editingData.id);
      } else {
        await supabase.from('Pengumuman').insert([formData]);
      }
      setIsModalOpen(false);
      setEditingData(null);
      fetchPengumuman();
    } catch (error) {
      console.error("Error saving data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePengumuman = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus pengumuman ini?")) return;
    try {
      await supabase.from('Pengumuman').delete().eq('id', id);
      fetchPengumuman();
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  };

  const formatDateTable = (date) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatTimeTable = (date) => new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
  const formatDateModal = (date) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const filteredData = announcements.filter((item) => {
    const matchSearch = item.Judul?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchKategori = filterKategori === '-- Semua --' || item.kategori === filterKategori;
    return matchSearch && matchKategori;
  });

  // Helper untuk Render Badge Status dengan Font & Border Standar
    const renderStatusBadge = (status) => {
    // Base class: Ukuran font kecil [9px], border abu-abu standar, dan padding rapat
    const baseClass = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gray-200 text-[9px] font-bold uppercase tracking-wider";
    
    switch (status) {
      case 'Approved':
        return (
          <span className={`${baseClass} bg-green-50 text-green-600`}>
            <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span>
            Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className={`${baseClass} bg-red-50 text-red-600`}>
            <span className="w-1 h-1 rounded-full bg-red-500"></span>
            Rejected
          </span>
        );
      default: // Pending
        return (
          <span className={`${baseClass} bg-yellow-50 text-yellow-600`}>
            <span className="w-1 h-1 rounded-full bg-yellow-500"></span>
            Pending
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col space-y-6 animate-pop-in">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pengumuman</h2>
          <p className="text-sm text-gray-400 font-medium">Daftar Pengumuman Kampus</p>
        </div>
        <button 
          onClick={() => { setEditingData(null); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md active:scale-95"
        >
          <FiPlus size={16} /> BUAT PENGUMUMAN
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="text-[10px] font-bold text-gray-400 mb-2 block uppercase tracking-wider">Cari Pengumuman</label>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan judul..."
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
          <table className="w-full text-left border-collapse">
            <thead className="bg-blue-600 text-white text-[10px] uppercase tracking-[0.15em] font-bold">
              <tr>
                <th className="px-6 py-4 w-32">Tanggal</th>
                <th className="px-6 py-4 w-40">Penulis</th>
                <th className="px-6 py-4">Judul</th>
                <th className="px-6 py-4 w-32 text-center">Status</th>
                <th className="px-6 py-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loadingData ? (
                <tr><td colSpan="5" className="text-center py-12 text-gray-400 text-xs italic">Memproses data...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-12 text-gray-400 text-xs italic">Tidak ada pengumuman ditemukan.</td></tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5 align-middle">
                      <div className="text-[13px] font-bold text-gray-800">{formatDateTable(row.created_at)}</div>
                      <div className="text-[10px] text-gray-400 font-medium mt-0.5 uppercase">{formatTimeTable(row.created_at)} WIB</div>
                    </td>
                    <td className="px-6 py-5 align-middle text-[12px] text-gray-600 font-medium">
                      {row.author || user?.name || 'Admin'}
                    </td>
                    <td className="px-6 py-5 align-middle">
                      <div 
                        className="text-[14px] font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-2" 
                        onClick={() => setViewingData(row)}
                      >
                         {row.Judul}
                         {row.image_url && <FiImage className="text-blue-400 shrink-0" size={14} title="Memiliki lampiran" />}
                      </div>
                      <p 
                        className="text-[12px] text-gray-500 leading-relaxed truncate max-w-xs md:max-w-md"
                      >
                        {row.isi_pengumuman}
                      </p>
                      <div className="mt-1.5">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded border border-gray-200 uppercase tracking-tighter">{row.kategori || 'Umum'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-middle text-center">
                      {renderStatusBadge(row.status)}
                    </td>
                    <td className="px-6 py-5 align-middle">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => setViewingData(row)} 
                          className="w-9 h-9 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <FiEye size={16} />
                        </button>
                        <div className="relative group/menu">
                          <button className="w-9 h-9 flex items-center justify-center bg-gray-50 text-gray-400 hover:text-gray-800 rounded-full transition-all border border-transparent hover:border-gray-200">
                            <FiSettings size={16} />
                          </button>
                          <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20 overflow-hidden translate-y-2 group-hover/menu:translate-y-0">
                            <button 
                              onClick={() => { setEditingData(row); setIsModalOpen(true); }} 
                              className="w-full px-4 py-2.5 text-left text-[11px] hover:bg-blue-50 flex items-center gap-2 font-bold text-gray-700 border-b border-gray-50"
                            >
                              <FiEdit2 className="text-blue-500" size={13}/> Edit
                            </button>
                            <button 
                              onClick={() => handleDeletePengumuman(row.id)} 
                              className="w-full px-4 py-2.5 text-left text-[11px] hover:bg-red-50 text-red-600 flex items-center gap-2 font-bold"
                            >
                              <FiTrash2 size={13}/> Hapus
                            </button>
                          </div>
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

      {/* MODAL DETAIL PENGUMUMAN */}
      {viewingData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-sm animate-fade-in">
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-pop-in" 
            style={{ maxHeight: '75vh' }}
          >
            {/* Header Biru */}
            <div className="p-6 md:p-8 bg-blue-700 text-white shrink-0 relative">
              <div className="flex items-center gap-3 mb-4">
                <span className="border border-white/80 text-white text-[12px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                  {viewingData.kategori || 'UMUM'}
                </span>
                
                {/* STATUS BADGE MODAL */}
                <span className={`px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider border border-gray-200/30 ${
                  viewingData.status === 'Approved' ? 'bg-emerald-500 text-white' :
                  viewingData.status === 'Rejected' ? 'bg-red-500 text-white' :
                  'bg-amber-500 text-white'
                }`}>
                  {viewingData.status || 'PENDING'}
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
              {viewingData.image_url && (
                viewingData.image_url.toLowerCase().includes('qr') ? (
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

              <div className="text-gray-700 text-[15px] leading-[1.8] whitespace-pre-wrap break-words">
                {viewingData.isi_pengumuman}
              </div>
              
              <div className="mt-10 pt-6 border-t border-gray-100 text-gray-400 text-[13px] italic text-center">
                Dokumen ini dipublikasikan secara resmi melalui sistem informasi akademik.
              </div>
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-4 flex justify-end bg-gray-50 border-t border-gray-100 shrink-0">
               <button onClick={() => setViewingData(null)} className="px-8 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/30">
                Tutup Pengumuman
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INPUT (CREATE/EDIT) */}
      <AnnouncementFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleSavePengumuman} 
        initialData={editingData} 
        isLoading={isSubmitting} 
      />
    </div>
  );
};