import React from 'react';
import { useCart } from '../hooks/useCart';
import "../styles/Cart.css";


export default function AddToCartButton({ productId, quantity = 1 }) {
  const { addToCart, loading } = useCart();

  const handleClick = async () => {
    await addToCart(productId, quantity);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="add-to-cart-btn"
    >
      {loading ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}
