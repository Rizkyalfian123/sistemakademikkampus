import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiUser, FiCalendar, FiMapPin, FiBook } from 'react-icons/fi';
import { PortalOverlay } from '../shared/PortalOverlay';

export const FormModal = ({ isOpen, onClose, onSubmit, user, initialData }) => {
  if (!isOpen) return null;

  // State Form Input Manual
  const [formData, setFormData] = useState({
    judul_ta: '',
    hari_tanggal: '',
    ruang_waktu: ''
  });

  // Load data jika ada (untuk edit)
  useEffect(() => {
    if (initialData) {
      setFormData({
        judul_ta: initialData.judul_ta || '',
        hari_tanggal: initialData.hari_tanggal || '',
        ruang_waktu: initialData.ruang_waktu || ''
      });
    } else {
      // Reset form jika data kosong
      setFormData({ judul_ta: '', hari_tanggal: '', ruang_waktu: '' });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Gabungkan data otomatis + input manual
    const finalData = {
      ...formData,
      nama_mahasiswa: user.name,
      // FIX: Gunakan NIM yang benar dari object user
      nim: user.nim, 
    };
    onSubmit(finalData);
  };

  return (
    <PortalOverlay onClose={onClose}>
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-pop-in">
        <div className="bg-blue-600 p-6 flex justify-between items-center text-white">
          <h3 className="font-bold text-xl">Form Kelengkapan Sidang</h3>
          <button onClick={onClose}><FiX size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* READ ONLY FIELDS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-100 p-3 rounded-lg border border-gray-200">
              <label className="text-xs text-gray-500 font-bold uppercase">Nama Mahasiswa</label>
              <div className="flex items-center gap-2 text-gray-700 font-medium mt-1 truncate">
                <FiUser /> {user.name}
              </div>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg border border-gray-200">
              <label className="text-xs text-gray-500 font-bold uppercase">NIM</label>
              <div className="flex items-center gap-2 text-gray-700 font-medium mt-1 truncate">
                {/* FIX: Tampilkan NIM */}
                <FiUser /> {user.nim}
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* INPUT FIELDS */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Judul Tugas Akhir</label>
            <div className="relative">
              <FiBook className="absolute left-3 top-3 text-gray-400" />
              <input 
                type="text" 
                required
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Masukkan Judul Lengkap..."
                value={formData.judul_ta}
                onChange={(e) => setFormData({...formData, judul_ta: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Hari / Tanggal</label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                <input 
                  type="date" 
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.hari_tanggal}
                  onChange={(e) => setFormData({...formData, hari_tanggal: e.target.value})}
                />
              </div>
            </div>
             <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Ruang / Waktu</label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-3 text-gray-400" />
                <input 
                  type="text" 
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Contoh: R.101 / 08.00 WIB"
                  value={formData.ruang_waktu}
                  onChange={(e) => setFormData({...formData, ruang_waktu: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
             <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition">Batal</button>
             <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition shadow-lg flex items-center gap-2"><FiSave /> Simpan Data</button>
          </div>
        </form>
      </div>
    </PortalOverlay>
  );
};