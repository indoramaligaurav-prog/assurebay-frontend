'use client';
import Link from 'next/link';
import { Box, Stack, Typography } from '@mui/material';

export default function TicketProductHeader({ product, orderNo }) {
  if (!product) return null;
  const href = product.slug ? `/product/${product.slug}` : null;

  const src = product.image
  ? product.image.startsWith('http')
    ? product.image
    : `${process.env.NEXT_PUBLIC_API_URL}${product.image}`
  : null;

  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      sx={{ mb: 2, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
    >
      <Box
        component={Link}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ width: 56, height: 56, borderRadius: 1, overflow: 'hidden', flexShrink: 0, display: 'block' }}
      >
       {src && <Box component="img" src={src} alt={product.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      </Box>
      <Box minWidth={0}>
        <Typography
          component={Link}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          variant="subtitle2"
          fontWeight={600}
          noWrap
          sx={{ display: 'block', color: 'text.primary', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          {product.name}
        </Typography>
        {orderNo && (
          <Typography variant="caption" color="text.secondary">
            Order #{orderNo}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}