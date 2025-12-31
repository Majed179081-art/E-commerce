import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faSignOutAlt,
  faUser,
  faCog,
  faExclamationTriangle,
  faSun,
  faMoon,
  faGlobe,
  faHistory
} from '@fortawesome/free-solid-svg-icons';
import { useCallback } from 'react';

import { Dropdown } from 'react-bootstrap';
import { useSidebar } from '../../Context/SidebarContext';
import { useNavigate } from 'react-router-dom';
import { Axios } from '../../API/axios';
import { LOGOUT, USER } from '../../API/API';
import Cookie from 'cookie-universal';
import { useDashboardSettings } from '../../Context/DashboardSettingsContext';
import { useTranslation } from 'react-i18next';
import { useAlert } from '../../Context/AlertContext';
import logoImage from '../../Images/Free (2).png';
import styles from './CssFiles/Topbar.module.css';

const TopBar = () => {
  const { toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const cookie = Cookie();

  const { settings, setLocalSettings } = useDashboardSettings();
  const { t, i18n } = useTranslation();
  const { showSuccess, showError, showWarning, showConfirm } = useAlert();

  const [name, setName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [stats, setStats] = useState({
    lowStockProducts: 0,
    recentActivities: 0
  });

  /* ================= Theme & Language ================= */

  const toggleTheme = () => {
    const newTheme = settings?.theme === 'light' ? 'dark' : 'light';
    setLocalSettings({ ...settings, theme: newTheme });
  };

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'en' ? 'ar' : 'en';
    setLocalSettings({ ...settings, language: newLanguage });
  };

  /* ================= Logout ================= */

  const handleLogout = () => {
    showConfirm({
      title: t('common.alerts.confirm_title'),
      message: t('topbar.confirm_logout'),
      onConfirm: async () => {
        try {
          await Axios.get(`/${LOGOUT}`);
          cookie.remove('e-commerce');
          showSuccess(t('topbar.logout_success'));
          navigate('/login');
        } catch {
          showError(t('topbar.logout_error'));
        }
      }
    });
  };

  /* ================= Fetch User & Stats ================= */
const fetchDashboardStats = useCallback(async () => {
  try {
    // المنتجات - استخدام المنتجات الحديثة فقط
    const products = await Axios.get('/products?limit=1000');
    
    // احسب المنتجات التي مخزونها أقل من 10 وتم تحديثها في آخر 24 ساعة
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const lowStock = products.data.data?.filter(p => 
      p.stock < 10 && 
      new Date(p.updated_at || p.created_at) > twentyFourHoursAgo
    ).length || 0;
    
    // الأنشطة - الأنشطة في آخر ساعة فقط
    const activities = await Axios.get('/activities?limit=100');
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentActivities = activities.data.data?.filter(activity => 
      new Date(activity.created_at) > oneHourAgo
    ).length || 0;

    setStats({
      lowStockProducts: lowStock,
      recentActivities
    });
  } catch {
    showWarning(t('topbar.stats_load_error'));
  }
}, [showWarning, t]);
useEffect(() => {
  const fetchUserData = async () => {
    try {
      const { data } = await Axios.get(`/${USER}`);
      setName(data.name);
      setUserRole(
        data.role === '1995'
          ? t('topbar.administrator')
          : t('topbar.user')
      );

      fetchDashboardStats();
    } catch {
      showError(t('topbar.session_expired'));
      navigate('/login', { replace: true });
    }
  };

  fetchUserData();
}, [navigate, t, fetchDashboardStats, showError]);





  /* ================= Navigation ================= */

  const handleLowStockClick = () => {
    navigate('/dashboard/products?filter=low-stock');
  };

  const handleActivitiesClick = () => {
    navigate('/dashboard/activities');
  };

  const handleSettingsClick = () => {
    navigate('/dashboard/settings');
  };

  /* ================= Render ================= */

  return (
    <div className={styles.topBar}>
      <div className={styles.topBarContainer}>

        {/* Left */}
        <div className={styles.topBarLeft}>
          <div className={styles.logoContainer}>
            <img src={logoImage} alt="logo" className={styles.logoImage} />
            <h3 className={styles.dashboardTitle}>
              {t('topbar.dashboard_title')}
            </h3>
          </div>

          <button className={styles.menuButton} onClick={toggleSidebar}>
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>

        {/* Right */}
        <div className={styles.topBarRight}>

          {/* Theme */}
          <button className={styles.iconButton} onClick={toggleTheme}>
            <FontAwesomeIcon icon={settings?.theme === 'light' ? faMoon : faSun} />
          </button>

          {/* Language */}
          <button className={styles.iconButton} onClick={toggleLanguage}>
            <FontAwesomeIcon icon={faGlobe} />
            <span className={styles.languageBadge}>
              {i18n.language === 'en' ? 'EN' : 'AR'}
            </span>
          </button>

          {/* Activities */}
          {stats.recentActivities > 0 && (
            <button className={styles.iconButton} onClick={handleActivitiesClick}>
              <FontAwesomeIcon icon={faHistory} />
              <span className={styles.notificationBadge}>
                {stats.recentActivities}
              </span>
            </button>
          )}

          {/* Low Stock */}
          {stats.lowStockProducts > 0 && (
            <button className={styles.iconButton} onClick={handleLowStockClick}>
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <span className={styles.notificationBadge}>
                {stats.lowStockProducts}
              </span>
            </button>
          )}

          {/* Settings */}
          <button className={styles.iconButton} onClick={handleSettingsClick}>
            <FontAwesomeIcon icon={faCog} />
          </button>

          {/* User Menu */}
          <Dropdown>
            <Dropdown.Toggle className={styles.userDropdown}>
              <FontAwesomeIcon icon={faUser} />
              <div>
                <span>{name}</span>
                <small>{userRole}</small>
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={() => navigate('/profile')}>
                <FontAwesomeIcon icon={faUser} /> {t('topbar.my_profile')}
              </Dropdown.Item>

              <Dropdown.Item onClick={handleSettingsClick}>
                <FontAwesomeIcon icon={faCog} /> {t('topbar.settings')}
              </Dropdown.Item>

              <Dropdown.Divider />

              <Dropdown.Item onClick={handleLogout} className={styles.logoutItem}>
                <FontAwesomeIcon icon={faSignOutAlt} /> {t('topbar.logout')}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

        </div>
      </div>
    </div>
  );
};

export default TopBar;
