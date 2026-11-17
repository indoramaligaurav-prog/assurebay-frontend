'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Grid,
  Stack,
  Typography
} from '@mui/material';

import {
  MdShoppingBag,
  MdFavoriteBorder,
  MdShoppingCart,
  MdPersonOutline,
  MdArrowForward
} from 'react-icons/md';

import { useSelector } from 'react-redux';

const quickLinks = [
  {
    title: 'My orders',
    description: 'Review your purchases and order status.',
    path: '/profile/orders',
    icon: <MdShoppingBag size={24} />
  },
  {
    title: 'My wishlist',
    description: 'Find products you have saved.',
    path: '/profile/wishlist',
    icon: <MdFavoriteBorder size={24} />
  },
  {
    title: 'My cart',
    description: 'Continue shopping with items in your cart.',
    path: '/cart',
    icon: <MdShoppingCart size={24} />
  },
  {
    title: 'Account settings',
    description: 'Update your personal information.',
    path: '/profile/general',
    icon: <MdPersonOutline size={24} />
  }
];

export default function AccountOverview() {
  const router = useRouter();
  const { user } = useSelector((state) => state.user);

  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.name ||
    'there';

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          p: { xs: 2.5, md: 3.5 },
          bgcolor: '#fff',
          border: '1px solid #E5EAF0',
          borderRadius: '16px'
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: 21, md: 25 },
            fontWeight: 750,
            color: '#29333D'
          }}
        >
          Welcome back, {name}!
        </Typography>

        <Typography sx={{ mt: 1, color: '#718096', fontSize: 14 }}>
          Manage your orders, saved products, and account details from one place.
        </Typography>

        <Button
          variant="contained"
          endIcon={<MdArrowForward />}
          onClick={() => router.push('/products')}
          sx={{
            mt: 2.5,
            px: 2.5,
            py: 1.1,
            borderRadius: '24px',
            textTransform: 'none',
            bgcolor: '#B94E37',
            '&:hover': { bgcolor: '#A6422D' }
          }}
        >
          Continue shopping
        </Button>
      </Box>

      <Box>
        <Typography
          sx={{
            mb: 2,
            fontSize: 18,
            fontWeight: 700,
            color: '#29333D'
          }}
        >
          Your account
        </Typography>

        <Grid container spacing={2}>
          {quickLinks.map((item) => (
            <Grid item xs={12} sm={6} key={item.title}>
              <Box
                onClick={() => router.push(item.path)}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  height: '100%',
                  p: 2.5,
                  bgcolor: '#fff',
                  border: '1px solid #E5EAF0',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s, transform 0.2s',
                  '&:hover': {
                    borderColor: '#B94E37',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 46,
                    height: 46,
                    flexShrink: 0,
                    bgcolor: '#FBEDE8',
                    color: '#B94E37',
                    borderRadius: '12px'
                  }}
                >
                  {item.icon}
                </Box>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography fontSize={15} fontWeight={700} color="#29333D">
                    {item.title}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.6,
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: '#718096'
                    }}
                  >
                    {item.description}
                  </Typography>
                </Box>

                <MdArrowForward size={19} color="#718096" />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Stack>
  );
}