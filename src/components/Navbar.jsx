import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, Search, User } from 'lucide-react';
import '../styles/Navbar.css';
import logo from '../assets/GCMT-logo.png';

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(3); // Example cart count
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <a href="/">
            <img src={logo} alt="GCMT Herbal" />
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <ul className="navbar-links">
            <li className="navbar-item">
              <a href="/" className="navbar-link active">Home</a>
            </li>
            <li className="navbar-item">
              <a href="/product" className="navbar-link">Products</a>
            </li>
            <li className="navbar-item">
              <a href="/about" className="navbar-link">About</a>
            </li>
            <li className="navbar-item">
              <a href="/blog" className="navbar-link">Blog</a>
            </li>
            <li className="navbar-item">
              <a href="/contact" className="navbar-link">Contact</a>
            </li>
            <li className="navbar-item">
              <a href="/faq" className="navbar-link">FAQ</a>
            </li>
          </ul>

          {/* Close button for mobile menu */}
          <button 
            className="close-menu-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </nav>

        {/* Navbar Actions */}
        <div className="navbar-actions">
          {/* Search */}
          <div className="search-container">
            <button 
              className="action-btn" 
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <div className={`search-dropdown ${searchOpen ? 'active' : ''}`}>
              <form className="search-form">
                <input 
                  type="search" 
                  placeholder="Search for products..." 
                  aria-label="Search for products"
                />
                <button type="submit" aria-label="Submit search">
                  <Search size={18} />
                </button>
              </form>
            </div>
          </div>

          {/* Account */}
          <a href="/account" className="action-btn" aria-label="My account">
            <User size={20} />
          </a>

          {/* Cart */}
          <a href="/cart" className="action-btn cart-btn" aria-label="Shopping cart">
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </a>

          {/* Mobile Menu Toggle */}
          <button 
            className="menu-toggle" 
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Search Bar (Mobile) */}
      <div className={`mobile-search ${searchOpen ? 'active' : ''}`}>
        <form className="mobile-search-form">
          <input 
            type="search" 
            placeholder="Search for products..." 
            aria-label="Search for products"
          />
          <button type="submit" aria-label="Submit search">
            <Search size={18} />
          </button>
        </form>
      </div>

      {/* Backdrop for Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          className="menu-backdrop" 
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
    </header>
  );
};

export default NavBar;
