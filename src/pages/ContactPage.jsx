import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import '../styles/ContactPage.css';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

const ContactPage = () => {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    phone: '',
    message: '' 
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.from('contact_messages').insert([form]);
      
      if (error) {
        console.error('Error submitting message:', error);
        setStatus({ 
          type: 'error', 
          message: 'Failed to send message. Please try again later.' 
        });
      } else {
        setStatus({ 
          type: 'success', 
          message: 'Thank you! Your message has been sent successfully. We will get back to you shortly.' 
        });
        setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setStatus({ 
        type: 'error', 
        message: 'An unexpected error occurred. Please try again later.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page-container">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p className="contact-subtitle">We're here to help with any questions about our products or services</p>
      </div>

      <div className="contact-content">
        <div className="contact-info-panel">
          <div className="company-info">
            <h2>Get In Touch</h2>
            <p>Our customer support team is available Monday through Friday to answer your questions.</p>
          </div>
          
          <div className="contact-details">
            <div className="contact-item">
              <Mail className="contact-icon" size={20} />
              <div>
                <h3>Email Us</h3>
                <p>gcmtshop@gmail.com</p>
              </div>
            </div>
            
            <div className="contact-item">
              <Phone className="contact-icon" size={20} />
              <div>
                <h3>Call Us</h3>
                <p>+91 6355043113</p>
              </div>
            </div>
            
            <div className="contact-item">
              <MapPin className="contact-icon" size={20} />
              <div>
                <h3>Visit Us</h3>
                <p>Pratik Mall<br />Kudasan, Gandhinagar, Gujarat</p>
              </div>
            </div>
            
            <div className="contact-item">
              <Clock className="contact-icon" size={20} />
              <div>
                <h3>Business Hours</h3>
                <p>Monday - Friday: 9:00 AM - 6:00 PM<br />Saturday: 10:00 AM - 4:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-form-panel">
          <h2>Send Us a Message</h2>
          
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your Full Name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 0000000000"
                />
              </div>
              
              <div className="form-group">
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Please provide details about your inquiry..."
                rows="6"
                required
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              className={`submit-button ${loading ? 'loading' : ''}`} 
              disabled={loading}
            >
              {loading ? (
                <>Sending<span className="loading-dots">...</span></>
              ) : (
                <>Send Message <Send size={16} /></>
              )}
            </button>
          </form>
          
          {status.message && (
            <div className={`form-status ${status.type}`}>
              {status.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;