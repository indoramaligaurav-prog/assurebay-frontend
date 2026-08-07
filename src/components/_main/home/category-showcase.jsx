'use client';

import Link from 'next/link';
import {
  Box,
  Stack,
  Typography,
  Button,
  Grid,
  Card,
} from '@mui/material';

import Image from '@/components/blur-image';
import { getAssetUrl } from '@/utils/getAssetUrl';

import ProductCard from '@/components/cards/product';

export default function CategoryShowcase({ categories = [] }) {
  return (
    <Stack spacing={2}>
      {categories?.map((category) => (
        <Box
          key={category?._id}
          sx={{
            background: '#fff',
            border: '1px solid #eee',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <Stack direction={{
    xs: 'column',
    md: 'row',
  }}  sx={{
    minHeight: 100,
  }}>
            {/* LEFT CATEGORY BOX */}
            {/* LEFT CATEGORY BOX */}
<Box
  sx={{
width: {
  xs: '100%',
  md: 260,
},
    position: 'relative',
    overflow: 'hidden',
    minHeight: 310,
    display: 'flex',
    alignItems: 'flex-start',
  }}
>
  {/* FULL BACKGROUND IMAGE */}
  <Image
    src={getAssetUrl(category?.cover?.url)}
    alt={category?.name}
    layout="fill"
    objectFit="cover"
  />

  {/* DARK OVERLAY */}
  <Box
    sx={{
      position: 'absolute',
      inset: 0,
      background:
        'linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0.45))',
      zIndex: 1,
    }}
  />

  {/* CONTENT */}
  <Stack
    spacing={2}
    sx={{
      position: 'relative',
      zIndex: 2,
      p: 3,
      color: '#fff',
      width: '100%',
    }}
  >
    <Typography
      variant="h5"
      fontWeight={700}
      sx={{
        textTransform: 'capitalize',
        lineHeight: 1.2,
      }}
    >
      {category?.name}
    </Typography>

    <Typography
      fontSize={14}
      sx={{
        color: 'rgba(255,255,255,0.85)',
      }}
    >
      Explore trending products and best deals.
    </Typography>

    <Button
      component={Link}
      href={`/products/${category?.slug}`}
      variant="contained"
      sx={{
        width: 'fit-content',
        borderRadius: 2,
        background: '#fff',
        color: '#000',
        textTransform: 'none',
        fontWeight: 600,

        '&:hover': {
          background: '#f3f3f3',
        },
      }}
    >
      Explore all
    </Button>
  </Stack>
</Box>

            {/* RIGHT PRODUCTS */}
           <Box
            sx={{
                flex: 1,
                p: 2,
                background: '#fff',
            }}
            >

<Grid container spacing={2}>
  {category?.products?.slice(0, 8)?.map((product) => (
    <Grid
      item
       size={{
    xs: 6,
    sm: 4,
    md: 3,
  }}
       key={product?._id}
  sx={{
    display: 'flex',
  }}
    >
      <Box
  sx={{
    border: '1px solid #f1f1f1',
    borderRadius: 2,
    overflow: 'hidden',
    transition: '0.2s',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',

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
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}