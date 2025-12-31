import React, { createContext, useState, useEffect, useContext } from 'react';

export const SidebarContext = createContext();

// Hook مخصص لاستخدام السياق
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 993;
      setIsMobile(mobile);
      
      // في الشاشات الكبيرة نفتح السايدبار افتراضياً
      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // إغلاق السايدبار تلقائيًا عند النقر على رابط في الجوال
  const handleLinkClick = () => {
    if (isMobile) {
      closeSidebar();
    }
  };

  const value = {
    isSidebarOpen,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    handleLinkClick,
    isMobile
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};