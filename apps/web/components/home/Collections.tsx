import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/collections");
        const data = await response.json();
        setCollections(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="text-center text-white mt-20">
        <p>No collections found.</p>
      </div>
    );
  }

  return (
    <div className="bg-brand-black text-white p-4">
      <div className="flex overflow-x-scroll overflow-x-auto">
        {collections.map((collection) => (
          <div key={collection.slug} className="m-2 w-1/3 md:w-1/4 lg:w-1/6 xl:w-1/6">
            <Link href={`/collection/${collection.slug}`}>
              <div className="bg-cover bg-center h-48 rounded-md">
                <img src={collection.heroImage} alt={collection.name} />
              </div>
            </Link>
            <h2 className="text-lg font-bold">{collection.name}</h2>
            <Link href={`/collection/${collection.slug}`}>
              <button className="bg-brand-orange text-white px-4 py-2 rounded-md hover:bg-brand-orange-dark">
                Explore
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}