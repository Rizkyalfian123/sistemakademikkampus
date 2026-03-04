import { PDFDocument } from 'pdf-lib';

export const generateAndDownloadPDF = async (templateUrl, data, outputFilename) => {
  try {
    const existingPdfBytes = await fetch(templateUrl).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    // PERBAIKAN: Kita ambil semua "key" yang ada di data (termasuk nama_penguji_1, dll)
    // agar tidak perlu menulis daftar manual lagi
    const allKeys = Object.keys(data); 
    
    allKeys.forEach(key => {
      try {
        const inputField = form.getTextField(key);
        // Jika kotak tersebut ada di PDF dan datanya ada di React
        if (inputField && data[key]) {
          inputField.setText(data[key].toString());
        }
      } catch (err) {
        // Baris ini akan muncul jika ada data di React tapi kotaknya tidak ada di PDF
        console.warn(`Field PDF '${key}' tidak ditemukan di template, melewati...`);
      }
    });

    // Mengunci form agar tidak bisa diedit lagi secara manual setelah didownload
    form.flatten();
    
    const pdfBytes = await pdfDoc.save();
    
    // Download File
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = outputFilename;
    link.click();

  } catch (error) {
    console.error("Gagal generate PDF:", error);
    alert("Gagal membuat PDF. Pastikan file template tersedia di folder public.");
  }
};