'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from '@bprogress/next';
import { useDispatch, useSelector } from 'react-redux';

import { toast } from 'react-hot-toast';
import { sum } from 'lodash';
import { useFormik, Form, FormikProvider } from 'formik';

// ADD to your MUI imports
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Stripe
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// MUI
import {
  Box, Collapse, Grid, Button,
  Typography, CircularProgress, Paper
} from '@mui/material';

// API & Redux
import * as api from 'src/services';
import { resetCart, getCart } from 'src/redux/slices/product';

// Components
import CheckoutForm from 'src/components/forms/checkout';
import ShipmentCheckoutForm from '@/components/forms/shipment-address';
import PaymentInfo from '@/components/_main/checkout/payment-info';
import CartItemsCard from '@/components/cards/cart-Items';

// Validation
import { checkoutSchema } from '@/validations';

// ─── Stripe singleton (outside component to avoid re-instantiation) ───────────
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);


// ─── Inner Stripe payment form (rendered inside <Elements>) ───────────────────
function StripePaymentForm({ onConfirm, isSubmitting }) {
  const stripe   = useStripe();
  const elements = useElements();
  const [stripeError, setStripeError] = useState('');

  const handleConfirm = async () => {
    if (!stripe || !elements) return;
    setStripeError('');

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      // We handle the redirect ourselves
      redirect: 'if_required'
    });

    if (error) {
      setStripeError(error.message);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      onConfirm(paymentIntent.id);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
      <Typography variant="subtitle2" mb={1.5}>
        Card Details
      </Typography>

      {/* Stripe's hosted Payment Element — handles card, wallet, etc. */}
      <PaymentElement />

      {stripeError && (
        <Typography variant="caption" color="error" mt={1} display="block">
          {stripeError}
        </Typography>
      )}

      <Button
        variant="contained"
        fullWidth
        size="large"
        sx={{ mt: 2 }}
        onClick={handleConfirm}
        disabled={!stripe || isSubmitting}
      >
        {isSubmitting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Pay Now'}
      </Button>
    </Paper>
  );
}


