'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

import {
  Card,
  Box,
  Typography,
  Stack,
  Chip,
  Skeleton,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';

import Image from 'next/image';
import Link from 'next/link';

import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';

import { getAssetUrl } from '@/utils/getAssetUrl';
import { formatPrice } from '@/utils/formatPrice';

// Update this import path to match your project.

import * as api from 'src/services';

export default function ProductCard({ product, loading }) {
  const router = useRouter();

  const user = useSelector((state) => state.user?.user);
const isAuthenticated = useSelector(
  (state) => state.user?.isAuthenticated
);
  const { code: currency } = useSelector((state) => state.currency);

  const [displayMrp, setDisplayMrp] = useState(null);
  const [displayDiscount, setDisplayDiscount] = useState(null);

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Load product prices.
  useEffect(() => {
    if (!product?.mrp) return;

    let cancelled = false;

    const loadPrices = async () => {
      try {
        const formattedMrp = await formatPrice({
          amount: product.mrp,
          vendorId: product.vendor,
          userId: user?._id || null,
          currency,
        });

        if (!cancelled) {
          setDisplayMrp(formattedMrp);
        }

        if (product.discountPrice) {
          const formattedDiscount = await formatPrice({
            amount: product.discountPrice,
            vendorId: product.vendor,
            userId: user?._id || null,
            currency,
          });

          if (!cancelled) {
            setDisplayDiscount(formattedDiscount);
          }
        } else if (!cancelled) {
          setDisplayDiscount(null);
        }
      } catch (error) {
        console.error('Failed to format product prices:', error);
      }
    };

    loadPrices();

    return () => {
      cancelled = true;
    };
  }, [product, user?._id, currency]);

  // Load the user's wishlist and determine whether this product is saved.
  useEffect(() => {
    let cancelled = false;

    const loadWishlist = async () => {
      if (!user?._id || !product?._id) {
        setIsWishlisted(false);
        return;
      }

      try {
        const response = await api.getWishlist();

        if (!cancelled && response?.success) {
          const wishlistProducts = response.data || [];

          const exists = wishlistProducts.some((item) => {
            const id =
              typeof item === 'string' ? item : item?._id;

            return String(id) === String(product._id);
          });

          setIsWishlisted(exists);
        }
      } catch (error) {
        console.error('Failed to load wishlist:', error);
      }
    };

    loadWishlist();

    return () => {
      cancelled = true;
    };
  }, [user?._id, product?._id]);

const handleWishlistClick = async (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (wishlistLoading) return;

  if (!isAuthenticated || !user?._id) {
    router.push('/auth/sign-in');
    return;
  }

  if (!product?._id) {
    console.error('Product or product ID is missing:', product);
    return;
  }

  setWishlistLoading(true);

  try {
    console.log('Updating wishlist for product:', product._id);

    const response = await api.updateWishlist(product._id);

    console.log('Wishlist API response:', response);

    if (response?.success) {
      setIsWishlisted(response.type === 'pushed');

      setNotification({
        open: true,
        message:
          response.type === 'pushed'
            ? 'Added to wishlist'
            : 'Removed from wishlist',
        severity: 'success',
      });
    } else {
      setNotification({
        open: true,
        message: response?.message || 'Could not update wishlist',
        severity: 'error',
      });
    }
  } catch (error) {
    console.error('Failed to update wishlist:', error);

    setNotification({
      open: true,
      message:
        error?.response?.data?.message ||
        'Failed to update wishlist. Please try again.',
      severity: 'error',
    });
  } finally {
    setWishlistLoading(false);
  }
};

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
  const image = getAssetUrl(
    product.images?.[0]?.url || '/placeholder.png'
  );

return (
  <>
    <Card
      sx={{
        p: 0,
        boxShadow: 0,
        border: '0!important',
      }}
    >
      {stock <= 0 && (
        <Chip label="Out of Stock" size="small" color="error" />
      )}

      <Box
        sx={{
          position: 'relative',
          height: 240,
          background: '#dfdfdf',
        }}
      >
        {/* Product image: clicking opens product details */}
        <Link
          href={`/product/${product.slug || product._id}`}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
          }}
        >
          <Image
            src={image}
            alt={product.title || 'Product'}
            fill
            style={{ objectFit: 'contain' }}
          />
        </Link>

        {/* Wishlist button is outside the Link */}
        <IconButton
          aria-label={
            isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'
          }
          disabled={wishlistLoading}
          onClick={handleWishlistClick}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 2,
            background: '#fff',
            '&:hover': { background: '#f5f5f5' },
            boxShadow: 1,
          }}
        >
          {isWishlisted ? (
            <FavoriteIcon sx={{ color: '#ee6051' }} />
          ) : (
            <FavoriteBorderIcon />
          )}
        </IconButton>
      </Box>

      {/* Product details: clicking opens product details */}
      <Link
        href={`/product/${product.slug || product._id}`}
        style={{
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <Box sx={{ p: 1.5 }}>
          <Typography
            variant="subtitle2"
            mt={1}
            sx={{ textTransform: 'capitalize' }}
          >
            {product.title}
          </Typography>

          {product.pricingMode === 'quote' || !product.mrp ? (
            <Typography color="warning.main">
              Price on request
            </Typography>
          ) : (
            <Stack
              direction="row"
              alignItems="center"
              gap={1}
              flexWrap="wrap"
            >
              {product.discountPrice ? (
                <>
                  <Typography variant="h6" fontWeight={600}>
                    {displayDiscount || '...'}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      textDecoration: 'line-through',
                      color: 'text.secondary',
                    }}
                  >
                    {displayMrp || '...'}
                  </Typography>
                </>
              ) : (
                <Typography variant="h6">
                  {displayMrp || '...'}
                </Typography>
              )}
            </Stack>
          )}
        </Box>
      </Link>
    </Card>

    {/* Keep your existing Snackbar here, unchanged */}
    <Snackbar
      open={notification.open}
      autoHideDuration={2500}
      onClose={() =>
        setNotification((prev) => ({ ...prev, open: false }))
      }
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        severity={notification.severity}
        variant="filled"
        onClose={() =>
          setNotification((prev) => ({ ...prev, open: false }))
        }
      >
        {notification.message}
      </Alert>
    </Snackbar>
  </>
);
}
