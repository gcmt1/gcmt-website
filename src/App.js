import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import AboutPage from "./pages/AboutPage";
import BlogPage from "./pages/BlogPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";
import Navbar from "./components/Navbar";
import CartPage from "./pages/CartPage";

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
            {/* Add your main content here */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product" element={<ProductPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/cart" element={<CartPage />} />
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
