import React from 'react';
// mui
import { Container, Stack } from '@mui/material';
import ShopMain from '@/components/_main/shop';
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';

export default function Page() {
  return (
    <Container maxWidth="xl">
      <Stack gap={3}>
        <HeaderBreadcrumbs heading="Create a shop" links={[{ name: 'Home', href: '/' }, { name: 'Create shop' }]} />
        <ShopMain />
      </Stack>
    </Container>
  );
}
