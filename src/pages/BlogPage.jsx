import React from "react";
import "../styles/BlogPage.css";

const BlogPage = () => {
  const blogPosts = [
    {
      id: 1,
      title: "5 Benefits of Charcoal Toothpaste",
      excerpt: "Discover how activated charcoal naturally whitens teeth and fights plaque.",
      date: "May 5, 2025",
      category: "Oral Care",
      imageUrl: "/images/blog/charcoal-toothpaste.jpg",
      readTime: "5 min read",
    },
    {
      id: 2,
      title: "Why Ayurveda is the Future of Health",
      excerpt: "Ancient herbs and modern science combine to create powerful wellness solutions.",
      date: "April 28, 2025",
      category: "Wellness",
      imageUrl: "/images/blog/ayurveda-herbs.jpg",
      readTime: "8 min read",
    },
    {
      id: 3,
      title: "Fluoride-Free Toothpaste: A Smart Choice",
      excerpt: "Learn why many health-conscious individuals are switching to fluoride-free options.",
      date: "April 15, 2025",
      category: "Oral Care",
      imageUrl: "/images/blog/fluoride-free.jpg",
      readTime: "6 min read",
    },
    {
      id: 4,
      title: "Sustainable Packaging in the Beauty Industry",
      excerpt: "How we're reducing our environmental footprint with eco-friendly packaging solutions.",
      date: "April 8, 2025",
      category: "Sustainability",
      imageUrl: "/images/blog/sustainable-packaging.jpg",
      readTime: "4 min read",
    },
  ];

  return (
    <div className="blog-container">
      <div className="blog-header">
        <h1>Insights & Inspiration</h1>
        <p className="blog-subtitle">Expert advice, industry trends, and product insights from our team</p>
        
        <div className="blog-categories">
          <button className="category-button active">All</button>
          <button className="category-button">Oral Care</button>
          <button className="category-button">Wellness</button>
          <button className="category-button">Sustainability</button>
          <button className="category-button">Product Guides</button>
        </div>
      </div>

      <div className="featured-post">
        <div className="featured-image">
          <img src="/images/blog/featured-post.jpg" alt="Featured blog post" />
          <span className="featured-tag">Featured</span>
        </div>
        <div className="featured-content">
          <span className="post-category">Wellness</span>
          <h2>The Science Behind Natural Ingredients: How They Benefit Your Daily Routine</h2>
          <p className="post-meta">May 8, 2025 • 10 min read</p>
          <p className="post-excerpt">
            From antioxidant-rich botanicals to soothing essential oils, discover how nature's finest ingredients 
            can transform your health and beauty regimen with proven scientific benefits.
          </p>
          <button className="read-more-button primary">Read Article</button>
        </div>
      </div>

      <div className="blog-search">
        <input type="text" placeholder="Search articles..." />
        <button className="search-button">Search</button>
      </div>

      <div className="blog-grid">
        {blogPosts.map((post) => (
          <div className="blog-card" key={post.id}>
            <div className="card-image">
              <img src={post.imageUrl} alt={post.title} />
              <span className="post-category">{post.category}</span>
            </div>
            <div className="card-content">
              <h3>{post.title}</h3>
              <p className="post-meta">{post.date} • {post.readTime}</p>
              <p className="post-excerpt">{post.excerpt}</p>
              <button className="read-more-link">Read More →</button>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button className="pagination-button active">1</button>
        <button className="pagination-button">2</button>
        <button className="pagination-button">3</button>
        <button className="pagination-button">Next →</button>
      </div>

      <div className="newsletter-section">
        <div className="newsletter-content">
          <h2>Stay Informed</h2>
          <p>Subscribe to our newsletter for the latest articles, product updates, and exclusive offers.</p>
        </div>
        <div className="newsletter-form">
          <input type="email" placeholder="Your email address" />
          <button className="subscribe-button">Subscribe</button>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;