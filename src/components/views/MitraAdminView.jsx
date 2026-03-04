import React, { useState, useEffect } from 'react';
import { 
  FiPlus, FiSearch, FiEye, FiSettings, 
  FiEdit2, FiTrash2, FiX, FiBriefcase, FiGlobe, FiLoader, FiImage 
} from 'react-icons/fi';
import { supabase } from '../../supabaseClient';
import { MitraFormModal } from '../modals/MitraFormModal';

export const MitraAdminView = ({ user }) => {
  const [mitra, setMitra] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterIndustri, setFilterIndustri] = useState('-- Semua --');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [viewingData, setViewingData] = useState(null);

  const fetchMitra = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('Mitra')
        .select('*')
        .order('nama_perusahaan', { ascending: true });
      if (error) throw error;
      setMitra(data || []);
    } catch (err) {
      console.error("Error fetching mitra data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => { fetchMitra(); }, []);

  const handleSaveMitra = async (formData) => {
      setIsSubmitting(true);
      try {
        const { data, error } = editingData 
          ? await supabase.from('Mitra').update(formData).eq('id', editingData.id)
          : await supabase.from('Mitra').insert([formData]);

        if (error) {
          // Tampilkan pesan error spesifik dari Supabase
          alert("Gagal Simpan! Pesan Error: " + error.message);
          console.error("Detail Error:", error);
        } else {
          alert("Data Berhasil Masuk!");
          setIsModalOpen(false);
          setEditingData(null);
          fetchMitra();
        }
      } catch (err) {
        alert("Terjadi kesalahan sistem: " + err.message);
      } finally {
        setIsSubmitting(false);
      }
    };

  const handleDeleteMitra = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus profil mitra ini?")) return;
    try {
      await supabase.from('Mitra').delete().eq('id', id);
      fetchMitra();
    } catch (error) {
      console.error("Error deleting mitra:", error);
    }
  };

  const ensureAbsoluteUrl = (url) => {
    if (!url) return '#';
    const link = url.trim();
    return (link.startsWith('http://') || link.startsWith('https://')) ? link : `https://${link}`;
  };

  // Ambil list unik industri secara dinamis untuk filter dropdown
  const listIndustri = ['-- Semua --', ...new Set(mitra.map(m => m.bidang_industri).filter(Boolean))];

  const filteredData = mitra.filter((item) => {
    const matchSearch = item.nama_perusahaan?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchIndustri = filterIndustri === '-- Semua --' || item.bidang_industri === filterIndustri;
    return matchSearch && matchIndustri;
  });

  return (
    <div className="flex flex-col space-y-6 animate-pop-in">
      
      {/* HEADER SECTION (Identik PengumumanView) */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Profil Mitra</h2>
          <p className="text-sm text-gray-400 font-medium">Kelola data kerjasama industri kampus</p>
        </div>
        <button 
          onClick={() => { setEditingData(null); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md active:scale-95"
        >
          <FiPlus size={16} /> TAMBAH MITRA
        </button>
      </div>

      {/* FILTER & SEARCH BAR (Identik PengumumanView) */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="text-[10px] font-bold text-gray-400 mb-2 block uppercase tracking-wider">Cari Nama Perusahaan</label>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>
        <div className="w-full md:w-64">
          <label className="text-[10px] font-bold text-gray-400 mb-2 block uppercase tracking-wider">Bidang Industri</label>
          <select 
            value={filterIndustri} onChange={(e) => setFilterIndustri(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer font-semibold text-gray-600"
          >
            {listIndustri.map((ind, idx) => <option key={idx} value={ind}>{ind}</option>)}
          </select>
        </div>
      </div>

      {/* TABLE LIST */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-blue-600 text-white text-[10px] uppercase tracking-[0.15em] font-bold">
              <tr>
                <th className="px-6 py-4 w-28 text-center">Logo</th>
                <th className="px-6 py-4">Informasi Perusahaan</th>
                <th className="px-6 py-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loadingData ? (
                <tr><td colSpan="3" className="text-center py-12 text-gray-400 text-xs">Memproses data...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="3" className="text-center py-12 text-gray-400 text-xs">Tidak ada data mitra ditemukan.</td></tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5 align-middle text-center">
                      <div className="w-16 h-16 bg-white rounded-xl border border-gray-100 p-2 flex items-center justify-center shadow-sm mx-auto overflow-hidden">
                         <img 
                            src={row.logo_url} 
                            alt={row.nama_perusahaan}
                            className="max-w-full max-h-full object-contain" 
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${row.nama_perusahaan}&background=random&color=fff`; }}
                         />
                      </div>
                    </td>
                    <td className="px-6 py-5 align-middle">
                      <div 
                        className="text-[14px] font-bold text-gray-800 mb-1.5 group-hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-2 uppercase" 
                        onClick={() => setViewingData(row)}
                      >
                         {row.nama_perusahaan}
                      </div>
                      <p className="text-[12px] text-gray-500 leading-relaxed mb-3 max-w-3xl line-clamp-2">
                        {row.deskripsi || "Tidak ada deskripsi perusahaan."}
                      </p>
                      <div className="flex gap-2 items-center">
                        <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase">{row.bidang_industri || 'Umum'}</span>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                           <FiGlobe className="text-blue-400" /> 
                           <a href={ensureAbsoluteUrl(row.website_url)} target="_blank" rel="noreferrer" className="hover:underline">{row.website_url || '-'}</a>
                        </div>
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
                              onClick={() => handleDeleteMitra(row.id)} 
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
      {/* MODAL DETAIL MITRA (IDENTIK DENGAN DESAIN PENGUMUMAN) */}
      {/* ========================================================= */}
      {viewingData && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-pop-in" style={{ maxHeight: '85vh' }}>
            
            {/* Header Biru Spanduk */}
            <div className="p-6 md:p-8 bg-blue-700 text-white shrink-0 relative overflow-visible">
              <div className="flex items-center mb-4">
                <span className="border border-white/80 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                  {viewingData.bidang_industri || 'PARTNER'}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold leading-snug uppercase pr-12">
                🏢 {viewingData.nama_perusahaan}
              </h2>
              <div className="flex items-center gap-2 text-blue-100 text-sm mt-3 font-medium">
                <FiBriefcase size={16} /> 
                <span>Partner Resmi Kampus</span>
              </div>
              
              {/* --- DESAIN LOGO PUTIH SOLID DI KANAN BAWAH SPANDUK --- */}
              <div className="absolute -bottom-8 right-8 w-24 h-24 bg-white rounded-2xl flex items-center justify-center p-3 border-4 border-white shadow-xl z-20">
                <img 
                  src={viewingData.logo_url} 
                  alt={viewingData.nama_perusahaan}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${viewingData.nama_perusahaan}&background=random&color=fff`; }}
                />
              </div>
              
              <button onClick={() => setViewingData(null)} className="absolute top-6 right-6 hover:bg-blue-600 p-2 rounded-full transition-all text-white flex items-center justify-center">
                <FiX size={24} />
              </button>
            </div>

            {/* Content Area dengan Padding Atas Ekstra (pt-12) untuk ruang Logo */}
            <div className="p-6 md:p-8 pt-12 overflow-y-auto flex-grow bg-white custom-scrollbar">
              <h3 className="text-gray-400 font-bold text-xs uppercase tracking-[0.3em] mb-4">Tentang Perusahaan</h3>
              <div className="text-gray-700 text-[15px] leading-[1.8] whitespace-pre-wrap break-words font-medium">
                {viewingData.deskripsi || "Informasi profil perusahaan belum tersedia."}
              </div>

              <div className="mt-10 pt-6 border-t border-gray-100 space-y-3">
                 <div className="flex items-center gap-3 text-sm text-gray-500 font-bold">
                    <FiGlobe className="text-blue-600" /> 
                    <span>Website Resmi: </span>
                    <a href={ensureAbsoluteUrl(viewingData.website_url)} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{viewingData.website_url || '-'}</a>
                 </div>
              </div>
            </div>

            <div className="px-6 py-4 flex justify-end bg-gray-50 border-t border-gray-100 shrink-0 gap-3">
               <button onClick={() => setViewingData(null)} className="px-6 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 transition-all">
                Kembali
              </button>
              <a href={ensureAbsoluteUrl(viewingData.website_url)} target="_blank" rel="noreferrer" className="px-8 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30">
                Kunjungi Website
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INPUT (CREATE/EDIT) */}
      <MitraFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleSaveMitra} 
        initialData={editingData} 
        isLoading={isSubmitting} 
      />
    </div>
  );
};