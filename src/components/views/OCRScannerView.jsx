import React, { useState, useRef, useEffect } from 'react';
import { 
  FiUploadCloud, FiFileText, FiCamera, FiRefreshCcw, 
  FiSave, FiCheckCircle, FiLoader, FiImage, FiX
} from 'react-icons/fi';
import Tesseract from 'tesseract.js';
import { supabase } from '../../supabaseClient'; 

export const OCRScannerView = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // States untuk Efek & OCR
  const [isScannedEffect, setIsScannedEffect] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  
  // States untuk Kamera
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // States untuk Form Database
  const [formData, setFormData] = useState({
    Judul: '',
    kategori: 'Umum',
    isi_pengumuman: ''
  });
  const [isUploading, setIsUploading] = useState(false);

  // Bersihkan kamera jika pindah halaman
  useEffect(() => {
    return () => stopCamera();
  }, []);

  // ==========================================
  // FUNGSI KAMERA
  // ==========================================
  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      // Meminta izin kamera (prioritas kamera belakang jika di HP)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Gagal mengakses kamera. Pastikan Anda memberi izin kamera di browser.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Samakan ukuran canvas dengan resolusi video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Ubah gambar di canvas menjadi file (Blob)
      canvas.toBlob((blob) => {
        const file = new File([blob], `scan_kamera_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setSelectedFile(file);
        
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        
        stopCamera(); // Matikan kamera setelah jepret
        performOCR(url); // Langsung scan teksnya!
      }, 'image/jpeg', 0.9);
    }
  };

  // ==========================================
  // FUNGSI UPLOAD & OCR
  // ==========================================
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      performOCR(url);
    }
  };

  const performOCR = async (imageUrl) => {
    setIsScanning(true);
    setScanProgress(0);
    try {
      const result = await Tesseract.recognize(
        imageUrl,
        'ind+eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setScanProgress(parseInt(m.progress * 100));
            }
          }
        }
      );
      
      setFormData(prev => ({
        ...prev,
        isi_pengumuman: result.data.text
      }));
    } catch (error) {
      console.error("Error saat OCR:", error);
      alert("Gagal membaca teks dari gambar.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Simpan ke Database
  const handleSimpanPengumuman = async (e) => {
    e.preventDefault();
    if (!formData.Judul || !formData.isi_pengumuman) {
      alert("Judul dan isi pengumuman tidak boleh kosong!");
      return;
    }

    setIsUploading(true);
    try {
      let imageUrl = null;

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `scan_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('dokumen') 
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('dokumen')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrlData.publicUrl;
      }

      const { error: insertError } = await supabase
        .from('Pengumuman')
        .insert([
          {
            Judul: formData.Judul,
            kategori: formData.kategori,
            isi_pengumuman: formData.isi_pengumuman,
            image_url: imageUrl 
          }
        ]);

      if (insertError) throw insertError;

      alert("Berhasil! Dokumen berhasil di-scan dan diumumkan.");
      
      // Reset Form
      setSelectedFile(null);
      setPreviewUrl(null);
      setFormData({ Judul: '', kategori: 'Umum', isi_pengumuman: '' });

    } catch (error) {
      console.error("Error upload:", error);
      alert("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsUploading(false);
    }
  };

  // ==========================================
  // RENDER TAMPILAN
  // ==========================================
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#0f2a4a] flex items-center gap-2">
          <FiCamera className="text-blue-600" /> OCR Scanner AI
        </h2>
        <p className="text-sm text-gray-500 mt-1">Upload file atau foto langsung surat/dokumen Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* KOLOM KIRI: AREA UPLOAD / KAMERA / PREVIEW */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* 1. TAMPILAN KAMERA TERBUKA */}
          {isCameraOpen ? (
            <div className="relative bg-black rounded-2xl overflow-hidden h-[450px] flex items-center justify-center border-4 border-gray-800 shadow-xl">
              {/* Viewfinder Kamera */}
              <video ref={videoRef} autoPlay playsInline className="max-h-full max-w-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Garis Bantu Scanner (Target) */}
              <div className="absolute inset-8 border-2 border-white/50 border-dashed rounded-lg pointer-events-none"></div>

              {/* Tombol Kamera */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-8">
                <button 
                  onClick={stopCamera} 
                  className="bg-red-500 hover:bg-red-600 text-white p-3.5 rounded-full shadow-lg transition-transform active:scale-90"
                  title="Batal"
                >
                  <FiX size={24} />
                </button>
                <button 
                  onClick={capturePhoto} 
                  className="bg-white/30 border-4 border-white hover:bg-white/50 p-3 rounded-full shadow-lg transition-all active:scale-95"
                  title="Jepret Foto"
                >
                  <div className="w-12 h-12 bg-white rounded-full"></div>
                </button>
              </div>
            </div>
          ) : 

          /* 2. TAMPILAN PILIH FILE (Belum ada gambar) */
          !previewUrl ? (
            <div className="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-2xl flex flex-col items-center justify-center p-8 h-[450px]">
              <FiUploadCloud size={60} className="text-blue-400 mb-4 animate-pulse-slow" />
              <h3 className="text-lg font-bold text-gray-700">Scan Dokumen</h3>
              <p className="text-sm text-gray-500 text-center mt-2 px-4 mb-8">Pilih file dari perangkat atau gunakan kamera langsung.</p>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full px-4">
                <label className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm shadow-md cursor-pointer transition-all flex items-center justify-center gap-2">
                  <FiUploadCloud size={18} /> Pilih File
                  <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                </label>
                
                <button 
                  onClick={startCamera} 
                  className="flex-1 bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 text-gray-700 py-3 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <FiCamera size={18} /> Buka Kamera
                </button>
              </div>
            </div>
          ) : (
            
          /* 3. TAMPILAN PREVIEW (Sudah ada gambar / habis dijepret) */
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[450px]">
              <div className="flex justify-between items-center mb-3 shrink-0">
                <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <FiImage /> Preview Dokumen
                </span>
                <button 
                  onClick={() => setIsScannedEffect(!isScannedEffect)}
                  className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all ${isScannedEffect ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}
                >
                  {isScannedEffect ? '✨ Efek Scanner Aktif' : 'Foto Asli'}
                </button>
              </div>
              
              <div className="relative bg-gray-100 rounded-xl overflow-hidden flex-1 flex items-center justify-center border border-gray-200">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-h-full max-w-full object-contain transition-all duration-500"
                  style={isScannedEffect ? { filter: 'grayscale(100%) contrast(150%) brightness(110%)' } : {}}
                />
              </div>

              <div className="mt-4 flex gap-2 shrink-0">
                <button 
                  onClick={() => { setPreviewUrl(null); setSelectedFile(null); setFormData({Judul: '', kategori: 'Umum', isi_pengumuman: ''}); }}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold py-2.5 rounded-xl transition-colors flex justify-center items-center gap-2"
                >
                  <FiTrash2 size={16} /> Hapus
                </button>
                <button 
                  onClick={() => performOCR(previewUrl)}
                  disabled={isScanning}
                  className="flex-[2] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold py-2.5 rounded-xl transition-colors flex justify-center items-center gap-2"
                >
                  <FiRefreshCcw className={isScanning ? 'animate-spin' : ''} /> 
                  {isScanning ? 'Membaca...' : 'Scan Ulang Teks'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* KOLOM KANAN: HASIL OCR & FORM PENGUMUMAN */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FiFileText className="text-blue-500" /> Hasil Teks & Form Publish
            </h3>

            {isScanning ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <FiLoader size={40} className="text-blue-500 animate-spin mb-4" />
                <p className="font-bold text-gray-700">AI Sedang Membaca Dokumen...</p>
                <div className="w-64 bg-gray-200 rounded-full h-2.5 mt-4 overflow-hidden">
                  <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${scanProgress}%` }}></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">{scanProgress}% Selesai</p>
              </div>
            ) : (
              <form onSubmit={handleSimpanPengumuman} className="flex flex-col gap-5 flex-1">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-[12px] font-bold text-gray-700">Judul Pengumuman</label>
                    <input 
                      type="text" name="Judul" required value={formData.Judul} onChange={handleChange}
                      placeholder="Masukkan judul untuk diumumkan..."
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    />
                  </div>
                  <div className="sm:w-1/3 flex flex-col gap-2">
                    <label className="text-[12px] font-bold text-gray-700">Kategori</label>
                    <select 
                      name="kategori" required value={formData.kategori} onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
                    >
                      <option value="Umum">Umum</option>
                      <option value="Akademik">Akademik</option>
                      <option value="Prestasi">Prestasi</option>
                      <option value="Beasiswa">Beasiswa</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-[12px] font-bold text-gray-700 flex justify-between">
                    <span>Isi Pengumuman (Hasil OCR)</span>
                    {previewUrl && <span className="text-green-600 flex items-center gap-1"><FiCheckCircle /> Teks Diekstrak</span>}
                  </label>
                  <textarea 
                    name="isi_pengumuman" required value={formData.isi_pengumuman} onChange={handleChange}
                    placeholder="Teks dari dokumen akan otomatis muncul di sini. Anda juga bisa mengeditnya secara manual..."
                    className="w-full flex-1 min-h-[250px] p-4 bg-gray-50 border border-gray-200 rounded-xl text-[14px] leading-relaxed focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none custom-scrollbar resize-none"
                  ></textarea>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button 
                    type="submit" disabled={isUploading || (!previewUrl && !formData.isi_pengumuman)}
                    className="px-8 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? <FiLoader className="animate-spin" /> : <FiSave />}
                    {isUploading ? 'Menyimpan ke Database...' : 'Upload & Publish Pengumuman'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};