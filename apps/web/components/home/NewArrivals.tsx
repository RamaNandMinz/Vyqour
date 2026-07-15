"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Product } from '../types/Product';

const NewArrivals = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/products?isNewArrival=true");
        const data = await response.json();
        setProducts(data.slice(0, 8));
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="text-center text-white mt-10">
        No new arrivals found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4">
      {products.map((product) => (
        <Link key={product.id} href={`/product/${product.slug}`}>
          <div className="bg-brand-black rounded-md shadow-md p-4 hover:shadow-lg transition duration-300 ease-in-out">
            <img src={product.images[0].url} alt={product.name} className="w-full h-40 object-cover" />
            <h2 className="text-white font-bold text-lg mt-4">{product.name}</h2>
            <p className="text-white text-lg font-bold mt-2">₹{product.basePrice}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default NewArrivals;