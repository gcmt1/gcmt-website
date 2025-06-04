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

  // FIXED: Improved CCAvenue payment initiation with hardcoded values for testing
  const handlePayment = async () => {
    if (!savedOrderId) {
      showToast('Please save contact info before proceeding to payment.', 'error');
      return;
    }

    setLoading(true);
    let result; // Make result accessible in catch block
    try {
      // Ensure proper order ID format - make it simpler for testing
      const orderId = `ORD${savedOrderId}${Date.now().toString().slice(-6)}`;
      
      // HARDCODED VALUES FOR TESTING - Replace with your actual credentials
      const MERCHANT_ID = '4311301'; // Your actual merchant ID
      const ACCESS_CODE = 'AVNS75ME47CK48SNKC'; // Your actual access code
      // NOTE: Working key should be in your backend, not here
      
      const requestBody = {
        merchant_id: MERCHANT_ID,
        order_id: orderId,
        amount: total.toFixed(2),
        currency: 'INR',
        // Use hardcoded URLs for testing - replace with your actual domain
        redirect_url: 'https://gcmtshop.com/payment-success',
        cancel_url: 'https://gcmtshop.com/payment-cancel',
        language: 'EN',
        billing_name: formData.name.trim(),
        billing_address: formData.street.trim(),
        billing_city: formData.city.trim(),
        billing_state: formData.state.trim(),
        billing_zip: formData.pincode.trim(),
        billing_country: 'India',
        billing_tel: formData.phone.trim(),
        billing_email: formData.email.trim().toLowerCase(),
        delivery_name: formData.name.trim(),
        delivery_address: formData.street.trim(),
        delivery_city: formData.city.trim(),
        delivery_state: formData.state.trim(),
        delivery_zip: formData.pincode.trim(),
        delivery_country: 'India',
        delivery_tel: formData.phone.trim(),
        // Simplified merchant parameters
        merchant_param1: savedOrderId.toString(),
        merchant_param2: 'test_transaction',
        merchant_param3: new Date().toISOString(),
      };

      console.log('🚀 Sending payment request with hardcoded values:', requestBody);

      // Try direct backend call first with detailed logging
      console.log('📡 Making request to backend...');
      const response = await fetch('https://gcmtshop-cca-backend.vercel.app/api/createOrder', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; GCMT-Shop/1.0)',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend error response:', errorText);
        
        // Try to parse error as JSON if possible
        try {
          const errorJson = JSON.parse(errorText);
          console.error('❌ Parsed error:', errorJson);
        } catch {
          console.error('❌ Raw error text:', errorText);
        }
        
        throw new Error(`Backend error: ${response.status} ${response.statusText}`);
      }

      result = await response.json();
      console.log('✅ Backend response:', result);

      // ENHANCED validation with more specific checks
      if (!result) {
        throw new Error('Empty response from backend');
      }
      
      if (!result.encRequest) {
        console.error('❌ No encRequest in response:', result);
        throw new Error('No encrypted request in backend response');
      }
      
      if (typeof result.encRequest !== 'string') {
        console.error('❌ encRequest is not a string:', typeof result.encRequest, result.encRequest);
        throw new Error('Encrypted request is not a string');
      }
      
      if (result.encRequest.trim().length === 0) {
        console.error('❌ Empty encRequest received');
        throw new Error('Empty encrypted request received');
      }

      // Check for common encryption issues
      if (result.encRequest.includes('error') || result.encRequest.includes('Error')) {
        console.error('❌ Error in encRequest:', result.encRequest);
        throw new Error('Backend returned error in encrypted request');
      }

      console.log('🔐 encRequest validation passed:');
      console.log('  Length:', result.encRequest.length);
      console.log('  First 100 chars:', result.encRequest.substring(0, 100));
      console.log('  Last 50 chars:', result.encRequest.substring(result.encRequest.length - 50));

      // Submit to CCAvenue with hardcoded access code
      await submitToCCAvenue(result.encRequest, orderId, 'AVNS75ME47CK48SNKC');

    } catch (err) {
      console.error('💥 Payment error:', err);
      showToast(`Payment initiation failed: ${err.message}`, 'error');
      
      // Fallback option - show manual form for debugging
      if (err.message.includes('Form submission')) {
        console.log('🔄 Offering manual form submission as fallback...');
        showManualSubmissionForm(result?.encRequest, 'AVNS75ME47CK48SNKC');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fallback: Manual form submission for debugging
  const showManualSubmissionForm = (encRequest, accessCode) => {
    if (!encRequest) return;
    
    const fallbackContainer = document.createElement('div');
    fallbackContainer.innerHTML = `
      <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                  background: white; padding: 20px; border: 2px solid #ccc; z-index: 10000;">
        <h3>Manual CCAvenue Submission (Debug Mode)</h3>
        <p>Automatic submission failed. Click below to proceed manually:</p>
        <form method="POST" action="https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction" target="_blank">
          <input type="hidden" name="encRequest" value="${encRequest}" />
          <input type="hidden" name="access_code" value="${accessCode}" />
          <button type="submit" style="padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer;">
            Proceed to CCAvenue
          </button>
          <button type="button" onclick="this.parentElement.parentElement.remove()" 
                  style="padding: 10px 20px; background: #dc3545; color: white; border: none; cursor: pointer; margin-left: 10px;">
            Cancel
          </button>
        </form>
        <small>Debug Info: encRequest length = ${encRequest.length}</small>
      </div>
    `;
    document.body.appendChild(fallbackContainer);
  };

  // FIXED: Enhanced CCAvenue form submission with proper encoding
  const submitToCCAvenue = (encRequest, orderId, accessCode) => {
    return new Promise((resolve, reject) => {
      console.log('🚀 Submitting to CCAvenue with valid encRequest...');
      
      try {
        // Validate the encrypted request format
        if (!encRequest || typeof encRequest !== 'string') {
          throw new Error('Invalid encrypted request for submission');
        }

        if (!accessCode || typeof accessCode !== 'string') {
          throw new Error('Invalid access code for submission');
        }

        // Use the encrypted request exactly as received (don't clean it)
        console.log('🔐 Using encRequest exactly as received:');
        console.log('  Length:', encRequest.length);
        console.log('  First 50 chars:', encRequest.substring(0, 50));

        // Create a more robust form submission
        const submitForm = () => {
          // Remove any existing forms first
          const existingForms = document.querySelectorAll('form[data-ccavenue="true"]');
          existingForms.forEach(form => form.remove());

          // Create new form
          const form = document.createElement('form');
          form.setAttribute('data-ccavenue', 'true');
          form.method = 'POST';  // CCAvenue prefers uppercase
          form.action = 'https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction';
          form.acceptCharset = 'UTF-8';
          form.enctype = 'application/x-www-form-urlencoded';
          form.style.display = 'none';
          
          // Create encRequest input
          const encInput = document.createElement('input');
          encInput.type = 'hidden';
          encInput.name = 'encRequest';
          encInput.value = encRequest; // Use exactly as received
          form.appendChild(encInput);
          
          // Create access_code input
          const accessCodeInput = document.createElement('input');
          accessCodeInput.type = 'hidden';
          accessCodeInput.name = 'access_code';
          accessCodeInput.value = accessCode;
          form.appendChild(accessCodeInput);
          
          console.log('📝 Form created with:');
          console.log('  Action:', form.action);
          console.log('  Method:', form.method);
          console.log('  Encoding:', form.enctype);
          console.log('  encRequest length:', encInput.value.length);
          console.log('  access_code:', accessCodeInput.value);
          
          // Append to document body
          document.body.appendChild(form);
          
          // Validate form before submission
          const isValid = form.checkValidity();
          console.log('📋 Form validation result:', isValid);
          
          // Log all form data
          console.log('📋 Form data being submitted:');
          const formData = new FormData(form);
          for (let [key, value] of formData.entries()) {
            if (key === 'encRequest') {
              console.log(`  ${key}: [${value.length} chars] ${value.substring(0, 30)}...`);
            } else {
              console.log(`  ${key}: ${value}`);
            }
          }
          
          // Submit the form
          console.log('🚀 Submitting form to CCAvenue now...');
          
          try {
            form.submit();
            console.log('✅ Form submitted successfully to CCAvenue');
            
            // Show user feedback
            const submitButton = document.querySelector('.btn-success');
            if (submitButton) {
              submitButton.textContent = 'Redirecting to CCAvenue...';
              submitButton.disabled = true;
            }
            
            resolve();
          } catch (submitError) {
            console.error('❌ Form submission failed:', submitError);
            reject(submitError);
          }
          
          // Cleanup after a longer delay
          setTimeout(() => {
            const formToRemove = document.querySelector('form[data-ccavenue="true"]');
            if (formToRemove && document.body.contains(formToRemove)) {
              document.body.removeChild(formToRemove);
              console.log('🧹 Form cleaned up');
            }
          }, 15000);
        };

        // Execute form submission immediately
        submitForm();
        
      } catch (error) {
        console.error('❌ Form preparation error:', error);
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