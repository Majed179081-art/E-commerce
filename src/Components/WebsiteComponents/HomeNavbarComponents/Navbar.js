// src/Components/WebsiteComponents/HomeNavbarComponents/Navbar.js
import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faShoppingCart,
  faSearch,
  faBars,
  faSignOutAlt,
  faGear,
  faDashboard
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useCategories } from "../../../Context/CategoriesContext";
import { CartService } from "./Service/cartService";
import { usePublicUsers } from "../../../Context/PublicUsersContext";
import styles from "./Navbar.module.css";
import logoImage from "../../../Images/Free (2).png";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../../Context/SettingsContext";

const Navbar = ({ onOpenCart }) => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { user, logout, isAuthenticated, loading: userLoading } = usePublicUsers();

  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [isThrottling, setIsThrottling] = useState(false);

  const { categories, loading: categoriesLoading, error } = useCategories();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);

  const isCategoriesPage = location.pathname === "/categories";

  // تحقق إذا كان المستخدم لديه صلاحية للوصول للداشبورد
  const hasDashboardAccess = () => {
    if (!user || !user.role) return false;
    
    // الأدوار المسموح لها بالوصول للداشبورد
    const allowedRoles = ['1995', '1999']; // admin, product_manager
    return allowedRoles.includes(user.role.toString());
  };

  /* Close user menu on outside click */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* Scroll effect (throttled) */
  useEffect(() => {
    const handleScroll = () => {
      if (isThrottling) return;
      setIsThrottling(true);

      setTimeout(() => {
        setIsScrolled(
          isCategoriesPage ? window.scrollY > 10 : window.scrollY > 50
        );
        setIsThrottling(false);
      }, 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isCategoriesPage, isThrottling]);

  /* Cart count */
  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const count = await CartService.getTotalItems();
        setCartItemsCount(count);
      } catch {
        setCartItemsCount(0);
      }
    };

    fetchCartCount();
    window.addEventListener("cartUpdated", fetchCartCount);
    return () => window.removeEventListener("cartUpdated", fetchCartCount);
  }, []);

  /* Close mobile menu on route change */
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery("");
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      navigate("/", { replace: true });
    } catch {
      alert(t("logout_failed") || "Logout failed");
    }
  };

  const displayedCategories = Array.isArray(categories)
    ? categories.slice(0, 5)
    : [];

  /* User loading */
  if (userLoading) {
    return (
      <nav className={`${styles.modernNavbar} ${styles.loadingNavbar}`}>
        <div className={styles.navbarContainer}>
          <div className={styles.navbarLeft}>
            <div className={styles.appName} onClick={() => navigate("/")}>
              <img src={logoImage} alt={t("app_name")} className={styles.logoImage} />
              <span>{t("app_name")}</span>
            </div>
          </div>
          <div className={styles.navbarCenter}>
            <div className={styles.loadingMessage}>
              {t("loading_user") || "Loading..."}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className={`${styles.modernNavbar} ${isScrolled ? styles.scrolled : ""} ${
        isMobileMenuOpen ? styles.mobileOpen : ""
      } ${isCategoriesPage ? styles.categoriesPage : ""}`}
      dir={settings.language === "ar" ? "rtl" : "ltr"}
    >
      <div className={styles.navbarContainer}>
        {/* Left */}
        <div className={styles.navbarLeft}>
          <div className={styles.appName} onClick={() => navigate("/")}>
            <img src={logoImage} alt={t("app_name")} className={styles.logoImage} />
            <span>{t("app_name")}</span>
          </div>
          <button
            className={styles.menuToggle}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>

        {/* Center */}
        <div className={`${styles.navbarCenter} ${isMobileMenuOpen ? styles.mobileVisible : ""}`}>
          <form className={styles.searchForm} onSubmit={handleSearch}>
            <div className={styles.searchInputContainer}>
              <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
              <input
                type="text"
                placeholder={t("search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <button type="submit" className={styles.searchButton}>
              {t("search_button")}
            </button>
          </form>

          {!isCategoriesPage && (
            <div className={`${styles.categoriesBar} ${isScrolled ? styles.hidden : ""}`}>
              {categoriesLoading ? (
                <div>{t("loading_categories")}</div>
              ) : error ? (
                <div>{t("error_loading_categories")}</div>
              ) : (
                <div className={styles.categoriesList}>
                  {displayedCategories.map((cat) => (
                    <div
                      key={cat.id}
                      className={styles.categoryItem}
                      onClick={() => navigate(`/category/${cat.id}`)}
                    >
                      {cat.title}
                    </div>
                  ))}
                  <button
                    className={styles.showMoreBtn}
                    onClick={() => navigate("/categories")}
                  >
                    {t("show_all_categories")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right */}
       {/* Right */}
<div className={`${styles.navbarRight} ${isMobileMenuOpen ? styles.mobileVisible : ""}`}>
  <button 
    className={styles.cartButton} 
    onClick={onOpenCart}
    title={t("nav.view_cart") || "View Cart"}
  >
    <FontAwesomeIcon icon={faShoppingCart} />
    {cartItemsCount > 0 && (
      <span className={styles.cartCount}>{cartItemsCount}</span>
    )}
    <span className={styles.buttonText}>{t("nav.cart") || "Cart"}</span>
  </button>

  <button
    className={styles.settingsButton}
    onClick={() => navigate("/settings")}
    title={t("nav.settings") || "Settings"}
  >
    <FontAwesomeIcon icon={faGear} />
    <span className={styles.buttonText}>{t("nav.settings") || "Settings"}</span>
  </button>

  {/* زر الداشبورد للمستخدمين المصرح لهم */}
{/* زر الداشبورد للمستخدمين المصرح لهم */}
{isAuthenticated && hasDashboardAccess() && (
  <button
    className={styles.dashboardButton}
    onClick={() => {
      if (user.role === '1995') {          // Admin
        navigate("/dashboard/welcome");
      } else if (user.role === '1999') {   // Product Manager
        navigate("/dashboard/products");
      }
    }}
    title={t("nav.dashboard") || "Admin Dashboard"}
  >
    <FontAwesomeIcon icon={faDashboard} />
    <span className={styles.buttonText}>{t("nav.dashboard") || "Dashboard"}</span>
  </button>
)}


  <div className={styles.userSection}>
    {isAuthenticated ? (
      <div className={styles.userMenuContainer} ref={userMenuRef}>
        <button
          className={styles.userButton}
          onClick={() => setShowUserMenu(!showUserMenu)}
          title={t("nav.account_menu") || "Account Menu"}
        >
          <FontAwesomeIcon icon={faUser} />
          <span className={styles.userName}>{user?.name || "User"}</span>
        </button>

        {showUserMenu && (
          <div
            className={`${styles.userMenu} ${
              settings.language === "ar" ? styles.rtlMenu : ""
            }`}
          >
            <button
              className={styles.menuItem}
              onClick={() => navigate("/profile")}
            >
              {t("nav.my_profile")}
            </button>
            
            {/* رابط الداشبورد في القائمة */}
            {hasDashboardAccess() && (
              <button
                className={styles.menuItem}
                onClick={() => navigate("/dashboard")}
              >
                <FontAwesomeIcon icon={faDashboard} style={{ marginRight: '8px' }} />
                {t("nav.dashboard") || "Dashboard"}
              </button>
            )}
            
            <button
              className={styles.menuItem}
              onClick={() => navigate("/orders")}
            >
              {t("nav.my_orders")}
            </button>
            <button
              className={`${styles.menuItem} ${styles.logoutItem}`}
              onClick={handleLogout}
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              {t("nav.logout")}
            </button>
          </div>
        )}
      </div>
    ) : (
      <div className={styles.authButtons}>
        <button 
          className={styles.loginBtn}
          onClick={() => navigate("/login")}
          title={t("nav.login") || "Login"}
        >
          {t("nav.login") || "Login"}
        </button>
        <button 
          className={styles.signupBtn}
          onClick={() => navigate("/register")}
          title={t("nav.register") || "Register"}
        >
          {t("nav.register") || "Register"}
        </button>
      </div>
    )}
  </div>
</div>
      </div>
    </nav>
  );
};

export default Navbar;