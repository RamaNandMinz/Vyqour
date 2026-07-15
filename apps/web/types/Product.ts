/**
 * Product type definition
 */
export interface Product {
  id: number;
  name: string;
  slug: string;
  basePrice: number;
  images: {
    url: string;
  }[];
}