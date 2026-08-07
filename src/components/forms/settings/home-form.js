'use client';
import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  IconButton,
  FormHelperText,
  Grid,
  Skeleton
} from '@mui/material';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import UploadSingleFile from '@/components/upload/upload-single-file';
import { toast } from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import * as api from 'src/services';

import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { useUploadSingleFile } from '@/hooks/use-upload-file';
import { homeSettingsSchema } from '@/validations';

export default function HomeSettingsForm({ data: home }) {
  const [uploadLoading, setUploadLoading] = useState({});

  // Initial values
  const initialValues = {
    slides:
      home?.slides?.map((s) => ({ 
        link: s.link || '',
        image: {
  _id: s.image?._id || null,
  url: s.image?.url || null,
  preview: s.image?.url || null,
  file: null
}


      })) || [],
    banner1: {
      link: home?.banner1?.link || '',
      image: home?.banner1?.image
  ? {
      _id: home.banner1.image._id,
      url: home.banner1.image.url,
      preview: home.banner1.image.url,
      file: null
    }
  : null

    },
    banner2: {
      link: home?.banner2?.link || '',
      image: home?.banner2?.image || null
    }
  };

  // Mutation
  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: (data) => api.updateHomeSettingsByAdmin(data),
    onSuccess: () => toast.success('Home settings updated successfully'),
    onError: () => toast.error('Failed to update home settings')
  });

  // Formik
  const formik = useFormik({
    initialValues,
    validationSchema: homeSettingsSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
  const payload = JSON.parse(JSON.stringify(values)); // deep clone without File

  // 🔁 Upload slides
  for (let i = 0; i < values.slides.length; i++) {
    const slide = values.slides[i];

    if (slide.image?.file) {
      const res = await api.singleUploadFile(slide.image.file);

      payload.slides[i].image = {
        _id: res.public_id,
        url: res.secure_url
      };
    } else {
      payload.slides[i].image = {
        _id: slide.image?._id,
        url: slide.image?.url
      };
    }
  }

  // 🔁 Upload banner1
  if (values.banner1.image?.file) {
    const res = await api.singleUploadFile(values.banner1.image.file);
    payload.banner1.image = { _id: res.public_id, url: res.secure_url };
  }

  // 🔁 Upload banner2
  if (values.banner2.image?.file) {
    const res = await api.singleUploadFile(values.banner2.image.file);
    payload.banner2.image = { _id: res.public_id, url: res.secure_url };
  }

  mutate({
    _id: home._id,
    ...payload
  });
    }

  });

  const { values, errors, touched, handleSubmit, getFieldProps, setFieldValue } = formik;
  const { mutateAsync: deleteMutate } = useMutation({
    mutationFn: api.singleDeleteFile,
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong!');
    }
  });
 

 const handleDrop = (acceptedFiles, field) => {
  const file = acceptedFiles[0];
  if (!file) return;

  setFieldValue(field, {
    ...formik.getFieldMeta(field).value,
    file,
    preview: URL.createObjectURL(file)   // 👈 REQUIRED by UploadSingleFile
  });
};


  return (
    <FormikProvider value={formik}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          {/* Slides Section */}
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Slides</Typography>
                <Button
                  startIcon={<FiPlus />}
                  variant="contained"
                  onClick={() => setFieldValue('slides', [...values.slides, { link: '', image: null }])}
                >
                  Add Slide
                </Button>
              </Stack>
              <FieldArray
                name="slides"
                render={(arrayHelpers) => (
                  <Grid container spacing={2} mt={2}>
                    {values.slides.map((slide, index) => (
                      <Grid size={{ md: 6, xs: 12 }} key={index}>
                        <Card variant="outlined">
                          <CardContent>
                            <Stack spacing={2}>
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle1">Slide {index + 1}</Typography>
                                <IconButton color="error" onClick={() => arrayHelpers.remove(index)}>
                                  <FiTrash2 />
                                </IconButton>
                              </Stack>
                              <Stack gap={1}>
                                <Typography
                                  variant="overline"
                                  color="text.primary"
                                  htmlFor={`slides${index}-link`}
                                  component="label"
                                >
                                  {isLoading ? <Skeleton animation="wave" variant="text" width={120} /> : 'Slide link'}
                                </Typography>
                                {isLoading ? (
                                  <Skeleton variant="rounded" width="100%" height={56} />
                                ) : (
                                  <TextField
                                    id={`slides${index}-link`}
                                    {...getFieldProps(`slides[${index}].link`)}
                                    error={Boolean(touched.slides?.[index]?.link && errors.slides?.[index]?.link)}
                                    helperText={touched.slides?.[index]?.link && errors.slides?.[index]?.link}
                                  />
                                )}
                              </Stack>

                              <UploadSingleFile
                                  file={slide.image}
                                  onDrop={(files) => handleDrop(files, `slides[${index}].image`)}
                                  accept="image/*"
                                />

                              {touched.slides?.[index]?.image && errors.slides?.[index]?.image && (
                                <FormHelperText error>
                                  {errors.slides[index].image?._id ||
                                    errors.slides[index].image?.url ||
                                    'Image required'}
                                </FormHelperText>
                              )}
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              />
            </CardContent>
          </Card>
          {/* Banners */}
        

          <Box textAlign="right">
            <Button type="submit" variant="contained" loading={isLoading}>
              {'Save Changes'}
            </Button>
          </Box>
        </Stack>
      </form>
    </FormikProvider>
  );
}
