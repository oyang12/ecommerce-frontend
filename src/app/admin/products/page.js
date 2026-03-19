"use client";

import { useEffect, useState, useRef } from "react";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [existingImages, setExistingImages] = useState([]);

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: "",
    stock: "",
    description: "",
    status: "Active",
  });

  // CONFIGURATION
  const API_URL = "https://ecommerce-backend-production-aa2e.up.railway.app/api/products";
  const IMAGE_API_URL = "https://ecommerce-backend-production-aa2e.up.railway.app/api/product-images";
  
  // Perbaikan URL: Pastikan mengarah ke folder public storage Laravel
  const STORAGE_URL = "https://ecommerce-backend-production-aa2e.up.railway.app/storage/";
  const FALLBACK_IMG = "https://via.placeholder.com/150?text=No+Image";

  // 1. FETCH SEMUA PRODUK (UNTUK HALAMAN UTAMA)
  const fetchProducts = async () => {
    setFetchLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(API_URL, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await res.json();
      setProducts(result.data || []); 
    } catch (err) {
      console.error("Gagal fetch:", err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. HANDLE EDIT CLICK (LOGIKA YANG TADI KITA BAHAS)
  const handleEditClick = async (p) => {
    if (!p) return;
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/${p.slug}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await res.json();
      const data = result.data;

      if (data) {
        setFormData({
          name: data.name,
          slug: data.slug,
          price: data.price,
          stock: data.stock,
          description: data.description || "",
          status: data.status || "Active",
        });
        setEditId(data.id);

        // LOGIKA DATABASE: Gabung STORAGE_URL dengan nama file mentah
        const formattedImages = (data.images || []).map(img => {
          const fileName = img.image || ""; 
          return {
            ...img,
            url: `${STORAGE_URL}${fileName}` 
          };
        });

        setExistingImages(formattedImages);
        setIsEdit(true);
        setShowModal(true);
      }
    } catch (err) {
      console.error("Gagal ambil detail:", err);
      alert("Gagal memuat detail produk.");
    } finally {
      setLoading(false);
    }
  };

  // 3. TAMBAH/HAPUS FILE BARU (PREVIEW)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const updatedFiles = [...selectedFiles, ...files];
    setSelectedFiles(updatedFiles);
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
    e.target.value = null;
  };

  const handleRemovePreview = (indexToRemove) => {
    URL.revokeObjectURL(previewUrls[indexToRemove]);
    setPreviewUrls(previewUrls.filter((_, index) => index !== indexToRemove));
    setSelectedFiles(selectedFiles.filter((_, index) => index !== indexToRemove));
  };

  // 4. HAPUS GAMBAR LAMA DARI DATABASE
  const handleDeleteExistingImage = async (imageId) => {
    if (!confirm("Hapus gambar ini dari server?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${IMAGE_API_URL}/${imageId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
      }
    } catch (err) {
      console.error("Gagal hapus gambar:", err);
    }
  };

  // 5. SIMPAN PRODUK (POST / PUT)
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
    dataToSend.append("status", formData.status);

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
        alert("Gagal menyimpan: " + JSON.stringify(errData.errors));
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
    setFormData({ name: "", slug: "", price: "", stock: "", description: "", status: "Active" });
    setSelectedFiles([]);
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setExistingImages([]);
  };

  const filteredProducts = products.filter(p => 
    (p.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-black">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight uppercase">Manajemen Produk</h1>
            <p className="text-gray-500 mt-1 italic">Update stok dan status produk toko Anda.</p>
          </div>
          <button 
            onClick={() => { closeModal(); setShowModal(true); }}
            className="bg-gray-900 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
          >
            + Produk Baru
          </button>
        </div>

        {/* SEARCH */}
        <div className="mb-6">
          <input 
            type="text" 
            placeholder="Cari nama produk..." 
            className="w-full md:w-1/3 p-3 rounded-xl border-2 outline-none focus:border-black transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden group hover:shadow-xl transition-all">
              <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                <img 
                  src={p.thumbnail ? `${STORAGE_URL}${p.thumbnail}` : FALLBACK_IMG} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                  alt={p.name}
                  onError={(e) => { e.target.src = FALLBACK_IMG; }}
                />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-800 uppercase truncate">{p.name}</h3>
                <p className="text-blue-600 font-black mt-2">Rp {Number(p.price).toLocaleString('id-ID')}</p>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleEditClick(p)} className="flex-1 bg-gray-900 text-white py-2 rounded-lg font-bold text-xs">Edit</button>
                  <button className="p-2 bg-red-50 text-red-600 rounded-lg">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL UPDATE/TAMBAH */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-black mb-6 uppercase text-gray-900">{isEdit ? "Update Produk" : "Produk Baru"}</h2>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              
              <input type="text" placeholder="Nama Produk" className="w-full border-2 p-3 rounded-xl outline-none" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Harga" className="w-full border-2 p-3 rounded-xl outline-none" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
                <input type="number" placeholder="Stok" className="w-full border-2 p-3 rounded-xl outline-none" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} required />
              </div>

              <textarea placeholder="Deskripsi" className="w-full border-2 p-3 rounded-xl outline-none h-24" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />

              {/* TAMPILAN GAMBAR LAMA (EXISTING) */}
              {isEdit && existingImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2 border-t pt-4">
                  {existingImages.map((img) => (
                    <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border bg-gray-50">
                      <img 
                        src={img.url} 
                        className="w-full h-full object-cover" 
                        alt="existing" 
                        onError={(e) => { e.target.src = FALLBACK_IMG; }} 
                      />
                      <button type="button" onClick={() => handleDeleteExistingImage(img.id)} className="absolute top-0 right-0 bg-red-600 text-white w-5 h-5 text-[10px]">✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* UPLOAD GAMBAR BARU */}
              <div className="pt-4">
                <input type="file" multiple accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                <button type="button" onClick={() => fileInputRef.current.click()} className="w-full border-2 border-dashed p-4 rounded-xl font-bold text-xs text-gray-500 hover:bg-gray-50">
                  + TAMBAH FOTO
                </button>
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                      <img src={url} className="w-full h-full object-cover" alt="preview" />
                      <button type="button" onClick={() => handleRemovePreview(index)} className="absolute top-0 right-0 bg-black text-white w-5 h-5 text-[10px]">✕</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={closeModal} className="px-6 font-bold text-gray-400 text-xs">BATAL</button>
                <button type="submit" disabled={loading} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold text-xs">
                  {loading ? "PROSES..." : "SIMPAN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
