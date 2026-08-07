'use client';

import React, { useEffect, useState } from 'react';

// MUI
import {
  Box,
  Typography,
  Stack,
  Paper,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Button,
  Alert,
  Skeleton
} from '@mui/material';

// components
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import * as api from 'src/services';
import { useCurrencyFormat } from '@/hooks/use-currency-format';
import { fDateShort } from '@/utils/format-time';

const getStatusColor = (status) => {
  if (status === 'released') return 'success';
  if (status === 'failed') return 'error';
  return 'default';
};

const getStatusLabel = (status) => ({
  released: 'Paid out',
  failed: 'Failed',
}[status] || status);

export default function Payments() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState(null);
  const fCurrency = useCurrencyFormat();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.getVendorPayments();
        setPayments(res.data);
      } catch (err) {
        console.error('Failed to load payments', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  return (
    <Box>
      <HeaderBreadcrumbs
        admin
        heading="Payments"
        links={[
          { name: 'Dashboard', href: '/vendor/dashboard' },
          { name: 'Payments' }
        ]}
      />

      {/* Stripe onboarding status */}
      {!loading && !payments?.payoutsEnabled && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Your payment setup isn't complete yet — you won't receive payouts until it's finished.
        </Alert>
      )}
      {!loading && payments?.payoutsEnabled && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Payouts active — you're set up to receive payments.
        </Alert>
      )}

      {/* Summary cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
        <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
          <Typography fontSize={13} color="text.secondary">Pending payout</Typography>
          {loading
            ? <Skeleton width={100} height={32} />
            : <Typography fontSize={22} fontWeight={700}>{fCurrency(payments?.summary.pendingAmount || 0)}</Typography>}
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
          <Typography fontSize={13} color="text.secondary">Total paid out</Typography>
          {loading
            ? <Skeleton width={100} height={32} />
            : <Typography fontSize={22} fontWeight={700}>{fCurrency(payments?.summary.releasedAmount || 0)}</Typography>}
        </Paper>
        {!loading && payments?.summary.failedCount > 0 && (
          <Paper variant="outlined" sx={{ p: 2, flex: 1, borderColor: 'error.main' }}>
            <Typography fontSize={13} color="error.main">Failed payouts</Typography>
            <Typography fontSize={22} fontWeight={700} color="error.main">
              {payments.summary.failedCount}
            </Typography>
          </Paper>
        )}
      </Stack>

      {/* History table */}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Order #</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Order subtotal</TableCell>
              <TableCell>Commission</TableCell>
              <TableCell>Payout amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(7)].map((_, j) => (
                    <TableCell key={j}><Skeleton /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : payments?.history?.length ? (
              payments.history.map((row) => (
                <TableRow key={row._id}>
                  <TableCell>{row.orderNo}</TableCell>
                  <TableCell>{row.productName}</TableCell>
                  <TableCell>{fCurrency(row.subtotal)}</TableCell>
                  <TableCell>{row.commissionPercent}%</TableCell>
                  <TableCell>{row.payoutAmount != null ? fCurrency(row.payoutAmount) : '—'}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={getStatusLabel(row.payoutStatus)}
                      color={getStatusColor(row.payoutStatus)}
                    />
                    {row.payoutStatus === 'failed' && row.payoutError && (
                      <Typography fontSize={11} color="error.main" mt={0.5}>
                        {row.payoutError}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{fDateShort(row.updatedAt)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography fontSize={14} color="text.secondary">No payouts yet.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}