import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { 
  FiUsers, FiBarChart2, FiClock, FiSmartphone, 
  FiTrendingUp, FiTrendingDown, FiFolder, FiAward
} from 'react-icons/fi';

export default function AdminAnalyticsView() {
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // --- 1. STATE UNTUK KPI & DEVICE ---
  const [kpiStats, setKpiStats] = useState({
    pengunjung: 0,
    interaksi: 0, 
    avgTime: '1m 45s', 
    mobile: 0
  });

  const [deviceStats, setDeviceStats] = useState({
    mobile: 0, desktop: 0, tablet: 0
  });

  // --- 2. STATE UNTUK KATEGORI, TOP 5, DAN CHART (Semua Dinamis) ---
  const [categoryStats, setCategoryStats] = useState([]);
  const [topAnnounceStats, setTopAnnounceStats] = useState([]);
  const [barChartData, setBarChartData] = useState([]); // <--- Sekarang jadi State kosong

  // --- FUNGSI UTAMA: MENARIK & MENGOLAH DATA REALTIME ---
  const fetchAnalyticsData = async () => {
    try {
      // 1. Tarik semua log pengunjung
      const { data: logData, error: logError } = await supabase.from('log_pengunjung').select('*');
      
      // 2. Tarik semua data pengumuman
      const { data: pengumumanData, error: pError } = await supabase.from('Pengumuman').select('id, Judul, kategori');

      if (logData && pengumumanData) {
        const totalPengunjung = logData.length;
        
        // --- A. HITUNG DEVICE STATS ---
        const countMobile = logData.filter(d => d.device_type === 'Mobile').length;
        const countDesktop = logData.filter(d => d.device_type === 'Desktop').length;
        const countTablet = logData.filter(d => d.device_type === 'Tablet').length;

        const pctMobile = totalPengunjung === 0 ? 0 : Math.round((countMobile / totalPengunjung) * 100);
        const pctDesktop = totalPengunjung === 0 ? 0 : Math.round((countDesktop / totalPengunjung) * 100);
        const pctTablet = totalPengunjung === 0 ? 0 : Math.round((countTablet / totalPengunjung) * 100);

        setDeviceStats({ mobile: pctMobile, desktop: pctDesktop, tablet: pctTablet });

        // --- B. HITUNG KATEGORI & TOP 5 PENGUMUMAN ---
        let categoryCounts = {};
        let announceCounts = {};
        let totalInteraksi = 0;

        const announceDict = {};
        pengumumanData.forEach(p => { announceDict[p.id] = p; });

        logData.forEach(log => {
           if (log.pengumuman_id && announceDict[log.pengumuman_id]) {
               totalInteraksi++;
               const cat = announceDict[log.pengumuman_id].kategori || 'Umum';
               categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
               announceCounts[log.pengumuman_id] = (announceCounts[log.pengumuman_id] || 0) + 1;
           }
        });

        const colors = ['bg-blue-600', 'bg-pink-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
        const formattedCategoryStats = Object.keys(categoryCounts).map((cat, idx) => {
            const views = categoryCounts[cat];
            return {
                label: cat, views: views,
                percent: totalInteraksi === 0 ? 0 : Math.round((views / totalInteraksi) * 100),
                color: colors[idx % colors.length]
            };
        }).sort((a, b) => b.percent - a.percent);

        setCategoryStats(formattedCategoryStats);

        const formattedTop = Object.keys(announceCounts).map(id => {
            const count = announceCounts[id];
            const p = announceDict[id];
            return {
                id: p.id, title: p.Judul, category: p.kategori || 'Umum',
                viewsCount: count, views: count.toLocaleString(),
                percent: totalInteraksi === 0 ? 0 : Math.round((count / totalInteraksi) * 100)
            };
        })
        .sort((a, b) => b.viewsCount - a.viewsCount).slice(0, 5)
        .map((item, idx) => ({ ...item, rank: idx + 1 }));

        setTopAnnounceStats(formattedTop);

        // --- C. HITUNG GRAFIK BAR (14 HARI TERAKHIR) ---
        // Buat array berisi 14 tanggal ke belakang (Format: "15 Mar")
        const last14Days = Array.from({length: 14}, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (13 - i));
          return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        });

        // Siapkan keranjang kosong untuk tiap tanggal
        const dailyCounts = {};
        last14Days.forEach(day => dailyCounts[day] = 0);

        // Masukkan data log ke keranjang tanggal yang sesuai
        logData.forEach(log => {
          const dateStr = new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
          if (dailyCounts[dateStr] !== undefined) {
            dailyCounts[dateStr]++;
          }
        });

        // Format datanya agar siap dipakai grafik
        const formattedChartData = last14Days.map(day => ({
          day: day,
          value: dailyCounts[day]
        }));
        
        setBarChartData(formattedChartData); // <--- Masukkan data asli ke grafik!

        // --- D. UPDATE KPI UTAMA ---
        setKpiStats(prev => ({ 
          ...prev, 
          pengunjung: totalPengunjung,
          interaksi: totalInteraksi,
          mobile: pctMobile
        }));
      }

      setLastUpdate(new Date());
    } catch (err) {
      console.error("Gagal mengambil data analitik:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();

    const realtimeChannel = supabase.channel('dashboard_analytics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Pengumuman' }, () => {
        handleRealtimeUpdate();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'log_pengunjung' }, () => {
        handleRealtimeUpdate();
      })
      .subscribe();

    const handleRealtimeUpdate = () => {
      setIsLive(true); 
      fetchAnalyticsData();
      setTimeout(() => setIsLive(false), 2000);
    };

    return () => supabase.removeChannel(realtimeChannel);
  }, []);

  return (
    <div className="flex flex-col space-y-6 animate-pop-in pb-10">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><FiBarChart2 size={24} /></div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
            <p className="text-sm text-gray-500 font-medium mt-1">Statistik dan insight pengumuman kampus</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-100 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-ping' : 'bg-green-500'}`}></div>
            <span className="text-[10px] font-bold text-green-700 tracking-widest uppercase">LIVE</span>
          </div>
          <select className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none hover:bg-gray-50 cursor-pointer shadow-sm">
            <option>14 Hari Terakhir</option>
          </select>
        </div>
      </div>

      {/* --- KPI CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard icon={<FiUsers size={20} />} iconBg="bg-purple-50 text-purple-600" value={kpiStats.pengunjung.toLocaleString()} label="Total Pengunjung" trend="Real-time" isUp={true} />
        <KpiCard icon={<FiBarChart2 size={20} />} iconBg="bg-green-50 text-green-500" value={kpiStats.interaksi.toLocaleString()} label="Total Interaksi" trend="Real-time" isUp={true} />
        <KpiCard icon={<FiClock size={20} />} iconBg="bg-orange-50 text-orange-500" value={kpiStats.avgTime} label="Avg. Waktu Baca" trend="Estimasi" isUp={true} />
        <KpiCard icon={<FiSmartphone size={20} />} iconBg="bg-blue-50 text-blue-500" value={`${kpiStats.mobile}%`} label="Pengguna Mobile" trend="Real-time" isUp={true} />
      </div>

      {/* --- MIDDLE ROW --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bar Chart (DINAMIS DARI DATABASE) */}
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <h3 className="text-[14px] font-bold text-gray-800 mb-2 flex items-center gap-2">
            <FiBarChart2 className="text-blue-500" /> Views per Hari (14 Hari Terakhir)
          </h3>
          
          <div className="flex-1 overflow-x-auto custom-scrollbar pt-4">
            <div className="flex items-end justify-start gap-4 md:gap-8 h-56 px-4 md:px-6 relative min-w-max border-b border-gray-100">
              <div className="absolute w-full h-px bg-gray-50 bottom-[30px] left-0"></div>
              <div className="absolute w-full h-px bg-gray-50 bottom-[calc(30px+33%)] left-0"></div>
              <div className="absolute w-full h-px bg-gray-50 bottom-[calc(30px+66%)] left-0"></div>
              
              {barChartData.map((data, idx) => {
                // Skala maksimal otomatis menyesuaikan data tertinggi, minimal 10 agar grafik tidak terlalu pendek
                const maxVal = Math.max(...barChartData.map(d => d.value), 10);
                const heightPct = Math.max((data.value / maxVal) * 100, 5); 

                return (
                  <div key={idx} className="group flex flex-col items-center justify-end h-full flex-shrink-0 w-8 md:w-10 z-10 pb-1">
                    <div className="relative w-full flex-1 flex flex-col justify-end">
                      {data.value > 0 && (
                         <span className="text-[10px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md border border-gray-100 z-20 pointer-events-none">
                           {data.value} views
                         </span>
                      )}
                      <div className={`w-full rounded-t-md hover:brightness-90 transition-all duration-700 cursor-pointer shadow-sm ${data.value > 0 ? 'bg-blue-600' : 'bg-gray-200'}`} style={{ height: `${heightPct}%` }}></div>
                    </div>
                    <span className="text-[10px] md:text-[11px] font-bold text-gray-500 whitespace-nowrap mt-2 h-4 flex items-center">
                      {data.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Device Statistics */}
        <div className="col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-[14px] font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FiSmartphone className="text-blue-500" /> Device Statistics
          </h3>
          {kpiStats.pengunjung === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
               <p className="text-[11px] uppercase tracking-wider">Belum ada pengunjung.</p>
            </div>
          ) : (
            <div className="space-y-6 mt-4">
              <ProgressBar label="Mobile" percent={deviceStats.mobile} color="bg-blue-600" />
              <ProgressBar label="Desktop" percent={deviceStats.desktop} color="bg-green-500" />
              <ProgressBar label="Tablet" percent={deviceStats.tablet} color="bg-yellow-500" />
            </div>
          )}
        </div>
      </div>

      {/* --- BOTTOM ROW --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top 5 Pengumuman (DINAMIS DARI DATABASE) */}
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-[14px] font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FiAward className="text-orange-500" /> Top 5 Pengumuman
          </h3>
          
          {topAnnounceStats.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <p className="text-sm">Belum ada data interaksi pengumuman.</p>
             </div>
          ) : (
            <div className="space-y-4">
              {topAnnounceStats.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group cursor-default">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
                      item.rank === 1 ? 'bg-yellow-400 text-white' : 
                      item.rank === 2 ? 'bg-gray-200 text-gray-700' :
                      item.rank === 3 ? 'bg-orange-200 text-orange-800' :
                      'bg-gray-50 text-gray-500 border border-gray-100'
                    }`}>
                      {item.rank}
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-gray-800">{item.title}</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        <span className="font-semibold">{item.category}</span> • {item.views} views
                      </p>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <span className="text-[12px] font-bold text-green-500">{item.percent}%</span>
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${item.percent}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Views per Kategori (DINAMIS DARI DATABASE) */}
        <div className="col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-[14px] font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FiFolder className="text-yellow-500" /> Views per Kategori
          </h3>
          
          {categoryStats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
               <p className="text-[11px] uppercase tracking-wider">Belum ada data interaksi.</p>
            </div>
          ) : (
            <div className="space-y-6 mt-4">
              {categoryStats.map((cat, idx) => (
                 <ProgressBar key={idx} label={cat.label} views={cat.views.toLocaleString()} percent={cat.percent} color={cat.color} />
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

// --- SUB-KOMPONEN: KPI CARD ---
const KpiCard = ({ icon, iconBg, value, label, trend, isUp }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all cursor-default">
    <div className="flex justify-between items-start mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
      <div className={`px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 ${isUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
        {isUp ? <FiTrendingUp /> : <FiTrendingDown />} {trend}
      </div>
    </div>
    <h3 className="text-2xl md:text-3xl font-black text-gray-800 mb-1">{value}</h3>
    <p className="text-xs text-gray-500 font-medium">{label}</p>
  </div>
);

// --- SUB-KOMPONEN: PROGRESS BAR ---
const ProgressBar = ({ label, views, percent, color }) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <span className="text-[12px] font-bold text-gray-700 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-sm ${color}`}></div>
        {label}
      </span>
      <div className="text-[11px] font-bold">
        {views && <span className="text-gray-400 mr-2">{views}</span>}
        <span className="text-blue-600">{percent}%</span>
      </div>
    </div>
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`} style={{ width: `${percent}%` }}></div>
    </div>
  </div>
);