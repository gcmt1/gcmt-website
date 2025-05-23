import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAppContext } from '../AppContext';
import { useToast } from '../components/ToastContext';
import { useNavigate } from 'react-router-dom';
import InvoiceDownloadButton from '../components/InvoiceDownloadButton';
import '../styles/CheckOut.css';
import InvoiceGenerator from '../components/InvoiceGenerator';

export default function Checkout() {
  const { user } = useAppContext();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [loading, setLoading] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);
  const [savedOrderId, setSavedOrderId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    const fetchCart = async () => {
      setLoadingCart(true);
      try {
        if (!user?.id) {
          const guestCart = JSON.parse(sessionStorage.getItem('guest_cart')) || [];
          setCartItems(guestCart);
        } else {
          const { data, error } = await supabase
            .from('cart_items')
            .select(`
              id,
              product_id,
              quantity,
              products (product_name, product_price, product_image)
            `)
            .eq('user_id', user.id);

          if (error) throw error;

          const formattedCart = data.map(item => ({
            id: item.id,
            productId: item.product_id,
            name: item.products.product_name,
            price: item.products.product_price,
            image: item.products.product_image,
            quantity: item.quantity,
          }));

          setCartItems(formattedCart);
        }
      } catch (err) {
        console.error('Fetch cart error:', err.message);
        showToast('Failed to load cart', 'error');
      } finally {
        setLoadingCart(false);
      }
    };

    fetchCart();
  }, [user?.id, showToast]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const requiredFields = ['name', 'email', 'phone', 'street', 'city', 'state', 'pincode'];
    for (const field of requiredFields) {
      if (!formData[field]?.trim()) {
        alert(`Please fill out the ${field} field.`);
        return false;
      }
    }
    return true;
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0;
  const total = subtotal + shipping;

  const formatCurrency = amount =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const handleSaveContactInfo = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const product_list = cartItems.map(item => ({
        product_id: item.productId,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const { data, error } = await supabase
        .from('orders')
        .insert([{
          user_id: user?.id || null,
          user_name: formData.name,
          user_email: formData.email,
          user_phone: formData.phone,
          address_line: formData.street,
          city: formData.city,
          state: formData.state,
          postal_code: formData.pincode,
          product_list,
          total_amount: total,
          payment_status: 'PENDING',
          order_status: 'PROCESSING',
        }])
        .select('id')
        .single();

      if (error) throw error;

      setSavedOrderId(data.id);
      setContactSaved(true);
      showToast('Contact info saved! You may now proceed to payment.', 'success');
    } catch (err) {
      console.error('Save contact info error:', err.message);
      showToast('Failed to save contact info', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!contactSaved || !savedOrderId) {
      alert('Please submit your contact information first.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/createOrder`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: savedOrderId }),
        }
      );

      if (!res.ok) throw new Error('Failed to initiate payment with CCAvenue.');

      const html = await res.text();
      const paymentWindow = window.open('', '_blank');
      if (paymentWindow) {
        paymentWindow.document.open();
        paymentWindow.document.write(html);
        paymentWindow.document.close();
      } else {
        alert('Popup blocked! Please allow popups to proceed with payment.');
      }
    } catch (err) {
      console.error('CCAvenue payment error:', err);
      alert('Payment initiation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-wrapper">
        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-card">
          <h2 className="checkout-card-title">Shipping Information</h2>
          <div className="checkout-card-body">
            {Object.keys(formData).map(field => (
              <div key={field} className="form-group">
                <label className="form-label">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="form-input"
                  disabled={contactSaved}
                />
              </div>
            ))}
            <button
              onClick={handleSaveContactInfo}
              disabled={loading || contactSaved}
              className={`btn btn-primary ${contactSaved ? 'btn-disabled' : ''}`}
            >
              {contactSaved ? 'Contact Info Saved' : 'Submit Contact Info'}
            </button>
          </div>
        </div>

        <div className="checkout-card">
          <h2 className="checkout-card-title">Order Summary</h2>
          <div className="checkout-card-body">
            {loadingCart ? (
              <p>Loading cart…</p>
            ) : cartItems.length ? (
              <ul className="order-summary-list">
                {cartItems.map(item => (
                  <li key={item.id} className="order-summary-item">
                    <div className="order-item-details">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="order-item-image" />
                      )}
                      <div>
                        <div className="order-item-name">{item.name}</div>
                        <div className="order-item-quantity">Qty: {item.quantity}</div>
                      </div>
                    </div>
                    <div className="order-item-price">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No items in cart</p>
            )}
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
            </div>
            <div className="summary-row summary-row-total">
              <strong>Total</strong>
              <strong>{formatCurrency(total)}</strong>
            </div>
          </div>
        </div>

        <div className="checkout-actions">
          <button onClick={() => navigate('/cart')} className="btn btn-outline">
            Return to Cart
          </button>
          <div style={{ display: 'flex', gap: 12 }}>
            <InvoiceGenerator
              order={{ id: savedOrderId }}
              userDetails={formData}
              productList={cartItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                unit_price: item.price,
              }))}
            />
            <button
              onClick={handlePayment}
              disabled={loading || !cartItems.length || !contactSaved}
              className="btn btn-primary btn-lg"
            >
              {loading ? 'Processing…' : `Pay Now: ${formatCurrency(total)}`}
            </button>
          </div>
        </div>

        <div className="security-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" />
          </svg>
          <span>100% Secure Payment</span>
        </div>
      </div>
    </div>
  );
}