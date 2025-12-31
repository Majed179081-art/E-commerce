// src/context/SettingsContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { Axios } from "../API/axios";
import Cookie from "cookie-universal";
import i18n from "../i18n/i18n.js";

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  // اقرأ من localStorage إن وُجد أو استخدم الافتراضيات
  const savedSettings = JSON.parse(localStorage.getItem("user-settings")) || {
    theme: "light",
    language: "en",
    notifications: true,
  };

  const [settings, setSettingsState] = useState(savedSettings);
  const [loading, setLoading] = useState(true);
  const cookie = Cookie();

  // تحديث: يضع محلياً ويُحاول إرسال التغيير للسيرفر
  // src/context/SettingsContext.js

const updateSettings = async (newSettingsPartial) => {
  const merged = { ...settings, ...newSettingsPartial };
  try {
    setSettingsState(merged);
    localStorage.setItem("user-settings", JSON.stringify(merged));

    if (merged.theme) document.body.setAttribute("data-theme", merged.theme);
    if (merged.language) {
      i18n.changeLanguage(merged.language);
      document.body.classList.toggle("arabic", merged.language === "ar");
    }

    // ✅ تحقق من نوع المستخدم
    const resUser = await Axios.get("/user").catch(() => null);
    const user = resUser?.data;
    const isAdmin = user?.role === "admin" || user?.permissions?.includes("manage_settings");

    if (isAdmin) {
      // 🔹 فقط حفظ محلي للأدمن
      await Axios.post("/activities", {
        action: "update_settings",
        entity_type: "settings",
        description: `Admin ${user.name} changed site appearance to ${merged.theme} & language ${merged.language}`,
      });
    } else {
      // 🔹 المستخدم العادي = حفظ في السيرفر
      await Axios.put("/settings", merged).catch((err) => {
        console.warn("Warning: failed to persist settings to server", err);
      });
    }
  } catch (err) {
    console.error("Error updating settings:", err);
  }
};


  // عند الإقلاع: جلب من السيرفر إذا المستخدم مسجل
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await Axios.get("/settings");
        if (res.data && res.data.settings) {
          const s = res.data.settings;
          const merged = {
            theme: s.theme || savedSettings.theme,
            language: s.language || savedSettings.language,
            notifications:
              typeof s.notifications === "boolean"
                ? s.notifications
                : savedSettings.notifications,
          };
          setSettingsState(merged);
          localStorage.setItem("user-settings", JSON.stringify(merged));
        }
      } catch (err) {
        // لو فشل السيرفر لا نكسر التطبيق، نستخدم القيم المحلية
        console.info("Could not fetch remote settings, using local settings.");
      } finally {
        setLoading(false);
      }
    };

    const token = cookie.get("e-commerce");
    if (token) {
      fetchSettings();
    } else {
      // لا يوجد توكين => لا حاجة للانتظار
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // تطبيق الثيم و اللغة عند التغيير (حتى لو تم تعديل آخر من خارج)
  useEffect(() => {
    if (settings.theme) {
      document.body.setAttribute("data-theme", settings.theme);
    }
  }, [settings.theme]);

  useEffect(() => {
    if (settings.language) {
      i18n.changeLanguage(settings.language);
      document.body.classList.toggle("arabic", settings.language === "ar");
    }
  }, [settings.language]);

  return (
    <SettingsContext.Provider
      value={{ settings, setSettings: updateSettings, loading }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
