// src/Context/AdminDataContext.js
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const AdminDataContext = createContext();

export const AdminDataProvider = ({ children }) => {
  // استخدم useRef بدلاً من useState للكاش
  const cacheRef = useRef({});

  // state فقط لـ force re-render عند الحاجة
  const [version, setVersion] = useState(0);

  // ✅ دالة لإنشاء مفتاح فريد بناءً على النوع والمعلمات
  const generateCacheKey = useCallback((key, params = {}) => {
    const paramsString = JSON.stringify(params);
    return `${key}_${paramsString}`;
  }, []);

 // في AdminDataContext.js
const fetchWithCache = useCallback(async (key, fetchFunction, params = {}) => {
  const now = Date.now();
  const cacheKey = generateCacheKey(key, params);
  const cached = cacheRef.current[cacheKey];
  
  if (cached && cached.timestamp && (now - cached.timestamp < 300000)) {
    return cached.data;
  }

  // ✅ تمرير params إلى fetchFunction
  const data = await fetchFunction(params); // ⚠️ هنا التعديل!
  
  cacheRef.current[cacheKey] = { 
    data, 
    timestamp: now 
  };
  
  setVersion(prev => prev + 1);
  
  return data;
}, [generateCacheKey]);

  const updateCache = useCallback((key, newData, params = {}) => {
    const cacheKey = generateCacheKey(key, params);
    cacheRef.current[cacheKey] = { 
      data: newData, 
      timestamp: Date.now() 
    };
    setVersion(prev => prev + 1);
  }, [generateCacheKey]);

  const clearCache = useCallback((key, params = {}) => {
    const cacheKey = generateCacheKey(key, params);
    if (params && Object.keys(params).length > 0) {
      // مسح مفتاح محدد
      delete cacheRef.current[cacheKey];
    } else {
      // مسح جميع مفاتيح هذا النوع
      Object.keys(cacheRef.current).forEach(cacheKey => {
        if (cacheKey.startsWith(`${key}_`)) {
          delete cacheRef.current[cacheKey];
        }
      });
    }
    setVersion(prev => prev + 1);
  }, [generateCacheKey]);

  // دالة للحصول على بيانات الكاش الحالية
  const getCache = useCallback(() => {
    return cacheRef.current;
  }, []);

  return (
    <AdminDataContext.Provider value={{
      fetchWithCache,
      updateCache,
      clearCache,
      getCache,
      cacheVersion: version,
      generateCacheKey // ✅ أضف هذه الدالة
    }}>
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = () => useContext(AdminDataContext);