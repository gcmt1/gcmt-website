import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import AddToCartButton from './AddToCartButton';
import { Star, ShoppingCart, Eye, Heart } from 'lucide-react';
import '../styles/ProductCard.css';
import DefaultProductImage from '../assets/product.jpg';

export default function ProductCard({ productId }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) {
        console.error('Error fetching product:', error.message);
        setError('Could not load product.');
      } else {
        // Safely get the public URL or fallback
        let imageUrl = DefaultProductImage;
        if (data.product_image) {
          const { data: imageData, error: imageError } = supabase
            .storage
            .from('product-image')
            .getPublicUrl(data.product_image);
          if (!imageError && imageData && imageData.publicUrl) {
            imageUrl = imageData.publicUrl;
          }
        }

        const productData = {
          id: data.id,
          name: data.product_name,
          shortDescription: data.product_sub_description,
          price: Number(data.product_price).toFixed(2),
          discount: data.product_discount ? `${data.product_discount}%` : null,
          discountPrice: data.product_discount
            ? (data.product_price * (1 - data.product_discount / 100)).toFixed(2)
            : null,
          image: imageUrl,
          category: data.category,
          rating: data.rating || 4.5,
          inStock: data.in_stock !== false, // Default to true if not specified
        };
        setProduct(productData);
      }
      setLoading(false);
    }

    fetchProduct();
  }, [productId]);

  const handleCardClick = () => {
    navigate(`/product/${productId}`);
  };

  const toggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // Here you would typically call an API to save this preference
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    // Could open a modal with product details
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="product-card product-card-skeleton">
        <div className="skeleton-image"></div>
        <div className="skeleton-content">
          <div className="skeleton-title"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-price"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="product-card product-card-error">{error}</div>;
  }

  return (
    <div 
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="product-card-inner"
        onClick={handleCardClick}
      >
        <div className="product-image-container">
          <img
            src={product.image}
            alt={product.name}
            className="product-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = DefaultProductImage;
            }}
          />
          
          {product.discount && (
            <div className="discount-badge">-{product.discount} OFF</div>
          )}
          
          {!product.inStock && (
            <div className="out-of-stock-overlay">
              <span>Out of Stock</span>
            </div>
          )}
          
          <div className={`product-actions ${isHovered ? 'show' : ''}`}>
            <button 
              className="action-button quick-view-button" 
              onClick={handleQuickView}
              aria-label="Quick view"
            >
              <Eye size={18} />
            </button>
            <button 
              className={`action-button favorite-button ${isFavorite ? 'is-favorite' : ''}`} 
              onClick={toggleFavorite}
              aria-label="Add to favorites"
            >
              <Heart size={18} />
            </button>
          </div>
        </div>

        <div className="product-info">
          {product.category && (
            <div className="product-category">{product.category}</div>
          )}
          
          <h3 className="product-name">{product.name}</h3>
          
          <div className="product-rating">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  className={i < Math.floor(product.rating) ? 'filled' : 'empty'} 
                  fill={i < Math.floor(product.rating) ? "#FFB800" : "none"}
                  stroke={i < Math.floor(product.rating) ? "#FFB800" : "#CBD5E0"}
                />
              ))}
            </div>
            <span className="rating-value">{product.rating}</span>
          </div>
          
          {product.shortDescription && (
            <p className="product-description">{product.shortDescription}</p>
          )}
          
          <div className="product-price-container">
            {product.discountPrice ? (
              <>
                <span className="current-price">₹{product.discountPrice}</span>
                <span className="original-price">₹{product.price}</span>
              </>
            ) : (
              <span className="current-price">₹{product.price}</span>
            )}
          </div>
        </div>
      </div>

      <div className="product-card-footer" onClick={(e) => e.stopPropagation()}>
        <AddToCartButton 
          productId={product.id} 
          quantity={1} 
          disabled={!product.inStock}
          className="add-to-cart-button"
        >
          <ShoppingCart size={16} />
          <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
        </AddToCartButton>
      </div>
    </div>
  );
}