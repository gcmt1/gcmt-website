import React, { useState } from 'react';
import { Star, ShoppingCart, Heart, Share2, Award, ArrowLeft, ArrowRight, X, Check, Info } from 'lucide-react';
import '../styles/ProductPage.css';
import ProductImage from '../assets/product.jpg'; // Placeholder for product image


const ProductPage = () => {
  // State management
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [wishlistAdded, setWishlistAdded] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('description');
  const [selectedVariant, setSelectedVariant] = useState('100g');

  // Product details
  const product = {
    name: "Premium Ayurvedic Immunity Blend",
    shortDescription: "Organic herbal supplement to boost immunity and enhance vitality",
    price: 999,
    discountPrice: 799,
    discount: "20%",
    rating: 4.8,
    reviews: 128,
    stock: 24,
    sku: "AYU-IMM-100",
    images: [
      ProductImage, 
      ProductImage, 
      ProductImage, 
      ProductImage
    ],
    variants: ["100g", "250g", "500g"],
    benefits: [
      "Strengthens natural immunity",
      "Improves energy and vitality",
      "100% organic ingredients",
      "No artificial additives"
    ],
    ingredients: [
      { name: "Organic Turmeric", percentage: "30%" },
      { name: "Wild Ginger Extract", percentage: "25%" },
      { name: "Neem Leaf Powder", percentage: "20%" },
      { name: "Ashwagandha", percentage: "15%" },
      { name: "Moringa Leaf", percentage: "10%" }
    ],
    certifications: [
      { name: "USDA Organic", image: "/api/placeholder/100/100" },
      { name: "GMP Certified", image: "/api/placeholder/100/100" },
      { name: "ISO 22000", image: "/api/placeholder/100/100" },
      { name: "Non-GMO Project Verified", image: "/api/placeholder/100/100" }
    ],
    customerReviews: [
      {
        name: "Priya Sharma",
        rating: 5,
        date: "March 15, 2025",
        comment: "This supplement has transformed my health routine! I've been using it for 3 months and noticed a significant improvement in my energy levels and fewer seasonal illnesses.",
        verified: true
      },
      {
        name: "Rajesh Kumar",
        rating: 4,
        date: "April 2, 2025",
        comment: "Great product with excellent quality ingredients. The taste is quite strong but bearable given the benefits. Would recommend starting with a smaller dose.",
        verified: true
      },
      {
        name: "Ananya Patel",
        rating: 5,
        date: "April 10, 2025",
        comment: "Perfect addition to my morning routine. The powder mixes well and I've noticed a boost in my immunity since I started taking it regularly.",
        verified: true
      }
    ]
  };

  // Handle quantity changes
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) setQuantity(quantity + 1);
  };

  // Handle image gallery navigation
  const nextImage = () => {
    setActiveImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setActiveImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  // Render rating stars
  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        size={16} 
        className={`star ${i < Math.floor(rating) ? 'filled' : i < rating ? 'half-filled' : ''}`} 
        fill={i < rating ? "#FFB800" : "none"} 
        stroke={i < rating ? "#FFB800" : "#8B8B8B"} 
      />
    ));
  };

  return (
    <div className="product-page">
      <div className="product-container">
        {/* Breadcrumb Navigation */}
        <div className="breadcrumb">
          <span>Home</span> &gt; <span>Supplements</span> &gt; <span>Immunity</span> &gt; <span className="current">{product.name}</span>
        </div>

        <div className="product-main">
          {/* Product Gallery Section */}
          <section className="product-gallery">
            <div className="gallery-main">
              <button className="gallery-nav prev" onClick={prevImage} aria-label="Previous image">
                <ArrowLeft size={20} />
              </button>
              <div className="main-image-container">
                <img 
                  src={product.images[activeImage]} 
                  alt={`${product.name} - View ${activeImage + 1}`} 
                  className="main-image"
                />
                <span className="discount-badge">-{product.discount}</span>
              </div>
              <button className="gallery-nav next" onClick={nextImage} aria-label="Next image">
                <ArrowRight size={20} />
              </button>
            </div>
            <div className="gallery-thumbnails">
              {product.images.map((image, index) => (
                <div 
                  key={index} 
                  className={`thumbnail ${activeImage === index ? 'active' : ''}`}
                  onClick={() => setActiveImage(index)}
                >
                  <img src={image} alt={`Thumbnail ${index + 1}`} />
                </div>
              ))}
            </div>
          </section>

          {/* Product Details Section */}
          <section className="product-details">
            <div className="product-meta">
              <span className="product-sku">SKU: {product.sku}</span>
              <div className="product-rating">
                <div className="stars">
                  {renderStars(product.rating)}
                </div>
                <span className="rating-value">{product.rating}</span>
                <span className="review-count">({product.reviews} reviews)</span>
              </div>
            </div>

            <h1 className="product-title">{product.name}</h1>
            <p className="product-description">{product.shortDescription}</p>

            <div className="product-pricing">
              <div className="price-container">
                <span className="price-original">₹{product.price}</span>
                <span className="price-current">₹{product.discountPrice}</span>
                <span className="price-save">Save {product.discount}</span>
              </div>
              <span className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                <Check size={16} /> {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            <div className="product-variants">
              <span className="variant-label">Size:</span>
              <div className="variant-options">
                {product.variants.map((variant) => (
                  <button
                    key={variant}
                    className={`variant-btn ${selectedVariant === variant ? 'selected' : ''}`}
                    onClick={() => setSelectedVariant(variant)}
                  >
                    {variant}
                  </button>
                ))}
              </div>
            </div>

            <div className="product-benefits">
              <h3>Key Benefits</h3>
              <ul className="benefits-list">
                {product.benefits.map((benefit, index) => (
                  <li key={index}><Check size={16} className="benefit-icon" /> {benefit}</li>
                ))}
              </ul>
            </div>

            <div className="product-actions">
              <div className="quantity-selector">
                <button className="quantity-btn" onClick={decreaseQuantity} disabled={quantity <= 1}>
                  -
                </button>
                <input 
                  type="number" 
                  value={quantity} 
                  min="1" 
                  max={product.stock}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                  className="quantity-input"
                />
                <button className="quantity-btn" onClick={increaseQuantity} disabled={quantity >= product.stock}>
                  +
                </button>
              </div>
              
              <button className="add-to-cart-btn">
                <ShoppingCart size={20} />
                Add to Cart
              </button>
              
              <button 
                className={`wishlist-btn ${wishlistAdded ? 'added' : ''}`}
                onClick={() => setWishlistAdded(!wishlistAdded)}
                aria-label="Add to wishlist"
              >
                <Heart size={20} fill={wishlistAdded ? "#e74c3c" : "none"} />
              </button>
              
              <button className="share-btn" aria-label="Share product">
                <Share2 size={20} />
              </button>
            </div>

            <div className="product-guarantees">
              <div className="guarantee-item">
                <img src="/api/placeholder/30/30" alt="Free shipping" />
                <span>Free Shipping</span>
              </div>
              <div className="guarantee-item">
                <img src="/api/placeholder/30/30" alt="Money-back guarantee" />
                <span>30-Day Returns</span>
              </div>
              <div className="guarantee-item">
                <img src="/api/placeholder/30/30" alt="Secure payment" />
                <span>Secure Checkout</span>
              </div>
            </div>
          </section>
        </div>

        {/* Product Information Tabs */}
        <section className="product-tabs">
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
            <button 
              className={`tab-btn ${selectedTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setSelectedTab('reviews')}
            >
              Reviews ({product.reviews})
            </button>
          </div>

          <div className="tabs-content">
            {/* Description Tab */}
            <div className={`tab-panel ${selectedTab === 'description' ? 'active' : ''}`}>
              <div className="description-content">
                <h3>Product Description</h3>
                <p>
                  Our Premium Ayurvedic Immunity Blend is a powerful combination of ancient herbal wisdom and modern 
                  nutritional science. Carefully formulated using time-tested ingredients that have been used in 
                  Ayurvedic medicine for centuries, this supplement is designed to naturally boost your body's 
                  immune response and increase overall vitality.
                </p>
                <p>
                  Each ingredient is sourced from organic farms and undergoes rigorous quality testing to 
                  ensure maximum potency and purity. Our unique manufacturing process preserves the 
                  natural properties of each herb, delivering their full benefits in every serving.
                </p>
                <h3>Why Choose Our Immunity Blend?</h3>
                <p>
                  Unlike mass-produced supplements, our formula contains no fillers, artificial preservatives,
                  or synthetic ingredients. We focus on quality and efficacy, using only what your body needs
                  to strengthen its natural defenses against environmental stressors.
                </p>
                <p>
                  Regular use has been shown to support immune function, improve energy levels, and promote
                  overall wellness. It's an ideal addition to your daily health routine, especially during
                  seasonal changes or periods of increased stress.
                </p>
                
                <div className="certifications-preview">
                  <h3>Certifications</h3>
                  <div className="cert-badges">
                    {product.certifications.map((cert, index) => (
                      <div key={index} className="cert-badge">
                        <img src={cert.image} alt={cert.name} />
                      </div>
                    ))}
                  </div>
                  <button className="view-certs-btn" onClick={() => setShowCertModal(true)}>
                    <Award size={16} />
                    View All Certifications
                  </button>
                </div>
              </div>
            </div>

            {/* Ingredients Tab */}
            <div className={`tab-panel ${selectedTab === 'ingredients' ? 'active' : ''}`}>
              <div className="ingredients-content">
                <h3>Premium Organic Ingredients</h3>
                <p>
                  Our Immunity Blend contains a carefully balanced formula of traditional Ayurvedic herbs,
                  each selected for their unique properties and synergistic effects when combined:
                </p>
                
                <div className="ingredients-table">
                  <div className="table-header">
                    <span>Ingredient</span>
                    <span>Percentage</span>
                  </div>
                  {product.ingredients.map((ingredient, index) => (
                    <div key={index} className="table-row">
                      <span>{ingredient.name}</span>
                      <span>{ingredient.percentage}</span>
                    </div>
                  ))}
                </div>
                
                <div className="ingredients-details">
                  <div className="ingredient-detail">
                    <h4>Turmeric</h4>
                    <p>A powerful antioxidant with anti-inflammatory properties, turmeric has been used for centuries to support immune function and overall health.</p>
                  </div>
                  <div className="ingredient-detail">
                    <h4>Ginger Extract</h4>
                    <p>Known for its immunity-boosting and digestive benefits, our wild-harvested ginger adds a warming quality to the blend.</p>
                  </div>
                  <div className="ingredient-detail">
                    <h4>Neem Leaf</h4>
                    <p>Traditionally used for its purifying properties, neem supports the body's natural defense mechanisms.</p>
                  </div>
                  <div className="ingredient-detail">
                    <h4>Ashwagandha</h4>
                    <p>An adaptogenic herb that helps the body manage stress while supporting immune function and energy levels.</p>
                  </div>
                  <div className="ingredient-detail">
                    <h4>Moringa Leaf</h4>
                    <p>Rich in nutrients and antioxidants, moringa complements the formula with additional immune support.</p>
                  </div>
                </div>
                
                <div className="allergen-info">
                  <h4><Info size={16} /> Allergen Information</h4>
                  <p>Manufactured in a facility that processes nuts. Free from gluten, dairy, soy, and artificial additives.</p>
                </div>
              </div>
            </div>

            {/* How to Use Tab */}
            <div className={`tab-panel ${selectedTab === 'how-to-use' ? 'active' : ''}`}>
              <div className="usage-content">
                <h3>Recommended Usage</h3>
                <p>
                  For optimal results, incorporate our Premium Ayurvedic Immunity Blend into your daily routine:
                </p>
                
                <div className="usage-steps">
                  <div className="step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h4>Dosage</h4>
                      <p>Take 1 teaspoon (5g) daily, preferably in the morning. New users may start with ½ teaspoon for the first week.</p>
                    </div>
                  </div>
                  
                  <div className="step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h4>Preparation</h4>
                      <p>Mix thoroughly with warm water, milk, or your favorite plant-based milk. For best results, add to warm liquid rather than hot, as excessive heat may reduce potency.</p>
                    </div>
                  </div>
                  
                  <div className="step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h4>When to Take</h4>
                      <p>Consume on an empty stomach 30 minutes before breakfast for maximum absorption, or as recommended by your healthcare practitioner.</p>
                    </div>
                  </div>
                  
                  <div className="step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <h4>Consistency</h4>
                      <p>For best results, use consistently for at least 4-6 weeks. Many customers report noticeable benefits after 2 weeks of regular use.</p>
                    </div>
                  </div>
                </div>
                
                <div className="usage-tips">
                  <h4>Pro Tips</h4>
                  <ul>
                    <li>Adding a pinch of black pepper can enhance turmeric absorption</li>
                    <li>A squeeze of lemon adds vitamin C and improves flavor</li>
                    <li>Store in a cool, dry place away from direct sunlight</li>
                    <li>Seal bag tightly after each use to preserve freshness</li>
                  </ul>
                </div>
                
                <div className="usage-note">
                  <p>
                    <strong>Note:</strong> Always consult with a healthcare professional before starting any new supplement, 
                    especially if you are pregnant, nursing, have a medical condition, or are taking medications.
                  </p>
                </div>
              </div>
            </div>

            {/* Reviews Tab */}
            <div className={`tab-panel ${selectedTab === 'reviews' ? 'active' : ''}`}>
              <div className="reviews-content">
                <div className="reviews-summary">
                  <div className="reviews-average">
                    <div className="average-rating">{product.rating}</div>
                    <div className="average-stars">{renderStars(product.rating)}</div>
                    <div className="total-reviews">Based on {product.reviews} reviews</div>
                  </div>
                  
                  <div className="reviews-breakdown">
                    <div className="rating-bar">
                      <span className="rating-label">5 Stars</span>
                      <div className="rating-progress">
                        <div className="progress-fill" style={{width: '75%'}}></div>
                      </div>
                      <span className="rating-percent">75%</span>
                    </div>
                    <div className="rating-bar">
                      <span className="rating-label">4 Stars</span>
                      <div className="rating-progress">
                        <div className="progress-fill" style={{width: '20%'}}></div>
                      </div>
                      <span className="rating-percent">20%</span>
                    </div>
                    <div className="rating-bar">
                      <span className="rating-label">3 Stars</span>
                      <div className="rating-progress">
                        <div className="progress-fill" style={{width: '5%'}}></div>
                      </div>
                      <span className="rating-percent">5%</span>
                    </div>
                    <div className="rating-bar">
                      <span className="rating-label">2 Stars</span>
                      <div className="rating-progress">
                        <div className="progress-fill" style={{width: '0%'}}></div>
                      </div>
                      <span className="rating-percent">0%</span>
                    </div>
                    <div className="rating-bar">
                      <span className="rating-label">1 Star</span>
                      <div className="rating-progress">
                        <div className="progress-fill" style={{width: '0%'}}></div>
                      </div>
                      <span className="rating-percent">0%</span>
                    </div>
                  </div>
                </div>
                
                <div className="reviews-list">
                  <h3>Customer Reviews</h3>
                  {product.customerReviews.map((review, index) => (
                    <div key={index} className="review-item">
                      <div className="review-header">
                        <div className="review-user">
                          <div className="user-initial">{review.name.charAt(0)}</div>
                          <div className="user-info">
                            <div className="user-name">{review.name}</div>
                            <div className="review-meta">
                              <span className="review-date">{review.date}</span>
                              {review.verified && <span className="verified-badge">Verified Purchase</span>}
                            </div>
                          </div>
                        </div>
                        <div className="review-rating">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <div className="review-content">
                        <p>{review.comment}</p>
                      </div>
                      <div className="review-actions">
                        <button className="helpful-btn">Was this helpful?</button>
                        <button className="report-btn">Report</button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="reviews-actions">
                  <button className="write-review-btn">Write a Review</button>
                  <button className="view-all-btn">View All Reviews</button>
                </div>
              </div>
            </div>
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

        {/* Recently Viewed */}
        <section className="recently-viewed">
          <h2 className="section-title">Recently Viewed</h2>
          <div className="products-row">
            {[1, 2, 3].map((item) => (
              <div key={item} className="product-card-small">
                <div className="product-card-image">
                  <img src= {ProductImage} alt={`Recently Viewed ${item}`} />
                </div>
                <div className="product-card-content">
                  <h3 className="product-card-title">Herbal Product {item}</h3>
                  <div className="product-card-price">
                    <span className="current-price">₹599</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Certifications Modal */}
      {showCertModal && (
        <div className="modal-overlay">
          <div className="certifications-modal">
            <div className="modal-header">
              <h3>Product Certifications</h3>
              <button className="close-modal" onClick={() => setShowCertModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-content">
              <div className="certifications-grid">
                {product.certifications.map((cert, index) => (
                  <div key={index} className="certification-item">
                    <img src={cert.image} alt={cert.name} />
                    <h4>{cert.name}</h4>
                    <p>Verified and certified by independent authorities to meet the highest standards of quality and safety.</p>
                  </div>
                ))}
              </div>
              <div className="certification-info">
                <h4>Our Commitment to Quality</h4>
                <p>
                  We believe in transparency and quality at every step of our production process. 
                  Our certifications reflect our dedication to providing you with products that 
                  meet the highest standards of purity, potency, and sustainability.
                </p>
                <p>
                  To verify any of our certifications, please visit the certifying authority's 
                  website and use our registration number: AYU-2023-45876.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;