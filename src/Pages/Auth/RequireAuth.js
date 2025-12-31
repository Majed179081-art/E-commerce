import { Outlet, useNavigate, useLocation } from "react-router-dom"; // أضفنا useLocation هنا
import Cookie from "cookie-universal";
import { useEffect, useState } from "react";
import { USER } from "../../API/API";
import LoadingSubmit from "../../Components/Loading/Loading";
import { Axios } from "../../API/axios";
import Err403 from '../Auth/Err403';
export default function RequireAuth({ allowedRoles: roles }) {
    const navigate = useNavigate();
    const location = useLocation(); // استبدلنا window.location بهذا
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const cookie = Cookie();
    const token = cookie.get('e-commerce');
    useEffect(() => {
        if (!token) {
            navigate('/login', { 
                replace: true, 
                state: { from: location.pathname } // استخدمنا location من useLocation
            });
            return;
        }

        const fetchUser = async () => {
            try {
                const response = await Axios.get(`/${USER}`);
                setUser(response.data);
            } catch (error) {
                navigate('/login', { replace: true });
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [token, navigate, location]); // أضفنا location إلى dependencies

    if (loading) {
        return <LoadingSubmit />;
    }

    if (!user) {
        return null;
    }

    if (!roles.includes(user.role)) {
        return <Err403 role={user.role} allowedRoles={roles} />;
    }

    return <Outlet />;
}