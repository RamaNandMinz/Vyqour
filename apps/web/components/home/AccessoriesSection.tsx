"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  images: string[];
}

export default function AccessoriesSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?category=accessories`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="bg-brand-black py-8">
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Accessories</h2>
          <Link
            href="/accessories"
            className="bg-electric-blue-accent hover:bg-deep-purple-accent text-white font-bold py-2 px-4 rounded-md"
          >
            Explore
          </Link>
        </div>
        {loading && <p className="text-white">Loading accessories...</p>}
        {!loading && products.length === 0 && (
          <p className="text-white">No accessories found</p>
        )}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((p) => (
              <Link key={p.id} href={`/product/${p.slug}`} className="block">
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  {p.images?.[0] && (
                    <img src={p.images[0]} alt={p.name} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-3">
                    <h3 className="text-white text-sm font-semibold">{p.name}</h3>
                    <p className="text-electric-blue-accent font-bold">₹{p.basePrice}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
