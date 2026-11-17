'use client';

import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'src/redux';
import { addCart } from 'src/redux/slices/product';
import {
  Box,
  Stack,
  Button,
  Typography,
  MenuItem,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Chip,
} from '@mui/material';
import Incrementer from '@/components/incrementer';
import { FiShoppingCart, FiArrowRight } from 'react-icons/fi';
import { IoBagCheckOutline } from 'react-icons/io5';
import { getAssetUrl } from '@/utils/getAssetUrl';
import { useState, useEffect, useMemo } from 'react';
import * as api from 'src/services';
import { Countries } from '@/utils/Countries';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/utils/formatPrice';



// ── Converts raw amount → { displayPrice, displayMrp, discountPct, hasDiscount }
// by hitting the same pricingconvert API but for both mrp and discountPrice
async function resolveDisplayPricing({ product, activeVariation, userId,currency  }) {
  const rawMrp = activeVariation?.price ?? product.mrp;
  const rawDiscount = activeVariation?.discountPrice ?? product.discountPrice;
  const vendorId = product.vendor;

  const fmt = (amount, currency) =>
    new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);

  if (!rawMrp || rawMrp <= 0) return { displayPrice: 'Price on Request', displayMrp: null, hasDiscount: false, discountPct: 0 };

  try {
    const [mrpRes, discRes] = await Promise.all([
      api.pricingconvert({ amount: rawMrp, vendorId, userId,guestCurrency: currency }),
      rawDiscount && rawDiscount < rawMrp
        ? api.pricingconvert({ amount: rawDiscount, vendorId, userId , guestCurrency: currency })
        : Promise.resolve(null),
    ]);

    const mrpData = mrpRes?.data;
    if (!mrpData || typeof mrpData.amount !== 'number') return { displayPrice: 'Price on Request', displayMrp: null, hasDiscount: false, discountPct: 0 };

    const currency = mrpData.currency || 'USD';
    const discData = discRes?.data;
    const hasDiscount = !!(discData && typeof discData.amount === 'number' && discData.amount < mrpData.amount);
    const discountPct = hasDiscount ? Math.round(((mrpData.amount - discData.amount) / mrpData.amount) * 100) : 0;

    return {
      displayPrice: fmt(hasDiscount ? discData.amount : mrpData.amount, currency),
      displayMrp: hasDiscount ? fmt(mrpData.amount, currency) : null,
      hasDiscount,
      discountPct,
      rawPrice: rawMrp,
    };
  } catch {
    return { displayPrice: 'Price on Request', displayMrp: null, hasDiscount: false, discountPct: 0, rawPrice: rawMrp };
  }
}

const QUOTE_TEMPLATES = [
  { key: 'best_price',         label: 'I am interested in this product. Please share your best price.' },
  { key: 'product_shipping',   label: 'Please provide product price along with shipping cost to my location.' },
  { key: 'bulk_order',         label: 'I am looking for bulk quantity pricing. Please advise.' },
  { key: 'custom_requirement', label: 'I have custom requirements. Please share quotation.' },
];

