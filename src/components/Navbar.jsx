import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Menu, X, ShoppingCart, Search, User, ShoppingBag, Heart, LogIn } from 'lucide-react';
import '../styles/Navbar.css';
import logo from '../assets/GCMT-logo.png';

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Check for authenticated user on mount and auth state changes
  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user);
      
      // Fetch cart count if user is logged in
      if (data.session?.user) {
        fetchCartCount(data.session.user.id);
      }
    };
    
    fetchSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user);
      
      // Update cart count when auth state changes
      if (session?.user) {
        fetchCartCount(session.user.id);
      } else {
        setCartCount(0);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch cart count for the user
  const fetchCartCount = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId);
        
      if (error) throw error;
      
      // Calculate total quantity across all cart items
      const totalItems = data.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartCount(0);
    }
  };

  // Handle user login
  const handleLogin = async (e) => {
    e.preventDefault();
    
    const email = e.target.email.value;
    const password = e.target.password.value;
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Close modal on successful login
      setLoginModalOpen(false);
      displayToast('Logged in successfully!', 'success');
    } catch (error) {
      displayToast(error.message || 'Failed to log in. Please try again.', 'error');
    }
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      displayToast('Logged out successfully!', 'success');
    } catch (error) {
      displayToast('Failed to log out. Please try again.', 'error');
    }
  };

  // Toggle login modal
  const handleLoginModalToggle = () => {
    setLoginModalOpen(!loginModalOpen);
  };

  // Close all menus
  const closeAllMenus = () => {
    setSearchOpen(false);
    setMobileMenuOpen(false);
    setLoginModalOpen(false);
  };

  // Toast notification system
  const displayToast = (message, type = 'info') => {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerText = message;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toastContainer.removeChild(toast), 300);
      }, 3000);
    }, 100);
  };

  const createToastContainer = () => {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
    return container;
  };

  // Handle search functionality
  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.querySelector('input').value.trim();
    
    if (searchTerm) {
      window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
    }
  };

  return (
    <>
      <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Logo */}
          <div className="navbar-logo">
            <a href="/">
              <img src={logo} alt="GCMT Herbal" />
            </a>
          </div>

          {/* Desktop/Mobile Navigation Menu */}
          <nav className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
            <ul className="navbar-links">
              <li><a href="/" className="navbar-link">Home</a></li>
              <li><a href="/products" className="navbar-link">Products</a></li>
              <li><a href="/about" className="navbar-link">About</a></li>
              <li><a href="/blog" className="navbar-link">Blog</a></li>
              <li><a href="/contact" className="navbar-link">Contact</a></li>
              <li><a href="/faq" className="navbar-link">FAQ</a></li>
              
              {/* Mobile-only user actions */}
              <li className="mobile-only">
                {user ? (
                  <>
                    <a href="/profile" className="navbar-link">My Profile</a>
                    <a href="/orders" className="navbar-link">My Orders</a>
                    <a href="/wishlist" className="navbar-link">Wishlist</a>
                    <button onClick={handleLogout} className="logout-link">Logout</button>
                  </>
                ) : (
                  <>
                    <button onClick={handleLoginModalToggle} className="navbar-link">Sign In</button>
                    <a href="/register" className="navbar-link">Register</a>
                  </>
                )}
              </li>
            </ul>
            <button className="close-menu-btn" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
              <X size={24} />
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="navbar-actions">
            {/* Search */}
            <div className="search-container">
              <button className="action-btn" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
                <Search size={20} />
              </button>
              {searchOpen && (
                <div className="search-dropdown active">
                  <form className="search-form" onSubmit={handleSearch}>
                    <input type="search" placeholder="Search for products..." />
                    <button type="submit"><Search size={18} /></button>
                  </form>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="profile-container">
              {user ? (
                <a href="/profile" className="action-btn profile-btn" aria-label="My Profile">
                  <User size={20} />
                  <span className="profile-indicator"></span>
                </a>
              ) : (
                <button className="action-btn" onClick={handleLoginModalToggle} aria-label="Sign In">
                  <User size={20} />
                </button>
              )}
            </div>

            {/* Cart */}
            <a href="/cart" className="action-btn cart-btn" aria-label="Shopping cart">
              <ShoppingCart size={20} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </a>

            {/* Mobile Menu Toggle */}
            <button className="menu-toggle" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className={`mobile-search ${searchOpen ? 'active' : ''}`}>
          <form className="mobile-search-form" onSubmit={handleSearch}>
            <input type="search" placeholder="Search for products..." />
            <button type="submit"><Search size={18} /></button>
          </form>
        </div>

        {/* Mobile Menu Backdrop */}
        {mobileMenuOpen && <div className="menu-backdrop" onClick={() => setMobileMenuOpen(false)}></div>}
      </header>

      {/* Login Modal */}
      {loginModalOpen && (
        <div className="login-modal-overlay" onClick={handleLoginModalToggle}>
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={handleLoginModalToggle}>
              <X size={20} />
            </button>
            <div className="login-modal-header">
              <h2>Sign In</h2>
              <p>Welcome back! Sign in to your account</p>
            </div>
            <form className="login-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  placeholder="Enter your email" 
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password"
                  placeholder="Enter your password" 
                  required 
                />
                <a href="/forgot-password" className="forgot-password">Forgot password?</a>
              </div>
              <button type="submit" className="submit-btn">Sign In</button>
              <div className="social-login">
                <p>Or sign in with</p>
                <div className="social-buttons">
                  <button 
                    type="button" 
                    className="google-btn"
                    onClick={() => supabase.auth.signInWithOAuth({
                      provider: 'google',
                      options: {
                        redirectTo: `${window.location.origin}/auth/callback`
                      }
                    })}
                  >
                    Google
                  </button>
                  <button 
                    type="button" 
                    className="facebook-btn"
                    onClick={() => supabase.auth.signInWithOAuth({
                      provider: 'facebook',
                      options: {
                        redirectTo: `${window.location.origin}/auth/callback`
                      }
                    })}
                  >
                    Facebook
                  </button>
                </div>
              </div>
              <p className="register-link">
                Don't have an account? <a href="/register">Register now</a>
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;