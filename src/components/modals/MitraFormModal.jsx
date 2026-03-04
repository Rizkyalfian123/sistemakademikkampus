import React, { useState, useEffect } from 'react';
import { 
  FiX, FiType, FiTag, FiAlignLeft, FiSave, FiBriefcase, FiGlobe, FiImage, FiUpload, FiLink, FiLoader 
} from 'react-icons/fi';
import { supabase } from '../../supabaseClient';

export const MitraFormModal = ({ isOpen, onClose, onSubmit, initialData, isLoading }) => {
  const [formData, setFormData] = useState({
    nama_perusahaan: '',
    bidang_industri: '',
    logo_url: '',
    deskripsi: '',
    website_url: ''
  });

  const [uploadMethod, setUploadMethod] = useState('url'); // 'url' atau 'upload'
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Sinkronisasi data saat modal dibuka (untuk mode Edit)
  useEffect(() => {
    if (initialData) {
      setFormData({
        nama_perusahaan: initialData.nama_perusahaan || '',
        bidang_industri: initialData.bidang_industri || '',
        logo_url: initialData.logo_url || '',
        deskripsi: initialData.deskripsi || '',
        website_url: initialData.website_url || ''
      });
      setUploadMethod('url');
    } else {
      setFormData({ nama_perusahaan: '', bidang_industri: '', logo_url: '', deskripsi: '', website_url: '' });
      setSelectedFile(null);
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProcessSubmit = async (e) => {
    e.preventDefault();
    let finalLogoUrl = formData.logo_url;

    // Logika Unggah File ke Supabase Storage
    if (uploadMethod === 'upload' && selectedFile) {
      setIsUploading(true);
      try {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `logos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('mitra-logos')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('mitra-logos')
          .getPublicUrl(filePath);

        finalLogoUrl = data.publicUrl;
      } catch (error) {
        alert("Gagal mengunggah logo: " + error.message);
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    // Kirim data akhir ke fungsi onSubmit di MitraAdminView
    onSubmit({ ...formData, logo_url: finalLogoUrl });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden animate-pop-in"
        style={{ maxHeight: '75vh' }} 
      >
        {/* HEADER - Identik dengan AnnouncementFormModal */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
          <div className="flex gap-4 items-center">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner border border-white">
              <FiBriefcase size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                {initialData ? 'Edit Profil Mitra' : 'Tambah Mitra Baru'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Kelola informasi kerjasama industri kampus.</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* BODY FORM */}
        <form onSubmit={handleProcessSubmit} className="flex flex-col flex-grow overflow-hidden">
          
          <div className="p-6 md:p-8 flex-grow overflow-y-auto custom-scrollbar flex flex-col gap-5">
            
            {/* Input: Nama Perusahaan */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-gray-700">Nama Perusahaan <span className="text-red-500">*</span></label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <FiType size={16} />
                </div>
                <input 
                  type="text" name="nama_perusahaan" required value={formData.nama_perusahaan} onChange={handleChange}
                  placeholder="Contoh: PT. Teknologi Indonesia"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold"
                />
              </div>
            </div>

            {/* Input: Bidang Industri */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-gray-700">Bidang Industri <span className="text-red-500">*</span></label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <FiTag size={16} />
                </div>
                <input 
                  type="text" name="bidang_industri" required value={formData.bidang_industri} onChange={handleChange}
                  placeholder="Contoh: Informatika / Multimedia / Elektro"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Pemilih Metode Logo (Tab Style) */}
            <div className="flex flex-col gap-2">
               <label className="text-[12px] font-bold text-gray-700 uppercase tracking-widest opacity-60">Metode Input Logo</label>
               <div className="flex p-1 bg-gray-100 rounded-xl gap-1">
                  <button type="button" onClick={() => setUploadMethod('url')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-bold transition-all ${uploadMethod === 'url' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>
                    <FiLink size={14} /> Tempel URL
                  </button>
                  <button type="button" onClick={() => setUploadMethod('upload')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-bold transition-all ${uploadMethod === 'upload' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>
                    <FiUpload size={14} /> Unggah File
                  </button>
               </div>
            </div>

            {/* Input: Logo (URL vs Upload) */}
            <div className="flex flex-col gap-2">
              {uploadMethod === 'url' ? (
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500">
                    <FiImage size={16} />
                  </div>
                  <input 
                    type="text" name="logo_url" value={formData.logo_url} onChange={handleChange}
                    placeholder="https://example.com/logo-mitra.png"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative group flex flex-col items-center gap-2">
                  <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <FiUpload size={24} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest text-center">
                    {selectedFile ? selectedFile.name : 'Klik untuk pilih file logo perusahaan'}
                  </span>
                </div>
              )}
            </div>

            {/* Input: Website URL */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-gray-700">Website Resmi</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500">
                  <FiGlobe size={16} />
                </div>
                <input 
                  type="text" name="website_url" value={formData.website_url} onChange={handleChange}
                  placeholder="www.perusahaan.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold text-blue-600"
                />
              </div>
            </div>

            {/* Input: Deskripsi */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-gray-700">Profil Singkat</label>
              <div className="relative group">
                <div className="absolute top-3 left-0 pl-3.5 flex items-start pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <FiAlignLeft size={16} />
                </div>
                <textarea 
                  name="deskripsi" rows="3" value={formData.deskripsi} onChange={handleChange}
                  placeholder="Jelaskan profil singkat perusahaan..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all custom-scrollbar resize-none font-medium leading-relaxed"
                ></textarea>
              </div>
            </div>
          </div>

          {/* FOOTER ACTIONS - Identik dengan AnnouncementFormModal */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white shrink-0">
            <button 
              type="button" onClick={onClose} disabled={isLoading || isUploading}
              className="px-6 py-2 rounded-xl text-[12px] font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit" disabled={isLoading || isUploading}
              className="px-6 py-2 rounded-xl text-[12px] font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest"
            >
              {(isLoading || isUploading) ? (
                <FiLoader className="animate-spin" size={16} />
              ) : (
                <FiSave size={16} />
              )}
              {isUploading ? 'Mengunggah...' : (isLoading ? 'Menyimpan...' : 'Simpan')}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
};