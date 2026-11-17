'use client';

import React, {useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  Box, Container, Grid, Stack, Typography,
  Divider, IconButton,
} from '@mui/material';
import ChevronLeftIcon  from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { getAssetUrl } from '@/utils/getAssetUrl';
import ProductDetailsSummary from 'src/components/_main/product/summary';
import SellerPolicies from 'src/components/_main/product/SellerPolicies';

import { useSelector } from 'react-redux';

import RelatedProducts from 'src/components/_main/product/Relatedproducts';

// ── Human-readable labels for flat additionalDetails fields ──
const DETAIL_LABELS = {
  packageLength: 'Package Length',
  packageWidth:  'Package Width',
  packageHeight: 'Package Height',
  packageWeight: 'Package Weight',
  dimensionUnit: 'Dimension Unit',
  weightUnit:    'Weight Unit',
};

const arrowSx = (side) => ({
  position: 'absolute', top: '50%', transform: 'translateY(-50%)', [side]: 14,
  width: 36, height: 36, bgcolor: '#fff', border: '1px solid #e2e7ea',
  boxShadow: '0 2px 8px rgba(38,59,72,.06)', '&:hover': { bgcolor: '#fff' },
});

function StarRating({ rating = 0 }) {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <Stack direction="row" spacing={0.25} alignItems="center">
      {'★'.repeat(full).split('').map((_, i) => (
        <Typography key={`f${i}`} color="warning.main" lineHeight={1} fontSize={18}>★</Typography>
      ))}
      {half && <Typography color="warning.main" lineHeight={1} fontSize={18}>½</Typography>}
      {'☆'.repeat(empty).split('').map((_, i) => (
        <Typography key={`e${i}`} color="text.disabled" lineHeight={1} fontSize={18}>☆</Typography>
      ))}
    </Stack>
  );
}


