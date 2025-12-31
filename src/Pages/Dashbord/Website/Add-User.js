import { useState, useRef, useEffect } from 'react';
import { Axios } from '../../../API/axios';
import { DASHBOARD_PREFIX, DASHBOARD_USERS, USER, USERS } from '../../../API/API';
import { useNavigate } from 'react-router-dom';
import LoadingSubmit from '../../../Components/Loading/Loading';
import { useTranslation } from 'react-i18next';
import './Css-files/AddUser.css';
import { useAlert } from '../../../Context/AlertContext';
import { useAdminData } from '../../../Context/AdminDataContext'; // ⬅️ أضيف هذا الاستيراد

export default function AddUser() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const nameInputRef = useRef(null);
  
  const { showError, showSuccess } = useAlert();
  const { clearCache } = useAdminData(); // ⬅️ أضيف هذا

  useEffect(() => {
    nameInputRef.current.focus();
  }, []);

  async function handleAddUser(e) {
    e.preventDefault();

    if (!name || !email || !password || !role) {
      const errorMsg = t('users.add_user.required_fields');
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await Axios.post(`/${DASHBOARD_USERS}/add`, { name, email, password, role });
      
      // ⬇️ أضيف هذا السطر ⬇️
      clearCache('users'); // تحديث الكاش للمستخدمين
      
      showSuccess(t('users.add_user.add_success'));
      
      setTimeout(() => {
        navigate('/dashboard/users', { replace: true });
      }, 1000);
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || t('users.add_user.add_failed');
      setError(errorMsg);
      showError(errorMsg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="formPage">
      <h2 className="formTitle">{t('users.add_user_title')}</h2>

      {loading && <LoadingSubmit />}

      {error && (
        <div className="errorMsg">{error}</div>
      )}

      <form className="customForm" onSubmit={handleAddUser}>
        <div className="formGroup">
          <label>{t('users.name_label')}</label>
          <input
            ref={nameInputRef}
            type="text"
            value={name}
            placeholder={t('users.name_placeholder')}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="formGroup">
          <label>{t('users.email_label')}</label>
          <input
            type="email"
            value={email}
            placeholder={t('users.email_placeholder')}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="formGroup">
          <label>{t('users.password_label')}</label>
          <input
            type="password"
            value={password}
            placeholder={t('users.password_placeholder')}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="formGroup">
          <label>{t('users.role_label')}</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="" disabled>{t('users.select_user_role')}</option>
            <option value="1995">{t('users.role_admin')}</option>
            <option value="2001">{t('users.role_user')}</option>
            <option value="1996">{t('users.role_writer')}</option>
            <option value="1999">{t('users.role_product_manager')}</option>
          </select>
        </div>

        <button type="submit" className="submitBtn" disabled={loading}>
          {loading ? t('users.add_user.adding') : t('users.add_user.add_button')}
        </button>
      </form>
    </div>
  );
}