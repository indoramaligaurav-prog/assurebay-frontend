'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';

import { Box, Stack, Typography, Button, Pagination, Skeleton } from '@mui/material';
import { ArrowForward, ShoppingBagOutlined, Inventory2Outlined } from '@mui/icons-material';

import * as api from 'src/services';

const ACCENT = '#B5442F';
const ACCENT_HOVER = '#9C3826';
const INK = '#1F2933';
const MUTED = '#6B7280';
const LINE = '#E5E7EB';

/* ---------- helpers ---------- */

const getStatus = (item) => {
  const status = (item?.vendorStatus || 'pending').toLowerCase();

  if (status === 'delivered') return { key: 'delivered', label: 'Delivered', color: '#23845B', bg: '#EAF6EF' };
  if (status === 'shipped') return { key: 'active', label: 'In transit', color: '#23845B', bg: '#EAF6EF' };
  if (status === 'out_for_delivery') return { key: 'active', label: 'Out for delivery', color: '#3977A8', bg: '#EAF3FA' };
  if (status === 'cancelled') return { key: 'closed', label: 'Cancelled', color: '#B54747', bg: '#FCEEEE' };
  if (status === 'rejected') return { key: 'closed', label: 'Rejected', color: '#B54747', bg: '#FCEEEE' };

  return { key: 'active', label: 'Processing', color: '#A46B24', bg: '#FBF2E4' };
};

const isOrderDelivered = (order) => {
  const items = order.items || [];
  return items.length
    ? items.every((item) => item.vendorStatus === 'delivered')
    : (order.status || '').toLowerCase() === 'delivered';
};

const isOrderActive = (order) => {
  const items = order.items || [];

  if (items.length) {
    return items.some(
      (item) => !['delivered', 'cancelled', 'rejected'].includes((item.vendorStatus || 'pending').toLowerCase())
    );
  }

  return !['delivered', 'cancelled', 'returned'].includes((order.status || '').toLowerCase());
};

// Order-level status shown in the chip: delivered if all delivered, otherwise first item still moving.
const getOrderStatus = (order) => {
  if (isOrderDelivered(order)) return getStatus({ vendorStatus: 'delivered' });
  const items = order.items || [];
  const moving = items.find((i) => getStatus(i).key === 'active') || items[0];
  return getStatus(moving);
};

const formatShort = (date) =>
  date
    ? new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';

const formatDay = (date) =>
  date ? new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }) : '';

const formatPrice = (amount, currency, conversionRate = 1) => {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: (currency || 'INR').toUpperCase(),
      maximumFractionDigits: 2
    }).format(Number(amount || 0) * Number(conversionRate || 1));
  } catch {
    return `${currency || 'INR'} ${Number(amount || 0).toFixed(2)}`;
  }
};

const getVariant = (variant) => {
  if (!variant) return '';
  if (typeof variant === 'string') return variant;
  if (typeof variant === 'object') {
    return Object.entries(variant)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }
  return '';
};

// Date line under each product. Adjust the field names to match your API.
const getDateLine = (item) => {
  const status = getStatus(item);
  if (status.key === 'delivered') {
    const d = item.deliveredAt || item.deliveredDate;
    return d ? `Delivered ${formatDay(d)}` : '';
  }
  if (status.key === 'active') {
    const d = item.expectedDelivery || item.estimatedDelivery || item.expectedDate;
    return d ? `Expected ${formatDay(d)}` : '';
  }
  return '';
};

/* ---------- shared button styles ---------- */

const pillButton = {
  textTransform: 'none',
  fontWeight: 500,
  fontSize: 14,
  borderRadius: 999,
  px: 2.5,
  py: 1.1,
  whiteSpace: 'nowrap',
  boxShadow: 'none'
};

const outlinedPill = {
  ...pillButton,
  color: INK,
  borderColor: LINE,
  bgcolor: '#fff',
  '&:hover': { borderColor: '#D1D5DB', bgcolor: '#F9FAFB' }
};

const filledPill = {
  ...pillButton,
  color: '#fff',
  bgcolor: ACCENT,
  '&:hover': { bgcolor: ACCENT_HOVER, boxShadow: 'none' }
};

/* ---------- order card ---------- */

