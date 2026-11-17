import React from 'react';
import PropTypes from 'prop-types';

import AuthGuard from 'src/guards/auth';
import AccountDashboard from 'src/components/account-dashboard/account-dashboard';

export default function ProfileLayout({ children }) {
  return (
    <AuthGuard>
      <AccountDashboard>{children}</AccountDashboard>
    </AuthGuard>
  );
}

ProfileLayout.propTypes = {
  children: PropTypes.node.isRequired
};