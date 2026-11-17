
'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Avatar,
  Typography,
  Stack,
  Paper,
  Button,
  Divider,
  CircularProgress,
} from '@mui/material';

import { FiSend } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

import { addCart } from 'src/redux/slices/product';
import * as api from '@/services';
import { getAssetUrl } from '@/utils/getAssetUrl';

const PREDEFINED_MESSAGES = [
  { key: 'price_request', label: 'Can you share your best price?' },
  { key: 'delivery_time', label: 'What is the expected delivery time?' },
  { key: 'bulk_discount', label: 'Is bulk discount available?' },
  { key: 'availability', label: 'Is this item available in stock?' },
];

export default function QuoteConversation({
  quote,
  inDrawer = false,
}) {
  const dispatch = useDispatch();

  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [accepting, setAccepting] = useState(false);

  const activeQuoteId = quote?._id;

  const alreadyAccepted = chatMessages.some(
    (message) => message.messageType === 'PRICE_ACCEPTED'
  );

  // Fetch conversation
  useEffect(() => {
    if (!activeQuoteId) return;

    let mounted = true;

    const fetchMessages = async () => {
      try {
        const res = await api.getQuoteChat(activeQuoteId);

        if (mounted) {
          setChatMessages(res.messages || []);
        }
      } catch (error) {
        console.error('Failed to fetch quote chat:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchMessages();

    const interval = setInterval(fetchMessages, 3000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [activeQuoteId]);

  // Send message
  const sendMessage = async (msg) => {
    if (sending) return;

    try {
      setSending(true);

      await api.sendQuoteMessage({
        quoteId: activeQuoteId,
        senderType: 'buyer',
        messageType: 'TEXT',
        messageText: msg.label,
      });

      setChatMessages((prev) => [
        ...prev,
        {
          senderType: 'buyer',
          messageType: 'TEXT',
          messageText: msg.label,
          createdAt: new Date(),
        },
      ]);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to send message'
      );
    } finally {
      setSending(false);
    }
  };

  // Accept seller price
  const acceptPrice = async (payload) => {
    if (accepting || alreadyAccepted) return;

    try {
      setAccepting(true);

      const {
        price: quotedPrice,
        shippingPrice = 0,
        shippingType,
      } = payload || {};

      const quantity = quote.quantity;
      const mrp = Number(quote.product?.mrp || 0);

      let unitPrice = 0;
      let subtotal = 0;

      if (!quote.product?.vendor || !quote.product?.shipping_policy) {
        toast.error(
          'Shipping or vendor data missing. Please refresh.'
        );
        return;
      }

      // Case A: Declared price + freight
      if (!quotedPrice && shippingType === 'FREIGHT') {
        unitPrice = mrp;
        subtotal = mrp * quantity + shippingPrice;
      }

      // Case B: Quote price only
      else if (quotedPrice && !shippingType) {
        unitPrice = quotedPrice;
        subtotal = quotedPrice * quantity;
      }

      // Case C: Quote price + freight
      else if (quotedPrice && shippingType === 'FREIGHT') {
        unitPrice = quotedPrice;
        subtotal = quotedPrice * quantity + shippingPrice;
      } else {
        toast.error('Invalid quote pricing details.');
        return;
      }

      await api.sendQuoteMessage({
        quoteId: activeQuoteId,
        senderType: 'buyer',
        messageType: 'PRICE_ACCEPTED',
        messageText: 'Price accepted',
      });

      dispatch(
        addCart({
          pid: quote.product._id,
          sku: quote.product._id,
          name: quote.product.title,
          quantity,
          price: unitPrice,
          shipping: shippingPrice,
          subtotal,
          image: getAssetUrl(
            quote.product?.images?.[0]?.url ||
            quote.product?.image ||
            ''
          ),
          isQuoted: true,
          quoteId: activeQuoteId,
          acceptedQty: quantity,
          vendorid: quote.product.vendor,
          shippingPolicyId: quote.product.shipping_policy,
        })
      );

      setChatMessages((prev) => [
        ...prev,
        {
          senderType: 'buyer',
          messageType: 'PRICE_ACCEPTED',
          messageText: 'Price accepted',
          createdAt: new Date(),
        },
      ]);

      toast.success('Added to cart at quoted price');
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Could not accept the quote'
      );
    } finally {
      setAccepting(false);
    }
  };

  // Reject seller price
  const rejectPrice = async () => {
    try {
      await api.sendQuoteMessage({
        quoteId: activeQuoteId,
        senderType: 'buyer',
        messageType: 'PRICE_REJECTED',
        messageText: 'Price rejected',
      });

      setChatMessages((prev) => [
        ...prev,
        {
          senderType: 'buyer',
          messageType: 'PRICE_REJECTED',
          messageText: 'Price rejected',
          createdAt: new Date(),
        },
      ]);

      toast('Quote rejected');
    } catch (error) {
      toast.error('Could not reject the quote');
    }
  };

  const formatTime = (date) => {
    if (!date) return '';

    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
      }}
    >
      {/* Product information */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          mb: 2,
          border: '1px solid #eeeeee',
          borderRadius: '12px',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            variant="rounded"
            src={getAssetUrl(
              quote.product?.image ||
              quote.product?.images?.[0]?.url
            )}
            sx={{
              width: 55,
              height: 55,
              borderRadius: '9px',
              bgcolor: '#f5f5f5',
            }}
          />

          <Box flex={1} minWidth={0}>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                color: '#292f35',
              }}
              noWrap
            >
              {quote.product?.title}
            </Typography>

            <Typography
              sx={{
                fontSize: 11,
                color: '#858b91',
                mt: 0.4,
              }}
            >
              Quantity: {quote.quantity}
            </Typography>

            <Typography
              sx={{
                fontSize: 11,
                color: '#858b91',
              }}
            >
              Quote status: {quote.status}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Chat messages */}
      <Box sx={{ flex: 1 }}>
        <Stack spacing={1.5}>
          {/* Initial quote message */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                maxWidth: '85%',
                bgcolor: '#f3f4f5',
                borderRadius: '12px 12px 12px 3px',
              }}
            >
              <Typography sx={{ fontSize: 12, color: '#292f35' }}>
                You requested a quote for {quote.quantity} units.
              </Typography>
            </Paper>
          </Box>

          {chatMessages.map((msg, index) => {
            const isBuyer = msg.senderType === 'buyer';

            return (
              <Box
                key={msg._id || index}
                sx={{
                  display: 'flex',
                  justifyContent: isBuyer ? 'flex-end' : 'flex-start',
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    maxWidth: '85%',
                    bgcolor: isBuyer ? '#c74735' : '#f3f4f5',
                    color: isBuyer ? '#fff' : '#292f35',
                    borderRadius: isBuyer
                      ? '12px 12px 3px 12px'
                      : '12px 12px 12px 3px',
                  }}
                >
                  {msg.messageType === 'PRICE_OFFER' ? (
                    <Stack spacing={1}>
                      <Typography sx={{ fontSize: 12 }}>
                        {msg.messageText}
                      </Typography>

                      {msg.payload?.shippingPrice > 0 && (
                        <Typography sx={{ fontSize: 11, opacity: 0.8 }}>
                          Shipping: ₹{msg.payload.shippingPrice}
                        </Typography>
                      )}

                      {!alreadyAccepted && (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            disabled={accepting}
                            onClick={() => acceptPrice(msg.payload)}
                            sx={{
                              bgcolor: '#fff',
                              color: '#c74735',
                              textTransform: 'none',
                              fontSize: 11,
                              '&:hover': {
                                bgcolor: '#f8eeee',
                              },
                            }}
                          >
                            {accepting ? 'Processing...' : 'Accept & Add to Cart'}
                          </Button>

                          <Button
                            size="small"
                            variant="outlined"
                            onClick={rejectPrice}
                            sx={{
                              color: '#c74735',
                              borderColor: '#c74735',
                              textTransform: 'none',
                              fontSize: 11,
                            }}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </Stack>
                  ) : (
                    <Typography sx={{ fontSize: 12 }}>
                      {msg.messageText}
                    </Typography>
                  )}

                  <Typography
                    sx={{
                      display: 'block',
                      mt: 0.7,
                      fontSize: 9,
                      opacity: 0.7,
                      textAlign: 'right',
                    }}
                  >
                    {isBuyer ? 'You' : 'Seller'} · {formatTime(msg.createdAt)}
                  </Typography>
                </Paper>
              </Box>
            );
          })}
        </Stack>
      </Box>

      {/* Quick messages */}
      <Box
        sx={{
          mt: 3,
          pt: 2,
          borderTop: '1px solid #eeeeee',
        }}
      >
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 700,
            color: '#292f35',
            mb: 1.5,
          }}
        >
          Quick messages
        </Typography>

        <Stack spacing={1}>
          {PREDEFINED_MESSAGES.map((msg) => (
            <Button
              key={msg.key}
              variant="outlined"
              fullWidth
              disabled={sending}
              onClick={() => sendMessage(msg)}
              sx={{
                justifyContent: 'flex-start',
                minHeight: 38,
                borderRadius: '9px',
                borderColor: '#eeeeee',
                color: '#555e65',
                fontSize: 11,
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#c74735',
                  bgcolor: '#fff8f5',
                },
              }}
            >
              {msg.label}
            </Button>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
