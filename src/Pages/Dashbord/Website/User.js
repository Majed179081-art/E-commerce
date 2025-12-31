import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Axios } from '../../../API/axios';
import { DASHBOARD_USER, DASHBOARD_USERS, USER, USERS } from '../../../API/API';
import LoadingSubmit from '../../../Components/Loading/Loading';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import './Css-files/UpdateUser.css';
import { useAlert } from '../../../Context/AlertContext';
import { useAdminData } from '../../../Context/AdminDataContext'; // ⬅️ أضيف هذا الاستيراد

export default function User() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ''
  });
  const [isValidUser, setIsValidUser] = useState(false);
  
  // استخدام الألرت المركزي للرسائل فقط
  const { showError, showSuccess } = useAlert();
  const { clearCache } = useAdminData(); // ⬅️ أضيف هذا

  useEffect(() => {
    const userId = Number(id);
    if (isNaN(userId)) {
      navigate('/dashboard/users/page/404', { replace: true });
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await Axios.get(`/${DASHBOARD_USERS}/${userId}`);
        if (response.data && response.data.id) {
          setFormData({
            name: response.data.name,
            email: response.data.email,
            role: response.data.role
          });
          setIsValidUser(true);
        } else {
          navigate('/dashboard/users/page/404', { replace: true });
        }
      } catch (err) {
        navigate('/dashboard/users/page/404', { replace: true });
      }
    };

    fetchUserData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      const errorMsg = t('users.update_user.required_fields');
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await Axios.put(`${DASHBOARD_USERS}/${id}`, formData);
      
      // ⬇️ أضيف هذا السطر ⬇️
      clearCache('users'); // تحديث الكاش للمستخدمين
      
      // رسالة نجاح
      showSuccess(t('users.update_user.update_success'));
      
      // الانتقال بعد عرض رسالة النجاح
      setTimeout(() => {
        navigate('/dashboard/users', { replace: true });
      }, 1000);
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('users.update_user.update_failed');
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isValidUser) {
    return <LoadingSubmit />;
  }

  return (
    <div className="update-user-container">
      <div className="user-header">
        <button onClick={() => navigate('/dashboard/users')} className="back-button">
          <FiArrowLeft size={20} />
        </button>
        <h1>{t('users.edit_user_title')}</h1>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="user-form-container">
        {loading && <LoadingSubmit />}

        <form onSubmit={handleUpdate}>
          <div className="form-section">
            <label className="form-label">{t('users.name_label')}</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-input"
              placeholder={t('users.name_placeholder')}
              disabled={loading}
            />
          </div>

          <div className="form-section">
            <label className="form-label">{t('users.email_label')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
              placeholder={t('users.email_placeholder')}
              disabled={loading}
            />
          </div>

          <div className="form-section">
            <label className="form-label">{t('users.role_label')}</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="form-input"
              disabled={loading}
            >
              <option value="" disabled>{t('users.select_role')}</option>
              <option value="1995">{t('users.role_admin')}</option>
              <option value="2001">{t('users.role_user')}</option>
              <option value="1996">{t('users.role_writer')}</option>
              <option value="1999">{t('users.role_product_manager')}</option>
            </select>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              disabled={loading}
              className="primary-btn"
            >
              {loading ? t('users.update_user.updating') : (
                <>
                  <FiCheck /> {t('users.update_user.save_changes')}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/users')}
              disabled={loading}
              className="secondary-btn"
            >
              {t('users.update_user.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}