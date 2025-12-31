// PublicRoutesWrapper.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SettingsProvider } from './Context/SettingsContext';

const PublicRoutesWrapper = () => {
  return (
    <SettingsProvider>
      <Outlet />
    </SettingsProvider>
  );
};

export default PublicRoutesWrapper; 
