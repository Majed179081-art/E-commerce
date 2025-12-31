// src/Pages/Auth/Register/Register.js
import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { baseURL, REGISTER } from "../../API/API";
import LoadingSubmit from "../../Components/Loading/Loading";
import Cookie from "cookie-universal";
import Form from "react-bootstrap/Form";
import { useNavigate } from "react-router-dom";
import styles from "./Auth.module.css";
import { useTranslation, Trans } from "react-i18next";
import { useAlert } from "../../Context/AlertContext";
import { usePublicUsers } from "../../Context/PublicUsersContext"; // ✅ Context

export default function Register() {
  const { t } = useTranslation();
  const { showSuccess, showError } = useAlert();
  const { login: contextLogin } = usePublicUsers();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const nameInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    nameInputRef.current.focus();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${baseURL}/${REGISTER}`, form);
      const token = res.data.token;
      const userData = res.data.user;

      // ✅ تحديث الحالة مباشرة
      contextLogin(token, userData);

      showSuccess(t("register_page.create_account"));

      navigate("/dashboard", { replace: true });
    } catch (err) {
      showError(
        err.response?.data?.message || t("register_page.registration_failed")
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
              <h1 className={styles.title}>{t("register_page.title")}</h1>

              <Form.Group className={styles.formGroup} controlId="formName">
                <Form.Label className={styles.label}>
                  {t("register_page.name")}
                </Form.Label>
                <Form.Control
                  ref={nameInputRef}
                  required
                  name="name"
                  type="text"
                  placeholder={t("register_page.name_placeholder")}
                  value={form.name}
                  onChange={handleChange}
                  className={styles.input}
                />
              </Form.Group>

              <Form.Group className={styles.formGroup} controlId="formEmail">
                <Form.Label className={styles.label}>
                  {t("register_page.email")}
                </Form.Label>
                <Form.Control
                  required
                  name="email"
                  type="email"
                  placeholder={t("register_page.email_placeholder")}
                  value={form.email}
                  onChange={handleChange}
                  className={styles.input}
                />
              </Form.Group>

              <Form.Group className={styles.formGroup} controlId="formPassword">
                <Form.Label className={styles.label}>
                  {t("register_page.password")}
                </Form.Label>
                <Form.Control
                  minLength="6"
                  required
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  type="password"
                  placeholder={t("register_page.password_placeholder")}
                  className={styles.input}
                />
              </Form.Group>

              <div className={styles.terms}>
                <input
                  required
                  type="checkbox"
                  className={styles.checkbox}
                  id="terms"
                />
                <label className={styles.checkboxLabel} htmlFor="terms">
                  <Trans
                    i18nKey="register_page.terms"
                    components={{
                      terms: <a href="/terms" className={styles.link} />,
                      privacy: <a href="/privacy" className={styles.link} />,
                    }}
                  />
                </label>
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading
                  ? t("register_page.creating_account")
                  : t("register_page.create_account")}
              </button>

              <div className={styles.divider}>
                <span>{t("register_page.or_sign_up_with")}</span>
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
                <span>{t("register_page.sign_up_google")}</span>
              </a>

              <div className={styles.footer}>
                <p>
                  {t("register_page.have_account")}{" "}
                  <a href="/login" className={styles.link}>
                    {t("register_page.sign_in")}
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
