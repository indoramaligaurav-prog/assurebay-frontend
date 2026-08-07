import React from 'react';

// mui
import { Typography, Container, Stack } from '@mui/material';
// api

// components
import ProductsCarousel from '@/components/carousels/products-grid-slider';
export default function Index({ data, title, description, path }) {
  return (
    <Container maxWidth="xl" xs={{background:"#fff !important"}}>
      <Stack gap={3}>
        <Stack>
          <Typography sx={{
    fontSize: "30px",   // fixed size
    fontWeight: 800
  }} color="text.primary">
            {title}
          </Typography>
          <Typography  sx={{
    fontSize: "14px",   // fixed size
    color: "text.secondary"
  }} color="text.secondary">
            {description}
          </Typography>
        </Stack>

        {!Boolean(data.length) ? (
          <Typography sx={{
    fontSize: "30px",   // fixed size
    fontWeight: 600
  }} color="error.main" textAlign="center">
            Products not found
          </Typography>
        ) : (
          <ProductsCarousel data={data} query={path} />
        )}
      </Stack>
    </Container>
  );
}
