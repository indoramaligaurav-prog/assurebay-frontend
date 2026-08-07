import React from 'react';

// components
import SupportInbox from 'src/components/_vendor/support';

// Meta information
export const metadata = {
  title: 'Assuredbay - Support',
  description: 'Raise a query with the marketplace team and track its status.',
  applicationName: 'Assuredbay Dashboard',
  authors: 'Assuredbay',
  keywords: 'support, tickets, vendor, Assuredbay',
  icons: {
    icon: '/favicon.png'
  }
};

export default function page() {
  return <SupportInbox />;
}