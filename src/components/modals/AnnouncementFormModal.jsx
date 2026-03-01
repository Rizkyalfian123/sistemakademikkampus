import React, { useState, useEffect } from 'react';
import { 
  FiX, FiType, FiTag, FiAlignLeft, FiSave, FiBell 
} from 'react-icons/fi';

export const AnnouncementFormModal = ({ isOpen, onClose, onSubmit, initialData, isLoading }) => {
  const [formData, setFormData] = useState({
    Judul: '',
    kategori: 'Umum',
    isi_pengumuman: ''
  });

  // Populate data jika sedang mode Edit
  useEffect(() => {
    if (initialData) {
      setFormData({
        Judul: initialData.Judul || '',
        kategori: initialData.kategori || 'Umum',
        isi_pengumuman: initialData.isi_pengumuman || ''
      });
    } else {
      setFormData({ Judul: '', kategori: 'Umum', isi_pengumuman: '' });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in">
      <div 
        // PERBAIKAN 1: Tambahkan maxHeight agar kotak tidak bablas ke bawah layar
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden animate-pop-in"
        style={{ maxHeight: '85vh' }} 
      >
        {/* HEADER - Dibuat shrink-0 agar ukurannya tidak mengecil */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
          <div className="flex gap-4 items-center">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner border border-white">
              <FiBell size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                {initialData ? 'Edit Pengumuman' : 'Tambah Pengumuman'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Lengkapi informasi di bawah untuk dipublikasikan.</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* BODY FORM - Dibungkus form agar submit berfungsi */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
          
          {/* PERBAIKAN 2: Area ini bisa di-scroll jika layar kecil */}
          <div className="p-6 md:p-8 flex-grow overflow-y-auto custom-scrollbar flex flex-col gap-5">
            
            {/* Input: Judul */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-gray-700">
                Judul Pengumuman <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <FiType size={16} />
                </div>
                <input 
                  type="text" 
                  name="Judul"
                  required
                  value={formData.Judul}
                  onChange={handleChange}
                  placeholder="Contoh: Pendaftaran KRS Semester Genap 2026"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Input: Kategori */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-gray-700">
                Kategori <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <FiTag size={16} />
                </div>
                <select 
                  name="kategori"
                  required
                  value={formData.kategori}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer appearance-none"
                >
                  <option value="Umum">Umum</option>
                  <option value="Akademik">Akademik</option>
                  <option value="Prestasi">Prestasi</option>
                  <option value="Beasiswa">Beasiswa</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Input: Isi Pengumuman */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-gray-700">
                Isi Pengumuman <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute top-3 left-0 pl-3.5 flex items-start pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <FiAlignLeft size={16} />
                </div>
                <textarea 
                  name="isi_pengumuman"
                  required
                  rows="4"
                  value={formData.isi_pengumuman}
                  onChange={handleChange}
                  placeholder="Tuliskan deskripsi lengkap atau detail pengumuman di sini..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all custom-scrollbar resize-none"
                ></textarea>
              </div>
            </div>

          </div>

          {/* PERBAIKAN 3: FOOTER ACTIONS - Dibuat shrink-0 agar selalu menempel di bawah */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white shrink-0">
            <button 
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2 rounded-xl text-[13px] font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 rounded-xl text-[13px] font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FiSave size={16} />
              )}
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
};