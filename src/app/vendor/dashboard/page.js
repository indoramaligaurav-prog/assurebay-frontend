import React from 'react';

// components
import Dashboard from 'src/components/_admin/dashboard';
import ShopStatusBanner from 'src/components/_vendor/shop-status-banner';

// Meta information
export const metadata = {
  title: 'Assuredbay - Dashboard',
  description: 'Welcome to the Assuredbay Dashboard. Manage your e-commerce operations with ease.',
  applicationName: 'Assuredbay Dashboard',
  authors: 'Assuredbay',
  keywords: 'dashboard, e-commerce, management, Assuredbay',
  icons: {
    icon: '/favicon.png'
  }
};

export default function page() {
  return (
    <>
      <ShopStatusBanner />
      <Dashboard />
    </>
  );
}
