import React, { createContext, useState, useContext, useCallback } from 'react';
import AlertModal from './../Common/AlertModal';
import { useTranslation } from 'react-i18next';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const { t } = useTranslation();
  const [alertState, setAlertState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: t('common.alerts.ok_button', 'OK'),
    cancelText: t('common.alerts.cancel_button', 'Cancel'),
    onConfirm: null,
    onCancel: null,
    showCloseButton: true,
    closeOnOverlayClick: true,
    closeOnEscape: true
  });

  const closeAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const showAlert = useCallback(({
    title,
    message,
    type = 'info',
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    showCloseButton = true,
    closeOnOverlayClick = true,
    closeOnEscape = true
  }) => {
    setAlertState({
      isOpen: true,
      title,
      message,
      type,
      confirmText: confirmText || (onConfirm ? t('common.alerts.confirm_button', 'Confirm') : t('common.alerts.ok_button', 'OK')),
      cancelText: cancelText || (onCancel ? t('common.alerts.cancel_button', 'Cancel') : ''),
      onConfirm,
      onCancel,
      showCloseButton,
      closeOnOverlayClick,
      closeOnEscape
    });
  }, [t]);

  // Helper functions
  const showSuccess = useCallback((message, title = t('common.alerts.success_title', 'Success')) => {
    showAlert({
      title,
      message,
      type: 'success',
      onConfirm: closeAlert
    });
  }, [showAlert, closeAlert, t]);

  const showError = useCallback((message, title = t('common.alerts.error_title', 'Error')) => {
    showAlert({
      title,
      message,
      type: 'error',
      onConfirm: closeAlert
    });
  }, [showAlert, closeAlert, t]);

  const showWarning = useCallback((message, title = t('common.alerts.warning_title', 'Warning')) => {
    showAlert({
      title,
      message,
      type: 'warning',
      onConfirm: closeAlert
    });
  }, [showAlert, closeAlert, t]);

  const showInfo = useCallback((message, title = t('common.alerts.info_title', 'Information')) => {
    showAlert({
      title,
      message,
      type: 'info',
      onConfirm: closeAlert
    });
  }, [showAlert, closeAlert, t]);

  const showConfirm = useCallback(({
    title = t('common.alerts.confirm_title', 'Confirm Action'),
    message,
    type = 'danger',
    confirmText = t('common.alerts.confirm_button', 'Confirm'),
    cancelText = t('common.alerts.cancel_button', 'Cancel'),
    onConfirm,
    onCancel
  }) => {
    showAlert({
      title,
      message,
      type,
      confirmText,
      cancelText,
      onConfirm: () => {
        onConfirm && onConfirm();
        closeAlert();
      },
      onCancel: () => {
        onCancel && onCancel();
        closeAlert();
      }
    });
  }, [showAlert, closeAlert, t]);

  const showDeleteConfirm = useCallback(({
    title = t('common.alerts.delete_title', 'Confirm Delete'),
    message,
    onConfirm,
    onCancel
  }) => {
    showConfirm({
      title,
      message,
      type: 'danger',
      confirmText: t('common.alerts.delete_button', 'Delete'),
      warningText: t('common.alerts.delete_warning', 'This action cannot be undone'),
      onConfirm,
      onCancel
    });
  }, [showConfirm, t]);

  const value = {
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    showDeleteConfirm,
    closeAlert
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        confirmText={alertState.confirmText}
        cancelText={alertState.cancelText}
        onConfirm={alertState.onConfirm}
        onCancel={alertState.onCancel}
        showCloseButton={alertState.showCloseButton}
        closeOnOverlayClick={alertState.closeOnOverlayClick}
        closeOnEscape={alertState.closeOnEscape}
      />
    </AlertContext.Provider>
  );
};