import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiUser, FiCalendar, FiMapPin, FiBook, FiUserCheck } from 'react-icons/fi';
import { PortalOverlay } from '../shared/PortalOverlay';
import { supabase } from '../../supabaseClient'; 

export const FormModal = ({ isOpen, onClose, onSubmit, user, initialData }) => {
  if (!isOpen) return null;

  // 1. STATE FORM: 3 Dosen Penguji
  const [formData, setFormData] = useState({
    judul_ta: '',
    hari_tanggal: '',
    ruang_waktu: '',
    dosen_penguji_1: '', 
    dosen_penguji_2: '', 
    dosen_penguji_3: ''  
  });

  const [dosenList, setDosenList] = useState([]);

  // 2. LOAD INITIAL DATA
  useEffect(() => {
    if (initialData) {
      setFormData({
        judul_ta: initialData.judul_ta || '',
        hari_tanggal: initialData.hari_tanggal || '',
        ruang_waktu: initialData.ruang_waktu || '',
        dosen_penguji_1: initialData.dosen_penguji_1 || '',
        dosen_penguji_2: initialData.dosen_penguji_2 || '',
        dosen_penguji_3: initialData.dosen_penguji_3 || ''
      });
    } else {
      setFormData({ 
        judul_ta: '', hari_tanggal: '', ruang_waktu: '', 
        dosen_penguji_1: '', dosen_penguji_2: '', dosen_penguji_3: '' 
      });
    }
  }, [initialData, isOpen]);

  // 3. FETCH DATA DOSEN
  useEffect(() => {
    const fetchDosen = async () => {
      if (!isOpen) return; 
      const { data } = await supabase
        .from('data_dosen')
        .select('nama_dosen, nip')
        .order('nama_dosen', { ascending: true });
      if (data) setDosenList(data);
    };
    fetchDosen();
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      nama_mahasiswa: user.name,
      nim: user.nim, 
    };
    onSubmit(finalData);
  };

  return (
    <PortalOverlay onClose={onClose}>
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-pop-in flex flex-col"
        style={{ maxHeight: '75vh' }}
      >
        
        {/* HEADER (Fixed / Tidak ikut ke-scroll) */}
        <div className="bg-blue-600 p-6 flex justify-between items-center text-white shrink-0">
          <h3 className="font-bold text-xl">Form Kelengkapan Sidang</h3>
          <button onClick={onClose}><FiX size={24} /></button>
        </div>
        
        {/* BODY (Scrollable area) - Ditambah minHeight: 0 agar flexbox tidak bocor */}
        <form 
          onSubmit={handleSubmit} 
          className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
          style={{ minHeight: 0 }}
        >
          
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
                <FiUser /> {user.nim}
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* JUDUL */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Judul Proposal Tugas Akhir</label>
            <div className="relative">
              <FiBook className="absolute left-3 top-3 text-gray-400" />
              <textarea 
                required
                rows="2"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
                placeholder="Masukkan Judul Lengkap..."
                value={formData.judul_ta}
                onChange={(e) => setFormData({...formData, judul_ta: e.target.value})}
              />
            </div>
          </div>

          {/* TANGGAL & RUANG */}
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Hari / Tanggal</label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                <input 
                  type="date" required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
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
                  type="text" required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="R.101 / 08.00"
                  value={formData.ruang_waktu}
                  onChange={(e) => setFormData({...formData, ruang_waktu: e.target.value})}
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* TIM DOSEN PENGUJI */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700">Tim Dosen Penguji</label>
            
            {[1, 2, 3].map((num) => (
              <div key={num} className="relative">
                <FiUserCheck className="absolute left-3 top-3 text-gray-400" />
                <select 
                  required
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white text-sm"
                  value={formData[`dosen_penguji_${num}`]}
                  onChange={(e) => setFormData({...formData, [`dosen_penguji_${num}`]: e.target.value})}
                >
                  <option value="" disabled>-- Pilih Penguji {num} --</option>
                  {dosenList.map((dosen, index) => (
                    <option key={index} value={`${dosen.nama_dosen}|${dosen.nip}`}>
                      {dosen.nama_dosen} {dosen.nip}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            ))}
          </div>

          {/* FOOTER BUTTONS (Tetap di dalam form agar terscroll paling bawah) */}
          <div className="pt-4 flex justify-end gap-3">
             <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition text-sm">Batal</button>
             <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition shadow-lg flex items-center gap-2 text-sm"><FiSave /> Simpan Data</button>
          </div>
        </form>
      </div>

      {/* Style Scrollbar biar lebih rapi & tipis */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </PortalOverlay>
  );
};