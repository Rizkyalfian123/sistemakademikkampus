import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export const useDashboardLogic = () => {
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  
  // State User Default
  const [user, setUser] = useState({ 
    id: '',
    name: 'Loading...', 
    role: '...', 
    email: '', 
    nim: 'Checking...', 
    avatar: null 
  });
  
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnounce, setLoadingAnnounce] = useState(false);

  // Data Dummy Stages
  const [taStages, setTaStages] = useState([
    { id: 1, title: 'Pengajuan Judul TA', status: 'done', date: '20 Jan 2026' },
    { id: 2, title: 'Seminar Proposal', status: 'open', date: '-' },
    { id: 3, title: 'Revisi Seminar Proposal', status: 'locked', date: '-' },
    { id: 4, title: 'Seminar Hasil', status: 'locked', date: '-' },
    { id: 5, title: 'Revisi Seminar Hasil', status: 'locked', date: '-' },
    { id: 6, title: 'Yudisium', status: 'locked', date: '-' },
  ]);

  const [magangStages, setMagangStages] = useState([
    { id: 1, title: 'Pengajuan Magang', status: 'done', date: '15 Des 2025' },
    { id: 2, title: 'Pelaksanaan Magang', status: 'open', date: '-' },
    { id: 3, title: 'Diseminasi Magang', status: 'locked', date: '-' },
    { id: 4, title: 'Revisi Diseminasi', status: 'locked', date: '-' },
  ]);

  useEffect(() => {
    // 1. Cek Login dari LocalStorage
    const sessionData = localStorage.getItem('user_akademik');
    
    if (!sessionData) {
      navigate('/login', { replace: true });
      return;
    }

    const parsed = JSON.parse(sessionData);
    
    // Set State Awal
    setUser({
      id: parsed.id || 'dummy-uuid', 
      name: parsed.name || 'Mahasiswa',
      role: parsed.role || 'Mahasiswa',
      email: parsed.email,
      nim: parsed.nim || 'Mencari data...', 
      avatar: parsed.avatar || `https://ui-avatars.com/api/?name=${parsed.name}&background=0D8ABC&color=fff`
    });

    // 2. FETCH DATA REAL DARI DATABASE (BY NAMA)
    const fetchMahasiswaData = async () => {
      try {
        if (!parsed.name) return;

        console.log("🔍 Mencari NIM untuk Nama:", parsed.name);

        // Query ke tabel 'data_mahasiswa' berdasarkan 'nama_lengkap'
        // Menggunakan ilike agar tidak sensitif huruf besar/kecil (case-insensitive)
        const { data, error } = await supabase
          .from('data_mahasiswa')
          .select('nim, nama_lengkap') 
          .ilike('nama_lengkap', parsed.name) // <-- UBAH DI SINI (Search by Nama)
          .maybeSingle(); 

        if (error) {
          console.error("❌ Error Supabase:", error.message);
          setUser(prev => ({ ...prev, nim: '-' })); 
        } else if (data) {
          console.log("✅ Data Ditemukan:", data);
          
          // UPDATE STATE USER
          const newData = {
            ...parsed,
            nim: data.nim, // Ambil NIM dari DB
            name: data.nama_lengkap || parsed.name // Pastikan nama sinkron
          };

          setUser(prev => ({
            ...prev,
            nim: data.nim,
            name: data.nama_lengkap || prev.name
          }));

          // Simpan ke LocalStorage agar permanen
          localStorage.setItem('user_akademik', JSON.stringify(newData));
        } else {
          console.warn("⚠️ Data tidak ditemukan untuk nama ini.");
          setUser(prev => ({ ...prev, nim: '-' }));
        }
      } catch (err) {
        console.error("Critical Error:", err);
      }
    };

    // 3. Fetch Pengumuman
    const fetchAnnouncements = async () => {
      setLoadingAnnounce(true);
      try {
        const { data } = await supabase.from('Pengumuman').select('*').order('created_at', { ascending: false });
        setAnnouncements(data || []);
      } catch (err) { } finally {
        setLoadingAnnounce(false);
      }
    };

    fetchMahasiswaData();
    fetchAnnouncements();

  }, [navigate]);

  const handleUpdateStatus = (id, type) => {
    const setter = type === 'TA' ? setTaStages : setMagangStages;
    const stages = type === 'TA' ? taStages : magangStages;
    const updated = stages.map(s => {
      if (s.id === id) return { ...s, status: 'done', date: new Date().toLocaleDateString('id-ID') };
      if (s.id === id + 1) return { ...s, status: 'open' };
      return s;
    });
    setter(updated);
  };

  const getProgress = (stages) => {
    const completed = stages.filter(s => s.status === 'done').length;
    const percent = Math.round((completed / stages.length) * 100);
    const active = stages.find(s => s.status === 'open');
    return { percent, label: percent === 100 ? 'Selesai' : active ? `Tahap: ${active.title}` : 'Belum Dimulai' };
  };

  return {
    user, activeMenu, setActiveMenu, mobileSidebarOpen, setMobileSidebarOpen,
    announcements, loadingAnnounce, taStages, magangStages,
    taProgress: getProgress(taStages),
    magangProgress: getProgress(magangStages),
    handleUpdateStatus,
    logout: () => { localStorage.removeItem('user_akademik'); navigate('/login'); }
  };
};