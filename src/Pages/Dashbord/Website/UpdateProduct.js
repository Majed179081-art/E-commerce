import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Axios } from "../../../API/axios";
import { FiArrowLeft, FiUpload, FiCheck } from "react-icons/fi";
import LoadingSubmit from "../../../Components/Loading/Loading";
import { useTranslation } from "react-i18next";
import "./Css-files/UpdateProduct.css";
import { useAlert } from "../../../Context/AlertContext";
import { useAdminData } from "../../../Context/AdminDataContext";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const { showError, showSuccess } = useAlert();
  const { clearCache } = useAdminData();

  const [product, setProduct] = useState({
    title: "",
    price: "",
    discount: "0",
    description: "",
    About: "",
    status: "published",
    category: "",
    stock: "",
    images: [],
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [deletedImageIds, setDeletedImageIds] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const productResponse = await Axios.get(`/product/${id}`);

        let productData = productResponse.data;

        if (productData && typeof productData === 'object') {
          setProduct({
            title: productData.title || "",
            price: productData.price?.toString() || "",
            discount: productData.discount?.toString() || "0",
            description: productData.description || "",
            About: productData.About || productData.about || "",
            status: productData.status || "published",
            category: productData.category?.toString() || productData.category_id?.toString() || "",
            stock: productData.stock?.toString() || "",
            images: productData.images || productData.product_images || [],
          });
        } else if (Array.isArray(productData) && productData.length > 0) {
          productData = productData[0];
          setProduct({
            title: productData.title || "",
            price: productData.price?.toString() || "",
            discount: productData.discount?.toString() || "0",
            description: productData.description || "",
            About: productData.About || "",
            status: productData.status || "published",
            category: productData.category?.toString() || "",
            stock: productData.stock?.toString() || "",
            images: productData.images || [],
          });
        } else {
          throw new Error(t('edit_product.invalid_data_structure'));
        }

        try {
          const categoriesResponse = await Axios.get("/categories");
          setCategories(categoriesResponse.data?.data || categoriesResponse.data || []);
        } catch {
          setCategories([]);
        }

      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login");
        } else if (err.response?.status === 404) {
          const errorMsg = t('edit_product.product_not_found');
          setError(errorMsg);
          showError(errorMsg);
        } else {
          const errorMsg = t('edit_product.load_failed');
          setError(errorMsg);
          showError(errorMsg);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    } else {
      const errorMsg = t('edit_product.missing_id');
      setError(errorMsg);
      showError(errorMsg);
      setLoading(false);
    }
  }, [id, navigate, t, showError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = selectedImages.length + files.length;

    if (totalImages > 5) {
      showError(t('edit_product.max_images_alert'));
      return;
    }

    setSelectedImages((prev) => [...prev, ...files]);
  };

  const handleRemoveSelectedImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveOldImage = (index) => {
    const updatedImages = [...product.images];
    const imageToRemove = updatedImages[index];

    if (imageToRemove && imageToRemove.id) {
      setDeletedImageIds((prev) => [...prev, imageToRemove.id]);
    }

    updatedImages.splice(index, 1);
    setProduct((prev) => ({ ...prev, images: updatedImages }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!product.title.trim()) {
    const errorMsg = t('edit_product.name_required');
    setError(errorMsg);
    showError(errorMsg);
    return;
  }

  if (!product.category) {
    const errorMsg = t('edit_product.category_required');
    setError(errorMsg);
    showError(errorMsg);
    return;
  }

  if (!product.price || isNaN(product.price)) {
    const errorMsg = t('edit_product.price_validation');
    setError(errorMsg);
    showError(errorMsg);
    return;
  }

  setSubmitting(true);
  setError("");

  try {
    for (const imageId of deletedImageIds) {
      try {
        await Axios.delete(`/product-images/${imageId}`);
      } catch {}
    }

    const requestData = {
      category: product.category || "",
      title: product.title.trim(),
      description: product.description.trim(),
      price: parseFloat(product.price) || 0,
      About: product.About.trim(),
      discount: parseFloat(product.discount) || 0,
      stock: parseInt(product.stock) || 0
    };

    await Axios.put(`/products/${id}`, requestData, {
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
    });

    if (selectedImages.length > 0) {
      const imageFormData = new FormData();
      
      imageFormData.append("product_id", id);
      
      selectedImages.forEach((image, index) => {
        imageFormData.append(`images[${index}]`, image);
      });

      await Axios.post("/product-images", imageFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    clearCache('products');
    
    showSuccess(t('dashboard.data_updated'));
    
    setTimeout(() => {
      navigate("/dashboard/products");
    }, 1500);
    
  } catch (err) {
    if (err.response) {
      let errorMsg = '';
      if (err.response.status === 404) {
        errorMsg = t('dashboard.edit_product.endpoint_not_found');
      } else if (err.response.status === 405) {
        errorMsg = t('dashboard.edit_product.method_not_allowed');
      } else if (err.response.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat().join(', ');
        errorMsg = `${t('dashboard.edit_product.data_errors')}: ${errorMessages}`;
      } else {
        errorMsg = err.response.data?.message || t('dashboard.operation_failed');
      }
      setError(errorMsg);
      showError(errorMsg);
    } else if (err.request) {
      const errorMsg = t('dashboard.network_error');
      setError(errorMsg);
      showError(errorMsg);
    } else {
      const errorMsg = err.message || t('dashboard.operation_failed');
      setError(errorMsg);
      showError(errorMsg);
    }
  } finally {
    setSubmitting(false);
  }
};

  if (loading) {
    return (
      <div className="modern-page-container">
        <LoadingSubmit />
      </div>
    );
  }

  if (error && error.includes(t('dashboard.edit_product.not_found_keyword'))) {
    return (
      <div className="modern-page-container">
        <div className="error-container">
          <h2>{t('dashboard.edit_product.product_not_found')}</h2>
          <p>{t('dashboard.edit_product.product_not_found_message')}</p>
          <button 
            onClick={() => navigate("/dashboard/products")} 
            className="modern-button primary"
          >
            {t('dashboard.edit_product.back_to_products')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-page-container">
      <div className="modern-header">
        <button
          onClick={() => navigate("/dashboard/products")}
          className="back-button"
        >
          <FiArrowLeft size={20} />
        </button>
        <h1>{t('edit_product.title', { title: product.title || t('edit_product.unnamed_product') })}</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="modern-form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-section">
              <label className="modern-label">{t('edit_product.name_label')} *</label>
              <input
                type="text"
                name="title"
                value={product.title}
                onChange={handleChange}
                className="modern-input"
                required
                placeholder={t('edit_product.name_placeholder')}
              />
            </div>

            <div className="form-section">
              <label className="modern-label">{t('edit_product.price_label')} *</label>
              <input
                type="number"
                name="price"
                value={product.price}
                onChange={handleChange}
                className="modern-input"
                required
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>

            <div className="form-section">
              <label className="modern-label">{t('edit_product.stock_label')} *</label>
              <input
                type="number"
                name="stock"
                value={product.stock}
                onChange={handleChange}
                className="modern-input"
                required
                min="0"
                placeholder="0"
              />
            </div>

            <div className="form-section">
              <label className="modern-label">{t('edit_product.discount_label')}</label>
              <input
                type="number"
                name="discount"
                value={product.discount}
                onChange={handleChange}
                className="modern-input"
                min="0"
                max="100"
                placeholder="0"
              />
            </div>

            <div className="form-section">
              <label className="modern-label">{t('edit_product.status_label')}</label>
              <select
                name="status"
                value={product.status}
                onChange={handleChange}
                className="modern-input"
              >
                <option value="published">{t('edit_product.status_published')}</option>
                <option value="draft">{t('edit_product.status_draft')}</option>
                <option value="archived">{t('edit_product.status_archived')}</option>
              </select>
            </div>

            <div className="form-section">
              <label className="modern-label">{t('edit_product.category_label')} *</label>
              <select
                name="category"
                value={product.category}
                onChange={handleChange}
                className="modern-input"
                required
              >
                <option value="">{t('edit_product.select_category')}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-section full-width">
              <label className="modern-label">{t('edit_product.short_description_label')}</label>
              <textarea
                name="About"
                value={product.About}
                onChange={handleChange}
                className="modern-input"
                rows="3"
                placeholder={t('edit_product.short_description_placeholder')}
              />
            </div>

            <div className="form-section full-width">
              <label className="modern-label">{t('edit_product.full_description_label')}</label>
              <textarea
                name="description"
                value={product.description}
                onChange={handleChange}
                className="modern-input"
                rows="5"
                placeholder={t('edit_product.full_description_placeholder')}
              />
            </div>

            <div className="form-section full-width">
              <label className="modern-label">{t('edit_product.current_images_label')}</label>
              <div className="enhanced-image-display">
                {product.images && product.images.length > 0 ? (
                  <div className="main-images-container">
                    {product.images[0] && (
                      <div className="main-image">
                        <img 
                          src={product.images[0].image} 
                          alt={t('edit_product.main_image_alt')} 
                          onError={(e) => {
                            e.target.src = '/placeholder-image.jpg';
                            e.target.alt = t('edit_product.image_unavailable');
                          }}
                        />
                        <button
                          type="button"
                          className="remove-button"
                          onClick={() => handleRemoveOldImage(0)}
                        >
                          ×
                        </button>
                      </div>
                    )}

                    {product.images.length > 1 && (
                      <div className="secondary-images">
                        {product.images[1] && (
                          <div className="secondary-image">
                            <img
                              src={product.images[1].image}
                              alt={t('edit_product.secondary_image_alt')}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <button
                              type="button"
                              className="remove-button"
                              onClick={() => handleRemoveOldImage(1)}
                            >
                              ×
                            </button>
                          </div>
                        )}

                        {product.images.length > 2 && (
                          <div
                            className="more-images"
                            onClick={() => setShowGallery(true)}
                          >
                            <img
                              src={product.images[2].image}
                              alt={t('edit_product.additional_images_alt')}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <div className="more-overlay">
                              +{product.images.length - 2}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-images">{t('edit_product.no_images_available')}</div>
                )}
              </div>
            </div>

            <div className="form-section full-width">
              <label className="modern-label">{t('edit_product.add_new_images_label')}</label>
              <label className="upload-button">
                <FiUpload className="upload-icon" />
                <span>{t('edit_product.choose_files')}</span>
                <input
                  type="file"
                  multiple
                  onChange={handleImageChange}
                  className="hidden-input"
                  accept="image/*"
                />
              </label>
              {selectedImages.length > 0 && (
                <div className="new-images-preview">
                  {selectedImages.map((img, index) => (
                    <div key={index} className="new-image-thumbnail">
                      <img
                        src={URL.createObjectURL(img)}
                        alt={t('edit_product.new_image_alt', { index: index + 1 })}
                      />
                      <button
                        type="button"
                        className="remove-button"
                        onClick={() => handleRemoveSelectedImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={submitting}
              className="modern-button primary"
            >
              {submitting ? (
                <>
                  <FiCheck className="button-icon" />
                  {t('edit_product.saving')}
                </>
              ) : (
                <>
                  <FiCheck className="button-icon" />
                  {t('edit_product.save_changes')}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard/products")}
              className="modern-button secondary"
            >
              {t('edit_product.cancel')}
            </button>
          </div>
        </form>

        {showGallery && (
          <div
            className="gallery-overlay"
            onClick={() => setShowGallery(false)}
          >
            <div className="gallery-container">
              {product.images.map((img, index) => (
                <img 
                  key={index} 
                  src={img.image} 
                  alt={t('edit_product.gallery_image_alt', { index: index + 1 })}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}