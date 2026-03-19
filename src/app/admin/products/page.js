"use client";
import { useEffect, useState, useRef } from "react";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State untuk file asli (yang akan dikirim ke server)
  const [selectedFiles, setSelectedFiles] = useState([]);
  // State untuk menyimpan URL pratinjau foto baru
  const [previewUrls, setPreviewUrls] = useState([]);
  
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [existingImages, setExistingImages] = useState([]);

  // Ref untuk mengontrol input file secara manual agar tulisan "X files" hilang
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: "",
    stock: "",
    description: "",
  });

  const API_URL = "https://ecommerce-backend-production-aa2e.up.railway.app/api/products";
  const IMAGE_API_URL = "https://ecommerce-backend-production-aa2e.up.railway.app/api/product-images";

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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Tambahkan file baru ke daftar yang sudah ada
    const updatedFiles = [...selectedFiles, ...files];
    setSelectedFiles(updatedFiles);

    // Buat URL preview
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviewUrls]);

    // PENTING: Reset value input file ke null agar tulisan "X files" di sistem hilang
    // dan user bisa memilih file yang sama lagi jika tadi sempat dihapus.
    e.target.value = null;
  };

  const handleRemovePreview = (indexToRemove) => {
    URL.revokeObjectURL(previewUrls[indexToRemove]);
    setPreviewUrls(previewUrls.filter((_, index) => index !== indexToRemove));
    setSelectedFiles(selectedFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Yakin mau hapus produk ini?")) return;
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

  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    setFormData({ ...formData, name, slug });
  };

  const handleEditClick = async (p) => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
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
        setExistingImages(productDetail.images || []);
        setIsEdit(true);
        setShowModal(true);
      }
    } catch (err) {
      console.error("Gagal ambil detail produk:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExistingImage = async (imageId) => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const res = await fetch(`${IMAGE_API_URL}/${imageId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setExistingImages(existingImages.filter(img => img.id !== imageId));
      }
    } catch (err) {
      console.error("Error hapus foto:", err);
    } finally {
      setLoading(false);
    }
  };

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

    if (selectedFiles.length > 0) {
      selectedFiles.forEach((file) => {
        dataToSend.append("images[]", file);
      });
    }

    const url = isEdit ? `${API_URL}/${editId}` : API_URL;
    if (isEdit) dataToSend.append("_method", "PUT");

    try {
      const res = await fetch(url, {
        method: "POST",
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

  const closeModal = () => {
    setShowModal(false);
    setIsEdit(false);
    setEditId(null);
    setFormData({ name: "", slug: "", price: "", stock: "", description: "" });
    setSelectedFiles([]);
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setExistingImages([]);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-black">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Produk MyStore</h1>
          <button 
            onClick={() => { closeModal(); setShowModal(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition shadow-md"
          >
            + Tambah Produk Baru
          </button>
        </div>

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
                      <button onClick={() => handleEditClick(p)} className="text-blue-500 hover:underline font-medium disabled:opacity-50" disabled={loading}>
                        {loading && editId === p.id ? "..." : "Edit"}
                      </button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="text-red-500 hover:underline font-medium">Hapus</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="p-10 text-center text-gray-400">Belum ada produk.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {isEdit ? "Edit Data Produk" : "Input Data Produk"}
            </h2>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Nama Produk</label>
                <input type="text" required className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.name} onChange={handleNameChange} />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-500 text-xs italic">Slug (Otomatis)</label>
                <input type="text" readOnly className="w-full border p-2 rounded-lg bg-gray-100 text-gray-500" value={formData.slug} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Harga (Rp)</label>
                  <input type="number" required className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
                    value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Stok</label>
                  <input type="number" required className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
                    value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Deskripsi</label>
                <textarea className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-400" rows="3"
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              {/* FOTO YANG SUDAH ADA DI DATABASE (MODE EDIT) */}
              {isEdit && existingImages.length > 0 && (
                <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                  <label className="block text-sm font-semibold mb-2 text-gray-700 font-mono">Foto Saat Ini (Database)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {existingImages.map((img) => (
                      <div key={img.id} className="relative aspect-square border-2 border-white rounded-lg shadow-sm overflow-hidden">
                        <img src={img.url} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => handleDeleteExistingImage(img.id)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-md hover:bg-red-700 transition-colors">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PRATINJAU FOTO BARU YANG AKAN DIUPLOAD */}
              {previewUrls.length > 0 && (
                <div className="border border-dashed border-blue-200 rounded-lg p-4 bg-blue-50">
                  <label className="block text-sm font-semibold mb-2 text-blue-700 font-mono">Pratinjau Foto Baru</label>
                  <div className="grid grid-cols-4 gap-2">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square border-2 border-white rounded-lg shadow-sm overflow-hidden">
                        <img src={url} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => handleRemovePreview(index)} className="absolute top-1 right-1 bg-gray-800 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-md hover:bg-black transition-colors">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TOMBOL PILIH FOTO (KUSTOM) */}
              <div className="mt-4">
                <label className="block text-sm font-semibold mb-2 text-blue-600">
                  {isEdit ? "Tambah Foto Baru (Pilih untuk menambah)" : "Upload Foto Produk"}
                </label>
                
                {/* Input file asli (DISEMBUNYIKAN) */}
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  ref={fileInputRef}
                  className="hidden" 
                  onChange={handleFileChange} 
                />

                {/* Tombol Pengganti yang terlihat oleh User */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="w-full border-2 border-dashed border-blue-300 p-6 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 hover:border-blue-400 transition-all flex flex-col items-center justify-center gap-1 group shadow-sm"
                >
                  <span className="text-2xl font-bold group-hover:scale-125 transition-transform">+</span>
                  <span className="font-semibold text-sm">Pilih File Foto</span>
                  <p className="text-[10px] text-gray-400 italic">*Bisa pilih banyak foto sekaligus</p>
                </button>
              </div>

              <div className="flex justify-end gap-3 mt-8 border-t pt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium">Batal</button>
                <button type="submit" disabled={loading} className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 transition shadow-lg flex items-center gap-2">
                  {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
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
