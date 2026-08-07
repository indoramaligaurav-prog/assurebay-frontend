'use client';

import React from 'react';
import { Box, Stack, Typography, Button } from '@mui/material';
import DesktopMenuList from '@/components/lists/desktop-menu-list';

export default function CategorySidebar({ categories }) {
  return (
    <Box
      sx={{
        background: '#fff',
        width: 340,
        borderRadius: "8px",
        border: "1px solid #ccc",
        overflow: "hidden"
      }}
    >
      <DesktopMenuList data={categories} />

      <Stack
        spacing={1}
        sx={{
          p: 2,
          borderTop: "1px solid #ccc"
        }}
      >
        <Stack direction="row" justifyContent="space-between">
          <Typography fontSize={14}>New Arrivals</Typography>
          <Button size="small" variant="contained">New</Button>
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Typography fontSize={14}>Best Seller Products</Typography>
          <Button size="small" variant="contained" color="info">
            The Best
          </Button>
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Typography fontSize={14}>50% Sale Products</Typography>
          <Button size="small" variant="contained" color="error">
            -50%
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}