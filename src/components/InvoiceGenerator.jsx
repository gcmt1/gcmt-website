import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '../supabaseClient';
import { useAppContext } from '../AppContext';
import { useToast } from '../components/ToastContext';
import { Download, FileText, Calendar, User, MapPin, Phone, Mail } from 'lucide-react';
import logo from '../assets/GCMT-logo.png'; // Your company logo

const InvoiceGenerator = ({ 
  orderDetails = null, 
  customUserDetails = null, 
  isFromCart = false,
  onInvoiceGenerated = null 
}) => {
  const [cartItems, setCartItems] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [companyDetails] = useState({
    name: 'Gold Coin Multi Trade Pvt. Ltd.',
    address: 'Pratik Mall',
    city: 'Gandhinagar, Gujarat 382007',
    phone: '+91 79 1234 5678',
    email: 'gcmtshop@gmail.com',
    website: 'www.gcmtshop.com',
    gst: 'GST123456789',
  });
  
  const { user } = useAppContext();
  const { showToast } = useToast();

  // Generate unique invoice number only once
  const [generatedInvoiceNumber] = useState(() => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `INV-${year}${month}-${random}`;
  });

  // Fetch cart items and user details
  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (!isFromCart) return;
      
      setLoading(true);
      try {
        // Fetch cart items
        if (!user?.id) {
          const guestCart = JSON.parse(sessionStorage.getItem('guest_cart')) || [];
          setCartItems(guestCart);
        } else {
          const { data: cartData, error: cartError } = await supabase
            .from('cart_items')
            .select(`
              id,
              product_id,
              quantity,
              products (
                product_name,
                product_price,
                product_image,
                product_description
              )
            `)
            .eq('user_id', user.id);

          if (cartError) throw cartError;

          setCartItems(
            cartData.map(item => ({
              id: item.id,
              productId: item.product_id,
              name: item.products.product_name,
              price: item.products.product_price,
              image: item.products.product_image,
              description: item.products.product_description,
              quantity: item.quantity,
            }))
          );

          // Fetch user profile details
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (!profileError && profileData) {
            setUserDetails(profileData);
          } else {
            // Fallback to basic user info
            setUserDetails({
              full_name: user.email?.split('@')[0] || 'Guest User',
              email: user.email || '',
              phone: '',
              address: '',
              city: '',
              state: '',
              postal_code: ''
            });
          }
        }
      } catch (error) {
        console.error('Error fetching invoice data:', error);
        showToast('Failed to fetch invoice data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceData();
  }, [user?.id, isFromCart, showToast]);

  // Calculate totals
  const calculateSubtotal = () => {
    const items = isFromCart ? cartItems : (orderDetails?.items || []);
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTax = (subtotal) => {
    return subtotal * 0.18; // 18% GST
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 500 ? 0 : 50; // Free shipping above ₹500
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const shipping = calculateShipping();
    return subtotal + tax + shipping;
  };

  // Generate PDF Invoice
  const generatePDF = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // Colors
      const primaryColor = [79, 70, 229]; // Indigo
      const secondaryColor = [107, 114, 128]; // Gray
      const lightGray = [243, 244, 246];

      // Header Background
      doc.setFillColor(...lightGray);
      doc.rect(0, 0, pageWidth, 50, 'F');

      // Company Logo (if available)
      try {
        doc.addImage(logo, 'PNG', 15, 10, 30, 15);
      } catch (error) {
        console.warn('Logo not found, skipping...');
      }

      // Company Details
      doc.setFontSize(16);
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(companyDetails.name, 50, 18);
      
      doc.setFontSize(9);
      doc.setTextColor(...secondaryColor);
      doc.setFont('helvetica', 'normal');
      doc.text(companyDetails.address, 50, 24);
      doc.text(companyDetails.city, 50, 28);
      doc.text(`Phone: ${companyDetails.phone} | Email: ${companyDetails.email}`, 50, 32);
      doc.text(`GST: ${companyDetails.gst} | PAN: ${companyDetails.pan}`, 50, 36);

      // Invoice Title
      doc.setFontSize(24);
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text('INVOICE', pageWidth - 15, 25, { align: 'right' });

      // Invoice Details
      const invoiceNumber = orderDetails?.id || generatedInvoiceNumber;
      const invoiceDate = orderDetails?.created_at 
        ? new Date(orderDetails.created_at).toLocaleDateString('en-IN')
        : new Date().toLocaleDateString('en-IN');

      doc.setFontSize(10);
      doc.setTextColor(...secondaryColor);
      doc.setFont('helvetica', 'normal');
      doc.text(`Invoice #: ${invoiceNumber}`, pageWidth - 15, 32, { align: 'right' });
      doc.text(`Date: ${invoiceDate}`, pageWidth - 15, 37, { align: 'right' });
      doc.text(`Due Date: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}`, pageWidth - 15, 42, { align: 'right' });

      // Customer Details Section
      const customerDetails = customUserDetails || userDetails;
      const yStart = 65;

      doc.setFillColor(...lightGray);
      doc.rect(15, yStart - 5, pageWidth - 30, 35, 'F');

      doc.setFontSize(12);
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text('BILL TO:', 20, yStart + 5);

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      
      if (customerDetails) {
        doc.text(customerDetails.full_name || customerDetails.name || 'Guest Customer', 20, yStart + 12);
        doc.text(customerDetails.email || '', 20, yStart + 17);
        doc.text(customerDetails.phone || '', 20, yStart + 22);
        
        const address = [
          customerDetails.address,
          customerDetails.city,
          customerDetails.state,
          customerDetails.postal_code || customerDetails.pincode
        ].filter(Boolean).join(', ');
        
        if (address) {
          doc.text(address, 20, yStart + 27);
        }
      }

      // Items Table
      const items = isFromCart ? cartItems : (orderDetails?.items || []);
      const tableData = items.map((item, index) => [
        index + 1,
        item.name || item.product_name || 'Product',
        item.quantity || 1,
        `₹${(item.price || item.unit_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        `₹${((item.quantity || 1) * (item.price || item.unit_price || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
      ]);

      autoTable(doc, {
        startY: yStart + 40,
        head: [['S.No.', 'Product Description', 'Qty', 'Unit Price', 'Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: primaryColor,
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [50, 50, 50]
        },
        columnStyles: {
          0: { width: 20, halign: 'center' },
          1: { width: 80 },
          2: { width: 25, halign: 'center' },
          3: { width: 35, halign: 'right' },
          4: { width: 35, halign: 'right' }
        },
        margin: { left: 15, right: 15 },
        didDrawPage: (data) => {
          // Add page numbers
          doc.setFontSize(8);
          doc.setTextColor(...secondaryColor);
          doc.text(`Page ${data.pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }
      });

      // Totals Section
      const finalY = doc.lastAutoTable.finalY + 10;
      const subtotal = calculateSubtotal();
      const tax = calculateTax(subtotal);
      const shipping = calculateShipping();
      const total = calculateTotal();

      // Totals box
      doc.setFillColor(...lightGray);
      doc.rect(pageWidth - 80, finalY, 65, 45, 'F');

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      // Subtotal
      doc.text('Subtotal:', pageWidth - 75, finalY + 8);
      doc.text(`₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageWidth - 20, finalY + 8, { align: 'right' });

      // Tax
      doc.text('GST (18%):', pageWidth - 75, finalY + 16);
      doc.text(`₹${tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageWidth - 20, finalY + 16, { align: 'right' });

      // Shipping
      doc.text('Shipping:', pageWidth - 75, finalY + 24);
      doc.text(shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageWidth - 20, finalY + 24, { align: 'right' });

      // Total
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...primaryColor);
      doc.text('TOTAL:', pageWidth - 75, finalY + 36);
      doc.text(`₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageWidth - 20, finalY + 36, { align: 'right' });

      // Footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...secondaryColor);
      const footerY = pageHeight - 30;
      
      doc.text('Terms & Conditions:', 15, footerY);
      doc.text('• Payment is due within 30 days of invoice date', 15, footerY + 5);
      doc.text('• All prices are inclusive of applicable taxes', 15, footerY + 10);
      doc.text('• For any queries, please contact us at the above details', 15, footerY + 15);

      doc.text('Thank you for your business!', pageWidth / 2, footerY + 20, { align: 'center' });

      // Save PDF
      const fileName = `Invoice_${invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      showToast('Invoice downloaded successfully!', 'success');
      
      if (onInvoiceGenerated) {
        onInvoiceGenerated(fileName);
      }

    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('Failed to generate invoice', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Preview component
  const InvoicePreview = () => {
    const items = isFromCart ? cartItems : (orderDetails?.items || []);
    const customerDetails = customUserDetails || userDetails;
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const shipping = calculateShipping();
    const total = calculateTotal();

    return (
      <div className="bg-white p-6 border rounded-lg shadow-sm max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b">
          <div>
            <h1 className="text-2xl font-bold text-indigo-600 mb-2">{companyDetails.name}</h1>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{companyDetails.address}</p>
              <p>{companyDetails.city}</p>
              <p>Phone: {companyDetails.phone}</p>
              <p>Email: {companyDetails.email}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">INVOICE</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Invoice #: {generatedInvoiceNumber}</p>
              <p>Date: {new Date().toLocaleDateString('en-IN')}</p>
              <p>Due Date: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <User size={16} className="mr-2" />
            Bill To:
          </h3>
          {customerDetails && (
            <div className="text-sm text-gray-700 space-y-1">
              <p className="font-medium">{customerDetails.full_name || customerDetails.name || 'Guest Customer'}</p>
              <p className="flex items-center"><Mail size={14} className="mr-2" />{customerDetails.email}</p>
              {customerDetails.phone && <p className="flex items-center"><Phone size={14} className="mr-2" />{customerDetails.phone}</p>}
              {(customerDetails.address || customerDetails.city) && (
                <p className="flex items-start">
                  <MapPin size={14} className="mr-2 mt-0.5" />
                  {[customerDetails.address, customerDetails.city, customerDetails.state, customerDetails.postal_code || customerDetails.pincode]
                    .filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-indigo-600 text-white">
                <th className="border border-gray-300 px-4 py-2 text-left">S.No.</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Product</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Qty</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Unit Price</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                  <td className="border border-gray-300 px-4 py-2">{item.name || item.product_name}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    ₹{(item.price || item.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                    ₹{(item.quantity * (item.price || item.unit_price)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-80 bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18%):</span>
                <span>₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}</span>
              </div>
              <hr />
              <div className="flex justify-between font-bold text-lg text-indigo-600">
                <span>Total:</span>
                <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-sm text-gray-600 space-y-2 pt-6 border-t">
          <p className="font-semibold">Terms & Conditions:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Payment is due within 30 days of invoice date</li>
            <li>All prices are inclusive of applicable taxes</li>
            <li>For any queries, please contact us at the above details</li>
          </ul>
          <p className="text-center font-medium text-indigo-600 mt-4">Thank you for your business!</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={generatePDF}
          disabled={loading || (isFromCart && cartItems.length === 0)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Generating...
            </>
          ) : (
            <>
              <Download size={16} />
              Download Invoice
            </>
          )}
        </button>
      </div>

      {/* Preview (optional) */}
      {(cartItems.length > 0 || orderDetails) && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FileText size={20} className="mr-2" />
            Invoice Preview
          </h3>
          <InvoicePreview />
        </div>
      )}

      {/* Empty State */}
      {isFromCart && cartItems.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No items in cart to generate invoice</p>
        </div>
      )}
    </div>
  );
};

export default InvoiceGenerator;