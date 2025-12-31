// src/Context/PublicUsersContext.js
import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import Cookie from 'cookie-universal';
import { Axios } from '../API/axios';
import { USER } from '../API/API';

const PublicUsersContext = createContext();

export const PublicUsersProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cookie = Cookie();
  const isFetching = useRef(false);

  // fetchUser مع منع التكرار
  const fetchUser = useCallback(async (force = false) => {
    // منع الطلبات المتزامنة
    if (isFetching.current && !force) return;
    if (!force && user) return; // إذا لدينا بيانات، لا نرسل طلب جديد

    const token = cookie.get("e-commerce");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      isFetching.current = true;
      setLoading(true);
      const response = await Axios.get(`/${USER}`);
      setUser(response.data);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        cookie.remove("e-commerce");
        setUser(null);
      }
      setError(err.message);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [cookie, user]);

  // جلب البيانات مرة واحدة عند التحميل
  useEffect(() => {
    fetchUser();
    return () => {
      isFetching.current = false;
    };
  }, [fetchUser]);

  const login = (token, userData) => {
    cookie.set("e-commerce", token, { path: '/', sameSite: 'Lax' });
    setUser(userData);
    setLoading(false);
  };

  const logout = async () => {
    try {
      const token = cookie.get("e-commerce");
      if (token) {
        await Axios.get('/logout', {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      // يمكن لاحقًا إضافة رسالة خطأ مركزية
    } finally {
      cookie.remove("e-commerce");
      setUser(null);
      setLoading(false);
    }
  };

  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  return (
    <PublicUsersContext.Provider value={{
      user,
      loading,
      error,
      login,
      logout,
      fetchUser,
      updateUser,
      isAuthenticated: !!user
    }}>
      {children}
    </PublicUsersContext.Provider>
  );
};

export const usePublicUsers = () => {
  const context = useContext(PublicUsersContext);
  if (!context) {
    throw new Error('usePublicUsers must be used within a PublicUsersProvider');
  }
  return context;
};
