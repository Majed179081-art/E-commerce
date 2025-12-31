import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Axios } from "../../../API/axios";
import styles from "./OrderComfirmation.module.css";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../../Context/SettingsContext";
import Navbar from "../../WebsiteComponents/HomeNavbarComponents/Navbar";
import { useAlert } from "../../../Context/AlertContext";

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { showError } = useAlert();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleOpenCart = () => setIsCartOpen(true);
  const handleCloseCart = () => setIsCartOpen(false);

  useEffect(() => {
    if (orderId) fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await Axios.get(`/user/orders/${orderId}`);
      if (response.data.success) {
        setOrder(response.data.data);
      } else {
        showError(t("orders.confirmation.order_not_found"));
        navigate("/user/orders");
      }
    } catch (err) {
      showError(t("orders.confirmation.error_fetching_order"));
      navigate("/user/orders");
    } finally {
      setLoading(false);
    }
  };

  const getSafePrice = (price) => {
    const num = Number(price);
    return isNaN(num) ? 0 : num;
  };

  const formatPrice = (price) => getSafePrice(price).toFixed(2);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(
      settings.language === "ar" ? "ar-EG" : "en-US",
      { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
    );
  };

  if (loading) {
    return (
      <div className={styles.confirmationContainer} data-theme={settings.theme}>
        <Navbar onOpenCart={handleOpenCart} />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>{t("orders.confirmation.loading")}</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.confirmationContainer} data-theme={settings.theme}>
        <Navbar onOpenCart={handleOpenCart} />
        <div className={styles.errorContainer}>
          <h2>{t("orders.confirmation.order_not_found")}</h2>
          <Link to="/user/orders" className={styles.backToOrdersBtn}>
            {t("orders.confirmation.view_orders")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.confirmationContainer} data-theme={settings.theme}>
      <Navbar onOpenCart={handleOpenCart} />
      <div className={styles.confirmationContent}>
        <div className={styles.successHeader}>
          <div className={styles.successIcon}>✅</div>
          <h1>{t("orders.confirmation.title")}</h1>
          <p className={styles.successMessage}>
            {t("orders.confirmation.message", { orderNumber: order.order_number })}
          </p>
        </div>

        <div className={styles.orderDetailsCard}>
          <div className={styles.orderInfoSection}>
            <div className={styles.infoRow}>
              {[
                { label: t("orders.confirmation.order_number"), value: order.order_number },
                { label: t("orders.confirmation.order_date"), value: formatDate(order.created_at) },
                { label: t("orders.confirmation.order_status"), value: t(`orders.status.${order.status}`), badge: order.status },
                { label: t("orders.confirmation.payment_method"), value: t(`orders.checkout.${order.payment_method}`) },
              ].map((info, idx) => (
                <div key={idx} className={styles.infoItem}>
                  <strong>{info.label}:</strong>
                  {info.badge ? (
                    <span className={`${styles.statusBadge} ${styles[info.badge]}`}>{info.value}</span>
                  ) : (
                    <span>{info.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* معلومات الشحن */}
          <div className={styles.section}>
            <h3>{t("orders.confirmation.shipping_details")}</h3>
            <div className={styles.detailsBox}>
              {[
                { label: t("orders.checkout.full_name"), value: order.shipping_name },
                { label: t("orders.checkout.address"), value: order.shipping_address },
                { label: t("orders.checkout.phone"), value: order.shipping_phone },
              ].map((info, idx) =>
                info.value ? (
                  <p key={idx}>
                    <strong>{info.label}:</strong> {info.value}
                  </p>
                ) : null
              )}
            </div>
          </div>

          {/* منتجات الطلب */}
          <div className={styles.section}>
            <h3>{t("orders.confirmation.order_items")}</h3>
            <div className={styles.itemsList}>
              {(order.items || []).map((item, idx) => {
                const price = getSafePrice(item.price);
                const quantity = Number(item.quantity) || 1;
                const total = price * quantity;
                return (
                  <div key={idx} className={styles.orderItem}>
                    <div className={styles.itemImage}>
                      <img
                        src={item.product?.images?.[0]?.image || 'https://via.placeholder.com/60x60/ccc/ffffff?text=No+Image'}
                        alt={item.product?.title || `Product ${idx + 1}`}
                      />
                    </div>
                    <div className={styles.itemInfo}>
                      <h4>{item.product?.title || `Product ${idx + 1}`}</h4>
                      <div className={styles.itemMeta}>
                        <span>${formatPrice(price)} × {quantity}</span>
                      </div>
                    </div>
                    <div className={styles.itemTotal}>${formatPrice(total)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ملخص السعر */}
          <div className={styles.section}>
            <h3>{t("orders.confirmation.order_summary")}</h3>
            <div className={styles.priceSummary}>
              {[
                { label: t("orders.confirmation.subtotal"), value: `$${formatPrice(order.total_amount)}` },
                { label: t("orders.confirmation.shipping"), value: t("orders.confirmation.free") },
                { label: t("orders.confirmation.tax"), value: "$0.00" },
              ].map((row, idx) => (
                <div key={idx} className={idx === 2 ? styles.priceRowTotal : styles.priceRow}>
                  <span>{row.label}</span>
                  <span className={idx === 1 ? styles.freeLabel : idx === 2 ? styles.totalAmount : ""}>{row.value}</span>
                </div>
              ))}
              <div className={styles.priceRowTotal}>
                <span>{t("orders.confirmation.total")}</span>
                <span className={styles.totalAmount}>${formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* ملاحظات الطلب */}
          {order.notes && (
            <div className={styles.section}>
              <h3>{t("orders.confirmation.order_notes")}</h3>
              <div className={styles.notesBox}>{order.notes}</div>
            </div>
          )}

          {/* تعليمات ما بعد الشراء */}
          <div className={styles.nextSteps}>
            <h3>{t("orders.confirmation.next_steps")}</h3>
            <div className={styles.stepsList}>
              {[1, 2, 3].map((step) => (
                <div key={step} className={styles.step}>
                  <div className={styles.stepNumber}>{step}</div>
                  <div className={styles.stepContent}>
                    <strong>{t(`orders.confirmation.step${step}_title`)}</strong>
                    <p>{t(`orders.confirmation.step${step}_desc`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* أزرار التنقل */}
          <div className={styles.actionButtons}>
            <Link to="/orders" className={styles.viewOrdersBtn}>
              {t("orders.confirmation.view_my_orders")}
            </Link>
            <Link to="/" className={styles.continueShoppingBtn}>
              {t("orders.confirmation.continue_shopping")}
            </Link>
            <button className={styles.printReceiptBtn} onClick={() => window.print()}>
              {t("orders.confirmation.print_receipt")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
