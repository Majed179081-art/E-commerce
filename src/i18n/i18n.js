import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// استيراد الملفات المقسمة - الإنجليزية
import commonEN from './en/common.json';
import authEN from './en/auth.json';
import productsEN from './en/products.json';
import dashboardEN from './en/dashboard.json';
import profileEN from './en/profile.json';
import navbarEN from './en/navbar.json';
import cartEN from './en/cart.json';
import searchEN from './en/search.json';
import categoriesEN from './en/categories.json';
import ratingEN from './en/rating.json';
import ordersEN from './en/orders.json';
import tableEN from './en/table.json';
import activitiesEN from './en/activities.json';
import usersEN from './en/users.json';
import dashboard_productsEN from './en/dashboard_products.json';
import dashboard_categoriesEN from './en/dashboard_categories.json';
import homeEN from './en/home.json';
// استيراد الملفات المقسمة - العربية
import commonAR from './ar/common.json';
import authAR from './ar/auth.json';
import productsAR from './ar/products.json';
import dashboardAR from './ar/dashboard.json';
import profileAR from './ar/profile.json';
import navbarAR from './ar/navbar.json';
import cartAR from './ar/cart.json';
import searchAR from './ar/search.json';
import categoriesAR from './ar/categories.json';
import ratingAR from './ar/rating.json';
import ordersAR from './ar/orders.json';
import tableAR from './ar/table.json';
import activitiesAR from './ar/activities.json';
import usersAR from './ar/users.json';
import dashboard_productsAR from './ar/dashboard_products.json';
import dashboard_categoriesAR from './ar/dashboard_categories.json';
import homeAR from './ar/home.json';
const resources = {
  en: {
    translation: {
      ...commonEN,
      ...authEN,
      ...productsEN,
      ...dashboardEN,
      ...profileEN,
      ...navbarEN,
      ...cartEN,
      ...searchEN,
      ...categoriesEN,
      ...ratingEN,
      ...ordersEN,
      ...tableEN,
      ...activitiesEN,
      ...usersEN,
      ...dashboard_productsEN,
      ...dashboard_categoriesEN,
      ...homeEN,
    }
  },
  ar: {
    translation: {
      ...commonAR,
      ...authAR,
      ...productsAR,
      ...dashboardAR,
      ...profileAR,
      ...navbarAR,
      ...cartAR,
      ...searchAR,
      ...categoriesAR,
      ...ratingAR,
      ...ordersAR,
      ...tableAR,
      ...activitiesAR,
      ...usersAR,
      ...dashboard_productsAR,
      ...dashboard_categoriesAR,
      ...homeAR,
    }
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: { 
    escapeValue: false,
    format: (value, format, lng) => {
      if (format === 'uppercase') return value.toUpperCase();
      if (format === 'lowercase') return value.toLowerCase();
      if (format === 'currency') {
        return new Intl.NumberFormat(lng === 'ar' ? 'ar-EG' : 'en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      }
      if (format === 'date') {
        return new Date(value).toLocaleDateString(lng === 'ar' ? 'ar-EG' : 'en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      return value;
    }
  },
  react: {
    useSuspense: false,
  },
});

// التحكم التلقائي في الاتجاه واللغة
i18n.on("languageChanged", (lng) => {
  const body = document.body;
  const html = document.documentElement;

  if (lng === "ar") {
    body.classList.add("arabic");
    html.setAttribute("dir", "rtl");
    html.setAttribute("lang", "ar");
  } else {
    body.classList.remove("arabic");
    html.setAttribute("dir", "ltr");
    html.setAttribute("lang", "en");
  }

  localStorage.setItem("preferred-language", lng);
});

// تهيئة اللغة من localStorage
const savedLanguage = localStorage.getItem("preferred-language");
if (savedLanguage && (savedLanguage === "en" || savedLanguage === "ar")) {
  i18n.changeLanguage(savedLanguage);
}

// وظيفة مساعدة لتغيير اللغة
export const changeLanguage = (lang) => {
  i18n.changeLanguage(lang);
};

// وظيفة مساعدة للحصول على اللغة الحالية
export const getCurrentLanguage = () => {
  return i18n.language;
};

export default i18n;