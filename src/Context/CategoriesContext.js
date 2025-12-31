// Context/CategoriesContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Axios } from '../API/axios';
import { CATEGORIES } from '../API/API';
import { useAlert } from './AlertContext';
import { useTranslation } from 'react-i18next';

const CategoriesContext = createContext();

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
};

export const CategoriesProvider = ({ children }) => {
  const { t } = useTranslation();
  const {  showError } = useAlert();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await Axios.get(`/${CATEGORIES}?limit=500000`);
      const data = response.data?.data || [];
      setCategories(data);


    } catch (err) {
      setError(t('categories.fetch_error', 'Failed to fetch categories'));

      // رسالة خطأ مركزية
      showError(t('categories.fetch_error', 'Failed to fetch categories'));
    } finally {
      setLoading(false);
    }
  }, [ showError, t]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const value = {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
};
