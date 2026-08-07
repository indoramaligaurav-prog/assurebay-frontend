'use client';

import React, {useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  Box, Container, Grid, Stack, Typography,
  Divider, Chip,
} from '@mui/material';

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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={5}>

        {/* ════════ LEFT — GALLERY ════════ */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', gap: 2, p: 3, borderRadius: 3 }}>
            <Stack direction="column" spacing={1}>
              {galleryImages.map((img, i) => (
                <Box
                  key={i}
                  onClick={() => setSelectedImage(img.url)}
                  sx={{
                    border: selectedImage === img.url ? '2px solid' : '1px solid',
                    borderColor: selectedImage === img.url ? 'primary.main' : 'divider',
                    p: 0.5,
                    cursor: 'pointer',
                    borderRadius: 1,
                  }}
                >
                  <Image
                    src={getAssetUrl(img.url)}
                    width={70}
                    height={70}
                    alt=""
                    style={{ objectFit: 'cover', borderRadius: 4 }}
                  />
                </Box>
              ))}
            </Stack>

            <Box sx={{ flex: 1 }}>
              {selectedImage && (
                <Image
                  src={getAssetUrl(selectedImage)}
                  width={600}
                  height={600}
                  alt={data.title}
                  style={{
                    width: '100%',
                    height: '420px',
                    objectFit: 'contain',
                    background: '#f5f5f5',
                    borderRadius: 8,
                  }}
                />
              )}
            </Box>
          </Box>
             <RelatedProducts slug={slug} />
        </Grid>

        {/* ════════ RIGHT — DETAIL PANEL ════════ */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box mt={{ xs: 2, md: 3 }}>

            {/* BREADCRUMB CHIPS */}
            <Stack direction="row" spacing={1} mb={1.5} flexWrap="wrap">
              {data.category?.name      && <Chip label={data.category.name}      size="small" variant="outlined" />}
              {data.subCategory?.name   && <Chip label={data.subCategory.name}   size="small" variant="outlined" />}
              {data.childCategory?.name && <Chip label={data.childCategory.name} size="small" variant="outlined" />}
            </Stack>

            {/* TITLE */}
            <Typography variant="h5" fontWeight={700} lineHeight={1.35} mb={0.5}>
              {data.title}
            </Typography>

            {/* BRAND */}
            {data.isBranded && data.brand?.name && (
              <Typography variant="body2" color="text.secondary" mb={0.5}>
                Brand: <b>{data.brand.name}</b>
              </Typography>
            )}

            {/* RATING */}
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <StarRating rating={totalRating} />
              <Typography variant="body2" color="text.secondary">
                {totalRating > 0 ? totalRating.toFixed(1) : 'No ratings yet'}
                {totalReviews > 0 && ` (${totalReviews} review${totalReviews !== 1 ? 's' : ''})`}
              </Typography>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            {/*
              ── PRICING + VARIATIONS + CART ACTIONS ──
              All handled inside ProductDetailsSummary (with currency conversion + discount logic)
            */}
            <ProductDetailsSummary
              product={data}
              selectedAttrs={selectedAttrs}
              setSelectedAttrs={setSelectedAttrs}
              activeVariation={activeVariation}
            />

            {/* ── POLICIES BLOCK ── */}
            <SellerPolicies
              shippingPolicy={shippingPolicy}
               product={data}
                fedexRates={fedexRates}
                ratesLoading={ratesLoading}
                onZipChange={(countryCode ,zip) => fetchFedexRates(countryCode,zip)}
                  detectedCountryCode={detectedCountryCode}
            />

          </Box>
        </Grid>
      </Grid>

      {/* ════════ DESCRIPTION ════════ */}
      {data.description && (
        <Box mt={6}>
          <Typography variant="h6" fontWeight={600} mb={1}>
            Product Description
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary" lineHeight={1.9}>
            {data.description}
          </Typography>
        </Box>
      )}

      {/* ════════ ITEM SPECIFICS — eBay two-column table ════════ */}
      {allSpecifics.length > 0 && (
        <Box mt={5} mb={4}>
          <Typography variant="h6" fontWeight={600} mb={1}>
            Item Specifics
          </Typography>
          <Divider />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              border: '1px solid',
              borderTop: 'none',
              borderColor: 'divider',
            }}
          >
            {allSpecifics.map(({ label, value }, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  borderTop: '1px solid',
                  borderRight: { sm: i % 2 === 0 ? '1px solid' : 'none' },
                  borderColor: 'divider',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Box
                  sx={{
                    width: 160,
                    flexShrink: 0,
                    bgcolor: 'action.selected',
                    px: 1.5,
                    py: 1.2,
                  }}
                >
                  <Typography variant="body2" fontWeight={600} color="text.secondary">
                    {label}
                  </Typography>
                </Box>
                <Box sx={{ px: 1.5, py: 1.2, flex: 1 }}>
                  <Typography variant="body2">{value}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Container>
  );
}