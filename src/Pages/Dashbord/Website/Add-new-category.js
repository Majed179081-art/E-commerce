import { useState, useRef, useEffect } from 'react';
import { Axios } from '../../../API/axios';
import { CATEGORIES, CATEGORY } from '../../../API/API';
import { useNavigate } from 'react-router-dom';
import LoadingSubmit from '../../../Components/Loading/Loading';
import { FiArrowLeft, FiUpload, FiCheck } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import './Css-files/UpdateCategory.css';
import { useAlert } from '../../../Context/AlertContext';
import { useAdminData } from '../../../Context/AdminDataContext'; // ⬅️ أضيف هذا الاستيراد

export default function AddCategory() {
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        const errorMsg = t('add_category.image_type_error');
        setError(errorMsg);
        showError(errorMsg);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        const errorMsg = t('add_category.image_size_error');
        setError(errorMsg);
        showError(errorMsg);
        return;
      }

      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  async function handleAddCategory(e) {
    e.preventDefault();
    if (!name || !image) {
      const errorMsg = t('add_category.required_fields');
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', name);
      formData.append('image', image);

      await Axios.post(`${CATEGORIES}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // ⬇️ أضيف هذا السطر ⬇️
      clearCache('categories'); // تحديث الكاش للفئات
      
      showSuccess(t('add_category.add_success'));
      
      setError("");
      
      setTimeout(() => {
        navigate('/dashboard/categories', { replace: true });
      }, 1000);
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || t('add_category.add_failed');
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="update-category-container">
      <div className="category-header">
        <button onClick={() => navigate('/dashboard/categories')} className="back-button">
          <FiArrowLeft size={20} />
        </button>
        <h1>{t('add_category.title')}</h1>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="category-form-container">
        {loading && <LoadingSubmit />}

        <form onSubmit={handleAddCategory} encType="multipart/form-data">
          <div className="form-section">
            <label className="form-label">{t('add_category.name_label')}</label>
            <input
              type="text"
              name="title"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="form-input"
              placeholder={t('add_category.name_placeholder')}
              ref={nameInputRef}
            />
          </div>

          <div className="form-section">
            <label className="form-label">{t('add_category.image_label')}</label>
            <div className="image-upload-wrapper">
              <label className="upload-area">
                <FiUpload className="upload-icon" />
                <div className="upload-text">{t('add_category.choose_image')}</div>
                <div className="upload-hint">{t('add_category.image_hint')}</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden-input"
                />
              </label>

              {preview && (
                <div className="image-preview-container">
                  <div className="image-preview">
                    <img 
                      src={preview}
                      alt={t('add_category.preview_alt')}
                    />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => {
                        setPreview(null);
                        setImage(null);
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={loading}
              className="primary-btn"
            >
              {loading ? t('add_category.adding') : (
                <>
                  <FiCheck /> {t('add_category.add_button')}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/categories')}
              disabled={loading}
              className="secondary-btn"
            >
              {t('add_category.cancel_button')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}