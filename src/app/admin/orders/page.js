import React from 'react';

// components
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import OrdersMain from '@/components/_admin/orders/orders';

// api
import * as api from 'src/services';
// Meta information
export const metadata = {
  title: 'Order - Assuredbay',
  applicationName: 'Assuredbay',
  authors: 'Assuredbay'
};
export default async function page() {
  const { data: shops } = await api.getAllShopsByAdmin();
  return (
    <div>
      <HeaderBreadcrumbs
        admin
        heading="Orders List"
        links={[
          {
            name: 'Dashboard',
            href: '/admin/dashboard'
          },
          {
            name: 'Orders'
          }
        ]}
      />
      <OrdersMain shops={shops} />
    </div>
  );
}
