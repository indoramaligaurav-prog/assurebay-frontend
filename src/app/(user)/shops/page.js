'use client';
import React from 'react';

// mui
import { Typography, Grid, Box, Stack, Container } from '@mui/material';

// components
import ShopCard from 'src/components/cards/shop';

// api
import * as api from 'src/services';
import { useQuery } from '@tanstack/react-query';
import Pagination from 'src/components/pagination';
import { useSearchParams } from 'next/navigation';
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';

export default function ShopComponent() {
  const searchParams = useSearchParams();
  const page = searchParams.get('page');
  const { data, isPending: isLoading } = useQuery({
    queryKey: ['get-shops-user', page],
    queryFn: () => api.getShops(page, 12)
  });
  const shops = data?.data;
  return (
    <Container maxWidth="xl">
      <Stack
        sx={{
          gap: 3
        }}
      >
        <HeaderBreadcrumbs heading="Shops" links={[{ name: 'Home', href: '/' }, { name: 'Shops' }]} />
        <Box>
          <Grid container spacing={2} justifyContent="start" alignItems="center" mb={3}>
            {(isLoading ? Array.from(new Array(12)) : shops).map((inner) => (
              <React.Fragment key={Math.random()}>
                <Grid size={{ lg: 3, md: 6, sm: 6, xs: 12 }}>
                  <ShopCard shop={inner} isLoading={isLoading} />
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
          {!isLoading && !Boolean(shops.length) && (
            <Typography variant="h3" color="error.main" mb={3} textAlign="center">
              Shop not found
            </Typography>
          )}
          <Pagination data={data} />
        </Box>
      </Stack>
    </Container>
  );
}
