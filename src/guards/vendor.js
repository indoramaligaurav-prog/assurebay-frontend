'use client';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'src/redux';
import { toast } from 'react-hot-toast';
import * as api from 'src/services';

import Loading from 'src/components/loading';
import PendingApprovalNotice from 'src/components/pending-approval-notice';

const DASHBOARD_PATH = '/vendor/dashboard';

export default function Guest({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [shopStatus, setShopStatus] = useState(null);
  const { isAuthenticated, user } = useSelector(({ user }) => user);

  useEffect(() => {
    const check = async () => {
      if (!isAuthenticated || user?.role !== 'vendor') {
        toast.error("You're not allowed to access vendor dashboard");
        router.push('/');
        return;
      }

      try {
        const res = await api.getShopStatus();
        setShopStatus(res.status);
      } catch (err) {
        router.push('/');
        return;
      } finally {
        setChecking(false);
      }
    };
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking) {
    return <Loading />;
  }

  const isApproved = shopStatus === 'approved';
  const isDashboardPage = pathname === DASHBOARD_PATH;

  // Block everything except the dashboard page itself if not approved
  if (!isApproved && !isDashboardPage) {
    return <PendingApprovalNotice status={shopStatus} />;
  }

  return children;
}

Guest.propTypes = {
  children: PropTypes.node.isRequired
};