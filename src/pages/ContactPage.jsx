import React from 'react';
import '../styles/ContactPage.css';

const ContactPage = () => {
  return (
    <div className="contact-page">
      <h1>Contact Us</h1>
      <form className="contact-form">
        <label>
          Name:
          <input type="text" name="name" required />
        </label>
        <label>
          Email:
          <input type="email" name="email" required />
        </label>
        <label>
          Message:
          <textarea name="message" rows="5" required></textarea>
        </label>
        <button type="submit">Send Message</button>
      </form>
    </div>
  );
};

export default ContactPage;
