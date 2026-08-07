import React from 'react';
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import DraftProductsTable from '@/components/_admin/draft-products-table';

export const metadata = {
  title: 'Products - Assuredbay',
  applicationName: 'Assuredbay',
  authors: 'Assuredbay'
};
export const dynamic = 'force-dynamic';

export default function AdminProducts() {
  return (
    <div>
      <HeaderBreadcrumbs
        admin
        heading="Products List"
        links={[
          { name: 'Dashboard', href: '/admin/dashboard' },
          { name: 'Products' }
        ]}
        action={{ href: `/admin/products/add`, title: 'Add Product' }}
      />
      <DraftProductsTable />
    </div>
  );
}