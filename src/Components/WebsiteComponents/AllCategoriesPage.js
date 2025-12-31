import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCategories } from "../../Context/CategoriesContext";
import Navbar from "../WebsiteComponents/HomeNavbarComponents/Navbar";
import CartModal from "../WebsiteComponents/HomeNavbarComponents/CartModal";
import { useAlert } from "../../Context/AlertContext"; // ✅ تفعيل الأليرت المركزي
import styles from "./AllCategoriesPage.module.css";

const AllCategoriesPage = () => {
  const { categories, loading, error } = useCategories();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showError } = useAlert(); // ✅ استدعاء الأليرت

  const [visibleCategories, setVisibleCategories] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleOpenCart = () => setIsCartOpen(true);
  const handleCloseCart = () => setIsCartOpen(false);

  const filteredCategories = categories.filter(
    (category) =>
      category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description &&
        category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const loadMore = () => setVisibleCategories((prev) => prev + 12);

  // إذا حدث خطأ أثناء جلب الفئات، نعرضه بالأليرت بدل النص
  if (error) {
    showError(error || t("category_pages.error_loading_categories"));
  }

  return (
    <>
      <div className={styles.allCategoriesPage}>
        <Navbar onOpenCart={handleOpenCart} fixed />

        <div className={styles.container}>
          <header className={styles.pageHeader}>
            <h1 className={styles.title}>{t("all_categories")}</h1>
            <p className={styles.subtitle}>{t("category_pages.browse_categories")}</p>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder={t("category_pages.search_categories_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </header>

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>{t("category_pages.loading_categories")}</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className={styles.noResults}>
              <h3>{t("category_pages.no_categories_found")}</h3>
              <p>{t("category_pages.try_adjust_search")}</p>
            </div>
          ) : (
            <>
              <div className={styles.categoriesGrid}>
                {filteredCategories.slice(0, visibleCategories).map((category) => (
                  <div
                    key={category.id}
                    className={styles.categoryCard}
                    onClick={() => navigate(`/category/${category.id}`)}
                  >
                    <div className={styles.categoryImage}>
                      <div className={styles.placeholderImage}>
                        {category.title.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className={styles.categoryInfo}>
                      <h3 className={styles.categoryName}>{category.title}</h3>
                      <p className={styles.categoryDescription}>
                        {category.description || t("category_pages.default_category_description")}
                      </p>
                      <button className={styles.exploreButton}>
                        {t("category_pages.explore_products")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {visibleCategories < filteredCategories.length && (
                <div className={styles.loadMoreContainer}>
                  <button onClick={loadMore} className={styles.loadMoreButton}>
                    {t("category_pages.load_more_categories")}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <CartModal isOpen={isCartOpen} onClose={handleCloseCart} />
    </>
  );
};

export default AllCategoriesPage;
