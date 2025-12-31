
// Components/WebsiteComponents/ProductCardSkeleton.js
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import styles from './ProductCard.module.css';

const ProductCardSkeleton = () => {
  return (
    <div className={styles.productCard}>
      <div className={styles.imageSection}>
        <Skeleton height={250} style={{ display: 'block' }} />
      </div>

      <div className={styles.infoSection}>
        <h3 className={styles.productTitle}>
          <Skeleton width="80%" />
        </h3>
        
        <div className={styles.ratingSection}>
          <div className={styles.stars}>
            <Skeleton width={100} />
          </div>
        </div>
        
        <p className={styles.productDescription}>
          <Skeleton count={3} />
        </p>

        <div className={styles.priceSection}>
          <Skeleton width={70} />
        </div>

        <div className={styles.actionButtons}>
          <Skeleton height={40} />
          <Skeleton height={40} />
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;