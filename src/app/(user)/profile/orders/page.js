import React from 'react';

// components
import InvoiceHistory from '@/components/_main/profile/invoice-history';

// Meta information
export const metadata = {
  title: 'Invoice | Assuredbay - Your Order Details and Payment Confirmation',
  applicationName: 'Assuredbay',
  authors: 'Assuredbay'
};

export default async function OrderPage() {
  // The profile layout already renders the breadcrumb, "My orders" heading
  // and subtitle, so this page only renders the orders list.
  return <InvoiceHistory />;
}