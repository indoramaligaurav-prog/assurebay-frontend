
'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import {
  Box,
  Avatar,
  Typography,
  Stack,
  Chip,
  Button,
  CircularProgress,
  List,
  ListItemButton,
  Divider,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { FiMessageCircle, FiLifeBuoy, FiArrowRight } from 'react-icons/fi';

import { getAssetUrl } from '@/utils/getAssetUrl';
import * as api from '@/services';

export default function QuoteChatsInbox({
  onSelectQuote,
  onClose,
  inDrawer = false,
}) {
  const router = useRouter();
  const { user } = useSelector((state) => state.user);

  const goTo = (path) => {
    onClose?.();
    router.push(path);
  };

  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;

    let mounted = true;

    const fetchQuotes = async () => {
      try {
        setLoading(true);

        const res = await api.getqoutbyuser(user._id);

        if (mounted) {
          setQuotes(res.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch quote conversations:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchQuotes();

    return () => {
      mounted = false;
    };
  }, [user?._id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

if (!quotes.length) {
  return (
    <Box>
      {/* Empty card */}
      <Box
        sx={{
          textAlign: 'center',
          py: 5,
          px: 3,
          bgcolor: '#f7f8f9',
          border: '1px solid #e8eaed',
          borderRadius: '14px',
        }}
      >
        <Box
          sx={{
            width: 76,
            height: 76,
            mx: 'auto',
            mb: 3,
            borderRadius: '18px',
            bgcolor: '#fdeee8',
            color: '#c74735',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FiMessageCircle size={30} />
        </Box>

        <Typography sx={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.4px', color: '#111' }}>
          No conversations yet
        </Typography>

        <Typography sx={{ mt: 1.5, fontSize: 14.5, lineHeight: 1.9, color: '#6b7280' }}>
          Seller conversations start from product pages. Once you contact a seller,
          you’ll find the conversation here.
        </Typography>

        <Button
          onClick={() => goTo('/products')}
          endIcon={<FiArrowRight size={18} />}
          sx={{
            mt: 3,
            px: 4,
            py: 1.5,
            borderRadius: '10px',
            bgcolor: '#c4503f',
            color: '#fff',
            fontSize: 15,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#a93f30', boxShadow: 'none' },
          }}
        >
          Browse products
        </Button>
      </Box>

      {/* Need help block */}
      <Stack direction="row" spacing={2.5} alignItems="flex-start" sx={{ mt: 4, px: 1 }}>
        <Box sx={{ color: '#6b7280', mt: 1.25 }}>
          <FiLifeBuoy size={26} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#111' }}>
            Need help from Wreeo?
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 14, color: '#6b7280' }}>
            For an order, a return or your account.
          </Typography>
          <Box
            onClick={() => goTo('/support')}
            sx={{
              mt: 1.5,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              fontSize: 14,
              color: '#c74735',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Go to support <FiArrowRight size={15} />
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}

  return (
    <Box>
      <Typography
        sx={{
          fontSize: 12,
          color: '#858b91',
          mb: 1.5,
        }}
      >
        Your seller conversations ({quotes.length})
      </Typography>

      <List disablePadding>
        {quotes.map((quote, index) => (
          <React.Fragment key={quote._id}>
            <ListItemButton
              onClick={() => onSelectQuote?.(quote)}
              sx={{
                px: 0,
                py: 1.8,
                alignItems: 'flex-start',
                gap: 1.5,
                '&:hover': {
                  bgcolor: '#fff8f5',
                },
              }}
            >
              <Avatar
                variant="rounded"
                src={getAssetUrl(
                  quote.product?.image ||
                  quote.product?.images?.[0]?.url
                )}
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: '#f0f1f2',
                  flexShrink: 0,
                }}
              >
                {quote.product?.title?.charAt(0) || 'P'}
              </Avatar>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#292f35',
                    }}
                    noWrap
                  >
                    {quote.product?.vendorName ||
                      quote.vendor?.name ||
                      'Seller'}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 10,
                      color: '#858b91',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {quote.createdAt
                      ? new Date(quote.createdAt).toLocaleDateString()
                      : ''}
                  </Typography>
                </Stack>

                <Typography
                  sx={{
                    mt: 0.3,
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#525b62',
                  }}
                  noWrap
                >
                  {quote.product?.title || 'Product enquiry'}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.4,
                    fontSize: 11,
                    color: '#858b91',
                  }}
                  noWrap
                >
                  Quantity: {quote.quantity}
                </Typography>

                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mt: 0.8 }}
                >
                  <Chip
                    label={quote.status || 'pending'}
                    size="small"
                    color={getStatusColor(quote.status)}
                    variant="outlined"
                    sx={{
                      height: 21,
                      fontSize: 10,
                      textTransform: 'capitalize',
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#c74735',
                    }}
                  >
                    Open chat →
                  </Typography>
                </Stack>
              </Box>
            </ListItemButton>

            {index !== quotes.length - 1 && (
              <Divider sx={{ borderColor: '#eeeeee' }} />
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
}
