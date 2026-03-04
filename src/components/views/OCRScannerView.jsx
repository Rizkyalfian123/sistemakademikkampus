import React, { useState } from 'react';
import { 
  FiCamera, FiImage, FiFileText, FiUploadCloud, 
  FiCheckCircle, FiLoader, FiAlignLeft, FiCheck,
  FiMaximize, FiX, FiClock, FiEye 
} from 'react-icons/fi';
import { supabase } from '../../supabaseClient'; 
import Tesseract from 'tesseract.js'; 

export const OcrScannerView = () => {
  const [formData, setFormData] = useState({
    judulDokumen: '',
    kategori: 'Umum'
  });
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [processedFileBlob, setProcessedFileBlob] = useState(null); 
  
  const [isProcessingImage, setIsProcessingImage] = useState(false); 
  const [isScanning, setIsScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState('');
  
  const [publishMode, setPublishMode] = useState('image'); 
  const [isPublishing, setIsPublishing] = useState(false);
  const [successData, setSuccessData] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('image'); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const formatDateModal = (date) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  // =========================================================
  // FUNGSI PROSES: MAGIC COLOR ENHANCEMENT (BERWARNA & TAJAM)
  // =========================================================
  const processImageToScan = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Parameter Enhancement (Bisa disesuaikan)
          const contrast = 1.4;   // Meningkatkan kontras teks vs kertas
          const brightness = 15;  // Membuat kertas lebih putih
          const saturation = 1.5; // Membuat stempel/logo tetap berwarna tajam

          for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            // 1. Brightness & Contrast Adjustment
            r = (r - 128) * contrast + 128 + brightness;
            g = (g - 128) * contrast + 128 + brightness;
            b = (b - 128) * contrast + 128 + brightness;

            // 2. Saturation Boost (Agar warna asli tetap muncul kuat)
            const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
            r = gray + (r - gray) * saturation;
            g = gray + (g - gray) * saturation;
            b = gray + (b - gray) * saturation;

            // 3. Simple White Balance / Clipping
            // Menghapus noise abu-abu di latar belakang kertas (memaksanya ke putih)
            const threshold = 190;
            if (r > threshold && g > threshold && b > threshold) {
                r = Math.min(255, r + 20);
                g = Math.min(255, g + 20);
                b = Math.min(255, b + 20);
            }

            data[i] = Math.min(255, Math.max(0, r));
            data[i + 1] = Math.min(255, Math.max(0, g));
            data[i + 2] = Math.min(255, Math.max(0, b));
          }

          ctx.putImageData(imageData, 0, 0);
          
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85); // Kualitas tinggi
          canvas.toBlob((blob) => {
            resolve({ blob, dataUrl });
          }, 'image/jpeg', 0.85);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setSelectedImage(file);
      setOcrResult(''); 
      setSuccessData(false);
      setIsProcessingImage(true);

      setPreviewUrl(URL.createObjectURL(file)); 

      const { blob, dataUrl } = await processImageToScan(file);
      
      setProcessedFileBlob(blob); 
      setPreviewUrl(dataUrl);     
      setIsProcessingImage(false);

    } else {
      alert("Mohon pilih file gambar (JPG/PNG)!");
      e.target.value = null;
    }
  };

  const handleStartOCR = async (e) => {
    e.preventDefault();
    if (!selectedImage) return alert("Silakan upload gambar dokumen terlebih dahulu!");
    
    setIsScanning(true);
    
    try {
      const { data: { text } } = await Tesseract.recognize(
        previewUrl, 
        'ind', 
        { logger: m => console.log("Progress OCR:", m) }
      );
      
      if (!text || text.trim() === "") {
        setOcrResult("Teks tidak terbaca. Pastikan dokumen cukup terang dan jelas.");
      } else {
        setOcrResult(text); 
      }
      
    } catch (error) {
      console.error("OCR Error:", error);
      alert("Gagal membaca dokumen. Terjadi kesalahan pada AI OCR.");
    } finally {
      setIsScanning(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      let finalImageUrl = null;
      let finalTeks = '';

      if (publishMode === 'image') {
        const fileName = `ocr_img_${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('dokumen') 
          .upload(fileName, processedFileBlob, { contentType: 'image/jpeg' });
          
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage.from('dokumen').getPublicUrl(fileName);
        finalImageUrl = data.publicUrl;
        finalTeks = 'Silakan lihat lampiran dokumen pada gambar di atas.'; 
      } else {
        finalTeks = ocrResult;
        finalImageUrl = 'https://via.placeholder.com/800x400?text=Pengumuman+Akademik'; 
      }

      const { error: insertError } = await supabase.from('Pengumuman').insert([{
        Judul: formData.judulDokumen || 'Pengumuman Baru', 
        kategori: formData.kategori,
        isi_pengumuman: finalTeks,
        image_url: finalImageUrl
      }]);

      if (insertError) throw insertError;
      setSuccessData(true);
      setShowModal(false); 
      
    } catch (error) {
      alert("Gagal mempublikasikan: " + error.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const resetForm = () => {
    setFormData({ judulDokumen: '', kategori: 'Umum' });
    setSelectedImage(null);
    setPreviewUrl(null);
    setProcessedFileBlob(null);
    setOcrResult('');
    setSuccessData(false);
    setPublishMode('image');
  };

  const openFullscreen = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in pb-10">
        <div>
          <h2 className="text-2xl font-bold text-[#0f2a4a] flex items-center gap-2">
            <FiCamera className="text-blue-600" /> AI OCR Scanner
          </h2>
          <p className="text-sm text-gray-500 mt-1">Scan dokumen fisik menjadi digital. Hasil foto tetap berwarna dengan teks yang lebih tajam.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* KOLOM KIRI: UPLOAD & SETTING */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Input Dokumen</h3>
              <form onSubmit={handleStartOCR} className="space-y-4">
                <div className="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-xl p-4 text-center transition-colors hover:bg-blue-50">
                  {!previewUrl ? (
                    <label className="cursor-pointer block py-4">
                      <FiUploadCloud size={32} className="text-blue-500 mx-auto mb-2" />
                      <span className="text-sm font-bold text-blue-700 block">Upload Foto/Scan Dokumen</span>
                      <span className="text-xs text-gray-500">Format: JPG, PNG</span>
                      <input type="file" accept="image/jpeg, image/png" onChange={handleImageSelect} className="hidden" required />
                    </label>
                  ) : (
                    <div className="relative">
                      <div className="bg-gray-100 rounded-lg p-2 flex items-center justify-center">
                        <img src={previewUrl} alt="Preview" className="w-full h-40 object-contain rounded-lg shadow-sm" />
                      </div>
                      {isProcessingImage && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-lg">
                          <FiLoader className="animate-spin text-blue-500" size={24} />
                        </div>
                      )}
                      <button type="button" onClick={() => {setPreviewUrl(null); setSelectedImage(null); setOcrResult(''); setProcessedFileBlob(null);}} className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md text-xs font-bold transition-colors">
                        Ganti
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Judul Pengumuman</label>
                  <input type="text" name="judulDokumen" required value={formData.judulDokumen} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Contoh: Jadwal KRS" />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Kategori</label>
                  <select name="kategori" value={formData.kategori} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option value="Akademik">Akademik</option>
                    <option value="Umum">Umum</option>
                    <option value="Beasiswa">Beasiswa</option>
                  </select>
                </div>

                {!ocrResult && (
                  <button type="submit" disabled={!selectedImage || isScanning || isProcessingImage} className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl mt-4 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex justify-center items-center gap-2 shadow-lg">
                    {isScanning ? <FiLoader className="animate-spin" /> : <FiCamera />}
                    {isScanning ? 'AI Sedang Membaca...' : 'Mulai Scan OCR'}
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* KOLOM KANAN: HASIL & PILIHAN PUBLIKASI */}
          <div className="lg:col-span-8">
            <div className="bg-white p-6 md:p-8 rounded-[20px] shadow-sm border border-gray-100 h-full flex flex-col relative min-h-[400px]">
              {successData ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center animate-pop-in">
                  <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30"><FiCheckCircle size={40} /></div>
                  <h4 className="text-emerald-800 font-black text-2xl mb-2">Sukses Dipublikasikan!</h4>
                  <p className="text-gray-600 mb-6">Pengumuman telah tayang dengan format <b>{publishMode === 'image' ? 'Gambar Scan Berwarna' : 'Teks Ekstraksi'}</b>.</p>
                  <button onClick={resetForm} className="py-3 px-8 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors">Scan Dokumen Lain</button>
                </div>
              ) : isPublishing ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in text-blue-600">
                  <FiLoader size={60} className="animate-spin mb-4" />
                  <h4 className="font-bold text-xl text-gray-800">Menyimpan ke Database...</h4>
                </div>
              ) : ocrResult ? (
                <div className="flex-1 flex flex-col animate-fade-in">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">Pilih Format Publikasi</h3>
                  <p className="text-sm text-gray-500 mb-6">Pilih tampilan yang akan muncul di aplikasi mahasiswa.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div onClick={() => setPublishMode('image')} className={`cursor-pointer rounded-2xl border-2 p-4 transition-all flex flex-col ${publishMode === 'image' ? 'border-blue-500 bg-blue-50/30 ring-4 ring-blue-500/10' : 'border-gray-200 hover:border-blue-300 bg-white'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2 text-blue-600 font-black"><FiImage size={20} /> Mode Gambar</div>
                        {publishMode === 'image' ? <div className="w-6 h-6 rounded-full flex items-center justify-center bg-blue-500 text-white"><FiCheck size={14} /></div> : <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white"></div>}
                      </div>
                      <div className="relative w-full h-32 bg-gray-100 rounded-xl overflow-hidden mb-3 border border-gray-200 p-1 flex items-center justify-center group">
                         <img src={previewUrl} className="max-w-full max-h-full object-contain" alt="Preview Image" />
                         <button onClick={(e) => { e.stopPropagation(); openFullscreen('image'); }} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 backdrop-blur-[1px]">
                            <FiEye size={24} /> <span className="text-xs font-bold tracking-wider">PREVIEW POP-UP</span>
                         </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-auto">Sistem mempublikasikan foto scan berwarna ini sebagai lampiran.</p>
                    </div>

                    <div onClick={() => setPublishMode('text')} className={`cursor-pointer rounded-2xl border-2 p-4 transition-all flex flex-col ${publishMode === 'text' ? 'border-blue-500 bg-blue-50/30 ring-4 ring-blue-500/10' : 'border-gray-200 hover:border-blue-300 bg-white'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2 text-blue-600 font-black"><FiAlignLeft size={20} /> Mode Teks</div>
                        {publishMode === 'text' ? <div className="w-6 h-6 rounded-full flex items-center justify-center bg-blue-500 text-white"><FiCheck size={14} /></div> : <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white"></div>}
                      </div>
                      <div className="relative w-full mb-3 group flex-grow">
                        <textarea value={ocrResult} onChange={(e) => setOcrResult(e.target.value)} className="w-full h-32 p-3 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 outline-none resize-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400" />
                        <button onClick={(e) => { e.stopPropagation(); openFullscreen('text'); }} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 backdrop-blur-[1px] rounded-xl">
                          <FiEye size={24} /> <span className="text-xs font-bold tracking-wider">PREVIEW POP-UP</span>
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-auto">Mahasiswa akan membaca hasil ekstraksi teks yang jelas dan rapi.</p>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end gap-3">
                    <button onClick={() => setOcrResult('')} className="px-6 py-3 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Kembali</button>
                    <button onClick={handlePublish} disabled={isPublishing} className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                      <FiUploadCloud size={20} /> Publikasikan {publishMode === 'image' ? 'Gambar' : 'Teks'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
                  <FiCamera size={80} className="mb-4 opacity-30" />
                  <p className="font-medium text-lg text-gray-500">Belum ada dokumen yang di-scan.</p>
                  <p className="text-sm">Upload gambar di sebelah kiri untuk melihat hasilnya di sini.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL FULLSCREEN PREVIEW */}
      {/* ========================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-pop-in" style={{ height: '75vh' }}>
            <div className="p-6 md:p-8 bg-blue-700 text-white shrink-0 relative">
              <div className="flex items-center mb-4">
                <span className="border border-white/80 text-white text-[12px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">{formData.kategori || 'UMUM'}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold leading-snug uppercase pr-12">📢 {formData.judulDokumen || 'PREVIEW PENGUMUMAN'}</h2>
              <div className="flex items-center gap-2 text-blue-100 text-sm mt-3 font-medium"><FiClock size={16} /> <span>{formatDateModal(new Date())}</span></div>
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 hover:bg-blue-600 p-2 rounded-full transition-all text-white"><FiX size={24} /></button>
            </div>

            <div className="p-6 md:p-8 flex-1 bg-white flex flex-col overflow-hidden">
              {modalType === 'image' ? (
                <div className="h-full w-full overflow-y-auto custom-scrollbar flex flex-col items-center">
                  <img src={previewUrl} alt="Lampiran" className="w-full h-auto object-contain rounded-xl border border-gray-200 shadow-sm" />
                  <p className="text-sm text-gray-600 mt-4 leading-relaxed w-full text-center pb-4">Silakan lihat lampiran dokumen berwarna pada gambar di atas.</p>
                </div>
              ) : (
                <div className="relative group flex-1 flex flex-col w-full h-full">
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-1 rounded z-10 shadow-sm">✏️ BISA DIEDIT</div>
                  <textarea value={ocrResult} onChange={(e) => setOcrResult(e.target.value)} className="w-full h-full flex-1 text-gray-800 text-[15px] leading-[1.8] outline-none resize-none whitespace-pre-wrap break-words border border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 p-5 rounded-xl transition-all bg-gray-50/50 shadow-inner overflow-y-auto custom-scrollbar" placeholder="Ketik atau edit hasil teks di sini..." />
                </div>
              )}
            </div>

            <div className="px-6 py-4 flex justify-end items-center bg-gray-50 border-t border-gray-200 shrink-0 gap-3">
               <button onClick={() => setShowModal(false)} className="px-6 py-2.5 rounded-xl bg-gray-200 text-gray-800 text-sm font-bold hover:bg-gray-300 transition-all">Kembali</button>
               <button onClick={() => { setShowModal(false); handlePublish(); }} disabled={isPublishing} className="px-8 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30">
                <FiUploadCloud size={16} /> Langsung Publikasikan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};