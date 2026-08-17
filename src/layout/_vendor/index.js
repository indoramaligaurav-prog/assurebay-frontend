'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'src/redux';
import { toggleSidebar } from 'src/redux/slices/settings';

// mui
import Box from '@mui/material/Box';

// components
import Sidebar from './sidebar';           // the real permanent mini-drawer (icon rail <-> full width)
import VendorTopbar from './vendor-topbar'; // logo + hamburger (mobile) + account dropdown

export default function MiniDrawer({ children, branding }) {
  const { openSidebar } = useSelector((state) => state.settings);
  const dispatch = useDispatch();

  const handleDrawerToggle = () => {
    dispatch(toggleSidebar());
  };

  return (
    // ROW layout: permanent sidebar on the left, header+content column on the right.
    // Sidebar reserves its own real width (73px collapsed / 240px expanded) since
    // it's a normal (non-fixed) box on desktop — no manual marginLeft needed.
    <Box sx={{ display: 'flex' }}>
      <Sidebar open={openSidebar} handleDrawerToggle={handleDrawerToggle} />

      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0, // prevents flex child from overflowing and pushing width beyond viewport
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1100,
            backgroundColor: '#fff',
          }}
        >
          <VendorTopbar branding={branding} onMenuClick={handleDrawerToggle} />
        </Box>

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

MiniDrawer.propTypes = {
  children: PropTypes.node.isRequired,
};