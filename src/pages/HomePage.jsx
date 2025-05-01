import React, { useState } from 'react';
import '../styles/HomePage.css';
import productPhoto from '../assets/product.jpg';
import { ChevronRight, Star, Truck, Shield, Leaf, Instagram, ArrowRight, ShoppingCart } from 'lucide-react';

const HomePage = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  
  // Featured products data
  const featuredProducts = [
    {
      id: 1,
      name: "Immunity Booster",
      description: "Natural herbal supplement to enhance your immune system.",
      price: "₹899",
      originalPrice: "₹1,199",
      image: productPhoto,
      badge: "Best Seller"
    },
    {
      id: 2,
      name: "Stress Relief Formula",
      description: "Calming blend of adaptogenic herbs for stress management.",
      price: "₹799",
      originalPrice: "₹999",
      image: productPhoto,
      badge: "New"
    },
    {
      id: 3,
      name: "Joint Care Complex",
      description: "Traditional herbs for joint health and mobility support.",
      price: "₹849",
      originalPrice: "₹1,099",
      image: productPhoto,
      badge: ""
    },
    {
      id: 4,
      name: "Sleep & Relaxation",
      description: "Natural solution for quality sleep and relaxation.",
      price: "₹749",
      originalPrice: "₹949",
      image: productPhoto,
      badge: "Limited"
    }
  ];
  
  // Testimonials data
  const testimonials = [
    {
      quote: "GCMT Herbal products have transformed my health journey. The Immunity Booster has been a daily essential for me and my family.",
      author: "Priya Sharma",
      location: "Delhi"
    },
    {
      quote: "As someone who's tried many natural supplements, GCMT Herbal stands out for its quality and effectiveness. Their Joint Care Complex has given me mobility I hadn't experienced in years.",
      author: "Rajesh Patel",
      location: "Mumbai"
    },
    {
      quote: "The Sleep & Relaxation formula has been life-changing. I finally get restful sleep after years of struggling. Their customer service is exceptional too!",
      author: "Anjali Mehta",
      location: "Bangalore"
    }
  ];
  
  // Categories data
  const categories = [
    { name: "Immunity", icon: "🌿" },
    { name: "Digestion", icon: "🍃" },
    { name: "Sleep", icon: "🌙" },
    { name: "Energy", icon: "⚡" },
    { name: "Joint Care", icon: "💪" },
    { name: "Skin Health", icon: "✨" }
  ];

  return (
    <div className="homepage">
      
      {/* Announcement Bar */}
      <div className="announcement-bar">
        <p>Free shipping on orders above ₹999 | COD Available | 100% Secure Checkout</p>
      </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Natural Wellness, <br />Rooted in Tradition</h1>
          <p>Premium herbal supplements crafted from ancient Ayurvedic wisdom, backed by modern science.</p>
          <div className="hero-cta">
            <button className="primary-button">Shop Best Sellers</button>
            <button className="secondary-button">Learn Our Story</button>
          </div>
        </div>
        <div className="hero-image">
          {/* This would typically be a separate image with proper styling */}
        </div>
      </section>
      
      {/* Trust Bar */}
      <section className="trust-bar">
        <div className="trust-item">
          <Leaf size={24} />
          <span>100% Natural</span>
        </div>
        <div className="trust-item">
          <Shield size={24} />
          <span>Certified Organic</span>
        </div>
        <div className="trust-item">
          <Truck size={24} />
          <span>Fast Delivery</span>
        </div>
        <div className="trust-item">
          <Star size={24} />
          <span>5000+ Reviews</span>
        </div>
      </section>
      
      {/* Category Navigation */}
      <section className="category-navigation">
        <h2>Shop By Category</h2>
        <div className="category-grid">
          {categories.map((category, index) => (
            <div key={index} className="category-card">
              <div className="category-icon">{category.icon}</div>
              <h3>{category.name}</h3>
              <a href={`/category/${category.name.toLowerCase()}`} className="category-link">
                Shop Now <ChevronRight size={16} />
              </a>
            </div>
          ))}
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="featured-products">
        <div className="section-header">
          <h2>Best Selling Products</h2>
          <a href="/shop" className="view-all">
            View All <ArrowRight size={16} />
          </a>
        </div>
        <div className="product-grid">
          {featuredProducts.map(product => (
            <div key={product.id} className="product-card">
              {product.badge && <span className="product-badge">{product.badge}</span>}
              <div className="product-image-container">
                <img src={product.image} alt={product.name} />
                <button className="quick-add-btn">
                  <ShoppingCart size={18} />
                  <span>Quick Add</span>
                </button>
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-price">
                  <span className="current-price">{product.price}</span>
                  {product.originalPrice && (
                    <span className="original-price">{product.originalPrice}</span>
                  )}
                </div>
                <div className="product-rating">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill="#FFD700" color="#FFD700" />
                    ))}
                  </div>
                  <span>(124)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="benefits">
        <div className="benefits-container">
          <div className="benefit-image">
            {/* This would be a proper image in production */}
          </div>
          <div className="benefit-content">
            <h2>The GCMT Herbal Difference</h2>
            <ul className="benefits-list">
              <li>
                <div className="benefit-icon">🌿</div>
                <div className="benefit-text">
                  <h3>100% Natural Ingredients</h3>
                  <p>Ethically sourced herbs with no artificial additives or fillers</p>
                </div>
              </li>
              <li>
                <div className="benefit-icon">🔬</div>
                <div className="benefit-text">
                  <h3>Scientifically Validated</h3>
                  <p>Traditional formulations backed by modern clinical research</p>
                </div>
              </li>
              <li>
                <div className="benefit-icon">🌱</div>
                <div className="benefit-text">
                  <h3>Sustainably Harvested</h3>
                  <p>Supporting local farmers and sustainable agricultural practices</p>
                </div>
              </li>
              <li>
                <div className="benefit-icon">⚗️</div>
                <div className="benefit-text">
                  <h3>Potent Extracts</h3>
                  <p>Concentrated herbal extracts for maximum bioavailability</p>
                </div>
              </li>
            </ul>
            <button className="secondary-button">Learn More About Our Process</button>
          </div>
        </div>
      </section>
      
      {/* Testimonials Carousel */}
      <section className="testimonials">
        <h2>Customer Experiences</h2>
        <div className="testimonial-carousel">
          <div className="testimonial-slide" style={{transform: `translateX(-${activeTestimonial * 100}%)`}}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} fill="#FFD700" color="#FFD700" />
                  ))}
                </div>
                <blockquote>"{testimonial.quote}"</blockquote>
                <div className="testimonial-author">
                  <p>{testimonial.author}</p>
                  <span>{testimonial.location}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="testimonial-controls">
            {testimonials.map((_, index) => (
              <button 
                key={index} 
                className={`testimonial-dot ${index === activeTestimonial ? 'active' : ''}`}
                onClick={() => setActiveTestimonial(index)}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Instagram Feed */}
      <section className="instagram-feed">
        <div className="section-header">
          <h2>Follow Us @GCMTHerbal</h2>
          <a href="https://instagram.com/gcmtherbal" className="view-all" target="_blank" rel="noopener noreferrer">
            View Our Instagram <Instagram size={16} />
          </a>
        </div>
        <div className="instagram-grid">
          {/* In a real implementation, these would be actual Instagram posts */}
          {[...Array(6)].map((_, i) => (
            <div key={i} className="instagram-post">
              <img src={productPhoto} alt="Instagram post" />
              <div className="instagram-overlay">
                <Instagram size={24} />
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className="newsletter">
        <div className="newsletter-content">
          <h2>Join Our Wellness Journey</h2>
          <p>Subscribe to receive health tips, exclusive offers, and updates on new products.</p>
          <form className="newsletter-form">
            <input type="email" placeholder="Your email address" required />
            <button type="submit">Subscribe</button>
          </form>
          <p className="newsletter-disclaimer">By subscribing, you agree to our privacy policy and consent to receive marketing emails.</p>
        </div>
      </section>
      
      {/* Promo Bar */}
      <section className="promo-bar">
        <p>Limited Time Offer: Use code WELCOME15 for 15% off your first order!</p>
      </section>
    </div>
  );
};

export default HomePage;