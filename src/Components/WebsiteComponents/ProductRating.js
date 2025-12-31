// src/Components/WebsiteComponents/ProductRating/ProductRating.js
import React, { useState, useEffect } from 'react';
import { Axios } from '../../API/axios';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';
import styles from './ProductRating.module.css';
import { useTranslation } from 'react-i18next';
import { useAlert } from '../../Context/AlertContext';

const ProductRating = ({ productId, productTitle }) => {
  const { t } = useTranslation();
  const { showAlert, showConfirm } = useAlert();
  
  const [userRating, setUserRating] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [productStats, setProductStats] = useState({
    averageRating: 0,
    ratingsCount: 0,
    reviewsCount: 0
  });
  const [ratings, setRatings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState({
    stats: true,
    ratings: true,
    reviews: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('ratings');

  useEffect(() => {
    fetchUserRating();
    fetchProductStats();
    fetchProductRatings();
    fetchProductReviews();
  }, [productId]);

  const fetchUserRating = async () => {
    try {
      const response = await Axios.get(`/products/${productId}/ratings/user`);
      if (response.data) {
        setUserRating(response.data);
        setRating(response.data.rating);
        setComment(response.data.comment || '');
      }
    } catch (error) {
      console.log('No user rating found');
    }
  };

  const fetchProductStats = async () => {
    try {
      const response = await Axios.get(`/product/${productId}`);
      const ratingValue = parseFloat(response.data.rating) || 0;
      const ratingsCount = parseInt(response.data.ratings_number) || 0;
      const reviewsCount = parseInt(response.data.reviews_count) || 0;
      
      setProductStats({
        averageRating: ratingValue,
        ratingsCount: ratingsCount,
        reviewsCount: reviewsCount
      });
    } catch (error) {
      console.error('Error fetching product stats:', error);
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  const fetchProductRatings = async () => {
    try {
      const response = await Axios.get(`/products/${productId}/ratings`);
      setRatings(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(prev => ({ ...prev, ratings: false }));
    }
  };

  const fetchProductReviews = async () => {
    try {
      const response = await Axios.get(`/products/${productId}/reviews`);
      setReviews(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(prev => ({ ...prev, reviews: false }));
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      showAlert({ message: t('rating.selectStars'), type: 'warning' });
      return;
    }

    setSubmitting(true);
    try {
      await Axios.post(`/products/${productId}/ratings`, {
        rating,
        comment: comment.trim() || null
      });

      await Promise.all([
        fetchUserRating(),
        fetchProductStats(),
        fetchProductRatings()
      ]);

      showAlert({ 
        message: userRating ? t('rating.updated') : t('rating.added'), 
        type: 'success' 
      });
    } catch (error) {
      console.error('Error submitting rating:', error);
      showAlert({ 
        message: error.response?.data?.message || t('rating.error'), 
        type: 'error' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRating = () => {
    showConfirm({
      title: t('rating.deleteConfirm'),
      message: t('rating.deleteConfirmMessage') || '',
      confirmText: t('rating.deleteRating'),
      cancelText: t('common.cancel'),
      onConfirm: async () => {
        try {
          await Axios.delete(`/products/${productId}/ratings`);
          setUserRating(null);
          setRating(0);
          setComment('');
          await Promise.all([fetchProductStats(), fetchProductRatings()]);
          showAlert({ message: t('rating.deleted'), type: 'success' });
        } catch (error) {
          console.error('Error deleting rating:', error);
          showAlert({ message: t('rating.deleteError'), type: 'error' });
        }
      }
    });
  };

  const calculateStarDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        distribution[r.rating]++;
      }
    });

    return Object.entries(distribution).map(([stars, count]) => ({
      stars: parseInt(stars),
      count,
      percentage: productStats.ratingsCount > 0 ? Math.round((count / productStats.ratingsCount) * 100) : 0
    }));
  };

  const renderStars = (ratingValue, size = 20) => {
    const stars = [];
    const fullStars = Math.floor(ratingValue);
    const hasHalfStar = ratingValue % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) stars.push(<FaStar key={i} size={size} color="#ffc107" />);
      else if (i === fullStars + 1 && hasHalfStar) stars.push(<FaStarHalfAlt key={i} size={size} color="#ffc107" />);
      else stars.push(<FaRegStar key={i} size={size} color="#e4e5e9" />);
    }
    return stars;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.ratingSection}>
      {/* ...Header & Stats */}
      <div className={styles.ratingFormSection}>
        <h3>{userRating ? t('rating.yourRating') : t('rating.addYourRating')}</h3>
        <form onSubmit={handleSubmitRating} className={styles.ratingForm}>
          <div className={styles.starInput}>
            <label>{t('rating.yourStars')}:</label>
            <div className={styles.starSelection}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={styles.starButton}
                  disabled={submitting}
                >
                  <FaStar
                    size={32}
                    className={star <= rating ? styles.selectedStar : styles.unselectedStar}
                  />
                </button>
              ))}
            </div>
            <span className={styles.selectedRating}>
              {rating} {t('rating.stars')}
            </span>
          </div>

          <div className={styles.commentInput}>
            <label htmlFor="comment">{t('rating.yourComment')}:</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('rating.commentPlaceholder')}
              rows="4"
              maxLength="500"
              disabled={submitting}
              className={styles.textarea}
            />
            <div className={styles.charCounter}>
              <span>{comment.length}/500</span>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className={styles.submitButton}
            >
              {submitting ? t('rating.submitting') : 
               userRating ? t('rating.updateRating') : t('rating.submitRating')}
            </button>
            
            {userRating && (
              <button
                type="button"
                onClick={handleDeleteRating}
                disabled={submitting}
                className={styles.deleteButton}
              >
                {t('rating.deleteRating')}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'ratings' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('ratings')}
        >
          {t('rating.allRatings')} ({ratings.length})
        </button>
      </div>

      {/* Ratings List */}
      {activeTab === 'ratings' && (
        <div className={styles.ratingsList}>
          {loading.ratings ? (
            <div className={styles.loading}>جاري تحميل التقييمات...</div>
          ) : ratings.length === 0 ? (
            <div className={styles.noData}>
              {t('rating.noRatings')}
            </div>
          ) : (
            ratings.map((ratingItem) => (
              <div key={ratingItem.id} className={styles.ratingItem}>
                <div className={styles.ratingHeader}>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      {ratingItem.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className={styles.userName}>
                        {ratingItem.user?.name || t('rating.anonymous')}
                      </div>
                      <div className={styles.ratingDate}>
                        {formatDate(ratingItem.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className={styles.ratingStars}>
                    {renderStars(ratingItem.rating, 18)}
                  </div>
                </div>
                
                {ratingItem.comment && (
                  <div className={styles.ratingComment}>
                    {ratingItem.comment}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ProductRating;
