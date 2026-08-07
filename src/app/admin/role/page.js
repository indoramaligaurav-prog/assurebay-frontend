import React from 'react';
import RolesMain from '@/components/_admin/roles/roles';
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';

export const metadata = {
  title: 'Roles & Permissions - Assuredbay',
  applicationName: 'Assuredbay',
  authors: 'Assuredbay'
};

export default async function AdminRoles() {
  return (
    <div>
      <HeaderBreadcrumbs
        admin
        heading="Roles & Permissions"
        links={[{ name: 'Dashboard', href: '/admin/dashboard' }, { name: 'Roles & Permissions' }]}
      />
      <RolesMain />
    </div>
  );
}