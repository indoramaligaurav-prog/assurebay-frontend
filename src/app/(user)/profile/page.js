import React from 'react';
import AccountOverview from 'src/components/account-dashboard/account-overview';

export const metadata = {
  title: 'My Account | Wreeo',
  description: 'Manage your Wreeo account, orders, and wishlist.',
  applicationName: 'Wreeo'
};

export default function Profile() {
  return <AccountOverview />;
}