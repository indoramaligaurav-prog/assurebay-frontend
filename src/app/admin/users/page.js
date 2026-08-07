import React from 'react';

// components
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import UsersList from '@/components/_admin/users/users';

// Meta information
export const metadata = {
  title: 'User - Assuredbay',
  applicationName: 'Assuredbay',
  authors: 'Assuredbay'
};
export default function page() {
  return (
    <div>
      <HeaderBreadcrumbs
        admin
        heading="Users List"
        links={[
          {
            name: 'Dashboard',
            href: '/admin/dashboard'
          },
          {
            name: 'Users'
          }
        ]}
      />
      <UsersList />
    </div>
  );
}