export default function ProductDetailsSummary({ product, selectedAttrs, setSelectedAttrs, activeVariation }) {
  const dispatch = useDispatch();
    const router = useRouter();
  const { user } = useSelector((state) => state.user);
  const needsVariantSelection = product.hasVariations && !activeVariation;
  const { code: currency } = useSelector((state) => state.currency);
  const [shippingPolicyType, setShippingPolicyType] = useState(null);
  const { checkout } = useSelector(({ product }) => product);
  const [qty, setQty] = useState(1);

  // Pricing display state
  const [displayPrice, setDisplayPrice]   = useState('—');
  const [displayMrp, setDisplayMrp]       = useState(null);
  const [hasDiscount, setHasDiscount]     = useState(false);
  const [discountPct, setDiscountPct]     = useState(0);

  // Quote dialog
  const [openQuote, setOpenQuote]           = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [quoteQty, setQuoteQty]             = useState(1);
  const [countries, setCountries]           = useState([]);
  const [deliveryCountry, setDeliveryCountry] = useState(user?.country || '');
  const [deliveryPincode, setDeliveryPincode] = useState('');
  const [sendWhatsapp, setSendWhatsapp]     = useState(true);
  const [freightType, setFreightType]       = useState('');

  const rawPrice = useMemo(() => activeVariation?.price ?? product.mrp, [activeVariation, product]);
  const stock    = activeVariation?.stock ?? product.stock;
  const sku      = activeVariation?.sku ?? product._id;

  

 useEffect(() => {
  let mounted = true;
  const load = async () => {
    const rawMrp = activeVariation?.price ?? product.mrp;
    const rawDiscount = activeVariation?.discountPrice ?? product.discountPrice;
    const vendorId = product.vendor;

    if (!rawMrp || rawMrp <= 0) {
      if (mounted) {
        setDisplayPrice('Price on Request');
        setDisplayMrp(null);
        setHasDiscount(false);
        setDiscountPct(0);
      }
      return;
    }

    const hasDisc = !!(rawDiscount && rawDiscount < rawMrp);

    const [mrpFormatted, discFormatted] = await Promise.all([
      formatPrice({ amount: rawMrp, vendorId, userId: user?._id || null, currency }),
      hasDisc
        ? formatPrice({ amount: rawDiscount, vendorId, userId: user?._id || null, currency })
        : Promise.resolve(null),
    ]);

    if (!mounted) return;

    const discountPctCalc = hasDisc
      ? Math.round(((rawMrp - rawDiscount) / rawMrp) * 100)
      : 0;

    setDisplayPrice(hasDisc ? discFormatted : mrpFormatted);
    setDisplayMrp(hasDisc ? mrpFormatted : null);
    setHasDiscount(hasDisc);
    setDiscountPct(discountPctCalc);
  };
  load();
  return () => { mounted = false; };
}, [rawPrice, product.vendor, user, activeVariation, currency]);

  // ── Load shipping policy type ──
  useEffect(() => {
    if (!product?.shipping_policy) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shipping-policy/${product.shipping_policy}`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setShippingPolicyType(json.data.policy_type); })
      .catch(console.error);
  }, [product.shipping_policy]);

  const requiresQuote = useMemo(
    () => !!(shippingPolicyType) && (product.pricingMode === 'quote' || shippingPolicyType === 'FREIGHT'),
    [product.pricingMode, shippingPolicyType]
  );
  
  const effectivePrice = useMemo(() => {
  const mrp = activeVariation?.price ?? product.mrp;
  const discount = activeVariation?.discountPrice ?? product.discountPrice;
  return (discount && discount < mrp) ? discount : mrp;
}, [activeVariation, product]);
  

  const cartItem = checkout.cart.find((item) => item.sku === sku);
  const isMaxQty = cartItem?.quantity >= stock;
  

  const buildCartItem = () => ({
    pid: product._id,
    name: product.title,
    sku,
    slug: product.slug,
    stockQuantity: stock,
    image: getAssetUrl(activeVariation?.images?.[0]?.url || product.images[0].url),
    quantity: qty,
    vendorid: product.vendor,
    price: effectivePrice,
    subtotal: effectivePrice * qty,
    shippingPolicyId: product.shipping_policy,
  });

  const handleAddCart = () => {
    if (needsVariantSelection) return toast.error('Please select all options first');
    if (stock < 1) return toast.error('Out of stock');
    dispatch(addCart(buildCartItem()));
    toast.success('Added to cart');
  };

  const handleBuyNow = () => {
    if (needsVariantSelection) return toast.error('Please select all options first');
    if (stock < 1) return toast.error('Out of stock');
    dispatch(addCart(buildCartItem()));
    router.push('/checkout');
  };

  // ── Load countries when quote opens ──
  useEffect(() => {
    if (!openQuote) return;
    Countries().then((res) => setCountries(res || [])).catch(console.error);
    setFreightType('');
  }, [openQuote]);

  return (
    <Box mt={2}>

            {/* ── PRICE BLOCK ── */}
      {product.pricingMode === 'declare' && hasDiscount ? (
        <Box mb={0.5}>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <Typography sx={{ fontSize: { xs: 30, md: 34 }, fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.2 }}>
              {displayPrice}
            </Typography>
            <Typography sx={{ fontSize: 14, color: '#86939c', textDecoration: 'line-through' }}>
              {displayMrp}
            </Typography>
            <Chip
              label={`${discountPct}% off`}
              size="small"
              sx={{ bgcolor: '#fff0e9', color: '#a3452d', fontWeight: 600, fontSize: 12, borderRadius: '7px', height: 24 }}
            />
          </Stack>
          <Typography sx={{ fontSize: 11, color: '#72818c', mt: 0.75 }}>
            MRP {displayMrp} · Includes all taxes
          </Typography>
        </Box>
      ) : (
        <Typography sx={{ fontSize: { xs: 30, md: 34 }, fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.2 }}>
          {displayPrice}
        </Typography>
      )}

      {/* ── STOCK ── */}
      <Stack direction="row" spacing={0.75} alignItems="center" mt={1.5} mb={2.5}
        sx={{ fontSize: 12, color: stock > 0 ? '#456f57' : 'error.main' }}>
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: stock > 0 ? '#558569' : 'error.main' }} />
        <span>{stock > 0 ? 'In stock' : 'Out of stock'}</span>
        {stock > 0 && (
          <Box component="span" sx={{ fontSize: 11, px: 0.75, py: '1px', borderRadius: '4px', bgcolor: '#edf5ef' }}>
            {stock}
          </Box>
        )}
      </Stack>

      {/* ── VARIATION SELECTORS ── */}
      {product.hasVariations && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            columnGap: 2.5,
            rowGap: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            pt: 2,
          }}
        >
          {product.variationAttributes.map((attr) => {
            const selected = selectedAttrs[attr.name];
            return (
              <Box key={attr.name}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1.25 }}>
                  {attr.name}
                  {selected && selected !== 'default' && (
                    <Box component="span" sx={{ ml: 1.25, fontSize: 12, fontWeight: 400, color: '#72838f' }}>
                      {selected}
                    </Box>
                  )}
                </Typography>

                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {attr.values.map((val) => {
                    const isActive = selected === val;
                    const isColor = /^#[0-9a-f]{3,6}$/i.test(val) || /^(red|blue|green|black|white|yellow|pink|grey|gray|orange|purple|navy|beige|brown|teal|maroon|olive|coral|cyan|magenta|lime|indigo|violet|gold|silver|cream|ivory|khaki|lavender|mint|rose|tan|salmon|charcoal|slate)$/i.test(val);

                    if (isColor) {
                      return (
                        <Stack
                          key={val}
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          onClick={() => { setSelectedAttrs((prev) => ({ ...prev, [attr.name]: val })); setQty(1); }}
                          sx={{
                            px: 1.4, minHeight: 36,
                            border: '1px solid',
                            borderColor: isActive ? '#708391' : 'divider',
                            bgcolor: isActive ? '#f3f6f8' : 'transparent',
                            borderRadius: '9px',
                            cursor: 'pointer',
                            fontSize: 12,
                            userSelect: 'none',
                            '&:hover': { borderColor: '#708391' },
                          }}
                        >
                          <Box sx={{
                            width: 18, height: 18, borderRadius: '50%',
                            bgcolor: val.startsWith('#') ? val : val.toLowerCase(),
                            border: '1px solid #d9e0e4',
                          }} />
                          <span style={{ textTransform: 'capitalize' }}>{val}</span>
                        </Stack>
                      );
                    }

                    return (
                      <Box
                        key={val}
                        onClick={() => { setSelectedAttrs((prev) => ({ ...prev, [attr.name]: val })); setQty(1); }}
                        sx={{
                          minWidth: 44, height: 38, px: 1.5,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '1px solid',
                          borderColor: isActive ? '#ed9b7d' : '#dae3e9',
                          bgcolor: isActive ? '#fff0e9' : 'transparent',
                          color: isActive ? '#8e3c27' : 'text.primary',
                          fontWeight: isActive ? 600 : 500,
                          fontSize: 13,
                          borderRadius: '9px',
                          cursor: 'pointer',
                          userSelect: 'none',
                          transition: 'all .15s',
                          '&:hover': { borderColor: '#ed9b7d' },
                        }}
                      >
                        {val.toUpperCase()}
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            );
          })}
        </Box>
      )}

      {/* ── QUANTITY + ACTIONS ── */}
      <Stack spacing={1.25} mt={2.5}>
        {!requiresQuote ? (
          <>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
              <Typography sx={{ fontSize: 13, fontWeight: 500 }}>Quantity</Typography>
              <Incrementer
                quantity={qty}
                stockQuantity={stock}
                onIncrease={() => setQty((q) => q + 1)}
                onDecrease={() => setQty((q) => Math.max(1, q - 1))}
              />
            </Stack>

            {needsVariantSelection && (
              <Typography sx={{ fontSize: 12, color: '#a54332' }}>
                Please select all options above to continue
              </Typography>
            )}

            <Button
              variant="contained"
              disableElevation
              endIcon={<FiArrowRight />}
              disabled={stock === 0 || needsVariantSelection}
              onClick={handleBuyNow}
              sx={{
                justifyContent: 'space-between',
                minHeight: 44, px: 2, borderRadius: '8px',
                fontSize: 14, fontWeight: 600, textTransform: 'none',
                bgcolor: '#f46b45', color: '#361b13',
                boxShadow: '0 4px 12px rgba(216,83,44,.10)',
                '&:hover': { bgcolor: '#ff805b' },
              }}
            >
              Buy it now
            </Button>

            <Button
              variant="outlined"
              startIcon={<FiShoppingCart />}
              disabled={stock === 0 || isMaxQty || needsVariantSelection}
              onClick={handleAddCart}
              sx={{
                minHeight: 40, borderRadius: '8px', textTransform: 'none',
                fontSize: 13, fontWeight: 500,
                borderColor: '#dce5eb', color: '#566e80', bgcolor: '#fff',
                '&:hover': { bgcolor: '#f4f7f9', borderColor: '#dce5eb' },
              }}
            >
              Add to cart
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            disableElevation
            fullWidth
            onClick={() => {
              if (!user) { toast.error('Please login to request a quote'); return; }
              setOpenQuote(true);
            }}
            sx={{
              minHeight: 44, borderRadius: '8px', textTransform: 'none',
              fontSize: 14, fontWeight: 600,
              bgcolor: '#f46b45', color: '#361b13',
              '&:hover': { bgcolor: '#ff805b' },
            }}
          >
            Request a quote
          </Button>
        )}
      </Stack>

      {/* ── QUOTE DIALOG ── */}
      <Dialog open={openQuote} onClose={() => setOpenQuote(false)} fullWidth maxWidth="sm">
        <DialogTitle>Request a Quote</DialogTitle>
        <DialogContent dividers>
          <Typography fontWeight={600}>{product.title}</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Vendor will respond with price &amp; shipping details
          </Typography>

          <Typography fontWeight={600} mb={1}>Select your request</Typography>
          <Select fullWidth value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)} displayEmpty>
            <MenuItem value="">Select a request type</MenuItem>
            {QUOTE_TEMPLATES.map((t) => (
              <MenuItem key={t.key} value={t.key}>{t.label}</MenuItem>
            ))}
          </Select>

          <Box mt={3}>
            <Typography fontWeight={600}>Quantity</Typography>
            <Incrementer quantity={quoteQty} stockQuantity={9999} onIncrease={() => setQuoteQty((q) => q + 1)} onDecrease={() => setQuoteQty((q) => Math.max(1, q - 1))} />
          </Box>

          {shippingPolicyType === 'FREIGHT' && (
            <Box mt={3}>
              <Typography fontWeight={600} mb={1}>Freight Type</Typography>
              <RadioGroup value={freightType} onChange={(e) => setFreightType(e.target.value)} row>
                <FormControlLabel value="AIR" control={<Radio />} label="Air Freight" />
                <FormControlLabel value="SEA" control={<Radio />} label="Sea Freight" />
              </RadioGroup>
            </Box>
          )}

          <Box mt={3}>
            <Typography fontWeight={600}>Delivery Location</Typography>
            <Select fullWidth size="small" value={deliveryCountry} onChange={(e) => setDeliveryCountry(e.target.value)} displayEmpty sx={{ mt: 2 }}>
              <MenuItem value="">Select Country</MenuItem>
              {countries.map((c) => (
                <MenuItem key={c._id} value={c.code || c.label}>{c.label}</MenuItem>
              ))}
            </Select>
            <TextField fullWidth label="ZIP Code" size="small" sx={{ mt: 2 }} value={deliveryPincode} onChange={(e) => setDeliveryPincode(e.target.value)} />
          </Box>

          <Box mt={3}>
            <FormControlLabel
              control={<Checkbox checked={sendWhatsapp} onChange={(e) => setSendWhatsapp(e.target.checked)} />}
              label="Send quote updates to my WhatsApp"
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenQuote(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!selectedTemplate || !deliveryCountry || !deliveryPincode || (shippingPolicyType === 'FREIGHT' && !freightType)}
            onClick={async () => {
              try {
                await api.quoterequest({
                  productId: product._id,
                  vendorId: product.vendor,
                  templateKey: selectedTemplate,
                  quantity: quoteQty,
                  location: { country: deliveryCountry, pincode: deliveryPincode },
                  freightType: shippingPolicyType === 'FREIGHT' ? freightType : null,
                  notifyWhatsapp: sendWhatsapp,
                  userId: user?._id || null,
                });
                toast.success('Quote request sent to vendor');
                setOpenQuote(false);
              } catch (err) {
                toast.error(err?.response?.data?.message || 'Failed to send quote request');
              }
            }}
          >
            Send Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
