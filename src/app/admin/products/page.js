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

        // LOGIKA SAMBUNG LANGSUNG SESUAI DATABASE
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
      if (res.ok) {
        fetchProducts();
      }
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
          <button onClick={() => { closeModal(); setShowModal(true); }} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg">+ Produk Baru</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <p className="text-xs font-black uppercase text-gray-400">Total Produk</p>
            <h2 className="text-3xl font-black">{products.length}</h2>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <p className="text-xs font-black uppercase text-orange-400">Stok Menipis</p>
            <h2 className="text-3xl font-black">{products.filter(p => p.stock > 0 && p.stock <= 5).length}</h2>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <p className="text-xs font-black uppercase text-red-500">Stok Habis</p>
            <h2 className="text-3xl font-black">{products.filter(p => p.stock <= 0).length}</h2>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <p className="text-xs font-black uppercase text-gray-400">Draft / Hidden</p>
            <h2 className="text-3xl font-black">{products.filter(p => p.status !== "Active").length}</h2>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mb-6 flex gap-4">
          <input type="text" placeholder="Cari nama produk..." className="flex-1 p-3 rounded-xl border-2 outline-none focus:border-black" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        {/* GRID PRODUK */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden relative group shadow-sm hover:shadow-md transition-all">
              <input type="checkbox" className="absolute top-4 left-4 z-10 w-5 h-5 accent-black" checked={selectedProductIds.includes(p.id)} onChange={(e) => {
                if (e.target.checked) setSelectedProductIds([...selectedProductIds, p.id]);
                else setSelectedProductIds(selectedProductIds.filter(id => id !== p.id));
              }} />
              <div className={`absolute top-4 right-4 z-10 px-2 py-1 rounded text-[10px] font-bold uppercase ${p.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{p.status}</div>
              <div className="aspect-[4/3] bg-gray-100">
                <img src={p.thumbnail ? `${STORAGE_URL}${p.thumbnail}` : FALLBACK_IMG} className="w-full h-full object-cover" alt={p.name} onError={(e) => e.target.src = FALLBACK_IMG} />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-800 uppercase truncate text-sm">{p.name}</h3>
                <p className="text-blue-600 font-black text-lg mt-1">Rp {Number(p.price).toLocaleString('id-ID')}</p>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleEditClick(p)} className="flex-1 bg-gray-900 text-white py-2 rounded-lg font-bold text-xs">Edit</button>
                  <button onClick={() => toggleStatus(p)} className="flex-1 bg-gray-100 py-2 rounded-lg font-bold text-xs text-gray-600">Status</button>
                  <button onClick={() => handleDeleteProduct(p.id)} className="p-2 bg-red-50 text-red-600 rounded-lg">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-black mb-6 uppercase">{isEdit ? "Update Produk" : "Produk Baru"}</h2>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <input type="text" className="w-full border-2 p-3 rounded-xl outline-none" value={formData.name} placeholder="Nama Produk" onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" className="w-full border-2 p-3 rounded-xl outline-none" value={formData.price} placeholder="Harga" onChange={(e) => setFormData({...formData, price: e.target.value})} required />
                <input type="number" className="w-full border-2 p-3 rounded-xl outline-none" value={formData.stock} placeholder="Stok" onChange={(e) => setFormData({...formData, stock: e.target.value})} required />
              </div>
              <textarea className="w-full border-2 p-3 rounded-xl outline-none h-24" value={formData.description} placeholder="Deskripsi" onChange={(e) => setFormData({...formData, description: e.target.value})} />
              
              {isEdit && existingImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2 border-t pt-4">
                  {existingImages.map((img) => (
                    <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border">
                      <img src={img.url} className="w-full h-full object-cover" alt="existing" onError={(e) => e.target.src=FALLBACK_IMG} />
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4">
                <input type="file" multiple accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                <button type="button" onClick={() => fileInputRef.current.click()} className="w-full border-2 border-dashed p-4 rounded-xl font-bold text-xs text-gray-500 hover:bg-gray-50">+ TAMBAH FOTO</button>
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                      <img src={url} className="w-full h-full object-cover" alt="preview" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={closeModal} className="px-6 font-bold text-gray-400 text-xs">BATAL</button>
                <button type="submit" disabled={loading} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold text-xs">{loading ? "PROSES..." : "SIMPAN"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