// ─── Main checkout ─────────────────────────────────────────────────────────────
const CheckoutMain = () => {
  const router   = useRouter();
  const dispatch = useDispatch();

  const { checkout }                    = useSelector((state) => state.product);
  const { user: userData }              = useSelector((state) => state.user);
  const { currency, rate }              = useSelector((state) => state.settings);
  const { cart, total, shipping }       = checkout;

  // ── UI state ──────────────────────────────────────────────
  const [checked, setChecked]                   = useState(false);
  const [couponCode, setCouponCode]             = useState(null);
  const [totalWithDiscount, setTotalWithDiscount] = useState(null);
  const [loading, setLoading]                   = useState(true);
  const [hasPlacedOrder, setHasPlacedOrder]     = useState(false);
  const [calculatedShipping, setCalculatedShipping] = useState(0);
  const [itemShippingRates, setItemShippingRates]   = useState({});

  // Stripe-specific state
  const [clientSecret, setClientSecret]           = useState(null);
  const [pendingPaymentIntentId, setPendingPaymentIntentId] = useState(null);
  const [stripeSubmitting, setStripeSubmitting]   = useState(false);

  // ── COD mutation ──────────────────────────────────────────


  // ── Validation schema ─────────────────────────────────────
  const newAddressSchema = useMemo(() => checkoutSchema(checked), [checked]);

  // ── Shared order payload builder ──────────────────────────
  const buildPayload = useCallback(
    (values, extraFields = {}) => {
      const items = cart.map((item, index) => {
        const key  = item.sku || `${item.pid}-${index}`;
        const r    = itemShippingRates[key];
        return {
          ...item,
          shipping:         r?.charge      || 0,
          shippingService:  r?.serviceName || null,
          shippingCurrency: r?.currency    || null
        };
      });
      const totalItems = sum(items.map((i) => i.quantity));

      return {
        items,
        totalItems,
        couponCode,
        currency,
        conversionRate:  rate,
        shipping:        calculatedShipping,
        total:           totalWithDiscount || total,
        user: {
          firstName: values.firstName,
          lastName:  values.lastName,
          phone:     values.phone,
          email:     values.email,
          address:   values.address,
          city:      values.city,
          state:     values.state,
          country:   values.country,
          zip:       String(values.zip),
          note:      values.note
        },
        shippingAddress:
          checked && values.shippingAddress?.country ? values.shippingAddress : null,
        ...extraFields
      };
    },
    [cart, itemShippingRates, couponCode, currency, rate, calculatedShipping, totalWithDiscount, total, checked]
  );

  // ── Formik ────────────────────────────────────────────────
  const formik = useFormik({
    initialValues: {
      firstName: userData?.firstName || '',
      lastName:  userData?.lastName  || '',
      phone:     userData?.phone     || '',
      email:     userData?.email     || '',
      address:   userData?.address   || '',
      city:      userData?.city      || '',
      state:     userData?.state     || '',
      country:   userData?.country   || '',
      zip:       userData?.zip       || '',
      note:      '',
      shippingAddress: checked
        ? { firstName: '', lastName: '', phone: '', email: '', address: '', city: '', state: '', country: '', zip: '' }
        : {}
    },
    enableReinitialize:  true,
    validationSchema:    newAddressSchema,

    onSubmit: async (values) => {
      // ── STRIPE step 1: request PaymentIntent from backend ──
      setStripeSubmitting(true);
      try {
        const res = await api.placeOrder({
          paymentMethod: 'Stripe',
          ...buildPayload(values)
          // paymentId is absent → backend returns clientSecret
        });

        if (res?.requiresPayment && res?.clientSecret) {
          setClientSecret(res.clientSecret);
          setPendingPaymentIntentId(res.paymentIntentId);
            setStripeSubmitting(false);  // ← ADD THIS
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to initialise payment');
        setStripeSubmitting(false);
      }
    }
  });

  const { errors, values, touched, handleSubmit, getFieldProps, setFieldValue } = formik;

  // ── STRIPE step 2: called by StripePaymentForm after card confirmed ──
  const handleStripeConfirmed = async (paymentIntentId) => {
    try {
      const res = await api.placeOrder({
        paymentMethod: 'Stripe',
        paymentId:     paymentIntentId,   // backend verifies & saves order
        ...buildPayload(values)
      });

      if (res?.orderId) {
        setHasPlacedOrder(true);
        toast.success('Payment successful! Order placed.');
        router.push(`/order/${res.orderId}`);
        dispatch(resetCart());
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order save failed after payment');
    } finally {
      setStripeSubmitting(false);
    }
  };

  // ── Cart safety ───────────────────────────────────────────
  useEffect(() => {
    formik.validateForm();
    if (!hasPlacedOrder && cart.length < 1) {
      router.push('/');
      return;
    }
    setLoading(false);
    dispatch(getCart({ cart, shipping }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPlacedOrder]);

  // ── Destination address for FedEx rate lookup ─────────────
  const dest = useMemo(() => {
    if (checked && values.shippingAddress) {
      return {
        country: values.shippingAddress.country || '',
        zip:     values.shippingAddress.zip     || '',
        city:    values.shippingAddress.city    || '',
        state:   values.shippingAddress.state   || '',
        address: values.shippingAddress.address || ''
      };
    }
    return {
      country: values.country || '',
      zip:     values.zip     || '',
      city:    values.city    || '',
      state:   values.state   || '',
      address: values.address || ''
    };
  }, [checked, values.country, values.zip, values.city, values.state, values.address, values.shippingAddress]);

 const isStripeReady = !!clientSecret;

  return (
    <FormikProvider value={formik}>
      <Form noValidate onSubmit={handleSubmit}>
        <Box py={5}>
          <Grid container spacing={2}>

            {/* LEFT ─ address forms */}
            <Grid size={{ md: 8, xs: 12 }}>
              <CheckoutForm
                getFieldProps={getFieldProps}
                setFieldValue={setFieldValue}
                touched={touched}
                errors={errors}
                handleChangeShipping={(e) => setChecked(e.target.checked)}
                checked={checked}
                phone={values.phone}
              />

              <Collapse in={checked}>
                <ShipmentCheckoutForm
                  getFieldProps={getFieldProps}
                  touched={touched}
                  errors={errors}
                />
              </Collapse>

              {/* ── Payment method selector ── */}
            

        
            </Grid>

            {/* RIGHT ─ summary */}
            <Grid size={{ md: 4, xs: 12 }}>
              <CartItemsCard
                cart={cart}
                loading={loading}
                dest={dest}
                onShippingCalculated={setCalculatedShipping}
                onRatesReady={setItemShippingRates}
              />

              <PaymentInfo
                loading={loading}
                setCouponCode={setCouponCode}
                setTotal={setTotalWithDiscount}
                shippingTotal={calculatedShipping}
                zip={checked ? values.shippingAddress?.zip : values.zip}
                setFieldValue={setFieldValue}
                checked={checked}
              />

              {/* Show main CTA only when not yet in Stripe card-entry step */}
              {!isStripeReady && (
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  type="submit"
                  disabled={loading || stripeSubmitting}  
                >
                  {stripeSubmitting
  ? 'Processing...'
  : 'Continue to Payment'}
                </Button>
              )}
            </Grid>
          </Grid>
        </Box>
        {/* ── STRIPE card entry step ── */}
      
              <Dialog
                open={isStripeReady}
                onClose={() => {
                  setClientSecret(null);
                  setStripeSubmitting(false);
                }}
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle>
                  Complete Payment
                  <IconButton
                    onClick={() => {
                      setClientSecret(null);
                      setStripeSubmitting(false);
                    }}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                  >
                    <CloseIcon />
                  </IconButton>
                </DialogTitle>

                <DialogContent>
                  {isStripeReady && (
                    <Elements
                      stripe={stripePromise}
                      options={{ clientSecret, appearance: { theme: 'stripe' } }}
                    >
                      <StripePaymentForm
                        onConfirm={handleStripeConfirmed}
                        isSubmitting={stripeSubmitting}
                      />
                    </Elements>
                  )}
                </DialogContent>
              </Dialog>

      </Form>
    </FormikProvider>
  );
};

export default CheckoutMain;