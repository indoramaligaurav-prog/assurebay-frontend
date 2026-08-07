'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'src/redux';
import { toggleSidebar } from 'src/redux/slices/settings';

// mui
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';

// components
import DashboardAppbar from './topbar';
import Navbar from 'src/layout/_main/navbar';

const MAIN_NAVBAR_HEIGHT = 130; // 👈 top bar (~40px) + main navbar (~90px), adjust if needed

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar
}));

export default function MiniDrawer({ children, branding, categories }) {
  const { openSidebar } = useSelector((state) => state.settings);
  const dispatch = useDispatch();

  const handleDrawerToggle = () => {
    dispatch(toggleSidebar());
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>

      {/* 👇 Wrap BOTH navbars in one sticky container */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          backgroundColor: '#fff',
        }}
      >
        <Navbar branding={branding} categories={categories} />
        <DashboardAppbar
          branding={branding}
          open={openSidebar}
          handleDrawerToggle={handleDrawerToggle}
        />
      </Box>

      {/* Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>

    </Box>
  );
}
MiniDrawer.propTypes = {
  children: PropTypes.node.isRequired,
  categories: PropTypes.array
};