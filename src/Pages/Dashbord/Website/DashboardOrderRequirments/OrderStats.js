import React, { useState, useEffect } from 'react';
import styles from './OrderRequirments-Css/OrderStats.module.css';
import { useTranslation } from 'react-i18next';
import { useDashboardData } from '../../../../Hooks/UseDashboardData'; // ✅ استيراد الهوك

const OrderStats = () => {
  const { t } = useTranslation();
  const { getData } = useDashboardData(); // ✅ استخدام الهوك
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // ✅ استخدام getData بدلاً من Axios مباشرة
      const statsData = await getData('stats');
      
      // افتراض أن API يرجع { success: true, data: {...} }
      if (statsData.success) {
        setStats(statsData.data);
      } else if (statsData.data) {
        // أو إذا كان الهيكل مختلفاً
        setStats(statsData);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // دالة لتحويل أي قيمة إلى رقم
  const toNumber = (value) => {
    if (value === null || value === undefined) return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  // دالة لتنسيق السعر
  const formatPrice = (value) => {
    const num = toNumber(value);
    return num.toFixed(2);
  };

  if (loading) {
    return <div className={styles.loading}>{t('loading')}...</div>;
  }

  return (
    <div className={styles.statsContainer}>
      <h2 className={styles.statsTitle}>{t('orders.dashboard.stats.overview')}</h2>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📦</div>
          <div className={styles.statContent}>
            <h3>{t('orders.dashboard.stats.total_orders')}</h3>
            <p className={styles.statNumber}>{toNumber(stats.total_orders)}</p>
            <p className={styles.statSubtitle}>{t('orders.dashboard.stats.all_time')}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statContent}>
            <h3>{t('orders.dashboard.stats.total_revenue')}</h3>
            <p className={styles.statNumber}>${formatPrice(stats.total_revenue)}</p>
            <p className={styles.statSubtitle}>{t('orders.dashboard.stats.from_delivered')}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>⏳</div>
          <div className={styles.statContent}>
            <h3>{t('orders.dashboard.stats.pending_orders')}</h3>
            <p className={styles.statNumber}>{toNumber(stats.pending_orders)}</p>
            <p className={styles.statSubtitle}>{t('orders.dashboard.stats.require_attention')}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>📅</div>
          <div className={styles.statContent}>
            <h3>{t('orders.dashboard.stats.today_orders')}</h3>
            <p className={styles.statNumber}>{toNumber(stats.today_orders)}</p>
            <p className={styles.statSubtitle}>{t('orders.dashboard.stats.new_today')}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>📈</div>
          <div className={styles.statContent}>
            <h3>{t('orders.dashboard.stats.monthly_orders')}</h3>
            <p className={styles.statNumber}>{toNumber(stats.monthly_orders)}</p>
            <p className={styles.statSubtitle}>{t('orders.dashboard.stats.this_month')}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>💵</div>
          <div className={styles.statContent}>
            <h3>{t('orders.dashboard.stats.monthly_revenue')}</h3>
            <p className={styles.statNumber}>${formatPrice(stats.monthly_revenue)}</p>
            <p className={styles.statSubtitle}>{t('orders.dashboard.stats.this_month')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStats;