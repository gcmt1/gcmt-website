import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

import logo from '../assets/GCMT-logo.png';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer bg-green-900 text-white">
      {/* Main Footer Content */}
      <div className="footer-wrapper max-w-7xl mx-auto px-4 py-12">
        <div className="footer-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                  <div className="footer-company space-y-4">
                    <div className="footer-brand flex items-center space-x-3">
                      <img
                        src={logo}
                        alt="GCMT Herbal Logo"
                        className="footer-logo w-10 h-10 object-contain"
                      />
                      <h3 className="footer-title text-xl font-bold text-green-100">GCMT Herbal</h3>
                    </div>
                    <p className="footer-description text-green-200 text-sm leading-relaxed">
                      Your trusted partner for authentic Ayurvedic and herbal products.
                      Bringing nature's healing power to your doorstep with quality you can trust.
                    </p>
                    <div className="footer-socials flex space-x-4">
                      <a
                        href="https://www.instagram.com/gcmt.shop.official/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                      >
                        <Instagram className="footer-icon w-5 h-5 text-green-300" />
                      </a>
                    </div>
                  </div>

                  {/* Contact Info */}
          <div className="footer-contact space-y-4">
            <h4 className="footer-heading text-lg font-semibold text-green-100">Contact Us</h4>
            <div className="footer-contact-info space-y-3">
              <div className="footer-contact-item flex items-center space-x-3">
                <Phone className="footer-contact-icon w-4 h-4 text-green-300" />
                <span className="text-green-200 text-sm">+91 6355043113</span>
              </div>
              <div className="footer-contact-item flex items-center space-x-3">
                <Mail className="footer-contact-icon w-4 h-4 text-green-300" />
                <span className="text-green-200 text-sm">gcmtshop@gmail.com</span>
              </div>
              <div className="footer-contact-item flex items-start space-x-3">
                <MapPin className="footer-contact-icon w-4 h-4 text-green-300 mt-1" />
                <span className="text-green-200 text-sm">
                  Pratik Mall<br />
                  Kudasan, Gandhinagar<br />
                  Gujarat, India
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="footer-newsletter mt-12 pt-8 border-t border-green-800">
          <div className="footer-newsletter-box max-w-md mx-auto text-center">
            <h4 className="footer-heading text-lg font-semibold text-green-100 mb-4">Stay Updated</h4>
            <p className="footer-note text-green-200 text-sm mb-4">
              Subscribe to our newsletter for health tips and exclusive offers.
            </p>
            <div className="footer-form flex newsletter-form">
              <input
                type="email"
                placeholder="Enter your email"
                className="footer-input flex-1 px-4 py-2 rounded-l-md text-gray-800"
              />
              <button className="footer-button bg-green-600 hover:bg-green-500 px-6 py-2 rounded-r-md font-medium">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="footer-bottom bg-green-950 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="footer-bottom-content flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="footer-policies flex flex-wrap justify-center md:justify-end space-x-6">
              <a href="#/TnC" className="footer-link text-green-300 text-sm">All Required Policy</a>
            </div>
          </div>

          {/* Certifications */}
          <div className="footer-certifications mt-4 pt-4 border-t border-green-900">
            <div className="footer-cert-list flex flex-wrap justify-center items-center text-xs text-green-400">
              <span>✓ Herbal & Ayurverdic Products</span>
              <span>✓ Trusted Company for years</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
