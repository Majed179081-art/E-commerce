import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiPackage,
  FiUsers,
  FiPlusCircle,
  FiLayers,
  FiAward,
  FiShoppingBag,
} from 'react-icons/fi';
import { HiUserGroup } from 'react-icons/hi';
import { useTranslation } from 'react-i18next';

import { useSidebar } from '../../Context/SidebarContext';
import { Axios } from '../../API/axios';
import { USER } from '../../API/API';

import styles from './CssFiles/Sidebar.module.css';

const Sidebar = () => {
  const { isSidebarOpen, handleLinkClick } = useSidebar();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await Axios.get(`/${USER}`);
        setUser(response.data);
      } catch {
        navigate('/login', { replace: true });
      }
    };

    fetchUser();
  }, [navigate]);

  const links = [
    {
      to: '/dashboard/welcome',
      icon: FiAward,
      text: t('sidebar.welcome'),
        show: user?.role === '1995',
    },
    {
      to: '/',
      icon: FiHome,
      text: t('sidebar.home'),
      show: true,
    },
    {
      to: '/dashboard/categories',
      icon: FiLayers,
      text: t('sidebar.categories'),
      show: true,
    },
    {
      to: '/dashboard/products',
      icon: FiPackage,
      text: t('sidebar.products'),
      show: true,
    },
    {
      to: '/dashboard/orders',
      icon: FiShoppingBag,
      text: t('sidebar.orders'),
      show: true,
    },
 
    {
      to: '/dashboard/users',
      icon: HiUserGroup,
      text: t('sidebar.users'),
      show: user?.role === '1995',
    },
    {
      to: '/dashboard/user/add',
      icon: FiPlusCircle,
      text: t('sidebar.add_user'),
      show: user?.role === '1995',
    },
    {
      to: '/dashboard/category/add',
      icon: FiPlusCircle,
      text: t('sidebar.add_category'),
      show: user?.role === '1995'  || user?.role === '1999',
    },
    {
      to: '/dashboard/product/add',
      icon: FiPlusCircle,
      text: t('sidebar.add_product'),
      show: user?.role === '1995' || user?.role === '1999',
    },
  ];

  const sidebarClassName = `
    ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}
    ${i18n.language === 'ar' ? styles.rtl : styles.ltr}
  `;

  return (
    <div className={sidebarClassName}>
      <ul className={styles.sidebarList}>
        {links.map(
          ({ to, icon: Icon, text, show }, index) =>
            show && (
              <li key={index} className={styles.sidebarItem}>
                <NavLink
                  to={to}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    isActive ? styles.navLinkActive : styles.navLink
                  }
                >
                  <Icon className={styles.icon} />
                  {isSidebarOpen && <span>{text}</span>}
                </NavLink>
              </li>
            )
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
