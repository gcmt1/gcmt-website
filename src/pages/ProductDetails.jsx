import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Star, ShoppingCart, Heart, Share2,
  ArrowLeft, ArrowRight, Check, ChevronDown
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { X } from 'lucide-react';
import '../styles/ProductDetails.css';
import AddToCartButton from '../components/AddToCartButton';

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
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          setError('Unable to load product information.');
          return;
        }

        // Process the data
        const variants = data.size
          ? data.size.split(',').map(v => v.trim())
          : [];

        // ─── KEY BENEFITS ───────────────────────────────────────────────────────────
        // Supabase/Postgres often returns an array‐literal like {"Benefit A","Benefit B",…}
        // so we strip off { } and " first, then split on commas.
        const rawBenefits = data.key_benefits || '';
        const cleanedBenefits = rawBenefits.replace(/[\{\}"]/g, ''); 
        const benefits = cleanedBenefits
          ? cleanedBenefits.split(',').map(b => b.trim())
          : [];
          
        // ─── INGREDIENTS ────────────────────────────────────────────────────────────
        const ingredients = data.ingredients_name
          ? data.ingredients_name.split(',').map((name, i) => ({
              name: name.trim(),
              percentage: data.percentage?.split(',')[i]?.trim() || ''
            }))
          : [];

        setProduct({
          id: data.id,
          name: data.product_name,
          shortDescription: data.product_sub_description,
          price: data.product_price,
          discountPrice: +(data.product_price * (1 - (data.product_discount || 0) / 100)).toFixed(2),
          discount: data.product_discount ? `${data.product_discount}%` : null,
          rating: 4.5, // Example static value
          reviews: 123, // Example static value
          stock: 50,    // Example static value
          sku: id,
          images: data.product_image ? [data.product_image] : ['/api/placeholder/500/500'],
          variants,
          benefits,
          descriptionContent: data.product_description,
          whyChoose: data.why_choose_product,
          ingredientsHeading: data.ingredients_heading,
          ingredientsDescription: data.ingredients_description,
          ingredientsSubheading: data.ingredients_subheading,
          ingredients,
          howToUseHeading: data.how_to_use_heading,
          howToUseDescription: data.how_to_use_description,
          proTips: data.pro_tips,
          certifications: [],
        });
        
        setSelectedVariant(variants[0] || '');
      } catch (err) {
        setError('An unexpected error occurred.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProduct();
  }, [id]);

  if (loading) return (
    <div className="product-container">
      <div className="loading-spinner">Loading product information...</div>
    </div>
  );
  
  if (error) return (
    <div className="product-container">
      <div className="error-message">{error}</div>
      <button className="btn-primary" onClick={() => window.history.back()}>
        Go Back
      </button>
    </div>
  );

  const decreaseQuantity = () => quantity > 1 && setQuantity(q => q - 1);
  const increaseQuantity = () => quantity < product.stock && setQuantity(q => q + 1);
  
  const addToWishlist = () => setWishlistAdded(w => !w);

  const renderStars = (rating) =>
    Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        size={16}
        className={`star ${i < Math.floor(rating) ? 'filled' : ''}`}
        fill={i < rating ? "#FFB800" : "none"}
        stroke={i < rating ? "#FFB800" : "#8B8B8B"}
      />
    ));

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
                onClick={() => setActiveImage(i => (i - 1 + product.images.length) % product.images.length)}
                aria-label="Previous image"
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
                onClick={() => setActiveImage(i => (i + 1) % product.images.length)}
                aria-label="Next image"
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

        {/* Related Products */}
        <section className="related-products">
          <h2 className="section-title">You May Also Like</h2>
          <div className="products-grid">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="product-card">
                <div className="product-card-image">
                  <img src="/api/placeholder/250/250" alt={`Related Product ${item}`} />
                </div>
                <div className="product-card-content">
                  <h3 className="product-card-title">Ayurvedic Product {item}</h3>
                  <div className="product-card-rating">
                    {renderStars(4.5)}
                    <span>(98)</span>
                  </div>
                  <div className="product-card-price">
                    <span className="current-price">₹799</span>
                    <span className="original-price">₹999</span>
                  </div>
                  <button className="product-card-btn">Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Certifications Modal */}
      {showCertModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Product Certifications</h3>
              <button 
                className="modal-close" 
                onClick={() => setShowCertModal(false)}
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-content">
              {product.certifications.length > 0 ? (
                <div className="certifications-grid">
                  {product.certifications.map((cert, index) => (
                    <div key={index} className="certification-item">
                      <img src={cert.image} alt={cert.name} />
                      <h4>{cert.name}</h4>
                      <p>{cert.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>This product does not have any certifications yet.</p>
              )}
              
              <div className="certification-info">
                <h4>Our Commitment to Quality</h4>
                <p>
                  We believe in transparency and quality at every step of our production process. 
                  Our certifications reflect our dedication to providing you with products that 
                  meet the highest standards of purity, potency, and sustainability.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;