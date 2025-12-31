// src/Hooks/useDashboardData.js
import { useAdminData } from '../Context/AdminDataContext';
import { Axios } from '../API/axios';
import { DASHBOARD_PREFIX } from '../API/API';
import { useCallback } from 'react';

export const useDashboardData = () => {
  const { fetchWithCache, updateCache, clearCache, getCache, generateCacheKey } = useAdminData();

  // دالة واحدة لكل شيء
// في useDashboardData.js
const getData = useCallback(async (type, params = {}) => {
  const endpoints = {
       users: async (p) => {
      // ✅ نفس endpoint للبحث العادي والبحث
      const response = await Axios.get(`${DASHBOARD_PREFIX}/users`, { params: p });
      return response.data;
    },

    products: async (p) => {
      const response = await Axios.get('/products', { params: p });
      return response.data;
    },
    categories: async (p) => {
      const response = await Axios.get('/categories', { params: p });
      return response.data;
    },
    orders: async (p) => {
      const response = await Axios.get(`${DASHBOARD_PREFIX}/orders`, { params: p });
      return response.data;
    },
    activities: async (p) => {
      const response = await Axios.get('/activities', { params: p });
      return response.data;
    },
    stats: async (p) => {
      const response = await Axios.get(`${DASHBOARD_PREFIX}/orders/stats/dashboard`, { params: p });
      return response.data;
    }
  };

  if (!endpoints[type]) {
    throw new Error(`Unknown data type: ${type}`);
  }

  const data = await fetchWithCache(type, endpoints[type], params);
  return data;
    
}, [fetchWithCache]);

  // ✅ تعديل refreshData لاستقبال params
  const refreshData = useCallback((type, params = {}) => {
    clearCache(type, params);
  }, [clearCache]);

  // ✅ دالة مساعدة لمسح الكاش بناءً على نمط معين
  const clearCacheByPattern = useCallback((type, pattern = {}) => {
    const cache = getCache();
    Object.keys(cache).forEach(cacheKey => {
      if (cacheKey.startsWith(`${type}_`)) {
        // مسح إذا تطابق النمط
        let shouldDelete = true;
        Object.keys(pattern).forEach(key => {
          if (!cacheKey.includes(`"${key}":${JSON.stringify(pattern[key])}`)) {
            shouldDelete = false;
          }
        });
        if (shouldDelete) {
          delete cache[cacheKey];
        }
      }
    });
  }, [getCache]);

  return {
    getData,
    refreshData,
    updateCache,
    clearCacheByPattern,
    clearAllCache: useCallback(() => {
      ['users', 'products', 'categories', 'orders', 'activities', 'stats'].forEach(type => {
        clearCache(type);
      });
    }, [clearCache]),
    getCache,
    generateCacheKey
  };
};