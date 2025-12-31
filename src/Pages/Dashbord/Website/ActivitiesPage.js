//src/Pages/Dashbord/Website/ActivitiesPage.js

import React, { useState, useEffect } from 'react';
import { Axios } from '../../../API/axios';
import { format, formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styles from './Css-files/ActivitiesPage.module.css';
import { useAlert } from '../../../Context/AlertContext'; // 👈 استيراد useAlert

const ActivitiesPage = () => {
  const { t, i18n } = useTranslation();
  
  // 👈 استخدام الألرت المركزي
  const { showDeleteConfirm, showSuccess, showError, showInfo, showConfirm } = useAlert();
  
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    // جلب البيانات فقط عند تحميل الصفحة أو تغيير الصفحة/الفلتر
    fetchActivitiesDirect();
  }, [currentPage, filter]);

  // دالة لجلب البيانات مباشرة بدون كاش
  const fetchActivitiesDirect = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // استخدام Axios مباشرة بدون كاش
      const response = await Axios.get('/activities');
      
      if (response.data.success) {
        setActivities(response.data.data);
        setTotalPages(Math.ceil(response.data.data.length / itemsPerPage));
      } else {
        const errorMsg = t('activities.fetch_error');
        setError(errorMsg);
        showError(errorMsg); // 👈 رسالة خطأ
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      const errorMsg = err.response?.data?.message || t('activities.fetch_error');
      setError(errorMsg);
      showError(errorMsg); // 👈 رسالة خطأ
    } finally {
      setLoading(false);
    }
  };

  // دالة لحذف نشاط واحد
  const handleDeleteActivity = async (activityId) => {
    showDeleteConfirm({
      title: t('activities.confirm_delete_title'),
      message: t('activities.confirm_delete_message'),
      onConfirm: async () => {
        try {
          // 1. تحديث واجهة المستخدم فوراً (حذف محلي)
          const updatedActivities = activities.filter(a => a.id !== activityId);
          setActivities(updatedActivities);
          
          // 2. تحديث العدد الإجمالي وصفحات الترقيم
          setTotalPages(Math.ceil(updatedActivities.length / itemsPerPage));
          
          // 3. حذف من السيرفر (بدون إعادة جلب البيانات)
          const response = await Axios.delete(`/activities/${activityId}`);
          
          if (!response.data.success) {
            // إذا فشل الحذف في السيرفر، أعد جلب البيانات للتزامن
            fetchActivitiesDirect();
            const errorMsg = response.data.message || t('activities.delete_error');
            showError(errorMsg); // 👈 رسالة خطأ
          } else {
            showSuccess(t('activities.delete_success')); // 👈 رسالة نجاح
          }
          
        } catch (err) {
     
          
          // في حالة الخطأ، أعد جلب البيانات للتأكد من التزامن
          fetchActivitiesDirect();
          
          const errorMsg = err.response?.data?.message || t('activities.delete_error');
          showError(errorMsg); // 👈 رسالة خطأ
        }
      },
      onCancel: () => {
        // المستخدم ألغى الحذف
        console.log("Delete activity cancelled");
      }
    });
  };

  // دالة لحذف جميع الأنشطة
  const handleClearAll = async () => {
    showConfirm({
      title: t('activities.confirm_clear_all_title'),
      message: t('activities.confirm_clear_all_message'),
      type: 'danger',
      confirmText: t('activities.clear_all_confirm'),
      onConfirm: async () => {
        try {
          // 1. تحديث الواجهة فوراً
          setActivities([]);
          setTotalPages(1);
          
          // 2. مسح من السيرفر
          await Axios.delete('/activities/clear/all');
          
          showSuccess(t('activities.clear_all_success')); // 👈 رسالة نجاح
          
        } catch (err) {
          console.error('Error clearing activities:', err);
          
          // في حالة الخطأ، أعد جلب البيانات
          fetchActivitiesDirect();
          
          const errorMsg = err.response?.data?.message || t('activities.clear_all_error');
          showError(errorMsg); // 👈 رسالة خطأ
        }
      },
      onCancel: () => {
        // المستخدم ألغى المسح
        console.log("Clear all cancelled");
      }
    });
  };

  // دالة لحذف أنشطة اليوم
  const handleClearToday = async () => {
    showConfirm({
      title: t('activities.confirm_clear_today_title'),
      message: t('activities.confirm_clear_today_message'),
      confirmText: t('activities.clear_today_confirm'),
      onConfirm: async () => {
        try {
          const today = new Date();
          const todayString = today.toDateString();
          
          // 1. تحديد الأنشطة التي ستحذف
          const todayActivities = activities.filter(activity => {
            const activityDate = new Date(activity.created_at);
            return activityDate.toDateString() === todayString;
          });
          
          // 2. تحديث الواجهة فوراً
          const remainingActivities = activities.filter(activity => {
            const activityDate = new Date(activity.created_at);
            return activityDate.toDateString() !== todayString;
          });
          
          setActivities(remainingActivities);
          setTotalPages(Math.ceil(remainingActivities.length / itemsPerPage));
          
          // 3. مسح من السيرفر
          await Axios.delete('/activities/clear/today');
          
          showSuccess(t('activities.clear_today_success', { count: todayActivities.length })); // 👈 رسالة نجاح
          
        } catch (err) {
          console.error('Error clearing today activities:', err);
          
          // في حالة الخطأ، أعد جلب البيانات
          fetchActivitiesDirect();
          
          showError(t('activities.clear_today_error')); // 👈 رسالة خطأ
        }
      },
      onCancel: () => {
        // المستخدم ألغى المسح
        console.log("Clear today cancelled");
      }
    });
  };

  const getActivityIcon = (action) => {
    const icons = {
      create: '➕',
      update: '✏️',
      delete: '🗑️',
      login: '🔐',
      logout: '🚪',
      register: '👤',
      purchase: '💰',
      review: '⭐',
      settings: '⚙️',
      order: '📦',
      default: '🔔'
    };
    return icons[action] || icons.default;
  };

  const getActivityColor = (action) => {
    const colors = {
      create: '#10b981',
      update: '#3b82f6',
      delete: '#ef4444',
      login: '#8b5cf6',
      logout: '#64748b',
      register: '#06b6d4',
      purchase: '#f59e0b',
      review: '#ec4899',
      settings: '#6366f1',
      order: '#059669',
      default: '#6b7280'
    };
    return colors[action] || colors.default;
  };

  const formatActionText = (action) => {
    const actions = {
      create: t('activities.actions.create'),
      update: t('activities.actions.update'),
      delete: t('activities.actions.delete'),
      login: t('activities.actions.login'),
      logout: t('activities.actions.logout'),
      register: t('activities.actions.register'),
      purchase: t('activities.actions.purchase'),
      review: t('activities.actions.review'),
      settings: t('activities.actions.settings'),
      order: t('activities.actions.order')
    };
    return actions[action] || action;
  };

  const filterActivities = () => {
    let filtered = [...activities];
    
    if (filter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.created_at);
        
        switch (filter) {
          case 'today':
            return activityDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return activityDate >= weekAgo;
          case 'month':
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return activityDate >= monthAgo;
          default:
            return true;
        }
      });
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(activity => 
        activity.description?.toLowerCase().includes(term) ||
        activity.action?.toLowerCase().includes(term) ||
        activity.user?.name?.toLowerCase().includes(term) ||
        activity.entity_type?.toLowerCase().includes(term)
      );
    }
    
    // تطبيق الترقيم
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    fetchActivitiesDirect();
    showInfo(t('activities.refresh_success')); // 👈 رسالة معلومات
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const filteredActivities = filterActivities();
  const totalFiltered = filter !== 'all' || searchTerm 
    ? activities.filter(activity => {
        if (filter !== 'all') {
          const now = new Date();
          const activityDate = new Date(activity.created_at);
          
          switch (filter) {
            case 'today':
              return activityDate.toDateString() === now.toDateString();
            case 'week':
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return activityDate >= weekAgo;
            case 'month':
              const monthAgo = new Date();
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              return activityDate >= monthAgo;
            default:
              return true;
          }
        }
        return true;
      }).filter(activity => {
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          return (
            activity.description?.toLowerCase().includes(term) ||
            activity.action?.toLowerCase().includes(term) ||
            activity.user?.name?.toLowerCase().includes(term) ||
            activity.entity_type?.toLowerCase().includes(term)
          );
        }
        return true;
      }).length
    : activities.length;

  if (loading && activities.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>{t('activities.loading')}</p>
      </div>
    );
  }

  return (
    <div className={styles.activitiesContainer}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1>{t('activities.title')}</h1>
          <p className={styles.subtitle}>{t('activities.subtitle')}</p>
        </div>
        <div className={styles.headerActions}>
          <Link to="/dashboard" className={styles.backBtn}>
            {t('activities.back_to_dashboard')}
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className={styles.statsSummary}>
        <div className={styles.statItem}>
          <div className={styles.statIcon}>📊</div>
          <div className={styles.statContent}>
            <h3>{activities.length}</h3>
            <p>{t('activities.total_activities')}</p>
          </div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statContent}>
            <h3>{new Set(activities.map(a => a.user?.id)).size}</h3>
            <p>{t('activities.active_users')}</p>
          </div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statIcon}>⏰</div>
          <div className={styles.statContent}>
            <h3>{activities.filter(a => {
              const activityDate = new Date(a.created_at);
              const today = new Date();
              return activityDate.toDateString() === today.toDateString();
            }).length}</h3>
            <p>{t('activities.today')}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controlsSection}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder={t('activities.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <button className={styles.searchButton}>🔍</button>
        </div>

        <div className={styles.filterControls}>
          <div className={styles.filterButtons}>
            <button
              className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
              onClick={() => {
                setFilter('all');
                setCurrentPage(1);
              }}
            >
              {t('activities.filters.all')}
            </button>
            <button
              className={`${styles.filterBtn} ${filter === 'today' ? styles.active : ''}`}
              onClick={() => {
                setFilter('today');
                setCurrentPage(1);
              }}
            >
              {t('activities.filters.today')}
            </button>
            <button
              className={`${styles.filterBtn} ${filter === 'week' ? styles.active : ''}`}
              onClick={() => {
                setFilter('week');
                setCurrentPage(1);
              }}
            >
              {t('activities.filters.this_week')}
            </button>
            <button
              className={`${styles.filterBtn} ${filter === 'month' ? styles.active : ''}`}
              onClick={() => {
                setFilter('month');
                setCurrentPage(1);
              }}
            >
              {t('activities.filters.this_month')}
            </button>
          </div>

          <div className={styles.actionButtons}>
            <button onClick={handleRefresh} className={styles.refreshBtn}>
              🔄 {t('activities.refresh')}
            </button>
            <button onClick={handleClearToday} className={styles.clearTodayBtn}>
              🗑️ {t('activities.clear_today')}
            </button>
            <button onClick={handleClearAll} className={styles.clearBtn}>
              💥 {t('activities.clear_all')}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={styles.errorContainer}>
          <p>{error}</p>
          <button onClick={fetchActivitiesDirect} className={styles.retryButton}>
            {t('activities.retry')}
          </button>
        </div>
      )}

      {/* Activities List */}
      <div className={styles.activitiesList}>
        {filteredActivities.length > 0 ? (
          <>
            {filteredActivities.map((activity) => {
              const activityDate = new Date(activity.created_at);
              const icon = getActivityIcon(activity.action);
              const color = getActivityColor(activity.action);
              
              return (
                <div key={activity.id} className={styles.activityCard}>
                  <div className={styles.activityHeader}>
                    <div className={styles.activityIcon} style={{ color }}>
                      {icon}
                    </div>
                    <div className={styles.activityInfo}>
                      <h4 className={styles.activityTitle}>
                        {formatActionText(activity.action)}
                      </h4>
                      <div className={styles.activityMeta}>
                        <span className={styles.activityTime}>
                          {format(activityDate, 'yyyy-MM-dd HH:mm')}
                        </span>
                        <span className={styles.activityRelativeTime}>
                          • {formatDistanceToNow(activityDate, { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteActivity(activity.id)}
                      className={styles.deleteActivityBtn}
                      title={t('activities.delete_this_activity')}
                    >
                      ✕
                    </button>
                  </div>

                  <div className={styles.activityBody}>
                    <p className={styles.activityDescription}>
                      {activity.description}
                    </p>
                    
                    {activity.entity_type && (
                      <div className={styles.activityEntity}>
                        <span className={styles.entityType}>
                          {t('activities.entity')}: {activity.entity_type}
                        </span>
                        {activity.entity_id && (
                          <span className={styles.entityId}>
                            ID: {activity.entity_id}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {activity.user && (
                    <div className={styles.activityFooter}>
                      <div className={styles.userInfo}>
                        <span className={styles.userIcon}>👤</span>
                        <div className={styles.userDetails}>
                          <span className={styles.userName}>
                            {activity.user.name}
                          </span>
                          <span className={styles.userRole}>
                            {t('activities.user')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pagination */}
            {Math.ceil(totalFiltered / itemsPerPage) > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={styles.pageButton}
                >
                  ← {t('activities.previous')}
                </button>
                
                <div className={styles.pageNumbers}>
                  {(() => {
                    const totalPages = Math.ceil(totalFiltered / itemsPerPage);
                    const maxPagesToShow = 5;
                    
                    if (totalPages <= maxPagesToShow) {
                      return Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`${styles.pageNumber} ${
                            currentPage === pageNum ? styles.active : ''
                          }`}
                        >
                          {pageNum}
                        </button>
                      ));
                    }
                    
                    const pages = [];
                    
                    // إضافة الصفحة الأولى
                    pages.push(
                      <button
                        key={1}
                        onClick={() => handlePageChange(1)}
                        className={`${styles.pageNumber} ${
                          currentPage === 1 ? styles.active : ''
                        }`}
                      >
                        1
                      </button>
                    );
                    
                    // إضافة النقاط إذا كان هناك فجوة
                    if (currentPage > 3) {
                      pages.push(<span key="left-dots" className={styles.pageDots}>...</span>);
                    }
                    
                    // إضافة الصفحات حول الصفحة الحالية
                    for (
                      let i = Math.max(2, currentPage - 1);
                      i <= Math.min(totalPages - 1, currentPage + 1);
                      i++
                    ) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => handlePageChange(i)}
                          className={`${styles.pageNumber} ${
                            currentPage === i ? styles.active : ''
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }
                    
                    // إضافة النقاط إذا كان هناك فجوة
                    if (currentPage < totalPages - 2) {
                      pages.push(<span key="right-dots" className={styles.pageDots}>...</span>);
                    }
                    
                    // إضافة الصفحة الأخيرة
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => handlePageChange(totalPages)}
                        className={`${styles.pageNumber} ${
                          currentPage === totalPages ? styles.active : ''
                        }`}
                      >
                        {totalPages}
                      </button>
                    );
                    
                    return pages;
                  })()}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === Math.ceil(totalFiltered / itemsPerPage)}
                  className={styles.pageButton}
                >
                  {t('activities.next')} →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>📭</div>
            <h3>{t('activities.no_activities_found')}</h3>
            <p>{t('activities.no_activities_description')}</p>
            <button onClick={fetchActivitiesDirect} className={styles.retryButton}>
              {t('activities.refresh')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivitiesPage;