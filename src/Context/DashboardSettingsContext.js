import React, { createContext, useContext, useEffect, useState } from "react";
import Cookie from "cookie-universal";
import { Axios } from "../API/axios.js";
import { USER, DASHBOARD_SETTINGS } from "../API/API.js";
import i18n from "../i18n/i18n.js";

const DashboardSettingsContext = createContext();

export const DashboardSettingsProvider = ({ children }) => {
    const cookie = Cookie();
    const token = cookie.get("e-commerce");

    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            if (!token) {
                // للمستخدمين غير المسجلين، استخدام إعدادات محايدة
                const defaultSettings = {
                    theme: 'light',
                    sidebarOpen: true,
                    language: 'en'
                };
                setSettings(defaultSettings);
                setLoading(false);
                return;
            }

            try {
                await Axios.get(USER);
                
                try {
                    const res = await Axios.get(DASHBOARD_SETTINGS);
                    setSettings(res.data);

                    // تطبيق الإعدادات على الداشبورد فقط
                    applyDashboardSettings(res.data);
                } catch (err) {
                    console.error("Error loading dashboard settings:", err);
                    const defaultSettings = {
                        theme: 'light',
                        sidebarOpen: true,
                        language: 'en'
                    };
                    setSettings(defaultSettings);
                    applyDashboardSettings(defaultSettings);
                }
            } catch {
                setLoading(false);
                return;
            }

            setLoading(false);
        };

        init();
    }, [token]);

    // دالة منفصلة لتطبيق إعدادات الداشبورد فقط
    const applyDashboardSettings = (dashboardSettings) => {
        // إضافة كلاس خاص للداشبورد فقط
        document.body.setAttribute("data-dashboard-theme", dashboardSettings.theme);
        
        // تطبيق اللغة للداشبورد فقط (لن يؤثر على المسارات العامة)
        if (dashboardSettings.language === 'ar') {
            document.body.classList.add('dashboard-arabic');
            document.body.classList.remove('dashboard-ltr');
        } else {
            document.body.classList.add('dashboard-ltr');
            document.body.classList.remove('dashboard-arabic');
        }
    };

    const setLocalSettings = async (newSettings) => {
        const merged = { ...settings, ...newSettings };
        setSettings(merged);

        // تطبيق التحديثات على الداشبورد فقط
        applyDashboardSettings(merged);

        try {
            await Axios.put(DASHBOARD_SETTINGS, {
                theme: merged.theme,
                sidebarOpen: merged.sidebarOpen,
                language: merged.language,
            });
        } catch (err) {
            console.error("Error updating dashboard settings:", err);
        }
    };

    if (loading) return null;

    return (
        <DashboardSettingsContext.Provider value={{ settings, setLocalSettings }}>
            {children}
        </DashboardSettingsContext.Provider>
    );
};

export const useDashboardSettings = () => useContext(DashboardSettingsContext);