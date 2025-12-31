import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookie from 'cookie-universal';
import { useTranslation } from 'react-i18next';
import LoadingSubmit from '../../../Components/Loading/Loading';
import Navbar from '../../../Components/WebsiteComponents/HomeNavbarComponents/Navbar';
import TopRatedProducts from '../../../Components/WebsiteComponents/TopRatedProducts';
import LatestProducts from '../../../Components/WebsiteComponents/LatestProducts';
import LatestSales from '../../../Components/WebsiteComponents/LatestSales';
import CartModal from '../../../Components/WebsiteComponents/HomeNavbarComponents/CartModal';
import { CartService } from '../../../Components/WebsiteComponents/HomeNavbarComponents/Service/cartService';
import styles from './Css-files/HomePage.module.css';

const HomePage = () => {
  const navigate = useNavigate();
  const cookies = Cookie();
  const { t } = useTranslation();

  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  useEffect(() => {
    const token = cookies.get('e-commerce');
    setIsAuthenticated(!!token);
    if (token) {
      setUserName('User Name');
      setUserRole('user');
    }
  }, [cookies]);

  const handleLogout = () => {
    cookies.remove('e-commerce');
    setIsAuthenticated(false);
    setUserName('');
    setUserRole('');
    navigate('/');
  };

  const handleButtonClick = () => {
    if (isAuthenticated) {
      if (userRole === 'admin' || userRole === 'product_manager') {
        navigate('/dashboard');
      } else {
        navigate('/profile');
      }
    } else {
      navigate('/login');
    }
  };

  const getButtonText = () => {
    if (!isAuthenticated) return t('login_register');
    switch (userRole) {
      case 'admin':
      case 'product_manager':
        return t('go_dashboard');
      default:
        return t('my_account');
    }
  };

  const scrollToProducts = () => {
    const elem = document.getElementById('featured-products');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCartUpdate = () => {
    console.log('Cart updated, total items:', CartService.getTotalItems());
  };

  if (isAuthenticated === null) return <LoadingSubmit />;

  return (
    <div className={styles.homePage}>
      <div className={styles.bgImage}></div>

      <Navbar
        isAuthenticated={isAuthenticated}
        userName={userName}
        onLogout={handleLogout}
        onOpenCart={() => setIsCartModalOpen(true)}
      />

      <CartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        onUpdateCart={handleCartUpdate}
      />

      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.mainTitle}>{t('welcome')}</h1>
          <p className={styles.subTitle}>
            {t('hero_subtitle')}
          </p>

          <div className={styles.actionBtnContainer}>
            <button
              onClick={handleButtonClick}
              className={`${styles.actionBtn} ${
                isAuthenticated ? styles.dashboardBtn : styles.loginBtn
              }`}
            >
              <span>{getButtonText()}</span>
              <span className={styles.btnIcon}>➝</span>
            </button>
          </div>

          {isAuthenticated && (
            <div className={styles.welcomeMessage}>
              <p>
                {t('logged_in_message', {
                  dashboard: userRole === 'admin' || userRole === 'product_manager' ? t('go_dashboard') : t('my_account')
                })}
              </p>
            </div>
          )}

          <div className={styles.scrollIndicator} onClick={scrollToProducts}>
            ⌄
          </div>
        </div>
      </section>

      <section id="featured-products" className={styles.featuredSection}>
        <div className={styles.container}>
          <LatestSales />
        </div>
      </section>

      <section className={styles.featuredSection}>
        <div className={styles.container}>
          <div className={styles.productsGridContainer}>
            <div className={styles.mainProducts}>
              <TopRatedProducts />
            </div>
            <div className={styles.sidebar}>
              <LatestProducts />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;