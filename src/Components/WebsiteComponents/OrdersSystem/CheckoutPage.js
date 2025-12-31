import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Axios } from "../../../API/axios";
import { CartService } from "./../HomeNavbarComponents/Service/cartService";
import styles from "./CheckoutPage.module.css";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../../Context/SettingsContext";
import Navbar from "../HomeNavbarComponents/Navbar";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [userData, setUserData] = useState({});

  const [shippingInfo, setShippingInfo] = useState({
    shipping_name: "",
    shipping_address: "",
    shipping_phone: "",
    notes: "",
    payment_method: "cash_on_delivery"
  });

  const [errors, setErrors] = useState({});

  const handleOpenCart = () => setIsCartOpen(true);
  const handleCloseCart = () => setIsCartOpen(false);

  useEffect(() => {
    fetchCartData();
    fetchUserData();
  }, []);

  const fetchCartData = async () => {
    setLoading(true);
    try {
      const [items, price] = await Promise.all([
        CartService.getCart(),
        CartService.getTotalPrice()
      ]);
      setCartItems(items);
      setTotalPrice(price);
      if (items.length === 0) navigate("/cart");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await Axios.get("/user");
      if (response.data.success) {
        const user = response.data.user || response.data.data;
        setUserData(user);
        setShippingInfo(prev => ({
          ...prev,
          shipping_name: user.name || "",
          shipping_phone: user.phone || "",
          shipping_address: user.address || ""
        }));
      }
    } catch (_) {}
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!shippingInfo.shipping_name.trim()) newErrors.shipping_name = t("orders.checkout.errors.name_required");
    if (!shippingInfo.shipping_address.trim()) newErrors.shipping_address = t("orders.checkout.errors.address_required");
    if (!shippingInfo.shipping_phone.trim()) newErrors.shipping_phone = t("orders.checkout.errors.phone_required");
    else if (!/^[0-9+\-\s()]{8,20}$/.test(shippingInfo.shipping_phone)) newErrors.shipping_phone = t("orders.checkout.errors.phone_invalid");
    return newErrors;
  };

  const handlePlaceOrder = async () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setSubmitting(true);
    try {
      const response = await Axios.post("/user/orders", shippingInfo);
      if (response.data.success) {
        navigate(`/order-confirmation/${response.data.data.id}`);
      } else {
        alert(response.data.message || t("orders.checkout.errors.order_failed"));
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || t("orders.checkout.errors.order_failed");
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.checkoutContainer} data-theme={settings.theme}>
        <Navbar onOpenCart={handleOpenCart} />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>{t("orders.checkout.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.checkoutContainer} data-theme={settings.theme}>
      <Navbar onOpenCart={handleOpenCart} />
      <div className={styles.checkoutContent}>
        <div className={styles.checkoutHeader}>
          <h1>{t("orders.checkout.title")}</h1>
          <div className={styles.checkoutSteps}>
            <span className={styles.stepActive}>1. {t("orders.checkout.shipping_info")}</span>
            <span>2. {t("orders.checkout.review_order")}</span>
            <span>3. {t("orders.checkout.confirmation")}</span>
          </div>
        </div>

        <div className={styles.checkoutLayout}>
          <div className={styles.shippingSection}>
            <div className={styles.sectionHeader}>
              <h2>{t("orders.checkout.shipping_details")}</h2>
              <button 
                className={styles.useProfileInfo}
                onClick={() => {
                  setShippingInfo({
                    shipping_name: userData.name || "",
                    shipping_address: userData.address || "",
                    shipping_phone: userData.phone || "",
                    notes: "",
                    payment_method: "cash_on_delivery"
                  });
                }}
              >
                {t("orders.checkout.use_profile_info")}
              </button>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="shipping_name">{t("orders.checkout.full_name")} *</label>
              <input
                type="text"
                id="shipping_name"
                name="shipping_name"
                value={shippingInfo.shipping_name}
                onChange={handleInputChange}
                placeholder={t("orders.checkout.placeholders.name")}
                className={errors.shipping_name ? styles.errorInput : ""}
              />
              {errors.shipping_name && <span className={styles.errorText}>{errors.shipping_name}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="shipping_address">{t("orders.checkout.address")} *</label>
              <textarea
                id="shipping_address"
                name="shipping_address"
                value={shippingInfo.shipping_address}
                onChange={handleInputChange}
                placeholder={t("orders.checkout.placeholders.address")}
                rows="4"
                className={errors.shipping_address ? styles.errorInput : ""}
              />
              {errors.shipping_address && <span className={styles.errorText}>{errors.shipping_address}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="shipping_phone">{t("orders.checkout.phone")} *</label>
              <input
                type="tel"
                id="shipping_phone"
                name="shipping_phone"
                value={shippingInfo.shipping_phone}
                onChange={handleInputChange}
                placeholder={t("orders.checkout.placeholders.phone")}
                className={errors.shipping_phone ? styles.errorInput : ""}
              />
              {errors.shipping_phone && <span className={styles.errorText}>{errors.shipping_phone}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="notes">{t("orders.checkout.order_notes")}</label>
              <textarea
                id="notes"
                name="notes"
                value={shippingInfo.notes}
                onChange={handleInputChange}
                placeholder={t("orders.checkout.placeholders.notes")}
                rows="3"
              />
              <small>{t("orders.checkout.notes_hint")}</small>
            </div>

            <div className={styles.formGroup}>
              <label>{t("orders.checkout.payment_method")}</label>
              <div className={styles.paymentMethods}>
                <label className={styles.paymentMethod}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="cash_on_delivery"
                    checked={shippingInfo.payment_method === "cash_on_delivery"}
                    onChange={handleInputChange}
                  />
                  <div className={styles.paymentOption}>
                    <span className={styles.paymentIcon}>💵</span>
                    <div>
                      <strong>{t("orders.checkout.cash_on_delivery")}</strong>
                      <p>{t("orders.checkout.cash_on_delivery_desc")}</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className={styles.orderSummary}>
            <div className={styles.summaryHeader}>
              <h2>{t("orders.checkout.order_summary")}</h2>
            </div>
            
            <div className={styles.orderItems}>
              {cartItems.map((item) => {
                const price = Number(item.product.price) || 0;
                const discount = Number(item.product.discount) || 0;
                const discountedPrice = discount > 0 ? price - (price * discount) / 100 : price;
                const itemTotal = discountedPrice * item.count;
                return (
                  <div key={item.product.id} className={styles.orderItem}>
                    <img
                      src={item.product.images?.[0]?.image || 'https://via.placeholder.com/60x60/ccc/ffffff?text=No+Image'}
                      alt={item.product.title}
                      className={styles.productImage}
                    />
                    <div className={styles.productInfo}>
                      <h4>{item.product.title}</h4>
                      <div className={styles.productMeta}>
                        <span>{`${item.count} × $${discountedPrice.toFixed(2)}`}</span>
                      </div>
                    </div>
                    <div className={styles.productTotal}>${itemTotal.toFixed(2)}</div>
                  </div>
                );
              })}
            </div>

            <div className={styles.priceBreakdown}>
              <div className={styles.priceRow}>
                <span>{t("orders.checkout.subtotal")}</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className={styles.priceRow}>
                <span>{t("orders.checkout.shipping")}</span>
                <span className={styles.freeShipping}>{t("orders.checkout.free")}</span>
              </div>
              <div className={styles.priceRow}>
                <span>{t("orders.checkout.tax")}</span>
                <span>$0.00</span>
              </div>
              <div className={styles.priceRowTotal}>
                <span>{t("orders.checkout.total")}</span>
                <span className={styles.finalPrice}>${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className={styles.orderTerms}>
              <label className={styles.termsCheckbox}>
                <input type="checkbox" required />
                <span>{t("orders.checkout.terms_agree")}</span>
              </label>
            </div>

            <button
              className={styles.placeOrderBtn}
              onClick={handlePlaceOrder}
              disabled={submitting || cartItems.length === 0}
            >
              {submitting ? (
                <>
                  <span className={styles.spinnerSmall}></span>
                  {t("orders.checkout.processing")}
                </>
              ) : (
                `${t("orders.checkout.place_order")} - $${totalPrice.toFixed(2)}`
              )}
            </button>

            <button
              className={styles.backToCartBtn}
              onClick={() => navigate(-1)}
            >
              {t("orders.checkout.back_to_cart")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
