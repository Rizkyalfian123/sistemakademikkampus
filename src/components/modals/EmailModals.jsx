// =========================================================
// KOMPONEN EMAIL MODAL (DENGAN EFEK LAYAR GELAP)
// =========================================================
const EmailModal = ({ isOpen, onClose, onSubmit, currentEmail, isLoading }) => {
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (isOpen) setEmail(currentEmail || '');
  }, [isOpen, currentEmail]);

  if (!isOpen) return null;

  return (
    // 1. BAGIAN INI ADALAH OVERLAY (LAYAR GELAP)
    // fixed inset-0: Membuat elemen memenuhi seluruh layar
    // bg-black bg-opacity-75: Membuat warna hitam dengan transparansi 75%
    // backdrop-blur-sm: Memberikan efek blur pada layar di belakangnya
    // z-[999]: Memastikan layar gelap ini berada di urutan paling atas menutupi header & sidebar
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm animate-fade-in">
      
      {/* 2. BAGIAN INI ADALAH KOTAK POP-UP NYA */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-pop-in relative">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FiMail className="text-blue-600" /> Daftarkan Email
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition-colors bg-white hover:bg-gray-100 p-1.5 rounded-lg">
            <FiX size={20} />
          </button>
        </div>
        
        {/* Form Modal */}
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(email); }} className="p-6">
          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Alamat Email Anda
            </label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="contoh: budi@gmail.com"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
              {currentEmail 
                ? "Email Anda saat ini sudah terdaftar. Anda bisa menggantinya di sini." 
                : "Tambahkan email aktif untuk menerima notifikasi akademik penting."}
            </p>
          </div>
          
          <div className="flex justify-end gap-3 mt-8">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isLoading} 
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed shadow-md shadow-blue-500/30"
            >
              {isLoading ? 'Menyimpan...' : 'Simpan Email'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};