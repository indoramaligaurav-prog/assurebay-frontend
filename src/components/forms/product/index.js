'use client';

import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from '@bprogress/next';
import { useDropzone } from 'react-dropzone';
import { Form, FormikProvider, useFormik } from 'formik';
import MenuItem from '@mui/material/MenuItem';
import * as api from 'src/services';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { currencyConfig } from "@/utils/currency";
import { getAssetUrl } from '@/utils/getAssetUrl';

import { Countries } from 'src/utils/Countries';

import { useSelector } from 'react-redux';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Tooltip from '@mui/material/Tooltip';

import {
  Card,
  Stack,
  CardHeader,
  CardContent,
  Button,
  Grid,
  Box,
  Typography,
  IconButton,
  Autocomplete,
  TextField,
  FormControlLabel,
  Switch,
  Checkbox,
  Divider,
  InputAdornment,
} from '@mui/material';

// ─────────────────────────────────────────────────────────────────────────────

export default function ProductForm({
  categories = [],
  subCategories = [],
  childCategories = [],
  brands = [],
  policies = {},
    product = null,
      prefill = {},
}) {


  const isEdit = !!product;
const isPublished = product?.status === 'published';
const isPending = product?.status === 'pending';
const isRestricted = isPublished || isPending;

  const router = useRouter();
  const [images, setImages] = useState([]); // newly added files (File objects)
const [existingImages, setExistingImages] = useState(product?.images || []); // already-uploaded images from DB
  const [openBrandModal, setOpenBrandModal] = useState(false);

   const user = useSelector((state) => state.user.user);
        console.log('currencySymbol =>', user);
  const country = user?.zone?.country || 'US';

  
  const currencySymbol =
    currencyConfig[country]?.symbol || '$';



    const [openShippingInfo, setOpenShippingInfo] = useState(false);
    const [openPickupLocation, setOpenPickupLocation] = useState(false);
    const [pickupLocations, setPickupLocations] = useState([]);

    const [countryOptions, setCountryOptions] = useState([]);

  /* ── image upload ── */
  const onDrop = useCallback((acceptedFiles) => {
    const files = acceptedFiles.map((file) =>
      Object.assign(file, { preview: URL.createObjectURL(file) })
    );
    setImages((prev) => [...prev, ...files]);
  }, []);

  const removeImage = (index) => setImages((prev) => prev.filter((_, i) => i !== index));
const removeExistingImage = (index) =>
  setExistingImages((prev) => prev.filter((_, i) => i !== index));

  React.useEffect(() => {
    return () => images.forEach((f) => URL.revokeObjectURL(f.preview));
  }, [images]);

  React.useEffect(() => {
  Countries().then((data) => setCountryOptions(data || []));
}, []);

  React.useEffect(() => {
  api.getPickupLocations()
    .then((res) => {
     setPickupLocations(res?.data || []);
    })
    .catch((err) => {
      console.error('Failed to load pickup locations:', err);
    });
}, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
  });

  const { shipping_policies = [], return_policies = [], cancel_policies = [] } = policies;

  /* ── mutation ── */
const { mutate, isPending: isSaving } = useMutation({
  mutationFn: (formData) =>
    isEdit ? api.updateProduct(product._id, formData) : api.createProduct(formData),
  retry: false,
  onSuccess: () => {
    toast.success(isEdit ? 'Product updated successfully' : 'Product created successfully');
    router.push('/vendor/products');
  },
  onError: (error) => {
    toast.error(error?.response?.data?.message || 'Failed to save product');
  },
});

  const [savingPickupLocation, setSavingPickupLocation] = useState(false);

  const [pickupForm, setPickupForm] = useState({
  name: '',
  streetAddress: '',
  country: '',
  state: '',
  city: '',
  zipcode: '',
});

