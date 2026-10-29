'use client';

import { Card, Box, Typography, Stack, Chip, Skeleton } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { getAssetUrl } from '@/utils/getAssetUrl';
import { formatPrice } from '@/utils/formatPrice';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import IconButton from '@mui/material/IconButton';

export default function ProductCard({ product, loading }) {
  const { user } = useSelector((state) => state.user);
  const [displayMrp, setDisplayMrp] = useState(null);
  const [displayDiscount, setDisplayDiscount] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { code: currency } = useSelector((state) => state.currency);

useEffect(() => {
  if (!product?.mrp) return;

  const loadPrices = async () => {
    const formattedMrp = await formatPrice({
      amount: product.mrp,
      vendorId: product.vendor,
      userId: user?._id || null,
        currency,
    });
    setDisplayMrp(formattedMrp);

    if (product.discountPrice) {
      const formattedDiscount = await formatPrice({
        amount: product.discountPrice,
        vendorId: product.vendor,
        userId: user?._id || null,
        currency,
      });
      setDisplayDiscount(formattedDiscount);
    }
  };

  loadPrices();
}, [product, user,currency]);

  if (loading || !product) {
    return (
      <Card sx={{ p: 1.5 }}>
        <Skeleton variant="rounded" height={160} />
        <Stack gap={1} mt={1}>
          <Skeleton width="80%" />
          <Skeleton width="40%" />
        </Stack>
      </Card>
    );
  }


 
  const stock = product.finalStock;
  const image = getAssetUrl(product.images?.[0]?.url || '/placeholder.png');



 
  return (
     <Link href={`/product/${product.slug || product._id}`} style={{ textDecoration: 'none' }}>
    <Card sx={{ p:0 ,boxShadow:"0" , border:"0!important" }}>
      {stock <= 0 && <Chip label="Out of Stock" size="small" color="error" />}

      <Box sx={{ position: 'relative', height: 240 , background:"#dfdfdf" }}>

         <IconButton
    onClick={(e) => {
      e.preventDefault(); // prevent link click
      setIsWishlisted(!isWishlisted);
    }}
    sx={{
      position: 'absolute',
      top: 8,
      right: 8,
      zIndex: 2,
      background: '#fff',
      '&:hover': { background: '#f5f5f5' },
      boxShadow: 1
    }}
  >
    {isWishlisted ? (
      <FavoriteIcon sx={{ color: '#ee6051' }} />
    ) : (
      <FavoriteBorderIcon />
    )}
  </IconButton>

        <Image src={image} alt="prdct" fill style={{ objectFit: 'contain' }} />
      </Box>

      <Box sx={{ p:1.5   }}>

      <Typography variant="subtitle2" mt={1} sx={{textTransform:"capitalize"}} >
        {product.title}
      </Typography>

      {product.pricingMode === 'quote' || !product.mrp ? (
  <Typography color="warning.main">Price on request</Typography>
) : (
  <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
    {product.discountPrice ? (
      <>
        <Typography variant="h6" fontWeight={600}>
          {displayDiscount || '...'}
        </Typography>
        <Typography
          variant="body2"
          sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
        >
          {displayMrp || '...'}
        </Typography>
      </>
    ) : (
      <Typography variant="h6">{displayMrp || '...'}</Typography>
    )}
  </Stack>
)}


      </Box>
    </Card></Link>
  );
}
