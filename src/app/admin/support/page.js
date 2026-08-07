import React from 'react';

// components
import SupportInboxAdmin from 'src/components/_admin/support';

export const metadata = {
  title: 'Assuredbay - Support',
  description: 'Customer and vendor support tickets.',
  applicationName: 'Assuredbay Dashboard',
  authors: 'Assuredbay',
  keywords: 'support, tickets, admin, Assuredbay',
  icons: {
    icon: '/favicon.png'
  }
};

export default function page() {
  return <SupportInboxAdmin />;
}