import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Axios } from "../../../API/axios";
import { PRODUCT, CATEGORIES } from "../../../API/API";
import LoadingSubmit from "../../../Components/Loading/Loading";
import styles from "./Css-files/ModernProductForm.module.css";
import { FiArrowLeft, FiCheck } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useAlert } from "../../../Context/AlertContext";
import { useAdminData } from "../../../Context/AdminDataContext"; // ⬅️ أضيف هذا الاستيراد

const AddProduct = () => {
  const [formData, setFormData] = useState({
    title: "",
    About: "",
    description: "",
    price: "",
    category: "",
    discount: 0,
    stock: "",
  });

  const dummyForm = {
    title: "dummy",
    About: "dummy",
    description: "dummy",
    price: "333",
    category: "1",
    discount: 0,
    stock: "34",
  };

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [imageDetails, setImageDetails] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { t } = useTranslation();
  const titleInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const idRef = useRef(null);
  const sentRef = useRef(false);
  const uploadedImageIdsRef = useRef([]);
  const uploadProgressRef = useRef([]);
  const [, setDummy] = useState(0);
  const forceRender = () => setDummy((prev) => prev + 1);
  
  const { showError, showSuccess } = useAlert();
  const { clearCache } = useAdminData(); // ⬅️ أضيف هذا

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await Axios.get(`/${CATEGORIES}`);
        setCategories(response.data.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading categories:", err);
        const errorMsg = t('add_product.categories_error');
        setError(errorMsg);
        showError(errorMsg);
        setIsLoading(false);
      }
    };

    fetchCategories();
    titleInputRef.current?.focus();
  }, [t, showError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "discount" ? Number(value) : value,
    }));
    if (error) setError("");

    if (!sentRef.current) {
      handleSubmitForm();
      sentRef.current = true;
    }
  };

  const uploadSingleImage = async (file, index) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("product_id", idRef.current);

    return await Axios.post("product-images", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        let percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );

        if (percentCompleted - (uploadProgressRef.current[index] || 0) < 5) {
          percentCompleted = (uploadProgressRef.current[index] || 0) + 5;
          if (percentCompleted > 100) percentCompleted = 100;
        }

        uploadProgressRef.current[index] = percentCompleted;
        forceRender();
      },
    });
  };

  const getProgressTextColor = (percent) => {
    if (percent < 50) return "#5f72ff";
    if (percent < 80) return "#ffb347";
    return "#4caf50";
  };

  const uploadImagesRequest = async (files) => {
    const results = [];
    const startIndex = uploadProgressRef.current.length;

    uploadProgressRef.current = [
      ...uploadProgressRef.current,
      ...new Array(files.length).fill(0),
    ];

    for (let i = 0; i < files.length; i++) {
      const index = startIndex + i;
      try {
        const result = await uploadSingleImage(files[i], index);
        results.push(result.data);
        uploadedImageIdsRef.current.push(result.data.id);
      } catch (error) {
        console.error("Upload failed for", files[i].name, error);
      }
    }

    console.log("All images uploaded:", results);
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      const errorMsg = t('add_product.image_type_error');
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    if (files.length + images.length > 5) {
      const errorMsg = t('add_product.max_images_error');
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    setImages((prev) => [...prev, ...files]);
    createPreviews(files);

    try {
      await uploadImagesRequest(files);
    } catch (err) {
      console.error("Image upload failed.");
    }
  };

  const createPreviews = (files) => {
    const fileReaders = files.map((file) => {
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = () =>
          resolve({
            url: reader.result,
            name: file.name,
            size: file.size,
          });
        reader.readAsDataURL(file);
      });
    });

    Promise.all(fileReaders).then((previewData) => {
      setPreviews((prev) => [...prev, ...previewData.map((item) => item.url)]);
      setImageDetails((prev) => [
        ...prev,
        ...previewData.map((item) => ({
          name: item.name,
          size: formatFileSize(item.size),
        })),
      ]);
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const removeImage = async (index) => {
    const newImages = [...images];
    const newPreviews = [...previews];
    const newDetails = [...imageDetails];

    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    newDetails.splice(index, 1);

    setImages(newImages);
    setPreviews(newPreviews);
    setImageDetails(newDetails);

    uploadProgressRef.current.splice(index, 1);

    const imageIdToDelete = uploadedImageIdsRef.current[index];
    if (imageIdToDelete) {
      try {
        await Axios.delete(`product-images/${imageIdToDelete}`);
        console.log(`Deleted image with id: ${imageIdToDelete}`);
      } catch (err) {
        console.error("Failed to delete image from server", err);
      }
      uploadedImageIdsRef.current.splice(index, 1);
    }

    if (newImages.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const calculateDiscountedPrice = () => {
    if (!formData.price) return "0.00";
    const price = parseFloat(formData.price);
    const discount = formData.discount || 0;
    return (price * (1 - discount / 100)).toFixed(2);
  };

  const handleSubmitForm = async () => {
    try {
      const res = await Axios.post(`${PRODUCT}`, dummyForm);
      idRef.current = res.data.id;
      console.log("Dummy product added, id:", idRef.current);
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.About ||
      !formData.description ||
      !formData.price ||
      !formData.category
    ) {
      const errorMsg = t('add_product.required_fields');
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const fd = new FormData();
      Object.keys(formData).forEach((key) => {
        fd.append(key, formData[key]);
      });

      images.forEach((img) => {
        fd.append("images[]", img);
      });

      await Axios.post(`${PRODUCT}/${idRef.current}?_method=PUT`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // ⬇️ أضيف هذا السطر ⬇️
      clearCache('products'); // تحديث الكاش للمنتجات
      
      showSuccess(t('add_product.success_message'));
      setSuccess(t('add_product.success_message'));
      
      setTimeout(() => navigate("/dashboard/products"), 1500);
    } catch (error) {
      console.error("Error:", error);
      let errorMessage = t('add_product.generic_error');
      if (error.response) {
        const serverError =
          error.response.data?.errors || error.response.data?.message;
        if (serverError) {
          errorMessage =
            typeof serverError === "object"
              ? Object.values(serverError).join("\n")
              : serverError;
        }
      } else if (error.request) {
        errorMessage = t('add_product.connection_error');
      }
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles["modern-loading-container"]}>
        <LoadingSubmit />
      </div>
    );
  }

  return (
    <div className={styles["modern-page-container"]}>
      <div className={styles["modern-header"]}>
        <button
          className={styles["back-button"]}
          onClick={() => navigate("/dashboard/products")}
        >
          <FiArrowLeft size={20} />
        </button>
        <h1>{t('add_product.title')}</h1>
      </div>

      {error && !isSubmitting && (
        <div className={styles["error-message"]}>
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      {success && !isSubmitting && (
        <div className={styles["success-message"]}>
          <i className="fas fa-check-circle"></i> {success}
        </div>
      )}

      <div className={styles["modern-form-container"]}>
        {isSubmitting && (
          <div className={styles["form-overlay"]}>
            <LoadingSubmit />
          </div>
        )}

        <form onSubmit={handleEdit} className={styles["modern-form"]}>
          <div className={styles["form-grid"]}>
            <div className={styles["form-section"]}>
              <h3 className={styles["section-title"]}>
                <i className="fas fa-info-circle"></i> {t('add_product.product_info')}
              </h3>

              <div className={styles["form-group"]}>
                <label className={styles["modern-label"]}>
                  {t('add_product.category_label')} <span className={styles["required"]}>*</span>
                </label>
                <select
                  className={styles["modern-input"]}
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">{t('add_product.select_category')}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles["form-group"]}>
                <label className={styles["modern-label"]}>
                  {t('add_product.name_label')} <span className={styles["required"]}>*</span>
                </label>
                <input
                  type="text"
                  className={styles["modern-input"]}
                  name="title"
                  placeholder={t('add_product.name_placeholder')}
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  disabled={!sentRef.current}
                  ref={titleInputRef}
                />
              </div>

              <div className={styles["form-group"]}>
                <label className={styles["modern-label"]}>
                  {t('add_product.short_description_label')} <span className={styles["required"]}>*</span>
                </label>
                <textarea
                  className={styles["modern-input"]}
                  name="About"
                  rows="3"
                  placeholder={t('add_product.short_description_placeholder')}
                  value={formData.About}
                  onChange={handleInputChange}
                  required
                  disabled={!sentRef.current}
                ></textarea>
              </div>

              <div className={styles["form-group"]}>
                <label className={styles["modern-label"]}>
                  {t('add_product.detailed_description_label')}{" "}
                  <span className={styles["required"]}>*</span>
                </label>
                <textarea
                  className={styles["modern-input"]}
                  name="description"
                  rows="5"
                  placeholder={t('add_product.detailed_description_placeholder')}
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  disabled={!sentRef.current}
                ></textarea>
              </div>
            </div>

            <div className={styles["form-section"]}>
              <h3 className={styles["section-title"]}>
                <i className="fas fa-tags"></i> {t('add_product.pricing_media')}
              </h3>

              <div className={styles["form-group"]}>
                <label className={styles["modern-label"]}>
                  {t('add_product.price_label')} <span className={styles["required"]}>*</span>
                </label>
                <div className={styles["input-with-icon"]}>
                  <span className={styles["input-icon"]}>$</span>
                  <input
                    type="number"
                    className={styles["modern-input"]}
                    name="price"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    disabled={!sentRef.current}
                  />
                </div>
              </div>

              <div className={styles["form-group"]}>
                <label className={styles["modern-label"]}>{t('add_product.discount_label')}</label>
                <div
                  className={`${styles["input-with-icon"]} ${styles["right-icon"]}`}
                >
                  <input
                    type="number"
                    className={styles["modern-input"]}
                    name="discount"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={formData.discount}
                    onChange={handleInputChange}
                    disabled={!sentRef.current}
                  />
                  <span className={styles["input-icon"]}>%</span>
                </div>
              </div>

              <div className={styles["form-group"]}>
                <label className={styles["modern-label"]}>{t('add_product.final_price_label')}</label>
                <div className={styles["price-display"]}>
                  ${calculateDiscountedPrice()}
                </div>
              </div>
              <div className={styles["form-group"]}>
                <label className={styles["modern-label"]}>
                  {t('add_product.stock_label')} <span className={styles["required"]}>*</span>
                </label>
                <input
                  type="number"
                  className={styles["modern-input"]}
                  name="stock"
                  min="0"
                  placeholder={t('add_product.stock_placeholder')}
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  disabled={!sentRef.current}
                />
              </div>

              <div className={styles["form-group"]}>
                <label className={styles["modern-label"]}>
                  {t('add_product.images_label')} <span className={styles["required"]}>*</span>
                </label>

                <input
                  type="file"
                  className={styles["hidden-input"]}
                  accept="image/*"
                  onChange={handleImageChange}
                  multiple
                  ref={fileInputRef}
                  disabled={!sentRef.current}
                />

                <div
                  className={`${styles["upload-area"]} ${
                    !sentRef.current ? styles["disabled"] : ""
                  }`}
                  onClick={() =>
                    sentRef.current && fileInputRef.current.click()
                  }
                >
                  <div className={styles["upload-icon"]}>
                    <i className="fas fa-cloud-upload-alt"></i>
                  </div>
                  <p>{t('add_product.upload_text')}</p>
                  <p className={styles["upload-hint"]}>
                    {t('add_product.upload_hint')}
                  </p>
                </div>

                <div className={styles["image-previews"]}>
                  {previews.map((preview, index) => (
                    <div className={styles["image-preview-item"]} key={index}>
                      <div className={styles["image-container"]}>
                        <img src={preview} alt={`preview-${index}`} />
                        <button
                          className={styles["remove-image-button"]}
                          onClick={() => removeImage(index)}
                        >
                          ×
                        </button>
                      </div>
                      <div className={styles["image-details"]}>
                        <div className={styles["image-name"]}>
                          {imageDetails[index]?.name}
                        </div>
                        <div className={styles["image-size"]}>
                          {imageDetails[index]?.size}
                        </div>
                        <div className={styles["upload-progress-container"]}>
                          <div
                            className={styles["upload-progress-bar"]}
                            style={{
                              width: `${
                                uploadProgressRef.current[index] || 0
                              }%`,
                              backgroundColor: getProgressTextColor(
                                uploadProgressRef.current[index] || 0
                              ),
                            }}
                          ></div>
                        </div>
                        <div
                          className={styles["progress-percent"]}
                          style={{
                            color: getProgressTextColor(
                              uploadProgressRef.current[index] || 0
                            ),
                          }}
                        >
                          {uploadProgressRef.current[index] || 0}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {previews.length === 0 && (
                  <div className={styles["no-images-message"]}>
                    {t('add_product.no_images')}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles["form-actions"]}>
            <button
              type="button"
              className={`${styles["modern-button"]} ${styles["secondary"]}`}
              onClick={() => navigate("/dashboard/products")}
            >
              <i className="fas fa-times"></i> {t('add_product.cancel_button')}
            </button>
            <button
              type="submit"
              className={`${styles["modern-button"]} ${styles["primary"]}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <LoadingSubmit small />
              ) : (
                <>
                  <FiCheck /> {t('add_product.save_button')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;