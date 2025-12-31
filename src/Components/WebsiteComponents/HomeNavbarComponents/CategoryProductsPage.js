// src/pages/Website/CategoryProductsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Axios } from "../../../API/axios";
import { CATEGORIES } from "../../../API/API";
import ProductCard from "../../WebsiteComponents/ProductCard";
import Navbar from "../HomeNavbarComponents/Navbar";
import CartModal from "../HomeNavbarComponents/CartModal";
import styles from "./CategoryProductspage.module.css";

const CategoryProductsPage = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleOpenCart = () => setIsCartOpen(true);
  const handleCloseCart = () => setIsCartOpen(false);

  useEffect(() => {
    if (!id) return;

    const fetchCategoryProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        // جلب بيانات الفئة مع المنتجات
        const response = await Axios.get(`/${CATEGORIES}/${id}`);
        const catData = response.data;

        if (!catData) {
          setError(t("category_not_found"));
          return;
        }

        setCategory(catData);
        setProducts(catData.products || []);
      } catch (err) {
        setError(
          err.response?.data?.message || t("failed_to_load_products")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [id, t]);

  return (
    <>
      {/* Navbar ثابت مع زر فتح العربة */}
      <Navbar onOpenCart={handleOpenCart} fixed />

      {/* محتوى الصفحة */}
      <div className={styles.page}>
        {loading ? (
          <div className={styles.loading}>{t("loading_products")}</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <>
            {/* Header الفئة */}
            <header className={styles.header}>
              <h1>{category?.title || t("category_products")}</h1>

              {category?.image && (
                <img
                  src={category.image}
                  alt={category.title}
                  className={styles.categoryImage}
                  onError={(e) => (e.target.style.display = "none")}
                />
              )}

              <p>
                {category?.description ||
                  t("explore_category_products", {
                    count: products.length,
                  })}
              </p>
            </header>

            {/* شبكة المنتجات */}
            <div className={styles.productsGrid}>
              {products.length > 0 ? (
                products.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  />
                ))
              ) : (
                <div className={styles.noProducts}>
                  {t("no_products_in_category")}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* مودال العربة */}
      <CartModal isOpen={isCartOpen} onClose={handleCloseCart} />
    </>
  );
};

export default CategoryProductsPage;
