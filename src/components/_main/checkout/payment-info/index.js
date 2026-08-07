'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

// MUI
import { Card, CardContent, Typography, Stack, Divider, TextField, Button, CircularProgress } from '@mui/material';

// utils
import { formatPrice } from '@/utils/formatPrice';

import * as api from 'src/services';

PaymentInfo.propTypes = {
  setCouponCode: PropTypes.func.isRequired,
  setTotal: PropTypes.func.isRequired,
  zip: PropTypes.string,
  setFieldValue: PropTypes.func.isRequired,
  checked: PropTypes.bool,
  /** Shipping total bubbled up from CartItemsCard — no API call needed here */
  shippingTotal: PropTypes.number
};

export default function PaymentInfo({ setCouponCode, setTotal, zip, setFieldValue, checked, shippingTotal = 0 }) {
  const { product } = useSelector((state) => state);
  const { user } = useSelector((state) => state.user);
  const { code: currency } = useSelector((state) => state.currency);

  const { cart } = product.checkout;

  const buyerPincode = zip || '';

  // total item count across all cart lines
  const totalItemCount = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  // raw subtotal from cart
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);


  // converted (formatted) display values
  const [convertedSubtotal, setConvertedSubtotal] = useState(null);
  const [convertedShipping, setConvertedShipping] = useState(null);
  const [convertedTotal, setConvertedTotal] = useState(null);

  // ADD after existing useState declarations
const [couponInput, setCouponInput] = useState('');
const [couponLoading, setCouponLoading] = useState(false);
const [couponError, setCouponError] = useState('');
const [discountAmount, setDiscountAmount] = useState(0);
const [appliedCoupon, setAppliedCoupon] = useState(null);
const [convertedDiscount, setConvertedDiscount] = useState(null);
// ADD this line right after discountAmount useState
const total = subtotal + shippingTotal - discountAmount;

  /* ---------------- PRICE CONVERSION ---------------- */
  useEffect(() => {
    if (!cart.length) return;

    const total = subtotal + shippingTotal - discountAmount;
    const vendorId = cart[0]?.vendorid || null;
    const userId = user?._id || null;

    const convert = async () => {
      setConvertedSubtotal(await formatPrice({ amount: subtotal, vendorId, userId , currency }));

      setConvertedShipping(
  !buyerPincode
    ? '—'
    : shippingTotal === 0
    ? 'Free'
    : await formatPrice({ amount: shippingTotal, vendorId, userId , currency })
);
      if (discountAmount > 0) {
  setConvertedDiscount(await formatPrice({ amount: discountAmount, vendorId, userId , currency  }));
} else {
  setConvertedDiscount(null);
}
      setConvertedTotal(await formatPrice({ amount: total, vendorId, userId , currency  }));
    };

    convert();

    setTotal(total);
  }, [subtotal, shippingTotal, discountAmount,cart, user , currency]);


  const handleApplyCoupon = async () => {
  if (!couponInput.trim()) return;
  setCouponLoading(true);
  setCouponError('');
  try {
    const res = await api.applyCouponCode(couponInput.trim());
    if (res?.data) {
      const coupon = res.data;
      const discount = coupon.type === 'percent'
        ? (subtotal * coupon.discount) / 100
        : coupon.discount;
      setDiscountAmount(discount);
      setAppliedCoupon(coupon);
      setCouponCode(coupon.code); // sync to parent
    }
  } catch (err) {
    setCouponError(err?.response?.data?.message || 'Invalid coupon code');
    setDiscountAmount(0);
    setAppliedCoupon(null);
    setCouponCode(null);
  } finally {
    setCouponLoading(false);
  }
};


const handleRemoveCoupon = () => {
  setAppliedCoupon(null);
  setDiscountAmount(0);
  setCouponCode(null);
  setCouponError('');
  setCouponInput('');
};

  /* ---------------- UI ---------------- */
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ py: 2 }}>
        <Typography variant="h4" mb={2}>
          Order Summary
        </Typography>

      

        <Stack spacing={1.5}>
          {/* Items subtotal */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Items ({totalItemCount})
            </Typography>
            <Typography variant="body2">
              {convertedSubtotal ?? subtotal}
            </Typography>
          </Stack>

          {/* Shipping */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Shipping
            </Typography>
            <Typography variant="body2">
              {convertedShipping ?? (buyerPincode ? shippingTotal : '—')}
            </Typography>
          </Stack>
        </Stack>

        {/* Coupon input */}
<Stack direction="row" spacing={1} mt={1}>
  <TextField
    size="small"
    fullWidth
    placeholder="Coupon code"
    value={couponInput}
    onChange={(e) => {
      setCouponInput(e.target.value.toUpperCase());
      if (appliedCoupon) {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setCouponCode(null);
        setCouponError('');
      }
    }}
    error={Boolean(couponError)}
    helperText={couponError || (appliedCoupon ? `"${appliedCoupon.name}" applied` : '')}
    FormHelperTextProps={{
      sx: { color: appliedCoupon && !couponError ? 'success.main' : undefined }
    }}
    disabled={Boolean(appliedCoupon)}
  />
  {appliedCoupon ? (
  <Button
    variant="outlined"
    size="small"
    color="error"
    onClick={handleRemoveCoupon}
    sx={{ whiteSpace: 'nowrap', minWidth: 80 }}
  >
    Remove
  </Button>
) : (
  <Button
    variant="outlined"
    size="small"
    onClick={handleApplyCoupon}
    disabled={couponLoading || !couponInput.trim()}
    sx={{ whiteSpace: 'nowrap', minWidth: 80 }}
  >
    {couponLoading ? <CircularProgress size={16} /> : 'Apply'}
  </Button>
)}
</Stack>

{/* Discount row — only show when coupon applied */}
{discountAmount > 0 && (
  <Stack direction="row" justifyContent="space-between" alignItems="center">
    <Typography variant="body2" color="success.main">
      Discount ({appliedCoupon?.type === 'percent' ? `${appliedCoupon.discount}%` : 'flat'})
    </Typography>
    <Typography variant="body2" color="success.main">
      — {convertedDiscount ?? discountAmount}
    </Typography>
  </Stack>
)}

        <Divider sx={{ my: 2 }} />

        {/* Order total */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight={700}>
            Order Total
          </Typography>
          <Typography variant="subtitle1" fontWeight={700}>
            {convertedTotal ?? total}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}