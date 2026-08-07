'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { addCart } from 'src/redux/slices/product';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';




// MUI
import {
  Box,
  Drawer,
  Avatar,
  Typography,
  IconButton,
  Stack,
  Button,
  Paper,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Container
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import MessageIcon from '@mui/icons-material/Message';

// utils & components
import { getAssetUrl } from '@/utils/getAssetUrl';
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';

// api
import * as api from '@/services';

/* ---------------- PREDEFINED MESSAGES (USER SIDE) ---------------- */
const PREDEFINED_MESSAGES = [
  { key: 'price_request', label: 'Can you share your best price?' },
  { key: 'delivery_time', label: 'What is the expected delivery time?' },
  { key: 'bulk_discount', label: 'Is bulk discount available?' },
  { key: 'availability', label: 'Is this item available in stock?' }
];

export default function QuoteRequestUser() {
  const { user } = useSelector((state) => state.user);

  const [quotes, setQuotes] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);

  const dispatch = useDispatch();


const acceptPrice = async (payload) => {
  const {
    price: quotedPrice,
    shippingPrice = 0,
    shippingType
  } = payload || {};

  const quantity = activeChat.quantity;
  const mrp = Number(activeChat.product.mrp || 0);

  let unitPrice = 0;
  let subtotal = 0;
  let pricingSource = '';

  if (!activeChat?.product?.vendor || !activeChat?.product?.shipping_policy) {
    toast.error('Shipping or vendor data missing. Please refresh.');
    return;
  }


  /* ---------------- CASE A ---------------- */
  // DECLARE PRICE + FREIGHT
  if (!quotedPrice && shippingType === 'FREIGHT') {
    unitPrice = mrp;
    subtotal = (mrp * quantity) + shippingPrice;
    pricingSource = 'DECLARED_MRP + FREIGHT';
  }

  /* ---------------- CASE B ---------------- */
  // QUOTE PRICE ONLY
  else if (quotedPrice && !shippingType) {
    unitPrice = quotedPrice;
    subtotal = quotedPrice * quantity;
    pricingSource = 'QUOTE_ONLY';
  }

  /* ---------------- CASE C ---------------- */
  // QUOTE PRICE + FREIGHT
  else if (quotedPrice && shippingType === 'FREIGHT') {
    unitPrice = quotedPrice;
    subtotal = (quotedPrice * quantity) + shippingPrice;
    pricingSource = 'QUOTE + FREIGHT';
  }

  await api.sendQuoteMessage({
    quoteId: activeChat._id,
    senderType: 'buyer',
    messageType: 'PRICE_ACCEPTED',
    messageText: 'Price accepted'
  });

  dispatch(addCart({  
  pid: activeChat.product._id,
  sku: activeChat.product._id,
  name: activeChat.product.title,

  quantity,               // 🔒 accepted qty
  price: unitPrice,
  shipping: shippingPrice,
  subtotal,
   image: getAssetUrl(
    activeChat.product?.images?.[0]?.url ||
    activeChat.product?.image ||
    ''
  ),

  isQuoted: true,         // 🔥 NEW
  quoteId: activeChat._id,
  acceptedQty: quantity,  // 🔒 reference

    vendorid: activeChat.product.vendor,
   shippingPolicyId:activeChat.product.shipping_policy 
}));

  toast.success('Added to cart at quoted price');
};


const rejectPrice = async () => {
  await api.sendQuoteMessage({
    quoteId: activeChat._id,
    senderType: 'buyer',
    messageType: 'PRICE_REJECTED',
    messageText: 'Price rejected'
  });

  toast('Quote rejected');
};

const alreadyAccepted = chatMessages.some(
  m => m.messageType === 'PRICE_ACCEPTED'
);


  /* ---------------- FETCH USER QUOTES ---------------- */
  useEffect(() => {
    if (!user?._id) return;

    api.getqoutbyuser(user._id).then((res) => {
      setQuotes(res.data || []);
    });
  }, [user]);

  /* ---------------- OPEN CHAT ---------------- */
  const openChat = async (quote) => {
    const res = await api.getQuoteChat(quote._id);

        setActiveChat({
    ...quote,
        product: {
          ...quote.product,
          vendor: quote.product.vendor,
          shipping_policy: quote.product.shipping_policy
        }
      });


    setChatMessages(res.messages || []);
  };

  /* ---------------- SEND MESSAGE ---------------- */
  const sendMessage = async (msg) => {
  await api.sendQuoteMessage({
    quoteId: activeChat._id,
    senderType: 'buyer',
    messageType: 'TEXT',
    messageText: msg.label
  });

  // optimistic update
  setChatMessages((prev) => [
    ...prev,
    {
      senderType: 'buyer',
      messageType: 'TEXT',
      messageText: msg.label,
      createdAt: new Date()
    }
  ]);
};


  useEffect(() => {
  if (!activeChat?._id) return;

  const interval = setInterval(async () => {
    try {
      const res = await api.getQuoteChat(activeChat._id);
      setChatMessages(res.messages || []);
    } catch (err) {
      console.error(err);
    }
  }, 3000);

  return () => clearInterval(interval);
}, [activeChat]);


  return (
    <Box>
      <Box sx={{ bgcolor: 'background.default' }}>
        <Container maxWidth="xl">
          <HeaderBreadcrumbs
            heading="Quote Request"
            links={[
              { name: 'Home', href: '/' },
              { name: 'Quote Request' }
            ]}
          />

          {/* ---------------- TABLE ---------------- */}
          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Chat</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {quotes.map((q) => (
                  <TableRow key={q._id}>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <img
                          src={getAssetUrl(q.product?.image)}
                          style={{
                            width: 60,
                            height: 60,
                            objectFit: 'cover',
                            borderRadius: 8
                          }}
                        />
                        <Typography fontWeight={600}>
                          {q.product?.title}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>{q.quantity}</TableCell>

                    <TableCell>
                      <Chip
                        label={q.status}
                        size="small"
                        color={
                          q.status === 'pending'
                            ? 'warning'
                            : q.status === 'accepted'
                            ? 'success'
                            : 'default'
                        }
                      />
                    </TableCell>

                    <TableCell align="center">
                      <IconButton onClick={() => openChat(q)}>
                        <MessageIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </Box>

      {/* ---------------- CHAT DRAWER ---------------- */}
      <Drawer
        anchor="right"
        open={Boolean(activeChat)}
        onClose={() => setActiveChat(null)}
        PaperProps={{ sx: { width: 400 } }}
      >
        {activeChat && (
          <Box display="flex" flexDirection="column" height="100%">
            {/* HEADER */}
            <Box
              p={2}
              display="flex"
              alignItems="center"
              gap={2}
              borderBottom="1px solid #eee"
            >
              <Avatar
                src={getAssetUrl(activeChat.product?.image)}
                variant="rounded"
                sx={{ width: 48, height: 48 }}
              />

              <Box flex={1}>
                <Typography fontWeight={600}>
                  {activeChat.product?.title}
                </Typography>
                <Typography variant="caption">
                  Quantity: {activeChat.quantity}
                </Typography>
              </Box>

              <IconButton onClick={() => setActiveChat(null)}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* CHAT BODY */}
            <Box flex={1} p={2} overflow="auto">
              <Stack spacing={1}>
                <Paper sx={{ p: 1.2, maxWidth: '75%' }}>
                  <Typography variant="body2">
                    You requested a quote for {activeChat.quantity} units.
                  </Typography>
                </Paper>

                {chatMessages.map((msg, i) => {
  const isBuyer = msg.senderType === 'buyer';

  return (
    <Box
      key={i}
      display="flex"
      justifyContent={isBuyer ? 'flex-end' : 'flex-start'}
    >
      <Paper
        sx={{
          p: 1.2,
          maxWidth: '75%',
          bgcolor: isBuyer ? 'primary.main' : '#f1f1f1',
          color: isBuyer ? '#fff' : '#000'
        }}
      >
        {msg.messageType === 'PRICE_OFFER' ? (
          <Stack spacing={1}>
            <Typography variant="body2">
  {msg.messageText}
</Typography>

{msg.payload?.shippingPrice && (
  <Typography variant="caption" color="text.secondary">
    Shipping: ₹{msg.payload.shippingPrice}
  </Typography>
)}


           {!alreadyAccepted && ( <Button
              size="small"
              variant="contained"
              onClick={() => acceptPrice(msg.payload)}
            >
              Accept & Add to Cart
            </Button>
            )}
            <Button
              size="small"
              variant="outlined"
              onClick={rejectPrice}
            >
              Reject
            </Button>
          </Stack>
        ) : (
          <Typography variant="body2">
            {msg.messageText}
          </Typography>
        )}
      </Paper>
    </Box>
  );
})}

              </Stack>
            </Box>

            {/* FOOTER */}
            <Box p={2} borderTop="1px solid #eee">
              <Stack spacing={1}>
                {PREDEFINED_MESSAGES.map((msg) => (
                  <Button
                    key={msg.key}
                    variant="outlined"
                    fullWidth
                    onClick={() => sendMessage(msg)}
                  >
                    {msg.label}
                  </Button>
                ))}
              </Stack>
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}
