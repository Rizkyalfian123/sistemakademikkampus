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
    { 
      id: 2, 
      title: 'Seminar Proposal', 
      status: 'open', 
      date: '-',
      // --- SUB-MENU DENGAN STATUS MANDIRI ---
      subStages: [
        { id: '2.1', title: 'Form Revisi', file: 'form_revisi.pdf', status: 'pending' },
        { id: '2.2', title: 'Penilaian Isi Laporan', file: 'penilaian_laporan.pdf', status: 'pending' },
        { id: '2.3', title: 'Hasil Seminar Proposal', file: 'hasil_sempro.pdf', status: 'pending' },
        { id: '2.4', title: 'Berita Acara Seminar Proposal', file: 'berita_acara_sempro.pdf', status: 'pending' }
      ]
      // --------------------------------------
    },
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

        const { data, error } = await supabase
          .from('data_mahasiswa')
          .select('nim, nama_lengkap') 
          .ilike('nama_lengkap', parsed.name) 
          .maybeSingle(); 

        if (error) {
          console.error("❌ Error Supabase:", error.message);
          setUser(prev => ({ ...prev, nim: '-' })); 
        } else if (data) {
          console.log("✅ Data Ditemukan:", data);
          
          const newData = {
            ...parsed,
            nim: data.nim, 
            name: data.nama_lengkap || parsed.name 
          };

          setUser(prev => ({
            ...prev,
            nim: data.nim,
            name: data.nama_lengkap || prev.name
          }));

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

  // === LOGIKA UPDATE STATUS (SMART AUTO-UNLOCK) ===
  const handleUpdateStatus = (id, type) => {
    const setter = type === 'TA' ? setTaStages : setMagangStages;
    
    setter(prevStages => {
      // 1. BUAT DEEP COPY (Agar aman dimanipulasi)
      let newStages = JSON.parse(JSON.stringify(prevStages));

      // 2. UPDATE STATUS ITEM YANG DIKLIK
      newStages = newStages.map(stage => {
        // A. Jika ID Cocok dengan Stage Utama (Angka)
        if (stage.id === id) {
           return { ...stage, status: 'done', date: new Date().toLocaleDateString('id-ID') };
        }
        
        // B. Jika ID Cocok dengan Sub-Stage (String '2.1' dst)
        if (stage.subStages) {
           const subIndex = stage.subStages.findIndex(sub => sub.id === id);
           if (subIndex !== -1) {
              stage.subStages[subIndex].status = 'done';
           }
        }
        return stage;
      });

      // 3. CEK OTOMATIS: APAKAH PARENT STAGE SUDAH SELESAI SEMUA?
      newStages = newStages.map(stage => {
         if (stage.subStages && stage.subStages.length > 0) {
            // Cek apakah SEMUA anak sudah 'done'
            const allSubsDone = stage.subStages.every(sub => sub.status === 'done');
            
            // Jika semua anak done, maka BAPAKNYA juga jadi done
            if (allSubsDone && stage.status !== 'done') {
               stage.status = 'done';
               stage.date = new Date().toLocaleDateString('id-ID');
            }
         }
         return stage;
      });

      // 4. CEK OTOMATIS: BUKA TAHAP SELANJUTNYA (UNLOCK NEXT STAGE)
      // Loop untuk mencari stage yang 'done', lalu buka stage setelahnya (id + 1)
      for (let i = 0; i < newStages.length - 1; i++) {
         const current = newStages[i];
         const next = newStages[i+1];

         // Jika tahap sekarang SELESAI, dan tahap depan masih TERKUNCI -> BUKA!
         if (current.status === 'done' && next.status === 'locked') {
            next.status = 'open';
         }
      }

      return newStages;
    });
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