import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Axios } from '../../API/axios';
import { usePublicUsers } from '../../Context/PublicUsersContext';
import { useTranslation } from 'react-i18next';
import Navbar from './HomeNavbarComponents/Navbar';
import CartModal from './HomeNavbarComponents/CartModal';
import { useAlert } from '../../Context/AlertContext'; // ✅ تفعيل الأليرت المركزي
import styles from './EditProfile.module.css';

const EditProfile = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user: currentUser, updateUser } = usePublicUsers();
  const { showSuccess, showError } = useAlert(); // ✅ استخدام الأليرت المركزي
  
  const [form, setForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name.trim() || !form.email.trim()) {
      showError(t('edit_profile.required_fields')); // ✅ استدعاء الأليرت
      return;
    }

    setLoading(true);

    try {
      await Axios.put('/user/profile', form);

      updateUser({ name: form.name, email: form.email });

      showSuccess(t('edit_profile.update_success')); // ✅ استدعاء الأليرت

      setTimeout(() => {
        navigate('/profile');
      }, 1500);

    } catch (err) {
      showError(err.response?.data?.message || t('edit_profile.update_failed')); // ✅ استدعاء الأليرت
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.editProfilePage}>
      <Navbar onOpenCart={() => setIsCartOpen(true)} />
      
      <div className={styles.container}>
        <div className={styles.header}>
          <button 
            onClick={() => navigate('/profile')}
            className={styles.backButton}
          >
            ← {t('edit_profile.back')}
          </button>
          <h1>{t('edit_profile.title')}</h1>
        </div>

        <div className={styles.formCard}>
          <form onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label>{t('edit_profile.name')}</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder={t('edit_profile.name_placeholder')}
                required
                disabled={loading}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label>{t('edit_profile.email')}</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder={t('edit_profile.email_placeholder')}
                required
                disabled={loading}
              />
            </div>
            
            <div className={styles.buttons}>
              <button 
                type="submit" 
                className={styles.saveBtn}
                disabled={loading}
              >
                {loading ? t('edit_profile.saving') : t('edit_profile.save')}
              </button>
              <button 
                type="button"
                onClick={() => navigate('/profile')}
                className={styles.cancelBtn}
                disabled={loading}
              >
                {t('edit_profile.cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>

      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default EditProfile;
