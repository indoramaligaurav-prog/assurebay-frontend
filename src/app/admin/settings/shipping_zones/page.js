'use client';
import React from 'react';
import * as api from 'src/services';
import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  TextField,
  Button
} from '@mui/material';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';

export default function AdminShippingZoneForm() {

  const formik = useFormik({
    initialValues: {
      name: '',
      countries: '',
      states: '',
      cities: '',
      pincodes: ''
    },

    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        setSubmitting(true);

        const payload = {
          name: values.name,
          countries: values.countries.split(',').map(i => i.trim()),
          states: values.states.split(',').map(i => i.trim()),
          cities: values.cities.split(',').map(i => i.trim()),
          pincodes: values.pincodes.split(',').map(i => i.trim())
        };

        const res = await api.createShippingZone(payload);

        console.log('Success:', res.data);
        toast.success('Shipping zone created successfully');
        resetForm();

      } catch (error) {
        console.error(error);
        toast.error(error?.response?.data?.message || 'Something went wrong');
      } finally {
        setSubmitting(false);
      }
    }
  });

  return (
    <Card>
      <CardHeader title="Create Shipping Zone" />
      <CardContent>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>

            <Grid size={{ xs: 12, md: 12 }}>
              <TextField
                fullWidth
                label="Zone Name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 12 }}>
              <TextField
                fullWidth
                label="Countries (comma separated, e.g. IN, US)"
                name="countries"
                value={formik.values.countries}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 12 }}>
              <TextField
                fullWidth
                label="States (comma separated)"
                name="states"
                value={formik.values.states}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 12 }}>
              <TextField
                fullWidth
                label="Cities (comma separated)"
                name="cities"
                value={formik.values.cities}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 12 }}>
              <TextField
                fullWidth
                label="Pincodes / Zipcodes (comma separated)"
                name="pincodes"
                value={formik.values.pincodes}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? 'Saving...' : 'Save Zone'}
              </Button>
            </Grid>

          </Grid>
        </form>
      </CardContent>
    </Card>
  );
}