// ✅ moved here, top-level in ProductForm
const handleSavePickupLocation = async () => {
  if (!pickupForm.name.trim()) {
    return toast.error('Enter location name');
  }
  if (!pickupForm.streetAddress.trim()) {
    return toast.error('Enter street address');
  }
  if (!pickupForm.country) {
    return toast.error('Select country');
  }
  if (!pickupForm.state.trim()) {
    return toast.error('Enter state');
  }
  if (!pickupForm.city.trim()) {
    return toast.error('Enter city');
  }

  try {
    setSavingPickupLocation(true);
    const res = await api.createPickupLocation(pickupForm);
    const newLocation = res?.data;
    if (!newLocation) throw new Error('Invalid server response');

    setPickupLocations((prev) => [newLocation, ...prev]);
    setFieldValue('itemLocation.pickupLocation', newLocation);
    setFieldValue('itemLocation.streetAddress', newLocation.streetAddress || '');
    setFieldValue('itemLocation.country', newLocation.country || '');
    setFieldValue('itemLocation.state', newLocation.state || '');
    setFieldValue('itemLocation.city', newLocation.city || '');
    setFieldValue('itemLocation.zipcode', newLocation.zipcode || '');

    setOpenPickupLocation(false);
    setPickupForm({ name: '', streetAddress: '', country: '', state: '', city: '', zipcode: '' });
    toast.success('Pickup location added');
  } catch (error) {
    toast.error(error?.response?.data?.message || 'Failed to save pickup location');
  } finally {
    setSavingPickupLocation(false);
  }
};

  /* ── validation ── */
  const validateBeforeSubmit = (v) => {
    if (!v.title) return toast.error('Product title is required');
    if (!v.category) return toast.error('Select category');
    if (!v.subCategory) return toast.error('Select sub category');
    if (!v.childCategory) return toast.error('Select child category');
    if (!v.condition) return toast.error('Select product condition');
    if (v.isBranded && !v.brand) return toast.error('Select brand');
    if (!v.itemsInSet || v.itemsInSet < 1) return toast.error('Items in set must be at least 1');
    if (!v.itemstock || v.itemstock < 1) return toast.error('Stock must be greater than 0');
    if (v.pricingMode === 'declare' && (!v.mrp || v.mrp <= 0))
      return toast.error('Enter valid MRP');
    if (
      v.discountPrice &&
      (Number(v.discountPrice) <= 0 || Number(v.discountPrice) >= Number(v.mrp))
    ) {
      return toast.error('Discount price must be less than MRP');
    }
    // if (!v.taxes.length) return toast.error('Add at least one tax');
    // for (let i = 0; i < v.taxes.length; i++) {
    //   if (!v.taxes[i].taxType) return toast.error(`Select tax type for tax #${i + 1}`);
    //   if (v.taxes[i].taxType !== 'NONE' && v.taxes[i].taxRate === '')
    //     return toast.error(`Select tax rate for tax #${i + 1}`);
    // }
    if (!v.shipping_policy) return toast.error('Unable to determine shipping policy');

   if (!v.additionalDetails.countryOfManufacture) return toast.error('Select country of manufacture');
    if (!v.itemLocation.pickupLocation)
  return toast.error('Select a pickup location');
    if (!v.hasVariations && images.length === 0 && existingImages.length === 0)
            return toast.error('Upload at least one product image');
    if (v.hasVariations) {
      if (!v.variationAttributes.length) return toast.error('Add at least one variation attribute');
      for (let i = 0; i < v.variationAttributes.length; i++) {
        if (!v.variationAttributes[i].name)
          return toast.error(`Enter attribute name for variation #${i + 1}`);
        if (!v.variationAttributes[i].values.length)
          return toast.error(`Add values for variation ${v.variationAttributes[i].name}`);
      }
      if (!v.variations.length) return toast.error('Generate variations');
      for (let i = 0; i < v.variations.length; i++) {
        if (!v.variations[i].price) return toast.error(`Enter price for variation #${i + 1}`);
        if (!v.variations[i].sku) return toast.error(`Enter SKU for variation #${i + 1}`);
        if (!v.variations[i].stock) return toast.error(`Enter stock for variation #${i + 1}`);
      }
    }
    if (!v.description || v.description.length < 10)
      return toast.error('Product description must be at least 10 characters');
    return true;
  };

  /* ── variation image uploader ── */
  const VariationImageUploader = ({ images, existingImages, onChange, onChangeExisting, disabled }) => {
    const onDrop = (files) => {
      if (disabled) return;
      const mapped = files.map((f) => Object.assign(f, { preview: URL.createObjectURL(f) }));
      onChange([...(images || []), ...mapped]);
    };
    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'image/*': [] },
     disabled
    });
    return (
      <Box>
        <Box
          {...getRootProps()}
          sx={{
            border: '1px dashed #aaa',
            borderRadius: 1,
            p: 1,
            textAlign: 'center',
            cursor: 'pointer',
          }}
        >
          <input {...getInputProps()} />
          <Typography variant="caption">Upload Variation Images</Typography>
        </Box>
        <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
          {existingImages?.map((img, i) => (
            <Box key={`existing-${i}`} sx={{ position: 'relative' }}>
              <Box
                component="img"
                src={getAssetUrl(img?.url)}
                sx={{ width: 60, height: 60, borderRadius: 1, objectFit: 'cover' }}
              />
              <IconButton
                size="small"
                disabled={disabled}
                sx={{ position: 'absolute', top: -6, right: -6, bgcolor: '#000', color: '#fff' }}
                onClick={() => onChangeExisting(existingImages.filter((_, x) => x !== i))}
              >
                ✕
              </IconButton>
            </Box>
          ))}
          {images?.map((img, i) => (
            <Box key={`new-${i}`} sx={{ position: 'relative' }}>
              <Box
                component="img"
                src={img.preview}
                sx={{ width: 60, height: 60, borderRadius: 1, objectFit: 'cover' }}
              />
              <IconButton
                size="small"
                disabled={disabled}
                sx={{ position: 'absolute', top: -6, right: -6, bgcolor: '#000', color: '#fff' }}
                onClick={() => onChange(images.filter((_, x) => x !== i))}
              >
                ✕
              </IconButton>
            </Box>
          ))}
        </Stack>
      </Box>
    );
  };

  // ── FedEx standard package limits ──
const FEDEX_MAX_LENGTH_CM = 274;
const FEDEX_MAX_LENGTH_GIRTH_CM = 330;
const FEDEX_MAX_WEIGHT_KG = 68;

const toCm = (value, unit) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;

  switch (unit) {
    case 'mm':
      return n / 10;
    case 'inch':
      return n * 2.54;
    case 'm':
      return n * 100;
    case 'cm':
    default:
      return n;
  }
};

const toKg = (value, unit) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;

  switch (unit) {
    case 'g':
      return n / 1000;
    case 'lb':
      return n * 0.45359237;
    case 'oz':
      return n * 0.0283495231;
    case 'kg':
    default:
      return n;
  }
};

