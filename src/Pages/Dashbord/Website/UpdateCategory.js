import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Axios } from '../../../API/axios';
import { CATEGORIES, CATEGORY } from '../../../API/API';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import LoadingSubmit from '../../../Components/Loading/Loading';
import { FiArrowLeft, FiUpload, FiCheck } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import './Css-files/UpdateCategory.css';
import { useAlert } from '../../../Context/AlertContext';
import { useAdminData } from '../../../Context/AdminDataContext'; // ⬅️ أضيف هذا الاستيراد

export default function UpdateCategory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    image: null,
    currentImage: ''
  });
  const [showModal, setShowModal] = useState(false);
  
  const { showError, showSuccess } = useAlert();
  const { clearCache } = useAdminData(); // ⬅️ أضيف هذا

  useEffect(() => {
    setLoading(true);
    Axios.get(`${CATEGORY}/${id}`)
      .then(response => {
        setFormData({
          title: response.data.title,
          image: null,
          currentImage: response.data.image
        });
      })
      .catch(() => {
        const errorMsg = t('update_category.load_error');
        setError(errorMsg);
        showError(errorMsg);
        navigate('/dashboard/categories');
      })
      .finally(() => setLoading(false));
  }, [id, navigate, t, showError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        const errorMsg = t('update_category.image_type_error');
        setError(errorMsg);
        showError(errorMsg);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        const errorMsg = t('update_category.image_size_error');
        setError(errorMsg);
        showError(errorMsg);
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        image: file,
        currentImage: URL.createObjectURL(file)
      }));
      setError('');
    }
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.title) {
    const errorMsg = t('update_category.required_name');
    setError(errorMsg);
    showError(errorMsg);
    return;
  }

  setLoading(true);
  try {
    const data = new FormData();
    data.append('title', formData.title);
    data.append('_method', 'PUT');
    
    if (formData.image) {
      data.append('image', formData.image);
    }

    await Axios.post(`${CATEGORIES}/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    // ⬇️ أضيف هذا السطر ⬇️
    clearCache('categories'); // تحديث الكاش للفئات
    
    showSuccess(t('update_category.update_success'));
    
    setTimeout(() => {
      navigate('/dashboard/categories');
    }, 1000);
    
  } catch (err) {
    console.error('Error details:', err.response?.data);
    
    if (err.response?.status === 422) {
      const errors = err.response.data.errors;
      if (errors) {
        const errorMessages = Object.values(errors).flat().join(', ');
        const errorMsg = t('update_category.validation_errors') + ': ' + errorMessages;
        setError(errorMsg);
        showError(errorMsg);
      } else {
        const errorMsg = err.response.data?.message || t('update_category.update_failed');
        setError(errorMsg);
        showError(errorMsg);
      }
    } else {
      const errorMsg = err.response?.data?.message || t('update_category.update_failed');
      setError(errorMsg);
      showError(errorMsg);
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="update-category-container">
      <div className="category-header">
        <button onClick={() => navigate('/dashboard/categories')} className="back-button">
          <FiArrowLeft size={20} />
        </button>
        <h1>{t('update_category.title')}</h1>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="category-form-container">
        {loading && <LoadingSubmit />}

        <Form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="form-section">
            <label className="form-label">{t('update_category.name_label')}</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="form-input"
              placeholder={t('update_category.name_placeholder')}
            />
          </div>

          <div className="form-section">
            <label className="form-label">{t('update_category.image_label')}</label>
            <div className="image-upload-wrapper">
              <label className="upload-area">
                <FiUpload className="upload-icon" />
                <div className="upload-text">{t('update_category.choose_image')}</div>
                <div className="upload-hint">{t('update_category.image_hint')}</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden-input"
                />
              </label>
              
              {formData.currentImage && (
                <div className="image-preview-container">
                  <div className="image-preview">
                    <img 
                      src={formData.currentImage} 
                      alt={t('update_category.category_alt')} 
                      onClick={() => setShowModal(true)}
                    />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          currentImage: '',
                          image: null
                        }));
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
              {loading ? t('update_category.updating') : (
                <>
                  <FiCheck /> {t('update_category.update_button')}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/categories')}
              disabled={loading}
              className="secondary-btn"
            >
              {t('update_category.cancel_button')}
            </button>
          </div>
        </Form>
      </div>

      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        centered 
        size="lg"
        className="preview-modal"
      >
        <Modal.Body className="preview-modal-body">
          <img 
            src={formData.currentImage} 
            alt={t('update_category.preview_alt')} 
            className="modal-image"
          />
        </Modal.Body>
      </Modal>
    </div>
  );
}