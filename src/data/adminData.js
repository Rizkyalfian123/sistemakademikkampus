import { 
  FiHome, FiSpeaker, FiMaximize, FiCheckSquare, 
  FiPieChart, FiMessageSquare, FiDatabase, FiEdit2, FiBriefcase, FiUsers
} from 'react-icons/fi';

export const MENU_ITEMS = [
  { id: 'Dashboard', label: 'Dashboard', icon: FiHome },
  { id: 'Pengumuman', label: 'Pengumuman', icon: FiSpeaker },
  { id: 'Mitra', label: 'Profil Mitra', icon: FiBriefcase },
  { id: 'ImportMahasiswa', label: 'Import Mahasiswa', icon: FiUsers },
  { id: 'OCRScanner', label: 'OCR Scanner', icon: FiMaximize },
  { id: 'Verifikasi', label: 'Verifikasi', icon: FiCheckSquare },
  { id: 'Analytics', label: 'Analytics', icon: FiPieChart },
  { id: 'Chatbot', label: 'Chatbot', icon: FiMessageSquare },
  { id: 'Backup', label: 'Backup', icon: FiDatabase },
];

export const STATS_DATA = [
  { title: 'Total Pengumuman', value: '156', icon: FiSpeaker, iconBg: 'bg-pink-100', iconColor: 'text-pink-600' },
  { title: 'Aktif', value: '124', icon: FiCheckSquare, iconBg: 'bg-green-100', iconColor: 'text-green-600' },
  { title: 'Draft', value: '18', icon: FiEdit2, iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
  { title: 'Total Views', value: '8,542', icon: FiPieChart, iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
];

export const TABLE_DATA = [
  { id: 1, judul: 'Pendaftaran KRS Semester Genap 2025/2026', kategori: 'Akademik', tanggal: '7 Jan 2026', status: 'Aktif', views: '1,245' },
  { id: 2, judul: 'Beasiswa Unggulan 2026 Dibuka', kategori: 'Beasiswa', tanggal: '6 Jan 2026', status: 'Aktif', views: '2,156' },
  { id: 3, judul: 'Tech Summit 2026', kategori: 'Event', tanggal: '5 Jan 2026', status: 'Draft', views: '0' },
  { id: 4, judul: 'Pelatihan Public Speaking', kategori: 'Kemahasiswaan', tanggal: '4 Jan 2026', status: 'Aktif', views: '892' },
  { id: 5, judul: 'Kompetisi Karya Tulis Ilmiah', kategori: 'Lomba', tanggal: '3 Jan 2026', status: 'Nonaktif', views: '3,456' },
];