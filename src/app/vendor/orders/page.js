import React from 'react';
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import OrdersEbayStyle from '@/components/_admin/orders/orders-ebay-style';

export const metadata = { title: 'Orders - Assuredbay', applicationName: 'Assuredbay' };

export default function page() {
  return (
    <div>
       <HeaderBreadcrumbs
        admin
        heading="Orders List"
        links={[
          {
            name: 'Dashboard',
            href: '/vendor/dashboard'
          },
          {
            name: 'Orders'
          }
        ]}
      />
  <OrdersEbayStyle isVendor />
    </div>
);
}