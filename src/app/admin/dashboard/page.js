import React from 'react';

// components
import DashboardMain from 'src/components/_admin/dashboard';

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
  return <DashboardMain />;
}
