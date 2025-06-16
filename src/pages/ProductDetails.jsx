import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Star, ShoppingCart, Heart, Share2,
  ArrowLeft, ArrowRight, Check, ChevronDown
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import '../styles/ProductDetails.css';
import AddToCartButton from '../components/AddToCartButton';
import ReviewSystem from '../components/ReviewSystem';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [wishlistAdded, setWishlistAdded] = useState(false);
  const [selectedTab, setSelectedTab] = useState('description');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [showCertModal, setShowCertModal] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError(null);

        // Fetch product
        const { data: prodData, error: prodErr } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (prodErr) throw prodErr;

        // Process the data
        const variants = prodData.size 
          ? prodData.size.split(',').map(v => v.trim()) 
          : [];

        // Process key benefits - handle Postgres array format
        const rawBenefits = prodData.key_benefits || '';
        const cleanedBenefits = rawBenefits.replace(/[\{\}"]/g, '');
        const benefits = cleanedBenefits 
          ? cleanedBenefits.split(',').map(b => b.trim()) 
          : [];

        // Process ingredients
        const ingredients = prodData.ingredients_name
          ? prodData.ingredients_name.split(',').map((name, i) => ({
              name: name.trim(),
              percentage: prodData.percentage?.split(',')[i]?.trim() || ''
            }))
          : [];

        // Calculate discount price
        const discountPrice = prodData.product_discount 
          ? +(prodData.product_price * (1 - prodData.product_discount / 100)).toFixed(2)
          : prodData.product_price;

        const productData = {
          id: prodData.id,
          name: prodData.product_name,
          shortDescription: prodData.product_sub_description,
          price: prodData.product_price,
          discountPrice,
          discount: prodData.product_discount ? `${prodData.product_discount}%` : null,
          rating: 4.5, // Default value
          reviews: 0, // Will be updated by ReviewSystem component
          stock: prodData.stock || 50, // Default stock if not provided
          sku: id,
          images: prodData.product_image ? [prodData.product_image] : ['/api/placeholder/500/500'],
          variants,
          benefits,
          descriptionContent: prodData.product_description,
          whyChoose: prodData.why_choose_product,
          ingredientsHeading: prodData.ingredients_heading,
          ingredientsDescription: prodData.ingredients_description,
          ingredientsSubheading: prodData.ingredients_subheading,
          ingredients,
          howToUseHeading: prodData.how_to_use_heading,
          howToUseDescription: prodData.how_to_use_description,
          proTips: prodData.pro_tips,
          certifications: [], // Empty array as default
        };

        setProduct(productData);
        setSelectedVariant(variants[0] || '');

      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Unable to load product information.');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const renderStars = (rating) =>
    Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          size={20}
          fill={i < rating ? '#FFB800' : 'none'}
          stroke={i < rating ? '#FFB800' : '#8B8B8B'}
        />
      ));

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  const increaseQuantity = () => {
    if (quantity < product?.stock) {
      setQuantity(q => q + 1);
    }
  };
  
  const addToWishlist = () => {
    setWishlistAdded(w => !w);
  };

  const handleImageNavigation = (direction) => {
    if (!product?.images?.length) return;
    
    if (direction === 'prev') {
      setActiveImage(i => (i - 1 + product.images.length) % product.images.length);
    } else {
      setActiveImage(i => (i + 1) % product.images.length);
    }
  };

  if (loading) {
    return (
      <div className="product-container">
        <div className="loading-spinner">Loading product information...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="product-container">
        <div className="error-message">{error}</div>
        <button className="btn-primary" onClick={() => window.history.back()}>
          Go Back
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-container">
        <div className="error-message">Product not found.</div>
        <button className="btn-primary" onClick={() => window.history.back()}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="product-page">
      <div className="container">
        <div className="breadcrumb">
          <span>Home</span> &gt; <span>Products</span> &gt; <span className="current">{product.name}</span>
        </div>

        <div className="product-main">
          {/* Product Gallery */}
          <section className="product-gallery">
            <div className="gallery-main">
              <button 
                className="gallery-nav prev"
                onClick={() => handleImageNavigation('prev')}
                aria-label="Previous image"
                disabled={product.images.length <= 1}
              >
                <ArrowLeft size={20} />
              </button>
              
              <div className="main-image-container">
                <img 
                  src={product.images[activeImage]} 
                  alt={product.name} 
                  className="main-image" 
                />
                {product.discount && (
                  <span className="discount-badge">{product.discount}</span>
                )}
              </div>
              
              <button 
                className="gallery-nav next"
                onClick={() => handleImageNavigation('next')}
                aria-label="Next image"
                disabled={product.images.length <= 1}
              >
                <ArrowRight size={20} />
              </button>
            </div>
            
            {product.images.length > 1 && (
              <div className="image-thumbnails">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${activeImage === index ? 'active' : ''}`}
                    onClick={() => setActiveImage(index)}
                  >
                    <img src={img} alt={`${product.name} thumbnail ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Product Information */}
          <section className="product-info">
            <h1 className="product-title">{product.name}</h1>
            
            <div className="product-meta">
              <div className="product-rating">
                {renderStars(product.rating)}
                <span className="rating-count">({product.reviews} reviews)</span>
              </div>
            </div>
            
            <p className="product-short-desc">{product.shortDescription}</p>

            <div className="product-pricing">
              {product.discount ? (
                <>
                  <span className="price-current">₹{product.discountPrice}</span>
                  <span className="price-original">₹{product.price}</span>
                  <span className="price-save">Save {product.discount}</span>
                </>
              ) : (
                <span className="price-current">₹{product.price}</span>
              )}
            </div>

            {product.variants.length > 0 && (
              <div className="product-variants">
                <h3>Size</h3>
                <div className="variant-options">
                  {product.variants.map(v => (
                    <button 
                      key={v} 
                      className={`variant-btn ${selectedVariant === v ? 'selected' : ''}`} 
                      onClick={() => setSelectedVariant(v)}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="product-purchase">
              <div className="quantity-selector">
                <button 
                  className="quantity-btn" 
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input 
                  type="number" 
                  value={quantity} 
                  readOnly 
                  aria-label="Product quantity"
                />
                <button 
                  className="quantity-btn" 
                  onClick={increaseQuantity}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
              
              <div className="purchase-actions">
                <AddToCartButton 
                  productId={product.id} 
                  quantity={quantity} 
                  className="btn-primary" 
                />
                
                <button 
                  className={`btn-icon ${wishlistAdded ? 'active' : ''}`}
                  onClick={addToWishlist}
                  aria-label="Add to wishlist"
                >
                  <Heart size={20} fill={wishlistAdded ? "#e74c3c" : "none"} />
                </button>
                
                <button 
                  className="btn-icon"
                  aria-label="Share product"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {product.benefits.length > 0 && (
              <div className="product-benefits">
                <h3>Key Benefits</h3>
                <ul>
                  {product.benefits.map((benefit, i) => (
                    <li key={i}>
                      <Check size={16} className="benefit-icon" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        {/* Product Details Tabs */}
        <section className="product-details-tabs">
          <div className="tabs-header">
            <button 
              className={`tab-btn ${selectedTab === 'description' ? 'active' : ''}`}
              onClick={() => setSelectedTab('description')}
            >
              Description
            </button>
            <button 
              className={`tab-btn ${selectedTab === 'ingredients' ? 'active' : ''}`}
              onClick={() => setSelectedTab('ingredients')}
            >
              Ingredients
            </button>
            <button 
              className={`tab-btn ${selectedTab === 'how-to-use' ? 'active' : ''}`}
              onClick={() => setSelectedTab('how-to-use')}
            >
              How to Use
            </button>
          </div>
          
          <div className="tab-content">
            {selectedTab === 'description' && (
              <div className="tab-panel">
                <h3>Product Description</h3>
                <p>{product.descriptionContent}</p>
                
                {product.whyChoose && (
                  <>
                    <h3>Why Choose Our Product?</h3>
                    <p>{product.whyChoose}</p>
                  </>
                )}
              </div>
            )}

            {selectedTab === 'ingredients' && (
              <div className="tab-panel">
                {product.ingredientsHeading && <h3>{product.ingredientsHeading}</h3>}
                {product.ingredientsDescription && <p>{product.ingredientsDescription}</p>}
                
                {product.ingredientsSubheading && <h4>{product.ingredientsSubheading}</h4>}
                
                {product.ingredients.length > 0 && (
                  <table className="ingredients-table">
                    <thead>
                      <tr>
                        <th>Ingredient</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.ingredients.map((ing, i) => (
                        <tr key={i}>
                          <td>{ing.name}</td>
                          <td>{ing.percentage}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {selectedTab === 'how-to-use' && (
              <div className="tab-panel">
                {product.howToUseHeading && <h3>{product.howToUseHeading}</h3>}
                {product.howToUseDescription && <p>{product.howToUseDescription}</p>}
                
                {product.proTips && (
                  <>
                    <h4>Pro Tips</h4>
                    <p>{product.proTips}</p>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Reviews Section - Now using ReviewSystem component */}
        <section className="product-reviews">
          <ReviewSystem productId={product.id} />
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;