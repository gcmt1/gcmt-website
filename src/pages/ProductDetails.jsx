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
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [wishlistAdded, setWishlistAdded] = useState(false);
  const [selectedTab, setSelectedTab] = useState('description');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [showCertModal, setShowCertModal] = useState(false);
  
  // Review system state variables (these were missing)
  const [hoverRating, setHoverRating] = useState(0);
  const [newRating, setNewRating] = useState(0);
  const [newReviewText, setNewReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [user, setUser] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  
  // Edit/Delete review state
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editReviewText, setEditReviewText] = useState('');
  const [editHoverRating, setEditHoverRating] = useState(0);
  const [deletingReview, setDeletingReview] = useState(null);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getCurrentUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchProductAndReviews() {
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
          reviews: 0, // Will be updated with actual review count
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

        // Fetch reviews
        const { data: revData, error: revErr } = await supabase
          .from('product_reviews')
          .select('id, user_name, rating, review_text, created_at, user_id')
          .eq('product_id', id)
          .order('created_at', { ascending: false });

        if (revErr) {
          console.warn('Error fetching reviews:', revErr);
          // Don't throw error for reviews, just continue
        } else {
          setReviews(revData || []);
          // Update product with actual review count
          setProduct(prev => ({
            ...prev,
            reviews: revData?.length || 0
          }));
        }

      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Unable to load product information.');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProductAndReviews();
    }
  }, [id]);

  const renderStars = (rating, isInteractive = false, isEdit = false) =>
    Array(5)
      .fill(0)
      .map((_, i) => {
        const starIndex = i + 1;
        let filled;
        
        if (isEdit) {
          filled = starIndex <= (editHoverRating || editRating);
        } else if (isInteractive) {
          filled = starIndex <= (hoverRating || newRating);
        } else {
          filled = i < rating;
        }
        
        return (
          <Star
            key={i}
            size={20}
            fill={filled ? '#FFB800' : 'none'}
            stroke={filled ? '#FFB800' : '#8B8B8B'}
            className={isInteractive || isEdit ? 'cursor-pointer' : ''}
            onMouseEnter={
              isEdit 
                ? () => setEditHoverRating(starIndex)
                : isInteractive 
                  ? () => setHoverRating(starIndex) 
                  : undefined
            }
            onMouseLeave={
              isEdit 
                ? () => setEditHoverRating(0)
                : isInteractive 
                  ? () => setHoverRating(0) 
                  : undefined
            }
            onClick={
              isEdit 
                ? () => setEditRating(starIndex)
                : isInteractive 
                  ? () => setNewRating(starIndex) 
                  : undefined
            }
          />
        );
      });

  const handleReviewSubmit = async () => {
    // Clear previous errors
    setSubmitError('');
    
    if (!user) {
      setSubmitError('Please sign in to submit a review.');
      return;
    }
    
    if (newRating < 1) {
      setSubmitError('Please select a rating.');
      return;
    }
    
    if (!newReviewText.trim()) {
      setSubmitError('Please write a review.');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const userName =
        user.user_metadata?.full_name
          ? user.user_metadata.full_name
          : user.email
        ? user.email.split('@')[0]
        : 'Anonymous';

      const { error: insertErr } = await supabase
        .from('product_reviews')
        .insert({
          product_id: id,
          user_id: user.id,
          user_name: userName,
          rating: newRating,
          review_text: newReviewText.trim()
        });
        
      if (insertErr) throw insertErr;
      
      // Refresh reviews after successful submission
      const { data: revData } = await supabase
        .from('product_reviews')
        .select('id, user_name, rating, review_text, created_at, user_id')
        .eq('product_id', id)
        .order('created_at', { ascending: false });
        
      setReviews(revData || []);
      
      // Update product review count
      setProduct(prev => ({
        ...prev,
        reviews: revData?.length || 0
      }));
      
      // Reset form
      setNewRating(0);
      setNewReviewText('');
      setHoverRating(0);
      setSubmitError('');
      
      // Show success message (optional)
      alert('Review submitted successfully!');
      
    } catch (err) {
      console.error('Error submitting review:', err);
      setSubmitError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review.id);
    setEditRating(review.rating);
    setEditReviewText(review.review_text);
    setEditHoverRating(0);
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setEditRating(0);
    setEditReviewText('');
    setEditHoverRating(0);
  };

  const handleUpdateReview = async (reviewId) => {
    if (editRating < 1) {
      alert('Please select a rating.');
      return;
    }
    
    if (!editReviewText.trim()) {
      alert('Please write a review.');
      return;
    }

    try {
      const { error: updateErr } = await supabase
        .from('product_reviews')
        .update({
          rating: editRating,
          review_text: editReviewText.trim(),
        })
        .eq('id', reviewId)
        .eq('user_id', user.id); // Ensure user can only edit their own reviews

      if (updateErr) throw updateErr;

      // Refresh reviews
      const { data: revData } = await supabase
        .from('product_reviews')
        .select('id, user_name, rating, review_text, created_at, user_id')
        .eq('product_id', id)
        .order('created_at', { ascending: false });
        
      setReviews(revData || []);
      
      // Reset edit state
      setEditingReview(null);
      setEditRating(0);
      setEditReviewText('');
      setEditHoverRating(0);
      
      alert('Review updated successfully!');
      
    } catch (err) {
      console.error('Error updating review:', err);
      alert('Failed to update review. Please try again.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    setDeletingReview(reviewId);

    try {
      const { error: deleteErr } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id); // Ensure user can only delete their own reviews

      if (deleteErr) throw deleteErr;

      // Refresh reviews
      const { data: revData } = await supabase
        .from('product_reviews')
        .select('id, user_name, rating, review_text, created_at, user_id')
        .eq('product_id', id)
        .order('created_at', { ascending: false });
        
      setReviews(revData || []);
      
      // Update product review count
      setProduct(prev => ({
        ...prev,
        reviews: revData?.length || 0
      }));
      
      alert('Review deleted successfully!');
      
    } catch (err) {
      console.error('Error deleting review:', err);
      alert('Failed to delete review. Please try again.');
    } finally {
      setDeletingReview(null);
    }
  };

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

{/* Reviews Section */}
<section className="reviews-section">
  <h2>Customer Reviews ({reviews.length})</h2>
  
  {/* Review Form */}
  <div className="review-form">
    <h3>Write a Review</h3>
    
    <div className="star-input">
      <label>Rating:</label>
      <div className="stars-container">
        {renderStars(newRating, true)}
      </div>
    </div>
    
    <textarea
      placeholder="Write your review here..."
      value={newReviewText}
      onChange={(e) => setNewReviewText(e.target.value)}
      rows={4}
      className="review-textarea"
    />
    
    {submitError && <p className="error-text">{submitError}</p>}
    
    <button
      onClick={handleReviewSubmit}
      disabled={submitting}
      className="btn-submit"
    >
      {submitting ? 'Submitting...' : 'Submit Review'}
    </button>
    
    {!user && (
      <p className="auth-notice">Please sign in to submit a review.</p>
    )}
  </div>

  {/* Latest Reviews Preview */}
  <div className="reviews-list">
    {reviews.length === 0 ? (
      <p>No reviews yet. Be the first to review this product!</p>
    ) : (
      <>
        {reviews.slice(0, 3).map((rev) => (
          <div key={rev.id} className="review-card">
            {editingReview === rev.id ? (
              // Edit Mode
              <div className="review-edit-form">
                <div className="review-header">
                  <strong>{rev.user_name}</strong>
                  <span className="review-date">
                    {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="star-input">
                  <label>Rating:</label>
                  <div className="stars-container">
                    {renderStars(editRating, false, true)}
                  </div>
                </div>
                
                <textarea
                  value={editReviewText}
                  onChange={(e) => setEditReviewText(e.target.value)}
                  rows={3}
                  className="review-textarea"
                  placeholder="Update your review..."
                />
                
                <div className="review-edit-actions">
                  <button
                    onClick={() => handleUpdateReview(rev.id)}
                    className="btn-save"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <>
                <div className="review-header">
                  <strong>{rev.user_name}</strong>
                  <span className="review-date">
                    {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                  
                  {/* Show edit/delete buttons only for user's own reviews */}
                  {user && rev.user_id === user.id && (
                    <div className="review-actions">
                      <button
                        onClick={() => handleEditReview(rev)}
                        className="btn-edit"
                        title="Edit review"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="btn-delete"
                        title="Delete review"
                        disabled={deletingReview === rev.id}
                      >
                        {deletingReview === rev.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="review-rating">{renderStars(rev.rating)}</div>
                {rev.review_text && <p className="review-text">{rev.review_text}</p>}
              </>
            )}
          </div>
        ))}
        
        {/* Show "View All Reviews" button if there are more than 3 reviews */}
        {reviews.length > 3 && (
          <div className="view-all-reviews-container">
            <button
              onClick={() => setShowAllReviews(true)}
              className="btn-view-all-reviews"
            >
              View All Reviews ({reviews.length})
            </button>
          </div>
        )}
      </>
    )}
  </div>
</section>

{/* All Reviews Modal */}
{showAllReviews && (
  <div className="modal-overlay">
    <div className="modal-container all-reviews-modal">
      <div className="modal-header">
        <h3>All Customer Reviews ({reviews.length})</h3>
        <button 
          className="modal-close" 
          onClick={() => setShowAllReviews(false)}
          aria-label="Close reviews modal"
        >
          <X size={24} />
        </button>
      </div>
      
      <div className="modal-content">
        <div className="all-reviews-list">
          {reviews.map((rev) => (
            <div key={rev.id} className="review-card">
              {editingReview === rev.id ? (
                // Edit Mode
                <div className="review-edit-form">
                  <div className="review-header">
                    <strong>{rev.user_name}</strong>
                    <span className="review-date">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="star-input">
                    <label>Rating:</label>
                    <div className="stars-container">
                      {renderStars(editRating, false, true)}
                    </div>
                  </div>
                  
                  <textarea
                    value={editReviewText}
                    onChange={(e) => setEditReviewText(e.target.value)}
                    rows={3}
                    className="review-textarea"
                    placeholder="Update your review..."
                  />
                  
                  <div className="review-edit-actions">
                    <button
                      onClick={() => handleUpdateReview(rev.id)}
                      className="btn-save"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="btn-cancel"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  <div className="review-header">
                    <strong>{rev.user_name}</strong>
                    <span className="review-date">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                    
                    {/* Show edit/delete buttons only for user's own reviews */}
                    {user && rev.user_id === user.id && (
                      <div className="review-actions">
                        <button
                          onClick={() => handleEditReview(rev)}
                          className="btn-edit"
                          title="Edit review"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="btn-delete"
                          title="Delete review"
                          disabled={deletingReview === rev.id}
                        >
                          {deletingReview === rev.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="review-rating">{renderStars(rev.rating)}</div>
                  {rev.review_text && <p className="review-text">{rev.review_text}</p>}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;