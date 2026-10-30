'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';

import {
  Alert,
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';

import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';

import Image from 'next/image';
import Link from 'next/link';

import * as api from 'src/services';
import { setWishlist } from '@/redux/slices/wishlist';
import { getAssetUrl } from '@/utils/getAssetUrl';
import { formatPrice } from '@/utils/formatPrice';

export default function WishlistWidget() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const wishlistIds = useSelector((state) => state.wishlist?.wishlist || []);
  const user = useSelector((state) => state.user?.user);
  const isAuthenticated = useSelector(
    (state) => state.user?.isAuthenticated
  );
  const { code: currency } = useSelector((state) => state.currency);

  const [open, setOpen] = React.useState(false);
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [removingId, setRemovingId] = React.useState(null);
  const [prices, setPrices] = React.useState({});
  const [notification, setNotification] = React.useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleOpen = () => {
    if (!isAuthenticated || !user?._id) {
      router.push(
        `/auth/sign-in?redirect=${encodeURIComponent(pathname || '/')}`
      );
      return;
    }

    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const loadWishlist = React.useCallback(async () => {
    if (!isAuthenticated || !user?._id) {
      setProducts([]);
      return;
    }

    setLoading(true);

    try {
      const response = await api.getWishlist();
      const items = response?.data || [];

      setProducts(items);

      // Keep Redux in sync with the products returned by the backend.
      dispatch(setWishlist(items.map((item) => String(item._id))));
    } catch (error) {
      console.error('Failed to load wishlist:', error);

      showNotification(
        error?.response?.data?.message || 'Could not load your wishlist.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch, isAuthenticated, user?._id]);

  React.useEffect(() => {
    if (open) loadWishlist();
  }, [open, loadWishlist]);

  // Format product prices using the same utility as ProductCard.
  React.useEffect(() => {
    let cancelled = false;

    const loadPrices = async () => {
      const pricedProducts = products.filter(
        (product) => product?.mrp && product?._id
      );

      const entries = await Promise.all(
        pricedProducts.map(async (product) => {
          try {
            const amount = product.discountPrice || product.mrp;

            const formatted = await formatPrice({
              amount,
              vendorId: product.vendor,
              userId: user?._id || null,
              currency,
            });

            return [String(product._id), formatted];
          } catch (error) {
            console.error(
              `Failed to format price for product ${product._id}:`,
              error
            );

            return [String(product._id), null];
          }
        })
      );

      if (!cancelled) {
        setPrices((previous) => ({
          ...previous,
          ...Object.fromEntries(entries),
        }));
      }
    };

    if (products.length) loadPrices();

    return () => {
      cancelled = true;
    };
  }, [products, user?._id, currency]);

  const handleRemove = async (product) => {
    if (!product?._id || removingId) return;

    setRemovingId(String(product._id));

    try {
      const response = await api.updateWishlist(product._id);

      if (response?.success && response.type === 'pulled') {
        setProducts((previous) =>
          previous.filter(
            (item) => String(item._id) !== String(product._id)
          )
        );

        dispatch(
          setWishlist(
            wishlistIds.filter(
              (id) => String(id) !== String(product._id)
            )
          )
        );

        showNotification('Removed from wishlist.');
      } else {
        // Reload from the backend if the response differs from expectations.
        await loadWishlist();
        showNotification(
          response?.message || 'Could not remove this product.',
          'error'
        );
      }
    } catch (error) {
      console.error('Failed to remove wishlist product:', error);

      showNotification(
        error?.response?.data?.message ||
          'Failed to remove product. Please try again.',
        'error'
      );
    } finally {
      setRemovingId(null);
    }
  };

  const handleViewAll = () => {
    setOpen(false);
    router.push('/profile/wishlist');
  };

  return (
    <>
      {/* Wishlist trigger */}
      <Stack
        component="button"
        type="button"
        onClick={handleOpen}
        alignItems="center"
        spacing={0.25}
        aria-label="Open wishlist"
        sx={{
          border: 0,
          p: 0,
          bgcolor: 'transparent',
          fontFamily: 'inherit',
          cursor: 'pointer',
          color: '#4a4240',
          '&:hover': { color: '#c74735' },
        }}
      >
        <Badge
          badgeContent={wishlistIds.length}
          sx={{
            '& .MuiBadge-badge': {
              bgcolor: '#ed654f',
              color: '#fff',
              fontSize: 10,
              minWidth: 16,
              height: 16,
            },
          }}
        >
          <FavoriteBorderIcon sx={{ fontSize: 22 }} />
        </Badge>

        <Typography
          sx={{ fontSize: 12, lineHeight: '14px', color: 'inherit' }}
        >
          Wishlist
        </Typography>
      </Stack>

      {/* Wishlist drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 430, md: 480 },
            maxWidth: '100%',
            height: '100%',
            bgcolor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '-8px 0 35px rgba(0,0,0,0.06)',
          },
        }}
      >
        {/* Fixed header */}
        <Box sx={{ px: 3, pt: 3, pb: 2, flexShrink: 0 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 25,
                  fontWeight: 700,
                  letterSpacing: '-0.7px',
                  color: '#292f35',
                  lineHeight: 1.25,
                }}
              >
                My Wishlist
              </Typography>

              <Typography sx={{ mt: 0.5, fontSize: 12, color: '#858b91' }}>
                {products.length}{' '}
                {products.length === 1 ? 'item saved' : 'items saved'} for later
              </Typography>
            </Box>

            <IconButton
              onClick={handleClose}
              aria-label="Close wishlist"
              size="small"
              sx={{
                bgcolor: '#f6f7f8',
                '&:hover': { bgcolor: '#eceeef' },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        <Divider sx={{ borderColor: '#f0f0f0', flexShrink: 0 }} />

        {/* Scrollable products */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            px: { xs: 2, sm: 3 },
            py: 2,
            overscrollBehavior: 'contain',
            scrollbarWidth: 'thin',
          }}
        >
          {loading ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              spacing={1.5}
              sx={{ minHeight: 220 }}
            >
              <CircularProgress size={28} sx={{ color: '#c74735' }} />
              <Typography sx={{ fontSize: 13, color: '#858b91' }}>
                Loading your wishlist...
              </Typography>
            </Stack>
          ) : products.length === 0 ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              spacing={1.5}
              sx={{ minHeight: 300, textAlign: 'center', px: 2 }}
            >
              <Box
                sx={{
                  width: 76,
                  height: 76,
                  borderRadius: '50%',
                  bgcolor: '#fff2ed',
                  color: '#c74735',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FavoriteBorderIcon sx={{ fontSize: 36 }} />
              </Box>

              <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#292f35' }}>
                Your wishlist is empty
              </Typography>

              <Typography sx={{ fontSize: 13, color: '#858b91', maxWidth: 260 }}>
                Save products you love, and they will be waiting here for you.
              </Typography>

              <Button
                onClick={handleClose}
                variant="outlined"
                sx={{
                  mt: 1,
                  borderRadius: '10px',
                  borderColor: '#edc5b5',
                  color: '#b94332',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#fff5ef',
                    borderColor: '#c74735',
                  },
                }}
              >
                Explore products
              </Button>
            </Stack>
          ) : (
            <Stack spacing={2}>
              {products.map((product) => {
                const productId = String(product._id);
                const image = getAssetUrl(
                  product.images?.[0]?.url || '/placeholder.png'
                );

                return (
                  <Box
                    key={productId}
                    sx={{
                      display: 'flex',
                      gap: 1.5,
                      pb: 2,
                      borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    <Link
                      href={`/product/${product.slug || product._id}`}
                      onClick={handleClose}
                      style={{
                        position: 'relative',
                        display: 'block',
                        width: 96,
                        height: 100,
                        flexShrink: 0,
                        background: '#fafafa',
                        borderRadius: 10,
                        overflow: 'hidden',
                      }}
                    >
                      <Image
                        src={image}
                        alt={product.title || 'Product'}
                        fill
                        sizes="96px"
                        style={{ objectFit: 'contain', padding: 5 }}
                      />
                    </Link>

                    <Box
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Typography
                        component={Link}
                        href={`/product/${product.slug || product._id}`}
                        onClick={handleClose}
                        sx={{
                          color: '#302a27',
                          fontSize: 13,
                          fontWeight: 600,
                          lineHeight: 1.5,
                          textDecoration: 'none',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          '&:hover': { color: '#c74735' },
                        }}
                      >
                        {product.title || 'Untitled product'}
                      </Typography>

                      <Box sx={{ mt: 0.75 }}>
                        {product.pricingMode === 'quote' || !product.mrp ? (
                          <Typography sx={{ fontSize: 12, color: '#b7791f' }}>
                            Price on request
                          </Typography>
                        ) : (
                          <Typography
                            sx={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: '#292f35',
                            }}
                          >
                            {prices[productId] || '...'}
                          </Typography>
                        )}
                      </Box>

                      <Box
                        sx={{
                          mt: 'auto',
                          pt: 1,
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 11,
                            color: product.finalStock <= 0 ? '#d14343' : '#39805b',
                          }}
                        >
                          {product.finalStock <= 0 ? 'Out of stock' : 'In stock'}
                        </Typography>

                        <IconButton
                          size="small"
                          aria-label={`Remove ${product.title || 'product'} from wishlist`}
                          disabled={removingId === productId}
                          onClick={() => handleRemove(product)}
                          sx={{
                            color: '#c74735',
                            border: '1px solid #f0e0db',
                            borderRadius: '8px',
                            '&:hover': { bgcolor: '#fff2ed' },
                          }}
                        >
                          {removingId === productId ? (
                            <CircularProgress size={17} />
                          ) : (
                            <DeleteOutlineIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>

        {/* Fixed footer */}
        <Divider sx={{ borderColor: '#f0f0f0', flexShrink: 0 }} />

        <Box sx={{ px: 3, py: 2, flexShrink: 0, bgcolor: '#fff' }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleViewAll}
            endIcon={<ArrowForwardIcon />}
            sx={{
              minHeight: 46,
              borderRadius: '12px',
              bgcolor: '#c74735',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#ad392a',
                boxShadow: 'none',
              },
            }}
          >
            View All Wishlist ({products.length})
          </Button>

          <Typography
            sx={{
              mt: 1,
              textAlign: 'center',
              fontSize: 11,
              color: '#969ba0',
            }}
          >
            Your favorite products, all in one place.
          </Typography>
        </Box>
      </Drawer>

      <Snackbar
        open={notification.open}
        autoHideDuration={2500}
        onClose={() =>
          setNotification((previous) => ({ ...previous, open: false }))
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={notification.severity}
          variant="filled"
          onClose={() =>
            setNotification((previous) => ({ ...previous, open: false }))
          }
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
}