import React, { useEffect, useState, useCallback, useRef } from "react";
import { Axios } from "../../../API/axios";
import { CATEGORIES, CATEGORY } from "../../../API/API";
import CustomTable from "../../../Components/Website/Table";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { useDashboardData } from "../../../Hooks/UseDashboardData";
import { useAlert } from "../../../Context/AlertContext";
import { useAdminData } from "../../../Context/AdminDataContext"; // ⬅️ أضيف هذا الاستيراد

export default function Categories() {
  const { t } = useTranslation();
  const { getData, refreshData } = useDashboardData();
  
  const { showDeleteConfirm, showSuccess, showError } = useAlert();
  const { clearCache } = useAdminData(); // ⬅️ أضيف هذا
  
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("updated_at");
  const [order, setOrder] = useState("desc");
  const [createdDate, setCreatedDate] = useState("");

  const debounceRef = useRef(null);

  const formatDate = (dateString, showTime = true) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return showTime
        ? format(date, "dd/MM/yyyy HH:mm")
        : format(date, "dd/MM/yyyy");
    } catch {
      return "Invalid Date";
    }
  };

  const columns = [
    {
      header: "#",
      width: "60px",
      content: (_, index) =>
        (pagination.currentPage - 1) * pagination.itemsPerPage + index + 1,
    },
    {
      header: t('categories.title'),
      content: (item) => item.title,
      sortable: true,
      sortKey: "title",
    },
    {
      header: t('categories.image'),
      alignHeader: "center",
      alignContent: "center",
      content: (item) => (
        <img
          src={item.image}
          alt={item.title}
          style={{
            width: "50px",
            height: "50px",
            objectFit: "cover",
            borderRadius: "4px",
          }}
        />
      ),
    },
    {
      header: t('categories.created_at'),
      content: (item) => formatDate(item.created_at, false),
      alignHeader: "center",
      alignContent: "center",
      sortable: true,
      sortKey: "created_at",
    },
    {
      header: t('categories.updated_at'),
      content: (item) =>
        `${formatDate(item.updated_at, true)} ${
          item.created_at !== item.updated_at ? t('categories.modified') : ""
        }`,
      alignHeader: "center",
      alignContent: "center",
      sortable: true,
      sortKey: "updated_at",
    },
  ];

  const fetchData = useCallback(
    async (
      page,
      limit,
      term = "",
      sort = "updated_at",
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
        if (createdDate !== "") {
          params.date = createdDate;
        }

        const categoriesData = await getData('categories', params);
        
        if (categoriesData && categoriesData.data) {
          setData(categoriesData.data);
          setPagination({
            currentPage: categoriesData.current_page || 1,
            itemsPerPage: categoriesData.per_page || limit,
            totalItems: categoriesData.total || 0,
            totalPages: categoriesData.last_page || 1,
          });
        } else if (Array.isArray(categoriesData)) {
          setData(categoriesData);
          setPagination({
            currentPage: 1,
            itemsPerPage: limit,
            totalItems: categoriesData.length,
            totalPages: Math.ceil(categoriesData.length / limit),
          });
        } else {
          throw new Error('Invalid categories response structure');
        }
      } catch (error) {
        console.error('Fetch categories error:', error);
        const errorMsg = error.response?.data?.message || t('categories.load_error');
        setError(errorMsg);
        showError(errorMsg);
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [t, getData, showError]
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
        createdDate
      );
    }, 200);

    return () => clearTimeout(debounceRef.current);
  }, [
    searchTerm,
    pagination.currentPage,
    pagination.itemsPerPage,
    sortBy,
    order,
    createdDate,
    fetchData,
  ]);

  const handleDelete = (id) => {
    showDeleteConfirm({
      title: t('categories.delete_title'),
      message: t('categories.delete_message'),
      onConfirm: async () => {
        setLoading(true);
        try {
          await Axios.delete(`${CATEGORIES}/${id}`);
          
          // ⬇️ أضيف هذا السطر ⬇️
          clearCache('categories'); // تحديث الكاش للفئات
          
          refreshData('categories');
          
          fetchData(
            pagination.currentPage,
            pagination.itemsPerPage,
            searchTerm,
            sortBy,
            order,
            createdDate
          );
          
          showSuccess(t('categories.delete_success'));
        } catch (error) {
          const errorMsg = error.response?.data?.message || t('categories.delete_error');
          setError(errorMsg);
          showError(errorMsg);
        } finally {
          setLoading(false);
        }
      },
      onCancel: () => {
        console.log("Delete cancelled by user");
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
    <div style={{ padding: "20px" }}>
      <h2 className="fw-bold mb-3">{t('categories.page_title')}</h2>

      {error && (
        <div
          className="alert alert-danger text-center fw-bold"
          style={{ fontSize: "14px" }}
        >
          {error}
        </div>
      )}

      <CustomTable
        data={data}
        columns={columns}
        loading={loading}
        noDataText={t('categories.no_data')}
        onDelete={handleDelete}
        addButtonPath="/dashboard/category/add"
        addButtonText={t('categories.add_button')}
        editBasePath="/dashboard/categories"
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
        createdDateFilter={createdDate}
        onCreatedDateFilterChange={(val) => {
          setCreatedDate(val);
          setPagination((prev) => ({ ...prev, currentPage: 1 }));
        }}
      />
    </div>
  );
}