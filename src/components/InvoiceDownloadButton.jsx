import jsPDF from "jspdf";
import "jspdf-autotable";

export default function InvoiceDownloadButton({ order }) {
  const generateInvoice = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Invoice", 14, 22);

    doc.setFontSize(12);
    doc.text(`Order ID: ${order.id}`, 14, 32);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 14, 40);
    doc.text(`Customer: ${order.customer_name}`, 14, 48);
    doc.text(`Email: ${order.customer_email}`, 14, 56);

    const items = order.items.map(item => [
      item.product_name,
      item.quantity,
      item.price,
      item.quantity * item.price
    ]);

    doc.autoTable({
      head: [["Product", "Qty", "Price", "Total"]],
      body: items,
      startY: 70,
    });

    const grandTotal = items.reduce((sum, row) => sum + row[3], 0);
    doc.text(`Grand Total: ₹${grandTotal.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 10);

    doc.save(`invoice-${order.id}.pdf`);
  };

  return (
    <button onClick={generateInvoice}>
      Download Invoice PDF
    </button>
  );
}
