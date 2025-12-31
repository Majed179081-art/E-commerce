import React from 'react';
import styles from './ProductCard.module.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ProductCard = ({ product }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isArabic = i18n.language === 'ar';

  // تحويل السعر والخصم لأرقام
  const price = Number(product?.price) || 0;
  const discount = Number(product?.discount) || 0;
  const imageUrl =
    product?.images?.[0]?.image ||
    'https://via.placeholder.com/300x300/ccc/ffffff?text=No+Image';
  const title = product?.title || t('untitled_product');
  const description = product?.description || t('no_description');
  const rating = Math.min(Math.max(Number(product?.rating) || 0, 0), 5);

  const discountedPrice =
    discount > 0 ? price - (price * discount) / 100 : price;

  const goldenStars = Array.from({ length: Math.floor(rating) }).map(
    (_, index) => (
      <span key={`gold-${index}`} className={styles.goldStar}>
        ★
      </span>
    )
  );

  const grayStars = Array.from({ length: 5 - Math.floor(rating) }).map(
    (_, index) => (
      <span key={`gray-${index}`} className={styles.grayStar}>
        ★
      </span>
    )
  );

  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div
      className={`${styles.productCard} ${
        isArabic ? styles.arabic : styles.ltr
      }`}
      onClick={handleClick}
      data-theme={document.body.getAttribute('data-theme')}
    >
      <div className={styles.imageSection}>
        <img src={imageUrl} alt={title} className={styles.productImage} />
        {discount > 0 && (
          <div className={styles.discountBadge}>-{discount}%</div>
        )}
      </div>

      <div className={styles.infoSection}>
        <h3 className={styles.productTitle}>{title}</h3>

        {/* عرض التقييم */}
        <div className={styles.ratingSection}>
          <div className={styles.stars}>
            {goldenStars}
            {grayStars}
          </div>
          <span className={styles.ratingText}>({rating.toFixed(1)})</span>
        </div>

        <p className={styles.productDescription}>
          {description.length > 100
            ? `${description.substring(0, 100)}...`
            : description}
        </p>

        <div className={styles.priceSection}>
          {discount > 0 ? (
            <>
              <span className={styles.originalPrice}>${price.toFixed(2)}</span>
              <span className={styles.discountedPrice}>
                ${discountedPrice.toFixed(2)}
              </span>
            </>
          ) : (
            <span className={styles.normalPrice}>${price.toFixed(2)}</span>
          )}
        </div>

        <div className={styles.actionButtons}>
          <button className={styles.viewButton}>
            {t('view_details')}
          </button>
          <button className={styles.addToCartButton}>
            {t('add_to_cart')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
