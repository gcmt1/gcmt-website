import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import "../styles/AdminOrder.css";
import { 
  Search, Filter, Calendar, Trash2, Eye, Package, CheckCircle, Clock, 
  AlertCircle, Download, RefreshCw, X, Save, ArrowLeft, ChevronDown,
  Edit3, Truck, PackageCheck, XCircle, MoreHorizontal, User, MapPin,
  Phone, Mail, CreditCard, Hash, CalendarRange
} from 'lucide-react';

export default function GoldOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState('ALL');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(new Set());
  const [paymentUpdateLoading, setPaymentUpdateLoading] = useState(new Set());
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
  }, [orders, searchTerm, statusFilter, paymentFilter, dateRange, customDateRange]);

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
        case 'CUSTOM':
          if (customDateRange.startDate && customDateRange.endDate) {
            const startDate = new Date(customDateRange.startDate);
            const endDate = new Date(customDateRange.endDate);
            endDate.setHours(23, 59, 59, 999); // Include the entire end date
            
            filtered = filtered.filter(order => {
              const orderDate = new Date(order.created_at);
              return orderDate >= startDate && orderDate <= endDate;
            });
          }
          break;
      }
    }

    setFilteredOrders(filtered);
  };

  const handleDateRangeChange = (value) => {
    setDateRange(value);
    if (value === 'CUSTOM') {
      setShowCustomDatePicker(true);
    } else {
      setShowCustomDatePicker(false);
      setCustomDateRange({ startDate: '', endDate: '' });
    }
  };

  const applyCustomDateRange = () => {
    if (customDateRange.startDate && customDateRange.endDate) {
      setShowCustomDatePicker(false);
      // The filtering will be triggered by the useEffect
    } else {
      showNotification('Please select both start and end dates', 'error');
    }
  };

  const clearCustomDateRange = () => {
    setCustomDateRange({ startDate: '', endDate: '' });
    setDateRange('ALL');
    setShowCustomDatePicker(false);
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
        payment_status: editingOrder.payment_status,
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

  const updatePaymentStatus = async (orderId, newStatus) => {
    setPaymentUpdateLoading(prev => new Set([...prev, orderId]));
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: newStatus })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating payment status:', error);
        showNotification('Failed to update payment status', 'error');
        return;
      }

      // Update all related states consistently
      const updateOrderInState = (order) => 
        order.id === orderId ? { ...order, payment_status: newStatus } : order;

      // Update orders array
      setOrders(prevOrders => prevOrders.map(updateOrderInState));

      // Update editingOrder if it's the same order being edited
      if (editingOrder && editingOrder.id === orderId) {
        setEditingOrder(prev => ({ ...prev, payment_status: newStatus }));
      }

      // Update selectedOrder if it's the same order
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, payment_status: newStatus }));
      }

      showNotification(`Payment status updated to ${newStatus.toLowerCase()}`);
    } catch (error) {
      console.error('Error updating payment status:', error);
      showNotification('Failed to update payment status', 'error');
    } finally {
      setPaymentUpdateLoading(prev => {
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

  const getPaymentStatusActions = (currentStatus) => {
    const allStatuses = ['SUCCESS', 'PENDING', 'FAILED'];
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
              onChange={(e) => handleDateRangeChange(e.target.value)}
              className="admin-page-filter-select"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="WEEK">Last Week</option>
              <option value="MONTH">Last Month</option>
              <option value="CUSTOM">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Range Picker */}
          {showCustomDatePicker && (
            <div className="admin-page-custom-date-range">
              <div className="admin-page-custom-date-inputs">
                <div className="admin-page-date-input-group">
                  <label className="admin-page-date-label">
                    <CalendarRange className="w-4 h-4" />
                    From:
                  </label>
                  <input
                    type="date"
                    value={customDateRange.startDate}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="admin-page-date-input"
                  />
                </div>
                <div className="admin-page-date-input-group">
                  <label className="admin-page-date-label">
                    <CalendarRange className="w-4 h-4" />
                    To:
                  </label>
                  <input
                    type="date"
                    value={customDateRange.endDate}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="admin-page-date-input"
                  />
                </div>
              </div>
              <div className="admin-page-date-actions">
                <button
                  onClick={applyCustomDateRange}
                  className="admin-page-date-apply-btn"
                >
                  Apply Filter
                </button>
                <button
                  onClick={clearCustomDateRange}
                  className="admin-page-date-clear-btn"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Active Custom Date Range Display */}
          {dateRange === 'CUSTOM' && customDateRange.startDate && customDateRange.endDate && (
            <div className="admin-page-active-date-range">
              <CalendarRange className="w-4 h-4" />
              <span>
                Showing orders from {new Date(customDateRange.startDate).toLocaleDateString()} 
                to {new Date(customDateRange.endDate).toLocaleDateString()}
              </span>
              <button
                onClick={clearCustomDateRange}
                className="admin-page-clear-date-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
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
                        <div className="admin-page-status-dropdown">
                          <span className={`admin-page-payment-badge ${getPaymentStatusColor(order.payment_status)}`}>
                            {getStatusIcon(order.payment_status)}
                            <span className="admin-page-badge-text">{order.payment_status}</span>
                          </span>
                          <div className="admin-page-status-dropdown-content">
                            {getPaymentStatusActions(order.payment_status).map(status => (
                              <button
                                key={status}
                                onClick={() => updatePaymentStatus(order.id, status)}
                                disabled={paymentUpdateLoading.has(order.id)}
                                className="admin-page-status-dropdown-item"
                              >
                                {getStatusIcon(status)}
                                {paymentUpdateLoading.has(order.id) ? 'Updating...' : status}
                              </button>
                            ))}
                          </div>
                        </div>
                        
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
                        <button
                          onClick={() => handleOrderClick(order)}
                          className="admin-page-order-details-btn"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            setOrderToDelete(order.id);
                            setShowDeleteConfirm(true);
                          }}
                          className="admin-page-order-delete-btn"
                        >
                          <Trash2 className="w-4 h-4" />  
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="admin-page-order-details">
                      <div className="admin-page-order-info">
                        <div className="admin-page-order-info-row">
                          <span className="admin-page-order-info-label">Customer:</span>
                          <span className="admin-page-order-info-value">{order.user_name}</span>
                        </div>
                        <div className="admin-page-order-info-row">
                          <span className="admin-page-order-info-label">Email:</span>
                          <span className="admin-page-order-info-value">{order.user_email}</span>
                        </div>
                        <div className="admin-page-order-info-row">
                          <span className="admin-page-order-info-label">Phone:</span>
                          <span className="admin-page-order-info-value">{order.user_phone}</span>
                        </div>
                        <div className="admin-page-order-info-row">
                          <span className="admin-page-order-info-label">Address:</span>
                          <span className="admin-page-order-info-value">
                            {order.address_line}, {order.city}, {order.state} - {order.postal_code}
                          </span>
                        </div>
                      </div>

                      {/* Product List */}
                      {order.product_list && order.product_list.length > 0 && (
                        <div className="admin-page-product-list">
                          <h4 className="admin-page-product-list-title">Products</h4>
                          <ul className="admin-page-product-list-items">
                            {order.product_list.map((item, index) => (
                              <li key={index} className="admin-page-product-list-item">
                                <div className="admin-page-product-item-details">
                                  <span className="admin-page-product-item-name">{item.name}</span>
                                  <span className="admin-page-product-item-quantity">x{item.quantity}</span>
                                  <span className="admin-page-product-item-price">₹{item.total_price.toFixed(2)}</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {/* Guest Identifier */}
                      {order.guest_identifier && (
                        <div className="admin-page-guest-identifier">
                          <span className="admin-page-guest-label">Guest ID:</span>
                          <span className="admin-page-guest-value">{order.guest_identifier}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="admin-page-order-details-modal">
          <div className="admin-page-order-details-header">
            <h2 className="admin-page-order-details-title">Order #{selectedOrder.id}</h2>
            <button onClick={handleCloseDetails} className="admin-page-close-btn">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="admin-page-order-details-content">
            <div className="admin-page-order-details-info">
              <div className="admin-page-order-info-row">
                <span className="admin-page-order-info-label">Customer:</span>
                <span className="admin-page-order-info-value">{selectedOrder.user_name}</span>
              </div>
              <div className="admin-page-order-info-row">
                <span className="admin-page-order-info-label">Email:</span>
                <span className="admin-page-order-info-value">{selectedOrder.user_email}</span>
              </div>
              <div className="admin-page-order-info-row">
                <span className="admin-page-order-info-label">Phone:</span>
                <span className="admin-page-order-info-value">{selectedOrder.user_phone}</span>
              </div>
              <div className="admin-page-order-info-row">
                <span className="admin-page-order-info-label">Address:</span>
                <span className="admin-page-order-info-value">
                  {selectedOrder.address_line}, {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.postal_code}
                </span>
              </div>
              {selectedOrder.guest_identifier && (
                <div className="admin-page-guest-identifier">
                  <span className="admin-page-guest-label">Guest ID:</span>
                  <span className="admin-page-guest-value">{selectedOrder.guest_identifier}</span>
                </div>
              )}
            </div>

            {/* Product List */}
            {selectedOrder.product_list && selectedOrder.product_list.length > 0 && (
              <div className="admin-page-product-list">
                <h4 className="admin-page-product-list-title">Products</h4>
                <ul className="admin-page-product-list-items">
                  {selectedOrder.product_list.map((item, index) => (
                    <li key={index} className="admin-page-product-list-item">
                      <div className="admin-page-product-item-details">
                        <span className="admin-page-product-item-name">{item.name}</span>
                        <span className="admin-page-product-item-quantity">x{item.quantity}</span>
                        <span className="admin-page-product-item-price">₹{item.total_price.toFixed(2)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="admin-page-order-status-actions">
              <div className="admin-page-status-dropdown">
                <span className={`admin-page-payment-badge ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                  {getStatusIcon(selectedOrder.payment_status)}
                  <span className="admin-page-badge-text">{selectedOrder.payment_status}</span>
                </span>
                <div className="admin-page-status-dropdown-content">
                  {getPaymentStatusActions(selectedOrder.payment_status).map(status => (
                    <button
                      key={status}
                      onClick={() => updatePaymentStatus(selectedOrder.id, status)}
                      disabled={paymentUpdateLoading.has(selectedOrder.id)}
                      className="admin-page-status-dropdown-item"
                    >
                      {getStatusIcon(status)}
                      {paymentUpdateLoading.has(selectedOrder.id) ? 'Updating...' : status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="admin-page-status-dropdown">
                <span className={`admin-page-order-badge ${getOrderStatusColor(selectedOrder.order_status)}`}>
                  {getOrderStatusIcon(selectedOrder.order_status)}
                  {selectedOrder.order_status}
                </span>
                <div className="admin-page-status-dropdown-content">
                  {getOrderStatusActions(selectedOrder.order_status).map(status => (
                    <button
                      key={status}
                      onClick={() => updateOrderStatus(selectedOrder.id, status)}
                      disabled={statusUpdateLoading.has(selectedOrder.id)}
                      className="admin-page-status-dropdown-item"
                    >
                      {getOrderStatusIcon(status)}
                      {statusUpdateLoading.has(selectedOrder.id) ? 'Updating...' : status}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSaveOrderChanges}
                className="admin-page-save-changes-btn"
                disabled={!editingOrder || statusUpdateLoading.has(editingOrder.id)}
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setEditingOrder(null);
                  setSelectedOrder(null);
                  setShowOrderDetails(false);
                }}
                className="admin-page-close-details-btn"
                >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && orderToDelete && (
        <div className="admin-page-delete-confirm-modal">
          <div className="admin-page-delete-confirm-content">
            <h3 className="admin-page-delete-confirm-title">Confirm Deletion</h3>
            <p className="admin-page-delete-confirm-text">
              Are you sure you want to delete order #{orderToDelete}?
            </p>
            <div className="admin-page-delete-confirm-actions">
              <button
                onClick={() => handleDeleteOrder(orderToDelete)}
                className="admin-page-delete-confirm-btn admin-page-delete-confirm-btn-danger"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="admin-page-delete-confirm-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

