'use client';

import React, { useState } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  Typography
} from '@mui/material';

import { usePathname } from 'next/navigation';
import { MdMenu } from 'react-icons/md';

import AccountSidebar from './account-sidebar';

const pageDetails = {
  '/profile': {
    title: 'Overview',
    description: 'Manage your account and shopping activity.'
  },
  '/profile/orders': {
    title: 'My orders',
    description: 'View and manage your orders.'
  },
  '/profile/wishlist': {
    title: 'Your wishlist',
    description: 'Keep the things you want to come back to.'
  },
  '/profile/general': {
    title: 'Account settings',
    description: 'Manage your personal information.'
  },
  '/profile/change-password': {
    title: 'Change password',
    description: 'Keep your account secure.'
  },
  '/cart': {
    title: 'Your cart',
    description: 'Review your items before checkout.'
  }
};

export default function AccountDashboard({ children }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const page = pageDetails[pathname] || pageDetails['/profile'];

  return (
    <Box
      sx={{
        bgcolor: '#F6F8FA',
        minHeight: 'calc(100vh - 150px)',
        display: 'flex'
      }}
    >
      {/* Desktop sidebar */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          width: 224,
          flexShrink: 0,
          bgcolor: '#FFFFFF',
          borderRight: '1px solid #E2E8F0'
        }}
      >
        <Box sx={{ position: 'sticky', top: 0, p: '18px 12px' }}>
          <AccountSidebar />
        </Box>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          px: { xs: 2, sm: 3, lg: 4 },
          py: { xs: 2, md: 3 }
        }}
      >
        {/* Mobile heading and menu */}
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            alignItems: 'center',
            gap: 1.5,
            mb: 3
          }}
        >
          <IconButton
            aria-label="Open account menu"
            onClick={() => setMobileOpen(true)}
            sx={{
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0'
            }}
          >
            <MdMenu />
          </IconButton>

          <Box>
            <Typography fontWeight={700} color="#29333D">
              {page.title}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              My account
            </Typography>
          </Box>
        </Box>

        {/* Desktop page heading */}
        <Box sx={{ display: { xs: 'none', md: 'block' }, mb: 3 }}>
          <Typography
            sx={{
              fontSize: 12,
              color: '#718096',
              mb: 2
            }}
          >
            My Assuredbay &nbsp; › &nbsp; {page.title}
          </Typography>

          <Typography
            component="h1"
            sx={{
              fontSize: { xs: 25, md: 30 },
              lineHeight: 1.25,
              fontWeight: 750,
              letterSpacing: '-0.7px',
              color: '#29333D'
            }}
          >
            {page.title}
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: '#718096',
              fontSize: 13.5
            }}
          >
            {page.description}
          </Typography>
        </Box>

        {children}
      </Box>

      {/* Mobile navigation */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: 260,
            bgcolor: '#FFFFFF',
            p: 1.5
          }
        }}
      >
        <AccountSidebar onNavigate={() => setMobileOpen(false)} />
      </Drawer>
    </Box>
  );
}