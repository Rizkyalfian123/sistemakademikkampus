import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiAlertCircle, FiClock, FiEdit3 } from 'react-icons/fi';

export const TaskFormModal = ({ isOpen, onClose, onSubmit, initialData, isLoading }) => {
  const [formData, setFormData] = useState({
    nama_tugas: '',
    deskripsi: '',
    deadline: '',
    prioritas: 'Sedang',
    pic_name: 'Admin'
  });

  // Reset atau isi form saat modal dibuka/edit
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        nama_tugas: '',
        deskripsi: '',
        deadline: '',
        prioritas: 'Sedang',
        pic_name: 'Admin'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 overflow-hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-pop-in flex flex-col">
        
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              {initialData ? <FiEdit3 size={20}/> : <FiSave size={20}/>}
            </div>
            <div>
              <h2 className="text-lg font-bold">{initialData ? 'Edit Tugas' : 'Tambah Tugas Baru'}</h2>
              <p className="text-[10px] opacity-70 uppercase tracking-widest font-bold">Manajemen Pending Task</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-all">
            <FiX size={24} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto" style={{ maxHeight: '70vh' }}>
          
          {/* Nama Tugas */}
          <div>
            <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 block">Nama Tugas</label>
            <input 
              required
              type="text"
              value={formData.nama_tugas}
              onChange={(e) => setFormData({...formData, nama_tugas: e.target.value})}
              placeholder="Contoh: Revisi Surat Keterangan..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 block">Deskripsi Detail</label>
            <textarea 
              required
              rows="4"
              value={formData.deskripsi}
              onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
              placeholder="Jelaskan instruksi tugas di sini..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Deadline */}
            <div>
              <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 block">Deadline</label>
              <div className="relative">
                <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  required
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* Prioritas */}
            <div>
              <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 block">Prioritas</label>
              <select 
                value={formData.prioritas}
                onChange={(e) => setFormData({...formData, prioritas: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                <option value="Tinggi">Tinggi</option>
                <option value="Sedang">Sedang</option>
                <option value="Rendah">Rendah</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 text-amber-700 mt-2">
            <FiAlertCircle size={24} className="shrink-0" />
            <p className="text-[11px] leading-relaxed">Tugas yang Anda simpan akan muncul di daftar antrean pending dan dapat dilihat oleh admin lainnya.</p>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:bg-gray-200 rounded-xl transition-all"
          >
            Batal
          </button>
          <button 
            disabled={isLoading}
            onClick={handleSubmit}
            className="px-8 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
          >
            {isLoading ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Buat Tugas')}
          </button>
        </div>
      </div>
    </div>
  );
};