import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom"; // ✅ Using HashRouter
import { AppProvider } from "./AppContext";
import { ToastProvider } from "./components/ToastContext"; // <-- import

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
import Tnc from "./pages/TnC"; // Terms and Conditions page
import Footer from "./components/Footer"; // Import Footer component
import ScrollToTop from './components/ScrollToTop';
import ThankYou from "./pages/ThankYou"; // Import ThankYou component
import { PaymentSuccess, PaymentCancel, OrderConfirmation } from './pages/PaymentPages';
import "./App.css";

function App() {
  return (
    <AppProvider>
      <ToastProvider> {/* Wrap the entire app with ToastProvider */}
        <Router> {/* Router wraps the ScrollToTop */}
          <ScrollToTop /> {/* Now inside the Router */}
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
                <Route path="/terms-and-conditions" element={<Tnc />} />
                <Route path="/tnc" element={<Tnc />} /> {/* Alias for Terms and Conditions */}
                <Route path="/thankyou" element={<ThankYou />} /> {/* Fallback ThankYou page */}
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-cancel" element={<PaymentCancel />} />
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                {/* Add more routes as needed */}
                
                {/* Catch-all route for 404s */}

                {/* Catch-all route for 404s - fallback to HomePage */}
                <Route path="*" element={<HomePage />} />
              </Routes>
            </main>

            <footer className="app-footer">
              <Footer />
              <p>© 2025 Chase WorldWide. All rights reserved.</p>
            </footer>
          </div>
        </Router>
      </ToastProvider> {/* Close ToastProvider */}
    </AppProvider>
  );
}

export default App;
