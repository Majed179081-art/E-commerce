import React from "react";
import { Link } from "react-router-dom"; // استيراد Link للتوجيه
import "./Err404.css"; // استيراد ملف CSS

const Err404 = () => {
    return (
        <div className="err404-container">
            <div className="err404-content">
                <h1 className="err404-title">404 - Page Not Found</h1>
                <p className="err404-message">
                    Oops! The page you're looking for doesn't exist.
                </p>
                <p className="err404-description">
                    Please check the URL or go back to the homepage.
                </p>
                {/* زر للعودة إلى الصفحة الرئيسية */}
                <Link to="/" className="err404-home-link">
                    Go back to Home
                </Link>
            </div>
        </div>
    );
};

export default Err404;