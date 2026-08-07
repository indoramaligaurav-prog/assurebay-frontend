'use client';

import React, { useCallback, useMemo, useState,useEffect  } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from '@bprogress/next';
import { useDropzone } from 'react-dropzone';
import { Form, FormikProvider, useFormik,  } from 'formik';
import MenuItem from '@mui/material/MenuItem';
import * as api from 'src/services';
import { updateProduct } from 'src/services';
import { productSchema } from '@/validations';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { getAssetUrl } from '@/utils/getAssetUrl';

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
  Switch
} from '@mui/material';




// ----------------------------------------------------------------------

export default function EditProductForm({
  categories = [],
  subCategories = [],
  childCategories = [],
  brands =[],
  policies ={},
  currentProduct={},
}) {
  const router = useRouter();
  const [images, setImages] = useState([]);

  // ---------------- IMAGE UPLOAD ----------------
  const onDrop = useCallback((acceptedFiles) => {
    const files = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file)
      })
    );
    setImages((prev) => [...prev, ...files]);
  }, []);

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };
  
  React.useEffect(() => {
  return () => images.forEach((file) => URL.revokeObjectURL(file.preview));
}, [images]);

const product = currentProduct?.data || null;

useEffect(() => {
  if (!product) return;

  setImages(
    (product.images || []).map(img => ({
      preview: getAssetUrl(img.url),
      existing: true,
      ...img
    }))
  );
}, [product]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true
  });

  const [openBrandModal, setOpenBrandModal] = useState(false);


  const {
  shipping_policies = [],
  return_policies = [],
  cancel_policies = []
} = policies;

const { mutate, isPending: isSaving } = useMutation({
  mutationFn: api.createProduct,
  retry: false,
  onSuccess: () => {
    toast.success('Product created successfully');
    router.push('/vendor/products');
  },
  onError: (error) => {
    toast.error(error?.response?.data?.message || 'Failed to save product');
  }
});

const validateBeforeSubmit = (v) => {

  // BASIC INFO
  if (!v.title) return toast.error("Product title is required");
  if (!v.category) return toast.error("Select category");
  if (!v.subCategory) return toast.error("Select sub category");
  if (!v.childCategory) return toast.error("Select child category");
 if (v.isBranded && !v.brand)
  return toast.error("Select brand");

  // INVENTORY
  if (!v.itemsInSet || v.itemsInSet < 1)
    return toast.error("Items in set must be at least 1");
  if (!v.itemstock || v.itemstock < 1)
    return toast.error("Stock must be greater than 0");

  // PRICING
  // MRP only for DECLARE
if (v.pricingMode === 'declare' && (!v.mrp || v.mrp <= 0))
  return toast.error("Enter valid MRP");

// TAX ALWAYS REQUIRED
if (!v.taxes.length)
  return toast.error("Add at least one tax");

for (let i = 0; i < v.taxes.length; i++) {
  if (!v.taxes[i].taxType)
    return toast.error(`Select tax type for tax #${i + 1}`);
  if (v.taxes[i].taxType !== 'NONE' && v.taxes[i].taxRate === '')
    return toast.error(`Select tax rate for tax #${i + 1}`);
}


  // POLICIES
  if (!v.shipping_policy) return toast.error("Select shipping policy");
  if (!v.return_policy) return toast.error("Select return policy");
  if (!v.cancel_policy) return toast.error("Select cancellation policy");

  // IMAGES
 // IMAGES
if (!v.hasVariations && images.length === 0)
  return toast.error("Upload at least one product image");


  // VARIATIONS
  if (v.hasVariations) {
    if (!v.variationAttributes.length)
      return toast.error("Add at least one variation attribute");

    for (let i = 0; i < v.variationAttributes.length; i++) {
      if (!v.variationAttributes[i].name)
        return toast.error(`Enter attribute name for variation #${i + 1}`);
      if (!v.variationAttributes[i].values.length)
        return toast.error(`Add values for variation ${v.variationAttributes[i].name}`);
    }

    if (!v.variations.length)
      return toast.error("Generate variations");

    for (let i = 0; i < v.variations.length; i++) {
      if (!v.variations[i].price)
        return toast.error(`Enter price for variation #${i + 1}`);
      if (!v.variations[i].sku)
        return toast.error(`Enter SKU for variation #${i + 1}`);
      if (!v.variations[i].stock)
        return toast.error(`Enter stock for variation #${i + 1}`);
    }
  }

  // DESCRIPTION
  if (!v.description || v.description.length < 10)
    return toast.error("Product description must be at least 10 characters");

  return true;
};
  
