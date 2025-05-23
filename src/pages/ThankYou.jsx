import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function ThankYouPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, items, shipping_address')
        .eq('razorpay_order_id', orderId)
        .single();
      if (error) console.error(error);
      else setOrder(data);
    };
    fetchOrder();
  }, [orderId]);

  const downloadInvoice = async () => {
    if (!order) return;
    setDownloading(true);
    try {
      const response = await fetch(`/api/download-invoice/${order.id}`);
      if (!response.ok) throw new Error('Failed to fetch invoice');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${order.id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to download invoice');
    }
    setDownloading(false);
  };

  if (!order) return <div>Loading your order…</div>;

  return (
    <div>
      <h1>Thank You!</h1>
      <p>Your payment is confirmed. Order ID: {order.id}</p>
      <h2>Order Summary</h2>
      <ul>
        {order.items.map(item => (
          <li key={item.product_id}>
            {item.product_id} — Qty: {item.quantity}
          </li>
        ))}
      </ul>
      <p>Total: ₹{order.total_amount}</p>
      <p>Shipping to: {order.shipping_address.full_name}, {order.shipping_address.address_line1}</p>

      <button onClick={downloadInvoice} disabled={downloading}>
        {downloading ? 'Downloading…' : 'Download Invoice PDF'}
      </button>
    </div>
  );
}
