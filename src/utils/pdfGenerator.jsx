import { PDFDocument } from 'pdf-lib';

export const generateAndDownloadPDF = async (templateUrl, data, outputFilename) => {
  try {
    const existingPdfBytes = await fetch(templateUrl).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    // Mapping sesuai request: nama_mahasiswa, nim, hari_tanggal, ruang_waktu, judul_ta
    const fieldMapping = [
      'nama_mahasiswa', 
      'nim', 
      'hari_tanggal', 
      'ruang_waktu', 
      'judul_ta'
    ];
    
    fieldMapping.forEach(key => {
      try {
        const inputField = form.getTextField(key);
        if (inputField && data[key]) {
          inputField.setText(data[key].toString());
        }
      } catch (err) {
        console.warn(`Field PDF '${key}' tidak ditemukan atau gagal diisi.`);
      }
    });

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