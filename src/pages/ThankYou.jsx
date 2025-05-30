import React, { useState, useEffect } from 'react';
import { CheckCircle, Package, Truck, Mail, ArrowRight, Gift, Download, FileText, User, Calendar, CreditCard } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { useToast } from '../components/ToastContext';
import InvoiceGenerator from '../components/InvoiceGenerator';

const ThankYouPage = () => {
  const [showContent, setShowContent] = useState(false);
  const [showIcons, setShowIcons] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [showInvoiceSection, setShowInvoiceSection] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  
  const { user } = useAppContext();
  const { showToast } = useToast();

  // Generate order details
  useEffect(() => {
    // Simulate order details from localStorage or passed props
    const generateOrderDetails = () => {
      const orderData = JSON.parse(localStorage.getItem('latest_order') || '{}');
      const cartData = JSON.parse(sessionStorage.getItem('guest_cart') || '[]');
      
      // Generate order ID if not exists
      const orderId = orderData.id || `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Get customer details
      const customerInfo = {
        full_name: user?.user_metadata?.full_name || orderData.customer_name || 'Valued Customer',
        email: user?.email || orderData.customer_email || '',
        phone: orderData.customer_phone || '',
        address: orderData.shipping_address || '',
        city: orderData.shipping_city || '',
        state: orderData.shipping_state || '',
        postal_code: orderData.shipping_postal_code || ''
      };

      // Set order details
      const order = {
        id: orderId,
        created_at: new Date().toISOString(),
        status: 'confirmed',
        items: cartData.length > 0 ? cartData : orderData.items || [],
        total_amount: orderData.total_amount || 0,
        payment_method: orderData.payment_method || 'Online Payment'
      };

      setOrderDetails(order);
      setCustomerDetails(customerInfo);
      
      // Store order ID in localStorage for reference
      localStorage.setItem('latest_order_id', orderId);
    };

    generateOrderDetails();
  }, [user]);

  useEffect(() => {
    // Staggered animations
    const timer1 = setTimeout(() => setShowContent(true), 300);
    const timer2 = setTimeout(() => setShowIcons(true), 800);
    const timer3 = setTimeout(() => setShowButton(true), 1200);
    const timer4 = setTimeout(() => setShowInvoiceSection(true), 1600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  const handleContinueShopping = () => {
    // Clear cart and order data
    sessionStorage.removeItem('guest_cart');
    localStorage.removeItem('latest_order');
    window.location.href = '#/products';
  };

  const handleTrackOrder = () => {
    if (orderDetails?.id) {
      // Navigate to order tracking page or show modal
      showToast(`Tracking order ${orderDetails.id}`, 'info');
      // You can implement actual tracking logic here
    }
  };

  const handleInvoiceGenerated = (filename) => {
    showToast(`Invoice ${filename} downloaded successfully!`, 'success');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDeliveryDate = () => {
    const today = new Date();
    const deliveryDate = new Date(today.getTime() + (5 * 24 * 60 * 60 * 1000)); // 5 days from now
    return deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          >
            <div className="w-2 h-2 bg-green-200 rounded-full opacity-30"></div>
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto py-8">
        {/* Main Thank You Card */}
        <div className={`bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden mb-8 transition-all duration-1000 transform ${
          showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-100 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100 to-transparent rounded-full -ml-12 -mb-12"></div>

          {/* Success Icon with Pop Animation */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 transition-all duration-700 transform ${
              showContent ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
            }`}>
              <CheckCircle className="w-12 h-12 text-green-600 animate-bounce" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Thank You!
            </h1>
            
            <p className="text-xl text-gray-600 mb-2">
              Your order has been successfully placed
            </p>
            
            <p className="text-gray-500">
              Order confirmation has been sent to your email
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center">
                <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {'#ORD-LOADING'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {orderDetails?.created_at ? formatDate(orderDetails.created_at) : new Date().toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estimated Delivery</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {calculateDeliveryDate()}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            {customerDetails && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center mb-4">
                  <User className="w-5 h-5 text-gray-600 mr-2" />
                  <h3 className="font-semibold text-gray-800">Customer Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Name: </span>
                    <span className="font-medium">{customerDetails.full_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Email: </span>
                    <span className="font-medium">{customerDetails.email}</span>
                  </div>
                  {customerDetails.phone && (
                    <div>
                      <span className="text-gray-500">Phone: </span>
                      <span className="font-medium">{customerDetails.phone}</span>
                    </div>
                  )}
                  {orderDetails?.payment_method && (
                    <div className="flex items-center">
                      <CreditCard className="w-4 h-4 text-gray-500 mr-1" />
                      <span className="text-gray-500">Payment: </span>
                      <span className="font-medium ml-1">{orderDetails.payment_method}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Process Steps */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 transition-all duration-1000 delay-500 transform ${
            showIcons ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            {/* Step 1 */}
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 group-hover:bg-green-200 transition-colors duration-300">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Order Confirmed</h3>
              <p className="text-sm text-gray-600">Your order is being prepared</p>
              <div className="w-8 h-1 bg-green-500 mx-auto mt-2 rounded"></div>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4 group-hover:bg-yellow-200 transition-colors duration-300">
                <Package className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Processing</h3>
              <p className="text-sm text-gray-600">We're preparing your items</p>
              <div className="w-8 h-1 bg-yellow-300 mx-auto mt-2 rounded animate-pulse"></div>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                <Truck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Shipping Soon</h3>
              <p className="text-sm text-gray-600">Ready for delivery</p>
              <div className="w-8 h-1 bg-gray-300 mx-auto mt-2 rounded"></div>
            </div>
          </div>

          {/* Email Notification */}
          <div className="flex items-center justify-center bg-blue-50 rounded-xl p-4 mb-8">
            <Mail className="w-5 h-5 text-blue-600 mr-3" />
            <p className="text-blue-800">
              <span className="font-medium">Check your email</span> for order details and tracking information
            </p>
          </div>

          {/* Action Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-700 transform ${
            showButton ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <button
              onClick={handleContinueShopping}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center group"
            >
              Continue Shopping
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            
            <button 
              onClick={handleTrackOrder}
              className="flex-1 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-md"
            >
              Track Your Order
            </button>
          </div>

          {/* Footer Message */}
          <div className="text-center mt-8 pt-6 border-t border-gray-100">
            <p className="text-gray-500 text-sm">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@company.com" className="text-blue-600 hover:text-blue-700 font-medium">
                support@company.com
              </a>
            </p>
          </div>
        </div>

        {/* Invoice Generator Section */}
        <div className={`bg-white rounded-3xl shadow-xl p-8 transition-all duration-1000 delay-800 transform ${
          showInvoiceSection ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <Download className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Download Your Invoice</h2>
            <p className="text-gray-600">Get a professional invoice for your records</p>
          </div>

          {/* Invoice Generator Component */}
          {orderDetails && customerDetails ? (
          <div style={{ display: 'flex', gap: 12 }}>
            <InvoiceGenerator
              order={orderDetails}
              userDetails={customerDetails}
              productList={orderDetails.items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                unit_price: item.price || item.unit_price,
              }))}
              onInvoiceGenerated={handleInvoiceGenerated}
            />
          </div>
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-500">Loading order details...</p>
            </div>
          )}
        </div>

        {/* Order Summary Card */}
        {orderDetails?.items && orderDetails.items.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-8 mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Gift className="w-6 h-6 mr-2 text-purple-600" />
              Order Summary
            </h3>
            
            <div className="space-y-4">
              {orderDetails.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center">
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-12 h-12 rounded-lg object-cover mr-4"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      ₹{((item.price || item.unit_price) * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-500">
                      ₹{(item.price || item.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })} each
                    </p>
                  </div>
                </div>
              ))}
              
              {orderDetails.total_amount > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-800">Total Amount:</span>
                    <span className="text-xl font-bold text-indigo-600">
                      ₹{orderDetails.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Additional floating elements for visual appeal */}
      <div className="fixed -top-4 -right-4 w-8 h-8 bg-yellow-200 rounded-full opacity-60 animate-bounce pointer-events-none" style={{ animationDelay: '1s' }}></div>
      <div className="fixed -bottom-2 -left-2 w-6 h-6 bg-pink-200 rounded-full opacity-60 animate-bounce pointer-events-none" style={{ animationDelay: '2s' }}></div>
    </div>
  );
};

export default ThankYouPage;