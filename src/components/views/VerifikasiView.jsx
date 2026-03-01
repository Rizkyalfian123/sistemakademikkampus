import React, { useState, useRef } from 'react';
import { 
  FiEdit3, FiShield, FiCheckCircle, FiFileText, 
  FiUser, FiBriefcase, FiUploadCloud, FiLoader, FiMove, FiMaximize
} from 'react-icons/fi';
import { PDFDocument } from 'pdf-lib';
import Draggable from 'react-draggable';
import { supabase } from '../../supabaseClient'; 

export const VerifikasiView = () => {
  const [formData, setFormData] = useState({
    nomorDokumen: '', judulDokumen: '', namaPejabat: '', jabatan: '', kategori: 'Akademik'
  });
  
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null); 
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const [qrPosition, setQrPosition] = useState({ x: 180, y: 280 }); 
  const nodeRef = useRef(null); 
  const [qrUrl, setQrUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const [qrScale, setQrScale] = useState(0.5); 

  const PREVIEW_WIDTH = 250;
  const PREVIEW_HEIGHT = 353; 
  const BASE_QR_PREVIEW_SIZE = 124; 
  const currentPreviewSize = BASE_QR_PREVIEW_SIZE * qrScale; 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedPdf(file);
      setPdfPreviewUrl(URL.createObjectURL(file)); 
      setShowPreview(false); 
    } else {
      alert("Mohon pilih file PDF!");
      e.target.value = null;
    }
  };

  const handleGeneratePreview = (e) => {
    e.preventDefault();
    if (!selectedPdf) return alert("Silakan upload PDF dulu!");
    
    const textData = `Dokumen Resmi\nNomor: ${formData.nomorDokumen}\nJudul: ${formData.judulDokumen}\nOleh: ${formData.namaPejabat}\nStatus: SAH`;
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(textData)}&margin=0`;
    
    setQrUrl(url);
    setShowPreview(true);
  };

  const handleProcessAndPublish = async () => {
    setIsProcessing(true);
    try {
      const qrResponse = await fetch(qrUrl);
      const qrImageBytes = await qrResponse.arrayBuffer();

      const pdfBytesAsli = await selectedPdf.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytesAsli);
      const qrImage = await pdfDoc.embedPng(qrImageBytes);
      
      const qrDims = qrImage.scale(qrScale); 

      // === RUMUS MATEMATIKA TITIK TENGAH (AKURAT) ===
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width: pdfWidth, height: pdfHeight } = firstPage.getSize();

      const qrCenterX = qrPosition.x + (currentPreviewSize / 2);
      const qrCenterY = qrPosition.y + (currentPreviewSize / 2);

      const ratioX = qrCenterX / PREVIEW_WIDTH;
      const ratioY = qrCenterY / PREVIEW_HEIGHT;

      const pdfCenterX = ratioX * pdfWidth;
      const pdfCenterY = (1 - ratioY) * pdfHeight; 

      const finalX = pdfCenterX - (qrDims.width / 2);
      const finalY = pdfCenterY - (qrDims.height / 2);

      firstPage.drawImage(qrImage, {
        x: finalX,
        y: finalY,
        width: qrDims.width,
        height: qrDims.height,
      });

      const modifiedPdfBytes = await pdfDoc.save();
      const modifiedPdfBlob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const finalPdfFile = new File([modifiedPdfBlob], `Signed_${selectedPdf.name}`, { type: 'application/pdf' });

      const fileNamePDF = `ttd_${Date.now()}_${selectedPdf.name}`;
      const { error: uploadPdfError } = await supabase.storage.from('dokumen').upload(fileNamePDF, finalPdfFile);
      if (uploadPdfError) throw uploadPdfError;
      const { data: pdfPublicUrl } = supabase.storage.from('dokumen').getPublicUrl(fileNamePDF);

      const fileNameQR = `qr_${Date.now()}.png`;
      const qrBlob = new Blob([qrImageBytes], { type: 'image/png' });
      const { error: uploadQrError } = await supabase.storage.from('dokumen').upload(fileNameQR, qrBlob);
      if (uploadQrError) throw uploadQrError;
      const { data: qrPublicUrl } = supabase.storage.from('dokumen').getPublicUrl(fileNameQR);

      const isiPengumumanOtomatis = `Dokumen bernomor ${formData.nomorDokumen} telah disahkan oleh ${formData.namaPejabat}. \n\nUnduh PDF asli yang telah dibubuhi QR Code E-Signature di sini: \n${pdfPublicUrl.publicUrl}`;
      const { error: insertError } = await supabase.from('Pengumuman').insert([{
        Judul: formData.judulDokumen,
        kategori: formData.kategori,
        isi_pengumuman: isiPengumumanOtomatis,
        image_url: qrPublicUrl.publicUrl
      }]);
      if (insertError) throw insertError;

      setSuccessData({ judul: formData.judulDokumen, qrUrl: qrPublicUrl.publicUrl, pdfUrl: pdfPublicUrl.publicUrl });
      
      setFormData({ nomorDokumen: '', judulDokumen: '', namaPejabat: '', jabatan: '', kategori: 'Akademik' });
      setSelectedPdf(null);
      setPdfPreviewUrl(null);
      setShowPreview(false);
      setQrScale(0.5); 

    } catch (error) {
      alert("Gagal memproses: " + error.message);
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = (e, data) => {
    setQrPosition({ x: data.x, y: data.y });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h2 className="text-2xl font-bold text-[#0f2a4a] flex items-center gap-2">
          <FiEdit3 className="text-blue-600" /> Stempel E-Signature Custom
        </h2>
        <p className="text-sm text-gray-500 mt-1">Atur sendiri posisi dan ukuran QR Code pada dokumen PDF sebelum dipublikasikan.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* KOLOM KIRI: FORM & UPLOAD */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Data Dokumen</h3>
            
            <form onSubmit={handleGeneratePreview} className="space-y-4">
              <div className="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-xl p-4 text-center">
                {!selectedPdf ? (
                  <label className="cursor-pointer">
                    <FiUploadCloud size={32} className="text-blue-500 mx-auto mb-2" />
                    <span className="text-sm font-bold text-blue-700 block">Pilih File PDF</span>
                    <input type="file" accept="application/pdf" onChange={handleFileSelect} className="hidden" required />
                  </label>
                ) : (
                  <div>
                    <FiCheckCircle size={32} className="text-emerald-500 mx-auto mb-2" />
                    <span className="text-sm font-bold text-gray-800 block line-clamp-1">{selectedPdf.name}</span>
                    <button type="button" onClick={() => {setSelectedPdf(null); setPdfPreviewUrl(null); setShowPreview(false);}} className="text-xs text-red-500 font-bold mt-2 hover:underline">Ganti File</button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="nomorDokumen" required value={formData.nomorDokumen} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" placeholder="No Surat" />
                <select name="kategori" value={formData.kategori} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                  <option value="Akademik">Akademik</option>
                  <option value="Umum">Umum</option>
                </select>
              </div>

              <input type="text" name="judulDokumen" required value={formData.judulDokumen} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" placeholder="Judul Dokumen" />
              <input type="text" name="namaPejabat" required value={formData.namaPejabat} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" placeholder="Nama Pejabat" />
              <input type="text" name="jabatan" required value={formData.jabatan} onChange={handleChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" placeholder="Jabatan" />

              {!showPreview && (
                <button type="submit" disabled={!selectedPdf} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-4 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                  1. Lanjut ke Mode Preview
                </button>
              )}
            </form>
          </div>
        </div>

        {/* KOLOM KANAN: DRAG & DROP / HASIL / LOADING */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 rounded-[20px] shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center relative min-h-[400px] bg-gray-50">
            
            {successData ? (
               <div className="text-center animate-pop-in">
                 <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4"><FiCheckCircle size={40} /></div>
                 <h4 className="text-emerald-800 font-black text-2xl mb-2">Sukses!</h4>
                 <p className="text-gray-600 mb-6">PDF telah di-stempel dan di-upload ke database.</p>
                 <a href={successData.pdfUrl} target="_blank" rel="noopener noreferrer" className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl block mb-2 transition-colors">Lihat PDF Hasilnya</a>
                 <button onClick={() => setSuccessData(null)} className="text-gray-500 font-bold hover:underline mt-2 block w-full">Tutup</button>
               </div>
            
            ) : isProcessing ? (
               <div className="text-center text-blue-600 flex flex-col items-center animate-fade-in">
                 <FiLoader size={60} className="animate-spin mb-6 text-blue-500" />
                 <h4 className="font-black text-2xl mb-2 text-gray-800">AI Sedang Bekerja...</h4>
                 <div className="text-sm text-gray-500 bg-blue-50 p-4 rounded-xl border border-blue-100 text-left space-y-2">
                   <p>⚙️ Membuat E-Signature QR Code</p>
                   <p>📄 Menyisipkan QR ke dalam PDF secara spesifik</p>
                   <p>☁️ Mengunggah ke Server & Publikasi</p>
                 </div>
               </div>

            ) : showPreview ? (
              <div className="flex flex-col items-center animate-fade-in w-full max-w-md mx-auto">
                <p className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <FiMove className="text-blue-500"/> Atur Posisi & Ukuran QR Code:
                </p>
                
                {/* SLIDER PENGATUR UKURAN */}
                <div className="w-full bg-white p-3 rounded-xl border border-gray-200 mb-4 shadow-sm flex flex-col">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-600 mb-2 uppercase">
                    <span className="flex items-center gap-1"><FiMaximize /> Skala Ukuran</span>
                    <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{Math.round(qrScale * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.2" max="1.0" step="0.05" 
                    value={qrScale} 
                    onChange={(e) => setQrScale(parseFloat(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                {/* PREVIEW KERTAS A4 */}
                <div 
                  className="bg-white border-2 border-gray-300 shadow-xl relative overflow-hidden bg-white rounded-sm"
                  style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}
                >
                  {/* DIPERBAIKI: Hapus margin negatif, pakai view=FitH agar pas 100% ke lebar kotak */}
                  {pdfPreviewUrl && (
                    <iframe 
                      src={`${pdfPreviewUrl}#view=FitH&scrollbar=0&toolbar=0&navpanes=0`} 
                      className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
                      style={{ zIndex: 0 }}
                      title="PDF Preview"
                    />
                  )}
                  
                  {/* KOMPONEN DRAGGABLE */}
                  <Draggable bounds="parent" position={qrPosition} onDrag={handleDrag} nodeRef={nodeRef}>
                    <div 
                      ref={nodeRef} 
                      className="absolute cursor-move shadow-lg border-[3px] border-blue-600 bg-white transition-all duration-75" 
                      style={{ 
                        width: currentPreviewSize, 
                        height: currentPreviewSize, 
                        zIndex: 20 
                      }}
                    >
                      <img src={qrUrl} alt="QR" className="w-full h-full pointer-events-none opacity-90" />
                      <div className="absolute -top-3 -right-3 bg-blue-600 text-white rounded-full p-1.5 shadow-md scale-75 origin-center">
                        <FiMove size={12} />
                      </div>
                    </div>
                  </Draggable>
                </div>

                <button 
                  onClick={handleProcessAndPublish} 
                  className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center transition-all transform hover:-translate-y-1"
                >
                  2. Stempel & Publikasi
                </button>
              </div>

            ) : (
              <div className="text-center text-gray-400">
                <FiFileText size={64} className="mx-auto mb-4 opacity-50" />
                <p>Isi form di kiri dan klik "Lanjut ke Mode Preview"</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};