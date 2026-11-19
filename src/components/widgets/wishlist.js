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

import { FiX, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import { MdOutlineStorefront } from 'react-icons/md';

const getBasePrice = (p) => p?.discountPrice || p?.salePrice || p?.price || p?.mrp;

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

      console.log('WISHLIST ITEM', items[0]);

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
        (product) => getBasePrice(product) && product?._id
      );

      const entries = await Promise.all(
        pricedProducts.map(async (product) => {
          try {
            const amount = getBasePrice(product);

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

        {/* Header */}
<Box
  sx={{
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    px: 3, pt: 3, pb: 2.5, borderBottom: '1px solid #eee', flexShrink: 0,
  }}
>
  <Box>
    <Typography sx={{ fontSize: 32, fontWeight: 500, letterSpacing: '-1px', color: '#111', lineHeight: 1.2 }}>
      Wishlist
    </Typography>
    <Typography sx={{ mt: 0.75, fontSize: 15, color: '#6b7280' }}>
      Your saved products, in one place.
    </Typography>
  </Box>
  <IconButton
    onClick={handleClose}
    aria-label="Close wishlist"
    sx={{ width: 44, height: 44, bgcolor: '#f1f3f5', '&:hover': { bgcolor: '#e6e9ec' } }}
  >
    <CloseIcon fontSize="small" />
  </IconButton>
</Box>

{/* Scrollable body */}
<Box
  sx={{
    flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden',
    px: 3, py: 2.5, overscrollBehavior: 'contain', scrollbarWidth: 'thin',
  }}
>
  {loading ? (
    <Stack alignItems="center" justifyContent="center" spacing={1.5} sx={{ minHeight: 220 }}>
      <CircularProgress size={28} sx={{ color: '#c74735' }} />
      <Typography sx={{ fontSize: 13, color: '#858b91' }}>Loading your wishlist...</Typography>
    </Stack>
  ) : products.length === 0 ? (
    <Stack alignItems="center" justifyContent="center" spacing={1.5} sx={{ minHeight: 300, textAlign: 'center', px: 2 }}>
      <Box
        sx={{
          width: 76, height: 76, borderRadius: '18px', bgcolor: '#fdeee8', color: '#c74735',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <FavoriteBorderIcon sx={{ fontSize: 34 }} />
      </Box>
      <Typography sx={{ fontSize: 22, fontWeight: 600, color: '#111' }}>Your wishlist is empty</Typography>
      <Typography sx={{ fontSize: 14.5, color: '#6b7280', maxWidth: 280 }}>
        Save products you love, and they will be waiting here for you.
      </Typography>
      <Button
        onClick={() => { handleClose(); router.push('/products'); }}
        endIcon={<FiArrowRight size={18} />}
        sx={{
          mt: 1, px: 4, py: 1.5, borderRadius: '10px', bgcolor: '#c4503f', color: '#fff',
          fontSize: 15, fontWeight: 600, textTransform: 'none', boxShadow: 'none',
          '&:hover': { bgcolor: '#a93f30', boxShadow: 'none' },
        }}
      >
        Browse products
      </Button>
    </Stack>
  ) : (
    <>
      {/* Section heading */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
        <Typography sx={{ fontSize: 18, fontWeight: 500, color: '#111' }}>Saved items</Typography>
        <Typography sx={{ fontSize: 14.5, color: '#6b7280' }}>
          {products.length} {products.length === 1 ? 'item' : 'items'}
        </Typography>
      </Stack>

      {products.map((product, index) => {
        const productId = String(product._id);
        const image = getAssetUrl(product.images?.[0]?.url || '/placeholder.png');
        const href = `/product/${product.slug || product._id}`;
        const isQuote = product.pricingMode === 'quote' || !getBasePrice(product);
        const meta = [product.condition, product.category?.name].filter(Boolean).join(' · ');
        const vendorName = product.vendorName || product.vendor?.shop?.name || product.vendor?.name;

        return (
          <Box
            key={productId}
            sx={{
              display: 'flex', gap: 2, py: 3,
              borderTop: index === 0 ? 'none' : '1px solid #ececec',
              pt: index === 0 ? 0 : 3,
            }}
          >
            <Link
              href={href}
              onClick={handleClose}
              style={{
                position: 'relative', display: 'block', width: 80, height: 80, flexShrink: 0,
                background: '#f5f5f4', borderRadius: 12, overflow: 'hidden',
              }}
            >
              <Image src={image} alt={product.title || 'Product'} fill sizes="80px" style={{ objectFit: 'contain', padding: 4 }} />
            </Link>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                <Typography
                  component={Link}
                  href={href}
                  onClick={handleClose}
                  sx={{
                    fontSize: 17, fontWeight: 500, color: '#111', textDecoration: 'none', lineHeight: 1.3,
                    '&:hover': { color: '#c74735' },
                  }}
                >
                  {product.title || 'Untitled product'}
                </Typography>
                <IconButton
                  size="small"
                  aria-label={`Remove ${product.title || 'product'} from wishlist`}
                  disabled={removingId === productId}
                  onClick={() => handleRemove(product)}
                  sx={{ color: '#6b7280', mt: -0.5, mr: -0.5 }}
                >
                  {removingId === productId ? <CircularProgress size={16} /> : <FiX size={18} />}
                </IconButton>
              </Stack>

              {meta && (
                <Typography sx={{ mt: 0.5, fontSize: 13.5, color: '#6b7280' }}>{meta}</Typography>
              )}

              <Box sx={{ mt: 1 }}>
                {isQuote ? (
                  <Typography sx={{ fontSize: 20, fontWeight: 500, color: '#111' }}>Price on request</Typography>
                ) : (
                  <Typography component="span" sx={{ fontSize: 20, fontWeight: 600, color: '#111' }}>
                    {prices[productId] || '...'}
                    <Typography component="span" sx={{ fontSize: 14, fontWeight: 400, color: '#6b7280' }}>
                      {' '}/ {product.unit || 'unit'}
                    </Typography>
                  </Typography>
                )}
              </Box>

              {vendorName && (
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 1, color: '#6b7280' }}>
                  <MdOutlineStorefront size={16} />
                  <Typography sx={{ fontSize: 14, color: 'inherit' }}>{vendorName}</Typography>
                </Stack>
              )}

              <Button
                onClick={() => { handleClose(); router.push(href); }}
                endIcon={isQuote ? <FiArrowRight size={16} /> : <FiShoppingBag size={16} />}
                sx={{
                  mt: 1.75, px: 2, py: 0.9, borderRadius: '10px', border: '1px solid #e3e5e8',
                  color: '#111', fontSize: 14, fontWeight: 500, textTransform: 'none',
                  '&:hover': { bgcolor: '#faf6f3', borderColor: '#d9d9d9' },
                }}
              >
                {isQuote ? 'View details' : 'Add to cart'}
              </Button>
            </Box>
          </Box>
        );
      })}

      {/* Info note */}
      <Box sx={{ mt: 1, p: 2.25, bgcolor: '#f7f8f9', borderRadius: '12px' }}>
        <Typography sx={{ fontSize: 14, lineHeight: 1.8, color: '#6b7280' }}>
          Buying a replacement part? Match the model, dimensions and specifications before adding it to your order.
        </Typography>
      </Box>
    </>
  )}
</Box>

{/* Footer */}
<Box
  sx={{
    px: 3, py: 2.5, flexShrink: 0, bgcolor: '#fff', borderTop: '1px solid #eee',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  }}
>
  <Box
    onClick={handleViewAll}
    sx={{ display: 'flex', alignItems: 'center', gap: 1.25, cursor: 'pointer', fontSize: 16, fontWeight: 500, color: '#111' }}
  >
    View full wishlist <FiArrowRight size={18} />
  </Box>
  <Box
    onClick={() => { setOpen(false); router.push('/products'); }}
    sx={{ display: 'flex', alignItems: 'center', gap: 1.25, cursor: 'pointer', fontSize: 16, fontWeight: 500, color: '#111' }}
  >
    Continue browsing <FiArrowRight size={18} />
  </Box>
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