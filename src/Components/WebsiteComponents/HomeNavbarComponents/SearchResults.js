import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Axios } from '../../../API/axios';
import { PRODUCTS } from '../../../API/API';
import LoadingSubmit from '../../../Components/Loading/Loading';
import ProductCard from '../../../Components/WebsiteComponents/ProductCard';
import ProductCardSkeleton from '../../../Components/WebsiteComponents/ProductCardSkeleton';
import Navbar from '../../../Components/WebsiteComponents/HomeNavbarComponents/Navbar';
import CartModal from '../../../Components/WebsiteComponents/HomeNavbarComponents/CartModal'; // أضف هذا الاستيراد
import styles from './SearchResults.module.css';
import { useTranslation } from 'react-i18next';

const SearchResults = () => {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchExecuted, setSearchExecuted] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get('q') || '';
  const isArabic = i18n.language === 'ar';

  useEffect(() => {
    document.documentElement.setAttribute('dir', isArabic ? 'rtl' : 'ltr');
    document.body.classList.toggle('arabic', isArabic);
  }, [isArabic]);

  useEffect(() => {
    if (query) {
      fetchSearchResults(query);
    } else {
      navigate('/');
    }
  }, [query, navigate]);

  const fetchSearchResults = async (searchQuery) => {
    try {
      setLoading(true);
      setSearchExecuted(false);

      const response = await Axios.get(`/${PRODUCTS}?title=${encodeURIComponent(searchQuery)}`);
      setProducts(response.data.data || response.data);
    } catch (err) {
      console.error('Search error:', err);
      setProducts([]);
    } finally {
      setLoading(false);
      setSearchExecuted(true);
    }
  };

  const theme = document.body.getAttribute('data-theme') || 'light';

  if (!searchExecuted && loading) {
    return (
      <div className={`${styles.loadingContainer} ${styles[theme]} ${isArabic ? styles.rtl : styles.ltr}`}>
        <LoadingSubmit />
        <p className={styles.loadingText}>{t('searching_products')}</p>
      </div>
    );
  }

  return (
    <div className={`${styles.searchResultsPage} ${styles[theme]} ${isArabic ? styles.rtl : styles.ltr}`}>
      <Navbar onOpenCart={() => setCartModalOpen(true)} />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {t('search_results_for')} "{query}"
          </h1>
          <p className={styles.resultsCount}>
            {products.length}{' '}
            {products.length === 1 ? t('single_product_found') : t('multiple_products_found')}
          </p>
        </div>

        {loading ? (
          <div className={styles.skeletonGrid}>
            {[...Array(8)].map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className={styles.productsGrid}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className={styles.noResults}>
            <div className={styles.noResultsIcon}>🔍</div>
            <h3>{t('no_products_found')}</h3>
            <p>{t('try_different_keywords')}</p>
            <div className={styles.suggestions}>
              <p>{t('suggestions')}:</p>
              <ul>
                <li>{t('check_spelling')}</li>
                <li>{t('use_general_terms')}</li>
                <li>{t('browse_by_category')}</li>
              </ul>
            </div>
            <button onClick={() => navigate('/')} className={styles.browseBtn}>
              {t('back_to_homepage')}
            </button>
          </div>
        )}
      </div>

      {/* أضف هذا السطر فقط في النهاية */}
      <CartModal isOpen={cartModalOpen} onClose={() => setCartModalOpen(false)} />
    </div>
  );
};

export default SearchResults;