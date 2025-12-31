// Pages/TopRatedProducts/TopRatedProducts.js
import React, { useState, useEffect } from "react";
import ProductCard from "../../Components/WebsiteComponents/ProductCard";
import ProductCardSkeleton from "../../Components/WebsiteComponents/ProductCardSkeleton";
import { Axios } from "../../API/axios";
import { TOP_RATED } from "../../API/API";
import styles from "./TopRatedProducts.module.css";
import { useTranslation } from "react-i18next";

const TopRatedProducts = () => {
  const { t, i18n } = useTranslation();
  const [topRatedProducts, setTopRatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopRatedProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await Axios.get(`/${TOP_RATED}?limit=6`);

        let productsData = [];
        if (response.data?.products) {
          productsData = response.data.products;
        } else if (Array.isArray(response.data)) {
          productsData = response.data;
        }

        setTopRatedProducts(productsData);
      } catch {
        setError(t("collections.failed_to_load_top_rated"));
        setTopRatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopRatedProducts();
  }, [t]);

  const handleRetry = () => {
    setError(null);
    setTopRatedProducts([]);
    setLoading(true);
    Axios.get(`/${TOP_RATED}?limit=6`)
      .then((response) => {
        const productsData = response.data?.products || (Array.isArray(response.data) ? response.data : []);
        setTopRatedProducts(productsData);
      })
      .catch(() => setError(t("collections.failed_to_load_top_rated")))
      .finally(() => setLoading(false));
  };

  const renderContent = () => {
    if (loading) {
      return Array.from({ length: 6 }).map((_, index) => <ProductCardSkeleton key={index} />);
    }

    if (error) {
      return (
        <div className={styles.errorContainer}>
          <p>{error}</p>
          <button onClick={handleRetry} className={styles.retryButton}>
            {t("try_again")}
          </button>
        </div>
      );
    }

    if (topRatedProducts.length === 0) {
      return (
        <div className={styles.noProducts}>
          <p>{t("collections.no_top_rated_products")}</p>
        </div>
      );
    }

    return topRatedProducts.map((product) => <ProductCard key={product.id} product={product} />);
  };

  return (
    <div className={styles.topRatedContainer} dir={i18n.dir()}>
      <div className={styles.headerSection}>
        <h2 className={styles.sectionTitle}>{t("collections.top_rated_products")}</h2>
        <p className={styles.sectionSubtitle}>{t("collections.top_rated_subtitle")}</p>
      </div>

      <div className={styles.productsGrid}>{renderContent()}</div>
    </div>
  );
};

export default TopRatedProducts;
