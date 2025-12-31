import React from "react";
import { Link } from "react-router-dom"; // استيراد Link
import "./Err403.css"; // استيراد ملف CSS للتنسيق

const Err403 = ({ role }) => { // استقبال role كـ prop
    return (
        <div className="err403-container">
            <div className="err403-content">
                <h1 className="err403-title">403 - Forbidden</h1>
                <p className="err403-message">
                    You don't have permission to access this page.
                </p>
                <p className="err403-description">
                    Please contact the administrator if you believe this is a mistake.
                </p>
                {/* استخدام Link مع الشرط مباشرة */}
                <Link
                    to={role === "1996" ? "/writer" : "/"} // الشرط داخل خاصية to
                    className="err403-home-link"
                >
                    {role === "1996" ? "Go back to Writer Page" : "Go back to Home"}
                </Link>
            </div>
        </div>
    );
};

export default Err403;