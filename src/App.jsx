import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom"; // ✅ changed from BrowserRouter

import HomePage from "./pages/HomePage";
import ProductListingPage from "./pages/ProductListings";
import AboutPage from "./pages/AboutPage";
import BlogPage from "./pages/BlogPage";
import ContactPage from "./pages/ContactPage";
import ProductDetails from "./pages/ProductDetails";
import FAQPage from "./pages/FAQPage";
import Navbar from "./components/Navbar";
import CartPage from "./pages/CartPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import ThankYouPage from "./pages/ThankYou";
import Checkout from "./pages/CheckOut";
import "./App.css";

function App() {
  return (
        <Router>
          <div className="app-container">
            {/* Sticky Navbar */}
            <header className="app-header">
              <Navbar />
            </header>
            <main className="app-main">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductListingPage />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/thankyou/:orderId" element={<ThankYouPage />} />
                <Route path="*" element={HomePage} />
              </Routes>
            </main>
            <footer className="app-footer">
              <p>© 2025 Chase WorldWide. All rights reserved.</p>
            </footer>
          </div>
        </Router>
  );
}

export default App;
