import React, { useState, useEffect } from 'react';
import { Axios } from '../../../API/axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAlert } from '../../../Context/AlertContext';
import styles from './Css-files/OrderEdit.module.css';

const OrderEdit = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert(); // فقط نجاح وخطأ
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    shipping_address: '',
    shipping_name: '',
    shipping_phone: '',
    notes: '',
    payment_method: 'cash_on_delivery'
  });

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await Axios.get(`/dashboard/orders/${id}`);
      
      if (response.data.success) {
        const orderData = response.data.data;
        setOrder(orderData);
        
        setFormData({
          shipping_address: orderData.shipping_address || '',
          shipping_name: orderData.shipping_name || '',
          shipping_phone: orderData.shipping_phone || '',
          notes: orderData.notes || '',
          payment_method: orderData.payment_method || 'cash_on_delivery'
        });
      }
    } catch (err) {
      const errorMsg = t('orders.dashboard.load_error');
      setError(errorMsg);
      showError(errorMsg); // رسالة خطأ
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const response = await Axios.put(`/dashboard/orders/${id}`, formData);
      
      if (response.data.success) {
        showSuccess(t('orders.edit_order_page.update_success')); // رسالة نجاح
        navigate('/dashboard/orders');
      }
    } catch (err) {
      showError(err.response?.data?.message || t('orders.edit_order_page.update_error')); // رسالة خطأ
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (formDataHasChanges()) {
      if (window.confirm(t('orders.edit_order_page.confirm_cancel_edit'))) {
        navigate('/dashboard/orders');
      }
    } else {
      navigate('/dashboard/orders');
    }
  };

  const formDataHasChanges = () => {
    if (!order) return false;
    
    return (
      formData.shipping_address !== (order.shipping_address || '') ||
      formData.shipping_name !== (order.shipping_name || '') ||
      formData.shipping_phone !== (order.shipping_phone || '') ||
      formData.notes !== (order.notes || '') ||
      formData.payment_method !== (order.payment_method || 'cash_on_delivery')
    );
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={styles.errorContainer}>
        <p>{error || t('orders.edit_order_page.order_not_found')}</p>
        <button 
          onClick={() => navigate('/dashboard/orders')} 
          className={styles.backButton}
        >
          {t('back_to_orders') || t('back')}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.orderEditContainer}>
      <div className={styles.pageHeader}>
        <button 
          onClick={handleCancel} 
          className={styles.backButton}
        >
          ← {t('back')}
        </button>
        <h1>
          {t('orders.dashboard.edit_order')} #{order.order_number}
        </h1>
      </div>

      <div className={styles.orderInfoSummary}>
        <div className={styles.infoCard}>
          <h3>{t('orders.order_info')}</h3>
          <p><strong>{t('orders.date')}:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
          <p><strong>{t('orders.status')}:</strong> {t(`orders.status.${order.status}`) || order.status}</p>
          <p><strong>{t('orders.total')}:</strong> ${parseFloat(order.total_amount).toFixed(2)}</p>
          <p><strong>{t('orders.customer')}:</strong> {order.user?.name} ({order.user?.email})</p>
        </div>

        <div className={styles.infoCard}>
          <h3>{t('orders.dashboard.current_shipping_info')}</h3>
          <p><strong>{t('orders.name')}:</strong> {order.shipping_name}</p>
          <p><strong>{t('orders.phone')}:</strong> {order.shipping_phone}</p>
          <p><strong>{t('orders.address')}:</strong> {order.shipping_address}</p>
          <p><strong>{t('orders.payment_method')}:</strong> 
            {t(`orders.dashboard.payment_methods.${order.payment_method}`) || order.payment_method}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.editForm}>
        <h2>{t('orders.dashboard.edit_shipping_info')}</h2>
        
        <div className={styles.formGroup}>
          <label htmlFor="shipping_name">
            {t('orders.name')} *
          </label>
          <input
            type="text"
            id="shipping_name"
            name="shipping_name"
            value={formData.shipping_name}
            onChange={handleInputChange}
            required
            placeholder={t('orders.checkout.placeholders.name')}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="shipping_phone">
            {t('orders.phone')}
          </label>
          <input
            type="text"
            id="shipping_phone"
            name="shipping_phone"
            value={formData.shipping_phone}
            onChange={handleInputChange}
            placeholder={t('orders.checkout.placeholders.phone')}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="shipping_address">
            {t('orders.address')} *
          </label>
          <textarea
            id="shipping_address"
            name="shipping_address"
            value={formData.shipping_address}
            onChange={handleInputChange}
            rows="3"
            required
            placeholder={t('orders.checkout.placeholders.address')}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="payment_method">
            {t('orders.payment_method')}
          </label>
          <select
            id="payment_method"
            name="payment_method"
            value={formData.payment_method}
            onChange={handleInputChange}
          >
            <option value="cash_on_delivery">
              {t('orders.dashboard.payment_methods.cash')}
            </option>
            <option value="credit_card">
              {t('orders.dashboard.payment_methods.credit_card')}
            </option>
            <option value="bank_transfer">
              {t('orders.dashboard.payment_methods.bank_transfer')}
            </option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="notes">
            {t('orders.notes')}
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows="2"
            placeholder={t('orders.dashboard.notes_placeholder')}
          />
        </div>

        <div className={styles.formActions}>
          <button 
            type="button" 
            onClick={handleCancel} 
            className={styles.cancelButton}
          >
            {t('cancel')}
          </button>
          <button 
            type="submit" 
            disabled={saving} 
            className={styles.saveButton}
          >
            {saving ? t('saving') : t('save_changes')}
          </button>
        </div>
      </form>

      <div className={styles.orderItemsSection}>
        <h2>{t('orders.items')}</h2>
        <div className={styles.itemsList}>
          {order.items?.map((item, index) => (
            <div key={index} className={styles.itemCard}>
              {item.product?.images?.[0] && (
                <img
                  src={item.product.images[0].image}
                  alt={item.product.title}
                  className={styles.productImage}
                />
              )}
              <div className={styles.itemDetails}>
                <h4>{item.product?.title || t('product')}</h4>
                <p>{t('orders.dashboard.quantity')}: {item.quantity}</p>
                <p>{t('orders.dashboard.price')}: ${parseFloat(item.price).toFixed(2)}</p>
                <p>
                  <strong>
                    {t('orders.dashboard.total')}: ${parseFloat(item.total).toFixed(2)}
                  </strong>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderEdit;