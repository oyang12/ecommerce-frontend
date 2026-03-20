'use client';



import { useEffect, useState } from 'react';

import { useParams } from 'next/navigation';



export default function ProductDetailPage() {

  const params = useParams();

  const slug = params?.slug; 

  

  const [product, setProduct] = useState(null);

  const [loading, setLoading] = useState(true);

  const [activeImage, setActiveImage] = useState(null);



  const STORAGE_URL = "https://ecommerce-backend-production-aa2e.up.railway.app/storage/products/";

  const FALLBACK_IMG = "https://via.placeholder.com/600x600?text=No+Image";



  useEffect(() => {

    if (!slug) return;



    const fetchDetail = async () => {

      const API_URL = `https://ecommerce-backend-production-aa2e.up.railway.app/api/products/${slug}`;

      try {

        const res = await fetch(API_URL, { cache: 'no-store' });

        const result = await res.json();

        if (result.data) {

          setProduct(result.data);

          setActiveImage(result.data.thumbnail || (result.data.images?.[0]?.image));

        }

      } catch (err) {

        console.error("Gagal memuat detail produk:", err);

      } finally {

        setLoading(false);

      }

    };



    fetchDetail();

  }, [slug]);



  if (loading) return (

    <div className="min-h-screen flex items-center justify-center bg-gray-50">

      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-gray-900 border-opacity-50"></div>

    </div>

  );



  if (!product) return (

    <div className="min-h-screen flex items-center justify-center bg-gray-50">

      <div className="text-center">

        <p className="font-black uppercase tracking-widest text-gray-400">Produk tidak ditemukan</p>

        <button onClick={() => window.history.back()} className="mt-4 text-xs font-bold text-blue-600 uppercase underline">Kembali ke Katalog</button>

      </div>

    </div>

  );



  // --- LOGIKA HARGA & DISKON ---

  const price = Number(product.price) || 0;

  const discountPercent = Number(product.disc) || 0; // Mengambil 'disc' dari database

  const hasDiscount = discountPercent > 0;

  const finalPrice = hasDiscount ? price - (price * discountPercent / 100) : price;



  const handleOrder = () => {

    const message = `Halo Admin, saya tertarik dengan produk *${product.name}* (Harga: Rp ${Math.floor(finalPrice).toLocaleString('id-ID')}). Apakah stok masih tersedia?`;

    window.open(`https://wa.me/628123456789?text=${encodeURIComponent(message)}`, '_blank');

  };



  return (

    <div className="min-h-screen bg-gray-50 p-6 font-sans text-black">

      <div className="max-w-6xl mx-auto">

        

        <button 

          onClick={() => window.history.back()}

          className="mb-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition-all"

        >

          ← Kembali ke Katalog

        </button>



        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          

          {/* GALLERY SECTION */}

          <div className="relative space-y-4">

            {/* 1. TEMPAT DISKON DI ATAS GAMBAR */}

            {hasDiscount && (

              <div className="absolute top-4 left-4 z-10 bg-red-6
