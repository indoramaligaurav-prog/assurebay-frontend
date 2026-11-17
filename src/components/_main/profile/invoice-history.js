
'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';

import {
  Box,
  Stack,
  Typography,
  Button,
  Chip,
  Divider,
  Card,
  Pagination,
  Skeleton,
  Tabs,
  Tab
} from '@mui/material';

import {
  Inventory2Outlined,
  LocalShippingOutlined,
  CheckCircleOutline,
  ArrowOutward,
  ArrowForward,
  ShoppingBagOutlined
} from '@mui/icons-material';

import * as api from 'src/services';

const ACCENT = '#C74735';

const getItemStatus = (item) => {
  const status = (item?.vendorStatus || 'pending').toLowerCase();

  if (status === 'delivered') {
    return {
      label: 'Delivered',
      icon: <CheckCircleOutline sx={{ fontSize: 18 }} />,
      color: '#23845B',
      bg: '#EAF6EF',
      description: 'Your order has been delivered'
    };
  }

  if (['shipped', 'out_for_delivery'].includes(status)) {
    return {
      label: status === 'shipped' ? 'In transit' : 'Out for delivery',
      icon: <LocalShippingOutlined sx={{ fontSize: 18 }} />,
      color: '#3977A8',
      bg: '#EAF3FA',
      description: 'Your order is on its way'
    };
  }

  if (status === 'cancelled' || status === 'rejected') {
    return {
      label: status === 'rejected' ? 'Rejected' : 'Cancelled',
      icon: <Inventory2Outlined sx={{ fontSize: 18 }} />,
      color: '#B54747',
      bg: '#FCEEEE',
      description: 'This order item was cancelled'
    };
  }

  return {
    label: 'Processing',
    icon: <Inventory2Outlined sx={{ fontSize: 18 }} />,
    color: '#A46B24',
    bg: '#FBF2E4',
    description: 'Seller is preparing your order'
  };
};

const isOrderDelivered = (order) => {
  const items = order.items || [];

  return items.length
    ? items.every((item) => item.vendorStatus === 'delivered')
    : order.status === 'delivered';
};

const isOrderActive = (order) => {
  const items = order.items || [];

  if (items.length) {
    return items.some((item) =>
      !['delivered', 'cancelled', 'rejected'].includes(
        (item.vendorStatus || 'pending').toLowerCase()
      )
    );
  }

  return !['delivered', 'cancelled', 'returned'].includes(
    (order.status || '').toLowerCase()
  );
};

const formatDate = (date) => {
  if (!date) return '';

  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

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
      .join(' · ');
  }

  return '';
};

function OrderProduct({ item }) {
  const status = getItemStatus(item);

  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      sx={{ mt: 2, minWidth: 0 }}
    >
      <Box
        sx={{
          width: 76,
          height: 76,
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: '#F3F3F3',
          flexShrink: 0,
          border: '1px solid #EEEEEE'
        }}
      >
        {item.imageUrl ? (
          <Box
            component="img"
            src={item.imageUrl}
            alt={item.productName || 'Product'}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        ) : (
          <Stack alignItems="center" justifyContent="center" height="100%">
            <ShoppingBagOutlined sx={{ color: '#AAAAAA' }} />
          </Stack>
        )}
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          fontWeight={650}
          fontSize={14}
          sx={{ lineHeight: 1.45 }}
        >
          {item.productName}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          sx={{ mt: 0.5 }}
        >
          {getVariant(item.variant)}
          {getVariant(item.variant) ? ' · ' : ''}
          Qty {item.quantity || 1}
        </Typography>

        <Typography
          variant="caption"
          sx={{ color: status.color, display: 'block', mt: 0.5 }}
        >
          {item.vendor?.shopName || item.shopName || 'Seller'}
        </Typography>
      </Box>
    </Stack>
  );
}

