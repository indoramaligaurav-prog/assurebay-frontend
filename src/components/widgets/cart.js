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

import { FiArrowRight, FiHeart, FiShoppingBag } from 'react-icons/fi';
import { MdOutlineStorefront } from 'react-icons/md';

import { FiShoppingCart  } from 'react-icons/fi';
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

const EXPLORE_LINKS = [
  { label: 'Tools, hardware & safety', path: '/products' },
  { label: 'Machinery & parts', path: '/products' },
  { label: 'Electronics & IT', path: '/products' },
];

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

  // Group cart items by seller
const groups = useMemo(() => {
  const map = new Map();
  cart.forEach((item) => {
    const key = item.vendorid || 'unknown';
    if (!map.has(key)) {
      map.set(key, { name: item.vendorName || item.shopName || 'Seller', items: [] });
    }
    map.get(key).items.push(item);
  });
  return Array.from(map.values());
}, [cart]);

const goTo = (path) => {
  setOpen(false);
  router.push(path);
};

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
      fontSize: 9,
      minWidth: 15,
      height: 15,
    },
  }}
>
  <FiShoppingCart size={17} strokeWidth={1.6} />
</Badge>

<Typography
  sx={{
    fontSize: 10,
    lineHeight: '13px',
    color: 'inherit',
    fontWeight: 400,
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
      width: { xs: '100%', sm: 430, md: 480 },
      maxWidth: '100%',
      bgcolor: '#fff',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-8px 0 35px rgba(0,0,0,0.06)',
    },
  }}
