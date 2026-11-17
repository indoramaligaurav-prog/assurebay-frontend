'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Box,
  Button,
  Drawer,
  IconButton,
  Stack,
  Typography
} from '@mui/material';
import { HiOutlineClipboardDocumentList, HiXMark } from 'react-icons/hi2';
import InvoiceHistory from '@/components/_main/profile/invoice-history';

export default function OrdersDrawer() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleViewAll = () => {
    setOpen(false);
    router.push('/profile/orders');
  };

  return (
    <>
      {/* Navbar Orders Button */}
      <Typography
  component="button"
  type="button"
  onClick={() => setOpen(true)}
  sx={{
    border: 0,
    background: 'transparent',
    cursor: 'pointer',
    color: '#4a4240',
    p: 0,
    fontSize: 14,
    fontWeight: 400,
    fontFamily: 'inherit',
    textTransform: 'none',
    whiteSpace: 'nowrap',
    '&:hover': {
      color: '#c74735'
    }
  }}
>
  My orders
</Typography>

      {/* Right-side Orders Drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 520, md: 600 },
            maxWidth: '100%',
            p: 2
          }
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" fontWeight={600}>
            My Orders
          </Typography>

          <IconButton
            aria-label="Close orders drawer"
            onClick={() => setOpen(false)}
          >
            <HiXMark size={22} />
          </IconButton>
        </Stack>

        <Box sx={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
          <InvoiceHistory compact />
        </Box>

        <Button
          variant="contained"
          fullWidth
          onClick={handleViewAll}
          sx={{
            mt: 2,
            py: 1.2,
            bgcolor: '#c74735',
            '&:hover': { bgcolor: '#a93829' }
          }}
        >
          View All Orders
        </Button>
      </Drawer>
    </>
  );
}