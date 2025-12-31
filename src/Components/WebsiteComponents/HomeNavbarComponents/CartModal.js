import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faMinus, faShoppingBag, faExclamationTriangle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { CartService } from './Service/cartService';
import styles from './CartModal.module.css';
import { useTranslation } from 'react-i18next';

const CartModal = ({ isOpen, onClose, onUpdateCart }) => {
  const { t } = useTranslation();
  const [cartItems, setCartItems] = useState([]);
  const [stockErrors, setStockErrors] = useState({});
  const [loadingItems, setLoadingItems] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  const debounceTimeouts = useRef({});

  const fetchCartData = async () => {
    setIsLoadingCart(true);
    try {
      const [items, price] = await Promise.all([
        CartService.getCart(),
        CartService.getTotalPrice()
      ]);
      setCartItems(items);
      setTotalPrice(price);
    } catch (error) {
      console.error('Error fetching cart data:', error);
      setCartItems([]);
      setTotalPrice(0);
    } finally {
      setIsLoadingCart(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCartData();
      setStockErrors({});
    }
    return () => {
      for (const timeoutId of Object.values(debounceTimeouts.current)) {
        clearTimeout(timeoutId);
      }
      debounceTimeouts.current = {};
    };
  }, [isOpen]);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      await handleRemoveItem(productId);
      return;
    }

    if (debounceTimeouts.current[productId]) {
      clearTimeout(debounceTimeouts.current[productId]);
    }

    debounceTimeouts.current[productId] = setTimeout(async () => {
      setLoadingItems(prev => ({ ...prev, [productId]: true }));

      try {
        await CartService.updateQuantityWithStockCheck(productId, newQuantity);
        await fetchCartData();

        if (stockErrors[productId]) {
          const newErrors = { ...stockErrors };
          delete newErrors[productId];
          setStockErrors(newErrors);
        }

        if (onUpdateCart) onUpdateCart();
      } catch (error) {
        console.error('Error updating quantity:', error);
        await fetchCartData();
        setStockErrors(prev => ({
          ...prev,
          [productId]: error.message,
        }));
      } finally {
        setLoadingItems(prev => ({ ...prev, [productId]: false }));
        delete debounceTimeouts.current[productId];
      }
    }, 500);

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId ? { ...item, count: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = async (productId) => {
    if (debounceTimeouts.current[productId]) {
      clearTimeout(debounceTimeouts.current[productId]);
      delete debounceTimeouts.current[productId];
    }

    try {
      await CartService.removeFromCart(productId);
      await fetchCartData();

      if (stockErrors[productId]) {
        const newErrors = { ...stockErrors };
        delete newErrors[productId];
        setStockErrors(newErrors);
      }

      if (onUpdateCart) onUpdateCart();
    } catch (error) {
      console.error('Error removing item:', error);
      await fetchCartData();
    }
  };

 // في CartModal.js
const handleCheckout = () => {
  for (const timeoutId of Object.values(debounceTimeouts.current)) {
    clearTimeout(timeoutId);
  }
  debounceTimeouts.current = {};
  onClose();
  // الانتقال إلى صفحة Checkout بدلاً من Orders
  window.location.href = '/checkout';
};

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{t('cart_title')}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {isLoadingCart ? (
            <div className={styles.loadingContainer}>
              <FontAwesomeIcon icon={faSpinner} spin size="2x" />
              <p>{t('loading_cart')}</p>
            </div>
          ) : !Array.isArray(cartItems) || cartItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <FontAwesomeIcon icon={faShoppingBag} size="3x" />
              <p>{t('empty_cart')}</p>
              <button className={styles.continueShopping} onClick={onClose}>
                {t('continue_shopping')}
              </button>
            </div>
          ) : (
            <>
              <div className={styles.cartItems}>
                {cartItems.map((item) => {
                  const price = Number(item.product.price) || 0;
                  const discount = Number(item.product.discount) || 0;
                  const discountedPrice = discount > 0 ? price - (price * discount) / 100 : price;
                  const itemTotalPrice = discountedPrice * item.count;
                  const isLoading = loadingItems[item.product.id];
                  const errorMessage = stockErrors[item.product.id];

                  return (
                    <div key={item.product.id} className={styles.cartItem}>
                      <img
                        src={item.product.images?.[0]?.image || 'https://via.placeholder.com/80x80/ccc/ffffff?text=No+Image'}
                        alt={item.product.title}
                        className={styles.itemImage}
                      />
                      <div className={styles.itemDetails}>
                        <h4 className={styles.itemTitle}>{item.product.title}</h4>
                        <p className={styles.itemPrice}>
                          ${discountedPrice.toFixed(2)}{' '}
                          {discount > 0 && (
                            <span className={styles.originalPrice}>
                              ${price.toFixed(2)}
                            </span>
                          )}
                        </p>

                        {errorMessage && (
                          <div className={styles.stockError}>
                            <FontAwesomeIcon icon={faExclamationTriangle} />
                            <span>{errorMessage}</span>
                          </div>
                        )}
                      </div>

                      <div className={styles.quantityControls}>
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.count - 1)}
                          className={styles.quantityButton}
                          disabled={isLoading}
                        >
                          <FontAwesomeIcon icon={faMinus} />
                        </button>
                        <span className={styles.quantity}>
                          {isLoading ? (
                            <div className={styles.loadingDots}>
                              <span>.</span><span>.</span><span>.</span>
                            </div>
                          ) : (
                            item.count
                          )}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.count + 1)}
                          className={styles.quantityButton}
                          disabled={isLoading}
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
                      </div>

                      <div className={styles.itemTotal}>
                        ${itemTotalPrice.toFixed(2)}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.product.id)}
                        className={styles.removeButton}
                        disabled={isLoading}
                      >
                        &times;
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className={styles.cartSummary}>
                <div className={styles.summaryRow}>
                  <span>{t('subtotal')}:</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>{t('shipping')}:</span>
                  <span>{t('free_shipping')}</span>
                </div>
                <div className={styles.summaryRowTotal}>
                  <span>{t('total')}:</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className={styles.cartActions}>
                <button className={styles.continueShopping} onClick={onClose}>
                  {t('continue_shopping')}
                </button>
                <button className={styles.checkoutButton} onClick={handleCheckout}>
                  {t('proceed_checkout')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;
