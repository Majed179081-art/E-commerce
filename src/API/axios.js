//src/API/axios.js
import axios from "axios";
import Cookie from "cookie-universal";

export const baseURL = "http://localhost:8000/api";

const Axios = axios.create({
    baseURL: baseURL,
    timeout: 300000,
    withCredentials: true,
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
    }
});

const cookie = Cookie();

// REQUEST INTERCEPTOR
Axios.interceptors.request.use(
    (config) => {
        const token = cookie.get("e-commerce");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        config.headers["X-Timestamp"] = Date.now();
        return config;
    },
    (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
Axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            cookie.remove("e-commerce");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export { Axios };
