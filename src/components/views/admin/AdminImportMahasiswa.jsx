import React, { useState } from 'react';
import { supabase } from '../../../supabaseClient';
import Papa from 'papaparse';
import { FiUpload, FiLoader, FiCheckCircle, FiAlertCircle, FiDownload } from 'react-icons/fi';

export default function AdminImportMahasiswa() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ success: 0, failed: 0, errors: [] });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setResults({ success: 0, failed: 0, errors: [] });

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        await processUsers(results.data);
      },
    });
  };

  // --- FUNGSI DOWNLOAD TEMPLATE CSV (DARI FOLDER PUBLIC) ---
  const handleDownloadTemplate = () => {
    // Memastikan path URL aman (konsisten dengan file Dashboard sebelumnya)
    const baseUrl = import.meta.env.BASE_URL;
    const fileUrl = `${baseUrl}templates/template_import_mahasiswa.csv`.replace(/\/+/g, '/');

    const link = document.createElement("a");
    link.href = fileUrl;
    link.setAttribute("download", "template_import_mahasiswa.csv"); // Nama file saat di-download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processUsers = async (data) => {
    let successCount = 0;
    let failedCount = 0;
    let errorLogs = [];

    for (const item of data) {
      try {
        // AKSI 1: Register ke Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: item.email,
          password: item.password || 'Madiun2026',
        });
        if (authError) throw authError;

        const newId = authData.user.id;

        // AKSI 2: Masukkan ke Tabel 'user' (Data Login)
        const { error: userTableError } = await supabase
          .from('user') // Ingat, sesuaikan jika nama tabel Anda 'users'
          .insert([{
            id: newId,
            Username: item.username,
            Email: item.email,
            Password: item.password || 'Madiun2026',
            Role: 'Mahasiswa'
          }]);
        if (userTableError) throw userTableError;

        // AKSI 3: Masukkan ke Tabel 'data_mahasiswa' (Data Akademik)
        const { error: akademikError } = await supabase
          .from('data_mahasiswa')
          .insert([{
            id_user: newId, // Hubungkan dengan ID dari Auth
            nama_lengkap: item.nama_lengkap,
            nim: item.nim,
            program_studi: item.program_studi
          }]);
        if (akademikError) throw akademikError;

        successCount++;

      } catch (err) {
        failedCount++;
        errorLogs.push(`Gagal: ${item.email || 'Tanpa Email'} - ${err.message}`);
      }
    }
    setResults({ success: successCount, failed: failedCount, errors: errorLogs });
    setLoading(false);
  };

  return (
    <div className="p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
      
      {/* HEADER & TOMBOL DOWNLOAD */}
      <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-tight">Import Data Mahasiswa</h2>
          <p className="text-gray-500 text-sm mt-1">Gunakan file CSV untuk mendaftarkan akun mahasiswa secara massal.</p>
        </div>
        
        {/* TOMBOL DOWNLOAD TEMPLATE */}
        <button 
          onClick={handleDownloadTemplate}
          className="bg-green-50 text-green-700 border border-green-200 px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-green-100 hover:border-green-300 transition-all shadow-sm active:scale-95 whitespace-nowrap"
        >
          <FiDownload size={16} /> DOWNLOAD TEMPLATE CSV
        </button>
      </div>

      {/* AREA UPLOAD */}
      <div className="border-4 border-dashed border-blue-50 rounded-3xl p-12 text-center transition-colors hover:border-blue-100 bg-blue-50/20">
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileUpload} 
          id="csv-upload" 
          className="hidden" 
          disabled={loading}
        />
        <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
          {loading ? (
            <FiLoader className="text-6xl text-blue-500 animate-spin mb-4" />
          ) : (
            <FiUpload className="text-6xl text-blue-200 mb-4 hover:scale-110 transition-transform" />
          )}
          <span className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all uppercase tracking-widest text-xs">
            {loading ? 'Sedang Memproses...' : 'Pilih File CSV'}
          </span>
          <p className="text-[11px] text-gray-400 mt-4 font-medium uppercase tracking-wider">
            Hanya Menerima Format .CSV
          </p>
        </label>
      </div>

      {/* HASIL IMPORT */}
      {(results.success > 0 || results.failed > 0) && (
        <div className="mt-10 grid grid-cols-2 gap-4 animate-pop-in">
          <div className="p-5 bg-green-50 rounded-2xl flex items-center gap-4 border border-green-100 shadow-sm">
            <FiCheckCircle className="text-green-500 text-3xl" />
            <div>
              <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Berhasil Diunggah</p>
              <p className="text-3xl font-black text-green-700 leading-none mt-1">{results.success}</p>
            </div>
          </div>
          <div className="p-5 bg-red-50 rounded-2xl flex items-center gap-4 border border-red-100 shadow-sm">
            <FiAlertCircle className="text-red-500 text-3xl" />
            <div>
              <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider">Gagal Diproses</p>
              <p className="text-3xl font-black text-red-700 leading-none mt-1">{results.failed}</p>
            </div>
          </div>
        </div>
      )}

      {/* LOG ERROR */}
      {results.errors.length > 0 && (
        <div className="mt-6 p-5 bg-gray-50 rounded-2xl max-h-48 overflow-y-auto border border-gray-200 animate-fade-in custom-scrollbar">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
            <FiAlertCircle /> Log Kesalahan:
          </h4>
          <div className="space-y-2">
            {results.errors.map((err, i) => (
              <p key={i} className="text-[12px] text-red-600 font-medium bg-white px-3 py-2 rounded-lg border border-red-50 shadow-sm">
                <span className="font-bold mr-1">{i + 1}.</span> {err}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}