import React from 'react';
import styles from './OrderRequirments-Css/OrderFilters.module.css';
import { useTranslation } from 'react-i18next';

const OrderFilters = ({ filters, onFilterChange }) => {
  const { t } = useTranslation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value });
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value });
  };

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.filterRow}>
        <div className={styles.filterGroup}>
          <label>{t('orders.dashboard.filter_by_status')}</label>
          <select 
            name="status" 
            value={filters.status} 
            onChange={handleChange}
            className={styles.filterSelect}
          >
            <option value="all">{t('orders.all')}</option>
            <option value="pending">{t('orders.status.pending')}</option>
            <option value="confirmed">{t('orders.status.confirmed')}</option>
            <option value="processing">{t('orders.status.processing')}</option>
            <option value="shipped">{t('orders.status.shipped')}</option>
            <option value="delivered">{t('orders.status.delivered')}</option>
            <option value="cancelled">{t('orders.status.cancelled')}</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>{t('orders.dashboard.date_from')}</label>
          <input 
            type="date" 
            name="start_date" 
            value={filters.start_date} 
            onChange={handleDateChange}
            className={styles.filterInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <label>{t('orders.dashboard.date_to')}</label>
          <input 
            type="date" 
            name="end_date" 
            value={filters.end_date} 
            onChange={handleDateChange}
            className={styles.filterInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <label>{t('orders.dashboard.sort_by')}</label>
          <select 
            name="sort_by" 
            value={filters.sort_by} 
            onChange={handleChange}
            className={styles.filterSelect}
          >
            <option value="created_at">{t('orders.dashboard.sort_date')}</option>
            <option value="total_amount">{t('orders.dashboard.sort_amount')}</option>
            <option value="status">{t('orders.dashboard.sort_status')}</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>{t('orders.dashboard.sort_order')}</label>
          <select 
            name="sort_order" 
            value={filters.sort_order} 
            onChange={handleChange}
            className={styles.filterSelect}
          >
            <option value="desc">{t('orders.dashboard.descending')}</option>
            <option value="asc">{t('orders.dashboard.ascending')}</option>
          </select>
        </div>
      </div>

      <div className={styles.filterRow}>
        <div className={styles.filterGroup}>
          <label>{t('orders.dashboard.search_order_label')}</label>
          <input 
            type="text" 
            name="search" 
            value={filters.search} 
            onChange={handleChange}
            placeholder={t('orders.dashboard.search_order')}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <label>{t('orders.dashboard.user_id')}</label>
          <input 
            type="number" 
            name="user_id" 
            value={filters.user_id} 
            onChange={handleChange}
            placeholder={t('orders.dashboard.filter_user')}
            className={styles.filterInput}
          />
        </div>
      </div>
    </div>
  );
};

export default OrderFilters;