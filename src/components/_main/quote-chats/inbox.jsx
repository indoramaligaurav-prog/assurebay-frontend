
'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import {
  Box,
  Avatar,
  Typography,
  Stack,
  Chip,
  CircularProgress,
  List,
  ListItemButton,
  Divider,
} from '@mui/material';

import { getAssetUrl } from '@/utils/getAssetUrl';
import * as api from '@/services';

export default function QuoteChatsInbox({
  onSelectQuote,
  inDrawer = false,
}) {
  const { user } = useSelector((state) => state.user);

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
      <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
        <Avatar
          sx={{
            width: 55,
            height: 55,
            mx: 'auto',
            mb: 2,
            bgcolor: '#fff2ee',
            color: '#c74735',
          }}
        >
          Q
        </Avatar>

        <Typography fontWeight={700} sx={{ color: '#292f35' }}>
          No conversations yet
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.7, fontSize: 12 }}
        >
          Your product quote conversations will appear here.
        </Typography>
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