export default function ProductDetailPage({ params }) {
  const { slug } = params;
  const { user } = useSelector((state) => state.user);

  const [data, setData]                     = useState(null);
  const [totalReviews, setTotalReviews]     = useState(0);
  const [totalRating, setTotalRating]       = useState(0);
  const [selectedImage, setSelectedImage]   = useState(null);
  const [selectedAttrs, setSelectedAttrs]   = useState({});
  const [shippingPolicy, setShippingPolicy] = useState(null);
  const [fedexRates, setFedexRates]   = useState([]);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [detectedCountryCode, setDetectedCountryCode] = useState(null);

  // ── fetchFedexRates — defined FIRST before any useEffect ──
const fetchFedexRates = useCallback(async (destCountryCode, destZip = '') => {
  if (!destCountryCode) return;
  setRatesLoading(true);
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fedex/rates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', },
      body: JSON.stringify({
        productId: data?._id,
        destCountry: destCountryCode,
        destZip: destZip || '',
      }),
    });
      const json = await res.json();
      if (json.success) setFedexRates(json.rates || []);
    } catch (err) {
      console.error('FedEx fetch error:', err);
    } finally {
      setRatesLoading(false);
    }
  }, [data]);


  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${slug}`)
      .then((r) => r.json())
      .then((res) => {
        if (!res.success) return notFound();
        const product = res.data;
        setData(product);
        setTotalReviews(res.totalReviews ?? 0);
        setTotalRating(res.totalRating ?? 0);
        setSelectedImage(product.images?.[0]?.url || null);

        const BASE = process.env.NEXT_PUBLIC_API_URL;
        const fetchJson = (url) => fetch(url).then((r) => r.json()).catch(() => null);

        if (product.shipping_policy) {
          fetchJson(`${BASE}/api/shipping-policy/${product.shipping_policy}`)
            .then((sp) => { if (sp?.success) setShippingPolicy(sp.data); });
        }
       
      })
      .catch(() => notFound());
  }, [slug]);

  // ── detect country from IP + auto fetch rates ──
  useEffect(() => {
    if (!data) return;
    const detectAndFetch = async () => {
      try {
        const geoRes       = await fetch('https://ipapi.co/json/');
        const geoData      = await geoRes.json();
        const detectedCode = geoData?.country_code || 'AE';
        setDetectedCountryCode(detectedCode);
        fetchFedexRates(detectedCode);
      } catch {
        setDetectedCountryCode('AE');
        fetchFedexRates('AE');
      }
    };
    detectAndFetch();
  }, [data]);

   const isUsingVariation = useMemo(() => {
    if (!data?.hasVariations) return false;
    return data.variationAttributes.every(
      (attr) => selectedAttrs[attr.name] && selectedAttrs[attr.name] !== 'default'
    );
  }, [data, selectedAttrs]);

useEffect(() => {
  if (!data) return;
  const destCountry = user?.address?.country || 'AE';
  fetchFedexRates(destCountry);
}, [data]);


  const activeVariation = useMemo(() => {
    if (!isUsingVariation) return null;
    return data.variations.find((v) =>
      Object.entries(selectedAttrs).every(([k, val]) => v.attributes[k] === val)
    );
  }, [data, selectedAttrs, isUsingVariation]);

  const galleryImages = useMemo(() => {
    return activeVariation?.images?.length ? activeVariation.images : data?.images || [];
  }, [activeVariation, data]);

  useEffect(() => {
    if (galleryImages.length) setSelectedImage(galleryImages[0].url);
  }, [galleryImages]);

  if (!data) return null;

  const selectedIndex = Math.max(0, galleryImages.findIndex((i) => i.url === selectedImage));
const goTo = (dir) => {
  if (!galleryImages.length) return;
  setSelectedImage(galleryImages[(selectedIndex + dir + galleryImages.length) % galleryImages.length].url);
};

  const ad = data.additionalDetails || {};

  const flatDetails = Object.entries(DETAIL_LABELS)
    .map(([key, label]) => ({ label, value: ad[key] }))
    .filter(({ value }) => value !== undefined && value !== '' && value !== null);

  const customSpecifics = Array.isArray(ad.customSpecifics)
    ? ad.customSpecifics.filter((s) => s.name && s.value)
    : [];

  const allSpecifics = [
    ...flatDetails,
    ...customSpecifics.map((s) => ({ label: s.name, value: s.value })),
  ];




  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>

      {/* BREADCRUMB */}
      <Stack direction="row" alignItems="center" spacing={0.75} mb={2.5} flexWrap="wrap"
        sx={{ fontSize: 12, color: 'text.secondary' }}>
        {[data.category?.name, data.subCategory?.name, data.childCategory?.name]
          .filter(Boolean)
          .map((name, i, arr) => (
            <React.Fragment key={name}>
              <Typography variant="caption" color={i === arr.length - 1 ? 'text.primary' : 'text.secondary'}
                fontWeight={i === arr.length - 1 ? 500 : 400}>
                {name}
              </Typography>
              {i < arr.length - 1 && <ChevronRightIcon sx={{ fontSize: 14, color: 'text.disabled' }} />}
            </React.Fragment>
          ))}
      </Stack>

      <Grid container spacing={{ xs: 3, md: 5 }}>

        {/* ════════ LEFT — GALLERY ════════ */}
        <Grid size={{ xs: 12, md: 6.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '72px minmax(0, 1fr)', gap: 1.5, alignItems: 'start' }}>

            {/* thumbnails */}
            <Stack spacing={1.25}>
              {galleryImages.map((img, i) => {
                const active = selectedImage === img.url;
                return (
                  <Box
                    key={i}
                    onClick={() => setSelectedImage(img.url)}
                    sx={{
                      border: '1.5px solid',
                      borderColor: active ? '#ed9b7d' : 'divider',
                      borderRadius: '11px',
                      p: 0.5,
                      cursor: 'pointer',
                      bgcolor: '#fff',
                      textAlign: 'center',
                      boxShadow: active ? '0 0 0 1px #ed9b7d' : 'none',
                      transition: 'all .15s',
                    }}
                  >
                    <Box sx={{ bgcolor: '#f5f5f5', borderRadius: '8px', overflow: 'hidden', lineHeight: 0 }}>
                      <Image
                        src={getAssetUrl(img.url)}
                        width={70}
                        height={70}
                        alt=""
                        style={{ width: '100%', height: 'auto', aspectRatio: '1', objectFit: 'cover' }}
                      />
                    </Box>
                    {(img.label || img.alt) && (
                      <Typography variant="caption" sx={{ fontSize: 11, display: 'block', mt: 0.25 }}>
                        {img.label || img.alt}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Stack>

            {/* main image */}
            <Box
              sx={{
                position: 'relative',
                height: { xs: 320, md: 440 },
                bgcolor: '#f5f5f5',
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {selectedImage && (
                <Image
                  src={getAssetUrl(selectedImage)}
                  width={600}
                  height={600}
                  alt={data.title}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              )}

              {galleryImages.length > 1 && (
                <>
                  <IconButton onClick={() => goTo(-1)} sx={arrowSx('left')} aria-label="Previous image">
                    <ChevronLeftIcon fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => goTo(1)} sx={arrowSx('right')} aria-label="Next image">
                    <ChevronRightIcon fontSize="small" />
                  </IconButton>
                  <Box sx={{
                    position: 'absolute', left: 18, bottom: 18,
                    bgcolor: 'rgba(255,255,255,.93)', borderRadius: '6px',
                    px: 1.25, py: 0.75, fontSize: 11, color: '#3d505e', pointerEvents: 'none',
                  }}>
                    {selectedIndex + 1} / {galleryImages.length}
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Grid>

        {/* ════════ RIGHT — DETAIL PANEL ════════ */}
        <Grid size={{ xs: 12, md: 5.5 }}>
          <Box>

            {/* BRAND */}
            {data.isBranded && data.brand?.name && (
              <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.4px', color: '#657989', mb: 0.75 }}>
                {data.brand.name.toUpperCase()}
              </Typography>
            )}

            {/* TITLE */}
            <Typography component="h1" sx={{ fontSize: { xs: 24, md: 28 }, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.5px', mb: 1 }}>
              {data.title}
            </Typography>

            {/* RATING */}
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <StarRating rating={totalRating} />
              <Typography variant="body2" color="text.secondary" fontSize={12}>
                {totalRating > 0 ? totalRating.toFixed(1) : 'No ratings yet'}
                {totalReviews > 0 && ` (${totalReviews} review${totalReviews !== 1 ? 's' : ''})`}
              </Typography>
            </Stack>

            {/* PRICING + VARIATIONS + CART ACTIONS */}
            <ProductDetailsSummary
              product={data}
              selectedAttrs={selectedAttrs}
              setSelectedAttrs={setSelectedAttrs}
              activeVariation={activeVariation}
            />

            {/* POLICIES BLOCK */}
            <SellerPolicies
              shippingPolicy={shippingPolicy}
              product={data}
              fedexRates={fedexRates}
              ratesLoading={ratesLoading}
              onZipChange={(countryCode, zip) => fetchFedexRates(countryCode, zip)}
              detectedCountryCode={detectedCountryCode}
            />
          </Box>
        </Grid>
      </Grid>

      {/* ════════ DESCRIPTION + ITEM SPECIFICS ════════ */}
      {(data.description || allSpecifics.length > 0) && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: { xs: 4, md: 7.5 },
            alignItems: 'start',
            mt: 5, pt: 5,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          {data.description ? (
            <Box>
              <Typography sx={{ fontSize: 10, fontWeight: 600, letterSpacing: '1px', color: '#768995' }}>
                THE DETAILS
              </Typography>
              <Typography sx={{ fontSize: 24, fontWeight: 600, lineHeight: 1.25, letterSpacing: '-0.5px', mt: 1.25, mb: 2 }}>
                Product Description
              </Typography>
              <Typography sx={{ fontSize: 13, lineHeight: 1.9, color: '#687b89', maxWidth: 480 }}>
                {data.description}
              </Typography>
            </Box>
          ) : <Box />}

          {allSpecifics.length > 0 && (
            <Box>
              <Typography sx={{ fontSize: 17, fontWeight: 600 }}>Item specifics</Typography>
              <Box sx={{ mt: 1.5, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, columnGap: 3 }}>
                {allSpecifics.map(({ label, value }, i) => (
                  <Box key={i} sx={{ py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography sx={{ fontSize: 10, color: '#7c8b96' }}>{label}</Typography>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 500, color: 'text.primary', mt: 0.25 }}>
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* ════════ YOU MAY ALSO LIKE ════════ */}
      <Box mt={6}>
        <Typography sx={{ fontSize: 10, fontWeight: 600, letterSpacing: '1px', color: '#768995' }}>
          KEEP EXPLORING
        </Typography>
        <Typography sx={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.5px', mt: 0.75, mb: 2.5 }}>
          You may also like
        </Typography>
        <RelatedProducts slug={slug} />
      </Box>
    </Container>
  );
}