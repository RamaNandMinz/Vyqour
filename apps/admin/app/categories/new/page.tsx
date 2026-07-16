import { useQuery, useClient } from 'next/headers';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function NewCategoryPage() {
  useClient();
  const router = useRouter();
  const { data, error } = useQuery(
    () =>
      fetch(process.env.NEXT_PUBLIC_API_URL + "/api/categories")
        .then((res) => res.json())
  );

  if (!data) return <div>Loading...</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const slug = e.target.slug.value;
    const type = e.target.type.value;

    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, slug, type }),
    });

    const data = await response.json();
    router.push("/categories");
  };

  return (
    <div>
      <h1>Create New Category</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input type="text" name="name" />
        </label>
        <label>
          Slug:
          <input type="text" name="slug" />
        </label>
        <label>
          Type:
          <input type="text" name="type" />
        </label>
        <button type="submit">Create Category</button>
      </form>
    </div>
  );
}