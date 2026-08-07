import React from 'react';

// components
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';


// api
import * as api from 'src/services';
// Meta information
export const metadata = {
  title: 'Vendor Kyc Approved List - Assuredbay',
  applicationName: 'Assuredbay',
  authors: 'Assuredbay'
};
export default async function page() {
  const { data: shops } = await api.getAllShopsByAdmin();
  return (
    <div>
      <HeaderBreadcrumbs
        admin
        heading="Vendor Kyc Approved List"
        links={[
          {
            name: 'Dashboard',
            href: '/admin/dashboard'
          },
          {
            name: 'Vendor Kyc Approved List'
          }
        ]}
      />
    
    </div>
  );
}
