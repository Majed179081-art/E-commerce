// src/Pages/Auth/Login/Login.js
import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { baseURL, LOGIN } from "../../API/API";
import LoadingSubmit from "../../Components/Loading/Loading";
import Cookie from "cookie-universal";
import Form from "react-bootstrap/Form";
import { useNavigate } from "react-router-dom";
import { permissions } from "../Auth/permissions";
import styles from "./Auth.module.css";
import { useTranslation } from "react-i18next";
import { useAlert } from "../../Context/AlertContext";
import { usePublicUsers } from "../../Context/PublicUsersContext"; // ✅ Context

export default function Login() {
  const { t } = useTranslation();
  const { showError, showSuccess } = useAlert();
  const { login: contextLogin } = usePublicUsers(); // ✅ استخدام Context لتحديث الحالة
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const emailInputRef = useRef(null);

  useEffect(() => {
    emailInputRef.current.focus();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${baseURL}/${LOGIN}`, form);
      const token = res.data.token;
      const userData = res.data.user;

      // ✅ تحديث الحالة في Context مباشرة
      contextLogin(token, userData);

      showSuccess(t("login_page.sign_in") + " " + t("login_page.title"));

      if (userData.role === permissions.ADMIN || userData.role === permissions.WRITER) {
        navigate("/dashboard/welcome", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      showError(
        err.response?.data?.message || t("login_page.login_failed")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingSubmit />}
      <div className={styles.container}>
        <div className={styles.row}>
          <Form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formWrapper}>
              <h1 className={styles.title}>{t("login_page.title")}</h1>

              <Form.Group className={styles.formGroup} controlId="formEmail">
                <Form.Label className={styles.label}>
                  {t("login_page.email")}
                </Form.Label>
                <Form.Control
                  ref={emailInputRef}
                  required
                  name="email"
                  type="email"
                  placeholder={t("login_page.email_placeholder")}
                  value={form.email}
                  onChange={handleChange}
                  className={styles.input}
                />
              </Form.Group>

              <Form.Group className={styles.formGroup} controlId="formPassword">
                <Form.Label className={styles.label}>
                  {t("login_page.password")}
                </Form.Label>
                <Form.Control
                  minLength="6"
                  required
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  type="password"
                  placeholder={t("login_page.password_placeholder")}
                  className={styles.input}
                />
              </Form.Group>

              <div className={styles.rememberMe}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  id="rememberMe"
                />
                <label className={styles.checkboxLabel} htmlFor="rememberMe">
                  {t("login_page.remember_me")}
                </label>
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading
                  ? t("login_page.signing_in")
                  : t("login_page.sign_in")}
              </button>

              <div className={styles.divider}>
                <span>{t("login_page.or_continue_with")}</span>
              </div>

              <a
                href={`http://127.0.0.1:8000/login-google`}
                className={styles.googleButton}
              >
                <div className={styles.googleIcon}>
                  <img
                    src="https://cdn2.iconfinder.com/data/icons/social-icons-33/128/Google-1024.png"
                    alt="Google sign-in"
                  />
                </div>
                <span>{t("login_page.sign_in_google")}</span>
              </a>

              <div className={styles.footer}>
                <p>
                  {t("login_page.no_account")}{" "}
                  <a href="/register" className={styles.link}>
                    {t("login_page.sign_up")}
                  </a>
                </p>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
}
