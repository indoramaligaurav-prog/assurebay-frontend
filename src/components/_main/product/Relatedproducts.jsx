'use client';

import { useEffect, useState } from 'react';
import { Box, Grid, Typography, Divider, Skeleton } from '@mui/material';
import ProductCard from '@/components/cards/product';

export default function RelatedProducts({ slug }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!slug) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${slug}/related?limit=8`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setProducts(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  // Don't render section at all if no results and not loading
  if (!loading && products.length === 0) return null;

  return (
    <Box mt={6} mb={4}>
      <Typography variant="h6" fontWeight={700} mb={1}>
        You May Also Like
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={2}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Grid key={i} size={{ xs: 6, sm: 4, md: 3 }}>
                <ProductCard loading />
              </Grid>
            ))
          : products.map((product) => (
              <Grid key={product._id} size={{ xs: 6, sm: 4, md: 3 }}>
                <Box
                  sx={{
                    border: '1px solid #f1f1f1',
                    borderRadius: 2,
                    overflow: 'hidden',
                    transition: '0.2s',
                    '&:hover': {
                      borderColor: '#ddd',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <ProductCard product={product} />
                </Box>
              </Grid>
            ))}
      </Grid>
    </Box>
  );
}