'use client';
// react
import React from 'react';
import Link from 'next/link';

// mui
import { Typography, Grid, Stack, Button, Box, Container } from '@mui/material';
// icons
import { IoArrowForward } from 'react-icons/io5';
// component
import ShopCard from 'src/components/cards/shop';

export default function ShopComponent({ data }) {
  return (
    <Container maxWidth="xl">
      <Stack gap={3}>
        <Stack>
          <Typography variant="h2" color="text.primary">
            Best Shops
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Our Highest Rated Shops Where You Can Find What You Are Looking For
          </Typography>
        </Stack>
        <Grid container spacing={2} justifyContent="left" alignItems="center">
          {data.slice(0, 4).map((inner, i) => (
            <Grid size={{ lg: 3, md: 4, sm: 6, xs: 12 }} key={'shop-' + i}>
              <ShopCard shop={inner} />
            </Grid>
          ))}
          {!Boolean(data?.length) && (
            <Typography variant="h3" color="error.main" textAlign="center">
              Shop not found
            </Typography>
          )}
        </Grid>
        <Box sx={{ textAlign: 'right' }}>
          <Button
            variant="outlined"
            color="secondary"
            endIcon={<IoArrowForward />}
            component={Link}
            href={'/shops'}
            sx={{
              '& svg': {
                transition: 'transform 0.3s ease' // smooth effect
              },
              '&:hover': {
                svg: { transform: 'translateX(4px)' }
              }
            }}
          >
            View All
          </Button>
        </Box>
      </Stack>
    </Container>
  );
}
