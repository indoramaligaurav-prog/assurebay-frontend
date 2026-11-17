
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

import Footer from 'src/layout/_main/footer';

export default function ConditionalFooter({ branding }) {
  const pathname = usePathname();

  const isBuyerDashboard =
    pathname === '/profile' ||
    pathname.startsWith('/profile/');

  if (isBuyerDashboard) return null;

  return <Footer branding={branding} />;
}