function OrderItemRow({ item, fallbackPrice, currency, rate }) {
  const dateLine = getDateLine(item);
  const seller = item.vendor?.shopName || item.shopName || 'Seller';
  const variant = getVariant(item.variant);
  const price =
    item.price != null ? Number(item.price) * Number(item.quantity || 1) : fallbackPrice;

  return (
    <Stack direction="row" spacing={{ xs: 2, sm: 3 }} alignItems="center" sx={{ minWidth: 0 }}>
      <Box
        sx={{
          width: { xs: 80, sm: 120 },
          height: { xs: 80, sm: 120 },
          borderRadius: '20px',
          bgcolor: '#F3F4F6',
          flexShrink: 0,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {item.imageUrl ? (
          <Box
            component="img"
            src={item.imageUrl}
            alt={item.productName || 'Product'}
            sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          <ShoppingBagOutlined sx={{ color: '#9CA3AF' }} />
        )}
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontSize: { xs: 16, sm: 20 }, fontWeight: 600, color: INK, lineHeight: 1.3 }}>
          {item.productName}
        </Typography>

        <Typography sx={{ fontSize: 14, color: MUTED, mt: 0.75 }}>
          {variant ? `${variant} · ` : ''}Qty {item.quantity || 1} · Seller: {seller}
        </Typography>

        {dateLine && (
          <Typography sx={{ fontSize: 14, color: MUTED, mt: 0.5 }}>{dateLine}</Typography>
        )}
      </Box>

      {price != null && (
        <Typography
          sx={{ fontSize: { xs: 16, sm: 20 }, fontWeight: 600, color: INK, flexShrink: 0, alignSelf: { sm: 'center' } }}
        >
          {formatPrice(price, currency, rate)}
        </Typography>
      )}
    </Stack>
  );
}

function OrderCard({ order }) {
  const items = order.items || [];
  const status = getOrderStatus(order);
  const delivered = isOrderDelivered(order);
  const trackingItem = items.find((item) => item.trackingLink);
  const visibleItems = items.slice(0, 2);

  return (
    <Box
      sx={{
        bgcolor: '#fff',
        border: `1px solid ${LINE}`,
        borderRadius: '28px',
        px: { xs: 2, sm: 4.5 },
        py: { xs: 2.5, sm: 3.5 }
      }}
    >
      {/* header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ pb: 2.5, borderBottom: `1px solid ${LINE}` }}
      >
        <Typography sx={{ fontSize: 15, color: MUTED }}>
          <Box component="span" sx={{ fontWeight: 700, color: INK }}>
            {order.orderNo}
          </Box>
          {'  ·  '}
          {formatShort(order.createdAt)}
        </Typography>

        <Box
          sx={{
            px: 1.75,
            py: 0.6,
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 500,
            color: status.color,
            bgcolor: status.bg
          }}
        >
          {status.label}
        </Box>
      </Stack>

      {/* products */}
      <Stack spacing={3} sx={{ pt: 3.5 }}>
        {visibleItems.map((item) => (
          <OrderItemRow
            key={item._id}
            item={item}
            fallbackPrice={items.length === 1 ? order.total : undefined}
            currency={order.currency}
            rate={order.conversionRate}
          />
        ))}

        {items.length > 2 && (
          <Typography sx={{ fontSize: 14, color: MUTED }}>+{items.length - 2} more products</Typography>
        )}
      </Stack>

      {/* order total when there are several products */}
      {items.length > 1 && (
        <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 2 }}>
          <Typography sx={{ fontSize: 14, color: MUTED }}>Order total</Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: INK }}>
            {formatPrice(order.total, order.currency, order.conversionRate)}
          </Typography>
        </Stack>
      )}

      {/* actions */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mt: 3.5 }}
        flexWrap="wrap"
        useFlexGap
        spacing={1.5}
      >
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
          {delivered ? (
            <Button href={`/order/${order._id}`} variant="outlined" sx={outlinedPill}>
              View order
            </Button>
          ) : trackingItem?.trackingLink ? (
            <Button
              component="a"
              href={trackingItem.trackingLink}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
              sx={filledPill}
            >
              Track order
            </Button>
          ) : (
            <Button
              href={`/order/${order._id}`}
              variant="contained"
              endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
              sx={filledPill}
            >
              Track order
            </Button>
          )}

          <Button href="/profile/messages" variant="outlined" sx={outlinedPill}>
            Contact seller
          </Button>
        </Stack>

        <Button
          href={`/order/${order._id}`}
          sx={{ textTransform: 'none', color: INK, fontWeight: 500, fontSize: 14, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
        >
          Order details
        </Button>
      </Stack>
    </Box>
  );
}

