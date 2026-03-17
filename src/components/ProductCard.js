import Link from "next/link";

export default function ProductCard({ product }) {
  return (

    <Link href={`/product/${product.slug}`}>

      <div className="border rounded-lg p-4 hover:shadow-lg transition cursor-pointer">

        <img
          src={`http://127.0.0.1:8000/storage/products/${product.thumbnail}`}
          alt={product.name}
          className="w-full h-40 object-cover mb-3 rounded"
        />

        <h2 className="font-semibold text-lg mb-1">
          {product.name}
        </h2>

        <p className="text-green-600 font-bold mb-3">
          Rp {product.price}
        </p>

      </div>

    </Link>

  );
}