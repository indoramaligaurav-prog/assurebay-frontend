'use client';
import React, { useEffect, useState } from 'react';
import { Alert, Skeleton, Box, Button } from '@mui/material';
import * as api from 'src/services';

export default function ShopStatusBanner() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [payoutsEnabled, setPayoutsEnabled] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.getShopStatus();
        setStatus(res.status);
        setPayoutsEnabled(res.payoutsEnabled);
      } catch (err) {
        console.error('Failed to fetch shop status', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  if (loading) {
    return <Skeleton variant="rounded" height={56} sx={{ mb: 3 }} />;
  }

  if (status === 'approved') {
    return (
      <Alert severity="success" sx={{ mb: 3 }}>
        Your shop is approved and active.
      </Alert>
    );
  }

  return (
    <Alert
      severity="warning"
      sx={{ mb: 3 }}>
      Your shop is under review. Full access will unlock once verification is complete.
    </Alert>
  );
}