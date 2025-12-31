//src/API/API.js
import axios from 'axios';

// ✅ إضافة هذا السطر للإعدادات الافتراضية
axios.defaults.withCredentials = true;

export const baseURL=`http://127.0.0.1:8000/api`;
export const REGISTER="register";
export const LOGIN ="login"
export const USERS= "users"
export const LOGOUT= "logout"
export const GOOGLE_CALL_BACK="auth/google/callback"
export const USER="user"
export const CATEGORIES= "categories"
export const CATEGORY = "category"
export const PRODUCTS= "products"
export const PRODUCT = "products"
export const PRO = "product"
export const DASHBOARD_SETTINGS = "dashboard/settings";
// المستخدمين في Dashboard
export const DASHBOARD_USERS = "dashboard/users"; // للحصول على كل المستخدمين
export const DASHBOARD_USER = "dashboard/user"; 
// في بداية المكون، بعد imports وأول سطر:
export const DASHBOARD_PREFIX = "/dashboard";
// API/API.js
export const LATEST_SALE = 'latest-sale';
// A new endpoint is added to fetch top-rated products.
// For example, in API.js or a similar file.
// API/API.js
export const TOP_RATED = 'top-rated'; // أو أي endpoint مناسب
// API/API.js
export const LATEST_PRODUCTS = 'latest-products'; // أو أي endpoint مناسب
