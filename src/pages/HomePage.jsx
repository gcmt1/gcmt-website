import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import '../styles/HomePage.css';
import productPhoto from '../assets/model.png';
import { ArrowRight, Instagram, Star } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    { quote: "Amazing product!", author: "John Doe", location: "New York" },
    { quote: "Highly recommend!", author: "Jane Smith", location: "California" },
    { quote: "Will buy again!", author: "Alice Brown", location: "Texas" },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data);
        setIsDataFetched(true);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="homepage">
      {/* Announcement Bar */}
      <div className="announcement-bar">
        <p>Free shipping on your first order | 100% Secure Checkout | UPI Transaction Available</p>
      </div>

      <section className="hero">
        <div className="hero-content">
          <h1>Natural Wellness, <br />Rooted in Tradition</h1>
          <p>Premium herbal supplements crafted from ancient Ayurvedic wisdom, backed by modern science.</p>
          <div className="hero-cta">
            <a href="#/products">
              <button className="primary-button">Shop Now</button>
            </a>
            <a href="#/about">
              <button className="secondary-button">Learn Our Story</button>
            </a>
          </div>
        </div>
        <div className="hero-image"></div>
      </section>

      <section className="featured-products">
        <div className="section-header">
          <h2>Latest Products</h2>
          <a href="#/products" className="view-all">
            View All <ArrowRight size={16} />
          </a>
        </div>
        <div className="product-grid">
          {isDataFetched && products.length > 0 ? (
            products.map(product => (
              <ProductCard key={product.id} productId={product.id} />
            ))
          ) : (
            <p>No products found or loading...</p>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits">
        <div className="benefits-container">
          <div className="benefit-image"></div>
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
          <div className="testimonial-slide" style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}>
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
          <h2>Follow Us @gcmt.shop.official</h2>
          <a href="https://www.instagram.com/gcmt.shop.official/?utm_source=ig_web_button_share_sheet" className="view-all" target="_blank" rel="noopener noreferrer">
            View Our Instagram <Instagram size={16} />
          </a>
        </div>
        <div className="instagram-grid">
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
    </div>
  );
};

export default HomePage;
