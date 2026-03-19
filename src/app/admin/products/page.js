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

  const API_URL = "https://ecommerce-backend-production-aa2e.up.railway.app/api/products";
  const IMAGE_API_URL = "https://ecommerce-backend-production-aa2e.up.railway.app/api/product-images";
  const STORAGE_URL = "https://ecommerce-backend-production-aa2e.up.railway.app/storage/";
  const FALLBACK_IMG = "https://via.placeholder.com/150?text=No+Image";

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

        // LOGIKA GAMBAR LAMA: Ambil dari kolom 'image' sesuai screenshot DB kamu
        const formattedImages = (data.images || []).map(img => ({
          ...img,
          url: `${STORAGE_URL}${img.image}` 
        }));

        setExistingImages(formattedImages);
        setIsEdit(true);
        setShowModal(true);
      }
    } catch (err) {
      alert("Gagal memuat detail produk.");
    } finally {
      setLoading(false);
    }
  };

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

  const handleDeleteProduct = async (id) => {
    if (!confirm("Yakin mau hapus produk ini?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchProducts();
    } catch (err) {
      alert("Gagal menghapus.");
    }
  };

  const toggleStatus = async (product) => {
    const newStatus = product.status === "Active" ? "Draft" : "Active";
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/${product.id}`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ _method: "PUT", status: newStatus })
      });
      if (res.ok) fetchProducts();
    } catch (err) {
      alert("Gagal ubah status");
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
    dataToSend.append("status", formData.status);

    selectedFiles.forEach((file) => dataToSend.append("images[]", file));

    const url = isEdit ? `${API_URL}/${editId}` : API_URL;
    if (isEdit) dataToSend.append("_method", "PUT");

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: dataToSend
      });
      if (res.ok) {
        closeModal();
        fetchProducts();
      } else {
        const errData = await res.json();
        alert("Gagal simpan: " + JSON.stringify(errData.errors));
      }
    } catch (err) {
      alert("Error simpan data");
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
    setPreviewUrls([]);
    setExistingImages([]);
  };

  const filteredProducts = products.filter(p => 
    (p.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-black">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER & STATS */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight uppercase">Manajemen Produk</h1>
            <p className="text-gray-500 mt-1 italic">Update stok dan status produk toko Anda.</p>
          </div>
          <button onClick={() => { closeModal(); setShowModal(true); }} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95">+ Produk Baru</button>
        </div>

        {/* STATS TILES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 text-center md:text-left">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Total Produk</p>
            <h2 className="text-4xl font-black text-gray-900">{products.length}</h2>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-[10px] font-black uppercase text-orange-400 tracking-widest mb-1">Stok Menipis</p>
            <h2 className="text-4xl font-black text-gray-900">{products.filter(p => p.stock > 0 && p.stock <= 5).length}</h2>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-[10px] font-black uppercase text-red-500 tracking-widest mb-1">Stok Habis</p>
            <h2 className="text-4xl font-black text-gray-900">{products.filter(p => p.stock <= 0).length}</h2>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Draft / Hidden</p>
            <h2 className="text-4xl font-black text-gray-900">{products.filter(p => p.status !== "Active").length}</h2>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mb-8">
          <input type="text" placeholder="Cari nama produk..." className="w-full md:w-1/3 p-4 rounded-2xl border-2 border-gray-100 outline-none focus:border-black transition-all shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        {/* GRID PRODUK */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <div key={p.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden relative group shadow-sm hover:shadow-xl transition-all duration-300">
              
              {/* Checkbox & Status Badge */}
              <input type="checkbox" className="absolute top-5 left-5 z-20 w-5 h-5 accent-black rounded-lg cursor-pointer" checked={selectedProductIds.includes(p.id)} onChange={(e) => {
                if (e.target.checked) setSelectedProductIds([...selectedProductIds, p.id]);
                else setSelectedProductIds(selectedProductIds.filter(id => id !== p.id));
              }} />
              <div className={`absolute top-5 right-5 z-20 px-3 py-1 rounded-full text-[9px] font-black tracking-tighter uppercase shadow-sm ${p.status === 'Active' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>{p.status}</div>
              
              {/* Thumbnail Image */}
              <div className="aspect-[4/5] bg-gray-50 overflow-hidden border-b relative">
                <img 
                  src={p.thumbnail ? `${STORAGE_URL}${p.thumbnail}` : FALLBACK_IMG} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  alt={p.name} 
                  onError={(e) => e.target.src = FALLBACK_IMG} 
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/80 to-transparent h-12"></div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-black text-gray-900 uppercase truncate text-sm tracking-tight mb-1">{p.name}</h3>
                
                {/* DESKRIPSI PRODUK DI CARD */}
                <p className="text-[11px] text-gray-500 line-clamp-2 mb-4 leading-relaxed min-h-[32px]">
                   {p.description || "Tidak ada deskripsi produk."}
                </p>

                <div className="flex justify-between items-end mb-5">
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Harga</p>
                    <p className="text-blue-600 font-black text-lg leading-none">Rp {Number(p.price).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Stok</p>
                    <p className={`font-black text-sm ${p.stock <= 5 ? 'text-red-500' : 'text-gray-900'}`}>{p.stock}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button onClick={() => handleEditClick(p)} className="flex-[2] bg-gray-900 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-colors shadow-md active:scale-95">Edit</button>
                  <button onClick={() => toggleStatus(p)} className="flex-1 bg-gray-100 py-3 rounded-xl font-black text-[10px] uppercase text-gray-600 hover:bg-gray-200 transition-colors active:scale-95">Status</button>
                  <button onClick={() => handleDeleteProduct(p.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-95">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL EDIT/BARU */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter text-gray-900">{isEdit ? "Update Produk" : "Produk Baru"}</h2>
            <form onSubmit={handleSaveProduct} className="space-y-5">
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Nama Produk</label>
                <input type="text" className="w-full border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-black transition-all font-bold" value={formData.name} placeholder="Contoh: Kanvas Lukis A4" onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Harga (Rp)</label>
                  <input type="number" className="w-full border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-black transition-all font-bold" value={formData.price} placeholder="0" onChange={(e) => setFormData({...formData, price: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Stok</label>
                  <input type="number" className="w-full border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-black transition-all font-bold" value={formData.stock} placeholder="0" onChange={(e) => setFormData({...formData, stock: e.target.value})} required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Deskripsi</label>
                <textarea className="w-full border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-black transition-all h-32 font-medium" value={formData.description} placeholder="Jelaskan detail produk kamu..." onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              
              {/* EXISTING IMAGES GALLERY */}
              {isEdit && existingImages.length > 0 && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Gambar Terunggah</label>
                  <div className="grid grid-cols-4 gap-3 bg-gray-50 p-4 rounded-3xl border border-dashed border-gray-200">
                    {existingImages.map((img) => (
                      <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-sm bg-white">
                        <img src={img.url} className="w-full h-full object-cover" alt="existing" onError={(e) => e.target.src=FALLBACK_IMG} />
                        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                           <span className="text-white text-[8px] font-bold">READY</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* NEW UPLOAD SECTION */}
              <div className="pt-4">
                <input type="file" multiple accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                <button type="button" onClick={() => fileInputRef.current.click()} className="w-full border-2 border-dashed border-gray-200 p-6 rounded-3xl font-black text-[10px] uppercase text-gray-400 hover:bg-gray-50 hover:text-black transition-all active:scale-95 tracking-widest">
                  + Tambah Foto Baru
                </button>
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-4 gap-3 mt-4">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-blue-100 shadow-sm animate-pulse">
                        <img src={url} className="w-full h-full object-cover" alt="preview" />
                        <button type="button" onClick={() => handleRemovePreview(index)} className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end items-center gap-6 pt-8">
                <button type="button" onClick={closeModal} className="font-black text-gray-400 text-[10px] uppercase tracking-widest hover:text-red-500 transition-colors">Batal</button>
                <button type="submit" disabled={loading} className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all active:scale-95 disabled:bg-gray-300">
                  {loading ? "Menyimpan..." : "Simpan Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
