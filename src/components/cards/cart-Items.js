// 'use client';

// import React, { useEffect, useState, useRef } from 'react';
// import PropTypes from 'prop-types';
// import Image from 'next/image';
// import { useSelector } from 'react-redux';

// // mui
// import {
//   Card,
//   CardContent,
//   Stack,
//   Box,
//   Divider,
//   Typography,
//   Skeleton,
//   Chip,
//   Tooltip,
//   CircularProgress
// } from '@mui/material';
// import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
// import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// // utils
// import { formatPrice } from '@/utils/formatPrice';

// // API
// import * as api from 'src/services';

// // ─── helpers ────────────────────────────────────────────────────────────────

// /**
//  * Returns true when the destination address has enough data to call FedEx.
//  */
// function isAddressReady(dest) {
//   return Boolean(dest?.country && dest.country.trim().length > 0);
// }

// /**
//  * Pick the cheapest rate from the FedEx response array.
//  */
// function cheapestRate(rates = []) {
//   if (!rates.length) return null;
//   return rates.reduce((min, r) => (r.charge < min.charge ? r : min), rates[0]);
// }

// // ─── per-item shipping fetcher ───────────────────────────────────────────────

// /**
//  * Fetch FedEx rate for one cart item.
//  * Returns { charge, currency, serviceName, transitDays, importFeesNote } or null.
//  */
// async function fetchItemRate(item, dest) {
//   try {
//     const result = await api.getFedexRates({
//       productId: item.pid,
//       destCountry: dest.country,
//       destZip: dest.zip || '',
//       // city / state are informational only for FedEx rates API
//       // but pass them if your backend uses them in future
//       destCity: dest.city || '',
//       destState: dest.state || '',
//       destAddress: dest.address || '',   // ← add this
//     });

//     if (!result?.success || !result.rates?.length) return null;

//     return cheapestRate(result.rates);
//   } catch {
//     return null;
//   }
// }

// // ─── component ───────────────────────────────────────────────────────────────

// export default function CheckoutCard({ cart, loading, dest, onShippingCalculated,onRatesReady  }) {

  
//   const { user } = useSelector((state) => state.user);

//   // formatted item prices (subtotal per line)
//   const [formattedPrices, setFormattedPrices] = useState({});

//   // per-item shipping info  { [key]: { charge, currency, serviceName, transitDays, importFeesNote } | null }
//   const [shippingInfo, setShippingInfo] = useState({});
//   const [shippingLoading, setShippingLoading] = useState({});

//   // formatted shipping amounts
//   const [formattedShipping, setFormattedShipping] = useState({});

//   // track last dest we fetched for, to avoid redundant calls
//   const lastDestRef = useRef(null);

//   // ── format item prices ─────────────────────────────────────────────────────
//   useEffect(() => {
//     let mounted = true;

//     const loadPrices = async () => {
//       if (!cart?.length) return;

//       const results = {};

//       for (let index = 0; index < cart.length; index++) {
//         const item = cart[index];
//         const vendorId = item.vendorid;
//         const unitPrice = item.salePrice || item.price;
//         const amount = Number(unitPrice) * Number(item.quantity);
//         const key = item.sku || `${item.pid}-${index}`;

//         try {
//           results[key] = await formatPrice({ amount, vendorId, userId: user?._id || null });
//         } catch {
//           results[key] = amount;
//         }
//       }

//       if (mounted) setFormattedPrices(results);
//     };

//     loadPrices();
//     return () => { mounted = false; };
//   }, [cart, user]);

//   // ── fetch FedEx rates per item when dest address changes ──────────────────
//   useEffect(() => {
//     if (!cart?.length || !isAddressReady(dest)) return;

//     // Avoid re-fetching if the relevant dest fields haven't changed
//     const destKey = `${dest.country}|${dest.zip}`;
//     if (lastDestRef.current === destKey) return;
//     lastDestRef.current = destKey;

//     let mounted = true;

//     const loadShipping = async () => {
//       const newLoading = {};
//       cart.forEach((item, i) => {
//         const key = item.sku || `${item.pid}-${i}`;
//         newLoading[key] = true;
//       });
//       if (mounted) setShippingLoading(newLoading);

//       const newInfo = {};
//       const newFormatted = {};