/* ---------- page ---------- */

export default function InvoiceHistory({ compact = false }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const pageParam = compact ? '1' : searchParams.get('page') || '1';
  const [activeFilter, setActiveFilter] = useState('all');

  const {
    data: invoiceResponse,
    isPending: invoicesLoading,
    isError
  } = useQuery({
    queryKey: ['user-invoice', pageParam],
    queryFn: () => api.getUserInvoice(`?page=${pageParam}`),
    retry: false
  });

  const invoiceOrders = Array.isArray(invoiceResponse?.data) ? invoiceResponse.data : [];

  const { data: orders = [], isPending: detailsLoading } = useQuery({
    queryKey: ['user-invoice-details', pageParam, invoiceOrders.map((o) => o._id)],
    enabled: !invoicesLoading && !isError && invoiceOrders.length > 0,
    queryFn: async () =>
      Promise.all(
        invoiceOrders.map(async (order) => {
          try {
            const response = await api.getUserOrderById(order._id);
            const details = response?.data || {};
            return { ...order, ...details, items: details.items || order.items || [] };
          } catch (error) {
            console.error(`Unable to load details for order ${order.orderNo}`, error);
            return { ...order, items: order.items || [] };
          }
        })
      ),
    retry: false
  });

  const loading = invoicesLoading || (invoiceOrders.length > 0 && detailsLoading);

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'active') return orders.filter(isOrderActive);
    if (activeFilter === 'delivered') return orders.filter(isOrderDelivered);
    return orders;
  }, [orders, activeFilter]);

  const filters = [
    { value: 'all', label: 'All orders' },
    { value: 'active', label: 'In progress' },
    { value: 'delivered', label: 'Delivered' }
  ];

  const handlePageChange = (_, page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`?${params.toString()}`);
  };

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Unable to load your orders. Please try again.</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        minWidth: 0,
        height: compact ? '100%' : 'auto',
        overflowY: compact ? 'auto' : 'visible'
      }}
    >
      {/* Pill filters */}
      <Stack direction="row" spacing={1} sx={{ mb: 3, overflowX: 'auto' }}>
        {filters.map((filter) => {
          const selected = activeFilter === filter.value;
          return (
            <Button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              disableRipple
              sx={{
                textTransform: 'none',
                fontSize: 15,
                fontWeight: 500,
                borderRadius: 999,
                px: 2.5,
                py: 1.25,
                whiteSpace: 'nowrap',
                color: selected ? INK : MUTED,
                bgcolor: selected ? '#E9ECEF' : 'transparent',
                '&:hover': { bgcolor: selected ? '#E9ECEF' : 'rgba(0,0,0,0.04)' }
              }}
            >
              {filter.label}
            </Button>
          );
        })}
      </Stack>

      {/* Orders */}
      <Stack spacing={3}>
        {loading ? (
          [1, 2].map((n) => (
            <Skeleton key={n} variant="rounded" height={300} sx={{ borderRadius: '28px' }} />
          ))
        ) : filteredOrders.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center', bgcolor: '#fff', border: `1px solid ${LINE}`, borderRadius: '28px' }}>
            <Inventory2Outlined sx={{ fontSize: 40, color: '#9CA3AF', mb: 1 }} />
            <Typography fontWeight={700} color={INK}>
              No orders found
            </Typography>
            <Typography fontSize={14} color={MUTED}>
              There are no orders in this category yet.
            </Typography>
          </Box>
        ) : (
          filteredOrders.map((order) => <OrderCard key={order._id} order={order} />)
        )}
      </Stack>

      {!compact && !loading && Number(invoiceResponse?.count || 0) > 1 && (
        <Stack alignItems="center" sx={{ pt: 4 }}>
          <Pagination
            count={Number(invoiceResponse.count)}
            page={Number(pageParam)}
            onChange={handlePageChange}
          />
        </Stack>
      )}
    </Box>
  );
}