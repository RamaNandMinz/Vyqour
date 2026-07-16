import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';

const ProductPage = () => {
  const router = useRouter();
  const { slug } = useParams();
  const { data: session, status } = useSession();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(session?.id);

  useEffect(() => {
    if (!sessionId) {
      const newSessionId = crypto.randomUUID();
      localStorage.setItem('sessionId', newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          process.env.NEXT_PUBLIC_API_URL +
            '/api/products/' +
            slug
        );
        setProduct(response.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug, sessionId]);

  const handleAddToCart = async (event) => {
    event.preventDefault();
    const selectedVariant = product?.variants.find(
      (variant) => variant.size === event.target.value
    );
    if (selectedVariant) {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL +
          '/api/cart/add',
        {
          productVariantId: selectedVariant.id,
          quantity: 1,
          sessionId,
        }
      );
      console.log(response.data);
      router.push('/cart');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>Base Price: ₹{product.basePrice}</p>
      <div>
        {product.images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={product.name}
            style={{
              width: index === 0 ? '100%' : '50%',
              display: 'inline-block',
            }}
          />
        ))}
      </div>
      <div>
        {product.variants.map((variant) => (
          <button
            key={variant.id}
            value={variant.size}
            onClick={handleAddToCart}
            style={{
              margin: '5px',
              padding: '10px',
              border: 'none',
              borderRadius: '5px',
              backgroundColor: '#4CAF50',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            {variant.size} ({variant.stock} in stock)
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductPage;