import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Axios } from '../../API/axios';
import Navbar from './HomeNavbarComponents/Navbar';
import ProductRating from './ProductRating';
import styles from './ProductDetails.module.css';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { CartService } from './HomeNavbarComponents/Service/cartService';
import { useSettings } from '../../Context/SettingsContext';
import CartModal from "./HomeNavbarComponents/CartModal";
import { useAlert } from '../../Context/AlertContext'; // ✅ إضافة Alert

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();
  const { showSuccess, showError } = useAlert(); // ✅ استخدام Alert مركزي

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [stockError, setStockError] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);

  const handleOpenCart = () => setIsCartOpen(true);
  const handleCloseCart = () => setIsCartOpen(false);

  // تطبيق الثيم واللغة تلقائياً
  useEffect(() => {
    if (settings.theme) document.body.setAttribute('data-theme', settings.theme);
    if (settings.language) {
      i18n.changeLanguage(settings.language);
      document.body.classList.toggle('arabic', settings.language === 'ar');
      document.documentElement.setAttribute('dir', settings.language === 'ar' ? 'rtl' : 'ltr');
    }
  }, [settings.theme, settings.language, i18n]);

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await Axios.get(`/product/${id}`);
        const productData = response.data && typeof response.data === 'object'
          ? Array.isArray(response.data) ? response.data[0] : response.data
          : null;
        setProduct(productData);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(t('product.missing'));
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id, t]);

  const handleQuantityChange = (amount) => {
    setQuantity(prev => Math.max(1, prev + amount));
    if (stockError) setStockError('');
  };

  const addToCart = async () => {
    setAddingToCart(true);
    setStockError('');
    try {
      await CartService.addToCartWithStockCheck(product, quantity);
      showSuccess(t('cart.added', { title: product.title })); // ✅ تم استبدال alert
    } catch (error) {
      console.error('Error adding to cart:', error);
      let message = error.message;
      if (message.includes('exceeds available stock')) message = t('error.exceedStock');
      else if (message.includes('count field is required')) message = t('error.validation');
      else if (message.includes('Network error')) message = t('error.network');
      setStockError(message);
      showError(message); // ✅ Alert مركزي
    } finally {
      setAddingToCart(false);
    }
  };

  // داخل ProductDetail.jsx

const buyNow = async () => {
  setAddingToCart(true);
  setStockError('');

  try {
    // أولاً: إضافة المنتج إلى العربة مع التحقق من المخزون
    await CartService.addToCartWithStockCheck(product, quantity);

    // ثانياً: الانتقال مباشرة إلى Checkout
    navigate('/checkout');
  } catch (error) {
    console.error('Error adding to cart:', error);
    const message = error.message || t('error.addCart');
    setStockError(message);
    showError(message); // عرض الخطأ إن وجد
  } finally {
    setAddingToCart(false);
  }
};


  if (loading) {
    return (
      <div className={styles.productDetailPage} data-theme={settings.theme}>
        <Navbar onOpenCart={handleOpenCart} fixed />
        <div className={styles.container}>
          <Skeleton height={400} borderRadius={12} />
          <Skeleton count={5} style={{ marginTop: 10 }} />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.productDetailPage} data-theme={settings.theme}>
        <Navbar onOpenCart={handleOpenCart} fixed />
        <div className={styles.errorContainer}>
          <h2>{t('product.notFound')}</h2>
          <p>{error || t('product.missing')}</p>
          <button onClick={() => navigate('/')} className={styles.backHomeButton}>
            {t('buttons.backHome')}
          </button>
        </div>
      </div>
    );
  }

  const price = Number(product.price) || 0;
  const discount = Number(product.discount) || 0;
  const discountedPrice = discount > 0 ? price - (price * discount) / 100 : price;
  const rating = Math.min(Math.max(Number(product.rating) || 0, 0), 5);
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  return (
    <div className={`${styles.productDetailPage} ${settings.language === 'ar' ? styles.arabic : styles.ltr}`} 
         data-theme={settings.theme}>
      <Navbar onOpenCart={handleOpenCart} />

      <div className={styles.container}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          {settings.language === 'ar' ? '→' : '←'} {t('buttons.back')}
        </button>

        <div className={styles.productContent}>
          <div className={styles.imageSection}>
            <div className={styles.mainImage}>
              <img
                src={product.images?.[currentImageIndex]?.image || 'https://via.placeholder.com/500x500/ccc/ffffff?text=No+Image'}
                alt={product.title}
                className={styles.productImage}
              />
              {discount > 0 && <div className={styles.discountBadge}>-{discount}%</div>}
            </div>
            {product.images && product.images.length > 1 && (
              <div className={styles.imageThumbnails}>
                {product.images.map((image, index) => (
                  <img
                    key={index}
                    src={image.image}
                    alt={`${product.title} ${index + 1}`}
                    className={`${styles.thumbnail} ${currentImageIndex === index ? styles.active : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className={styles.infoSection}>
            <h1 className={styles.productTitle}>{product.title}</h1>

            <div className={styles.ratingSection}>
              <div className={styles.stars}>
                {Array.from({ length: fullStars }).map((_, i) => (<span key={i} className={styles.goldStar}>★</span>))}
                {hasHalfStar && <span className={styles.goldStar}>☆</span>}
                {Array.from({ length: 5 - Math.ceil(rating) }).map((_, i) => (<span key={i} className={styles.grayStar}>☆</span>))}
              </div>
              <span className={styles.ratingText}>({rating.toFixed(1)})</span>
              <span className={styles.reviewsCount}>• {t('reviews.count', { count: product.ratings_number || 0 })}</span>
            </div>

            <div className={styles.priceSection}>
              {discount > 0 ? (
                <>
                  <span className={styles.discountedPrice}>${discountedPrice.toFixed(2)}</span>
                  <span className={styles.originalPrice}>${price.toFixed(2)}</span>
                  <span className={styles.discountPercent}>{t('price_display.save', { discount })}</span>
                </>
              ) : (
                <span className={styles.normalPrice}>${price.toFixed(2)}</span>
              )}
            </div>

            <div className={styles.descriptionSection}>
              <h3>{t('product.description')}</h3>
              <p className={styles.productDescription}>{product.description || t('product.noDescription')}</p>
            </div>

            {product.About && (
              <div className={styles.aboutSection}>
                <h3>{t('product.about')}</h3>
                <p>{product.About}</p>
              </div>
            )}

            <div className={styles.actionSection}>
              <div className={styles.quantitySelector}>
                <label htmlFor="quantity">{t('quantity')}:</label>
                <div className={styles.quantityControls}>
                  <button onClick={() => handleQuantityChange(-1)} className={styles.quantityButton} disabled={addingToCart}>-</button>
                  <span className={styles.quantityValue}>{quantity}</span>
                  <button onClick={() => handleQuantityChange(1)} className={styles.quantityButton} disabled={addingToCart}>+</button>
                </div>
              </div>

              {stockError && <div className={styles.stockError}>⚠️ {stockError}</div>}

              <div className={styles.actionButtons}>
                <button onClick={addToCart} className={styles.addToCartButton} disabled={addingToCart}>
                  {addingToCart ? t('buttons.adding') : t('add_to_cart')}
                </button>
                <button onClick={buyNow} className={styles.buyNowButton} disabled={addingToCart}>
                  {addingToCart ? t('buttons.checking') : t('buyNow')}
                </button>
              </div>
            </div>

            <div className={styles.productMeta}>
              <div className={styles.metaItem}><span className={styles.metaIcon}>🚚</span><span>{t('meta.freeShipping')}</span></div>
              <div className={styles.metaItem}><span className={styles.metaIcon}>↩️</span><span>{t('meta.returnPolicy')}</span></div>
              <div className={styles.metaItem}><span className={styles.metaIcon}>🔒</span><span>{t('meta.secureCheckout')}</span></div>
            </div>
          </div>
        </div>

        <ProductRating productId={id} productTitle={product.title} />
      </div>

      <CartModal isOpen={isCartOpen} onClose={handleCloseCart} />
    </div>
  );
};

export default ProductDetail;
