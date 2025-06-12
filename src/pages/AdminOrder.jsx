import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import "../styles/AdminOrder.css";
import { Search, Filter, Calendar, Trash2, Eye, Package, CheckCircle, Clock, AlertCircle, Download, RefreshCw } from 'lucide-react';

export default function GoldOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState('ALL');
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      if (await checkAdmin()) {
        await loadOrders();
      }
    })();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, paymentFilter, dateRange]);

  const checkAdmin = async () => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      navigate('/login');
      return false;
    }

    const { data: profile, error: profileErr } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileErr || profile.role !== 'admin') {
      navigate('/');
      return false;
    }
    return true;
  };

  const loadOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, user_id, user_name, user_email, user_phone,
        address_line, city, state, postal_code, product_list,
        payment_id, payment_status, order_status, created_at, guest_identifier
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
      return;
    }

    setOrders(data || []);
    setLoading(false);
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm) ||
        order.payment_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(order => order.order_status === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== 'ALL') {
      filtered = filtered.filter(order => order.payment_status === paymentFilter);
    }

    // Date range filter
    if (dateRange !== 'ALL') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateRange) {
        case 'TODAY':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(order => new Date(order.created_at) >= filterDate);
          break;
        case 'WEEK':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(order => new Date(order.created_at) >= filterDate);
          break;
        case 'MONTH':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(order => new Date(order.created_at) >= filterDate);
          break;
      }
    }

    setFilteredOrders(filtered);
  };

  const handleDeleteOrder = async (orderId) => {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error('Error deleting order:', error);
      return;
    }

    setOrders(orders.filter(order => order.id !== orderId));
    setShowDeleteConfirm(false);
    setOrderToDelete(null);
  };

  const handleBulkDelete = async () => {
    if (selectedOrders.size === 0) return;

    const { error } = await supabase
      .from('orders')
      .delete()
      .in('id', Array.from(selectedOrders));

    if (error) {
      console.error('Error deleting orders:', error);
      return;
    }

    setOrders(orders.filter(order => !selectedOrders.has(order.id)));
    setSelectedOrders(new Set());
  };

  const toggleOrderSelection = (orderId) => {
    const newSelection = new Set(selectedOrders);
    if (newSelection.has(orderId)) {
      newSelection.delete(orderId);
    } else {
      newSelection.add(orderId);
    }
    setSelectedOrders(newSelection);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ order_status: newStatus })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status:', error);
      return;
    }

    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, order_status: newStatus } : order
    ));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle className="admin-status-icon" />;
      case 'PENDING': return <Clock className="admin-status-icon" />;
      case 'FAILED': return <AlertCircle className="admin-status-icon" />;
      default: return <Clock className="admin-status-icon" />;
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'PROCESSING': return 'admin-order-status-processing';
      case 'SHIPPED': return 'admin-order-status-shipped';
      case 'COMPLETED': return 'admin-order-status-completed';
      case 'CANCELLED': return 'admin-order-status-cancelled';
      default: return 'admin-order-status-default';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS': return 'admin-payment-status-success';
      case 'PENDING': return 'admin-payment-status-pending';
      case 'FAILED': return 'admin-payment-status-failed';
      default: return 'admin-payment-status-default';
    }
  };

  const groupOrdersByMonth = (orders) => {
    const grouped = {};
    orders.forEach(order => {
      const date = new Date(order.created_at);
      const monthYear = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(order);
    });
    return grouped;
  };

  const calculateTotalRevenue = (orders) => {
    return orders.reduce((total, order) => {
      if (order.payment_status === 'SUCCESS') {
        return total + order.product_list.reduce((sum, item) => sum + item.total_price, 0);
      }
      return total;
    }, 0);
  };

  const groupedOrders = groupOrdersByMonth(filteredOrders);
  const totalRevenue = calculateTotalRevenue(filteredOrders);

  if (loading) {
    return (
      <div className="admin-page-loading-container">
        <div className="admin-page-loading-content">
          <RefreshCw className="admin-page-loading-spinner" />
          <span className="admin-page-loading-text">Loading orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-root">
      {/* Header */}
      <div className="admin-page-header">
        <div className="admin-page-header-container">
          <div className="admin-page-header-content">
            <div>
              <h1 className="admin-page-main-title">Order Management</h1>
              <p className="admin-page-subtitle">
                {filteredOrders.length} orders • ₹{totalRevenue.toLocaleString()} revenue
              </p>
            </div>
            <div className="admin-page-header-actions">
              <button
                onClick={loadOrders}
                className="admin-page-refresh-btn"
              >
                <RefreshCw className="admin-page-btn-icon" />
                Refresh
              </button>
              {selectedOrders.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="admin-page-bulk-delete-btn"
                >
                  <Trash2 className="admin-page-btn-icon" />
                  Delete Selected ({selectedOrders.size})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-page-filters-wrapper">
        <div className="admin-page-filters-container">
          <div className="admin-page-filters-grid">
            {/* Search */}
            <div className="admin-page-search-wrapper">
              <Search className="admin-page-search-icon" />
              <input
                type="text"
                placeholder="Search orders, customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-page-search-input"
              />
            </div>

            {/* Order Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-page-filter-select"
            >
              <option value="ALL">All Statuses</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="admin-page-filter-select"
            >
              <option value="ALL">All Payments</option>
              <option value="SUCCESS">Successful</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>

            {/* Date Range */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="admin-page-filter-select"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="WEEK">Last Week</option>
              <option value="MONTH">Last Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders */}
      <div className="admin-page-orders-wrapper">
        {Object.keys(groupedOrders).length === 0 ? (
          <div className="admin-page-empty-state">
            <Package className="admin-page-empty-icon" />
            <h3 className="admin-page-empty-title">No orders found</h3>
            <p className="admin-page-empty-description">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          Object.entries(groupedOrders).map(([monthYear, monthOrders]) => (
            <div key={monthYear} className="admin-page-month-group">
              <div className="admin-page-month-header">
                <Calendar className="admin-page-month-icon" />
                <h2 className="admin-page-month-title">{monthYear}</h2>
                <span className="admin-page-month-badge">
                  {monthOrders.length} orders
                </span>
              </div>

              <div className="admin-page-orders-list">
                {monthOrders.map((order) => (
                  <div key={order.id} className="admin-page-order-card">
                    <div className="admin-page-order-content">
                      <div className="admin-page-order-main">
                        <input
                          type="checkbox"
                          checked={selectedOrders.has(order.id)}
                          onChange={() => toggleOrderSelection(order.id)}
                          className="admin-page-order-checkbox"
                        />
                        <div className="admin-page-order-details">
                          <div className="admin-page-order-header">
                            <h3 className="admin-page-order-id">
                              Order #{order.id}
                            </h3>
                            <span className={`admin-page-payment-badge ${getPaymentStatusColor(order.payment_status)}`}>
                              {getStatusIcon(order.payment_status)}
                              <span className="admin-page-badge-text">{order.payment_status}</span>
                            </span>
                            <span className={`admin-page-order-badge ${getOrderStatusColor(order.order_status)}`}>
                              {order.order_status}
                            </span>
                          </div>

                          <div className="admin-page-order-info-grid">
                            <div>
                              <p className="admin-page-customer-name">{order.user_name}</p>
                              <p className="admin-page-customer-email">{order.user_email}</p>
                              <p className="admin-page-customer-phone">📞 {order.user_phone}</p>
                            </div>
                            <div>
                              <p className="admin-page-address-line">{order.address_line}</p>
                              <p className="admin-page-address-location">{order.city}, {order.state} - {order.postal_code}</p>
                            </div>
                            <div>
                              <p className="admin-page-items-label">Items:</p>
                              {order.product_list.slice(0, 2).map((item, idx) => (
                                <p key={idx} className="admin-page-item-details">
                                  {item.name} × {item.quantity} = ₹{item.total_price}
                                </p>
                              ))}
                              {order.product_list.length > 2 && (
                                <p className="admin-page-items-more">+{order.product_list.length - 2} more</p>
                              )}
                            </div>
                          </div>

                          <div className="admin-page-order-footer">
                            <div className="admin-page-order-meta">
                              <span>{new Date(order.created_at).toLocaleDateString()}</span>
                              <span>Payment ID: {order.payment_id || '—'}</span>
                              {!order.user_id && (
                                <span>Guest: {order.guest_identifier}</span>
                              )}
                            </div>
                            <div className="admin-page-order-total">
                              Total: ₹{order.product_list.reduce((sum, item) => sum + item.total_price, 0)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="admin-page-order-actions">
                        <select
                          value={order.order_status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="admin-page-status-dropdown"
                        >
                          <option value="PROCESSING">Processing</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                        <button
                          onClick={() => {
                            setOrderToDelete(order.id);
                            setShowDeleteConfirm(true);
                          }}
                          className="admin-page-delete-btn"
                        >
                          <Trash2 className="admin-page-delete-icon" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="admin-page-modal-overlay">
          <div className="admin-page-modal-content">
            <h3 className="admin-page-modal-title">Confirm Delete</h3>
            <p className="admin-page-modal-description">
              Are you sure you want to delete order #{orderToDelete}? This action cannot be undone.
            </p>
            <div className="admin-page-modal-actions">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setOrderToDelete(null);
                }}
                className="admin-page-modal-cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteOrder(orderToDelete)}
                className="admin-page-modal-confirm-btn"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}