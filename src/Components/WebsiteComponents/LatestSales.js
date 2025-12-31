// Pages/LatestSales/LatestSales.js
import React, { useState, useEffect } from "react";
import ProductCard from "../../Components/WebsiteComponents/ProductCard";
import ProductCardSkeleton from "../../Components/WebsiteComponents/ProductCardSkeleton";
import { Axios } from "../../API/axios";
import { LATEST_SALE } from "../../API/API";
import styles from "./LatestSales.module.css";
import { useTranslation } from "react-i18next";
import { useAlert } from "../../Context/AlertContext"; // ✅ إضافة Alert مركزي

const LatestSales = () => {
  const { t, i18n } = useTranslation();
  const { showError } = useAlert(); // ✅ استخدام Alert مركزي
  const [saleProducts, setSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSaleProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await Axios.get(`/${LATEST_SALE}`);

        let productsData = [];

        if (response.data && Array.isArray(response.data)) {
          productsData = response.data;
        } else if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          productsData = response.data.data;
        }

        setSaleProducts(productsData);
      } catch (err) {
        console.error("Error fetching sale products:", err);
        const errorMessage = t("failed_to_load_sales");
        setError(errorMessage);
        setSaleProducts([]);
        showError(errorMessage); // ✅ عرض الخطأ عبر Alert مركزي
      } finally {
        setLoading(false);
      }
    };

    fetchSaleProducts();
  }, [t, showError]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.productsGrid}>
          {Array.from({ length: 8 }).map((_, index) => (
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
            {t("try_again")}
          </button>
        </div>
      );
    }

    if (saleProducts.length === 0) {
      return (
        <div className={styles.noProducts}>
          <p>{t("no_sales_available")}</p>
        </div>
      );
    }

    return (
      <div className={styles.productsGrid}>
        {saleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  };

  return (
    <div
      className={styles.salesContainer}
      dir={i18n.dir()} // لتبديل الاتجاه حسب اللغة
    >
      <h2 className={styles.sectionTitle}>{t("collections.hot_deals")}</h2>
      {renderContent()}
    </div>
  );
};

export default LatestSales;