//       for (let index = 0; index < cart.length; index++) {
//         const item = cart[index];
//         const key = item.sku || `${item.pid}-${index}`;

//         const rate = await fetchItemRate(item, dest);
//         newInfo[key] = rate;

//         if (rate?.charge > 0) {
//           try {
//             newFormatted[key] = await formatPrice({
//               amount: rate.charge,
//               vendorId: item.vendorid,
//               userId: user?._id || null,
//               // pass currency hint if your formatPrice supports it
//               currency: rate.currency
//             });
//           } catch {
//             newFormatted[key] = `${rate.currency} ${rate.charge.toFixed(2)}`;
//           }
//         } else if (rate) {
//           newFormatted[key] = 'Free';
//         }

//         if (mounted) {
//           setShippingInfo((prev) => ({ ...prev, [key]: rate }));
//           setFormattedShipping((prev) => ({ ...prev, [key]: newFormatted[key] }));
//           setShippingLoading((prev) => ({ ...prev, [key]: false }));
//         }
//       }

//       // bubble total shipping up to parent once all items are done
//       if (mounted && onShippingCalculated) {
//         const shippingTotal = Object.values(newInfo).reduce(
//           (sum, r) => sum + (r?.charge || 0),
//           0
//         );
//         onShippingCalculated(shippingTotal);
//         onRatesReady?.(newInfo);
//       }
//     };

//     loadShipping();
//     return () => { mounted = false; };
//   }, [cart, dest, user]);

//   // ── render ─────────────────────────────────────────────────────────────────
//   return (
//     <Card sx={{ mb: 2 }}>
//       <CardContent>
//         <Typography variant="h4" mb={1}>
//           Cart Items
//         </Typography>

//         {cart.map((item, index) => {
//           const priceKey = item.sku || `${item.pid}-${index}`;
//           const rate = shippingInfo[priceKey];
//           const isShipLoading = shippingLoading[priceKey];

//           return (
//             <React.Fragment key={priceKey}>
//               <Stack
//                 direction="row"
//                 alignItems="flex-start"
//                 justifyContent="space-between"
//                 spacing={2}
//                 py={1}
//               >
//                 {/* LEFT — image + name */}
//                 <Stack direction="row" alignItems="center" spacing={2} flex={1} minWidth={0}>
//                   {loading ? (
//                     <Skeleton variant="rounded" width={64} height={64} sx={{ flexShrink: 0 }} />
//                   ) : (
//                     <Box
//                       sx={{
//                         position: 'relative',
//                         height: 64,
//                         width: 64,
//                         flexShrink: 0,
//                         borderRadius: 1,
//                         border: '1px solid rgba(145, 158, 171, 0.32)'
//                       }}
//                     >
//                       <Image
//                         priority
//                         src={item.image}
//                         alt={item.name}
//                         fill
//                         style={{ borderRadius: 8, objectFit: 'cover' }}
//                       />
//                     </Box>
//                   )}

//                   <Box minWidth={0} flex={1}>
//                     <Typography variant="subtitle1" noWrap>
//                       {loading ? <Skeleton width={160} /> : item.name.slice(0, 30)}
//                     </Typography>

//                     {item.type !== 'simple' && !loading && item.variantName && (
//                       <Stack direction="row" gap={1} flexWrap="wrap">
//                         {item.variantName.split('/').map((val, i) => (
//                           <Typography
//                             key={val}
//                             variant="body2"
//                             sx={{ span: { textTransform: 'uppercase' } }}
//                           >
//                             <b>{val}:</b>{' '}
//                             <span>{item.variant.split('/')[i]}</span>
//                           </Typography>
//                         ))}
//                       </Stack>
//                     )}

//                     <Typography variant="body2" color="text.secondary">
//                       {loading ? (
//                         <Skeleton width={100} />
//                       ) : (
//                         <><b>Qty:</b> {item.quantity}</>
//                       )}
//                     </Typography>

//                     {/* ── Shipping row ── */}
//                     {!loading && (
//                       <Stack direction="row" alignItems="center" spacing={0.75} mt={0.5} flexWrap="wrap">
//                         <LocalShippingOutlinedIcon
//                           sx={{ fontSize: 14, color: 'text.secondary' }}
//                         />

