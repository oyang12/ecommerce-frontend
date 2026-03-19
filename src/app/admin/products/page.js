"use client";
import { useEffect, useState } from "react";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  // State untuk Edit
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // STATE BARU: Untuk menampung gambar produk yang sudah ada saat edit
  const [existingImages, setExistingImages] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: "",
    stock: "",
    description: "",
  });

  const API_URL = "https://ecommerce-backend-production-aa2e.up.railway.app/api/products";
  const IMAGE_API_URL = "https://ecommerce-backend-production-aa2e.up.railway.app/api/product-images"; // API Baru untuk hapus gambar

  // 1. Ambil Data Produk
  const fetchProducts = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(API_URL, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await res.json();
      setProducts(result.data || []); 
    } catch (err) {
      console.error("Gagal fetch:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. Fungsi Hapus Produk (Lengkap)
  const handleDeleteProduct = async (id) => {
    if (!confirm("Yakin mau hapus produk ini? Semua gambar produk juga akan terhapus.")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Produk berhasil dihapus!");
        fetchProducts();
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menghapus.");
    }
  };

  // 3. Handle Nama & Slug
  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    setFormData({ ...formData, name, slug });
  };

  // 4. Fungsi memicu Mode Edit (DIPERBARUI untuk mengambil gambar)
  const handleEditClick = async (p) => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      // Ambil data detail produk (termasuk images) dari API
      const res = await fetch(`${API_URL}/${p.id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await res.json();
      const productDetail = result.data;

      if (productDetail) {
        setFormData({
          name: productDetail.name,
          slug: productDetail.slug,
          price: productDetail.price,
          stock: productDetail.stock,
          description: productDetail.description || "",
        });
        setEditId(productDetail.id);
        
        // SET GAMBAR YANG SUDAH ADA KE STATE
        setExistingImages(productDetail.images || []);
        
        setIsEdit(true);
        setShowModal(true);
      }
    } catch (err) {
      console.error("Gagal ambil detail produk:", err);
      alert("Gagal mengambil detail produk");
    } finally {
      setLoading(false);
    }
  };

  // 5. FUNGSI BARU: Hapus satu gambar tertentu (di DB)
  const handleDeleteExistingImage = async (imageId) => {
    if (!confirm("Yakin mau hapus foto ini?")) return;
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const res = await fetch(`${IMAGE_API_URL}/${imageId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      //if (res.ok) {
        // Hapus dari state agar hilang dari tampilan
        //setExistingImages(existingImages.filter(img => img.id !== imageId));
        //alert("Foto berhasil dihapus!");
      //} else {
        //alert("Gagal menghapus foto.");
      //}
    } catch (err) {
      console.error("Error hapus foto:", err);
    } finally {
      setLoading(false);
    }
  };

  // 6. Handle Simpan Produk (DIPERBARUI)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    const dataToSend = new FormData();
    dataToSend.append("name", formData.name);
    dataToSend.append("slug", formData.slug);
    dataToSend.append("price", formData.price);
    dataToSend.append("stock", formData.stock);
    dataToSend.append("description", formData.description);

    // Kirim foto baru jika ada
    if (selectedFiles.length > 0) {
      for (let i = 0; i < selectedFiles.length; i++) {
        dataToSend.append("images[]", selectedFiles[i]);
      }
    }

    const url = isEdit ? `${API_URL}/${editId}` : API_URL;
    if (isEdit) {
      dataToSend.append("_method", "PUT"); // Method spoofing untuk update FormData
    }

    try {
      const res = await fetch(url, {
        method: "POST", // Tetap POST karena FormData
        headers: { "Authorization": `Bearer ${token}` },
        body: dataToSend
      });

      if (res.ok) {
        alert(isEdit ? "Produk Berhasil Diperbarui!" : "Produk Berhasil Ditambah!");
        closeModal();
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
  };

  // Fungsi Reset Modal (DIPERBARUI)
  const closeModal = () => {
    setShowModal(false);
    setIsEdit(false);
    setEditId(null);
    setFormData({ name: "", slug: "", price: "", stock: "", description: "" });
    setSelectedFiles([]);
    setExistingImages([]); // Reset state gambar
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-black">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Produk MyStore</h1>
          <button 
            onClick={() => { closeModal(); setShowModal(true); }} // Pastikan reset modal dulu
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition shadow-md"
          >
            + Tambah Produk Baru
          </button>
        </div>

        {/* TABEL PRODUK */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b text-gray-600 uppercase text-xs">
                <th className="p-4 text-left">Nama Produk</th>
                <th className="p-4 text-left">Slug</th>
                <th className="p-4 text-left">Stok</th>
                <th className="p-4 text-left">Harga</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-gray-800">{p.name}</td>
                    <td className="p-4 text-gray-500 text-sm">{p.slug}</td>
                    <td className="p-4 text-gray-700">{p.stock}</td>
                    <td className="p-4 font-semibold text-blue-600">
                      Rp {Number(p.price).toLocaleString()}
                    </td>
                    <td className="p-4 text-center flex justify-center gap-4">
                      <button 
                        onClick={() => handleEditClick(p)}
                        className="text-blue-500 hover:underline font-medium disabled:opacity-50"
                        disabled={loading} // Cegah klik ganda saat loading ambil detail
                      >
                        {loading && editId === p.id ? "..." : "Edit"}
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(p.id)}
                        className="text-red-500 hover:underline font-medium"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-400">Belum ada produk.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM (TAMBAH & EDIT) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {isEdit ? "Edit Data Produk" : "Input Data Produk"}
            </h2>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              
              {/* Form Input sama seperti punyamu (Name, Slug, Price, Stock, Desc) */}
              <div>
                <label className="block text-sm font-semibold mb-1">Nama Produk</label>
                <input type="text" required className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  value={formData.name} onChange={handleNameChange} placeholder="Contoh: Sepatu Sneakers" />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-500 text-xs italic">Slug (Otomatis)</label>
                <input type="text" readOnly className="w-full border p-2 rounded-lg bg-gray-100 text-gray-500"
                  value={formData.slug} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Harga (Rp)</label>
                  <input type="number" required className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                    value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Stok</label>
                  <input type="number" required className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                    value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Deskripsi</label>
                <textarea className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" rows="3"
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              {/* SECTION BARU: Pratinjau Gambar yang Sudah Ada (Mode Edit) */}
              {isEdit && existingImages.length > 0 && (
                <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 mt-4">
                  <label className="block text-sm font-semibold mb-3 text-gray-700">Foto Saat Ini (Pilih 'X' untuk hapus)</label>
                  <div className="grid grid-cols-4 gap-3">
                    {existingImages.map((img) => (
                      <div key={img.id} className="relative group aspect-square border-2 border-white rounded-lg shadow">
                        <img 
                          src={img.url} 
                          alt="Foto Produk"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        {/* Tombol Hapus (X) Kecil */}
                        <button 
                          type="button"
                          onClick={() => handleDeleteExistingImage(img.id)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-700 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Hapus foto ini"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Foto Baru */}
              <div className="mt-4">
                <label className="block text-sm font-semibold mb-1 text-blue-600">
                  {isEdit ? "Tambah Foto Baru (Opsional)" : "Upload Foto Produk"}
                </label>
                <input type="file" multiple accept="image/*" className="w-full border p-1 rounded-lg text-sm bg-blue-50 cursor-pointer"
                  onChange={(e) => setSelectedFiles(e.target.files)} />
                <p className="text-[10px] text-gray-400 mt-1">*Bisa pilih banyak foto sekaligus (Tahan Ctrl/Cmd)</p>
              </div>

              <div className="flex justify-end gap-3 mt-8 border-t pt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-500 hover:text-gray-700">Batal</button>
                <button type="submit" disabled={loading} className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 transition shadow-lg flex items-center gap-2">
                  {loading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {loading ? "Proses..." : isEdit ? "Update Produk" : "Simpan Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
