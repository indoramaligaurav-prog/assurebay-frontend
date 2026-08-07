import React from 'react';

// mui
import { Container } from '@mui/material';

// components
import Checkout from 'src/components/_main/checkout';
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';

// Meta information
export const metadata = {
  title: 'Checkout | Assuredbay - Secure and Convenient Checkout for Your Shopping',
  description:
    'Complete your purchase with confidence on Assuredbay. Enjoy a secure and convenient checkout process for your shopping needs. Enter your payment and shipping information with ease. Experience seamless transactions and fast delivery. Start your checkout now!',
  applicationName: 'Assuredbay',
  authors: 'Assuredbay',
  keywords:
    'checkout, Assuredbay, secure checkout, convenient checkout, complete purchase, payment information, shipping information, seamless transactions, fast delivery, secure payment, easy checkout, hassle-free checkout, online shopping checkout'
};
const baseUrl = process.env.NEXT_PUBLIC_API_URL;
export default async function CheckoutPage() {
  const res = await fetch(`${baseUrl}/api/settings/general`, { next: { revalidate: 600 } });
  const { data } = await res.json();
  return (
    <Container maxWidth="xl">
      <HeaderBreadcrumbs
        heading="Checkout"
        links={[
          {
            name: 'Home',
            href: '/'
          },
          {
            name: 'Cart',
            href: '/cart'
          },
          {
            name: 'Checkout'
          }
        ]}
      />

      <Checkout data={data} />
    </Container>
  );
}
