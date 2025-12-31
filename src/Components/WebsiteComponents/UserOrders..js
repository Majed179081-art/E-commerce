import React, { useState, useEffect } from "react";
import { Axios } from "../../API/axios";
import { Link } from "react-router-dom";
import styles from "./UserOrders.module.css";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../Context/SettingsContext";
import { useAlert } from "../../Context/AlertContext";

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { showError, showConfirm, showSuccess } = useAlert();

  useEffect(() => {
    fetchMyOrders();
    fetchMyOrderStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== "all" ? { status: statusFilter } : {};
      const response = await Axios.get("/user/orders", { params });
      if (response.data.success) {
        setOrders(response.data.data.data || response.data.data);
        setError(null);
      } else {
        setError(t("orders.error_loading_orders"));
      }
    } catch (err) {
      setError(err.response?.data?.message || t("orders.error_loading_orders"));
    } finally {
      setLoading(false);
    }
  };

  const fetchMyOrderStats = async () => {
    try {
      const response = await Axios.get("/user/orders/stats");
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      // يمكن إضافة showError هنا لو تحب
    }
  };

  const handleCancelOrder = async (orderId) => {
    showConfirm({
      title: t("orders.confirm_cancel"),
      message: t("orders.confirm_cancel_message") || "",
      onConfirm: async () => {
        try {
          await Axios.post(`/user/orders/${orderId}/cancel`);
          await fetchMyOrders();
          await fetchMyOrderStats();
          showSuccess(t("orders.cancel_success"));
        } catch (err) {
          showError(err.response?.data?.message || t("orders.cancel_error"));
        }
      }
    });
  };

  const handleReorder = async (orderId) => {
    try {
      await Axios.post(`/user/orders/${orderId}/reorder`);
      showSuccess(t("orders.reorder_success"));
    } catch (err) {
      showError(err.response?.data?.message || t("orders.reorder_error"));
    }
  };

  const getStatusStyle = (status) => {
    const statusStyles = {
      pending: styles.statusPending,
      confirmed: styles.statusConfirmed,
      processing: styles.statusProcessing,
      shipped: styles.statusShipped,
      delivered: styles.statusDelivered,
      cancelled: styles.statusCancelled,
    };
    return statusStyles[status] || styles.statusPending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(
      settings.language === "ar" ? "ar-EG" : "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getStatusText = (status) => t(`orders.status.${status}`) || status;
  const formatPrice = (price) => (Number(price) || 0).toFixed(2);

  if (loading && orders.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>{t("orders.loading_orders")}</p>
      </div>
    );
  }

  return (
    <div className={styles.userOrdersContainer}>
      <div className={styles.pageHeader}>
        <h1>{t("orders.my_orders")}</h1>
        <div className={styles.headerActions}>
          <Link to="/" className={styles.backBtn}>
            {t("orders.back_to_shop")}
          </Link>
        </div>
      </div>

      <div className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📦</div>
            <div className={styles.statInfo}>
              <h4>{t("orders.total_orders")}</h4>
              <p className={styles.statNumber}>{stats.total_orders || 0}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⏳</div>
            <div className={styles.statInfo}>
              <h4>{t("orders.pending")}</h4>
              <p className={styles.statNumber}>{stats.pending_orders || 0}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>✅</div>
            <div className={styles.statInfo}>
              <h4>{t("orders.completed")}</h4>
              <p className={styles.statNumber}>{stats.delivered_orders || 0}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>💰</div>
            <div className={styles.statInfo}>
              <h4>{t("orders.total_spent")}</h4>
              <p className={styles.statAmount}>
                ${formatPrice(stats.total_spent)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.filtersSection}>
        <div className={styles.statusFilters}>
          <button
            className={`${styles.filterBtn} ${statusFilter === "all" ? styles.active : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            {t("orders.all")}
          </button>
          {["pending", "processing", "shipped", "delivered", "cancelled", "confirmed"].map(
            (status) => (
              <button
                key={status}
                className={`${styles.filterBtn} ${
                  statusFilter === status ? styles.active : ""
                } ${styles[status]}`}
                onClick={() => setStatusFilter(status)}
              >
                {getStatusText(status)}
              </button>
            )
          )}
        </div>
      </div>

      {error ? (
        <div className={styles.errorContainer}>
          <p>{error}</p>
          <button onClick={fetchMyOrders} className={styles.retryButton}>
            {t("orders.retry") || "Try Again"}
          </button>
        </div>
      ) : orders.length > 0 ? (
        <div className={styles.ordersList}>
          {orders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.orderInfo}>
                  <span className={styles.orderNumber}>
                    {t("orders.order")} #{order.order_number}
                  </span>
                  <span className={styles.orderDate}>
                    {formatDate(order.created_at)}
                  </span>
                  <span className={styles.orderTotal}>
                    {t("orders.total")}: ${formatPrice(order.total_amount)}
                  </span>
                  {order.payment_method && (
                    <span className={styles.paymentMethod}>
                      {t("orders.payment_method")}: {order.payment_method}
                    </span>
                  )}
                </div>

                <div className={styles.orderStatusSection}>
                  <span className={`${styles.statusBadge} ${getStatusStyle(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>

                  <div className={styles.orderActions}>
                    {order.status === "pending" && (
                      <>
                        <button
                          className={styles.cancelBtn}
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          {t("orders.cancel_order")}
                        </button>

                        <Link to={`/orders/${order.id}/edit`} className={styles.updateBtn}>
                          {t("orders.update_order")}
                        </Link>
                      </>
                    )}

                    <button
                      className={styles.reorderBtn}
                      onClick={() => handleReorder(order.id)}
                    >
                      {t("orders.reorder")}
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.orderDetails}>
                <div className={styles.shippingInfo}>
                  <h4>{t("orders.shipping_info")}</h4>
                  <p>
                    <strong>{t("orders.name")}:</strong>{" "}
                    {order.shipping_name || t("orders.not_provided")}
                  </p>
                  <p>
                    <strong>{t("orders.address")}:</strong>{" "}
                    {order.shipping_address || t("orders.not_provided")}
                  </p>
                  {order.shipping_phone && (
                    <p>
                      <strong>{t("orders.phone")}:</strong> {order.shipping_phone}
                    </p>
                  )}
                </div>

                <div className={styles.orderItems}>
                  <h4>
                    {t("orders.items")} ({order.items?.length || 0})
                  </h4>
                  {order.items?.map((item, index) => {
                    const price = Number(item.price) || 0;
                    const quantity = Number(item.quantity) || 1;
                    const itemTotal = price * quantity;

                    return (
                      <div key={index} className={styles.orderItem}>
                        {item.product?.images?.[0]?.image && (
                          <img
                            src={item.product.images[0].image}
                            alt={item.product?.title || `Product ${index + 1}`}
                            className={styles.productImage}
                          />
                        )}
                        <div className={styles.productDetails}>
                          <h5>{item.product?.title || `Product ${index + 1}`}</h5>
                          <p className={styles.productPrice}>
                            ${formatPrice(price)} × {quantity} = ${formatPrice(itemTotal)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {order.notes && (
                  <div className={styles.orderNotes}>
                    <h4>{t("orders.notes")}</h4>
                    <p>{order.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateContent}>
            <div className={styles.emptyStateIcon}>📦</div>
            <h3>{t("orders.no_orders")}</h3>
            <p>{t("orders.no_orders_text")}</p>
            <Link to="/" className={styles.shoppingButton}>
              {t("orders.start_shopping")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrders;
