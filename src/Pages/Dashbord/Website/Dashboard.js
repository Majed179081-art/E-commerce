import React from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from '../../../Components/Dashboard component/Topbar';
import Sidebar from '../../../Components/Dashboard component/Sidebar';
import { useSidebar } from '../../../Context/SidebarContext';
import { useDashboardSettings } from '../../../Context/DashboardSettingsContext';
import styles from './Css-files/dashboard.module.css';

const Dashboard = () => {
  const { isSidebarOpen, isMobile, closeSidebar } = useSidebar();
  const { settings } = useDashboardSettings(); // استخدام اللغة من الإعدادات

  // تحديد الكلاس المناسب بناءً على حالة السايدبار
  const mainContentClass = isSidebarOpen && !isMobile
    ? styles.mainContentWithSidebar 
    : styles.mainContent;

  // إضافة RTL إذا كانت اللغة عربية
  const dashboardClass = `
    ${styles.dashboardContainer} 
    ${settings?.language === 'ar' ? styles.rtl : styles.ltr}
  `;

  return (
    <div className={dashboardClass}>
      <TopBar />
      <div 
        className={styles.dashboardContent}
        style={{
          flexDirection: settings?.language === 'ar' ? 'row-reverse' : 'row',
        }}
      >
        <Sidebar />
        
        {/* Overlay للـ Mobile عندما يكون Sidebar مفتوح */}
        {isSidebarOpen && isMobile && (
          <div 
            className={styles.sidebarOverlay}
            onClick={closeSidebar}
          />
        )}
        
        <main className={mainContentClass}>
          <div className={styles.contentWrapper}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
