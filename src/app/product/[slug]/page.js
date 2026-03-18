'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchProductDetail } from '../../../services/api';

export default function ProductDetail() {
  const params = useParams();
  const slug = params.slug;

  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetchProductDetail(slug).then((data) => {
      setProduct(data);
    });
  }, [slug]);

  if (!product) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-10 grid grid-cols-2 gap-10">
      <img
        src={product.images && product.images.length > 0 ? product.images[0].url : '/no-image.png'}
        className="w-full rounded"
        alt={product.name}
      />

      <div>
        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
        <p className="text-green-600 text-2xl mb-4">Rp {product.price}</p>
        <p className="text-gray-600 mb-6">{product.description}</p>

        <button className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
