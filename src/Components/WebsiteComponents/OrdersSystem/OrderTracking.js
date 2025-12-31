import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './OrderTracking.module.css';

const OrderTracking = ({ order, onClose }) => {
  const { t } = useTranslation();

  const timeline = [
    { status: 'order_placed', date: order.created_at, completed: true },
    { status: 'order_confirmed', date: order.updated_at, completed: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) },
    { status: 'order_processed', date: null, completed: ['processing', 'shipped', 'delivered'].includes(order.status) },
    { status: 'order_shipped', date: null, completed: ['shipped', 'delivered'].includes(order.status) },
    { status: 'out_for_delivery', date: null, completed: order.status === 'delivered' },
    { status: 'delivered', date: null, completed: order.status === 'delivered' }
  ];

  return (
    <div className={styles.trackingModal}>
      <div className={styles.trackingContent}>
        <div className={styles.trackingHeader}>
          <h3>{t('orders.track_order')}</h3>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>
        
        <div className={styles.orderInfo}>
          <p><strong>{t('orders.order_number')}:</strong> {order.order_number}</p>
          <p><strong>{t('orders.current_status')}:</strong> 
            <span className={`${styles.currentStatus} ${styles[order.status]}`}>
              {t(`orders.status.${order.status}`)}
            </span>
          </p>
        </div>

        <div className={styles.timeline}>
          {timeline.map((step, index) => (
            <div key={index} className={`${styles.timelineStep} ${step.completed ? styles.completed : ''}`}>
              <div className={styles.stepIcon}>
                {step.completed ? '✓' : (index + 1)}
              </div>
              <div className={styles.stepContent}>
                <h4>{t(`orders.timeline.${step.status}`)}</h4>
                {step.date && (
                  <p>{new Date(step.date).toLocaleString()}</p>
                )}
              </div>
              {index < timeline.length - 1 && (
                <div className={styles.connector}></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;