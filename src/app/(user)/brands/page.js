'use client';
import React from 'react';

// mui
import { Container, Stack } from '@mui/material';
import BrandsMain from '@/components/_main/brands';
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
export default function BrandPage() {
  return (
    <Container maxWidth="xl">
      <Stack gap={3}>
        <HeaderBreadcrumbs heading="All Brands" links={[{ name: 'Home', href: '/' }, { name: 'Brands' }]} />
        <BrandsMain />
      </Stack>
    </Container>
  );
}
