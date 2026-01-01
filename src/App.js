import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Contexts
import { AdminDataProvider } from './Context/AdminDataContext';
import { PublicUsersProvider } from './Context/PublicUsersContext';
import { CategoriesProvider } from './Context/CategoriesContext';
import { SidebarProvider } from './Context/SidebarContext';
import WindowContext from './Context/WindowContext';
import { DashboardSettingsProvider } from './Context/DashboardSettingsContext';
import { AlertProvider } from './Context/AlertContext'; // 👈 المسار المعدل

// Components
import ThemeInitializer from './ThemeInitializer';
import PublicRoutesWrapper from './PublicRoutesWrapper';

// Auth Pages
import Register from './Pages/Auth/Register';
import Login from './Pages/Auth/Login';
import RequireNoAuth from './Pages/Auth/RequireNoAuth';
import RequireAuth from './Pages/Auth/RequireAuth';
import { allowedRoles } from './Pages/Auth/permissions';
import Err404 from './Pages/Auth/Err404';

// Public Pages
import HomePage from './Pages/Dashbord/Website/HomePage';
import GoogleCallback from './Pages/Auth/GoogleCallback';
import Profile from './Components/WebsiteComponents/Profile';

// Dashboard Pages
import Dashboard from './Pages/Dashbord/Website/Dashboard';
import Users from './Pages/Dashbord/Website/Users';
import User from './Pages/Dashbord/Website/User';
import AddUser from './Pages/Dashbord/Website/Add-User';
import WelcomeDashboard from './Pages/Dashbord/WelcomeDashoard';
import ActivitiesPage from './Pages/Dashbord/Website/ActivitiesPage';

import Categories from './Pages/Dashbord/Website/Categories';
import AddCategory from './Pages/Dashbord/Website/Add-new-category';
import UpdateCategory from './Pages/Dashbord/Website/UpdateCategory';

import Products from './Pages/Dashbord/Website/Products';
import AddProduct from './Pages/Dashbord/Website/Add-new-product';
import UpdateProduct from './Pages/Dashbord/Website/UpdateProduct';

import Orders from './Pages/Dashbord/Website/Orders';


import DashboardSettings from './Pages/Dashbord/Website/DashboardSettings';
import CustomerSettings from './Components/WebsiteComponents/HomeNavbarComponents/CustomersSettings';

import AllCategoriesPage from './Components/WebsiteComponents/AllCategoriesPage';
import LatestSales from './Components/WebsiteComponents/LatestSales';
import ProductDetail from './Components/WebsiteComponents/ProductDetails';
import CategoryProductsPage from './Components/WebsiteComponents/HomeNavbarComponents/CategoryProductsPage';
import SearchResults from './Components/WebsiteComponents/HomeNavbarComponents/SearchResults';
import OrdersPage from './Components/WebsiteComponents/UserOrders.';
import EditProfile from './Components/WebsiteComponents/EditProfile';
import CheckoutPage from './Components/WebsiteComponents/OrdersSystem/CheckoutPage';
import OrderConfirmationPage from './Components/WebsiteComponents/OrdersSystem/OrderComfirmation';
import EditOrder from "./Components/WebsiteComponents/HomeNavbarComponents/EditOrder";
import OrderEdit from './Pages/Dashbord/Website/OrderEdit';

function App() {
  return (
    <div className="App">
      {/* 👇 لف كل شيء داخل AlertProvider */}
      <AlertProvider>
        {/* 👇 لف كل شيء داخل PublicUsersProvider */}
        <PublicUsersProvider>
          <CategoriesProvider>
            <AdminDataProvider>
              <Routes>

                {/* ================== ١. المسارات العامة ================== */}
                <Route element={<PublicRoutesWrapper />}>
                  <Route path="/login" element={
                    <RequireNoAuth>
                      <Login />
                    </RequireNoAuth>
                  } />
                  <Route path="/register" element={
                    <RequireNoAuth>
                      <Register />
             
                    </RequireNoAuth>
                  } />
                  <Route path="/settings" element={<CustomerSettings />} />
                           <Route path="/" element={<HomePage />} />
                  <Route path="/auth/google/callback" element={<GoogleCallback />} />
                  <Route path="/categories" element={<AllCategoriesPage />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/latest-sales" element={<LatestSales />} />
                  <Route path="/category/:id" element={<CategoryProductsPage />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/edit-profile" element={<EditProfile />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                  <Route path="/orders/:id/edit" element={<EditOrder />} />
                </Route>

                {/* ================== ٢. المسارات المحمية ================== */}
                <Route element={
                  <WindowContext>
                    <SidebarProvider>
                      <DashboardSettingsProvider>
                        <ThemeInitializer>
                          <RequireAuth allowedRoles={[
                            ...allowedRoles.WRITER_PAGE,
                            ...allowedRoles.ADMIN_PAGE,
                            ...allowedRoles.PRODUCT_MANAGER
                          ]} />
                        </ThemeInitializer>
                      </DashboardSettingsProvider>
                    </SidebarProvider>
                  </WindowContext>
                }>
                  <Route path="/dashboard" element={<Dashboard />}>

                    {/* إعدادات Dashboard */}
                    <Route path="settings" element={<DashboardSettings />} />

                    {/* مسارات الطلبات داخل Dashboard */}
                    <Route path="orders" element={<Orders />} />
                    <Route path="orders/:id" element={<OrderEdit />} />
                    
                 

                    {/* مسارات الكاتب */}
                    <Route element={<RequireAuth allowedRoles={allowedRoles.WRITER_PAGE} />}>
                      <Route path="welcome" element={<WelcomeDashboard />} />
                      {/* تم إزالة المسار المطلق وأصبح مساراً نسبياً داخل Dashboard */}
                      <Route path="activities" element={<ActivitiesPage />} />
                    </Route>

                    {/* مسارات المنتجات (للمدير ومدير المنتجات) */}
                    <Route element={<RequireAuth allowedRoles={[
                      ...allowedRoles.ADMIN_PAGE,
                      ...allowedRoles.PRODUCT_MANAGER
                    ]} />}>
                      <Route path="categories" element={<Categories />} />
                      <Route path="categories/:id" element={<UpdateCategory />} />
                      <Route path="category/add" element={<AddCategory />} />
                      <Route path="products" element={<Products />} />
                      <Route path="products/:id" element={<UpdateProduct />} />
                      <Route path="product/add" element={<AddProduct />} />
                    </Route>

                    {/* مسارات المدير */}
                    <Route element={<RequireAuth allowedRoles={allowedRoles.ADMIN_PAGE} />}>
                      <Route path="users" element={<Users />} />
                      <Route path="users/:id" element={<User />} />
                      <Route path="user/add" element={<AddUser />} />
                    </Route>

                  </Route>
                </Route>

                {/* ================== ٣. صفحة 404 ================== */}
                <Route path="/*" element={<Err404 />} />

              </Routes>
              <ToastContainer 
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
              />
            </AdminDataProvider>
          </CategoriesProvider>
        </PublicUsersProvider>
      </AlertProvider>
    </div>
  );
}

export default App;