function OrderCard({ order }) {
  const items = order.items || [];
  const firstItem = items[0];
  const status = getItemStatus(firstItem);
  const allDelivered = isOrderDelivered(order);

  const trackingItem = items.find(
    (item) => item.trackingLink
  );

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 0,
        borderLeft: 0,
        borderRight: 0,
        borderColor: '#E8E8E8',
        boxShadow: 'none',
        bgcolor: 'transparent'
      }}
    >
      <Box sx={{ px: { xs: 2, sm: 3 }, py: 2.5 }}>

        {/* Status and order number */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ color: status.color, display: 'flex' }}>
              {status.icon}
            </Box>

            <Typography fontSize={13} fontWeight={600}>
              {allDelivered ? 'Delivered' : status.label}
            </Typography>
          </Stack>

          <Typography
            fontSize={12}
            color="text.secondary"
            sx={{ flexShrink: 0 }}
          >
            {order.orderNo}
          </Typography>
        </Stack>

        {/* Delivery message */}
        <Typography
          fontSize={17}
          fontWeight={700}
          sx={{ mt: 1.2, mb: 1 }}
        >
          {allDelivered
            ? 'Your order has arrived'
            : status.description}
        </Typography>

        {/* Products */}
        {items.slice(0, 2).map((item) => (
          <OrderProduct key={item._id} item={item} />
        ))}

        {items.length > 2 && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 1 }}
          >
            +{items.length - 2} more products
          </Typography>
        )}

        {/* Price and tracking */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
          sx={{ mt: 2.5 }}
        >
          <Box>
            <Typography fontWeight={700} fontSize={17}>
              {formatPrice(
                order.total,
                order.currency,
                order.conversionRate
              )}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Order total · incl. delivery
            </Typography>
          </Box>

          {trackingItem?.trackingLink ? (
            <Button
              component="a"
              href={trackingItem.trackingLink}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              endIcon={<ArrowOutward />}
              sx={{
                textTransform: 'none',
                color: '#333',
                borderColor: '#DADADA',
                borderRadius: 2,
                whiteSpace: 'nowrap'
              }}
            >
              Track order
            </Button>
          ) : (
            <Button
              href={`/order/${order._id}`}
              variant="outlined"
              endIcon={<ArrowOutward />}
              sx={{
                textTransform: 'none',
                color: '#333',
                borderColor: '#DADADA',
                borderRadius: 2,
                whiteSpace: 'nowrap'
              }}
            >
              View order
            </Button>
          )}
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          sx={{ mt: 1.5 }}
        >
          Ordered on {formatDate(order.createdAt)}
        </Typography>
      </Box>
    </Card>
  );
}

