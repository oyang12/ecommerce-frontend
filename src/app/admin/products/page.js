'use client';

import { useState, useEffect } from 'react';
import { fetchProducts, deleteProduct } from '../services/api'; 

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]); // Fitur 3: Bulk Delete
  const [searchTerm, setSearchTerm] = useState(''); // Fitur tambahan: Search
  const [filterCategory, setFilterCategory] = useState('All'); // Fitur 2: Kategori

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res = await fetchProducts();
    setProducts(res.data || res);
  };

  // --- LOGIKA FITUR 1: STATISTIK ---
  const stats = {
    total: products.length,
    lowStock: products.filter(p => p.stock < 5).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    drafts: products.filter(p => !p.is_active).length // Fitur 4
  };

  // --- LOGIKA FITUR 3: BULK DELETE ---
  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (confirm(`Hapus ${selectedIds.length} produk sekaligus?`)) {
      // Di sini nanti panggil API loop atau bulk endpoint
      alert("Fitur hapus massal siap dihubungkan ke API!");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-800">
      
      {/* 1. SECTION STATISTIK (Fitur #1) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 font-bold uppercase">Total Produk</p>
          <h2 className="text-3xl font-black">{stats.total}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-orange-500">
          <p className="text-sm text-gray-500 font-bold uppercase">Stok Menipis</p>
          <h2 className="text-3xl font-black text-orange-600">{stats.lowStock}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-red-500">
          <p className="text-sm text-gray-500 font-bold uppercase">Stok Habis</p>
          <h2 className="text-3xl font-black text-red-600">{stats.outOfStock}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-gray-400">
          <p className="text-sm text-gray-500 font-bold uppercase">Draft/Nonaktif</p>
          <h2 className="text-3xl font-black text-gray-400">{stats.drafts}</h2>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* 2. TOOLBAR: SEARCH & CATEGORY (Fitur #2 & #3) */}
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Cari produk..." 
              className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select className="px-4 py-2 border rounded-xl bg-white" onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="All">Semua Kategori</option>
              <option value="Canvas">Canvas</option>
              <option value="Alat Lukis">Alat Lukis</option>
            </select>
          </div>

          <div className="flex gap-2">
            {selectedIds.length > 0 && (
              <button 
                onClick={handleBulkDelete}
                className="bg-red-50 text-red-600 px-6 py-2 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all"
              >
                Hapus ({selectedIds.length})
              </button>
            )}
            <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200">
              + Tambah Produk
            </button>
          </div>
        </div>

        {/* 3. TABEL UTAMA (Fitur #4 - Status & Toggle) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold">
              <tr>
                <th className="p-4 w-10">
                  <input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? products.map(p => p.id) : [])} />
                </th>
                <th className="p-4">Produk</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Harga</th>
                <th className="p-4">Stok</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-4">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(p.id)} 
                      onChange={() => toggleSelect(p.id)} 
                    />
                  </td>
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden">
                       <img src={`https://ecommerce-backend-production-aa2e.up.railway.app/storage/products/${p.thumbnail}`} className="object-cover w-full h-full" alt="" />
                    </div>
                    <span className="font-bold text-gray-700">{p.name}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">Peralatan Lukis</td>
                  <td className="p-4 font-bold text-blue-600">Rp {Number(p.price).toLocaleString('id-ID')}</td>
                  <td className="p-4">
                    <span className={`font-medium ${p.stock < 5 ? 'text-orange-500' : 'text-gray-600'}`}>
                      {p.stock} pcs
                    </span>
                  </td>
                  <td className="p-4">
                    {/* Fitur #4: Status Toggle */}
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      p.is_active !== false ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {p.is_active !== false ? '● Active' : '○ Draft'}
                    </span>
                  </td>
                  <td className="p-4 text-center flex justify-center gap-2">
                    <button className="text-blue-500 hover:underline font-bold text-sm">Edit</button>
                    <button className="text-red-500 hover:underline font-bold text-sm">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