//                         {!isAddressReady(dest) ? (
//                           <Typography variant="caption" color="text.disabled">
//                             Enter destination to see shipping
//                           </Typography>
//                         ) : isShipLoading || !(priceKey in shippingInfo) ? (
//                           <CircularProgress size={12} thickness={5} />
//                         ) : !rate ? (
//                           <Typography variant="caption" color="text.disabled">
//                             Shipping unavailable
//                           </Typography>
//                         ) : (
//                           <>
//                             <Typography variant="caption" color="text.secondary" fontWeight={600}>
//                               {formattedShipping[priceKey] ?? (rate.charge === 0 ? 'Free' : `${rate.currency} ${rate.charge}`)}
//                             </Typography>

//                             {rate.serviceName && (
//                               <Typography variant="caption" color="text.disabled">
//                                 · {rate.serviceName}
//                               </Typography>
//                             )}

//                             {rate.transitDays && (
//                               <Typography variant="caption" color="text.disabled">
//                                 · {rate.transitDays}
//                               </Typography>
//                             )}

//                             {/* Import duty note */}
//                             {rate.importFeesNote === 'may_apply' && (
//                               <Tooltip
//                                 title="Import duties & taxes may apply at the destination country. These are not included in the shipping charge shown."
//                                 arrow
//                                 placement="top"
//                               >
//                                 <Chip
//                                   icon={<InfoOutlinedIcon sx={{ fontSize: '12px !important' }} />}
//                                   label="Import duty may apply"
//                                   size="small"
//                                   variant="outlined"
//                                   color="warning"
//                                   sx={{
//                                     height: 20,
//                                     fontSize: '0.65rem',
//                                     cursor: 'help',
//                                     '& .MuiChip-label': { px: 0.75 }
//                                   }}
//                                 />
//                               </Tooltip>
//                             )}
//                           </>
//                         )}
//                       </Stack>
//                     )}
//                   </Box>
//                 </Stack>

//                 {/* RIGHT — item subtotal */}
//                 <Typography variant="subtitle1" sx={{ flexShrink: 0 }}>
//                   {formattedPrices[priceKey] || (loading ? <Skeleton width={60} /> : '—')}
//                 </Typography>
//               </Stack>

//               {index !== cart.length - 1 && <Divider />}
//             </React.Fragment>
//           );
//         })}
//       </CardContent>
//     </Card>
//   );
// }

// CheckoutCard.propTypes = {
//   cart: PropTypes.array.isRequired,
//   loading: PropTypes.bool.isRequired,
//   dest: PropTypes.shape({
//     country: PropTypes.string,
//     zip: PropTypes.string,
//     city: PropTypes.string,
//     state: PropTypes.string,
//     address: PropTypes.string, 
//   }),
//   /** Called with the summed shipping total (number) once all FedEx rates resolve */
//   onShippingCalculated: PropTypes.func,
//   onRatesReady: PropTypes.func
// };

// CheckoutCard.defaultProps = {
//   dest: {},
//   onShippingCalculated: null
// };


'use client';

import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import { useSelector } from 'react-redux';

// mui
import {
  Card,
  CardContent,
  Stack,
  Box,
  Divider,
  Typography,
  Skeleton,
  Chip,
  Tooltip,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  Collapse
} from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// utils
import { formatPrice } from '@/utils/formatPrice';

// API
import * as api from 'src/services';

// ─── helpers ────────────────────────────────────────────────────────────────

function isAddressReady(dest) {
  return Boolean(dest?.country && dest.country.trim().length > 0);
}

// ─── per-item shipping fetcher — returns ALL rates ────────────────────────

async function fetchAllRates(item, dest) {
  try {
    const result = await api.getFedexRates({
      productId:   item.pid,
      destCountry: dest.country,
      destZip:     dest.zip     || '',
      destCity:    dest.city    || '',
      destState:   dest.state   || '',
      destAddress: dest.address || '',
      quantity:    item.quantity,
    });

    if (!result?.success || !result.rates?.length) return [];

    // sort cheapest first
    return [...result.rates].sort((a, b) => a.charge - b.charge);
  } catch {
    return [];
  }
}

// ─── component ───────────────────────────────────────────────────────────────

