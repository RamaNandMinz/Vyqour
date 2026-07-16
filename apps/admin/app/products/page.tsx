import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';

function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_API_URL + "/api/products")
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      <h1>Products</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Base Price</th>
            <th>Is Active</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.basePrice}</td>
              <td>{product.isActive ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link href="/products/new">
        <a>Add Product</a>
      </Link>
    </div>
  );
}

export default Products;