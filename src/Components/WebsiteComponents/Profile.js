import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Axios } from '../../API/axios';
import { USER } from '../../API/API';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../Context/SettingsContext';
import Navbar from './HomeNavbarComponents/Navbar';
import CartModal from './HomeNavbarComponents/CartModal';
import LoadingSubmit from '../Loading/Loading';
import styles from './Profile.module.css';

const Profile = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderStats, setOrderStats] = useState({
    total_orders: 0,
    pending_orders: 0,
    completed_orders: 0,
    total_spent: 0
  });

  useEffect(() => {
    fetchUserData();
    fetchOrderStats();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await Axios.get(`/${USER}`);
      setUser(response.data);
    } catch {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      setLoadingStats(true);
      const response = await Axios.get("/user/orders/stats");
      if (response.data.success) {
        const data = response.data.data;
        setOrderStats({
          total_orders: data.total_orders || 0,
          pending_orders: data.pending_orders || 0,
          completed_orders: data.delivered_orders || 0,
          total_spent: data.total_spent || 0
        });
      }
    } finally {
      setLoadingStats(false);
    }
  };

  const handleOpenCart = () => setIsCartOpen(true);
  const handleCloseCart = () => setIsCartOpen(false);

  const getRoleText = (role) => {
    const roles = {
      '1995': t('profile.role_admin'),
      '2001': t('profile.role_user'),
      '1996': t('profile.role_writer'),
      '1999': t('profile.role_product_manager')
    };
    return roles[role] || t('profile.role_unknown');
  };

  const formatPrice = (price) => (Number(price) || 0).toFixed(2);

  if (loading) {
    return (
      <div className={styles.profilePage} data-theme={settings.theme}>
        <Navbar onOpenCart={handleOpenCart} />
        <div className={styles.loadingContainer}>
          <LoadingSubmit />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profilePage} data-theme={settings.theme}>
      <Navbar onOpenCart={handleOpenCart} />

      <div className={styles.profileContainer}>
        <div className={styles.profileHeader}>
          <h1>{t('profile.title')}</h1>
          <p>{t('profile.subtitle')}</p>
        </div>

        <div className={styles.profileContent}>
          <div className={styles.profileCard}>
            <div className={styles.userInfo}>
              <div className={styles.avatarSection}>
                <div className={styles.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
                <h2>{user?.name}</h2>
                <span className={styles.roleBadge}>{getRoleText(user?.role)}</span>
              </div>

              <div className={styles.detailsSection}>
                <div className={styles.infoGroup}>
                  <h3>{t('profile.personal_info')}</h3>
                  <div className={styles.infoItem}>
                    <label>{t('profile.name')}</label>
                    <span>{user?.name}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>{t('profile.email')}</label>
                    <span>{user?.email}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>{t('profile.role')}</label>
                    <span>{getRoleText(user?.role)}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>{t('profile.member_since')}</label>
                    <span>{new Date(user?.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className={styles.actionsGroup}>
                  <h3>{t('profile.quick_actions')}</h3>
                  <button className={styles.actionBtn} onClick={() => navigate("/edit-profile")}>
                    {t('profile.edit_profile')}
                  </button>
                  <button className={styles.actionBtn} onClick={() => navigate("/orders")}>
                    {t('profile.view_orders')}
                  </button>
                  <button className={styles.actionBtn} onClick={() => navigate('/settings')}>
                    {t('profile.account_settings')}
                  </button>
                  <button className={styles.actionBtn} onClick={() => navigate('/')}>
                    {t('profile.continue_shopping')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.statsCard}>
            <h3>{t('profile.account_overview')}</h3>
            {loadingStats ? (
              <div className={styles.statsLoading}>
                <LoadingSubmit small={true} />
              </div>
            ) : (
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>{orderStats.total_orders}</span>
                  <span className={styles.statLabel}>{t('profile.total_orders')}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>{orderStats.pending_orders}</span>
                  <span className={styles.statLabel}>{t('profile.pending_orders')}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>{orderStats.completed_orders}</span>
                  <span className={styles.statLabel}>{t('profile.completed_orders')}</span>
                </div>
                {/* ⬇️ هذا سطر جديد مطلوب ⬇️ */}
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>${formatPrice(orderStats.total_spent)}</span>
                  <span className={styles.statLabel}>{t('profile.total_spent')}</span>
                </div>
              </div>
            )}
          </div>

          {!loadingStats && orderStats.total_orders > 0 && (
            <div className={styles.additionalStats}>
              <h4>{t('profile.order_insights')}</h4> {/* ⬅️ يجب تعديل JSON لهذا المفتاح */}
              <div className={styles.insightItems}>
                <div className={styles.insightItem}>
                  <span className={styles.insightIcon}>📊</span>
                  <div>
                    <p className={styles.insightTitle}>{t('profile.avg_order_value')}</p>
                    <p className={styles.insightValue}>
                      ${orderStats.total_orders > 0 ? formatPrice(orderStats.total_spent / orderStats.total_orders) : '0.00'}
                    </p>
                  </div>
                </div>
                <div className={styles.insightItem}>
                  <span className={styles.insightIcon}>✅</span>
                  <div>
                    <p className={styles.insightTitle}>{t('profile.completion_rate')}</p>
                    <p className={styles.insightValue}>
                      {orderStats.total_orders > 0 ? Math.round((orderStats.completed_orders / orderStats.total_orders) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <CartModal isOpen={isCartOpen} onClose={handleCloseCart} />
    </div>
  );
};

export default Profile;