const VariationImageUploader = ({ images, onChange }) => {
  const onDrop = (files) => {
    const mapped = files.map(file =>
      Object.assign(file, { preview: URL.createObjectURL(file) })
    );
    onChange([...(images || []), ...mapped]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': [] }
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
          cursor: 'pointer'
        }}
      >
        <input {...getInputProps()} />
        <Typography variant="caption">Upload Variation Images</Typography>
      </Box>

      <Stack direction="row" spacing={1} mt={1}>
        {images?.map((img, i) => (
          <Box key={i} sx={{ position: 'relative' }}>
            <Box
              component="img"
              src={img.preview}
              sx={{ width: 60, height: 60, borderRadius: 1 }}
            />
            <IconButton
              size="small"
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

const EMPTY_VALUES = {
  category: null,
  subCategory: null,
  childCategory: null,
  title: '',
  itemsInSet: 1,
  itemstock: 1,
  isBranded: false,
  brand: null,
  pricingMode: 'declare',
  mrp: '',
  taxes: [{ taxType: '', taxRate: '' }],
  additionalDetails: {
    upc: '',
    material: '',
    color: '',
    width: '',
    height: '',
    weight: '',
    unit: '',
    unitType: ''
  },
  description: '',
  hasVariations: false,
  variationAttributes: [{ name: '', values: [] }],
  variations: [],
  shipping_policy: null,
  return_policy: null,
  cancel_policy: null
};


const buildInitialValues = (p) => {
  if (!p) return null;

  return {
    ...EMPTY_VALUES,
    title: p.title || '',
    category: p.category || null,
    subCategory: p.subCategory || null,
    childCategory: p.childCategory || null,
    isBranded: !!p.brand,
    brand: p.brand || null,
    itemsInSet: p.itemsInSet || 1,
    itemstock: p.stock || 1,
    pricingMode: p.pricingMode || 'declare',
    mrp: p.mrp || '',
    taxes: p.taxes?.map(t => ({ taxType: t.taxType, taxRate: t.taxRate })) || EMPTY_VALUES.taxes,
    description: p.description || '',
    hasVariations: p.hasVariations || false,
    variationAttributes: p.variationAttributes || EMPTY_VALUES.variationAttributes,
    variations: p.variations?.map(v => ({
  ...v,
  images: (v.images || []).map(img => ({
    preview: getAssetUrl(img.url),
    existing: true,
    ...img
  }))
})) || [],
    shipping_policy: p.shipping_policy || null,
    return_policy: p.return_policy || null,
    cancel_policy: p.cancel_policy || null,
    additionalDetails: { ...EMPTY_VALUES.additionalDetails, ...p.additionalDetails }
  };
};


const { mutate: updateMutate, isPending: isUpdating } = useMutation({
  mutationFn: ({ id, data }) => updateProduct(id, data),
  onSuccess: () => {
    toast.success('Product updated successfully');
    router.push('/admin/products');
  },
  onError: (error) => {
    toast.error(error?.response?.data?.message || 'Update failed');
  }
});


  // ---------------- FORM ----------------
  const formik = useFormik({
  initialValues: buildInitialValues(product) || EMPTY_VALUES,
  enableReinitialize: true,


onSubmit: (values) => {

  const ok = validateBeforeSubmit(values);  
  if (ok !== true) return;

  const payload = {
    title: values.title,
    category: values.category?._id,
    subCategory: values.subCategory?._id,
    childCategory: values.childCategory?._id,
    brand: values.isBranded ? values.brand?._id : null,
    isBranded: values.isBranded,
    itemsInSet: values.itemsInSet,
    stock: values.itemstock,
    pricingMode: values.pricingMode,
    mrp: values.mrp,
    taxes: values.taxes,
    description: values.description,
    additionalDetails: values.additionalDetails,
    hasVariations: values.hasVariations,
    variationAttributes: values.variationAttributes,
    shipping_policy: values.shipping_policy?._id,
    return_policy: values.return_policy?._id,
    cancel_policy: values.cancel_policy?._id
  };

  const formData = new FormData();

  // --------- MAIN IMAGES ----------
  images.forEach(img => {
    if (!img.existing) formData.append('images', img);
  });

  // --------- VARIATION IMAGES ----------
  values.variations.forEach((v, i) => {
    v.images?.forEach(img => {
      if (!img.existing) formData.append(`variation_images_${i}`, img);
    });
  });

  // --------- EXISTING IMAGES ----------
  formData.append(
    'existingImages',
    JSON.stringify(images.filter(i => i.existing).map(i => ({ name: i.name, url: i.url })))
  );

  // --------- CLEANED VARIATIONS ----------
  const cleanedVariations = values.variations.map(v => ({
    ...v,
    existingImages: (v.images || []).filter(i => i.existing).map(i => ({ name: i.name, url: i.url })),
    images: []
  }));

  // --------- FINAL DATA ----------
  formData.append(
    'data',
    JSON.stringify({ ...payload, variations: cleanedVariations })
  );

  updateMutate({ id: product._id, data: formData });

}



});

const { values, setFieldValue } = formik;



// 🔹 helper
const getId = (val) =>
  typeof val === 'object' ? val?._id : val;

// 🔹 FILTERED SUB CATEGORIES
const filteredSubCategories = useMemo(() => {
  if (!values.category) return [];
  return subCategories.filter(
    (sub) =>
      String(getId(sub.parentCategory)) ===
      String(values.category._id)
  );
}, [values.category, subCategories]);

// 🔹 FILTERED CHILD CATEGORIES
const filteredChildCategories = useMemo(() => {
  if (!values.subCategory) return [];
  return childCategories.filter(
    (child) =>
      String(getId(child.subCategory)) ===
      String(values.subCategory._id)
  );
}, [values.subCategory, childCategories]);

// ✅ NOW SAFE TO LOG
console.log('Categories:', categories.length);
console.log('SubCategories:', subCategories.length);
console.log('ChildCategories:', childCategories.length);

const generateCombinations = (attributes) => {
  if (!attributes.length) return [];

  const combine = (index, current) => {
    if (index === attributes.length) return [current];

    const attr = attributes[index];
    let result = [];

    attr.values.forEach((value) => {
      result = result.concat(
        combine(index + 1, {
          ...current,
          [attr.name]: value
        })
      );
    });

    return result;
  };

  return combine(0, {});
};



  return (
    <FormikProvider value={formik}>
      <Form noValidate>
        <Stack spacing={3}>

          {/* ================= IMAGE SECTION ================= */}
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
                  cursor: 'pointer',
                  bgcolor: isDragActive ? 'action.hover' : 'transparent'
                }}
              >
                <input {...getInputProps()} />
                <Typography variant="h6">
                  Drag & drop images here
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  or click to upload
                </Typography>
              </Box>

              {/* Preview with Remove */}
              {images.length > 0 && (
                <Grid container spacing={2} mt={2}>
                  {images.map((file, index) => (
                    <Grid item xs={4} sm={3} md={2} key={index}>
                      <Box sx={{ position: 'relative' }}>
                        <Box
                          component="img"
                          src={file.preview}
                          sx={{
                            width: '100%',
                            height: 120,
                            objectFit: 'cover',
                            borderRadius: 1
                          }}
                        />
                        <IconButton
  size="small"
  onClick={() => removeImage(index)}
  sx={{
    position: 'absolute',
    top: 4,
    right: 4,
    bgcolor: 'rgba(0,0,0,0.6)',
    color: '#fff',
    fontSize: 14,
    '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
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

          {/* ================= CATEGORY SECTION ================= */}
          <Card>
            <CardHeader title="Product Category" />
            <CardContent sx={{ width: '100%' }}>
              <Grid container spacing={2} >

                  <Grid  size={{ xs: 12, md: 4 }}>
                    <Autocomplete
                      fullWidth
                      options={categories}
                      getOptionLabel={(option) => option?.name || ''}
                      value={values.category}
                      onChange={(e, value) => {
                        setFieldValue('category', value);
                        setFieldValue('subCategory', null);
                        setFieldValue('childCategory', null);
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label="Category" />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }} >
                    <Autocomplete
                      fullWidth
                      options={filteredSubCategories}
                      getOptionLabel={(option) => option?.name || ''}
                      value={values.subCategory}
                      disabled={!values.category}
                      onChange={(e, value) => {
                        setFieldValue('subCategory', value);
                        setFieldValue('childCategory', null);
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label="Sub Category" fullWidth />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <Autocomplete
                      fullWidth
                      options={filteredChildCategories}
                      getOptionLabel={(option) => option?.name || ''}
                      value={values.childCategory}
                      disabled={!values.subCategory}
                      onChange={(e, value) =>
                        setFieldValue('childCategory', value)
                      }
                      renderInput={(params) => (
                        <TextField {...params} label="Child Category" fullWidth />
                      )}
                    />
                  </Grid>

                </Grid>

            </CardContent>
          </Card>

          {/* ================= ITEM SPECIFICS ================= */}
<Card>
  <CardHeader title="Item Specifics" />
  <CardContent>
    <Grid container spacing={2}>

            {/* Brand */}
     {/* Branded Toggle */}
<Grid size={{ xs: 12, md: 12 }}>
  <FormControlLabel
    control={
      <Switch
        checked={values.isBranded}
        onChange={(e) => {
          formik.setFieldValue('isBranded', e.target.checked);
          if (!e.target.checked) formik.setFieldValue('brand', null);
        }}
      />
    }
    label="Branded Product?"
  />
</Grid>

{/* Brand Selector Button */}
{values.isBranded && (
  <Grid size={{ xs: 3, md: 3 }}>
    <Button
      fullWidth
      variant="outlined"
      onClick={() => setOpenBrandModal(true)}
    >
      {values.brand ? values.brand.name : 'Select Brand'}
    </Button>
  </Grid>
)}

      {/* Title */}
      <Grid  size={{ xs: 12, md: 12 }}>
        <TextField
          fullWidth
          label="Listing Title"
          name="title"
          value={values.title}
          onChange={formik.handleChange}
          placeholder="e.g. Apple iPhone 14 Pro Max 256GB"
        />
      </Grid>

      {/* Items in Set */}
      <Grid size={{xs:4 , md:4}}>
        <TextField
          fullWidth
          type="number"
          label="Number of Items in Set"
          name="itemsInSet"
          value={values.itemsInSet}
          onChange={formik.handleChange}
          inputProps={{ min: 1 }}
        />
      </Grid>

       <Grid size={{xs:4 , md:4}}>
        <TextField
          fullWidth
          type="number"
          label="Stock"
          name="itemstock"
          value={values.itemstock}
          onChange={formik.handleChange}
          inputProps={{ min: 1 }}
        />
      </Grid>




      {/* Pricing Mode */}
      <Grid size={{xs:4 , md:4}}>
        <TextField
          select
          fullWidth
          label="Pricing Mode"
          name="pricingMode"
          value={values.pricingMode}
          onChange={(e) => {
            formik.handleChange(e);
            if (e.target.value === 'quote') {
              formik.setFieldValue('mrp', '');
            }
          }}
        >
          <MenuItem value="declare">Declare Price</MenuItem>
          <MenuItem value="quote">Get Quote</MenuItem>
        </TextField>
      </Grid>

      {/* MRP */}
      {values.pricingMode === 'declare' && (
        <Grid size={{xs:12 , md:12}}>
          <TextField
            fullWidth
            type="number"
            label="MRP"
            name="mrp"
            value={values.mrp}
            onChange={formik.handleChange}
            inputProps={{ min: 0 }}
          />
        </Grid>
      )}

      {/* Tax Category */}
      {(
  <Grid size={{ xs: 12 }}>
    <Typography variant="subtitle1" sx={{ mb: 1 }}>
      Tax Details
    </Typography>

    {values.taxes.map((tax, index) => (
      <Grid
        container
        spacing={2}
        alignItems="center"
        key={index}
        sx={{ mb: 1 }}
      >

        {/* Tax Type */}
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            select
            fullWidth
            label="Tax Type"
            value={tax.taxType}
            onChange={(e) =>
              formik.setFieldValue(`taxes[${index}].taxType`, e.target.value)
            }
          >
            <MenuItem value="GST">GST</MenuItem>
            <MenuItem value="VAT">VAT</MenuItem>
            <MenuItem value="SERVICE">Service Tax</MenuItem>
            <MenuItem value="CESS">CESS</MenuItem>
            <MenuItem value="NONE">No Tax</MenuItem>
          </TextField>
        </Grid>

        {/* Tax Rate */}
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            select
            fullWidth
            label="Tax Rate (%)"
            value={tax.taxRate}
            disabled={!tax.taxType || tax.taxType === 'NONE'}
            onChange={(e) =>
              formik.setFieldValue(`taxes[${index}].taxRate`, e.target.value)
            }
          >
            {(tax.taxType === 'GST'
              ? [0, 5, 12, 18, 28]
              : tax.taxType === 'VAT'
              ? [1, 4, 5]
              : tax.taxType === 'SERVICE'
              ? [10, 12]
              : tax.taxType === 'CESS'
              ? [1, 2]
              : []
            ).map((rate) => (
              <MenuItem key={rate} value={rate}>
                {rate}%
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Remove Button */}
        <Grid size={{ xs: 12, md: 2 }}>
          {values.taxes.length > 1 && (
            <Button
              color="error"
              onClick={() => {
                const updated = [...values.taxes];
                updated.splice(index, 1);
                formik.setFieldValue('taxes', updated);
              }}
            >
              Remove
            </Button>
          )}
        </Grid>

      </Grid>
    ))}

    {/* Add Tax */}
    <Button
      variant="outlined"
      onClick={() =>
        formik.setFieldValue('taxes', [
          ...values.taxes,
          { taxType: '', taxRate: '' }
        ])
      }
    >
      + Add Another Tax
    </Button>
  </Grid>
)}


    </Grid>
  </CardContent>
</Card>

        <Card>
  <CardHeader title="Additional Details (Optional)" />
  <CardContent>
    <Grid container spacing={2}>

      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          fullWidth
          label="UPC"
          value={values.additionalDetails.upc}
          onChange={(e) =>
            formik.setFieldValue('additionalDetails.upc', e.target.value)
          }
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          fullWidth
          label="Material"
          value={values.additionalDetails.material}
          onChange={(e) =>
            formik.setFieldValue('additionalDetails.material', e.target.value)
          }
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          fullWidth
          label="Color"
          value={values.additionalDetails.color}
          onChange={(e) =>
            formik.setFieldValue('additionalDetails.color', e.target.value)
          }
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          fullWidth
          label="Width"
          type="number"
          value={values.additionalDetails.width}
          onChange={(e) =>
            formik.setFieldValue('additionalDetails.width', e.target.value)
          }
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          fullWidth
          label="Height"
          type="number"
          value={values.additionalDetails.height}
          onChange={(e) =>
            formik.setFieldValue('additionalDetails.height', e.target.value)
          }
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          fullWidth
          label="Weight"
          type="number"
          value={values.additionalDetails.weight}
          onChange={(e) =>
            formik.setFieldValue('additionalDetails.weight', e.target.value)
          }
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Unit"
          type="number"
          value={values.additionalDetails.weight}
          onChange={(e) =>
            formik.setFieldValue('additionalDetails.unit', e.target.value)
          }
        />
      </Grid>

      <Grid size={{ xs: 6, md: 6 }}>
        <TextField
          select
          fullWidth
          label="Unit Type"
          value={values.additionalDetails.unitType}
          onChange={(e) =>
            formik.setFieldValue('additionalDetails.unitType', e.target.value)
          }
        >
          <MenuItem value="cm">cm</MenuItem>
          <MenuItem value="inch">inch</MenuItem>
          <MenuItem value="mm">mm</MenuItem>
          <MenuItem value="kg">kg</MenuItem>
          <MenuItem value="g">g</MenuItem>
          <MenuItem value="lt">lt</MenuItem>
          <MenuItem value="ml">ml</MenuItem>
        </TextField>
      </Grid>

    </Grid>
  </CardContent>
</Card>


         
      <Card>
  <CardHeader title="Product Description" />
  <CardContent>
    <TextField
      fullWidth
      multiline
      minRows={6}
      label="Description"
      value={values.description}
      onChange={(e) =>
        formik.setFieldValue('description', e.target.value)
      }
      placeholder="Describe your product in detail..."
    />
  </CardContent>
</Card>

<Card>
  <CardHeader title="Variations" />
  <CardContent>

    {/* Toggle */}
    <FormControlLabel
      control={
        <Switch
          checked={values.hasVariations}
          onChange={(e) => {
            formik.setFieldValue('hasVariations', e.target.checked);
            if (!e.target.checked) {
              formik.setFieldValue('variationAttributes', [
                { name: '', values: [] }
              ]);
              formik.setFieldValue('variations', []);
            }
          }}
        />
      }
      label="This product has variations (Size, Color, etc.)"
    />

    {/* ATTRIBUTES BUILDER */}
    {values.hasVariations && (
      <Box sx={{ mt: 2 }}>

        {values.variationAttributes.map((attr, index) => (
          <Grid container spacing={2} key={index} sx={{ mb: 2 }}>

            {/* Attribute Name */}
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Attribute Name"
                placeholder="e.g. Color, Size"
                value={attr.name}
                onChange={(e) =>
                  formik.setFieldValue(
                    `variationAttributes[${index}].name`,
                    e.target.value
                  )
                }
              />
            </Grid>

            {/* Attribute Values */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={attr.values}
                onChange={(e, value) =>
                  formik.setFieldValue(
                    `variationAttributes[${index}].values`,
                    value
                  )
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Values"
                    placeholder="Type & press Enter (Red, Blue, M, L)"
                  />
                )}
              />
            </Grid>

            {/* Remove Attribute */}
            <Grid size={{ xs: 12, md: 2 }}>
              {values.variationAttributes.length > 1 && (
                <Button
                  color="error"
                  onClick={() => {
                    const updated = [...values.variationAttributes];
                    updated.splice(index, 1);
                    formik.setFieldValue('variationAttributes', updated);
                  }}
                >
                  Remove
                </Button>
              )}
            </Grid>

          </Grid>
        ))}

        {/* Add Attribute */}
        <Button
          variant="outlined"
          onClick={() =>
            formik.setFieldValue('variationAttributes', [
              ...values.variationAttributes,
              { name: '', values: [] }
            ])
          }
        >
          + Add Attribute
        </Button>

        {/* GENERATE VARIATIONS */}
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            onClick={() => {
              const attrs = values.variationAttributes.filter(
                (a) => a.name && a.values.length
              );

              const combos = generateCombinations(attrs);

              const variations = combos.map((combo, i) => ({
                attributes: combo,
                price: '',
                sku: `SKU-${i + 1}`,
                stock: ''
              }));

              formik.setFieldValue('variations', variations);
            }}
          >
            Generate Variations
          </Button>
        </Box>

      </Box>
    )}

    {/* VARIATION TABLE */}
    {values.variations.length > 0 && (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Variation Details
        </Typography>

        {values.variations.map((variant, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  disabled
                  label="Variation"
                  value={Object.entries(variant.attributes)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(', ')}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 2 }}>
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={variant.price}
                  onChange={(e) =>
                    formik.setFieldValue(`variations[${index}].price`, e.target.value)
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, md: 2 }}>
                <TextField
                  fullWidth
                  label="SKU"
                  value={variant.sku}
                  onChange={(e) =>
                    formik.setFieldValue(`variations[${index}].sku`, e.target.value)
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, md: 2 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Stock"
                  value={variant.stock}
                  onChange={(e) =>
                    formik.setFieldValue(`variations[${index}].stock`, e.target.value)
                  }
                />
              </Grid>

              {/* 🔥 Variation Image Upload */}
              <Grid size={{ xs: 12, md: 3 }}>
                <VariationImageUploader
                  images={variant.images}
                  onChange={(imgs) =>
                    formik.setFieldValue(`variations[${index}].images`, imgs)
                  }
                />
              </Grid>
            </Grid>
          ))}

      </Box>
    )}

  </CardContent>
</Card>
   
    <Card>
  <CardHeader title="Policy Settings" />
  <CardContent>
    <Grid container spacing={2}>

      {/* Shipping Policy */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Autocomplete
          fullWidth
          options={shipping_policies}
          getOptionLabel={(o) => o?.name || ''}
          value={values.shipping_policy}
          onChange={(e, v) => setFieldValue('shipping_policy', v)}
          renderInput={(params) => (
            <TextField {...params} label="Shipping Policy" />
          )}
        />
      </Grid>

      {/* Return Policy */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Autocomplete
          fullWidth
          options={return_policies}
          getOptionLabel={(o) => o?.name || ''}
          value={values.return_policy}
          onChange={(e, v) => setFieldValue('return_policy', v)}
          renderInput={(params) => (
            <TextField {...params} label="Return Policy" />
          )}
        />
      </Grid>

      {/* Cancel Policy */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Autocomplete
          fullWidth
          options={cancel_policies}
          getOptionLabel={(o) => o?.name || ''}
          value={values.cancel_policy}
          onChange={(e, v) => setFieldValue('cancel_policy', v)}
          renderInput={(params) => (
            <TextField {...params} label="Cancellation Policy" />
          )}
        />
      </Grid>

    </Grid>
  </CardContent>
</Card>

          <Card>
  <CardContent>
    <Stack direction="row" justifyContent="flex-start" spacing={2}>
      
      <Button type="submit" variant="contained" disabled={isUpdating}>
  {isUpdating ? 'Updating Product...' : 'Update Product'}
</Button>

      
      <Button
        variant="outlined"
        onClick={() => router.push('/vendor/products')}
      >
        Cancel
      </Button>

    </Stack>
  </CardContent>
</Card>

<Dialog
  open={openBrandModal}
  onClose={() => setOpenBrandModal(false)}
  fullWidth
  maxWidth="sm"
>
  <DialogTitle>Select Brand</DialogTitle>
  <DialogContent>
    <Autocomplete
      autoFocus
      fullWidth
      options={brands}
      getOptionLabel={(o) => o?.name || ''}
      value={values.brand}
      onChange={(e, value) => {
        formik.setFieldValue('brand', value);
        setOpenBrandModal(false);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search Brand"
          placeholder="Type brand name..."
        />
      )}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenBrandModal(false)}>Cancel</Button>
  </DialogActions>
</Dialog>


        </Stack>
      </Form>
    </FormikProvider>
  );
}

EditProductForm.propTypes = {
  categories: PropTypes.array,
  subCategories: PropTypes.array,
  childCategories: PropTypes.array
};
