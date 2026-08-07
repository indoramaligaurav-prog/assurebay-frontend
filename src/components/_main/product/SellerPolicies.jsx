'use client';

import {
  Box, Stack, Typography, Autocomplete,
  TextField, Button, CircularProgress,
} from '@mui/material';
import ReplayOutlinedIcon      from '@mui/icons-material/ReplayOutlined';
import LocationOnOutlinedIcon  from '@mui/icons-material/LocationOnOutlined';
import InfoOutlinedIcon        from '@mui/icons-material/InfoOutlined';
import AccessTimeIcon          from '@mui/icons-material/AccessTime';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { useState, useEffect }  from 'react';
import { Countries }            from 'src/utils/Countries';

const HANDLING_LABEL = {
  same_day: 'Same business day',
  '1_day':  '1 business day',
  '2_days': '2 business days',
  '3_days': '3 business days',
  '5_days': '5 business days',
  '6_days': '6 business days',
  '7_days': '7 business days',
  '10_days': '10 business days',
  '14_days': '14 business days',
  '15_days': '15 business days',
  '20_days': '20 business days',
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
};

// ── Row ──────────────────────────────────────────────────────────────────────
function Row({ label, children }) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Typography
        variant="body2"
        fontWeight={600}
        sx={{ width: 100, flexShrink: 0, color: 'text.primary' }}
      >
        {label}
      </Typography>
      <Box flex={1}>{children}</Box>
    </Stack>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function SellerPolicies({
  shippingPolicy,
  product,
  fedexRates   = [],
  ratesLoading = false,
  onZipChange,
    detectedCountryCode,  // ── ADD THIS
}) {
  const [countryOptions,  setCountryOptions]  = useState([]);
  const [pendingCountry,  setPendingCountry]  = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);

const [pendingZip, setPendingZip] = useState('');
const [selectedZip, setSelectedZip] = useState('');

  // load countries
  useEffect(() => {
    Countries().then((data) => setCountryOptions(data || []));
  }, []);

  useEffect(() => {
  if (!detectedCountryCode || !countryOptions.length) return;
  const found = countryOptions.find((c) => c.code === detectedCountryCode);
  if (found) {
    setPendingCountry(found);
    setSelectedCountry(found);
  }
}, [detectedCountryCode, countryOptions]);

  if (!product) return null;

  const { handlingTime, itemLocation, domesticReturns, internationalReturns } = product;

  // location display
  const locationText = [itemLocation?.city, itemLocation?.country]
    .filter(Boolean)
    .join(', ');

  // best (cheapest) rate
  const bestRate = fedexRates.length
    ? [...fedexRates].sort((a, b) => a.charge - b.charge)[0]
    : null;

const handleUpdate = () => {
  if (!pendingCountry) return;
  setSelectedCountry(pendingCountry);
  setSelectedZip(pendingZip);
  onZipChange(pendingCountry.code, pendingZip);
};

  return (
    <Box
      mt={3}
      sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}
    >
      {/* ── Header ── */}
      <Box sx={{ px: 2, py: 1.2, bgcolor: 'action.selected' }}>
        <Typography variant="subtitle2" fontWeight={700}>
          Shipping, returns &amp; payments
        </Typography>
      </Box>

      <Box sx={{ px: 2 }}>

        {/* ── Delivery to ── */}
        <Stack
          direction="row" spacing={1} alignItems="center" py={1.5}
          sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Typography variant="body2" fontWeight={600} sx={{ width: 100, flexShrink: 0 }}>
            Delivery to
          </Typography>
         <Autocomplete
  size="small"
  options={countryOptions}
  getOptionLabel={(o) => o?.label || ''}
  value={pendingCountry}
  onChange={(_, v) => setPendingCountry(v)}
  sx={{ width: 180 }}
  renderInput={(params) => (
    <TextField
      {...params}
      placeholder="Country/region"
      sx={{ '& .MuiInputBase-input': { fontSize: 13 } }}
    />
  )}
/>
<TextField
  size="small"
  placeholder="ZIP / Pincode"
  value={pendingZip}
  onChange={(e) => setPendingZip(e.target.value)}
  sx={{ width: 120, '& .MuiInputBase-input': { fontSize: 13 } }}
/>
<Button
  variant="contained" size="small"
  onClick={handleUpdate}
  disabled={!pendingCountry || ratesLoading}
  sx={{ fontSize: 12, py: 0.7, px: 2, minWidth: 80 }}
>
  {ratesLoading
    ? <CircularProgress size={12} color="inherit" />
    : 'Update'
  }
</Button>
        </Stack>

        {/* ── Accuracy note ── */}
<Stack
  direction="row"
  spacing={0.75}
  alignItems="flex-start"
  py={1}
  sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
>
  <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled', mt: '2px' }} />
  <Typography variant="body2" color="text.secondary" fontSize={12.5}>
    Enter your country and ZIP/pincode for the most accurate shipping cost and delivery estimate.
  </Typography>
