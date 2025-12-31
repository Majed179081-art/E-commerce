// src/pages/Customers/Settings/CustomersSettings.jsx
import React, { useState, useCallback, useEffect } from "react";
import { useSettings } from "../../../Context/SettingsContext";
import i18n from "../../../i18n/i18n.js";
import { useTranslation } from "react-i18next";
import { useAlert } from "../../../Context/AlertContext";
import styles from "./CustomersSettings.module.css";

const CustomersSettings = () => {
  const { settings, setSettings } = useSettings();
  const { t } = useTranslation();
  const { showSuccess, showError } = useAlert();

  // نسخة محلية من الإعدادات
  const [localSettings, setLocalSettings] = useState({
    theme: settings.theme,
    language: settings.language,
  });

  // تحديث النسخة المحلية إذا تغيرت الإعدادات الفعلية
  useEffect(() => {
    setLocalSettings({
      theme: settings.theme,
      language: settings.language,
    });
  }, [settings.theme, settings.language]);

  // تغيير الثيم
  const handleThemeChange = useCallback(
    async (e) => {
      const previousTheme = localSettings.theme;
      const newTheme = e.target.value;

      setLocalSettings((prev) => ({ ...prev, theme: newTheme }));
      document.documentElement.setAttribute("data-theme", newTheme);

      try {
        setSettings({ theme: newTheme });
        await showSuccess(t("dashboard_settings.save_success"));
      } catch (err) {
        console.error(err);
        showError(t("dashboard_settings.save_error"));
        // العودة للحالة السابقة
        setLocalSettings((prev) => ({ ...prev, theme: previousTheme }));
        document.documentElement.setAttribute("data-theme", previousTheme);
        setSettings({ theme: previousTheme });
      }
    },
    [localSettings.theme, setSettings, showSuccess, showError, t]
  );

  // تغيير اللغة
  const handleLanguageChange = useCallback(
    async (e) => {
      const previousLanguage = localSettings.language;
      const newLanguage = e.target.value;

      setLocalSettings((prev) => ({ ...prev, language: newLanguage }));

      try {
        await i18n.changeLanguage(newLanguage);
        setSettings({ language: newLanguage });
        await showSuccess(t("dashboard_settings.save_success"));
      } catch (err) {
        console.error(err);
        showError(t("dashboard_settings.save_error"));
        // العودة للحالة السابقة
        setLocalSettings((prev) => ({ ...prev, language: previousLanguage }));
        await i18n.changeLanguage(previousLanguage);
        setSettings({ language: previousLanguage });
      }
    },
    [localSettings.language, setSettings, showSuccess, showError, t]
  );

  return (
    <div className={styles.settingsContainer}>
      <h1>{t("dashboard_settings.title")}</h1>

      <div className={styles.settingsSection}>
        <h3>{t("dashboard_settings.theme_label")}</h3>
        <select
          value={localSettings.theme}
          onChange={handleThemeChange}
          className={styles.select}
        >
          <option value="light">{t("dashboard_settings.light_theme")}</option>
          <option value="dark">{t("dashboard_settings.dark_theme")}</option>
        </select>
      </div>

      <div className={styles.settingsSection}>
        <h3>{t("dashboard_settings.language_label")}</h3>
        <select
          value={localSettings.language}
          onChange={handleLanguageChange}
          className={styles.select}
        >
          <option value="en">{t("dashboard_settings.english")}</option>
          <option value="ar">{t("dashboard_settings.arabic")}</option>
        </select>
      </div>
    </div>
  );
};

export default CustomersSettings;
