import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Axios } from "../../../API/axios";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../../Context/SettingsContext";
import { useAlert } from "../../../Context/AlertContext";
import styles from "./EditOrder.module.css";

const EditOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { showSuccess, showError, showConfirm } = useAlert();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    shipping_name: "",
    shipping_address: "",
    shipping_phone: "",
    notes: "",
    payment_method: "cash_on_delivery",
  });

  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await Axios.get(`/user/orders/${id}`);

      if (response.data.success) {
        const orderData = response.data.data;
        setOrder(orderData);

        setFormData({
          shipping_name: orderData.shipping_name || "",
          shipping_address: orderData.shipping_address || "",
          shipping_phone: orderData.shipping_phone || "",
          notes: orderData.notes || "",
          payment_method:
            orderData.payment_method || "cash_on_delivery",
        });
      } else {
        setError(t("orders.edit_order_page.order_not_found"));
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          t("orders.edit_order_page.error_loading_order")
      );
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    setSaving(true);
    const response = await Axios.put(`/user/orders/${id}`, formData);

    if (response.data.success) {
      showSuccess(t("orders.edit_order_page.update_success"));
      navigate("/orders");
    } else {
      showError(t("orders.edit_order_page.update_error"));
    }
  } catch (err) {
    showError(
      err.response?.data?.message || t("orders.edit_order_page.update_error")
    );
  } finally {
    setSaving(false);
  }
};




  const handleCancel = () => {
    showConfirm({
      message: t("orders.edit_order_page.confirm_cancel_edit"),
      onConfirm: () => navigate("/orders"),
    });
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString(
      settings.language === "ar" ? "ar-EG" : "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  const formatPrice = (price) => {
    const num = Number(price) || 0;
    return num.toFixed(2);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>{t("orders.edit_order_page.loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <h3>{t("orders.edit_order_page.error")}</h3>
          <p>{error}</p>
          <div className={styles.errorActions}>
            <button
              onClick={fetchOrderDetails}
              className={styles.retryButton}
            >
              {t("orders.edit_order_page.retry")}
            </button>
            <Link to="/orders" className={styles.backButton}>
              {t("orders.edit_order_page.back_to_orders")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.notFoundContainer}>
        <div className={styles.notFoundContent}>
          <h3>
            {t("orders.edit_order_page.order_not_found")}
          </h3>
          <p>
            {t(
              "orders.edit_order_page.order_not_found_text"
            )}
          </p>
          <Link to="/orders" className={styles.backButton}>
            {t("orders.edit_order_page.back_to_orders")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.editOrderContainer}>
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1>{t("orders.edit_order")}</h1>
          <div className={styles.orderInfoHeader}>
            <span className={styles.orderNumberHeader}>
              {t("orders.order")} #{order.order_number}
            </span>
            <span className={styles.orderDateHeader}>
              {formatDate(order.created_at)}
            </span>
            <span className={styles.orderTotalHeader}>
              {t("orders.total")}: $
              {formatPrice(order.total_amount)}
            </span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Link to="/orders" className={styles.backBtn}>
            {t("orders.edit_order_page.back_to_orders")}
          </Link>
        </div>
      </div>

      <div className={styles.editContent}>
        <div className={styles.orderSummary}>
          <h3>
            {t("orders.edit_order_page.order_summary")}
          </h3>

          <div className={styles.summaryDetails}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>
                {t("orders.status_header")}:
              </span>
              <span
                className={`${styles.statusBadge} ${
                  order.status === "pending"
                    ? styles.statusPending
                    : styles.statusDisabled
                }`}
              >
                {t(`orders.status.${order.status}`) ||
                  order.status}
              </span>
            </div>

            {order.payment_method && (
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>
                  {t("orders.payment_method")}:
                </span>
                <span className={styles.summaryValue}>
                  {t(
                    `orders.edit_order_page.payment_methods.${order.payment_method}`
                  ) || order.payment_method}
                </span>
              </div>
            )}

            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>
                {t(
                  "orders.edit_order_page.items_count"
                )}
                :
              </span>
              <span className={styles.summaryValue}>
                {order.items?.length || 0}
              </span>
            </div>
          </div>
        </div>

      <div className={styles.editFormContainer}>
  <form onSubmit={handleSubmit} className={styles.editForm}>
    <div className={styles.formSection}>
      <h3>{t("orders.edit_order_page.shipping_information")}</h3>
      <p className={styles.formDescription}>
        {t("orders.edit_order_page.shipping_info_description")}
      </p>

      <div className={styles.formGroup}>
        <label htmlFor="shipping_name">
          {t("orders.edit_order_page.full_name")} *
        </label>
        <input
          type="text"
          id="shipping_name"
          name="shipping_name"
          value={formData.shipping_name}
          onChange={handleInputChange}
          className={styles.formInput}
          required
          placeholder={t("orders.edit_order_page.enter_full_name")}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="shipping_phone">
          {t("orders.edit_order_page.phone_number")} *
        </label>
        <input
          type="tel"
          id="shipping_phone"
          name="shipping_phone"
          value={formData.shipping_phone}
          onChange={handleInputChange}
          className={styles.formInput}
          required
          placeholder={t("orders.edit_order_page.enter_phone_number")}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="shipping_address">
          {t("orders.edit_order_page.shipping_address")} *
        </label>
        <textarea
          id="shipping_address"
          name="shipping_address"
          value={formData.shipping_address}
          onChange={handleInputChange}
          className={styles.formTextarea}
          rows="4"
          required
          placeholder={t("orders.edit_order_page.enter_shipping_address")}
        />
        <small className={styles.formHint}>
          {t("orders.edit_order_page.address_hint")}
        </small>
      </div>
    </div>

    <div className={styles.formSection}>
      <h3>{t("orders.edit_order_page.payment_and_notes")}</h3>

      <div className={styles.formGroup}>
        <label htmlFor="payment_method">
          {t("orders.payment_method")} *
        </label>
        <select
          id="payment_method"
          name="payment_method"
          value={formData.payment_method}
          onChange={handleInputChange}
          className={styles.formSelect}
          required
        >
          <option value="cash_on_delivery">
            {t("orders.edit_order_page.payment_methods.cash_on_delivery")}
          </option>
          <option value="credit_card">
            {t("orders.edit_order_page.payment_methods.credit_card")}
          </option>
          <option value="bank_transfer">
            {t("orders.edit_order_page.payment_methods.bank_transfer")}
          </option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="notes">
          {t("orders.edit_order_page.order_notes")} (
          {t("orders.edit_order_page.optional")})
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          className={styles.formTextarea}
          rows="3"
          placeholder={t("orders.edit_order_page.enter_order_notes")}
        />
        <small className={styles.formHint}>
          {t("orders.edit_order_page.notes_hint")}
        </small>
      </div>
    </div>

    {order.status !== "pending" && (
      <div className={styles.warningMessage}>
        <div className={styles.warningIcon}>⚠️</div>
        <div className={styles.warningContent}>
          <h4>{t("orders.edit_order_page.notice")}</h4>
          <p>{t("orders.edit_order_page.edit_restriction_message")}</p>
        </div>
      </div>
    )}

    <div className={styles.formActions}>
      <button
        type="button"
        onClick={handleCancel}
        className={styles.cancelButton}
        disabled={saving}
      >
        {t("orders.edit_order_page.cancel")}
      </button>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={saving || order.status !== "pending"}
      >
        {saving ? (
          <>
            <span className={styles.spinnerSmall}></span>
            {t("orders.edit_order_page.saving")}
          </>
        ) : (
          t("orders.edit_order_page.update_order")
        )}
      </button>
    </div>
  </form>
</div>

      </div>
    </div>
  );
};

export default EditOrder;
