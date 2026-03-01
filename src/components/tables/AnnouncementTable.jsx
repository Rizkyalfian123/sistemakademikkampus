import React from 'react';
import { FiSearch, FiEdit2, FiTrash2, FiLoader, FiPlus } from 'react-icons/fi';

export const AnnouncementTable = ({ searchQuery, setSearchQuery, data, loading, onAdd, onEdit, onDelete }) => {
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const filteredData = data.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    const judulMatch = item.Judul?.toLowerCase().includes(searchLower);
    const kategoriMatch = item.kategori?.toLowerCase().includes(searchLower);
    return judulMatch || kategoriMatch;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      
      {/* HEADER TABEL & SEARCH & TOMBOL TAMBAH */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-gray-800">Daftar Pengumuman</h3>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari judul/kategori..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
            />
          </div>
          
          {/* Tombol Tambah */}
          <button 
            onClick={onAdd}
            className="w-full sm:w-auto bg-[#0f2a4a] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#163c69] transition-all text-sm shadow-md flex items-center justify-center gap-2"
          >
            <FiPlus size={18} /> Tambah Baru
          </button>
        </div>
      </div>

      {/* ISI TABEL */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Judul</th>
              <th className="px-6 py-4 font-semibold text-center">Kategori</th>
              <th className="px-6 py-4 font-semibold text-center">Tanggal</th>
              <th className="px-6 py-4 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <FiLoader className="animate-spin text-xl text-blue-500" />
                    <span>Memuat data pengumuman...</span>
                  </div>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                  Data pengumuman tidak ditemukan.
                </td>
              </tr>
            ) : (
              filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800 max-w-xs lg:max-w-md truncate" title={row.Judul}>
                    {row.Judul}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">
                     <span className="bg-gray-100 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide border border-gray-200">
                       {row.kategori || 'Umum'}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-500 whitespace-nowrap">
                    {formatDate(row.created_at)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => onEdit(row)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-transparent hover:border-blue-200" title="Edit"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(row.id)}
                        className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200" title="Hapus"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};