import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import {
  Menu,
  X,
  ShoppingCart,
  Search,
  User
} from 'lucide-react';
import '../styles/Navbar.css';
import logo from '../assets/GCMT-logo.png';

export default function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [adminRole, setAdminRole] = useState(false);

  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const isGuestAccount = (user) => {
    if (!user) return true;
    return user.email?.toLowerCase().includes('guest') || 
           user.user_metadata?.is_guest || 
           user.user_metadata?.account_type === 'guest' ||
           user.is_anonymous;
  };

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        fetchCartCount(currentUser.id);
        checkIfAdmin(currentUser.id);
      }
    }

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        fetchCartCount(currentUser.id);
        checkIfAdmin(currentUser.id);
      } else {
        setCartCount(0);
        setAdminRole(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const checkIfAdmin = async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('❌ Error checking admin role:', error);
      return;
    }

    if (data?.role && data.role !== 'user') {
      setAdminRole(true);
    } else {
      setAdminRole(false);
    }
  };

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    }
    if (searchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  async function fetchCartCount(userId) {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('quantity')
        .eq('user_id', userId);
      if (error) throw error;
      setCartCount(data.reduce((sum, row) => sum + row.quantity, 0));
    } catch {
      setCartCount(0);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    const q = e.target.querySelector('input').value.trim();
    if (q) {
      window.location.href = `/search?q=${encodeURIComponent(q)}`;
      setSearchOpen(false);
    }
  }

  function toggleSearch() {
    setSearchOpen(open => !open);
    if (!searchOpen) setMobileMenuOpen(false);
  }

  function toggleMobileMenu() {
    setMobileMenuOpen(open => !open);
    if (!mobileMenuOpen) setSearchOpen(false);
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  function handleAuthRedirect() {
    window.location.href = '#/auth';
    closeMobileMenu();
  }

  function handleLogout() {
    supabase.auth.signOut();
    closeMobileMenu();
  }

  useEffect(() => {
    const navbar = document.querySelector('.gcmt-navbar');
    if (!navbar) return;
    if (mobileMenuOpen) {
      navbar.classList.add('gcmt-navbar--mobile-open');
    } else {
      navbar.classList.remove('gcmt-navbar--mobile-open');
    }
  }, [mobileMenuOpen]);

  const isGuest = isGuestAccount(user);

  return (
    <header
      className={`gcmt-navbar
        ${isScrolled ? 'gcmt-navbar--scrolled' : ''}
        ${mobileMenuOpen ? 'gcmt-navbar--mobile-open' : ''}
      `}
    >
      <div className="gcmt-navbar__container">
        <div className="gcmt-navbar__logo">
          <a href="/">
            <img src={logo} alt="GCMT Herbal" />
          </a>
        </div>

        <nav className={`gcmt-navbar__menu ${mobileMenuOpen ? 'gcmt-navbar__menu--open' : ''}`}>
          <ul className="gcmt-navbar__links">
            {['Home','Products','About','Blog','Contact','FAQ','Your Orders'].map(label => (
              <li key={label}>
                <a
                  href={`#/${label.toLowerCase().replace(/\s+/g, '-')}`}
                  className="gcmt-navbar__link"
                  onClick={closeMobileMenu}
                >
                  {label}
                </a>
              </li>
            ))}

            {/* Admin Panel Link */}
            {adminRole && (
              <li>
                <a
                  href="/admin-landing"
                  className="gcmt-navbar__link admin-link"
                  onClick={closeMobileMenu}
                >
                  Admin Panel
                </a>
              </li>
            )}

            <li className="gcmt-navbar__mobile-only">
              {user && !isGuest ? (
                <button
                  onClick={handleLogout}
                  className="gcmt-navbar__logout-link"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={handleAuthRedirect}
                  className="gcmt-navbar__auth-link"
                >
                  Login / Sign Up
                </button>
              )}
            </li>
          </ul>

          <button
            className="gcmt-navbar__close-btn"
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </nav>

        {/* Actions */}
        <div className="gcmt-navbar__actions">
          <div className="gcmt-navbar__search-container" ref={searchRef}>
            <button
              className="gcmt-navbar__action-btn"
              onClick={toggleSearch}
              aria-label="Search"
              aria-expanded={searchOpen}
            >
              <Search size={20} />
            </button>
            <div className={`gcmt-navbar__search-dropdown ${searchOpen ? 'active' : ''}`}>
              <form className="gcmt-navbar__search-form" onSubmit={handleSearch}>
                <input
                  type="search"
                  placeholder="Search products..."
                  autoFocus={searchOpen}
                  required
                />
                <button type="submit" aria-label="Submit search">
                  <Search size={18} />
                </button>
              </form>
            </div>
          </div>

          {/* Profile */}
          <div className="gcmt-navbar__profile-container">
            {user && !isGuest ? (
              <a
                href="#/profile"
                className="gcmt-navbar__action-btn gcmt-navbar__profile-btn"
                aria-label="Profile"
              >
                <User size={20} />
                <span className="gcmt-navbar__profile-indicator" />
              </a>
            ) : (
              <button
                className="gcmt-navbar__action-btn gcmt-navbar__auth-btn"
                onClick={handleAuthRedirect}
                aria-label="Login / Sign Up"
              >
                <User size={20} />
              </button>
            )}
          </div>

          {/* Cart */}
          <a
            href="#/cart"
            className="gcmt-navbar__action-btn gcmt-navbar__cart-btn"
            aria-label={`Cart${cartCount ? ` (${cartCount})` : ''}`}
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="gcmt-navbar__cart-badge">{cartCount}</span>
            )}
          </a>

          {/* Mobile Toggle */}
          <button
            className="gcmt-navbar__toggle"
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className={`gcmt-navbar__backdrop active`}
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
    </header>
  );
}
