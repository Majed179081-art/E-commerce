// src/Components/ThemeInitializer.js
import { useEffect } from 'react';
import { useDashboardSettings } from './Context/DashboardSettingsContext';
import i18n from './i18n/i18n.js';

const ThemeInitializer = ({ children }) => {
  const { settings } = useDashboardSettings();

  useEffect(() => {
    const applyThemeAndLanguage = () => {
      const html = document.documentElement;
      const body = document.body;
      
      if (settings) {
        // تطبيق الثيم
        body.setAttribute('data-theme', settings.theme);
        
        // تطبيق اللغة والاتجاه
        i18n.changeLanguage(settings.language);
        
        if (settings.language === 'ar') {
          html.setAttribute('dir', 'rtl');
          html.setAttribute('lang', 'ar');
          body.classList.add('arabic');
          body.classList.remove('ltr');
        } else {
          html.setAttribute('dir', 'ltr');
          html.setAttribute('lang', 'en');
          body.classList.add('ltr');
          body.classList.remove('arabic');
        }
      } else {
        // استخدام الإعدادات الافتراضية
        const savedLanguage = localStorage.getItem('preferred-language') || 'en';
        const savedTheme = localStorage.getItem('preferred-theme') || 'light';
        
        body.setAttribute('data-theme', savedTheme);
        i18n.changeLanguage(savedLanguage);
        
        if (savedLanguage === 'ar') {
          html.setAttribute('dir', 'rtl');
          html.setAttribute('lang', 'ar');
          body.classList.add('arabic');
          body.classList.remove('ltr');
        } else {
          html.setAttribute('dir', 'ltr');
          html.setAttribute('lang', 'en');
          body.classList.add('ltr');
          body.classList.remove('arabic');
        }
      }
    };
    

    applyThemeAndLanguage();
  }, [settings]);

  return children;
};

export default ThemeInitializer;