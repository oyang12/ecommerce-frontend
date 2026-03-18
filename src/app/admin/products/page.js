"use client";
import { useEffect, useState } from "react";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // 1. Tambahkan state khusus untuk menampung array file
  const [selectedFiles, setSelectedFiles] = useState([]); 
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: "",
    stock: "",
    description: "",
  });

  const API_URL = "https://ecommerce-backend-production-aa2e.up.railway.app/api/products";

  const fetchProducts = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(API_URL, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const result = await res.json();
    setProducts(result.data || []);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    setFormData({ ...formData, name, slug });
  };

  // 2. Fungsi untuk menangani pemilihan banyak file
  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files); // e.target.files adalah FileList (array-like)
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    const dataToSend = new FormData();
    dataToSend.append("name", formData.name);
    dataToSend.append("slug", formData.slug);
    dataToSend.append("price", formData.price);
    dataToSend.append("stock", formData.stock);
    dataToSend.append("description", formData.description);

    // 3. LOGIKA KRUSIAL: Looping semua file ke dalam images[]
    if (selectedFiles.length > 0) {
      for (let i = 0; i < selectedFiles.length; i++) {
        dataToSend.append("images[]", selectedFiles[i]); 
      }
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: dataToSend
      });

      if (res.ok) {
        alert("Produk & Semua Gambar Berhasil Ditambah!");
        setShowModal(false);
        setFormData({ name: "", slug: "", price: "", stock: "", description: "" });
        setSelectedFiles([]); // Reset file
        fetchProducts();
      } else {
        const errData = await res.json();
        alert("Gagal: " + JSON.stringify(errData));
      }
    } catch (err) {
      alert("Error koneksi ke server");
    } finally {
      setLoading(false);
    }
  }

  // ... (Tampilan Table sama seperti sebelumnya) ...

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
       {/* ... (Header & Table) ... */}
       <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Produk MyStore</h1>
          <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-5 py-2 rounded-lg">+ Tambah Produk</button>
        </div>
        {/* Render Table kamu di sini */}
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-6">Input Data Produk</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              {/* Input Name, Slug, Price, Stock, Desc sama seperti punyamu */}
              <div>
                <label className="block text-sm font-semibold mb-1">Nama Produk</label>
                <input type="text" required className="w-full border p-2 rounded-lg" value={formData.name} onChange={handleNameChange} />
              </div>

              {/* 4. PERUBAHAN INPUT FILE */}
              <div>
                <label className="block text-sm font-semibold mb-1 text-blue-600">Upload Gambar Produk (Bisa Pilih Banyak)</label>
                <input 
                  type="file" 
                  multiple // WAJIB ADA agar bisa pilih > 1 file
                  accept="image/*" 
                  className="w-full border p-1 rounded-lg text-sm"
                  onChange={handleFileChange} 
                />
                <p className="text-[10px] text-gray-400 mt-1">*Kamu bisa pilih 1 foto atau lebih (tampak depan, samping, dll)</p>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2">Batal</button>
                <button type="submit" disabled={loading} className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold">
                  {loading ? "Proses..." : "Simpan Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