export default function CheckoutCard({
  cart,
  loading,
  dest,
  onShippingCalculated,
  onRatesReady
}) {
  const { user } = useSelector((state) => state.user);

  const { code: currency } = useSelector((state) => state.currency);

  // formatted item prices (subtotal per line)
  const [formattedPrices, setFormattedPrices] = useState({});

  // all rates per item: { [key]: Rate[] }
  const [allRates, setAllRates] = useState({});

  // selected rate key per item: { [itemKey]: serviceType }
  const [selectedService, setSelectedService] = useState({});

  // expanded state for service picker per item: { [itemKey]: bool }
  const [expanded, setExpanded] = useState({});

  // loading state per item
  const [shippingLoading, setShippingLoading] = useState({});

  // formatted shipping per item+service: { [itemKey]: { [serviceType]: string } }
  const [formattedShipping, setFormattedShipping] = useState({});

  const lastDestRef = useRef(null);

  // ── helpers ──────────────────────────────────────────────────────────────

  const getSelectedRate = (key) => {
    const rates = allRates[key];
    if (!rates?.length) return null;
    const svc = selectedService[key];
    return rates.find((r) => r.serviceType === svc) || rates[0];
  };

  // ── format item prices ────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    const loadPrices = async () => {
      if (!cart?.length) return;
      const results = {};
      for (let index = 0; index < cart.length; index++) {
        const item = cart[index];
        const key = item.sku || `${item.pid}-${index}`;
        const unitPrice = item.salePrice || item.price;
        const amount = Number(unitPrice) * Number(item.quantity);
        try {
          results[key] = await formatPrice({ amount, vendorId: item.vendorid, userId: user?._id || null , currency });
        } catch {
          results[key] = amount;
        }
      }
      if (mounted) setFormattedPrices(results);
    };
    loadPrices();
    return () => { mounted = false; };
  }, [cart, user ,currency]);

  // ── fetch all FedEx rates per item when dest changes ──────────────────────
  useEffect(() => {
    if (!cart?.length || !isAddressReady(dest)) return;

    const destKey = `${dest.country}|${dest.zip}`;
    if (lastDestRef.current === destKey) return;
    lastDestRef.current = destKey;

    let mounted = true;

    const loadShipping = async () => {
      // set all items loading
      const initLoading = {};
      cart.forEach((item, i) => {
        initLoading[item.sku || `${item.pid}-${i}`] = true;
      });
      if (mounted) setShippingLoading(initLoading);

      const newAllRates    = {};
      const newSelected    = {};
      const newFormatted   = {};

      for (let index = 0; index < cart.length; index++) {
        const item = cart[index];
        const key  = item.sku || `${item.pid}-${index}`;

        const rates = await fetchAllRates(item, dest);
        newAllRates[key] = rates;

        // default selection = cheapest (first after sort)
        if (rates.length) newSelected[key] = rates[0].serviceType;

        // format price for every rate option
        newFormatted[key] = {};
        for (const r of rates) {
          if (r.charge > 0) {
            try {
              newFormatted[key][r.serviceType] = await formatPrice({
                amount:   r.charge,
                vendorId: item.vendorid,
                userId:   user?._id || null,
                currency 
              });
            } catch {
              newFormatted[key][r.serviceType] = `${r.currency} ${r.charge.toFixed(2)}`;
            }
          } else {
            newFormatted[key][r.serviceType] = 'Free';
          }
        }

        if (mounted) {
          setShippingLoading((prev) => ({ ...prev, [key]: false }));
          setAllRates((prev)       => ({ ...prev, [key]: rates }));
          setSelectedService((prev) => ({ ...prev, ...newSelected }));
          setFormattedShipping((prev) => ({ ...prev, [key]: newFormatted[key] }));
        }
      }

      // bubble up totals once all items done
      if (mounted && onShippingCalculated) {
        const total = Object.keys(newAllRates).reduce((sum, k) => {
          const svc   = newSelected[k];
          const rates = newAllRates[k] || [];
          const rate  = rates.find((r) => r.serviceType === svc) || rates[0];
          return sum + (rate?.charge || 0);
        }, 0);
        onShippingCalculated(total);

        // pass selected rate objects up (same shape as before)
        const ratesMap = {};
        Object.keys(newAllRates).forEach((k) => {
          const svc   = newSelected[k];
          const rates = newAllRates[k] || [];
          ratesMap[k] = rates.find((r) => r.serviceType === svc) || rates[0] || null;
        });
        onRatesReady?.(ratesMap);
      }
    };

    loadShipping();
    return () => { mounted = false; };
  }, [cart, dest, user, currency]);

  // ── when user changes service selection ───────────────────────────────────
  const handleServiceChange = (itemKey, serviceType) => {
    setSelectedService((prev) => ({ ...prev, [itemKey]: serviceType }));

    // recalculate total and bubble up
    const updatedSelected = { ...selectedService, [itemKey]: serviceType };

    const total = Object.keys(allRates).reduce((sum, k) => {
      const svc   = updatedSelected[k];
      const rates = allRates[k] || [];
      const rate  = rates.find((r) => r.serviceType === svc) || rates[0];
      return sum + (rate?.charge || 0);
    }, 0);
    onShippingCalculated?.(total);

    const ratesMap = {};
    Object.keys(allRates).forEach((k) => {
      const svc   = updatedSelected[k];
      const rates = allRates[k] || [];
      ratesMap[k] = rates.find((r) => r.serviceType === svc) || rates[0] || null;
    });
    onRatesReady?.(ratesMap);
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h4" mb={1}>
          Cart Items
        </Typography>

        {cart.map((item, index) => {
          const priceKey      = item.sku || `${item.pid}-${index}`;
          const isShipLoading = shippingLoading[priceKey];
          const rates         = allRates[priceKey] || [];
          const selectedRate  = getSelectedRate(priceKey);
          const isExpanded    = expanded[priceKey] || false;
          const hasMultiple   = rates.length > 1;

          return (
            <React.Fragment key={priceKey}>
              <Stack
                direction="row"
                alignItems="flex-start"
                justifyContent="space-between"
                spacing={2}
                py={1}
              >
                {/* LEFT — image + name */}
                <Stack direction="row" alignItems="flex-start" spacing={2} flex={1} minWidth={0}>
                  {loading ? (
                    <Skeleton variant="rounded" width={64} height={64} sx={{ flexShrink: 0 }} />
                  ) : (
                    <Box
                      sx={{
                        position: 'relative',
                        height: 64,
                        width: 64,
                        flexShrink: 0,
                        borderRadius: 1,
                        border: '1px solid rgba(145, 158, 171, 0.32)'
                      }}
                    >
                      <Image
                        priority
                        src={item.image}
                        alt={item.name}
                        fill
                        style={{ borderRadius: 8, objectFit: 'cover' }}
                      />
                    </Box>
                  )}

                  <Box minWidth={0} flex={1}>
                    <Typography variant="subtitle1" noWrap>
                      {loading ? <Skeleton width={160} /> : item.name.slice(0, 30)}
                    </Typography>

                    {item.type !== 'simple' && !loading && item.variantName && (
                      <Stack direction="row" gap={1} flexWrap="wrap">
                        {item.variantName.split('/').map((val, i) => (
                          <Typography
                            key={val}
                            variant="body2"
                            sx={{ span: { textTransform: 'uppercase' } }}
                          >
                            <b>{val}:</b>{' '}
                            <span>{item.variant.split('/')[i]}</span>
                          </Typography>
                        ))}
                      </Stack>
                    )}

                    <Typography variant="body2" color="text.secondary">
                      {loading ? <Skeleton width={100} /> : <><b>Qty:</b> {item.quantity}</>}
                    </Typography>

                    {/* ── Shipping section ── */}
                    {!loading && (
                      <Box mt={0.75}>
                        {!isAddressReady(dest) ? (
                          <Stack direction="row" alignItems="center" spacing={0.75}>
                            <LocalShippingOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.disabled">
                              Enter destination to see shipping
                            </Typography>
                          </Stack>
                        ) : isShipLoading || !(priceKey in allRates) ? (
                          <Stack direction="row" alignItems="center" spacing={0.75}>
                            <LocalShippingOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <CircularProgress size={12} thickness={5} />
                          </Stack>
                        ) : !rates.length ? (
                          <Stack direction="row" alignItems="center" spacing={0.75}>
                            <LocalShippingOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.disabled">
                              Shipping unavailable
                            </Typography>
                          </Stack>
                        ) : (
                          <Box>
                            {/* Selected service summary row */}
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={0.75}
                              flexWrap="wrap"
                              onClick={hasMultiple ? () => setExpanded((p) => ({ ...p, [priceKey]: !isExpanded })) : undefined}
                              sx={hasMultiple ? { cursor: 'pointer', userSelect: 'none' } : {}}
                            >
                              <LocalShippingOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />

                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                {formattedShipping[priceKey]?.[selectedRate?.serviceType] ??
                                  (selectedRate?.charge === 0 ? 'Free' : `${selectedRate?.currency} ${selectedRate?.charge}`)}
                              </Typography>

                              {selectedRate?.serviceName && (
                                <Typography variant="caption" color="text.disabled">
                                  · {selectedRate.serviceName}
                                </Typography>
                              )}

                              {selectedRate?.transitDays && (
                                <Typography variant="caption" color="text.disabled">
                                  · {selectedRate.transitDays}
                                </Typography>
                              )}

                              {selectedRate?.importFeesNote === 'may_apply' && (
                                <Tooltip
                                  title="Import duties & taxes may apply at the destination country. These are not included in the shipping charge shown."
                                  arrow
                                  placement="top"
                                >
                                  <Chip
                                    icon={<InfoOutlinedIcon sx={{ fontSize: '12px !important' }} />}
                                    label="Import duty may apply"
                                    size="small"
                                    variant="outlined"
                                    color="warning"
                                    sx={{
                                      height: 20,
                                      fontSize: '0.65rem',
                                      cursor: 'help',
                                      '& .MuiChip-label': { px: 0.75 }
                                    }}
                                  />
                                </Tooltip>
                              )}

                              {/* toggle chevron if multiple options */}
                              {hasMultiple && (
                                <Stack direction="row" alignItems="center" spacing={0.25}>
                                  <Typography variant="caption" color="primary.main" fontWeight={600}>
                                    {rates.length} options
                                  </Typography>
                                  {isExpanded
                                    ? <ExpandLessIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                                    : <ExpandMoreIcon sx={{ fontSize: 14, color: 'primary.main' }} />}
                                </Stack>
                              )}
                            </Stack>

                            {/* Expandable service picker */}
                            {hasMultiple && (
                              <Collapse in={isExpanded}>
                                <Box
                                  sx={{
                                    mt: 1,
                                    ml: 0.25,
                                    pl: 1.5,
                                    borderLeft: '2px solid',
                                    borderColor: 'divider'
                                  }}
                                >
                                  <RadioGroup
                                    value={selectedService[priceKey] || rates[0]?.serviceType}
                                    onChange={(e) => handleServiceChange(priceKey, e.target.value)}
                                  >
                                    {rates.map((r) => (
                                      <FormControlLabel
                                        key={r.serviceType}
                                        value={r.serviceType}
                                        control={<Radio size="small" sx={{ py: 0.5 }} />}
                                        label={
                                          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                                            <Typography variant="caption" fontWeight={600}>
                                              {formattedShipping[priceKey]?.[r.serviceType] ??
                                                (r.charge === 0 ? 'Free' : `${r.currency} ${r.charge}`)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                              {r.serviceName}
                                            </Typography>
                                            {r.transitDays && (
                                              <Typography variant="caption" color="text.disabled">
                                                · {r.transitDays}
                                              </Typography>
                                            )}
                                          </Stack>
                                        }
                                        sx={{ mx: 0, alignItems: 'center' }}
                                      />
                                    ))}
                                  </RadioGroup>
                                </Box>
                              </Collapse>
                            )}
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                </Stack>

                {/* RIGHT — item subtotal */}
                <Typography variant="subtitle1" sx={{ flexShrink: 0 }}>
                  {formattedPrices[priceKey] || (loading ? <Skeleton width={60} /> : '—')}
                </Typography>
              </Stack>

              {index !== cart.length - 1 && <Divider />}
            </React.Fragment>
          );
        })}
      </CardContent>
    </Card>
  );
}

CheckoutCard.propTypes = {
  cart: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  dest: PropTypes.shape({
    country: PropTypes.string,
    zip:     PropTypes.string,
    city:    PropTypes.string,
    state:   PropTypes.string,
    address: PropTypes.string
  }),
  onShippingCalculated: PropTypes.func,
  onRatesReady:         PropTypes.func
};

CheckoutCard.defaultProps = {
  dest: {},
  onShippingCalculated: null
};


