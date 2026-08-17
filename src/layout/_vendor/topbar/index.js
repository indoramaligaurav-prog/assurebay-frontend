'use client';
import React from 'react';
import PropTypes from 'prop-types';

// mui
import {
  AppBar,
  Toolbar,
  Stack,
  IconButton,
  Box,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

// components
import Logo from '@/components/logo';
import UserSelect from '@/components/select/user-select';

// This is intentionally separate from src/layout/_main/navbar.
// That Navbar is shared with the public storefront (search bar,
// categories, promo banner, etc.) and we don't want to touch it
// or conditionally bloat it just for the vendor dashboard.
export default function VendorTopbar({ branding, onMenuClick }) {
  return (
    <AppBar
      position="static"
      sx={{
        boxShadow: 'none',
        bgcolor: '#fff',
        borderBottom: '1px solid #eee',
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <IconButton
            aria-label="open menu"
            onClick={onMenuClick}
            size="small"
            sx={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              display: { xs: 'inline-flex', md: 'none' }, // desktop uses the Sidebar's own Fab arrow
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          <Logo small branding={branding} />
        </Stack>

        <Box>
          <UserSelect />
        </Box>
      </Toolbar>
    </AppBar>
  );
}

VendorTopbar.propTypes = {
  onMenuClick: PropTypes.func.isRequired,
};