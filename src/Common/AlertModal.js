import React from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import styles from './AlertModal.module.css'; // 👈 استيراد الـ styles

const AlertModal = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  children
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handleEscape = (e) => {
      if (closeOnEscape && e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeOnEscape]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose && onClose();
    }, 300);
  };

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    handleClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    handleClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      case 'danger':
        return '🗑️';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  const getIconClass = () => {
    switch (type) {
      case 'success': return styles.iconSuccess;
      case 'error': return styles.iconError;
      case 'danger': return styles.iconDanger;
      case 'warning': return styles.iconWarning;
      case 'info': 
      default: return styles.iconInfo;
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case 'success': return styles.typeSuccess;
      case 'error': return styles.typeError;
      case 'danger': return styles.typeDanger;
      case 'warning': return styles.typeWarning;
      case 'info': 
      default: return styles.typeInfo;
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case 'success': return styles.confirmButtonSuccess;
      case 'error': return styles.confirmButtonError;
      case 'danger': return styles.confirmButtonDanger;
      case 'warning': return styles.confirmButtonWarning;
      case 'info': 
      default: return styles.confirmButtonInfo;
    }
  };

  const modalContent = (
    <div 
      className={`${styles.overlay} ${isVisible ? styles.overlayVisible : ''}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-modal-title"
    >
      <div className={`${styles.container} ${getTypeClass()}`}>
        <div className={styles.header}>
          <div className={`${styles.icon} ${getIconClass()}`}>
            {getIcon()}
          </div>
          <h3 id="alert-modal-title" className={styles.title}>
            {title}
          </h3>
          {showCloseButton && (
            <button
              type="button"
              className={styles.closeButton}
              onClick={handleClose}
              aria-label="Close"
            >
              &times;
            </button>
          )}
        </div>

        <div className={styles.body}>
          {message && <div className={styles.message}>{message}</div>}
          {children}
        </div>

        <div className={styles.footer}>
          {onCancel && (
            <button
              type="button"
              className={`${styles.button} ${styles.cancelButton}`}
              onClick={handleCancel}
            >
              {cancelText}
            </button>
          )}
          {onConfirm && (
            <button
              type="button"
              className={`${styles.button} ${styles.confirmButton} ${getConfirmButtonClass()}`}
              onClick={handleConfirm}
              autoFocus={!onCancel}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

AlertModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  title: PropTypes.string.isRequired,
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  type: PropTypes.oneOf(['info', 'success', 'warning', 'error', 'danger']),
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  showCloseButton: PropTypes.bool,
  closeOnOverlayClick: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  children: PropTypes.node
};

export default AlertModal;