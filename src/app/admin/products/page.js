"use client";
import { useEffect, useState } from "react";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const handleDelete = async (id) => {
  if (!confirm("Yakin mau hapus produk ini?")) return;

  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`https://ecommerce-backend-production-aa2e.up.railway.app/api/products/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (res.ok) {
      alert("Produk berhasil dihapus!");
      // Update tampilan tabel tanpa reload halaman
      setProducts(products.filter(p => p.id !== id));
    } else {
      alert("Gagal menghapus. Pastikan kamu Admin.");
    }
  } catch (err) {
    alert("Terjadi kesalahan koneksi.");
  }
};

// ... di dalam return (bagian tombol hapus), ubah menjadi:
<button 
  onClick={() => handleDelete(p.id)} 
  className="text-red-500 hover:underline"
>
  Hapus
</button>
  useEffect(() => {
    const token = localStorage.getItem("token");
    
    // Ambil data produk khusus admin
    fetch("https://ecommerce-backend-production-aa2e.up.railway.app/api/products", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => setProducts(data.data));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Panel Admin - Kelola Produk</h1>
      <button className="bg-green-500 text-white px-4 py-2 rounded mb-4">+ Tambah Produk</button>
      
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Nama</th>
            <th className="border p-2 text-left">Harga</th>
            <th className="border p-2 text-left">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td className="border p-2">{p.name}</td>
              <td className="border p-2">{p.price}</td>
              <td className="border p-2">
                <button className="text-blue-500 mr-2">Edit</button>
                <button className="text-red-500">Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
