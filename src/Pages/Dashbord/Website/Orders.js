import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './Css-files/Orders.module.css';
import OrderStats from './DashboardOrderRequirments/OrderStats';
import CustomTable from '../../../Components/Website/Table';
import { useTranslation } from 'react-i18next';
import { useDashboardData } from '../../../Hooks/UseDashboardData';
import { useAlert } from '../../../Context/AlertContext';
import { useAdminData } from '../../../Context/AdminDataContext'; // ⬅️ أضيف هذا الاستيراد

const DashboardOrders = () => {
  const { t } = useTranslation();
  const { getData, refreshData } = useDashboardData();
  const { showDeleteConfirm, showSuccess, showError } = useAlert();
  const { clearCache } = useAdminData(); // ⬅️ أضيف هذا
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    status: 'all',
    start_date: '',
    end_date: '',
    user_id: '',
    search: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 1
  });

  const debounceRef = useRef(null);

  const fetchDashboardOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      const requestParams = {
        ...(filters.search && { search: filters.search }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.start_date && { start_date: filters.start_date }),
        ...(filters.end_date && { end_date: filters.end_date }),
        ...(filters.user_id && { user_id: filters.user_id }),
        sort_by: filters.sort_by,
        sort_order: filters.sort_order,
        page: pagination.currentPage,
        per_page: pagination.itemsPerPage
      };
      
      const response = await getData('orders', requestParams);
      
      if (response && response.success) {
        const ordersData = response.data?.data || response.data || [];
        const meta = response.data?.meta || response.meta || {};
        
        setOrders(ordersData);
        
        setPagination(prev => ({
          ...prev,
          totalItems: meta.total || 0,
          totalPages: meta.last_page || 1,
          currentPage: meta.current_page || pagination.currentPage,
          itemsPerPage: meta.per_page || pagination.itemsPerPage
        }));
        
      } else {
        throw new Error('Invalid response structure');
      }
      
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching orders:', err);
      setError(err.response?.data?.message || t('orders.error_loading_orders'));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage, pagination.itemsPerPage, getData, t]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchDashboardOrders();
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [fetchDashboardOrders]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const { Axios } = await import('../../../API/axios');
      
      await Axios.put(`/dashboard/orders/${orderId}/status`, { status: newStatus });
      
      // ⬇️ أضيف هذا السطر ⬇️
      clearCache('orders'); // تحديث الكاش للطلبات
      
      refreshData('orders');
      fetchDashboardOrders();
      
      showSuccess(t('orders.dashboard.update_success'));
    } catch (err) {
      console.error('Error updating status:', err);
      showError(err.response?.data?.message || t('orders.dashboard.update_error'));
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    const orderNumber = order?.order_number || orderId;

    showDeleteConfirm({
      title: t('orders.dashboard.confirm_delete_modal.title'),
      message: t('orders.dashboard.confirm_delete_modal.message', { orderNumber }),
      onConfirm: async () => {
        try {
          const { Axios } = await import('../../../API/axios');
          
          await Axios.delete(`/dashboard/orders/${orderId}`);
          
          // ⬇️ أضيف هذا السطر ⬇️
          clearCache('orders'); // تحديث الكاش للطلبات
          
          refreshData('orders');
          
          showSuccess(t('orders.dashboard.delete_success'));
          
          fetchDashboardOrders();
        } catch (err) {
          console.error('Error deleting order:', err);
          
          showError(
            err.response?.data?.message || t('orders.dashboard.delete_error'),
            t('common.alerts.titles.error')
          );
        }
      }
    });
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSearchChange = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSort = (sortKey) => {
    const newSortOrder = filters.sort_by === sortKey && filters.sort_order === 'asc' ? 'desc' : 'asc';
    setFilters(prev => ({ ...prev, sort_by: sortKey, sort_order: newSortOrder }));
  };

  const handlePageChange = (selectedPage) => {
    setPagination(prev => ({ ...prev, currentPage: selectedPage + 1 }));
  };

  const handleItemsPerPageChange = (itemsPerPage) => {
    setPagination(prev => ({ 
      ...prev, 
      itemsPerPage: itemsPerPage, 
      currentPage: 1
    }));
  };

  const columns = [
    {
      header: '#',
      accessor: 'id',
      content: (item, index) => (pagination.currentPage - 1) * pagination.itemsPerPage + index + 1,
      width: '60px',
      minWidth: '60px',
      maxWidth: '80px'
    },
    {
      header: t('orders.order_number').replace('{{num}}', '').trim() || 'Order Number',
      accessor: 'order_number',
      sortable: true,
      sortKey: 'order_number',
      content: (item) => (
        <span style={{ fontWeight: 'bold', color: '#007bff' }}>
          {item.order_number}
        </span>
      ),
      width: 'auto',
      minWidth: '130px',
      maxWidth: '180px'
    },
    {
      header: t('orders.customer') || 'Customer',
      accessor: 'customer',
      content: (item) => (
        <div className={styles.customerCell}>
          <div className={styles.customerName} style={{ 
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {item.user?.name || t('na')}
          </div>
          <div className={styles.customerEmail} style={{
            fontSize: '0.85em',
            color: '#666',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {item.user?.email || ''}
          </div>
        </div>
      ),
      width: 'auto',
      minWidth: '180px',
      maxWidth: '250px'
    },
    {
      header: t('orders.date') || 'Date',
      accessor: 'created_at',
      sortable: true,
      sortKey: 'created_at',
      content: (item) => new Date(item.created_at).toLocaleDateString(),
      width: 'auto',
      minWidth: '100px',
      maxWidth: '130px'
    },
    {
      header: t('orders.total') || 'Total',
      accessor: 'total_amount',
      sortable: true,
      sortKey: 'total_amount',
      content: (item) => `$${parseFloat(item.total_amount || 0).toFixed(2)}`,
      alignHeader: 'center', // ⬅️ محاذاة العنوان في المنتصف
      alignContent: 'center', // ⬅️ محاذاة المحتوى في المنتصف
      width: 'auto',
      minWidth: '100px',
      maxWidth: '150px'
    },
    {
      header: t('orders.status_header') || 'Status',
      accessor: 'status',
      sortable: true,
      sortKey: 'status',
      content: (item) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <select 
            value={item.status}
            onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
            className={`${styles.statusSelect} ${styles[item.status]}`}
            style={{ 
              padding: '5px 10px', 
              borderRadius: '4px', 
              border: '1px solid #ddd',
              background: 'white',
              cursor: 'pointer',
              width: '100%',
              maxWidth: '150px'
            }}
          >
            <option value="pending">{t('orders.status.pending') || 'Pending'}</option>
            <option value="confirmed">{t('orders.status.confirmed') || 'Confirmed'}</option>
            <option value="processing">{t('orders.status.processing') || 'Processing'}</option>
            <option value="shipped">{t('orders.status.shipped') || 'Shipped'}</option>
            <option value="delivered">{t('orders.status.delivered') || 'Delivered'}</option>
            <option value="cancelled">{t('orders.status.cancelled') || 'Cancelled'}</option>
          </select>
        </div>
      ),
      alignHeader: 'center', // ⬅️ محاذاة العنوان في المنتصف
      alignContent: 'center', // ⬅️ محاذاة المحتوى في المنتصف
      width: 'auto',
      minWidth: '140px',
      maxWidth: '180px'
    },
    {
      header: t('orders.payment_method') || 'Payment',
      accessor: 'payment_method',
      content: (item) => (
        <div style={{ textAlign: 'center' }}>
          <span style={{ 
            textTransform: 'capitalize',
            color: item.payment_method === 'cash_on_delivery' ? '#28a745' : '#007bff'
          }}>
            {item.payment_method?.replace('_', ' ') || t('na')}
          </span>
        </div>
      ),
      alignHeader: 'center', // ⬅️ محاذاة العنوان في المنتصف
      alignContent: 'center', // ⬅️ محاذاة المحتوى في المنتصف
      width: 'auto',
      minWidth: '100px',
      maxWidth: '140px'
    },
    {
      header: t('orders.shipping_address') || 'Shipping Address',
      accessor: 'shipping_address',
      content: (item) => (
        <div style={{ 
          maxWidth: '300px',
          minWidth: '150px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {item.shipping_address || t('na')}
        </div>
      ),
      width: 'auto',
      minWidth: '150px',
      flex: 1
    }
  ];

  return (
    <div className={styles.dashboardContainer}>
      <OrderStats />
      
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t('orders.dashboard.title') || 'Orders Management'}</h1>
      </div>

      <CustomTable
        data={orders}
        columns={columns}
        loading={loading}
        noDataText={t('orders.no_orders') || 'No orders found'}
        onDelete={(orderId) => handleDeleteOrder(orderId)}
        addButtonPath={null}
        addButtonText={null}
        editBasePath="/dashboard/orders"
        rowKey="id"
        
        pagination={{
          currentPage: pagination.currentPage,
          itemsPerPage: pagination.itemsPerPage,
          totalItems: pagination.totalItems,
          totalPages: pagination.totalPages,
          onPageChange: handlePageChange,
          onItemsPerPageChange: handleItemsPerPageChange
        }}
        
        searchTerm={filters.search}
        onSearchChange={handleSearchChange}
        searchPlaceholder={t('orders.dashboard.search_order') || 'Search orders...'}
        
        onSort={handleSort}
        currentSortBy={filters.sort_by}
        currentSortOrder={filters.sort_order}
        
        createdDateFilter={filters.start_date}
        onCreatedDateFilterChange={(date) => handleFilterChange('start_date', date)}
      />

      <div className={styles.advancedFilters} style={{ 
        marginTop: '20px', 
        display: 'flex', 
        justifyContent: 'flex-end',
        alignItems: 'center'
      }}>
        <div className={styles.filterGroup}>
          <label style={{ 
            marginRight: '10px', 
            fontWeight: '500',
            color: '#555'
          }}>
            {t('orders.dashboard.filter_by_status') || 'Filter by Status'}:
          </label>
          <select 
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            style={{ 
              padding: '8px 15px', 
              borderRadius: '6px', 
              border: '1px solid #ddd',
              minWidth: '180px',
              backgroundColor: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <option value="all">{t('orders.all') || 'All Statuses'}</option>
            <option value="pending">{t('orders.status.pending') || 'Pending'}</option>
            <option value="confirmed">{t('orders.status.confirmed') || 'Confirmed'}</option>
            <option value="processing">{t('orders.status.processing') || 'Processing'}</option>
            <option value="shipped">{t('orders.status.shipped') || 'Shipped'}</option>
            <option value="delivered">{t('orders.status.delivered') || 'Delivered'}</option>
            <option value="cancelled">{t('orders.status.cancelled') || 'Cancelled'}</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default DashboardOrders;