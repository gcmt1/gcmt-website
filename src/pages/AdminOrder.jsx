import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import "../styles/AdminOrder.css";
import { 
  Search, Filter, Calendar, Trash2, Eye, Package, CheckCircle, Clock, 
  AlertCircle, Download, RefreshCw, X, Save, ArrowLeft, ChevronDown,
  Edit3, Truck, PackageCheck, XCircle, MoreHorizontal, User, MapPin,
  Phone, Mail, CreditCard, Hash
} from 'lucide-react';

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
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(new Set());
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [notification, setNotification] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
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

  // Auto-hide notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

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
      showNotification('Failed to load orders', 'error');
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
        order.payment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user_phone?.includes(searchTerm) ||
        order.city?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const toggleOrderExpansion = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setEditingOrder({ ...order });
    setShowOrderDetails(true);
  };

  const handleCloseDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
    setEditingOrder(null);
    setIsViewMode(false); // Reset view mode
  };

  const handleSaveOrderChanges = async () => {
    if (!editingOrder) return;

    setStatusUpdateLoading(prev => new Set([...prev, editingOrder.id]));

    const { error } = await supabase
      .from('orders')
      .update({
        order_status: editingOrder.order_status,
        user_name: editingOrder.user_name,
        user_email: editingOrder.user_email,
        user_phone: editingOrder.user_phone,
        address_line: editingOrder.address_line,
        city: editingOrder.city,
        state: editingOrder.state,
        postal_code: editingOrder.postal_code
      })
      .eq('id', editingOrder.id);

    if (error) {
      console.error('Error updating order:', error);
      showNotification('Failed to update order', 'error');
      setStatusUpdateLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(editingOrder.id);
        return newSet;
      });
      return;
    }

    // Update all related states consistently
    const updatedOrder = { ...editingOrder };
    
    // Update orders array
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === editingOrder.id ? updatedOrder : order
      )
    );

    // Update selectedOrder
    setSelectedOrder(updatedOrder);
    
    // Clear loading state
    setStatusUpdateLoading(prev => {
      const newSet = new Set(prev);
      newSet.delete(editingOrder.id);
      return newSet;
    });

    showNotification('Order updated successfully!');
  };

  const handleDeleteOrder = async (orderId) => {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error('Error deleting order:', error);
      showNotification('Failed to delete order', 'error');
      return;
    }

    setOrders(orders.filter(order => order.id !== orderId));
    setShowDeleteConfirm(false);
    setOrderToDelete(null);
    
    // Close details if this order was being viewed
    if (selectedOrder && selectedOrder.id === orderId) {
      handleCloseDetails();
    }

    showNotification('Order deleted successfully');
  };

  const handleBulkDelete = async () => {
    if (selectedOrders.size === 0) return;

    const { error } = await supabase
      .from('orders')
      .delete()
      .in('id', Array.from(selectedOrders));

    if (error) {
      console.error('Error deleting orders:', error);
      showNotification('Failed to delete orders', 'error');
      return;
    }

    setOrders(orders.filter(order => !selectedOrders.has(order.id)));
    setSelectedOrders(new Set());
    showNotification(`${selectedOrders.size} orders deleted successfully`);
  };

  const toggleOrderSelection = (orderId, event) => {
    event.stopPropagation();
    const newSelection = new Set(selectedOrders);
    if (newSelection.has(orderId)) {
      newSelection.delete(orderId);
    } else {
      newSelection.add(orderId);
    }
    setSelectedOrders(newSelection);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setStatusUpdateLoading(prev => new Set([...prev, orderId]));
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        showNotification('Failed to update order status', 'error');
        return;
      }

      // Update all related states consistently
      const updateOrderInState = (order) => 
        order.id === orderId ? { ...order, order_status: newStatus } : order;

      // Update orders array
      setOrders(prevOrders => prevOrders.map(updateOrderInState));

      // Update editingOrder if it's the same order being edited
      if (editingOrder && editingOrder.id === orderId) {
        setEditingOrder(prev => ({ ...prev, order_status: newStatus }));
      }

      // Update selectedOrder if it's the same order
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, order_status: newStatus }));
      }

      showNotification(`Order status updated to ${newStatus.toLowerCase()}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      showNotification('Failed to update order status', 'error');
    } finally {
      setStatusUpdateLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle className="admin-status-icon" />;
      case 'PENDING': return <Clock className="admin-status-icon" />;
      case 'FAILED': return <AlertCircle className="admin-status-icon" />;
      default: return <Clock className="admin-status-icon" />;
    }
  };

  const getOrderStatusIcon = (status) => {
    switch (status) {
      case 'PROCESSING': return <Clock className="w-4 h-4" />;
      case 'SHIPPED': return <Truck className="w-4 h-4" />;
      case 'COMPLETED': return <PackageCheck className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
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

  const getOrderStatusActions = (currentStatus) => {
    const allStatuses = ['PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];
    return allStatuses.filter(status => status !== currentStatus);
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
    // Calculate revenue for all orders, not just successful payments
    if (order.product_list && Array.isArray(order.product_list)) {
      return total + order.product_list.reduce((sum, item) => sum + (item.total_price || 0), 0);
    }
    return total;
  }, 0);
};

  const getStatusCounts = (orders) => {
    return orders.reduce((counts, order) => {
      counts[order.order_status] = (counts[order.order_status] || 0) + 1;
      return counts;
    }, {});
  };

  const groupedOrders = groupOrdersByMonth(filteredOrders);
  const totalRevenue = calculateTotalRevenue(filteredOrders);
  const statusCounts = getStatusCounts(filteredOrders);

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
      {/* Notification */}
      {notification && (
        <div className={`admin-notification admin-notification-${notification.type}`}>
          <div className="admin-notification-content">
            {notification.type === 'success' ? (
              <CheckCircle className="admin-notification-icon" />
            ) : (
              <AlertCircle className="admin-notification-icon" />
            )}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="admin-notification-close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="admin-page-header">
        <div className="admin-page-header-container">
          <div className="admin-page-header-content">
            <div>
              <h1 className="admin-page-main-title">Order Management</h1>
              <div className="admin-page-stats-row">
                <span className="admin-page-stat">
                  {filteredOrders.length} orders
                </span>
                <span className="admin-page-stat">
                  ₹{totalRevenue.toLocaleString()} revenue
                </span>
                {statusCounts.PROCESSING && (
                  <span className="admin-page-stat admin-page-stat-warning">
                    {statusCounts.PROCESSING} pending
                  </span>
                )}
              </div>
            </div>
            <div className="admin-page-header-actions">
              <button
                onClick={loadOrders}
                className="admin-page-refresh-btn"
                disabled={loading}
              >
                <RefreshCw className={`admin-page-btn-icon ${loading ? 'animate-spin' : ''}`} />
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

      {/* Quick Stats */}
      <div className="admin-page-quick-stats">
        <div className="admin-page-stat-card">
          <div className="admin-page-stat-icon admin-page-stat-processing">
            <Clock className="w-5 h-5" />
          </div>
          <div className="admin-page-stat-info">
            <div className="admin-page-stat-number">{statusCounts.PROCESSING || 0}</div>
            <div className="admin-page-stat-label">Processing</div>
          </div>
        </div>
        <div className="admin-page-stat-card">
          <div className="admin-page-stat-icon admin-page-stat-shipped">
            <Truck className="w-5 h-5" />
          </div>
          <div className="admin-page-stat-info">
            <div className="admin-page-stat-number">{statusCounts.SHIPPED || 0}</div>
            <div className="admin-page-stat-label">Shipped</div>
          </div>
        </div>
        <div className="admin-page-stat-card">
          <div className="admin-page-stat-icon admin-page-stat-completed">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div className="admin-page-stat-info">
            <div className="admin-page-stat-number">{statusCounts.COMPLETED || 0}</div>
            <div className="admin-page-stat-label">Completed</div>
          </div>
        </div>
        <div className="admin-page-stat-card">
          <div className="admin-page-stat-icon admin-page-stat-cancelled">
            <XCircle className="w-5 h-5" />
          </div>
          <div className="admin-page-stat-info">
            <div className="admin-page-stat-number">{statusCounts.CANCELLED || 0}</div>
            <div className="admin-page-stat-label">Cancelled</div>
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
                placeholder="Search orders, customers, phone, city..."
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
                  <div key={order.id} className="admin-page-order-card-enhanced">
                    <div className="admin-page-order-header-row">
                      <div className="admin-page-order-header-left">
                        <input
                          type="checkbox"
                          checked={selectedOrders.has(order.id)}
                          onChange={(e) => toggleOrderSelection(order.id, e)}
                          className="admin-page-order-checkbox"
                        />
                        <div className="admin-page-order-title-section">
                          <h3 className="admin-page-order-id">
                            Order #{order.id}
                          </h3>
                          <span className="admin-page-order-date">
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="admin-page-order-header-right">
                        <span className={`admin-page-payment-badge ${getPaymentStatusColor(order.payment_status)}`}>
                          {getStatusIcon(order.payment_status)}
                          <span className="admin-page-badge-text">{order.payment_status}</span>
                        </span>
                        
                        <div className="admin-page-status-dropdown">
                          <span className={`admin-page-order-badge ${getOrderStatusColor(order.order_status)}`}>
                            {getOrderStatusIcon(order.order_status)}
                            {order.order_status}
                          </span>
                          <div className="admin-page-status-dropdown-content">
                            {getOrderStatusActions(order.order_status).map(status => (
                              <button
                                key={status}
                                onClick={() => updateOrderStatus(order.id, status)}
                                disabled={statusUpdateLoading.has(order.id)}
                                className="admin-page-status-dropdown-item"
                              >
                                {getOrderStatusIcon(status)}
                                {statusUpdateLoading.has(order.id) ? 'Updating...' : status}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="admin-page-order-total-badge">
                          ₹{order.product_list.reduce((sum, item) => sum + item.total_price, 0).toLocaleString()}
                        </div>

                        <button
                          onClick={() => toggleOrderExpansion(order.id)}
                          className="admin-page-expand-btn"
                        >
                          <ChevronDown 
                            className={`admin-page-expand-icon ${expandedOrders.has(order.id) ? 'rotate-180' : ''}`} 
                          />
                        </button>
                      </div>
                    </div>

                    {/* Customer info row */}
                    <div className="admin-page-customer-quick-info">
                      <div className="admin-page-customer-info-item">
                        <User className="w-4 h-4" />
                        <span>{order.user_name}</span>
                      </div>
                      <div className="admin-page-customer-info-item">
                        <Mail className="w-4 h-4" />
                        <span>{order.user_email}</span>
                      </div>
                      <div className="admin-page-customer-info-item">
                        <Phone className="w-4 h-4" />
                        <span>{order.user_phone}</span>
                      </div>
                      <div className="admin-page-customer-info-item">
                        <MapPin className="w-4 h-4" />
                        <span>{order.city}, {order.state}</span>
                      </div>
                    </div>

                    {/* Expanded content */}
                    {expandedOrders.has(order.id) && (
                      <div className="admin-page-order-expanded">
                        <div className="admin-page-expanded-grid">
                          <div className="admin-page-expanded-section">
                            <h4 className="admin-page-expanded-title">Shipping Address</h4>
                            <p className="admin-page-expanded-content">
                              {order.address_line}<br />
                              {order.city}, {order.state} - {order.postal_code}
                            </p>
                          </div>
                          
                          <div className="admin-page-expanded-section">
                            <h4 className="admin-page-expanded-title">Payment Details</h4>
                            <div className="admin-page-expanded-content">
                              <div className="admin-page-payment-info">
                                <CreditCard className="w-4 h-4" />
                                <span>ID: {order.payment_id || '—'}</span>
                              </div>
                              {!order.user_id && (
                                <div className="admin-page-payment-info">
                                  <Hash className="w-4 h-4" />
                                  <span>Guest: {order.guest_identifier}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="admin-page-expanded-section admin-page-items-section-expanded">
                            <h4 className="admin-page-expanded-title">Order Items</h4>
                            <div className="admin-page-items-list-compact">
                              {order.product_list.map((item, idx) => (
                                <div key={idx} className="admin-page-item-row-compact">
                                  <span className="admin-page-item-name-compact">{item.name}</span>
                                  <span className="admin-page-item-qty-compact">×{item.quantity}</span>
                                  <span className="admin-page-item-price-compact">₹{item.total_price}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="admin-page-expanded-actions">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setEditingOrder({ ...order });
                          setIsViewMode(false); // Edit mode
                          setShowOrderDetails(true);
                        }}
                        className="admin-page-action-btn admin-page-action-btn-primary"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit Details
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setEditingOrder({ ...order });
                          setIsViewMode(true); // View mode
                          setShowOrderDetails(true);
                        }}
                        className="admin-page-action-btn admin-page-action-btn-secondary"
                      >
                        <Eye className="w-4 h-4" />
                        View Full Details
                      </button>
                          <button
                            onClick={() => {
                              setOrderToDelete(order.id);
                              setShowDeleteConfirm(true);
                            }}
                            className="admin-page-action-btn admin-page-action-btn-danger"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && editingOrder && (
        <div className="admin-page-modal-overlay">
          <div className="admin-page-order-details-modal">
            <div className="admin-page-modal-header">
              <div className="admin-page-modal-header-content">
                <h2 className="admin-page-modal-title">
                  Order #{selectedOrder.id} {isViewMode ? 'Details' : 'Edit'}
                </h2>
                <div className="admin-page-modal-status-badges">
                  <span className={`admin-page-payment-badge ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                    {getStatusIcon(selectedOrder.payment_status)}
                    <span className="admin-page-badge-text">{selectedOrder.payment_status}</span>
                  </span>
                  <span className={`admin-page-order-badge ${getOrderStatusColor(editingOrder.order_status)}`}>
                    {getOrderStatusIcon(editingOrder.order_status)}
                    {editingOrder.order_status}
                  </span>
                </div>
              </div>
              <button
                onClick={handleCloseDetails}
                className="admin-page-modal-close-btn"
              >
                <X className="admin-page-close-icon" />
              </button>
            </div>

            <div className="admin-page-modal-body">
              <div className="admin-page-details-grid">
                <div className="admin-page-details-section">
                  <h3 className="admin-page-section-title">Customer Information</h3>
                  <div className="admin-page-form-group">
                    <label className="admin-page-form-label">Name</label>
                    <input
                      type="text"
                      value={editingOrder.user_name || ''}
                      onChange={(e) => setEditingOrder({...editingOrder, user_name: e.target.value})}
                      className="admin-page-form-input"
                      disabled={isViewMode}
                    />
                  </div>
                  <div className="admin-page-form-group">
                    <label className="admin-page-form-label">Email</label>
                    <input
                      type="email"
                      value={editingOrder.user_email || ''}
                      onChange={(e) => setEditingOrder({...editingOrder, user_email: e.target.value})}
                      className="admin-page-form-input"
                      disabled={isViewMode}
                    />
                  </div>
                  <div className="admin-page-form-group">
                    <label className="admin-page-form-label">Phone</label>
                    <input
                      type="tel"
                      value={editingOrder.user_phone || ''}
                      onChange={(e) => setEditingOrder({...editingOrder, user_phone: e.target.value})}
                      className="admin-page-form-input"
                      disabled={isViewMode}
                    />
                  </div>
                  <div className="admin-page-form-group">
                    <label className="admin-page-form-label">Shipping Address</label>
                    <input
                      type="text"
                      value={editingOrder.address_line || ''}
                      onChange={(e) => setEditingOrder({...editingOrder, address_line: e.target.value})}
                      className="admin-page-form-input"
                      disabled={isViewMode}
                    />
                  </div>
                  <div className="admin-page-form-group">
                    <label className="admin-page-form-label">City</label>
                    <input
                      type="text"
                      value={editingOrder.city || ''}
                      onChange={(e) => setEditingOrder({...editingOrder, city: e.target.value})}
                      className="admin-page-form-input"
                      disabled={isViewMode}
                    />
                  </div>
                  <div className="admin-page-form-group">
                    <label className="admin-page-form-label">State</label>
                    <input
                      type="text"
                      value={editingOrder.state || ''}
                      onChange={(e) => setEditingOrder({...editingOrder, state: e.target.value})}
                      className="admin-page-form-input"
                      disabled={isViewMode}
                    />
                  </div>
                  <div className="admin-page-form-group">
                    <label className="admin-page-form-label">Postal Code</label>
                    <input
                      type="text"
                      value={editingOrder.postal_code || ''}
                      onChange={(e) => setEditingOrder({...editingOrder, postal_code: e.target.value})}
                      className="admin-page-form-input"
                      disabled={isViewMode}
                    />
                  </div>
                </div>
                <div className="admin-page-details-section">
                  <h3 className="admin-page-section-title">Order Items</h3>
                  <div className="admin-page-items-list">
                    {editingOrder.product_list.map((item, idx) => (
                      <div key={idx} className="admin-page-item-row">
                        <span className="admin-page-item-name">{item.name}</span>
                        <span className="admin-page-item-qty">×{item.quantity}</span>
                        <span className="admin-page-item-price">₹{item.total_price}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Payment Details */}
                <div className="admin-page-details-section">
                  <h3 className="admin-page-section-title">Payment Details</h3>
                  <div className="admin-page-payment-info">
                    <div className="admin-page-payment-item">
                      <CreditCard className="w-4 h-4" />
                      <span>ID: {editingOrder.payment_id || '—'}</span>
                    </div>
                    {!editingOrder.user_id && (
                      <div className="admin-page-payment-item">
                        <Hash className="w-4 h-4" />
                        <span>Guest: {editingOrder.guest_identifier}</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Order Status */}
                <div className="admin-page-details-section">
                  <h3 className="admin-page-section-title">Order Status</h3>
                  <div className="admin-page-status-select">
                    {isViewMode ? (
                      <div className={`admin-page-order-badge ${getOrderStatusColor(editingOrder.order_status)}`}>
                        {getOrderStatusIcon(editingOrder.order_status)}
                        {editingOrder.order_status}
                      </div>
                    ) : (
                      <select
                        value={editingOrder.order_status}
                        onChange={(e) => setEditingOrder({...editingOrder, order_status: e.target.value})}
                        className="admin-page-form-select"
                      >
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    )}
                  </div>
                </div>
                {/* Actions */}
                <div className="admin-page-details-actions">
                  {!isViewMode && (
                    <button
                      onClick={handleSaveOrderChanges}
                      className="admin-page-action-btn admin-page-action-btn-primary"
                      disabled={statusUpdateLoading.has(editingOrder.id)}
                    >
                      {statusUpdateLoading.has(editingOrder.id) ? 'Saving...' : 'Save Changes'}
                    </button>
                  )}
                  {!isViewMode && (
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(true);
                        setOrderToDelete(editingOrder.id);
                      }}
                      className="admin-page-action-btn admin-page-action-btn-danger"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Order
                    </button>
                  )}
                  {isViewMode && (
                    <button
                      onClick={() => setIsViewMode(false)}
                      className="admin-page-action-btn admin-page-action-btn-primary"
                    >
                      <Edit3 className="w-4 h-4" />
                      Switch to Edit Mode
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && orderToDelete && (
        <div className="admin-page-modal-overlay">
          <div className="admin-page-delete-confirm-modal">
            <h2 className="admin-page-modal-title">Confirm Deletion</h2>
            <p className="admin-page-delete-confirm-text">
              Are you sure you want to delete Order #{orderToDelete}? This action cannot be undone.
            </p>
            <div className="admin-page-delete-confirm-actions">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="admin-page-action-btn admin-page-action-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteOrder(orderToDelete)}
                className="admin-page-action-btn admin-page-action-btn-danger"
              >
                Delete Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}