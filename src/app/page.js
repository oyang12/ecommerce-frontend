"use client";

import { useEffect, useState } from "react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";

export default function Home() {

  const [products, setProducts] = useState([]);

  useEffect(() => {

    api.get("/products")
      .then((res) => {
        setProducts(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });

  }, []);

  return (
    <div className="grid grid-cols-4 gap-6">

      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}

    </div>
  );
}