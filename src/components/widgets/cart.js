'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
  CircularProgress,
} from '@mui/material';

import { HiOutlineShoppingBag } from 'react-icons/hi2';
import {
  IoClose,
  IoAdd,
  IoRemove,
  IoTrashOutline,
} from 'react-icons/io5';

import Image from 'next/image';

import {
  deleteCart,
  increaseQuantity,
  decreaseQuantity,
  resetCart,
  getCart,
} from '@/redux/slices/product';

import { formatPrice } from '@/utils/formatPrice';
import { getAssetUrl } from '@/utils/getAssetUrl';

export default function CartWidget() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { checkout } = useSelector((state) => state.product);
  const { user } = useSelector((state) => state.user);
  const { code: currency } = useSelector((state) => state.currency);

  const { cart = [], shipping = 0 } = checkout;

  const [open, setOpen] = useState(false);
  const [displayPrices, setDisplayPrices] = useState({});
  const [displaySubtotal, setDisplaySubtotal] = useState('');
  const [pricesLoading, setPricesLoading] = useState(false);

  // Total number of units in the cart.
  const totalItems = useMemo(
    () => cart.reduce((total, item) => total + (Number(item.quantity) || 0), 0),
    [cart]
  );

  // Calculate the subtotal from cart products.
  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total +
          (Number(item.salePrice || item.price) || 0) *
            (Number(item.quantity) || 0),
        0
      ),
    [cart]
  );

  // Keep Redux subtotal in sync after changes made through this drawer.
  useEffect(() => {
    dispatch(getCart({ cart, shipping }));
  }, [cart, shipping, dispatch]);

  // Format individual prices for the selected currency.
  useEffect(() => {
    let cancelled = false;

    const loadPrices = async () => {
      if (!cart.length) {
        setDisplayPrices({});
        setDisplaySubtotal('');
        setPricesLoading(false);
        return;
      }

      setPricesLoading(true);

      try {
        const results = await Promise.all(
          cart.map(async (item) => {
            const amount = Number(item.salePrice || item.price) || 0;

            const formattedPrice = await formatPrice({
              amount,
              vendorId: item.vendorid || null,
              userId: user?._id || null,
              currency,
            });

            const formattedTotal = await formatPrice({
              amount: amount * (Number(item.quantity) || 0),
              vendorId: item.vendorid || null,
              userId: user?._id || null,
              currency,
            });

            return {
              sku: item.sku,
              price: formattedPrice,
              total: formattedTotal,
            };
          })
        );

        const formattedSubtotal = await formatPrice({
          amount: subtotal,
          vendorId: cart[0]?.vendorid || null,
          userId: user?._id || null,
          currency,
        });

        if (!cancelled) {
          const priceMap = {};

          results.forEach((item) => {
            priceMap[item.sku] = {
              price: item.price,
              total: item.total,
            };
          });

          setDisplayPrices(priceMap);
          setDisplaySubtotal(formattedSubtotal);
        }
      } catch (error) {
        console.error('Failed to format cart prices:', error);

        if (!cancelled) {
          setDisplaySubtotal(String(subtotal));
        }
      } finally {
        if (!cancelled) {
          setPricesLoading(false);
        }
      }
    };

    loadPrices();

    return () => {
      cancelled = true;
    };
  }, [cart, subtotal, user?._id, currency]);

  const handleIncrease = (sku) => {
    dispatch(increaseQuantity(sku));
  };

  const handleDecrease = (sku) => {
    const item = cart.find((product) => product.sku === sku);

    if (!item || item.isQuoted || item.quantity <= 1) {
      return;
    }

    dispatch(decreaseQuantity(sku));
  };

  const handleRemove = (sku) => {
    dispatch(deleteCart(sku));
  };

  const handleClearCart = () => {
    dispatch(resetCart());
  };

  const handleViewCart = () => {
    setOpen(false);
    router.push('/cart');
  };

  const handleCheckout = () => {
    if (!cart.length) return;

    setOpen(false);
    router.push('/checkout');
  };

  return (
    <>
      {/* Cart icon in Navbar */}
      <Stack
        component="button"
        type="button"
        onClick={() => setOpen(true)}
        title={displaySubtotal || ''}
        alignItems="center"
        spacing={0.25}
        sx={{
          border: 0,
          padding: 0,
          background: 'transparent',
          cursor: 'pointer',
          color: '#4a4240',
          font: 'inherit',
          '&:hover': {
            color: '#c74735',
          },
        }}
      >
        <Badge
          badgeContent={totalItems}
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
          <HiOutlineShoppingBag size={22} />
        </Badge>

        <Typography
          sx={{
            fontSize: 12,
            lineHeight: '14px',
            color: 'inherit',
          }}
        >
          Cart
        </Typography>
      </Stack>

      {/* Cart Drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 420 },
            maxWidth: '100%',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Drawer Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            px: 2.5,
            py: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Shopping Cart
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </Typography>
          </Box>

          <IconButton
            aria-label="Close cart"
            onClick={() => setOpen(false)}
          >
            <IoClose size={24} />
          </IconButton>
        </Stack>

        {/* Cart Items */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            px: 2.5,
            py: 2,
          }}
        >
          {cart.length === 0 ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              spacing={1.5}
              sx={{ minHeight: 300, textAlign: 'center' }}
            >
              <HiOutlineShoppingBag size={55} color="#999" />

              <Typography variant="h6">
                Your cart is empty
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Browse our products and add your favorites to the cart.
              </Typography>

              <Button
                variant="contained"
                onClick={() => {
                  setOpen(false);
                  router.push('/products');
                }}
              >
                Start Shopping
              </Button>
            </Stack>
          ) : (
            <Stack spacing={2.5}>
              {cart.map((item) => {
                const image = getAssetUrl(
                  item.image || '/placeholder.png'
                );

                const quoted = item.isQuoted === true;
                const quantity = Number(item.quantity) || 0;
                const formatted = displayPrices[item.sku];

                return (
                  <Box key={item.sku}>
                    <Stack direction="row" spacing={1.5}>
                      {/* Product Image */}
                      <Box
                        sx={{
                          position: 'relative',
                          width: 88,
                          height: 88,
                          flexShrink: 0,
                          bgcolor: '#f7f7f7',
                          borderRadius: 2,
                          overflow: 'hidden',
                        }}
                      >
                        <Image
                          src={image}
                          alt={item.name || 'Product'}
                          fill
                          sizes="88px"
                          style={{ objectFit: 'contain' }}
                        />
                      </Box>

                      {/* Product Information */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          sx={{
                            overflowWrap: 'anywhere',
                            mb: 0.5,
                          }}
                        >
                          {item.name}
                        </Typography>

                        {item.variantAttributes &&
                          Object.keys(item.variantAttributes).length > 0 && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              {Object.entries(item.variantAttributes)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(' · ')}
                            </Typography>
                          )}

                        {quoted ? (
                          <Typography
                            variant="body2"
                            color="warning.main"
                            sx={{ mt: 0.5 }}
                          >
                            Price on request
                          </Typography>
                        ) : (
                          <>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{ mt: 0.5 }}
                            >
                              {formatted?.price ||
                                (pricesLoading ? '...' : item.salePrice || item.price)}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Total:{' '}
                              {formatted?.total ||
                                (pricesLoading
                                  ? '...'
                                  : (Number(item.salePrice || item.price) || 0) *
                                    quantity)}
                            </Typography>
                          </>
                        )}

                        {/* Quantity Controls */}
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{ mt: 1 }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            sx={{
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1,
                            }}
                          >
                            <IconButton
                              size="small"
                              aria-label="Decrease quantity"
                              disabled={quoted || quantity <= 1}
                              onClick={() => handleDecrease(item.sku)}
                            >
                              <IoRemove size={16} />
                            </IconButton>

                            <Typography
                              variant="body2"
                              sx={{ minWidth: 24, textAlign: 'center' }}
                            >
                              {quantity}
                            </Typography>

                            <IconButton
                              size="small"
                              aria-label="Increase quantity"
                              disabled={quoted}
                              onClick={() => handleIncrease(item.sku)}
                            >
                              <IoAdd size={16} />
                            </IconButton>
                          </Stack>

                          <IconButton
                            size="small"
                            color="error"
                            aria-label={`Remove ${item.name} from cart`}
                            onClick={() => handleRemove(item.sku)}
                          >
                            <IoTrashOutline size={19} />
                          </IconButton>
                        </Stack>
                      </Box>
                    </Stack>

                    <Divider sx={{ mt: 2 }} />
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>

        {/* Fixed Drawer Footer */}
        {cart.length > 0 && (
          <Box
            sx={{
              p: 2.5,
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1.5 }}
            >
              <Typography variant="body1" color="text.secondary">
                Subtotal
              </Typography>

              <Typography variant="h6" fontWeight={700}>
                {displaySubtotal ||
                  (pricesLoading ? (
                    <CircularProgress size={18} />
                  ) : (
                    subtotal
                  ))}
              </Typography>
            </Stack>

            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mb: 2 }}
            >
              Shipping, discounts, and final charges may be calculated at checkout.
            </Typography>

            <Stack spacing={1.25}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleCheckout}
                sx={{
                  borderRadius: 2,
                  py: 1.25,
                }}
              >
                Proceed to Checkout
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={handleViewCart}
                sx={{ borderRadius: 2 }}
              >
                View Cart
              </Button>

              <Button
                color="error"
                onClick={handleClearCart}
                startIcon={<IoTrashOutline />}
                sx={{ alignSelf: 'center' }}
              >
                Clear Cart
              </Button>
            </Stack>
          </Box>
        )}
      </Drawer>
    </>
  );
}