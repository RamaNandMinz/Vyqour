import Link from "next/link";

const categories = [
  { name: "T-shirts", slug: "t-shirts" },
  { name: "Hoodies", slug: "hoodies" },
  { name: "Jackets", slug: "jackets" },
  { name: "Bottomwear", slug: "bottomwear" },
  { name: "Tops", slug: "tops" },
  { name: "Dresses", slug: "dresses" },
];

const CategoryNav = () => {
  return (
    <div className="bg-brand-black py-4">
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="block bg-brand-black text-white hover:bg-electric-blue-accent hover:border-electric-blue-accent border border-electric-blue-accent transition duration-300 ease-in-out p-4 rounded-lg"
            >
              <h2 className="text-lg font-bold">{cat.name}</h2>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;
