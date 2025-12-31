//src/Pages/Dashbord/Website/Products.js

import React, { useEffect, useState, useCallback, useRef } from "react";
import CustomTable from "../../../Components/Website/Table";
import { format, parseISO } from "date-fns";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { useTranslation } from "react-i18next";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAlert } from "../../../Context/AlertContext";
import { useDashboardData } from "../../../Hooks/UseDashboardData"; // 👈 إضافة هذا الاستيراد
import { useAdminData } from "../../../Context/AdminDataContext"; // ⬅️ أضيف هذا الاستيراد
export default function Products() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 1,
  });
   const { clearCache } = useAdminData(); // ⬅️ أضيف هذا
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [createdDateFilter, setCreatedDateFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState("desc");
  const debounceRef = useRef(null);
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // استخدام context الألرت - خارج useCallback
  const { showError, showSuccess, showDeleteConfirm } = useAlert();
  
  // 👈 استخدام نظام الطلب المركزي
  const { getData, refreshData } = useDashboardData();

  // تحقق من وجود فلتر المخزون المنخفض في URL
  const lowStockFilter = searchParams.get('filter') === 'low-stock';

  const openLightbox = (images, index) => {
    if (!images || !Array.isArray(images)) return;
    const slides = images.map((img) => ({
      src: img.image,
      alt: img.alt || t('products.image_alt'),
    }));
    setLightboxImages(slides);
    setCurrentIndex(Math.min(index, slides.length - 1));
    setLightboxOpen(true);
  };

  const renderProductImages = (item) => {
    const images = item.images || [];

    if (images.length === 0) {
      return (
        <div
          className="no-image-placeholder"
          style={{
            width: "40px",
            height: "40px",
            backgroundColor: "#f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "4px",
            fontSize: "12px",
            color: "#999",
            cursor: "pointer",
          }}
          onClick={() => openLightbox(images, 0)}
        >
          {t('products.no_image')}
        </div>
      );
    }

    const maxVisible = 2;
    const extraCount = images.length - maxVisible;

    return (
      <div style={{ display: "flex", gap: "5px" }}>
        {images.slice(0, maxVisible).map((img, index) => (
          <img
            key={index}
            src={img.image}
            alt={img.alt || t('products.image_alt_number', { number: index + 1 })}
            style={{
              width: "40px",
              height: "40px",
              objectFit: "cover",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={() => openLightbox(images, index)}
            onError={(e) => (e.target.style.display = "none")}
          />
        ))}

        {extraCount > 0 && (
          <div
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "#f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            onClick={() => openLightbox(images, 0)}
          >
            +{extraCount}
          </div>
        )}
      </div>
    );
  };

  const renderPriceInfo = (item) => {
    const originalPrice =
      typeof item.price === "number"
        ? item.price
        : parseFloat(item.price) || 0;

    const discount =
      typeof item.discount === "number"
        ? item.discount
        : parseFloat(item.discount) || 0;

    const finalPrice = originalPrice - originalPrice * (discount / 100);

    return (
      <div style={{ lineHeight: "1.4", textAlign: "center" }}>
        {discount > 0 ? (
          <>
            <div
              style={{
                textDecoration: "line-through",
                color: "#999",
                fontSize: "12px",
              }}
            >
              ${originalPrice.toFixed(2)}
            </div>
            <div style={{ color: "#e53935", fontWeight: "bold" }}>
              ${finalPrice.toFixed(2)}
            </div>
            <div style={{ color: "#388e3c", fontSize: "12px" }}>
              {discount}% {t('products.off')}
            </div>
          </>
        ) : (
          <div style={{ fontWeight: "bold" }}>
            ${originalPrice.toFixed(2)}
          </div>
        )}
      </div>
    );
  };

  // ✅ بناء الـ columns بنفس نمط الفئات
  const columns = [
    {
      header: "#",
      width: "80px",
      content: (_, index) =>
        (pagination.currentPage - 1) * pagination.itemsPerPage + index + 1,
    },
    {
      header: t('products.images'),
      accessor: "images",
      alignHeader: "center",
      alignContent: "center",
      content: (item) => renderProductImages(item),
      width:'170px'
    },
    {
        alignHeader: "center",
      header: t('products.title'),
      accessor: "title",
      sortable: true,
    alignContent: "center",
      sortKey: "title",
      content: (item) => (
        <span style={{ fontWeight: "500", whiteSpace: "nowrap" }}>
          {item.title}
        </span>
      ),
    },

    {
      header: t('products.price'),
      accessor: "price",
      sortable: true,
      alignHeader: "center",
      alignContent: "center",
    
      content: (item) => renderPriceInfo(item),
    },
    {
      header: t('products.created_at'),
      accessor: "created_at",
      width:'150px',
      sortable: true,
      sortKey: "created_at",
      content: (item) => {
        try {
          const date = parseISO(item.created_at);
          return <span>{format(date, "dd/MM/yyyy")}</span>;
        } catch {
          return <span className="text-danger">{t('products.invalid_date')}</span>;
        }
      },
    },
    {
      header: t('products.updated_at'),
      accessor: "updated_at",
      width:'150px',
      sortable: true,
      sortKey: "updated_at",
      content: (item) => {
        try {
          const date = parseISO(item.updated_at);
          return <span>{format(date, "dd/MM/yyyy")}</span>;
        } catch {
          return <span className="text-danger">{t('products.invalid_date')}</span>;
        }
      },
    },
  ];

  const fetchData = useCallback(
    async (
      page,
      limit,
      term = "",
      sort = "created_at",
      order = "desc",
      createdDate = ""
    ) => {
      setLoading(true);
      setError("");

      try {
        const params = {
          page,
          limit,
          sort_by: sort,
          sort_order: order,
        };

        if (term.trim() !== "") {
          params.title = term;
        }
        if (createdDate) {
          params.date = createdDate;
        }

        // 👈 استخدام نظام الطلب المركزي بدلاً من Axios المباشر
        const response = await getData('products', params);
   

        let productsWithImages = response.data || [];
        
        // تطبيق فلتر المخزون المنخفض إذا كان مفعل
        if (lowStockFilter) {
          productsWithImages = productsWithImages.filter(product => {
            const stock = Number(product.stock) || 0;
            return stock < 10;
          });
        }

        setData(productsWithImages);
        setPagination({
          currentPage: response.current_page || 1,
          itemsPerPage: response.per_page || limit,
          totalItems: lowStockFilter ? productsWithImages.length : response.total || 0,
          totalPages: lowStockFilter 
            ? Math.ceil(productsWithImages.length / (response.per_page || limit))
            : response.last_page || 1,
        });
      } catch (error) {
        const errorMessage = t('products.load_error');
        setError(errorMessage);
        showError(errorMessage); // عرض الألرت المركزي
        console.error("API Error from centralized system:", error);
        setData([]);
        setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 1 }));
      } finally {
        setLoading(false);
      }
    },
    [t, lowStockFilter, getData, showError]
  );

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchData(
        pagination.currentPage,
        pagination.itemsPerPage,
        searchTerm,
        sortBy,
        order,
        createdDateFilter
      );
    }, 500);

    return () => clearTimeout(debounceRef.current);
  }, [
    searchTerm,
    pagination.currentPage,
    pagination.itemsPerPage,
    sortBy,
    order,
    createdDateFilter,
    fetchData,
  ]);


  const handleDelete = (id) => {
    showDeleteConfirm({
      title: t('products.delete_title'),
      message: t('products.delete_message'),
      onConfirm: async () => {
        setLoading(true);
        try {
          const { Axios } = await import("../../../API/axios");
          const { PRODUCTS } = await import("../../../API/API");
          
          await Axios.delete(`${PRODUCTS}/${id}`);

          // ⬇️ أضيف هذا السطر ⬇️
          clearCache('products'); // تحديث الكاش للمنتجات
          
          refreshData('products');
          
          const newPage =
            data.length === 1 && pagination.currentPage > 1
              ? pagination.currentPage - 1
              : pagination.currentPage;

          fetchData(
            newPage,
            pagination.itemsPerPage,
            searchTerm,
            sortBy,
            order,
            createdDateFilter
          );
          
          showSuccess(t('products.delete_success'));
        } catch (error) {
          const errorMessage = t('products.delete_error');
          setError(errorMessage);
          showError(errorMessage);
        } finally {
          setLoading(false);
        }
      },
      onCancel: () => {
        console.log("Delete cancelled");
      }
    });
  };

  const handleSortChange = (sortKey) => {
    const newOrder =
      sortBy === sortKey && order === "asc" ? "desc" : "asc";
    setSortBy(sortKey);
    setOrder(newOrder);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  return (
    <div className="products-page" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 className="fw-bold">
          {lowStockFilter ? t('products.low_stock_products') : t('products.page_title')}
        </h2>
        
        {lowStockFilter && (
          <button 
            onClick={() => navigate('/dashboard/products')}
            style={{
              padding: "8px 16px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            {t('products.show_all_products')}
          </button>
        )}
      </div>

      {lowStockFilter && (
        <div 
          style={{
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "4px",
            padding: "15px",
            marginBottom: "20px",
            color: "#856404"
          }}
        >
          <h5 style={{ marginBottom: "10px" }}>
            <i className="fas fa-exclamation-triangle" style={{ marginRight: "10px" }}></i>
            {t('products.low_stock_warning')}
          </h5>
          <p style={{ margin: 0 }}>
            {t('products.low_stock_description')}
          </p>
        </div>
      )}

      {error && (
        <div
          className="alert alert-danger text-center fw-bold"
          style={{ fontSize: "14px" }}
        >
          {error}
        </div>
      )}

      <div style={{ width: "100%" }}>
        <CustomTable
          data={data}
          columns={columns}
          loading={loading}
          noDataText={lowStockFilter ? t('products.no_low_stock_products') : t('products.no_data')}
          onDelete={handleDelete}
          addButtonPath="/dashboard/product/add"
          addButtonText={t('products.add_button')}
          editBasePath="/dashboard/products"
          rowKey="id"
          pagination={{
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            itemsPerPage: pagination.itemsPerPage,
            totalItems: pagination.totalItems,
            onPageChange: (selectedZeroBased) => {
              setPagination((prev) => ({
                ...prev,
                currentPage: selectedZeroBased + 1,
              }));
            },
            onItemsPerPageChange: (newSize) => {
              setPagination((prev) => ({
                ...prev,
                itemsPerPage: newSize,
                currentPage: 1,
              }));
            },
          }}
          searchTerm={searchTerm}
          onSearchChange={(term) => {
            setSearchTerm(term);
            setPagination((prev) => ({ ...prev, currentPage: 1 }));
          }}
          onSort={handleSortChange}
          currentSortBy={sortBy}
          currentSortOrder={order}
          createdDateFilter={createdDateFilter}
          onCreatedDateFilterChange={(val) => {
            setCreatedDateFilter(val);
            setPagination((prev) => ({ ...prev, currentPage: 1 }));
          }}
          searchPlaceholder={lowStockFilter ? t('products.search_low_stock') : t('products.search_by_title')}
        />
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxImages}
        index={currentIndex}
      />
    </div>
  );
}