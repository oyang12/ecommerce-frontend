'use client'; // penting kalau pakai useState / client-side interactivity

import Image from 'next/image';

export default function ProductCard({ product }) {
  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-lg transition">
      {product.images && product.images.length > 0 ? (
        <Image
          src={product.images[0].url}
          alt={product.name}
          width={300}
          height={300}
          className="object-cover rounded"
        />
      ) : (
        <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
          No Image
        </div>
      )}
      <h2 className="mt-2 font-semibold text-lg">{product.name}</h2>
      <p className="mt-1 text-gray-600">${product.price}</p>
    </div>
  );
}
