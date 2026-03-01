import React, { useState, useEffect } from 'react';
import { 
  FiPlus, FiSearch, FiEye, FiSettings, 
  FiEdit2, FiTrash2, FiX, FiClock 
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
                <th className="px-6 py-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loadingData ? (
                <tr><td colSpan="4" className="text-center py-12 text-gray-400 text-xs">Memproses data...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-12 text-gray-400 text-xs">Tidak ada pengumuman ditemukan.</td></tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5 align-middle">
                      <div className="text-[13px] font-bold text-gray-800">{formatDateTable(row.created_at)}</div>
                      <div className="text-[10px] text-gray-400 font-medium mt-0.5">{formatTimeTable(row.created_at)} WIB</div>
                    </td>
                    <td className="px-6 py-5 align-middle text-[12px] text-gray-600 font-medium">
                      {user?.name || 'Admin'}
                    </td>
                    <td className="px-6 py-5 align-middle">
                      <div 
                        className="text-[14px] font-bold text-gray-800 mb-1.5 group-hover:text-blue-600 transition-colors cursor-pointer" 
                        onClick={() => setViewingData(row)}
                      >
                         {row.Judul}
                      </div>
                      <p 
                        className="text-[12px] text-gray-500 leading-relaxed mb-3 max-w-3xl"
                        style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                      >
                        {row.isi_pengumuman}
                      </p>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase">{row.kategori || 'Umum'}</span>
                        <span className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded uppercase">Aktif</span>
                      </div>
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

      {/* ========================================================= */}
      {/* MODAL DETAIL PENGUMUMAN */}
      {/* ========================================================= */}
      {viewingData && (
        /* PERUBAHAN PENTING: Gunakan bg-black bg-opacity-70 agar dijamin gelap di versi Tailwind manapun */
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-sm animate-fade-in">
          
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-pop-in" 
            style={{ maxHeight: '75vh' }}
          >
            {/* Header Biru */}
            <div className="p-6 md:p-8 bg-blue-700 text-white shrink-0 relative">
              <div className="flex items-center mb-4">
                <span className="border border-white/80 text-white text-[12px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                  {viewingData.kategori || 'PRESTASI'}
                </span>
              </div>
              
              <h2 className="text-xl md:text-2xl font-bold leading-snug uppercase pr-12">
                📢 {viewingData.Judul}
              </h2>
              
              <div className="flex items-center gap-2 text-blue-100 text-sm mt-3 font-medium">
                <FiClock size={16} /> 
                <span>{formatDateModal(viewingData.created_at)}</span>
              </div>
              
              <button 
                onClick={() => setViewingData(null)} 
                className="absolute top-6 right-6 hover:bg-blue-600 p-2 rounded-full transition-all text-white flex items-center justify-center"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 md:p-8 overflow-y-auto flex-grow bg-white custom-scrollbar">
              <div className="text-gray-700 text-[15px] leading-[1.8] whitespace-pre-wrap break-words">
                {viewingData.isi_pengumuman}
              </div>
              
              {/* Tanda Tangan */}
              <div className="mt-8 pt-4 text-gray-600 text-[14px] space-y-1.5">
                <p>📍 Madiun, {formatDateModal(viewingData.created_at)}</p>
                <p>🎓 Politeknik Negeri Madiun</p>
                <p>Bagian Kemahasiswaan</p>
              </div>
            </div>

            {/* Footer Modal dengan Tombol Tutup Grey */}
            <div className="px-6 py-4 flex justify-end bg-white border-t border-gray-100 shrink-0">
               <button 
                onClick={() => setViewingData(null)} 
                className="px-8 py-2.5 rounded-xl bg-gray-200 text-gray-800 text-sm font-bold hover:bg-gray-300 transition-all active:scale-95"
              >
                Tutup
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