const getAutomaticShippingPolicy = (additionalDetails) => {
  const length = toCm(
    additionalDetails?.packageLength,
    additionalDetails?.dimensionUnit
  );

  const width = toCm(
    additionalDetails?.packageWidth,
    additionalDetails?.dimensionUnit
  );

  const height = toCm(
    additionalDetails?.packageHeight,
    additionalDetails?.dimensionUnit
  );

  const weight = toKg(
    additionalDetails?.packageWeight,
    additionalDetails?.weightUnit
  );

  const girth = (2 * width) + (2 * height);
  const lengthAndGirth = length + girth;

  const needsFreight =
    length > FEDEX_MAX_LENGTH_CM ||
    lengthAndGirth > FEDEX_MAX_LENGTH_GIRTH_CM ||
    weight > FEDEX_MAX_WEIGHT_KG;

  return {
    needsFreight,
    length,
    width,
    height,
    weight,
    girth,
    lengthAndGirth,
  };
};

  /* ── formik ── */
  const formik = useFormik({
   initialValues: {
  // ── Category ──
  subCategory: product?.subCategory || null,
  childCategory: product?.childCategory || null,

  // ── Item Specifics ──
 title: product?.title || prefill?.title || '',
condition: product?.condition || prefill?.condition || '',
category: product?.category
  || categories.find((c) => c._id === prefill?.categoryId)
  || null,
  isBranded: product?.isBranded || false,
  brand: product?.brand || null,
  itemsInSet: product?.itemsInSet || 1,
  itemstock: product?.stock || 1,
  pricingMode: product?.pricingMode || 'declare',
  mrp: product?.mrp || '',
  discountPrice: product?.discountPrice || '',
  // ── Additional Details ──
  additionalDetails: product?.additionalDetails || {
    packageLength: '',
    packageWidth: '',
    packageHeight: '',
    packageWeight: '',
    dimensionUnit: 'cm',
    weightUnit: 'kg',
      hscode: '',
        countryOfManufacture: '', 
    customSpecifics: [],
  },

  // ── Description ──
  description: product?.description || '',

  // ── Variations ──
  hasVariations: product?.hasVariations || false,
  variationAttributes: product?.variationAttributes || [{ name: '', values: [] }],
  variations: (product?.variations || []).map((v) => ({
      ...v,
      existingImages: v.images || [], // keep DB images separate from new uploads
      images: [], // this field now holds only newly-dropped Files for this variation
    })),

  // ── Policies ──
  shipping_policy: product?.shipping_policy || null,
  freeShipping: product?.freeShipping ?? false,
  handlingTime: product?.handlingTime || 'same_day',
itemLocation: {
  pickupLocation: product?.itemLocation?.pickupLocation || null,
  country: product?.itemLocation?.country || '',
    state: product?.itemLocation?.state || '', // ADD
  city: product?.itemLocation?.city || '',
    streetAddress: product?.itemLocation?.streetAddress || '',
  zipcode: product?.itemLocation?.zipcode || '',
},
internationalReturns: {
  accepted: product?.internationalReturns?.accepted ?? true,
  allowedWithin: product?.internationalReturns?.allowedWithin || '14',
  shippingPaidBy: product?.internationalReturns?.shippingPaidBy || 'buyer',
  refundMethod: product?.internationalReturns?.refundMethod || 'money_back',
},
  status: product?.status || 'draft',
},

    onSubmit: (values) => {
      const ok = validateBeforeSubmit(values);
      if (ok !== true) return;

      const payload = {
        // ── Category ──
        category: values.category?._id,
        subCategory: values.subCategory?._id,
        childCategory: values.childCategory?._id,

        // ── Item Specifics ──
        condition: values.condition,
        title: values.title,
        isBranded: values.isBranded,
        brand: values.isBranded ? values.brand?._id : null,
        itemsInSet: values.itemsInSet,
        stock: values.itemstock,
        pricingMode: values.pricingMode,
        mrp: values.mrp,
        discountPrice: values.discountPrice,
        // ── Additional Details ──
        additionalDetails: {
          packageLength: values.additionalDetails.packageLength,
          packageWidth: values.additionalDetails.packageWidth,
          packageHeight: values.additionalDetails.packageHeight,
          packageWeight: values.additionalDetails.packageWeight,
          dimensionUnit: values.additionalDetails.dimensionUnit,
          weightUnit: values.additionalDetails.weightUnit,
          hscode: values.additionalDetails.hscode,
          countryOfManufacture: values.additionalDetails.countryOfManufacture,
          customSpecifics: values.additionalDetails.customSpecifics,
        },

        // ── Description ──
        description: values.description,

        // ── Variations ──
        // ── Images ──
          existingImages, // tells backend which already-uploaded images to keep

          // ── Variations ──
          hasVariations: values.hasVariations,
          variationAttributes: values.variationAttributes,
          variations: values.variations.map((v) => ({
            attributes: v.attributes,
            price: v.price,
            discountPrice: v.discountPrice || '',
            sku: v.sku,
            stock: v.stock,
            existingImages: v.existingImages || [], // tells backend which existing variation images to keep
          })),

        // ── Policies ──
        shipping_policy: values.shipping_policy?._id,
        freeShipping: values.freeShipping,
handlingTime: values.handlingTime,
itemLocation: values.itemLocation,
internationalReturns: values.internationalReturns,
        status: values.status,
      };

      const formData = new FormData();
      formData.append('data', JSON.stringify(payload));
      images.forEach((img) => formData.append('images', img));
      values.variations.forEach((v, i) => {
        v.images?.forEach((img) => formData.append(`variation_images_${i}`, img));
      });
      mutate(formData);
    },
  });

  const { values, setFieldValue } = formik;

  React.useEffect(() => {
  if (!shipping_policies.length) return;

  const result = getAutomaticShippingPolicy(values.additionalDetails);

  const requiredPolicyType = result.needsFreight
    ? 'FREIGHT'
    : 'COURIER';

  const requiredPolicy = shipping_policies.find(
    (policy) => policy?.policy_type === requiredPolicyType
  );

  if (
    requiredPolicy &&
    String(values.shipping_policy?._id) !== String(requiredPolicy._id)
  ) {
    setFieldValue('shipping_policy', requiredPolicy, false);
  }
}, [
  values.additionalDetails.packageLength,
  values.additionalDetails.packageWidth,
  values.additionalDetails.packageHeight,
  values.additionalDetails.packageWeight,
  values.additionalDetails.dimensionUnit,
  values.additionalDetails.weightUnit,
  shipping_policies,
]);

  const getId = (val) => (typeof val === 'object' ? val?._id : val);

  const filteredSubCategories = useMemo(() => {
    if (!values.category) return [];
    return subCategories.filter(
      (sub) => String(getId(sub.parentCategory)) === String(values.category._id)
    );
  }, [values.category, subCategories]);

  const filteredChildCategories = useMemo(() => {
    if (!values.subCategory) return [];
    return childCategories.filter(
      (child) => String(getId(child.subCategory)) === String(values.subCategory._id)
    );
  }, [values.subCategory, childCategories]);

  const generateCombinations = (attributes) => {
    if (!attributes.length) return [];
    const combine = (index, current) => {
      if (index === attributes.length) return [current];
      const attr = attributes[index];
      let result = [];
      attr.values.forEach((value) => {
        result = result.concat(combine(index + 1, { ...current, [attr.name]: value }));
      });
      return result;
    };
    return combine(0, {});
  };

  const ad = values.additionalDetails;
  const setAd = (key, val) => setFieldValue(`additionalDetails.${key}`, val);

  /* ── custom specifics helpers ── */
  const addCustomSpecific = () =>
    setFieldValue('additionalDetails.customSpecifics', [
      ...ad.customSpecifics,
      { name: '', value: '' },
    ]);

  const removeCustomSpecific = (i) =>
    setFieldValue(
      'additionalDetails.customSpecifics',
      ad.customSpecifics.filter((_, idx) => idx !== i)
    );

  const setCustomSpecific = (i, field, val) => {
    const updated = [...ad.customSpecifics];
    updated[i] = { ...updated[i], [field]: val };
    setFieldValue('additionalDetails.customSpecifics', updated);
  };



  

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <FormikProvider value={formik}>
      <Form noValidate>
        <Stack spacing={3}>

          {/* ═══════════════════ STATUS BANNERS ═══════════════════ */}
{isPending && (
  <Card sx={{ bgcolor: '#fff8e1', border: '1px solid #ffe082' }}>
    <CardContent>
      <Typography variant="body2" sx={{ color: '#f57c00', fontWeight: 600 }}>
        ⚠️ This product is pending approval. Editing is restricted until reviewed.
      </Typography>
    </CardContent>
  </Card>
)}

