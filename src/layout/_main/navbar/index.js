'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import {
  Toolbar, Stack, AppBar, useMediaQuery,
  Container, Box, Typography, Button,
  Link, Select, MenuItem, TextField,
} from '@mui/material';
import { FaSearch } from 'react-icons/fa';

// components
import Logo from '@/components/logo';
import SellerWidget from '@/components/widgets/seller';
import WishlistWidget from '@/components/widgets/wishlist';
import CartWidget from '@/components/widgets/cart';
import UserSelect from '@/components/select/user-select';
import ShippingCurrencyDialog from '@/components/dialog/Shippingcurrencydialog';
import { useDispatch } from '@/redux';
import { setCurrency } from '@/redux/slices/currency';

// data + hooks
import countries from '@/data/countries.json';
import { useGeoPrefs } from '@/hooks/useGeoPrefs';

const MobileBar = dynamic(() => import('@/layout/_main/mobile-bar'));

export default function Navbar({ branding, categories = [] }) {
  const { checkout } = useSelector(({ product }) => product);
  const isMobile = useMediaQuery('(max-width:992px)');

  const [category, setCategory] = React.useState('all');
  const [keyword, setKeyword] = React.useState('');

  // ── geo-aware prefs ────────────────────────────────────────────────────────
  const { prefs, loading: detecting, savePrefs } = useGeoPrefs(countries);

  // ── dialog ─────────────────────────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const dispatch = useDispatch();

  const handleDialogClose = (result) => {
    setDialogOpen(false);
    if (result) {
    savePrefs({ currency: result.currency });
    dispatch(setCurrency(result.currency));
    }
  };

  const handleSearch = () => {
    if (!keyword) return;
    window.location.href = `/products?search=${keyword}&category=${category}`;
  };

  // Trigger button label: show flag + currency once resolved
  const currencyLabel = prefs?.currency ?? '···';

  return (
    <>
      <Box>
        {/* 🔵 TOP BAR */}
        <Box sx={{ color: 'black', py: '6px', px: '10px', textAlign: 'center', fontSize: '13px' }}>
          <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} flexWrap="wrap">
            <Typography sx={{ fontSize: '13px' }}>
              FREE delivery & 40% Discount for next 3 orders! Place your 1st order in.
            </Typography>
            <Button
              variant="contained"
              sx={{
                fontSize: '12px !important', backgroundColor: '#000', color: '#fff',
                textTransform: 'none', borderRadius: '6px', px: '10px', py: '2px',
                height: '28px !important', '&:hover': { backgroundColor: '#333' },
              }}
            >
              Shop Now
            </Button>
          </Stack>
        </Box>

        {/* ⚪ SECONDARY BAR */}
        <Box
          sx={{
            backgroundColor: '#fff', px: '20px', py: '8px',
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', flexWrap: 'wrap',
          }}
        >
          {/* LEFT LINKS */}
          <Stack direction="row" spacing={3}>
            {['FAQ', 'About Us', 'Help & Contact'].map((item) => (
              <Link key={item} href="#" underline="none" sx={{ fontSize: '13px', color: '#333' }}>
                {item}
              </Link>
            ))}
          </Stack>

          {/* RIGHT */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Link href="#" underline="none" sx={{ fontSize: '13px', color: '#333' }}>
              Order Tracking
            </Link>

            {/* Language */}
            <Select
              defaultValue="English"
              variant="standard"
              disableUnderline
              sx={{
                fontSize: '13px',
                '&:before, &:after': { display: 'none' },
                '& .MuiSelect-select': { paddingRight: '20px !important' },
              }}
            >
              <MenuItem value="English">English</MenuItem>
              <MenuItem value="Hindi">Hindi</MenuItem>
            </Select>

            {/* ── CURRENCY / SHIPPING TRIGGER ───────────────────────────── */}
            <Box
              onClick={() => setDialogOpen(true)}
              sx={{
                display: 'flex', alignItems: 'center', gap: '5px',
                fontSize: '13px', color: '#333',
                cursor: 'pointer', userSelect: 'none',
                px: '8px', py: '3px',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                transition: 'all .15s',
                '&:hover': { borderColor: '#c7d96a', color: '#6b7534', backgroundColor: '#f7fae5' },
              }}
            >
          

              {/* spinning dots while detecting */}
              {detecting && (
                <Box
                  component="span"
                  sx={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: '2px solid #e5e7eb',
                    borderTopColor: '#c7d96a',
                    animation: 'spin .7s linear infinite',
                    '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
                    display: 'inline-block',
                  }}
                />
              )}

              <span>{currencyLabel}</span>

              {/* chevron */}
              <svg width="9" height="5" viewBox="0 0 9 5" fill="none" style={{ opacity: 0.45 }}>
                <path d="M1 1l3.5 3L8 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Box>

            <UserSelect />
          </Stack>
        </Box>
      </Box>

      {/* 🟢 MAIN NAVBAR */}
      <AppBar
        position="sticky"
        sx={{ boxShadow: 'none', bgcolor: '#fff', fontSize: '14px', borderTop: '1px solid #eee' }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5 }}>

            {/* LEFT */}
            <Stack direction="row" spacing={3} alignItems="center">
              <Logo branding={branding} />
            </Stack>

            {/* 🔍 SEARCH BAR */}
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, width: '50%' }}>
              <Box sx={{ flex: 1, mx: 4 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  sx={{
                    border: '1px solid #e5e7eb', borderRadius: '50px',
                    overflow: 'hidden', backgroundColor: '#fff', height: 48,
                  }}
                >
                  <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    variant="standard"
                    disableUnderline
                    sx={{
                      px: 2, minWidth: 140, fontSize: '14px',
                      borderRight: '1px solid #eee',
                      '& .MuiSelect-select': { display: 'flex', alignItems: 'center' },
                    }}
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    {categories?.map((cat) => (
                      <MenuItem key={cat._id} value={cat.slug}>{cat.name}</MenuItem>
                    ))}
                  </Select>

                  <TextField
                    fullWidth
                    placeholder="Search for products..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    variant="standard"
                    InputProps={{ disableUnderline: true }}
                    sx={{ px: 2, fontSize: '14px' }}
                  />

                  <Box sx={{ pr: 0.3 }}>
                    <Button
                      onClick={handleSearch}
                      sx={{
                        minWidth: 40, height: 40, borderRadius: '50%',
                        backgroundColor: '#c7d96a', color: '#000',
                        '&:hover': { backgroundColor: '#b5c85a' },
                      }}
                    >
                      <FaSearch size={16} />
                    </Button>
                  </Box>
                </Stack>
              </Box>
            </Box>

            {/* RIGHT */}
            <Stack direction="row" spacing={2} alignItems="center" sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <SellerWidget />
              <WishlistWidget />
              <CartWidget checkout={checkout} />
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {isMobile && <MobileBar />}

      {/* ── DIALOG ─────────────────────────────────────────────────────────── */}
   <ShippingCurrencyDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        initialPrefs={prefs}
        detecting={detecting}
      />
    </>
  );
}