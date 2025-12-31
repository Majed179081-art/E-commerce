import axios from "axios";
import { useEffect } from "react";
import { baseURL, GOOGLE_CALL_BACK, USER } from "../../API/API";
import { useLocation, useNavigate } from "react-router-dom";
import Cookie from "cookie-universal";
import { useAlert } from "../../Context/AlertContext";
import { usePublicUsers } from "../../Context/PublicUsersContext";

export default function GoogleCallback() {
  const cookie = Cookie();
  const location = useLocation();
  const navigate = useNavigate();
  const { showError, showSuccess } = useAlert();
  const { login } = usePublicUsers();

  useEffect(() => {
    let isMounted = true;

    const query = new URLSearchParams(location.search);
    const code = query.get("code");

    // ✅ إذا مفيش code → ارجع للصفحة الرئيسية أو login
    if (!code) {
      showError("Google OAuth code missing. حاول تسجيل الدخول مرة أخرى.");
      navigate("/login", { replace: true });
      return;
    }

    async function googleLogin() {
      try {
        // 🔹 إرسال request للـ Backend
        const res = await axios.get(`${baseURL}/${GOOGLE_CALL_BACK}?code=${encodeURIComponent(code)}`);
        const token = res.data?.access_token;
        const userData = res.data?.user;

        if (!token || !userData) throw new Error("Invalid response from server");

        // ✅ حفظ الكوكيز
        cookie.set("e-commerce", token, { path: "/" });

        if (!isMounted) return;

        // ✅ تحديث PublicUsersContext
        login(token, userData);

        showSuccess("تم تسجيل الدخول بنجاح عبر Google!");

        // 🔒 التوجيه حسب role
        if (userData.role === "1995") {
          navigate("/dashboard", { replace: true }); // Admin فقط
        } else {
          navigate("/", { replace: true }); // أي مستخدم آخر
        }

      } catch (error) {
        console.error("Google login error:", error);

        if (!isMounted) return;

        showError(
          error.response?.data?.message ||
          error.message ||
          "فشل تسجيل الدخول عبر Google. حاول مرة أخرى."
        );
        navigate("/login", { replace: true });
      }
    }

    googleLogin();

    return () => {
      isMounted = false;
    };
  }, [location.search, cookie, navigate, showError, showSuccess, login]);

  return null;
}
