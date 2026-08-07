import React from 'react';

import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import ShopMain from '@/components/_admin/shop';

export default async function Page({ params }) {
  const { slug } = await params;
  return (
    <div>
      <HeaderBreadcrumbs
        heading="Edit Shop"
        admin
        links={[
          { name: 'Dashboard', href: '/admin/dashboard' },
          { name: 'Shops', href: '/admin/shops' },
          { name: 'Edit Shop' }
        ]}
      />
      <ShopMain slug={slug} />
    </div>
  );
}
