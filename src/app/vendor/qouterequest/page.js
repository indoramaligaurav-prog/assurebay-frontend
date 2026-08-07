'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

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
  Dialog ,
  DialogTitle ,
  DialogContent,
  DialogActions ,
  TextField 
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import MessageIcon from '@mui/icons-material/Message';
import {getAssetUrl} from '@/utils/getAssetUrl'

// components
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';

// api
import * as api from 'src/services';

/* ---------------- PREDEFINED MESSAGES ---------------- */
const VENDOR_ACTIONS = [
  { key: 'offer_price', label: 'Offer Price' },
  { key: 'reject_quote', label: 'Reject Quote' }
];


export default function QuoteRequest() {
  const { user } = useSelector((state) => state.user);

  const [quotes, setQuotes] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);

  const [openPriceDialog, setOpenPriceDialog] = useState(false);
const [offerPrice, setOfferPrice] = useState('');
const [shippingPolicy, setShippingPolicy] = useState(null);

const [shippingPrice, setShippingPrice] = useState('')


  /* ---------------- FETCH QUOTES ---------------- */
  useEffect(() => {
    if (!user?._id) return;

    api.getqoutbyvendor(user._id).then((res) => {
      setQuotes(res.data);
    });
  }, [user]);

  /* ---------------- OPEN CHAT ---------------- */
  const openChat = async (quote) => {
    setActiveChat(quote);

    const res = await api.getQuoteChat(quote._id);
    setChatMessages(res.messages || []);

      console.log('Fetching shipping policy for ID:', quote.product);

    if (quote.product?.shipping_policy) {
    try {
    
      const policyRes = await api.getShippingPolicyById(
        quote.product.shipping_policy
      );

      console.log('Fetched shipping policy:', policyRes.data.policy_type);
      if (policyRes?.success) {
        setShippingPolicy(policyRes.data);
      }
    } catch (err) {
      console.error('Shipping policy fetch error', err);
      setShippingPolicy(null);
    }
  } else {
    setShippingPolicy(null);
  }

  };

  /* ---------------- SEND MESSAGE ---------------- */
  const sendMessage = async (msg) => {
  await api.sendQuoteMessage({
    quoteId: activeChat._id,
    senderType: 'vendor',
    messageType: 'TEXT',
    messageText: msg.label
  });

  setChatMessages((prev) => [
    ...prev,
    {
      senderType: 'vendor',
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
  }, 3000); // every 3 seconds

  return () => clearInterval(interval);
}, [activeChat]);

const isShippingOnly =
  activeChat?.product?.pricingMode === 'declare' &&
  shippingPolicy?.policy_type === 'FREIGHT';



  return (
    <Box>
      <HeaderBreadcrumbs
        admin
        heading="Quote Request List"
        links={[
          { name: 'Dashboard', href: '/vendor/dashboard' },
          { name: 'Quote Request List' }
        ]}
      />

      {/* ---------------- TABLE ---------------- */}
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Buyer</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Chat</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {quotes.map((q) => (
              <TableRow key={q._id}>
                <TableCell>
                  <Typography fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }} >
                  
                 <img
                    src={getAssetUrl(q.product?.image)}
                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
                    />

                    {q.product?.title}

                  </Typography>
                </TableCell>

                <TableCell>{q.templateKey}</TableCell>

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
                src={activeChat.product?.images?.[0]?.url}
                variant="rounded"
                sx={{ width: 48, height: 48 }}
              />

              <Box flex={1}>
                <Typography fontWeight={600}>
                  {activeChat.product?.title}
                </Typography>
                <Typography variant="caption">
                  Buyer: {activeChat.buyerKey}
                </Typography>
              </Box>

              <IconButton onClick={() => setActiveChat(null)}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* CHAT BODY */}
            <Box flex={1} p={2} overflow="auto">
              <Stack spacing={1}>
                {/* Initial system message */}
                <Paper sx={{ p: 1.2, maxWidth: '75%' }}>
                  <Typography variant="body2">
                    Quote request received for {activeChat.quantity} units.
                  </Typography>
                </Paper>

                {chatMessages.map((msg, i) => (
                  <Box
                    key={i}
                    display="flex"
                    justifyContent={
                      msg.senderType === 'vendor'
                        ? 'flex-end'
                        : 'flex-start'
                    }
                  >
                    <Paper
                      sx={{
                        p: 1.2,
                        maxWidth: '75%',
                        bgcolor:
                          msg.senderType === 'vendor'
                            ? 'primary.main'
                            : '#f1f1f1',
                        color:
                          msg.senderType === 'vendor'
                            ? '#fff'
                            : '#000'
                      }}
                    >
                      <Typography variant="body2">
                        {msg.messageText}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* FOOTER */}
            <Box p={2} borderTop="1px solid #eee">
              <Stack spacing={1}>
                {VENDOR_ACTIONS
  .filter(action => {
  if (action.key === 'offer_price') {
    const pricingMode = activeChat?.product?.pricingMode;
    const policyType = shippingPolicy?.policy_type;

    return (
      pricingMode === 'quote' ||
      (pricingMode === 'declare' && policyType === 'FREIGHT')
    );
  }
  return true;
})

  .map((action) => (
                  <Button
                    key={action.key}
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      if (action.key === 'offer_price') {
                        setOpenPriceDialog(true);
                      }

                      if (action.key === 'reject_quote') {
                        sendRejectMessage();
                      }
                    }}
                  >
                    {action.label}
                  </Button>
                ))}

              </Stack>
            </Box>
          </Box>
        )}
      </Drawer>
      <Dialog open={openPriceDialog} onClose={() => setOpenPriceDialog(false)}>
  <DialogTitle>
  {isShippingOnly ? 'Offer Shipping Charges' : 'Offer Price'}
