import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../supabaseClient';
import { 
  FiDatabase, FiHardDrive, FiDownload, FiUpload, 
  FiClock, FiCheckCircle, FiAlertTriangle, FiTrash2, 
  FiRefreshCw, FiActivity, FiUploadCloud, FiCloudLightning, FiSave
} from 'react-icons/fi';

export default function BackupManagementView() {
  const [backups, setBackups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [selectedBackupFile, setSelectedBackupFile] = useState("");
  
  const [realStats, setRealStats] = useState({
    total: 1000, 
    used: 0,
    backupFiles: 0,
    available: 1000
  });

  useEffect(() => {
    fetchBackupHistory();
  }, []);

  const calculateStats = async (backupList) => {
    try {
      // 1. Ambil ukuran asli tabel log_pengunjung dari database
      // Pastikan 'log_pengunjung' sudah sesuai dengan nama tabel di Supabase-mu
      const { data: tableSizeBytes, error: rpcError } = await supabase.rpc('get_table_size', { 
        t_name: 'log_pengunjung' 
      });
      
      if (rpcError) console.error("Gagal panggil RPC:", rpcError);

      // 2. Hitung total ukuran file backup dari tabel history
      const totalBackupSizeKB = backupList.reduce((acc, curr) => {
        const size = parseFloat(curr.size.replace(' KB', '')) || 0;
        return acc + size;
      }, 0);

      // Konversi ke MB (1 MB = 1024 * 1024 Bytes)
      const dbSizeMB = (tableSizeBytes || 0) / (1024 * 1024);
      const backupSizeMB = totalBackupSizeKB / 1024;
      const totalUsedMB = (dbSizeMB + backupSizeMB).toFixed(2);

      setRealStats({
        total: 1000,
        used: totalUsedMB,
        backupFiles: backupSizeMB.toFixed(2),
        available: (1000 - totalUsedMB).toFixed(2)
      });
    } catch (err) {
      console.error("Gagal hitung stats:", err);
    }
  };

  const fetchBackupHistory = async () => {
    const { data, error } = await supabase
      .from('backup_history')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) {
      setBackups(data || []);
      // 👇 WAJIB ADA INI BIAR STATS JALAN 👇
      calculateStats(data || []); 
    }
  };

  const handleManualBackup = async () => {
    setIsLoading(true);
    try {
      const { data: pengumuman } = await supabase.from('Pengumuman').select('*');
      const backupData = {
        version: "2.0",
        timestamp: new Date().toISOString(),
        data: { Pengumuman: pengumuman }
      };

      const fileName = `backup_${Date.now()}.json`;
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const file = new File([blob], fileName, { type: 'application/json' });

      const { error: uploadError } = await supabase.storage.from('backups').upload(fileName, file);
      if (uploadError) throw uploadError;

      await supabase.from('backup_history').insert([{
        file_name: fileName,
        size: (blob.size / 1024).toFixed(2) + " KB",
        type: 'Cloud',
        status: 'Success'
      }]);

      await fetchBackupHistory();
      alert("Backup Berhasil Tersimpan di Cloud!");
    } catch (err) {
      alert("Gagal: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloudRestore = async () => {
    if (!selectedBackupFile) return alert("Pilih file backup terlebih dahulu!");
    if (!window.confirm("Apakah Anda yakin ingin melakukan restore? Data saat ini akan terhapus secara permanen.")) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.storage.from('backups').download(selectedBackupFile);
      if (error) throw error;

      const text = await data.text();
      const content = JSON.parse(text);

      await supabase.from('Pengumuman').delete().neq('id', 0);
      await supabase.from('Pengumuman').insert(content.data.Pengumuman);

      alert("Restore Cloud Berhasil!");
      window.location.reload();
    } catch (err) {
      alert("Gagal Restore: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHistory = async (id, fileName) => {
    if(window.confirm("Apakah Anda yakin ingin menghapus riwayat backup ini?")) {
      await supabase.storage.from('backups').remove([fileName]);
      await supabase.from('backup_history').delete().eq('id', id);
      fetchBackupHistory();
    }
  };

  return (
    <div className="flex flex-col space-y-6 animate-pop-in">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Data Management & Backup</h2>
          <p className="text-sm text-gray-400 font-medium">Monitoring database secara real-time</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold text-xs shadow-sm border border-blue-100">
           DATABASE CONNECTED
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT CARD: BACKUP DATABASE */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FiSave className="text-blue-600" /> Backup Database
            </h3>
            <span className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded uppercase">Auto ON</span>
          </div>

          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 mb-6">
             <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                   <FiDatabase size={20} />
                </div>
                <div>
                   <p className="text-sm font-bold text-gray-800">Backup Otomatis</p>
                   <p className="text-[10px] text-gray-400 font-medium">Backup terakhir: {backups[0] ? new Date(backups[0].created_at).toLocaleString() : '-'}</p>
                </div>
             </div>
             <div className="space-y-2 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-[11px]">
                   <span className="text-gray-400 font-medium tracking-wider uppercase">Jadwal Backup:</span>
                   <span className="text-gray-700 font-bold">Setiap hari, 23:00 WIB</span>
                </div>
                <div className="flex justify-between text-[11px]">
                   <span className="text-gray-400 font-medium tracking-wider uppercase">Retensi:</span>
                   <span className="text-gray-700 font-bold">30 Hari</span>
                </div>
             </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 text-blue-700 mb-6">
            <FiAlertTriangle className="shrink-0 mt-0.5" size={16} />
            <p className="text-[11px] font-medium leading-relaxed italic">Backup otomatis berjalan di background. Tidak mengganggu sistem.</p>
          </div>

          <button 
            onClick={handleManualBackup}
            disabled={isLoading}
            className="bg-blue-600 text-white w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md active:scale-95 disabled:bg-gray-300 mb-4"
          >
            <FiCloudLightning /> BACKUP SEKARANG
          </button>

          <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Auto Backup</span>
             <button onClick={() => setAutoBackup(!autoBackup)} className={`w-10 h-5 rounded-full relative transition-colors ${autoBackup ? 'bg-green-500' : 'bg-gray-300'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${autoBackup ? 'left-6' : 'left-1'}`}></div>
             </button>
          </div>
        </div>

        {/* RIGHT CARD: RESTORE DATABASE */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
            <FiRefreshCw className="text-blue-600" /> Restore Database
          </h3>

          <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 mb-6 flex items-center gap-4">
             <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-md">
                <FiRefreshCw size={20} />
             </div>
             <div>
                <p className="text-sm font-bold text-gray-800">Pulihkan Data</p>
                <p className="text-[10px] text-gray-400 font-medium italic">Restore dari backup cloud sebelumnya</p>
             </div>
          </div>

          <div className="mb-6">
             <label className="text-[10px] font-bold text-gray-400 mb-2 block uppercase tracking-wider">Pilih File Backup</label>
             <select 
                value={selectedBackupFile}
                onChange={(e) => setSelectedBackupFile(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-gray-600 cursor-pointer"
             >
                <option value="">-- Pilih Backup File --</option>
                {backups.map(b => (
                  <option key={b.id} value={b.file_name}>{b.file_name} ({b.size})</option>
                ))}
             </select>
          </div>

          <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-700 mb-6">
            <FiAlertTriangle className="shrink-0 mt-0.5" size={16} />
            <div className="text-[11px] font-medium leading-relaxed">
               <p className="font-bold uppercase mb-1">Peringatan Penting!</p>
               <p>Proses restore akan mengganti data saat ini. Sistem akan restart otomatis. Backup data saat ini terlebih dahulu jika diperlukan.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-auto">
             <button 
                onClick={handleManualBackup}
                className="py-2.5 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-xs rounded-xl transition-all"
             >
                BACKUP DULU
             </button>
             <button 
                onClick={handleCloudRestore}
                disabled={isLoading || !selectedBackupFile}
                className="py-2.5 bg-red-600 text-white hover:bg-red-700 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:bg-gray-300"
              >
                {isLoading ? 'RESTING...' : 'RESTORE'}
             </button>
          </div>
        </div>
      </div>

      {/* TABLE RIWAYAT - IDENTIK DENGAN PENGUMUMANVIEW */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 bg-white flex justify-between items-center">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <FiClock className="text-blue-600" /> Riwayat Backup
          </h3>
          <button className="text-[10px] font-bold text-red-600 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all uppercase tracking-wider flex items-center gap-2">
             <FiTrash2 /> Hapus Backup Lama
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-blue-600 text-white text-[10px] uppercase tracking-[0.15em] font-bold">
              <tr>
                <th className="px-6 py-4">Nama File</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Ukuran</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-[12px]">
              {backups.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-12 text-gray-400 text-xs">Belum ada riwayat backup.</td></tr>
              ) : (
                backups.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5 align-middle">
                      <div className="text-[13px] font-bold text-gray-800">{row.file_name}</div>
                      <div className="text-[10px] text-gray-400 font-medium mt-0.5">ID: {row.id}</div>
                    </td>
                    <td className="px-6 py-5 align-middle text-gray-600 font-medium">
                      {new Date(row.created_at).toLocaleDateString('id-ID')}
                      <div className="text-[10px] text-gray-400">{new Date(row.created_at).toLocaleTimeString('id-ID')} WIB</div>
                    </td>
                    <td className="px-6 py-5 align-middle font-bold text-gray-700">
                      {row.size}
                    </td>
                    <td className="px-6 py-5 align-middle">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${row.type === 'Auto' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="px-6 py-5 align-middle">
                      <span className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded uppercase">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 align-middle">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => deleteHistory(row.id, row.file_name)} 
                          className="w-9 h-9 flex items-center justify-center bg-gray-50 text-gray-400 hover:text-red-600 rounded-full transition-all border border-transparent hover:border-gray-200"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}