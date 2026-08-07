import React from 'react';

// guard
import VendorGuard from '@/guards/vendor';

// layout
import VendorLayout from 'src/layout/_vendor';
import FloatingSupportWidget from 'src/components/_vendor/support/floating-widget';
const baseUrl = process.env.NEXT_PUBLIC_API_URL;
export const metadata = {
  title: 'assuredbay E-commerce Script | Your Gateway to Seamless Shopping and Secure Transactions',
  description:
    'Log in to assuredbay for secure access to your account. Enjoy seamless shopping, personalized experiences, and hassle-free transactions. Your trusted portal to a world of convenience awaits. Login now!',
  applicationName: 'assuredbay',
  authors: 'assuredbay',
  keywords: 'ecommerce, assuredbay, Commerce, Sign in assuredbay, Signin From assuredbay',
  icons: {
    icon: `${process.env.NEXT_PUBLIC_API_URL}/uploads/branding/favicon.jpeg`
  },
  openGraph: {
    images: 'https://assuredbay.vercel.app/opengraph-image.png?1c6a1fa20db2840f'
  }
};
export default async function layout({ children }) {
  const res = await fetch(`${baseUrl}/api/settings/branding`, { next: { revalidate: 60 } });
  const { data: branding } = await res.json();
  return (
    <VendorGuard>
      <VendorLayout branding={branding}>
        {children}
        <FloatingSupportWidget />
      </VendorLayout>
    </VendorGuard>
  );
}
