//src/Pages/Dashbord/Website/DashboardSettings.js
import React, { useState, useEffect } from "react";
import { useDashboardSettings } from "../../../Context/DashboardSettingsContext";
import { useTranslation } from "react-i18next";
import styles from "./Css-files/Settings.module.css";
import { useAlert } from "../../../Context/AlertContext"; // 👈 استيراد useAlert

const DashboardSettings = () => {
  const { settings, setLocalSettings } = useDashboardSettings();
  const { t } = useTranslation();
  const [local, setLocal] = useState(settings);
  
  // 👈 استخدام الألرت المركزي
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    setLocal(settings);
  }, [settings]);

  if (!settings) return <div className={styles.loading}>{t('dashboard_settings.loading')}</div>;

  const handleChange = (key, value) =>
    setLocal((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    try {
      setLocalSettings(local);
      showSuccess(t('dashboard_settings.save_success')); // 👈 رسالة نجاح
    } catch (error) {
      showError(t('dashboard_settings.save_error')); // 👈 رسالة خطأ
    }
  };

  return (
    <div className={styles.settingsContainer}>
      <h1>{t('dashboard_settings.title')}</h1>

      <div className={styles.settingsSection}>
        <h3>{t('dashboard_settings.theme_label')}</h3>
        <select
          className={styles.select}
          value={local.theme}
          onChange={(e) => handleChange("theme", e.target.value)}
        >
          <option value="light">{t('dashboard_settings.light_theme')}</option>
          <option value="dark">{t('dashboard_settings.dark_theme')}</option>
        </select>
      </div>

      <div className={styles.settingsSection}>
        <h3>{t('dashboard_settings.sidebar_label')}</h3>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={local.sidebarOpen}
            onChange={(e) => handleChange("sidebarOpen", e.target.checked)}
          />
          {t('dashboard_settings.sidebar_open')}
        </label>
      </div>

      <div className={styles.settingsSection}>
        <h3>{t('dashboard_settings.language_label')}</h3>
        <select
          className={styles.select}
          value={local.language}
          onChange={(e) => handleChange("language", e.target.value)}
        >
          <option value="en">{t('dashboard_settings.english')}</option>
          <option value="ar">{t('dashboard_settings.arabic')}</option>
        </select>
      </div>

      <button className={styles.saveButton} onClick={handleSave}>
        {t('dashboard_settings.save_button')}
      </button>
    </div>
  );
};

export default DashboardSettings;