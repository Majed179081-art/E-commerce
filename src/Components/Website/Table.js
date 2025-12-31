import React, { useState, useEffect } from "react";
import { Search, Trash2, Pencil, Plus, X, ChevronDown } from "lucide-react";
import { NavLink } from "react-router-dom";
import LoadingSubmit from "../Loading/Loading";
import ReactPaginate from "react-paginate";
import styles from "./Table.module.css";
import { useTranslation } from "react-i18next"; // 👈 أضف هذا

const CustomTable = ({
    data = [],
    columns,
    loading,
    noDataText,
    onDelete,
    addButtonPath,
    addButtonText,
    editBasePath,
    rowKey = "id",
    pagination: paginationProps,
    searchTerm = "",
    onSearchChange,
    onSort,
    currentSortBy,
    currentSortOrder,
    createdDateFilter = "",
    onCreatedDateFilterChange = () => {},
    searchPlaceholder = "Search by title...", // 👈 prop جديد
}) => {
    const { t } = useTranslation(); // 👈 أضف هذا
    
    const [expandedRows, setExpandedRows] = useState({});
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const isMobile = windowWidth < 768;
    const isTablet = windowWidth >= 768 && windowWidth <= 1280;

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleRowExpand = (rowId) => {
        setExpandedRows((prev) => ({
            ...prev,
            [rowId]: !prev[rowId],
        }));
    };

    const getPrimaryColumns = () => {
        const timeRelatedHeaders = [
            t('table.headers.created_at'),
            t('table.headers.updated_at'),
            t('table.headers.last_updated'),
        ];
        return columns.filter(
            (col) =>
                !timeRelatedHeaders.includes(col.header) && col.header !== t('table.headers.price')
        );
    };

    const getSecondaryColumns = () => {
        const timeRelatedHeaders = [
            t('table.headers.created_at'),
            t('table.headers.updated_at'),
            t('table.headers.last_updated'),
        ];
        return columns.filter(
            (col) => timeRelatedHeaders.includes(col.header) || col.header === t('table.headers.price')
        );
    };

    const getGridTemplateColumns = () => {
        if (isMobile) return "";
        const activeCols = isTablet ? getPrimaryColumns() : columns;
        const widths = activeCols.map(
            (col) =>
                col.width || (isTablet ? "minmax(120px, 1fr)" : "minmax(180px, 1fr)")
        );
        widths.push("120px");
        return widths.join(" ");
    };

    const pageStart =
        (paginationProps.currentPage - 1) * paginationProps.itemsPerPage + 1;
    const pageEnd = Math.min(
        pageStart + paginationProps.itemsPerPage - 1,
        paginationProps.totalItems
    );

    const renderHeaderCell = (col, i) => {
        const sortIdentifier = col.sortKey || col.accessor;
        const isSortable = col.sortable && sortIdentifier;
        const isSorted = currentSortBy === sortIdentifier;

        return (
            <div
                key={`header-${i}`}
                className={`${styles.headerCell} ${isSortable ? styles.sortableHeader : ""}`}
                style={{
                    textAlign: col.alignHeader || "left",
                    fontWeight: isSorted ? "bold" : "normal",
                }}
                onClick={() => isSortable && onSort(sortIdentifier)}
            >
                {col.header}
                {isSortable && isSorted && (
                    <span className={styles.sortArrow}>
                        {currentSortOrder === "asc" ? "↑" : "↓"}
                    </span>
                )}
            </div>
        );
    };

    return (
        <div className={styles.tableWrapper}>
            <div className={styles.tableHeader}>
                <div className={styles.searchContainer}>
                    <div className={styles.searchBox}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder={searchPlaceholder || t('table.search_by_title')}
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className={styles.searchInput}
                        />
                        {searchTerm && (
                            <button
                                className={styles.clearButton}
                                onClick={() => onSearchChange("")}
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    <div className={styles.dateFilter}>
                        <input
                            type="date"
                            value={createdDateFilter}
                            onChange={(e) => onCreatedDateFilterChange(e.target.value)}
                            className={styles.dateInput}
                        />
                        {createdDateFilter && (
                            <button
                                className={styles.clearButton}
                                onClick={() => onCreatedDateFilterChange("")}
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {addButtonPath && (
                    <NavLink to={addButtonPath} className={styles.addBtn}>
                        <Plus size={16} />
                        {addButtonText || t('table.add_new')}
                    </NavLink>
                )}
            </div>

            {loading && <LoadingSubmit />}
            {!loading && data.length === 0 && (
                <div className={styles.noData}>
                    {noDataText || t('table.no_data')}
                </div>
            )}

            {!loading && data.length > 0 && (
                <>
                    <div className={styles.tableContainer}>
                        <div
                            className={styles.tableHeaderRow}
                            style={{ gridTemplateColumns: getGridTemplateColumns() }}
                        >
                            {(isTablet ? getPrimaryColumns() : columns).map((col, i) =>
                                renderHeaderCell(col, i)
                            )}
                            <div
                                className={styles.headerCell}
                                style={{
                                    textAlign: "center",
                                    display: "flex",
                                    justifyContent: "center",
                                }}
                            >
                                {t('table.actions')}
                            </div>
                        </div>

                        <div className={styles.tableBody}>
                            {data.map((item, rowIndex) => {
                                const rowId = item[rowKey] || rowIndex;
                                const isExpanded = expandedRows[rowId];
                                const secondaryColumns = isTablet ? getSecondaryColumns() : [];

                                return (
                                    <React.Fragment key={rowId}>
                                        <div
                                            className={styles.tableRow}
                                            style={{ gridTemplateColumns: getGridTemplateColumns() }}
                                        >
                                            {(isTablet ? getPrimaryColumns() : columns).map(
                                                (col, colIndex) => (
                                                    <div
                                                        key={`cell-${rowIndex}-${colIndex}`}
                                                        className={styles.tableCell}
                                                        style={{
                                                            textAlign: col.alignContent || "left",
                                                        }}
                                                    >
                                                        {col.header === "#" && paginationProps
                                                            ? (paginationProps.currentPage - 1) *
                                                              paginationProps.itemsPerPage +
                                                              rowIndex +
                                                              1
                                                            : col.content(item, rowIndex)}
                                                    </div>
                                                )
                                            )}
                                            <div className={styles.actionsCell}>
                                                <div className={styles.actions}>
                                                    {item[rowKey] && editBasePath && (
                                                        <NavLink to={`${editBasePath}/${item[rowKey]}`}>
                                                            <button className={styles.editBtn}>
                                                                <Pencil size={16} />
                                                            </button>
                                                        </NavLink>
                                                    )}
                                                    {onDelete && (
                                                        <button
                                                            onClick={() => onDelete(item[rowKey])}
                                                            className={styles.deleteBtn}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                    {isTablet && secondaryColumns.length > 0 && (
                                                        <button
                                                            onClick={() => toggleRowExpand(rowId)}
                                                            className={styles.moreDetailsBtn}
                                                            aria-label={
                                                                isExpanded ? t('table.hide_details') : t('table.more_details')
                                                            }
                                                        >
                                                            <span className={styles.moreDetailsText}>
                                                                {isExpanded ? t('table.hide_details') : t('table.more_details')}
                                                            </span>
                                                            <ChevronDown
                                                                size={16}
                                                                className={`${styles.chevron} ${
                                                                    isExpanded ? styles.rotated : ""
                                                                }`}
                                                            />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {isTablet && isExpanded && secondaryColumns.length > 0 && (
                                            <div className={styles.detailsCard}>
                                                {secondaryColumns.map((col, i) => (
                                                    <div key={`hidden-${i}`} className={styles.detailRow}>
                                                        <div className={styles.detailLabel}>
                                                            {col.header}
                                                        </div>
                                                        <div className={styles.detailValue}>
                                                            {col.content(item, rowIndex)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>

                    {isMobile && (
                        <div className={styles.cardView}>
                            {data.map((item, rowIndex) => (
                                <div key={item[rowKey] || rowIndex} className={styles.card}>
                                    {columns.map((col, colIndex) => (
                                        <div key={colIndex} className={styles.cardRow}>
                                            <div className={styles.cardLabel}>{col.header}</div>
                                            <div className={styles.cardValue}>
                                                {col.content(item, rowIndex)}
                                            </div>
                                        </div>
                                    ))}
                                    <div className={styles.cardActions}>
                                        {item[rowKey] && editBasePath && (
                                            <NavLink to={`${editBasePath}/${item[rowKey]}`}>
                                                <button className={styles.editBtn}>
                                                    <Pencil size={16} />
                                                </button>
                                            </NavLink>
                                        )}
                                        {onDelete && (
                                            <button
                                                onClick={() => onDelete(item[rowKey])}
                                                className={styles.deleteBtn}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {paginationProps && (
                <div className={styles.paginationContainer}>
                    <div className={styles.paginationControls}>
                        <div className={styles.itemsPerPage}>
                            <label htmlFor="itemsPerPageSelect">
                                {t('table.items_per_page')}:
                            </label>
                            <select
                                id="itemsPerPageSelect"
                                className={styles.itemsPerPageSelect}
                                value={paginationProps.itemsPerPage}
                                onChange={(e) =>
                                    paginationProps.onItemsPerPageChange(Number(e.target.value))
                                }
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                        <span className={styles.paginationInfo}>
                            {t('table.showing')} {pageStart}-{pageEnd} {t('table.of')} {paginationProps.totalItems}
                        </span>
                    </div>

                    <ReactPaginate
                        previousLabel={t('table.previous')}
                        nextLabel={t('table.next')}
                        breakLabel={"..."}
                        pageCount={paginationProps.totalPages}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={3}
                        onPageChange={(data) => paginationProps.onPageChange(data.selected)}
                        forcePage={paginationProps.currentPage - 1}
                        containerClassName={styles.pagination}
                        activeClassName={styles.paginationActive}
                        pageClassName={styles.paginationItem}
                        pageLinkClassName={styles.paginationLink}
                        previousClassName={styles.paginationItem}
                        nextClassName={styles.paginationItem}
                        previousLinkClassName={styles.paginationLink}
                        nextLinkClassName={styles.paginationLink}
                        disabledClassName={styles.paginationDisabled}
                    />
                </div>
            )}
        </div>
    );
};

export default CustomTable;