{isPublished && (
  <Card sx={{ bgcolor: '#e3f2fd', border: '1px solid #90caf9' }}>
    <CardContent>
      <Typography variant="body2" sx={{ color: '#1565c0', fontWeight: 600 }}>
        ℹ️ This product is published. Only MRP, Discount Price and Stock can be edited.
      </Typography>
    </CardContent>
  </Card>
)}

          {/* ═══════════════════ IMAGES ═══════════════════ */}
          <Card>
            <CardHeader title="Product Images" />
            <CardContent>
              <Box
                {...getRootProps()}
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: isRestricted ? 'not-allowed' : 'pointer',
    bgcolor: isDragActive ? 'action.hover' : 'transparent',
    opacity: isRestricted ? 0.6 : 1,
    pointerEvents: isRestricted ? 'none' : 'auto',
                }}
              >
                <input {...getInputProps()} />
                <Typography variant="h6">Drag & drop images here</Typography>
                <Typography variant="body2" color="text.secondary">
                  or click to upload
                </Typography>
              </Box>

                {(existingImages.length > 0 || images.length > 0) && (
                  <Grid container spacing={2} mt={2}>
                    {existingImages.map((img, index) => (
                      <Grid item xs={4} sm={3} md={2} key={`existing-${img._id || index}`}>
                        <Box sx={{ position: 'relative' }}>
                          <Box
                            component="img"
                            src={getAssetUrl(img?.url)}
                            sx={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 1 }}
                          />
                          <IconButton
                            size="small"
                            disabled={isRestricted}
                            onClick={() => removeExistingImage(index)}
                            sx={{
                              position: 'absolute', top: 4, right: 4,
                              bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 14,
                              '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                            }}
                          >
                            ✕
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                    {images.map((file, index) => (
                      <Grid item xs={4} sm={3} md={2} key={`new-${index}`}>
                        <Box sx={{ position: 'relative' }}>
                          <Box
                            component="img"
                            src={file.preview}
                            sx={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 1 }}
                          />
                          <IconButton
                            size="small"
                              disabled={isRestricted}
                            onClick={() => removeImage(index)}
                            sx={{
                              position: 'absolute', top: 4, right: 4,
                              bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 14,
                              '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                            }}
                          >
                            ✕
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              
            </CardContent>
          </Card>

          {/* ═══════════════════ CATEGORY ═══════════════════ */}
          <Card>
            <CardHeader title="Product Category" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Autocomplete
                    fullWidth
                    options={categories}
                    disabled={isRestricted}
                    getOptionLabel={(o) => o?.name || ''}
                    value={values.category}
                    onChange={(_, value) => {
                      setFieldValue('category', value);
                      setFieldValue('subCategory', null);
                      setFieldValue('childCategory', null);
                    }}
                    renderInput={(params) => <TextField {...params} label="Category" />}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Autocomplete
                    fullWidth
                    disabled={isRestricted || !values.category}
                    options={filteredSubCategories}
                    getOptionLabel={(o) => o?.name || ''}
                    value={values.subCategory}
                    onChange={(_, value) => {
                      setFieldValue('subCategory', value);
                      setFieldValue('childCategory', null);
                    }}
                    renderInput={(params) => <TextField {...params} label="Sub Category" />}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Autocomplete
                    fullWidth
                    options={filteredChildCategories}
                    getOptionLabel={(o) => o?.name || ''}
                    value={values.childCategory}
                    disabled={isRestricted || !values.subCategory}
                    onChange={(_, value) => setFieldValue('childCategory', value)}
                    renderInput={(params) => <TextField {...params} label="Child Category" />}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* ═══════════════════ ITEM SPECIFICS ═══════════════════ */}
          <Card>
            <CardHeader title="Item Specifics" />
            <CardContent>
              <Grid container spacing={2}>

                {/* Branded toggle */}
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={values.isBranded}
                        disabled={isRestricted}
                        onChange={(e) => {
                          formik.setFieldValue('isBranded', e.target.checked);
                          if (!e.target.checked) formik.setFieldValue('brand', null);
                        }}
                      />
                    }
                    label="Branded Product?"
                  />
                </Grid>

                {values.isBranded && (
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Button fullWidth variant="outlined" disabled={isRestricted} onClick={() => setOpenBrandModal(true)}>
                      {values.brand ? values.brand.name : 'Select Brand'}
                    </Button>
                  </Grid>
                )}

                {/* Title */}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Listing Title"
                    name="title"
                    value={values.title}
                    onChange={formik.handleChange}
                     disabled={isRestricted}
                    placeholder="e.g. Apple iPhone 14 Pro Max 256GB"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
  <TextField
    select
    fullWidth
    label="Condition"
    name="condition"
    value={values.condition}
    onChange={formik.handleChange}
    disabled={isRestricted}
  >
    {[
        { value: 'new', label: 'New' },
        { value: 'refurbished', label: 'Refurbished' },
        { value: 'reconditioned', label: 'Reconditioned' },
        { value: 'overhauled', label: 'Overhauled' },
        { value: 'used', label: 'Used' },
        { value: 'as_is', label: 'As-Is' },
    ].map((c) => (
      <MenuItem key={c.value} value={c.value}>
        {c.label}
      </MenuItem>
    ))}
  </TextField>
</Grid>

                {/* Items in set / Stock / Pricing mode */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth type="number" label="Number of Items in Set"
                    name="itemsInSet" value={values.itemsInSet}
                    onChange={formik.handleChange} inputProps={{ min: 1 }}
                    disabled={isRestricted}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth type="number" label="Stock"
                    name="itemstock" value={values.itemstock}
                    onChange={formik.handleChange} inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    select fullWidth label="Pricing Mode"
                    name="pricingMode" value={values.pricingMode}
                    disabled={isRestricted}
                    onChange={(e) => {
                      formik.handleChange(e);
                      if (e.target.value === 'quote') formik.setFieldValue('mrp', '');
                    }}
                  >
                    <MenuItem value="declare">Declare Price</MenuItem>
                    <MenuItem value="quote">Get Quote</MenuItem>
                  </TextField>
                </Grid>

                {/* MRP + Discount Price */}
                {values.pricingMode === 'declare' && (
                  <>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth type="number" label="MRP (in registered country currency)"
                        name="mrp" value={values.mrp}
                        onChange={formik.handleChange} inputProps={{ min: 0 }}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth type="number" label="Discount Price (Optional)"
                        name="discountPrice" value={values.discountPrice}
                        onChange={formik.handleChange} inputProps={{ min: 0 }}
                        helperText="Leave empty if no offer available"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>,
                        }}
                      />
                    </Grid>
                  </>
                )}

                {/* Tax details */}
                {/* <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Tax Details</Typography>
                  {values.taxes.map((tax, index) => (
                    <Grid container spacing={2} alignItems="center" key={index} sx={{ mb: 1 }}>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                          select fullWidth label="Tax Type" value={tax.taxType}
                          disabled={isRestricted}
                          onChange={(e) =>
                            formik.setFieldValue(`taxes[${index}].taxType`, e.target.value)
                          }
                        >
                          {['GST', 'VAT', 'SERVICE', 'CESS', 'NONE'].map((t) => (
                            <MenuItem key={t} value={t}>
                              {t === 'SERVICE' ? 'Service Tax' : t}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                          select fullWidth label="Tax Rate (%)" value={tax.taxRate}
                          disabled={isRestricted || !tax.taxType || tax.taxType === 'NONE'}
                          onChange={(e) =>
                            formik.setFieldValue(`taxes[${index}].taxRate`, e.target.value)
                          }
                        >
                          {(tax.taxType === 'GST' ? [0, 5, 12, 18, 28]
                            : tax.taxType === 'VAT' ? [1, 4, 5]
                            : tax.taxType === 'SERVICE' ? [10, 12]
                            : tax.taxType === 'CESS' ? [1, 2]
                            : []
                          ).map((rate) => (
                            <MenuItem key={rate} value={rate}>{rate}%</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        {values.taxes.length > 1 && (
                          <Button color="error" 
                          disabled={isRestricted}
                            onClick={() => {
                            const updated = [...values.taxes];
                            updated.splice(index, 1);
                            formik.setFieldValue('taxes', updated);
                          }}>
                            Remove
                          </Button>
                        )}
                      </Grid>
                    </Grid>
                  ))}
                  <Button
                    variant="outlined"
                      disabled={isRestricted}
                    onClick={() =>
                      formik.setFieldValue('taxes', [...values.taxes, { taxType: '', taxRate: '' }])
                    }
                  >
                    + Add Another Tax
                  </Button>
                </Grid> */}

              </Grid>
            </CardContent>
          </Card>

          {/* ═══════════════════ ADDITIONAL DETAILS ═══════════════════ */}
          <Card>
            <CardHeader
              title="packing Details"
              subheader="Help buyers find your listing — the more specifics you provide, the better your search visibility."
            />
            <CardContent>
              <Stack spacing={3}>

                {/* ── Package Dimensions ── */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                    Package Dimensions
                  </Typography>
                  <Grid container spacing={2} alignItems="flex-end">
                    <Grid size={{ xs: 6, md: 2 }}>
                      <TextField
                        fullWidth type="number" label="Length"
                         disabled={isRestricted}
                        value={ad.packageLength}
                        onChange={(e) => setAd('packageLength', e.target.value)}
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 2 }}>
                      <TextField
                        fullWidth type="number" label="Width"
                         disabled={isRestricted}
                        value={ad.packageWidth}
                        onChange={(e) => setAd('packageWidth', e.target.value)}
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 2 }}>
                      <TextField
                        fullWidth type="number" label="Height"
                         disabled={isRestricted}
                        value={ad.packageHeight}
                        onChange={(e) => setAd('packageHeight', e.target.value)}
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 2 }}>
                      <TextField
                        select fullWidth label="Unit"
                         disabled={isRestricted}
                        value={ad.dimensionUnit}
                        onChange={(e) => setAd('dimensionUnit', e.target.value)}
                      >
                        {['cm', 'inch', 'mm', 'm'].map((u) => (
                          <MenuItem key={u} value={u}>{u}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 6, md: 2 }}>
                      <TextField
                        fullWidth type="number" label="Weight"
                        value={ad.packageWeight}
                         disabled={isRestricted}
                        onChange={(e) => setAd('packageWeight', e.target.value)}
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 2 }}>
                      <TextField
                        select fullWidth label="Unit"
                        value={ad.weightUnit}
                         disabled={isRestricted}
                        onChange={(e) => setAd('weightUnit', e.target.value)}
                      >
                        {['kg', 'g', 'lb', 'oz'].map((u) => (
                          <MenuItem key={u} value={u}>{u}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </Grid>
                </Box>
                

                <Divider />

                <Box>
  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
    Customs Information
  </Typography>

  <Grid container spacing={2}>
    <Grid size={{ xs: 12, md: 4 }}>
      <TextField
        fullWidth
        label="HS Code"
        placeholder="e.g. 85171300"
        value={ad.hscode || ''}
        disabled={isRestricted}
        onChange={(e) => setAd('hscode', e.target.value)}
      />
    </Grid>
    <Grid size={{ xs: 12, md: 4 }}>
      <Autocomplete
        fullWidth
        options={countryOptions}
        disabled={isRestricted}
        getOptionLabel={(o) => o?.label || ''}
        value={countryOptions.find((c) => c.label === ad.countryOfManufacture) || null}
        onChange={(_, v) => setAd('countryOfManufacture', v?.label || '')}
        renderInput={(params) => (
          <TextField {...params} label="Country of Manufacture" placeholder="e.g. China" />
        )}
      />
    </Grid>
  </Grid>
</Box>



<Divider />

                {/* ── Custom Item Specifics ── */}
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1.5,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Custom Item Specifics
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Add any extra details buyers might search for (e.g. "Compatibility: iPhone 15")
                      </Typography>
                    </Box>
                    <Button  disabled={isRestricted} size="small" variant="outlined" onClick={addCustomSpecific}>
                      + Add Detail
                    </Button>
                  </Box>

                  {ad.customSpecifics.length === 0 && (
                    <Typography
                      variant="body2"
                      color="text.disabled"
                      sx={{ fontStyle: 'italic', fontSize: 13 }}
                    >
                      No custom specifics added yet.
                    </Typography>
                  )}

                  <Stack spacing={1.5}>
                    {ad.customSpecifics.map((spec, i) => (
                      <Grid container spacing={2} alignItems="center" key={i}>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth size="small" label="Name"
                            placeholder="e.g. Compatible Model"
                            value={spec.name}
                              disabled={isRestricted}
                            onChange={(e) => setCustomSpecific(i, 'name', e.target.value)}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth size="small" label="Value"
                             disabled={isRestricted}
                            placeholder="e.g. iPhone 15 Pro"
                            value={spec.value}
                            onChange={(e) => setCustomSpecific(i, 'value', e.target.value)}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                          <Button
                            color="error" size="small" fullWidth
                              disabled={isRestricted}
                            onClick={() => removeCustomSpecific(i)}
                          >
                            Remove
                          </Button>
                        </Grid>
                      </Grid>
                    ))}
                  </Stack>
                </Box>

              </Stack>
            </CardContent>
          </Card>

          {/* ═══════════════════ DESCRIPTION ═══════════════════ */}
          <Card>
            <CardHeader title="Product Description" />
            <CardContent>
              <TextField
                fullWidth multiline minRows={6} label="Description"
                value={values.description}
                onChange={(e) => setFieldValue('description', e.target.value)}
                disabled={isRestricted}
                placeholder="Describe your product in detail..."
              />
            </CardContent>
          </Card>

          {/* ═══════════════════ VARIATIONS ═══════════════════ */}
          <Card>
            <CardHeader title="Variations" />
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={values.hasVariations}
                    disabled={isRestricted}
                    onChange={(e) => {
                      setFieldValue('hasVariations', e.target.checked);
                      if (!e.target.checked) {
                        setFieldValue('variationAttributes', [{ name: '', values: [] }]);
                        setFieldValue('variations', []);
                      }
                    }}
                  />
                }
                label="This product has variations (Size, Color, etc.)"
              />

              {values.hasVariations && (
                <Box sx={{ mt: 2 }}>
                  {values.variationAttributes.map((attr, index) => (
                    <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                          fullWidth label="Attribute Name"
                           disabled={isRestricted}
                          placeholder="e.g. Color, Size"
                          value={attr.name}
                          onChange={(e) =>
                            setFieldValue(`variationAttributes[${index}].name`, e.target.value)
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 7 }}>
                        <Autocomplete
                          multiple freeSolo options={[]}
                          disabled={isRestricted}
                          value={attr.values}
                          onChange={(_, value) =>
                            setFieldValue(`variationAttributes[${index}].values`, value)
                          }
                          renderInput={(params) => (
                            <TextField {...params} label="Values" placeholder="Type & press Enter" />
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        {values.variationAttributes.length > 1 && (
                          <Button color="error"  disabled={isRestricted} onClick={() => {
                            const updated = [...values.variationAttributes];
                            updated.splice(index, 1);
                            setFieldValue('variationAttributes', updated);
                          }}>
                            Remove
                          </Button>
                        )}
                      </Grid>
                    </Grid>
                  ))}

                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    <Button
                      variant="outlined" 
                        disabled={isRestricted}
                      onClick={() =>
                        setFieldValue('variationAttributes', [
                          ...values.variationAttributes,
                          { name: '', values: [] },
                        ])
                      }
                    >
                      + Add Attribute
                    </Button>
                    <Button
                      variant="contained"
                        disabled={isRestricted}
                      onClick={() => {
                        const attrs = values.variationAttributes.filter(
                          (a) => a.name && a.values.length
                        );
                        const combos = generateCombinations(attrs);
                        setFieldValue(
                          'variations',
                          combos.map((combo, i) => ({
                            attributes: combo,
                            price: '',
                            discountPrice: '',
                            sku: `SKU-${i + 1}`,
                            stock: '',
                            images: [],
                          }))
                        );
                      }}
                    >
                      Generate Variations
                    </Button>
                  </Stack>
                </Box>
              )}

              {values.variations.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Variation Details</Typography>
                  {values.variations.map((variant, index) => (
                    <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                          fullWidth disabled label="Variation"
                          value={Object.entries(variant.attributes)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(', ')}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        <TextField
                          fullWidth label="MRP" type="number"
                          value={variant.price}
                          onChange={(e) =>
                            setFieldValue(`variations[${index}].price`, e.target.value)
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        <TextField
                          fullWidth label="Offer Price" type="number"
                          value={variant.discountPrice || ''}
                          onChange={(e) =>
                            setFieldValue(`variations[${index}].discountPrice`, e.target.value)
                          }
                          helperText="Optional"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        <TextField
                          fullWidth label="SKU" value={variant.sku}
                          disabled={isRestricted}
                          onChange={(e) =>
                            setFieldValue(`variations[${index}].sku`, e.target.value)
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        <TextField
                          fullWidth type="number" label="Stock" value={variant.stock}
                          onChange={(e) =>
                            setFieldValue(`variations[${index}].stock`, e.target.value)
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                         <VariationImageUploader
                            images={variant.images}
                            existingImages={variant.existingImages}
                            disabled={isRestricted}
                            onChange={(imgs) =>
                              setFieldValue(`variations[${index}].images`, imgs)
                            }
                            onChangeExisting={(imgs) =>
                              setFieldValue(`variations[${index}].existingImages`, imgs)
                            }
                          />
                      </Grid>
                    </Grid>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* ═══════════════════ POLICIES ═══════════════════ */}
          {/* ═══════════════════ POLICIES ═══════════════════ */}
<Card>
  <CardHeader title="Shipping & Returns Settings" />
  <CardContent>
    <Stack spacing={3}>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.freeShipping}
                    disabled={isRestricted}
                    onChange={(e) =>
                      setFieldValue('freeShipping', e.target.checked)
                    }
                  />
                }
                label="Free Shipping"
              />
     
        
          <Divider />
          <Grid container spacing={2}>
        <Grid  size={{ xs: 12 }}>
          <TextField
            select fullWidth label="Handling Time"
            disabled={isRestricted}
            value={values.handlingTime}
            onChange={(e) => setFieldValue('handlingTime', e.target.value)}
          >
            {[
                { value: 'same_day', label: 'Same business day' },
                { value: '1_day', label: '1 business day' },
                { value: '2_days', label: '2 business days' },
                { value: '3_days', label: '3 business days' },
                { value: '5_days', label: '5 business days' },
                { value: '6_days', label: '6 business days' },
                { value: '7_days', label: '7 business days' },
                { value: '10_days', label: '10 business days' },
                { value: '14_days', label: '14 business days' },
                { value: '15_days', label: '15 business days' },
                { value: '20_days', label: '20 business days' },
            ].map((o) => (
              <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
          </TextField>
        </Grid> </Grid>
 

      <Divider />

      {/* Ship From */}
<Box>
  <Typography
    variant="subtitle2"
    sx={{ mb: 1.5, fontWeight: 600 }}
  >
    Ship From
  </Typography>

  <Autocomplete
    fullWidth
    options={[
      ...pickupLocations,
      {
        _id: '__add_new__',
        name: '+ Add New Pickup Location',
        isAddNew: true,
      },
    ]}
    disabled={isRestricted}
    value={values.itemLocation.pickupLocation}
    getOptionLabel={(option) => {
      if (option?.isAddNew) {
        return option.name;
      }

      return option?.name || '';
    }}
    isOptionEqualToValue={(option, value) =>
      String(option?._id) === String(value?._id)
    }
    onChange={(_, value) => {
      if (!value) {
        setFieldValue('itemLocation.pickupLocation', null);
        return;
      }

      if (value.isAddNew) {
        setOpenPickupLocation(true);
        return;
      }

      setFieldValue('itemLocation.pickupLocation', value);

      setFieldValue(
        'itemLocation.streetAddress',
        value.streetAddress || ''
      );

      setFieldValue(
        'itemLocation.country',
        value.country || ''
      );

      setFieldValue(
        'itemLocation.state',
        value.state || ''
      );

      setFieldValue(
        'itemLocation.city',
        value.city || ''
      );

      setFieldValue(
        'itemLocation.zipcode',
        value.zipcode || ''
      );
    }}
    renderOption={(props, option) => (
      <li {...props} key={option._id}>
        {option.isAddNew ? (
          <Typography
            sx={{
              fontWeight: 600,
              color: 'primary.main',
            }}
          >
            + Add New Pickup Location
          </Typography>
        ) : (
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {option.name}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              {option.city}, {option.state}, {option.country}
            </Typography>
          </Box>
        )}
      </li>
    )}
    renderInput={(params) => (
      <TextField
        {...params}
        label="Ship From"
        placeholder="Select pickup location"
      />
    )}
  />
</Box>

      <Divider />

      {/* Domestic Returns */}
      {/* <Box>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>Domestic Returns</Typography>
        <Card variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={values.domesticReturns.accepted}
                  disabled={isRestricted}
                  onChange={(e) => setFieldValue('domesticReturns.accepted', e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600}>Accept returns</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Allow returns for items purchased domestically.
                  </Typography>
                </Box>
              }
            />
            {values.domesticReturns.accepted && (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    select fullWidth label="Allowed within"
                    disabled={isRestricted}
                    value={values.domesticReturns.allowedWithin}
                    onChange={(e) => setFieldValue('domesticReturns.allowedWithin', e.target.value)}
                  >
                    {['14', '30', '60'].map((d) => (
                      <MenuItem key={d} value={d}>{d} Days</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    select fullWidth label="Return shipping paid by"
                    disabled={isRestricted}
                    value={values.domesticReturns.shippingPaidBy}
                    onChange={(e) => setFieldValue('domesticReturns.shippingPaidBy', e.target.value)}
                  >
                    <MenuItem value="buyer">Buyer</MenuItem>
                    <MenuItem value="seller">Seller</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    select fullWidth label="Refund method"
                    disabled={isRestricted}
                    value={values.domesticReturns.refundMethod}
                    onChange={(e) => setFieldValue('domesticReturns.refundMethod', e.target.value)}
                  >
                    <MenuItem value="money_back">Money back</MenuItem>
                    <MenuItem value="exchange">Exchange</MenuItem>
                    <MenuItem value="store_credit">Store credit</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            )}
          </Stack>
        </Card>
      </Box> */}

      {/* International Returns */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>Returns</Typography>
        <Card variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={values.internationalReturns.accepted}
                  disabled={isRestricted}
                  onChange={(e) => setFieldValue('internationalReturns.accepted', e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600}>Accept returns</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Allow returns for items purchased internationally.
                  </Typography>
                </Box>
              }
            />
            {values.internationalReturns.accepted && (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    select fullWidth label="Allowed within"
                    disabled={isRestricted}
                    value={values.internationalReturns.allowedWithin}
                    onChange={(e) => setFieldValue('internationalReturns.allowedWithin', e.target.value)}
                  >
                    {['14', '30', '60'].map((d) => (
                      <MenuItem key={d} value={d}>{d} Days</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    select fullWidth label="Return shipping paid by"
                    disabled={isRestricted}
                    value={values.internationalReturns.shippingPaidBy}
                    onChange={(e) => setFieldValue('internationalReturns.shippingPaidBy', e.target.value)}
                  >
                    <MenuItem value="buyer">Buyer</MenuItem>
                    <MenuItem value="seller">Seller</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    select fullWidth label="Refund method"
                    disabled={isRestricted}
                    value={values.internationalReturns.refundMethod}
                    onChange={(e) => setFieldValue('internationalReturns.refundMethod', e.target.value)}
                  >
                    <MenuItem value="money_back">Money back</MenuItem>
                    <MenuItem value="exchange">Exchange</MenuItem>
                    <MenuItem value="store_credit">Store credit</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            )}
          </Stack>
        </Card>
      </Box>

    </Stack>
  </CardContent>
</Card>

          {/* ═══════════════════ ACTIONS ═══════════════════ */}
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2}>
  <Button type="submit" variant="contained" loading={isSaving}>
    {isSaving ? 'Saving...' : isEdit ? 'Update Product' : 'Save Product'}
  </Button>
  {!isPublished && !isPending && (
    <Button
      variant="outlined"
      onClick={() => {
        formik.setFieldValue('status', 'pending');
        setTimeout(() => formik.submitForm(), 0);
      }}
    >
      Publish
    </Button>
  )}
  <Button variant="outlined" onClick={() => router.push('/vendor/products')}>
    Cancel
  </Button>
</Stack>
            </CardContent>
          </Card>

          {/* ═══════════════════ BRAND MODAL ═══════════════════ */}
          <Dialog
            open={openBrandModal}
            onClose={() => setOpenBrandModal(false)}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>Select Brand</DialogTitle>
            <DialogContent>
              <Autocomplete
                autoFocus fullWidth options={brands}
                getOptionLabel={(o) => o?.name || ''}
                value={values.brand}
                onChange={(_, value) => {
                  formik.setFieldValue('brand', value);
                  setOpenBrandModal(false);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Search Brand" placeholder="Type brand name..." />
                )}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenBrandModal(false)}>Cancel</Button>
            </DialogActions>
          </Dialog>

        </Stack>
      </Form>
      <Dialog
  open={openShippingInfo}
  onClose={() => setOpenShippingInfo(false)}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle>
    {values.shipping_policy?.name}
  </DialogTitle>

  <DialogContent>
    <Typography>
      {values.shipping_policy?.description}
    </Typography>

   
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setOpenShippingInfo(false)}>
      Close
    </Button>
  </DialogActions>
</Dialog>

                <Dialog
  open={openPickupLocation}
  onClose={() => setOpenPickupLocation(false)}
  fullWidth
  maxWidth="sm"
>
  <DialogTitle>
    Add Pickup Location
  </DialogTitle>

  <DialogContent>
    <Stack spacing={2} sx={{ mt: 1 }}>

      <TextField
        fullWidth
        label="Location Name"
        placeholder="e.g. Dubai Warehouse"
        value={pickupForm.name}
        onChange={(e) =>
          setPickupForm({
            ...pickupForm,
            name: e.target.value,
          })
        }
      />

      <TextField
        fullWidth
        label="Street Address"
        value={pickupForm.streetAddress}
        onChange={(e) =>
          setPickupForm({
            ...pickupForm,
            streetAddress: e.target.value,
          })
        }
      />

      <Autocomplete
        fullWidth
        options={countryOptions}
        getOptionLabel={(o) => o?.label || ''}
        value={
          countryOptions.find(
            (c) => c.label === pickupForm.country
          ) || null
        }
        onChange={(_, value) =>
          setPickupForm({
            ...pickupForm,
            country: value?.label || '',
          })
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Country"
          />
        )}
      />

      <TextField
        fullWidth
        label="State / Province"
        value={pickupForm.state}
        onChange={(e) =>
          setPickupForm({
            ...pickupForm,
            state: e.target.value,
          })
        }
      />

      <TextField
        fullWidth
        label="City"
        value={pickupForm.city}
        onChange={(e) =>
          setPickupForm({
            ...pickupForm,
            city: e.target.value,
          })
        }
      />

      <TextField
        fullWidth
        label="Pincode / Zipcode"
        value={pickupForm.zipcode}
        onChange={(e) =>
          setPickupForm({
            ...pickupForm,
            zipcode: e.target.value,
          })
        }
      />

    </Stack>
  </DialogContent>

  <DialogActions>
    <Button
      onClick={() => setOpenPickupLocation(false)}
    >
      Cancel
    </Button>

    <Button
      variant="contained"
      onClick={handleSavePickupLocation}
      disabled={savingPickupLocation}
    >
      {savingPickupLocation
        ? 'Saving...'
        : 'Save Location'}
    </Button>
  </DialogActions>
</Dialog>

    </FormikProvider>
  );
}

ProductForm.propTypes = {
  categories: PropTypes.array,
  subCategories: PropTypes.array,
  childCategories: PropTypes.array,
  brands: PropTypes.array,
   policies: PropTypes.shape({
    shipping_policies: PropTypes.array,
  }),
  product: PropTypes.object,
};
