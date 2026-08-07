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
import { FiShoppingCart } from 'react-icons/fi';
import { IoBagCheckOutline } from 'react-icons/io5';
import { getAssetUrl } from '@/utils/getAssetUrl';
import { useState, useEffect, useMemo } from 'react';
import * as api from 'src/services';
import { Countries } from '@/utils/Countries';

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
  const { user } = useSelector((state) => state.user);
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
  

  const handleAddCart = () => {
    if (stock < 1) return toast.error('Out of stock');
    dispatch(addCart({
      pid: product._id,
      name: product.title,
      sku,
      slug: product.slug,
      stockQuantity: stock,
      image: getAssetUrl(activeVariation?.images?.[0]?.url || product.images[0].url),
      quantity: qty,
      vendorid: product.vendor,
    price: effectivePrice,        // ← was rawPrice
    subtotal: effectivePrice * qty, // ← was rawPrice * qty
      shippingPolicyId: product.shipping_policy,
    }));
    toast.success('Added to cart');
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
      {product.pricingMode === 'declare' && (
        <Box mb={2}>
          {hasDiscount ? (
            <>
              <Stack direction="row" spacing={1.5} alignItems="baseline" flexWrap="wrap">
                <Typography variant="h4" fontWeight={700} color="error.main">
                  {displayPrice}
                </Typography>
                <Typography variant="h6" color="text.disabled" sx={{ textDecoration: 'line-through' }}>
                  {displayMrp}
                </Typography>
                <Chip
                  label={`${discountPct}% off`}
                  size="small"
                  sx={{ bgcolor: 'error.main', color: '#fff', fontWeight: 700, fontSize: 12 }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                MRP: {displayMrp} (inclusive of all taxes)
              </Typography>
            </>
          ) : (
            <Typography variant="h4" fontWeight={700}>{displayPrice}</Typography>
          )}
        </Box>
      )}

      {product.pricingMode !== 'declare' && (
        <Typography variant="h4" fontWeight={700} mb={2}>{displayPrice}</Typography>
      )}

      <Typography color={stock > 0 ? 'success.main' : 'error.main'} mb={1}>
        {stock > 0 ? `In Stock (${stock})` : 'Out of Stock'}
      </Typography>

      {/* ── VARIATION SELECTORS — chip style ── */}
      {product.hasVariations &&
        product.variationAttributes.map((attr) => {
          const selected = selectedAttrs[attr.name];
          return (
            <Box key={attr.name} mt={2.5}>
              <Typography variant="body2" fontWeight={700} mb={1} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 11 }}>
                {attr.name}
                {selected && selected !== 'default' && (
                  <Box component="span" sx={{ ml: 1, color: 'text.primary', textTransform: 'none', letterSpacing: 0, fontWeight: 600, fontSize: 13 }}>
                    : {selected}
                  </Box>
                )}
              </Typography>

              <Stack direction="row" flexWrap="wrap" gap={1}>
                {attr.values.map((val) => {
                  const isActive = selected === val;
                  // Detect if values look like colors (hex / css color names)
                  const isColor = /^#[0-9a-f]{3,6}$/i.test(val) || /^(red|blue|green|black|white|yellow|pink|grey|gray|orange|purple|navy|beige|brown|teal|maroon|olive|coral|cyan|magenta|lime|indigo|violet|gold|silver|cream|ivory|khaki|lavender|mint|rose|tan|salmon|charcoal|slate)$/i.test(val);

                  if (isColor) {
                    return (
                      <Box
                        key={val}
                        onClick={() => { setSelectedAttrs((prev) => ({ ...prev, [attr.name]: val })); setQty(1); }}
                        title={val}
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: val.startsWith('#') ? val : val.toLowerCase(),
                          cursor: 'pointer',
                          border: isActive ? '3px solid' : '2px solid',
                          borderColor: isActive ? 'primary.main' : 'divider',
                          boxShadow: isActive ? '0 0 0 2px white inset' : 'none',
                          transition: 'transform 0.15s',
                          '&:hover': { transform: 'scale(1.15)' },
                        }}
                      />
                    );
                  }

                  return (
                    <Box
                      key={val}
                      onClick={() => { setSelectedAttrs((prev) => ({ ...prev, [attr.name]: val })); setQty(1); }}
                      sx={{
                        px: 2,
                        py: 0.75,
                        border: '1.5px solid',
                        borderColor: isActive ? 'primary.main' : 'divider',
                        borderRadius: 1.5,
                        cursor: 'pointer',
                        bgcolor: isActive ? 'primary.main' : 'transparent',
                        color: isActive ? 'primary.contrastText' : 'text.primary',
                        typography: 'body2',
                        fontWeight: isActive ? 700 : 400,
                        userSelect: 'none',
                        transition: 'all 0.15s',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: isActive ? 'primary.dark' : 'primary.50',
                        },
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

      {/* ── ACTIONS ── */}
      <Stack spacing={2} mt={3}>
        {!requiresQuote ? (
          <>
            <Incrementer
              quantity={qty}
              stockQuantity={stock}
              onIncrease={() => setQty((q) => q + 1)}
              onDecrease={() => setQty((q) => Math.max(1, q - 1))}
            />
            <Button startIcon={<FiShoppingCart />} variant="contained" disabled={stock === 0 || isMaxQty} onClick={handleAddCart}>
              Add to Cart
            </Button>
            <Button startIcon={<IoBagCheckOutline />} variant="outlined" disabled={stock === 0}>
              Buy Now
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => {
              if (!user) { toast.error('Please login to request a quote'); return; }
              setOpenQuote(true);
            }}
          >
            Request a Quote
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