</Stack>

        {/* ── Shipping ── */}
        <Row label="Shipping:">
          <Stack spacing={0.6}>
            {ratesLoading ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={13} />
                <Typography variant="body2" color="text.secondary">
                  Calculating shipping rates...
                </Typography>
              </Stack>
            ) : bestRate ? (
              <>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <LocalShippingOutlinedIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                  <Typography variant="body2">
                    <b>
                      {bestRate.charge === 0
                        ? 'Free'
                        : `${bestRate.currency} ${Number(bestRate.charge).toLocaleString()}`}
                    </b>
                    {' '}{bestRate.serviceName}
                  </Typography>
                </Stack>

                {/* all available services */}
                {fedexRates.length > 1 && (
                  <Stack spacing={0.4} pl={2.5}>
                    {fedexRates.slice(1, 4).map((rate, i) => (
                      <Typography key={i} variant="body2" color="text.secondary" fontSize={12}>
                        {rate.serviceName}:{' '}
                        {rate.charge === 0
                          ? 'Free'
                          : `${rate.currency} ${Number(rate.charge).toLocaleString()}`}
                      </Typography>
                    ))}
                  </Stack>
                )}
              </>
            ) : selectedCountry || pendingCountry ? (
  <Typography variant="body2" color="text.secondary">
    No shipping rates available for {(selectedCountry || pendingCountry)?.label}.
  </Typography>
) : (
  <Typography variant="body2" color="text.secondary">
    Select a country to see shipping rates.
  </Typography>
            )}

            {/* item location */}
            {locationText && (
              <Stack direction="row" spacing={0.5} alignItems="center" mt={0.25}>
                <LocationOnOutlinedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                <Typography variant="body2" color="text.secondary" fontSize={12}>
                  Located in: {locationText}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Row>

        {/* ── Import fees ── */}
        <Row label="Import fees:">
          {ratesLoading ? (
            <Typography variant="body2" color="text.secondary">Calculating...</Typography>
          ) : bestRate ? (
            <Stack spacing={0.25}>
              {bestRate.importFee ? (
                <>
                  <Typography variant="body2">
                    <b>
                      {bestRate.currency} {Number(bestRate.importFee).toLocaleString()}
                    </b>{' '}
                    estimated import fees
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontSize={12}>
                    Customs may apply additional duties, taxes, and processing fees on delivery.
                  </Typography>
                </>
              ) : bestRate.importFeesNote === 'may_apply' ? (
                <Stack spacing={0.25}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                    <Typography variant="body2">
                      Import fees may apply on delivery
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" fontSize={12}>
                    Customs may apply import fees when your item arrives, including
                    duties, taxes, and processing fees.
                  </Typography>
                </Stack>
              ) : (
                <Typography variant="body2" color="success.main" fontSize={13}>
                  No import fees expected for this destination.
                </Typography>
              )}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {selectedCountry
                ? 'Could not determine import fees.'
                : 'Select a country to check import fees.'}
            </Typography>
          )}
        </Row>

        {/* ── Delivery ── */}
        <Row label="Delivery:">
          <Stack spacing={0.5}>
            {ratesLoading ? (
              <Typography variant="body2" color="text.secondary">Calculating...</Typography>
            ) : fedexRates.length > 0 ? (
              <>
                {fedexRates.slice(0, 3).map((rate, i) => (
                  <Stack key={i} direction="row" spacing={0.5} alignItems="center">
                    <AccessTimeIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                    <Typography variant="body2">
                      {rate.deliveryDate ? (
                        <>Estimated by <b>{formatDate(rate.deliveryDate)}</b> · {rate.serviceName}</>
                      ) : rate.transitDays ? (
                        <>{rate.serviceName} · {rate.transitDays}</>
                      ) : (
                        <>{rate.serviceName}</>
                      )}
                    </Typography>
                  </Stack>
                ))}
                {handlingTime && (
                  <Typography variant="body2" color="text.secondary" fontSize={12} mt={0.25}>
                    + Handling time: {HANDLING_LABEL[handlingTime] || handlingTime}
                  </Typography>
                )}
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {selectedCountry || pendingCountry
  ? `No delivery estimate available for ${(selectedCountry || pendingCountry)?.label}.`
  : 'Select a country to see delivery estimate.'}
                {!selectedCountry && handlingTime && (
                  <Box component="span" display="block" mt={0.5} fontSize={12}>
                    Handling time: {HANDLING_LABEL[handlingTime] || handlingTime}
                  </Box>
                )}
              </Typography>
            )}
          </Stack>
        </Row>

        {/* ── Returns ── */}
        <Row label="Returns:">
          <Stack spacing={0.75}>
            {domesticReturns && (
              <Stack direction="row" spacing={0.5} alignItems="flex-start">
                <ReplayOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled', mt: '3px' }} />
                <Typography variant="body2">
                  {domesticReturns.accepted
                    ? `${domesticReturns.allowedWithin} days returns. ${
                        domesticReturns.shippingPaidBy === 'seller'
                          ? 'Seller pays return shipping.'
                          : 'Buyer pays return shipping.'
                      }`
                    : 'No domestic returns accepted.'}
                </Typography>
              </Stack>
            )}
            {internationalReturns && (
              <Stack direction="row" spacing={0.5} alignItems="flex-start">
                <ReplayOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled', mt: '3px' }} />
                <Typography variant="body2" color="text.secondary" fontSize={12}>
                  {internationalReturns.accepted
                    ? `International: ${internationalReturns.allowedWithin} days. ${
                        internationalReturns.shippingPaidBy === 'seller'
                          ? 'Seller pays return shipping.'
                          : 'Buyer pays return shipping.'
                      }`
                    : 'No international returns accepted.'}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Row>

      </Box>
    </Box>
  );
}