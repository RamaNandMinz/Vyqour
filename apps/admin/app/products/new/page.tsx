"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [qikinkSku, setQikinkSku] = useState("");
  const [images, setImages] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description,
          categoryId,
          basePrice: parseFloat(basePrice),
          qikinkSku,
          images: images.split(",").map((s) => s.trim()).filter(Boolean),
          isActive,
          isBestSeller,
          isNewArrival,
        }),
      });
      router.push("/products");
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Add Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Name</label>
          <input className="border p-2 w-full" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1">Slug</label>
          <input className="border p-2 w-full" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1">Description</label>
          <textarea className="border p-2 w-full" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label className="block mb-1">Category ID</label>
          <input className="border p-2 w-full" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1">Base Price</label>
          <input type="number" className="border p-2 w-full" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1">Qikink SKU</label>
          <input className="border p-2 w-full" value={qikinkSku} onChange={(e) => setQikinkSku(e.target.value)} />
        </div>
        <div>
          <label className="block mb-1">Images (comma-separated URLs)</label>
          <input className="border p-2 w-full" value={images} onChange={(e) => setImages(e.target.value)} />
        </div>
        <div className="flex gap-4">
          <label><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> Active</label>
          <label><input type="checkbox" checked={isBestSeller} onChange={(e) => setIsBestSeller(e.target.checked)} /> Best Seller</label>
          <label><input type="checkbox" checked={isNewArrival} onChange={(e) => setIsNewArrival(e.target.checked)} /> New Arrival</label>
        </div>
        <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-4 py-2 rounded">
          {submitting ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
