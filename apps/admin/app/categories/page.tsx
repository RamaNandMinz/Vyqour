import { useQuery, useClient } from 'next/headers';
import Link from 'next/link';

export default function CategoriesPage() {
  useClient();
  const { data, error } = useQuery(
    () =>
      fetch(process.env.NEXT_PUBLIC_API_URL + "/api/categories")
        .then((res) => res.json())
  );

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h1>Categories</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Slug</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {data.map((category) => (
            <tr key={category.id}>
              <td>{category.name}</td>
              <td>{category.slug}</td>
              <td>{category.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link href="/categories/new" passHref>
        <a>Add Category</a>
      </Link>
    </div>
  );
}