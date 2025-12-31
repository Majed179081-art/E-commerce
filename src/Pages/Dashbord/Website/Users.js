import React, { useEffect, useState, useCallback, useRef } from "react";
import { Axios } from "../../../API/axios";
import { USERS, USER, DASHBOARD_PREFIX } from "../../../API/API";
import CustomTable from "../../../Components/Website/Table";
import { format, parseISO } from "date-fns";
import { useTranslation } from "react-i18next";
import { useDashboardData } from "../../../Hooks/UseDashboardData";
import { useAlert } from "../../../Context/AlertContext";
import { useAdminData } from "../../../Context/AdminDataContext"; // ⬅️ أضيف هذا الاستيراد

export default function Users() {
  const { t } = useTranslation();
  const { getData, refreshData } = useDashboardData();
  const { showDeleteConfirm, showError, showSuccess, showInfo } = useAlert();
  const { clearCache } = useAdminData(); // ⬅️ أضيف هذا

  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [deleteTrigger, setDeleteTrigger] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [createdDateFilter, setCreatedDateFilter] = useState("");

  const debounceRef = useRef(null);

  const roleLabels = {
    "1995": t('users.role_admin'),
    "2001": t('users.role_user'),
    "1996": t('users.role_writer'),
    "1999": t('users.role_product_manager'),
  };

  const formatDate = (dateString, showTime = true) => {
    if (!dateString) return t('users.date_not_available');
    try {
      const date = parseISO(dateString);
      return showTime
        ? format(date, "dd/MM/yyyy - HH:mm")
        : format(date, "dd/MM/yyyy");
    } catch {
      return t('users.invalid_date');
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
      header: t('users.name_header'),
      content: (item) => (
        <>
          {item.name}
          {item.id === currentUser?.id && (
            <span style={{ marginLeft: "8px", color: "#28a745", fontWeight: "bold" }}>
              ({t('users.current_user_indicator')})
            </span>
          )}
        </>
      ),
    },
    {
      header: t('users.email_header'),
      content: (item) => item.email,
    },
    {
      header: t('users.role_header'),
      width: "120px",
      content: (item) => roleLabels[item.role] || t('users.role_unknown'),
      alignHeader: "center",
      alignContent: "center",
    },
    {
      header: t('users.created_at_header'),
      width: "200px",
      content: (item) => formatDate(item.created_at, true),
      alignHeader: "center",
      alignContent: "center",
    },
    {
      header: t('users.updated_at_header'),
      width: "200px",
      content: (item) =>
        `${formatDate(item.updated_at, true)} ${
          item.created_at !== item.updated_at ? t('users.modified_indicator') : ""
        }`,
      alignHeader: "center",
      alignContent: "center",
    },
  ];

  const fetchUsers = useCallback(async (page, limit, searchTerm = "", dateFilter = "") => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit };
      if (searchTerm?.trim()) params.term = searchTerm.trim();
      if (dateFilter?.trim()) params.date = dateFilter.trim();

      const usersResponse = await getData('users', params);

      if (usersResponse && usersResponse.data) {
        setData(usersResponse.data);
        setPagination({
          currentPage: usersResponse.current_page || 1,
          itemsPerPage: usersResponse.per_page || limit,
          totalItems: usersResponse.total || 0,
          totalPages: usersResponse.last_page || 1,
        });
      } else {
        throw new Error('Invalid response structure');
      }
    } catch {
      const errorMsg = t('users.load_failed');
      setError(errorMsg);
      showError(errorMsg);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [t, getData, showError]);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await Axios.get(`/${USER}`);
      setCurrentUser(res.data);
    } catch {
      showError(t('users.current_user_error'));
    }
  }, [t, showError]);

  useEffect(() => {
    fetchCurrentUser();

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const { currentPage, itemsPerPage } = pagination;
      fetchUsers(currentPage, itemsPerPage, searchTerm, createdDateFilter);
    }, 500);

    return () => clearTimeout(debounceRef.current);
  }, [
    searchTerm,
    createdDateFilter,
    pagination.currentPage,
    pagination.itemsPerPage,
    deleteTrigger,
    fetchUsers,
    fetchCurrentUser,
  ]);

  const handleDateFilterChange = (date) => {
    setCreatedDateFilter(date);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleDelete = (id) => {
    if (id === currentUser?.id) {
      return showInfo({
        title: t('users.self_delete_denied_title'),
        message: t('users.self_delete_denied_message'),
        onConfirm: null,
      });
    }

    showDeleteConfirm({
      title: t('users.delete_confirmation_title'),
      message: t('users.delete_confirmation_message'),
      onConfirm: async () => {
        setLoading(true);
        try {
          await Axios.delete(`${DASHBOARD_PREFIX}/${USERS}/${id}`);
          
          // ⬇️ أضيف هذا السطر ⬇️
          clearCache('users'); // تحديث الكاش للمستخدمين
          
          refreshData('users');

          const newPage =
            data.length === 1 && pagination.currentPage > 1
              ? pagination.currentPage - 1
              : pagination.currentPage;

          fetchUsers(newPage, pagination.itemsPerPage, searchTerm, createdDateFilter);

          showSuccess(t('users.delete_success'));
        } catch {
          const errorMsg = t('users.delete_failed');
          setError(errorMsg);
          showError(errorMsg);
        } finally {
          setLoading(false);
        }
      },
      onCancel: () => {},
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 className="fw-bold mb-3">{t('users.page_title')}</h2>
      {error && (
        <div className="alert alert-danger text-center fw-bold" style={{ fontSize: "14px" }}>
          {error}
        </div>
      )}
      <CustomTable
        data={data}
        columns={columns}
        loading={loading}
        noDataText={t('users.no_users_found')}
        onDelete={handleDelete}
        addButtonPath="/dashboard/user/add"
        addButtonText={t('users.add_user_button')}
        editBasePath="/dashboard/users"
        rowKey="id"
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          itemsPerPage: pagination.itemsPerPage,
          totalItems: pagination.totalItems,
          onPageChange: (selectedZeroBased) => {
            setPagination((prev) => ({ ...prev, currentPage: selectedZeroBased + 1 }));
          },
          onItemsPerPageChange: (newSize) => {
            setPagination((prev) => ({ ...prev, itemsPerPage: newSize, currentPage: 1 }));
          },
        }}
        searchTerm={searchTerm}
        onSearchChange={(term) => {
          setSearchTerm(term);
          setPagination((prev) => ({ ...prev, currentPage: 1 }));
        }}
        createdDateFilter={createdDateFilter}
        onCreatedDateFilterChange={handleDateFilterChange}
      />
    </div>
  );
}