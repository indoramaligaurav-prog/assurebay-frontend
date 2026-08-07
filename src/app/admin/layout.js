import React from 'react';

// guard

import AdminGuard from 'src/guards/admin';

// layout
import DashboardLayout from '@/layout/_admin';
export const metadata = {
  title: 'Assuredbay E-commerce Script | Your Gateway to Seamless Shopping and Secure Transactions',
  description:
    'Log in to Assuredbay for secure access to your account. Enjoy seamless shopping, personalized experiences, and hassle-free transactions. Your trusted portal to a world of convenience awaits. Login now!',
  applicationName: 'Assuredbay',
  authors: 'Assuredbay',
  keywords: 'ecommerce, Assuredbay, Commerce, Sign in Assuredbay, Signin From Assuredbay',
  icons: {
    icon: `${process.env.NEXT_PUBLIC_API_URL}/uploads/branding/favicon.jpeg`
  },
  openGraph: {
    images: 'https://Assuredbay.vercel.app/opengraph-image.png?1c6a1fa20db2840f'
  }
};
const baseUrl = process.env.NEXT_PUBLIC_API_URL;
export default async function layout({ children }) {
  const res = await fetch(`${baseUrl}/api/settings/branding`, { next: { revalidate: 60 } });
  const { data: branding } = await res.json();
  return (
    <AdminGuard>
      <DashboardLayout branding={branding}>{children}</DashboardLayout>
    </AdminGuard>
  );
}
