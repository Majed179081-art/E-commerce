// Components/WebsiteComponents/LatestProducts.js
import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";
import { Axios } from "../../API/axios";
import { LATEST_PRODUCTS } from "../../API/API";
import styles from "./LatestProducts.module.css";
import { useTranslation } from "react-i18next";
import { useAlert } from "../../Context/AlertContext"; // ✅ Alert مركزي

const LatestProducts = () => {
  const { t } = useTranslation();
  const { showError } = useAlert(); // Alert مركزي
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await Axios.get(`/${LATEST_PRODUCTS}?limit=3`);

        let productsData = [];
        if (response.data?.products) {
          productsData = response.data.products;
        } else if (Array.isArray(response.data)) {
          productsData = response.data;
        }

        setLatestProducts(productsData);
      } catch (err) {
        console.error("Error fetching latest products:", err);
        const errorMessage = t("collections.failed_to_load_latest_products");
        setError(errorMessage);
        setLatestProducts([]);
        showError(errorMessage); // Alert مركزي
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProducts();
  }, [t, showError]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 3 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.errorContainer}>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            {t("category_pages.try_again")}
          </button>
        </div>
      );
    }

    if (latestProducts.length === 0) {
      return (
        <div className={styles.noProducts}>
          <p>{t("collections.no_latest_products")}</p>
        </div>
      );
    }

    return (
      <div className={styles.productsGrid}>
        {latestProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.latestProductsContainer}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>{t("collections.latest_products")}</h3>
        <p className={styles.sectionSubtitle}>{t("collections.check_newest_arrivals")}</p>
      </div>
      {renderContent()}
    </div>
  );
};

export default LatestProducts;