</DialogTitle>


<DialogContent>
  {/* PRICE INPUT */}
  {!isShippingOnly && (
    <TextField
      label="Price per unit"
      type="number"
      fullWidth
      margin="dense"
      value={offerPrice}
      onChange={(e) => setOfferPrice(e.target.value)}
    />
  )}

  {/* SHIPPING INPUT */}
  {shippingPolicy?.policy_type === 'FREIGHT' && (
    <>
      <TextField
        label={`Shipping charges (Pincode: ${activeChat?.deliveryLocation?.pincode})`}
        type="number"
        fullWidth
        margin="dense"
        value={shippingPrice}
        onChange={(e) => setShippingPrice(e.target.value)}
      />

      <Typography variant="caption" color="text.secondary">
        Vendor-defined shipping charges based on delivery pincode
      </Typography>
    </>
  )}
</DialogContent>



  <DialogActions>
    <Button onClick={() => setOpenPriceDialog(false)}>
      Cancel
    </Button>

    <Button
      variant="contained"
      disabled={
          (!isShippingOnly && !offerPrice) ||
          (shippingPolicy?.policy_type === 'FREIGHT' && !shippingPrice)
        }
     onClick={async () => {
  const pricingMode = activeChat.product?.pricingMode;
  const policyType = shippingPolicy?.policy_type;
  const pincode = activeChat.deliveryLocation?.pincode;

  let messageText = '';
  let payload = {};

  const freight = activeChat.freightType || 'FREIGHT';

  /* ---------------- DECLARE + FREIGHT ---------------- */
  if (pricingMode === 'declare' && policyType === 'FREIGHT') {
    messageText = `Shipping ₹${shippingPrice} for pincode ${pincode} via ${freight}`;

    payload = {
      shippingType: 'FREIGHT',
      shippingPolicy: shippingPolicy._id,
      pincode,
      shippingPrice: Number(shippingPrice)
    };
  }

  /* ---------------- QUOTE + NON-FREIGHT ---------------- */
  else if (pricingMode === 'quote' && policyType !== 'FREIGHT') {
    messageText = `₹${offerPrice} per unit`;

    payload = {
      price: Number(offerPrice)
    };
  }

  /* ---------------- QUOTE + FREIGHT ---------------- */
  else if (pricingMode === 'quote' && policyType === 'FREIGHT') {
    messageText = `₹${offerPrice} per unit + Shipping ₹${shippingPrice} for pincode ${pincode} via ${freight}`;

    payload = {
      price: Number(offerPrice),
      shippingType: 'FREIGHT',
      shippingPolicy: shippingPolicy._id,
      pincode,
      shippingPrice: Number(shippingPrice)
    };
  }

  await api.sendQuoteMessage({
    quoteId: activeChat._id,
    senderType: 'vendor',
    messageType: 'PRICE_OFFER',
    messageText,
    payload
  });

  setOpenPriceDialog(false);
  setOfferPrice('');
  setShippingPrice('');
}}



    >
      Send Offer
    </Button>
  </DialogActions>
</Dialog>

    </Box>
  );
}
