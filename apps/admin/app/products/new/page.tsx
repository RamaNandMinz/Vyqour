import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import NewProduct from './page';

function NewProductList() {
  return (
    <div>
      <h1>Create New Product</h1>
      <NewProduct />
    </div>
  );
}

export default NewProductList;