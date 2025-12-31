import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './';

const OrderStats = ({ stats }) => {
  const { t } = useTranslation();

  const calculateAverage = () => {
    if (stats.total_orders > 0 && stats.total_spent > 0) {
      return (stats.total_spent / stats.total_orders).toFixed(2);
    }
    return '0.00';
  };

  return (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <div className={styles.statIcon}>📦</div>
        <h3>{t('orders.total_orders')}</h3>
        <p className={styles.statNumber}>{stats.total_orders || 0}</p>
      </div>
      
      <div className={styles.statCard}>
        <div className={styles.statIcon}>⏳</div>
        <h3>{t('orders.pending')}</h3>
        <p className={styles.statNumber}>{stats.pending_orders || 0}</p>
      </div>
      
      <div className={styles.statCard}>
        <div className={styles.statIcon}>✅</div>
        <h3>{t('orders.completed')}</h3>
        <p className={styles.statNumber}>{stats.completed_orders || 0}</p>
      </div>
      
      <div className={styles.statCard}>
        <div className={styles.statIcon}>💰</div>
        <h3>{t('orders.total_spent')}</h3>
        <p className={styles.statNumber}>${(stats.total_spent || 0).toFixed(2)}</p>
      </div>
      
      <div className={styles.statCard}>
        <div className={styles.statIcon}>📊</div>
        <h3>{t('orders.stats.average_order')}</h3>
        <p className={styles.statNumber}>${calculateAverage()}</p>
      </div>
    </div>
  );
};

export default OrderStats;