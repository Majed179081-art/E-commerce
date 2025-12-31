// loading.js
import React from "react";
import "../../css/css components/loading.css"; // استيراد ملف CSS

export default function LoadingSubmit() {
    return (
        <div className="spinner-container-submit">
            <div className="spinner"></div>
            <p style={{ color: "white", marginTop: "10px" }}>Loading...</p> {/* إضافة نص تحميل */}
        </div>
    );
}