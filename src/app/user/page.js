'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function UserDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = () => {
      try {
        // PERBAIKAN: Cek apakah window/localStorage tersedia sebelum diakses
        if (typeof window !== 'undefined') {
          const savedUser = localStorage.getItem('user_session');
          if (savedUser) {
            setUserData(JSON.parse(savedUser));
            setIsLoggedIn(true);
          }
        }
      } catch (err) {
        console.error("Gagal mengecek sesi:", err);
      } finally {
        setLoading(false);
      }
    };
    checkLogin();
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_session');
      // Gunakan router atau refresh manual yang aman
      window.location.href = '/user'; 
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600"></div>
    </div>
  );

  // --- TAMPILAN JIKA BELUM LOGIN ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6">
            👋
          </div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2">Halo, Teman!</h1>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            Masuk ke akunmu untuk melihat riwayat pesanan dan mengelola profil belanja.
          </p>
          <Link 
            href="/login" 
            className="block w-full bg-[#0a0f1e] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-700 transition-all shadow-lg active:scale-95"
          >
            Masuk Sekarang
          </Link>
          <Link href="/" className="block mt-6 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black">
            ← Kembali ke Katalog
          </Link>
        </div>
      </div>
    );
  }

  // --- TAMPILAN JIKA SUDAH LOGIN ---
  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-black">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER USER */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-blue-100">
              {userData?.name?.charAt(0) || "U"}
            </div>
            <div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Selamat Datang</span>
              <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none mt-1">
                {userData?.name || "User Dummy"}
              </h1>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="px-8 py-3 bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm"
          >
            Logout
          </button>
        </div>

        {/* DASHBOARD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 border-b border-gray-50 pb-4">Info Akun</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black text-gray-300 uppercase">Email</p>
                  <p className="font-bold text-gray-800 text-sm">{userData?.email || "dummy@mail.com"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-300 uppercase">Member Sejak</p>
                  <p className="font-bold text-gray-800 text-sm">Januari 2026</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              Pesanan Terakhir
            </h3>
            
            {[1, 2].map((item) => (
              <div key={item} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-blue-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center text-xl">📦</div>
                  <div>
                    <h4 className="font-black text-gray-900 uppercase text-sm tracking-tight">INV/2026/03/00{item}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">3 Produk • Rp 450.000</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <span className="flex-1 md:flex-none text-center px-4 py-2 bg-yellow-50 text-yellow-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                    Proses
                  </span>
                  <button className="flex-1 md:flex-none px-4 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">
                    Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
