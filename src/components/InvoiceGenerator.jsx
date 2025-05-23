import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/GCMT-logo.png'; // Place your company logo in public/assets or src/assets

const InvoiceGenerator = ({ order, userDetails, productList, shippingCharge = 0 }) => {
  const generatePDF = () => {
    const doc = new jsPDF();

    // Add Logo
    doc.addImage(logo, 'PNG', 10, 10, 40, 20);

    // Title and Order Info
    doc.setFontSize(16);
    doc.text('Invoice', 105, 20, null, null, 'center');

    doc.setFontSize(10);
    doc.text(`Order ID: ${order.id}`, 10, 40);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, 46);

    // Customer Info
    doc.text('Customer Details:', 10, 60);
    doc.text(`${userDetails.name}`, 10, 66);
    doc.text(`${userDetails.email}`, 10, 72);
    doc.text(`${userDetails.phone}`, 10, 78);
    doc.text(`${userDetails.street}, ${userDetails.city}, ${userDetails.state} - ${userDetails.pincode}`, 10, 84);

    // Products Table
    const tableData = productList.map((item, index) => [
      index + 1,
      item.name,
      item.quantity,
      `₹${item.unit_price.toFixed(2)}`,
      `₹${(item.quantity * item.unit_price).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 95,
      head: [['#', 'Product', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
    });

    // Totals
    const subtotal = productList.reduce((acc, item) => acc + item.quantity * item.unit_price, 0);
    const total = subtotal + shippingCharge;

    doc.setFontSize(11);
    doc.text(`Subtotal: ₹${subtotal.toFixed(2)}`, 140, doc.lastAutoTable.finalY + 10);
    doc.text(`Shipping: ₹${shippingCharge.toFixed(2)}`, 140, doc.lastAutoTable.finalY + 16);
    doc.text(`Total: ₹${total.toFixed(2)}`, 140, doc.lastAutoTable.finalY + 22);

    doc.save(`Invoice_${order.id}.pdf`);
  };

  return (
    <button onClick={generatePDF} className="btn btn-outline">
      Download Invoice
    </button>
  );
};

export default InvoiceGenerator;
