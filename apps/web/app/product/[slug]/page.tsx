"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface Variant {
  id: string;
  size: string;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  images: string[];
  variants: Variant[];
}

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("sessionId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("sessionId", id);
  }
  return id;
}

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => {
        setProduct(null);
        setLoading(false);
      });
  }, [slug]);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    setAdding(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productVariantId: selectedVariant,
          quantity: 1,
          sessionId: getSessionId(),
        }),
      });
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-white bg-brand-black">Loading...</div>;
  }

  if (!product) {
    return <div className="p-8 text-white bg-brand-black">Product not found</div>;
  }

  return (
    <div className="p-8 bg-brand-black text-white min-h-screen">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          {product.images?.[0] && (
            <img src={product.images[0]} alt={product.name} className="w-full rounded-lg" />
          )}
          <div className="flex gap-2 mt-2">
            {product.images?.slice(1).map((img, i) => (
              <img key={i} src={img} alt="" className="w-20 h-20 object-cover rounded" />
            ))}
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="mt-2 text-gray-300">{product.description}</p>
          <p className="mt-4 text-2xl text-electric-blue-accent font-bold">
            ₹{product.basePrice}
          </p>

          <div className="mt-6">
            <p className="mb-2 font-semibold">Size</p>
            <div className="flex gap-2">
              {product.variants?.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v.id)}
                  disabled={v.stock === 0}
                  className={`border px-4 py-2 rounded ${
                    selectedVariant === v.id
                      ? "bg-electric-blue-accent border-electric-blue-accent"
                      : "border-white"
                  } ${v.stock === 0 ? "opacity-40" : ""}`}
                >
                  {v.size}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant || adding}
            className="mt-6 bg-electric-blue-accent hover:bg-deep-purple-accent text-white font-bold py-3 px-6 rounded-md disabled:opacity-50"
          >
            {adding ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
