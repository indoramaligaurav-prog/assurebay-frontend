import React from 'react';

// components
import ProductList from '@/components/_admin/products/products';
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';

// Meta information
export const metadata = {
  title: 'Listing - Assuredbay',
  applicationName: 'Assuredbay',
  authors: 'Assuredbay'
};
export default async function AdminProducts() {
  return (
    <div>
      <HeaderBreadcrumbs
        admin
        heading="Product List"
        links={[
          {
            name: 'Dashboard',
            href: '/vendor/dashboard'
          },
          {
            name: 'Listing'
          }
        ]}
        action={{
          href: `/vendor/products/add`,
          title: 'Add Product'
        }}
      />
      <ProductList isVendor />
    </div>
  );
}
