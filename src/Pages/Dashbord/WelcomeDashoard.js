import React, { useState, useEffect } from 'react';
import { Axios } from '../../API/axios';
import { format, formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import styles from './WelcomeDashboard.module.css';
import { Link } from 'react-router-dom';
import { useDashboardData } from '../../Hooks/UseDashboardData'; // ✅ أضف هذا

const WelcomeDashboard = () => {
  const { t } = useTranslation();
  const { getData } = useDashboardData(); // ✅ أضف هذا
  
  const [statsData, setStatsData] = useState({
    totalUsers: '0',
    totalProducts: '0',
    totalCategories: '0',
    totalRevenue: '$0',
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);

    try {
      // ✅ استبدل كل الطلبات بهذا
      const [usersData, productsData, categoriesData, activitiesData] = 
        await Promise.all([
          getData('users', { limit: 1 }),
          getData('products', { limit: 1 }),
          getData('categories', { limit: 50 }),
          getData('activities', { limit: 6 })
        ]);

      // ✅ جلب آخر المنتجات
      let latestProductsRes = { data: [] };
      try {
        latestProductsRes = await Axios.get('/latest-products?limit=3');
      } catch (err) {
        console.error(t('dashboard.fetch_latest_products_error'), err);
      }

      // تحديث البيانات
      setStatsData({
        totalUsers: usersData?.total?.toLocaleString() || '0',
        totalProducts: productsData?.total?.toLocaleString() || '0',
        totalCategories: categoriesData?.total?.toLocaleString() || '0',
        totalRevenue: `$${((productsData?.total || 0) * 49.99).toLocaleString()}`,
      });

      setLatestProducts(latestProductsRes?.data || []);
      setRecentActivities(activitiesData?.data || activitiesData || []);
    } catch (error) {
      console.error(t('dashboard.unexpected_error'), error);
      
      // fallback
      setStatsData({
        totalUsers: '1,234',
        totalProducts: '567',
        totalCategories: '15',
        totalRevenue: '$12,345',
      });
      setLatestProducts([]);
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // Loading skeleton - يبقى كما هو
  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  // الباقي من الكود يبقى كما هو تماماً...
  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.welcomeTitle}>{t('dashboard.welcome_title')}</h1>
          <p className={styles.welcomeSubtitle}>
            {t('dashboard.welcome_subtitle')}
          </p>
        </div>
        <div className={styles.dateSection}>
          <span className={styles.currentDate}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statContent}>
            <h3 className={styles.statValue}>{statsData.totalUsers}</h3>
            <p className={styles.statLabel}>{t('dashboard.total_users')}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>📦</div>
          <div className={styles.statContent}>
            <h3 className={styles.statValue}>{statsData.totalProducts}</h3>
            <p className={styles.statLabel}>{t('dashboard.products')}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>📁</div>
          <div className={styles.statContent}>
            <h3 className={styles.statValue}>{statsData.totalCategories}</h3>
            <p className={styles.statLabel}>{t('dashboard.categories')}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statContent}>
            <h3 className={styles.statValue}>{statsData.totalRevenue}</h3>
            <p className={styles.statLabel}>{t('dashboard.total_revenue')}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Recent Activities */}
        <section className={styles.activitySection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('dashboard.recent_activities')}</h2>
            <Link to="/dashboard/activities" className={styles.viewAllBtn}>
              {t('dashboard.view_all')}
            </Link>
          </div>

          <div className={styles.activitiesList}>
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => {
                const activityDate = new Date(activity.created_at);
                return (
                  <div key={activity.id} className={styles.activityItem}>
                    <div className={styles.activityIcon}>🔔</div>
                    <div className={styles.activityContent}>
                      <h4 className={styles.activityAction}>{activity.action}</h4>
                      <p className={styles.activityDescription}>{activity.description}</p>
                      <span className={styles.activityTime}>
                        {format(activityDate, 'yyyy-MM-dd HH:mm')} •{' '}
                        {formatDistanceToNow(activityDate, { addSuffix: true })}
                      </span>
                      {activity.user && (
                        <p className={styles.activityUser}>
                          {t('dashboard.by_user')} {activity.user.name}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className={styles.noData}>{t('dashboard.no_activities')}</p>
            )}
          </div>
        </section>

        {/* Latest Products */}
        <section className={styles.quickActions}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('dashboard.latest_products')}</h2>
          </div>

          <div className={styles.productsList}>
            {latestProducts.length > 0 ? (
              latestProducts.map((product) => (
                <div key={product.id} className={styles.productItem}>
                  <div className={styles.productImage}>
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0].image}
                        alt={product.title}
                        className={styles.productImg}
                      />
                    ) : (
                      <div className={styles.placeholderImage}>📦</div>
                    )}
                  </div>
                  <div className={styles.productInfo}>
                    <h4 className={styles.productTitle}>{product.title}</h4>
                    <p className={styles.productPrice}>
                      ${product.price ?? '0.00'}
                    </p>
                    {product.discount > 0 && (
                      <span className={styles.discountBadge}>
                        {t('dashboard.discount')} {product.discount}%
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.noData}>{t('dashboard.no_products')}</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default WelcomeDashboard;