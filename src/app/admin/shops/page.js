import React from 'react';

// components
import ShopsMain from '@/components/_admin/shops/shops';
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';

// Meta information
export const metadata = {
  title: 'Products - Assuredbay',
  applicationName: 'Assuredbay',
  authors: 'Assuredbay'
};

export default async function AdminProducts() {
  return (
    <div>
      <HeaderBreadcrumbs
        admin
        heading="Shops"
        links={[
          {
            name: 'Dashboard',
            href: '/admin/dashboard'
          },
          {
            name: 'Shops'
          }
        ]}
      />
      <ShopsMain />
    </div>
  );
}