export default function InvoiceHistory({ compact = false }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const pageParam = compact
    ? '1'
    : searchParams.get('page') || '1';

  const [activeFilter, setActiveFilter] = useState('all');

  // First fetch the existing invoice list.
  const {
    data: invoiceResponse,
    isPending: invoicesLoading,
    isError
  } = useQuery({
    queryKey: ['user-invoice', pageParam],
    queryFn: () => api.getUserInvoice(`?page=${pageParam}`),
    retry: false
  });

  const invoiceOrders = Array.isArray(invoiceResponse?.data)
    ? invoiceResponse.data
    : [];

  // Enrich each order using the existing order-details API.
  const {
    data: orders = [],
    isPending: detailsLoading
  } = useQuery({
    queryKey: ['user-invoice-details', pageParam, invoiceOrders.map(o => o._id)],
    enabled: !invoicesLoading && !isError && invoiceOrders.length > 0,
    queryFn: async () => {
      return Promise.all(
        invoiceOrders.map(async (order) => {
          try {
            const response = await api.getUserOrderById(order._id);
            const details = response?.data || {};

            return {
              ...order,
              ...details,
              items: details.items || order.items || []
            };
          } catch (error) {
            console.error(
              `Unable to load details for order ${order.orderNo}`,
              error
            );

            return {
              ...order,
              items: order.items || []
            };
          }
        })
      );
    },
    retry: false
  });

  const loading = invoicesLoading || detailsLoading;

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'active') {
      return orders.filter(isOrderActive);
    }

    if (activeFilter === 'delivered') {
      return orders.filter(isOrderDelivered);
    }

    return orders;
  }, [orders, activeFilter]);

  const activeCount = orders.filter(isOrderActive).length;
  const deliveredCount = orders.filter(isOrderDelivered).length;

  const customerName =
    orders[0]?.user?.firstName ||
    orders[0]?.user?.lastName ||
    'CUSTOMER';

  const filters = [
    { value: 'all', label: `All ${orders.length}` },
    { value: 'active', label: `Active ${activeCount}` },
    { value: 'delivered', label: `Delivered ${deliveredCount}` }
  ];

  const handlePageChange = (_, page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`?${params.toString()}`);
  };

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          Unable to load your orders. Please try again.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        minWidth: 0,
        bgcolor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        height: compact ? '100%' : 'auto',
        minHeight: compact ? 0 : 'auto'
      }}
    >
      {/* Header */}
   

      {/* Scrollable content */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: compact ? 'auto' : 'visible',
          overscrollBehavior: 'contain'
        }}
      >
        {/* Activity summary */}
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2.5,
            borderTop: '1px solid #EEEEEE',
            borderBottom: '1px solid #EEEEEE',
            bgcolor: '#FCFBFA'
          }}
        >
          {loading ? (
            <Skeleton width="70%" height={55} />
          ) : (
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: '50%',
                  bgcolor: '#FAF0ED',
                  color: ACCENT,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Inventory2Outlined />
              </Box>

              <Box>
                <Typography fontWeight={700} fontSize={15}>
                  {activeCount} {activeCount === 1 ? 'order' : 'orders'} on the move
                </Typography>

                <Typography fontSize={13} color="text.secondary">
                  {activeCount
                    ? 'Your purchases are being prepared or delivered.'
                    : 'You have no active orders right now.'}
                </Typography>
              </Box>
            </Stack>
          )}
        </Box>

        {/* Tabs */}
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            borderBottom: '1px solid #EEEEEE'
          }}
        >
          <Tabs
            value={activeFilter}
            onChange={(_, value) => setActiveFilter(value)}
            variant="scrollable"
            scrollButtons={false}
            sx={{
              minHeight: 55,
              '& .MuiTab-root': {
                minHeight: 55,
                minWidth: 'auto',
                px: 1,
                mr: 2,
                textTransform: 'none',
                fontSize: 14,
                fontWeight: 600,
                color: '#777'
              },
              '& .Mui-selected': {
                color: '#222 !important'
              },
              '& .MuiTabs-indicator': {
                bgcolor: ACCENT,
                height: 2
              }
            }}
          >
            {filters.map((filter) => (
              <Tab
                key={filter.value}
                value={filter.value}
                label={filter.label}
              />
            ))}
          </Tabs>
        </Box>

        {/* Orders */}
        {loading ? (
          <Box sx={{ p: 3 }}>
            {[1, 2, 3].map((item) => (
              <Box key={item} sx={{ mb: 3 }}>
                <Skeleton width="45%" />
                <Skeleton width="70%" height={30} />
                <Skeleton height={90} />
              </Box>
            ))}
          </Box>
        ) : filteredOrders.length === 0 ? (
          <Box sx={{ py: 7, px: 3, textAlign: 'center' }}>
            <ShoppingBagOutlined
              sx={{ fontSize: 42, color: '#BBBBBB', mb: 1 }}
            />

            <Typography fontWeight={700}>
              No orders found
            </Typography>

            <Typography color="text.secondary" fontSize={13}>
              There are no orders in this category yet.
            </Typography>
          </Box>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))
        )}

        {!compact && !loading && Number(invoiceResponse?.count || 0) > 1 && (
          <Stack alignItems="center" sx={{ py: 3 }}>
            <Pagination
              count={Number(invoiceResponse.count)}
              page={Number(pageParam)}
              onChange={handlePageChange}
              color="primary"
            />
          </Stack>
        )}
      </Box>

      {/* Sticky bottom action for drawer */}
  
    </Box>
  );
}
