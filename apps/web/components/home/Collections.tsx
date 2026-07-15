"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Collection {
  id: string;
  name: string;
  slug: string;
  heroImage: string | null;
}

export default function Collections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/collections`)
      .then((res) => res.json())
      .then((data) => {
        setCollections(Array.isArray(data) ? data : data.collections || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="bg-brand-black py-8 text-white text-center">Loading collections...</div>;
  }

  if (collections.length === 0) {
    return <div className="bg-brand-black py-8 text-white text-center">No collections found</div>;
  }

  return (
    <div className="bg-brand-black py-8">
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Collections</h2>
        <div className="flex gap-4 overflow-x-auto">
          {collections.map((col) => (
            <div
              key={col.id}
              className="min-w-[250px] rounded-lg overflow-hidden bg-cover bg-center relative"
              style={{
                backgroundImage: col.heroImage ? `url(${col.heroImage})` : undefined,
                backgroundColor: "#1a1a1a",
                height: "300px",
              }}
            >
              <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-4">
                <h3 className="text-white text-xl font-bold mb-2">{col.name}</h3>
                <Link
                  href={`/collection/${col.slug}`}
                  className="inline-block bg-electric-blue-accent hover:bg-deep-purple-accent text-white font-bold py-2 px-4 rounded-md w-fit"
                >
                  Explore
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
