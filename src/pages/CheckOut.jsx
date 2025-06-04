import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAppContext } from '../AppContext';
import { useToast } from '../components/ToastContext';
import { useNavigate } from 'react-router-dom';
import InvoiceGenerator from '../components/InvoiceGenerator';
import '../styles/CheckOut.css';

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

  // Fetch cart (guest or logged-in)
  useEffect(() => {
    async function fetchCart() {
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

          setCartItems(
            data.map(item => ({
              id: item.id,
              productId: item.product_id,
              name: item.products.product_name,
              price: item.products.product_price,
              image: item.products.product_image,
              quantity: item.quantity,
            }))
          );
        }
      } catch (err) {
        console.error('Fetch cart error:', err.message);
        showToast('Failed to load cart', 'error');
      } finally {
        setLoadingCart(false);
      }
    }
    fetchCart();
  }, [user?.id, showToast]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validate shipping/contact form
  const validateForm = () => {
    const requiredFields = ['name', 'email', 'phone', 'street', 'city', 'state', 'pincode'];
    for (let field of requiredFields) {
      if (!formData[field]?.trim()) {
        showToast(`Please fill out the ${field} field.`, 'error');
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast('Please enter a valid email address.', 'error');
      return false;
    }

    // Phone validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      showToast('Please enter a valid 10-digit phone number.', 'error');
      return false;
    }

    // Pincode validation (6 digits)
    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(formData.pincode)) {
      showToast('Please enter a valid 6-digit pincode.', 'error');
      return false;
    }

    return true;
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = 0;
  const total = subtotal + shipping;
  const fmt = (amt) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amt);

  // Clear cart after successful payment
  const clearCart = React.useCallback(async () => {
    try {
      if (user?.id) {
        await supabase.from('cart_items').delete().eq('user_id', user.id);
      } else {
        sessionStorage.removeItem('guest_cart');
      }
      setCartItems([]);
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  }, [user?.id]);

  // Save contact info + create order record in Supabase
  const handleSaveContactInfo = async () => {
    if (!validateForm()) return;

    if (cartItems.length === 0) {
      showToast('Your cart is empty. Add items before checkout.', 'error');
      return;
    }

    setLoading(true);
    try {
      const product_list = cartItems.map((i) => ({
        product_id: i.productId,
        name: i.name,
        quantity: i.quantity,
        unit_price: i.price,
        total_price: i.price * i.quantity,
      }));

      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user?.id || null,
            user_name: formData.name.trim(),
            user_email: formData.email.trim().toLowerCase(),
            user_phone: formData.phone.trim(),
            address_line: formData.street.trim(),
            city: formData.city.trim(),
            state: formData.state.trim(),
            postal_code: formData.pincode.trim(),
            product_list,
            total_amount: total,
            payment_status: 'PENDING',
            order_status: 'PROCESSING',
            created_at: new Date().toISOString(),
          },
        ])
        .select('id')
        .single();

      if (error) throw error;

      setSavedOrderId(data.id);
      setContactSaved(true);
      showToast('Contact info saved! You may now proceed to payment.', 'success');
    } catch (err) {
      console.error('Save contact info error:', err.message);
      showToast('Failed to save contact info. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Improved CCAvenue payment initiation
  const handlePayment = async () => {
    if (!savedOrderId) {
      showToast('Please save contact info before proceeding to payment.', 'error');
      return;
    }

    setLoading(true);
    try {
      // Create a simple, unique order ID
      const orderId = `ORD${savedOrderId}`;
      setSavedOrderId(orderId); // Store it as the identifier used by CCAvenue
      
      const MERCHANT_ID = '4311301';
      const ACCESS_CODE = 'AVNS75ME47CK48SNKC';
      
      // Simplified request body matching your Postman test
      const requestBody = {
        merchant_id: MERCHANT_ID,
        order_id: orderId,
        amount: total.toFixed(2),
        currency: 'INR',
        redirect_url: 'https://gcmtshop.com/payment-success',
        cancel_url: 'https://gcmtshop.com/payment-cancel',
        language: 'EN',
        // Add essential billing info (CCAvenue often requires these)
        billing_name: formData.name.trim(),
        billing_address: formData.street.trim(),
        billing_city: formData.city.trim(),
        billing_state: formData.state.trim(),
        billing_zip: formData.pincode.trim(),
        billing_country: 'India',
        billing_tel: formData.phone.trim(),
        billing_email: formData.email.trim().toLowerCase(),
        // Keep merchant params simple
        merchant_param1: savedOrderId.toString(),
      };

      console.log('🚀 Payment request:', requestBody);

      const response = await fetch('https://gcmtshop-cca-backend.vercel.app/api/createOrder', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend error:', errorText);
        throw new Error(`Backend error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Backend response:', result);

      // Save debug info to localStorage
      localStorage.setItem('ccavenue_debug', JSON.stringify({ requestBody, backendResponse: result }));

      if (!result.encRequest || typeof result.encRequest !== 'string' || result.encRequest.trim().length === 0) {
        throw new Error('Invalid or empty encrypted request received from backend');
      }

      console.log('🔐 Encrypted request length:', result.encRequest.length);

      // Submit to CCAvenue
      await submitToCCAvenue(result.encRequest, ACCESS_CODE);

    } catch (err) {
      console.error('💥 Payment error:', err);
      showToast(`Payment initiation failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };


  // FIXED: Simplified and more reliable CCAvenue form submission
const submitToCCAvenue = (encRequest, accessCode) => {
  return new Promise((resolve, reject) => {
    try {
      // Clean up previous form if any
      const existingForm = document.querySelector('form[data-ccavenue-form="true"]');
      if (existingForm) existingForm.remove();

      // Create a fresh form
      const form = document.createElement('form');
      form.setAttribute('data-ccavenue-form', 'true');
      form.method = 'POST';
      form.action = 'https://secure.ccavenue.com/transaction/initTrans';
      form.style.display = 'none';

      // Add encRequest
      const encInput = document.createElement('input');
      encInput.type = 'hidden';
      encInput.name = 'encRequest';
      encInput.value = encRequest.trim();

      // Add access_code
      const accessInput = document.createElement('input');
      accessInput.type = 'hidden';
      accessInput.name = 'access_code';
      accessInput.value = accessCode.trim();

      // Append inputs
      form.appendChild(encInput);
      form.appendChild(accessInput);
      document.body.appendChild(form);

      console.log("🔐 Submitting encrypted form to CCAvenue...");
      console.log("encRequest length:", encInput.value.length);
      console.log("access_code:", accessInput.value);

      form.submit();
      resolve();

    } catch (error) {
      console.error('❌ Error submitting to CCAvenue:', error);
      reject(error);
    }
  });
};

  // Listen for payment completion messages
  useEffect(() => {
    const handlePaymentMessage = (event) => {
      console.log('📨 Received message:', event);
      
      // Only accept messages from your domain or CCAvenue
      if (
        event.origin !== window.location.origin &&
        !event.origin.includes('ccavenue.com')
      ) {
        console.log('🚫 Rejected message from:', event.origin);
        return;
      }

      if (event.data && event.data.type === 'PAYMENT_COMPLETE') {
        const { success, orderId } = event.data;
        console.log('💳 Payment complete:', { success, orderId, savedOrderId });
        
        if (success && orderId === savedOrderId) {
          clearCart();
          showToast('Payment successful! Order placed.', 'success');
          navigate(`/order-confirmation/${orderId}`);
        } else {
          showToast('Payment failed. Please try again.', 'error');
        }
      }
    };

    window.addEventListener('message', handlePaymentMessage);
    return () => window.removeEventListener('message', handlePaymentMessage);
  }, [savedOrderId, navigate, showToast, clearCart]);

  return (
    <div className="checkout-container">
      <div className="checkout-wrapper">
        <h1 className="checkout-title">Checkout</h1>

        {/* Shipping Info */}
        <div className="checkout-card">
          <h2>Shipping Information</h2>
          <div className="checkout-card-body">
            {Object.keys(formData).map((field) => (
              <div key={field} className="form-group">
                <label>
                  {field.charAt(0).toUpperCase() +
                    field.slice(1).replace(/([A-Z])/g, ' $1')}
                  {[
                    'name',
                    'email',
                    'phone',
                    'street',
                    'city',
                    'state',
                    'pincode',
                  ].includes(field) && ' *'}
                </label>
                <input
                  type={
                    field === 'email'
                      ? 'email'
                      : field === 'phone'
                      ? 'tel'
                      : 'text'
                  }
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  disabled={contactSaved}
                  className="form-input"
                  placeholder={
                    field === 'phone'
                      ? '10-digit mobile number'
                      : field === 'pincode'
                      ? '6-digit postal code'
                      : field === 'email'
                      ? 'your@email.com'
                      : ''
                  }
                  maxLength={
                    field === 'phone'
                      ? '10'
                      : field === 'pincode'
                      ? '6'
                      : undefined
                  }
                />
              </div>
            ))}
            <button
              onClick={handleSaveContactInfo}
              disabled={loading || contactSaved}
              className={`btn btn-primary ${
                contactSaved ? 'btn-disabled' : ''
              }`}
            >
              {loading
                ? 'Saving...'
                : contactSaved
                ? 'Contact Info Saved ✓'
                : 'Submit Contact Info'}
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="checkout-card">
          <h2>Order Summary</h2>
          <div className="checkout-card-body">
            {loadingCart ? (
              <p>Loading cart…</p>
            ) : cartItems.length ? (
              <ul className="order-summary-list">
                {cartItems.map((item, index) => (
                  <li
                    key={item.id || index}
                    className="order-summary-item"
                  >
                    <div className="order-item-details">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="order-item-image"
                        />
                      )}
                      <div>
                        <div>{item.name}</div>
                        <div>Qty: {item.quantity}</div>
                      </div>
                    </div>
                    <div>{fmt(item.price * item.quantity)}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No items in cart</p>
            )}
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{fmt(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : fmt(shipping)}</span>
            </div>
            <div className="summary-row summary-row-total">
              <strong>Total</strong>
              <strong>{fmt(total)}</strong>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="checkout-actions">
          <button
            onClick={() => navigate('/cart')}
            className="btn btn-outline"
          >
            Return to Cart
          </button>
          <button
            onClick={handlePayment}
            disabled={
              !contactSaved || loading || cartItems.length === 0
            }
            className="btn btn-success"
          >
            {loading ? 'Processing...' : `Pay ${fmt(total)} with CCAvenue`}
          </button>
        </div>

        {/* Invoice Preview */}
        {contactSaved && savedOrderId && (
          <InvoiceGenerator
            orderId={savedOrderId}
            cartItems={cartItems}
            contactInfo={formData}
            totalAmount={total}
          />
        )}
      </div>
    </div>
  );
}