>
  {/* Header */}
  <Box
    sx={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      px: 3, pt: 3, pb: 2.5, borderBottom: '1px solid #eee', flexShrink: 0,
    }}
  >
    <Box>
      <Typography sx={{ fontSize: 32, fontWeight: 500, letterSpacing: '-1px', color: '#111', lineHeight: 1.2 }}>
        Shopping cart
      </Typography>
      <Typography sx={{ mt: 0.75, fontSize: 15, color: '#6b7280' }}>
        {cart.length} {cart.length === 1 ? 'product' : 'products'}
      </Typography>
    </Box>
    <IconButton
      aria-label="Close cart"
      onClick={() => setOpen(false)}
      sx={{ width: 44, height: 44, bgcolor: '#f1f3f5', '&:hover': { bgcolor: '#e6e9ec' } }}
    >
      <IoClose size={22} />
    </IconButton>
  </Box>

  {/* Body */}
  <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 3, py: 2.5, overscrollBehavior: 'contain' }}>
    {cart.length === 0 ? (
      <>
        {/* Empty card */}
        <Box
          sx={{
            textAlign: 'center', py: 5, px: 3, bgcolor: '#f7f8f9',
            border: '1px solid #e8eaed', borderRadius: '14px',
          }}
        >
          <Box
            sx={{
              width: 76, height: 76, mx: 'auto', mb: 2.5, borderRadius: '50%',
              bgcolor: '#fdeee8', color: '#c74735',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <FiShoppingBag size={30} />
          </Box>
          <Typography sx={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.5px', color: '#111' }}>
            Your cart is empty
          </Typography>
          <Typography sx={{ mt: 1.5, fontSize: 15, lineHeight: 1.9, color: '#6b7280' }}>
            Find what you need, add it here, and review everything before you buy.
          </Typography>
          <Button
            onClick={() => goTo('/products')}
            endIcon={<FiArrowRight size={18} />}
            sx={{
              mt: 3, px: 4, py: 1.5, borderRadius: '10px', bgcolor: '#c4503f', color: '#fff',
              fontSize: 15, fontWeight: 600, textTransform: 'none', boxShadow: 'none',
              '&:hover': { bgcolor: '#a93f30', boxShadow: 'none' },
            }}
          >
            Browse products
          </Button>
        </Box>

        {/* Saved prompt */}
        <Box
          onClick={() => goTo('/profile/wishlist')}
          sx={{
            mt: 4, pb: 3, borderBottom: '1px solid #ececec', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 2,
          }}
        >
          <Box
            sx={{
              width: 46, height: 46, border: '1px solid #e3e5e8', borderRadius: '10px', color: '#4b5563',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <FiHeart size={20} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 500, color: '#111' }}>Have something saved?</Typography>
            <Typography sx={{ mt: 0.25, fontSize: 14, color: '#6b7280' }}>
              Pick up where you left off in your wishlist.
            </Typography>
          </Box>
          <FiArrowRight size={20} />
        </Box>

        {/* Explore */}
        <Typography sx={{ mt: 3, mb: 1, fontSize: 17, fontWeight: 500, color: '#111' }}>
          Explore products
        </Typography>
        {EXPLORE_LINKS.map((link) => (
          <Box
            key={link.label}
            onClick={() => goTo(link.path)}
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              py: 2, borderBottom: '1px solid #ececec', cursor: 'pointer', color: '#111',
              '&:hover': { color: '#c74735' },
            }}
          >
            <Typography sx={{ fontSize: 15.5, color: 'inherit' }}>{link.label}</Typography>
            <FiArrowRight size={18} style={{ color: '#6b7280' }} />
          </Box>
        ))}
      </>
    ) : (
      <>
        {/* Section heading */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 500, color: '#111' }}>Your items</Typography>
          <Typography sx={{ fontSize: 14.5, color: '#6b7280' }}>
            {totalItems} {totalItems === 1 ? 'unit' : 'units'} · {groups.length}{' '}
            {groups.length === 1 ? 'seller' : 'sellers'}
          </Typography>
        </Stack>

        {groups.map((group, groupIndex) => (
          <Box key={`${group.name}-${groupIndex}`} sx={{ mt: groupIndex === 0 ? 0 : 1 }}>
            {/* Seller row */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ color: '#6b7280', pb: 1.5, borderBottom: '1px solid #ececec' }}
            >
              <MdOutlineStorefront size={18} />
              <Typography sx={{ fontSize: 14.5, color: 'inherit' }}>{group.name}</Typography>
            </Stack>

            {group.items.map((item) => {
              const image = getAssetUrl(item.image || '/placeholder.png');
              const quoted = item.isQuoted === true;
              const quantity = Number(item.quantity) || 0;
              const formatted = displayPrices[item.sku];
              const meta = [item.condition, ...Object.values(item.variantAttributes || {})]
                .filter(Boolean)
                .join(' · ');

              return (
                <Box
                  key={item.sku}
                  sx={{ display: 'flex', gap: 2, py: 2.5, borderBottom: '1px solid #ececec' }}
                >
                  <Box
                    sx={{
                      position: 'relative', width: 80, height: 80, flexShrink: 0,
                      bgcolor: '#f5f5f4', borderRadius: '12px', overflow: 'hidden',
                    }}
                  >
                    <Image
                      src={image}
                      alt={item.name || 'Product'}
                      fill
                      sizes="80px"
                      style={{ objectFit: 'contain', padding: 4 }}
                    />
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 17, fontWeight: 500, color: '#111', lineHeight: 1.3 }}>
                      {item.name}
                    </Typography>

                    {meta && (
                      <Typography sx={{ mt: 0.5, fontSize: 13.5, color: '#6b7280' }}>{meta}</Typography>
                    )}

                    <Box sx={{ mt: 1 }}>
                      {quoted ? (
                        <Typography sx={{ fontSize: 18, fontWeight: 500, color: '#111' }}>
                          Price on request
                        </Typography>
                      ) : quantity > 1 ? (
                        <Typography component="span" sx={{ fontSize: 20, fontWeight: 600, color: '#111' }}>
                          {formatted?.total || '...'}
                          <Typography component="span" sx={{ fontSize: 13, fontWeight: 400, color: '#6b7280' }}>
                            {' '}· {formatted?.price || '...'} each
                          </Typography>
                        </Typography>
                      ) : (
                        <Typography component="span" sx={{ fontSize: 20, fontWeight: 600, color: '#111' }}>
                          {formatted?.price || '...'}
                          <Typography component="span" sx={{ fontSize: 14, fontWeight: 400, color: '#6b7280' }}>
                            {' '}/ unit
                          </Typography>
                        </Typography>
                      )}
                    </Box>

                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.75 }}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        sx={{ border: '1px solid #e3e5e8', borderRadius: '10px' }}
                      >
                        <IconButton
                          size="small"
                          aria-label="Decrease quantity"
                          disabled={quoted || quantity <= 1}
                          onClick={() => handleDecrease(item.sku)}
                          sx={{ width: 40, height: 40 }}
                        >
                          <IoRemove size={16} />
                        </IconButton>
                        <Typography sx={{ minWidth: 28, textAlign: 'center', fontSize: 15 }}>
                          {quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          aria-label="Increase quantity"
                          disabled={quoted}
                          onClick={() => handleIncrease(item.sku)}
                          sx={{ width: 40, height: 40 }}
                        >
                          <IoAdd size={16} />
                        </IconButton>
                      </Stack>

                      <IconButton
                        aria-label={`Remove ${item.name} from cart`}
                        onClick={() => handleRemove(item.sku)}
                        sx={{ color: '#6b7280' }}
                      >
                        <IoTrashOutline size={20} />
                      </IconButton>
                    </Stack>
                  </Box>
                </Box>
              );
            })}
          </Box>
        ))}
      </>
    )}
  </Box>

  {/* Footer */}
  {cart.length === 0 ? (
    <Box
      sx={{
        px: 3, py: 2.5, flexShrink: 0, borderTop: '1px solid #eee',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}
    >
      <Box
        onClick={() => goTo('/profile/wishlist')}
        sx={{ display: 'flex', alignItems: 'center', gap: 1.25, cursor: 'pointer', fontSize: 16, fontWeight: 500, color: '#111' }}
      >
        View wishlist <FiArrowRight size={18} />
      </Box>
      <Box
        onClick={() => goTo('/products')}
        sx={{ display: 'flex', alignItems: 'center', gap: 1.25, cursor: 'pointer', fontSize: 16, fontWeight: 500, color: '#111' }}
      >
        Continue browsing <FiArrowRight size={18} />
      </Box>
    </Box>
  ) : (
    <Box sx={{ px: 3, pt: 2.5, pb: 3, flexShrink: 0, borderTop: '1px solid #eee', bgcolor: '#fff' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography sx={{ fontSize: 18, color: '#111' }}>
          Subtotal ({totalItems} {totalItems === 1 ? 'unit' : 'units'})
        </Typography>
        <Typography sx={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.5px', color: '#111' }}>
          {displaySubtotal || '...'}
        </Typography>
      </Stack>
      <Typography sx={{ mt: 1, mb: 2, fontSize: 14, color: '#6b7280' }}>
        Shipping and applicable taxes are calculated at checkout.
      </Typography>
      <Stack direction="row" spacing={1.5}>
        <Button
          onClick={handleViewCart}
          sx={{
            flex: 1, py: 1.6, borderRadius: '10px', border: '1px solid #e3e5e8',
            color: '#111', fontSize: 15, fontWeight: 500, textTransform: 'none',
            '&:hover': { bgcolor: '#faf6f3', borderColor: '#d9d9d9' },
          }}
        >
          View cart
        </Button>
        <Button
          onClick={handleCheckout}
          endIcon={<FiArrowRight size={18} />}
          sx={{
            flex: 1.2, py: 1.6, borderRadius: '10px', bgcolor: '#c4503f', color: '#fff',
            fontSize: 15, fontWeight: 600, textTransform: 'none', boxShadow: 'none',
            '&:hover': { bgcolor: '#a93f30', boxShadow: 'none' },
          }}
        >
          Checkout
        </Button>
      </Stack>
    </Box>
  )}
</Drawer>
    </>
  );
}