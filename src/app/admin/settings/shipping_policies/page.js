'use client';
import React from 'react';
import * as api from 'src/services';
import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  MenuItem
} from '@mui/material';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';

export default function AdminShippingPolicyForm() {

  const formik = useFormik({
    initialValues: {
      name: '',
      shipping_scope: 'domestic',
      shipping_payer: 'buyer',
      handling_days: 2,
      cod_allowed: true,
      status: true
    },

    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        setSubmitting(true);

        const payload = {
          name: values.name,
          shipping_scope: values.shipping_scope,
          shipping_payer: values.shipping_payer,
          handling_days: values.handling_days,
          cod_allowed: values.cod_allowed,
          status: values.status
        };

        const res = await api.createShippingPolicy(payload);

        console.log('Success:', res.data);
        toast.success('Shipping policy created successfully');
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
      <CardHeader title="Create Shipping Policy" />
      <CardContent>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>

            <Grid size={{ xs: 12, md: 12 }}>
              <TextField
                fullWidth
                label="Policy Name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid item size={{ xs: 6, md: 6 }}>
              <TextField
                select
                fullWidth
                label="Shipping Scope"
                name="shipping_scope"
                value={formik.values.shipping_scope}
                onChange={formik.handleChange}
              >
                <MenuItem value="domestic">Domestic</MenuItem>
                <MenuItem value="international">International</MenuItem>
                <MenuItem value="both">Domestic + International</MenuItem>
              </TextField>
            </Grid>

            <Grid item size={{ xs: 6, md: 6 }}>
              <TextField
                select
                fullWidth
                label="Shipping Paid By"
                name="shipping_payer"
                value={formik.values.shipping_payer}
                onChange={formik.handleChange}
              >
                <MenuItem value="buyer">Buyer</MenuItem>
                <MenuItem value="seller">Seller</MenuItem>
              </TextField>
            </Grid>

            <Grid item size={{ xs: 6, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Handling Days"
                name="handling_days"
                value={formik.values.handling_days}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid item size={{ xs: 6, md: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.cod_allowed}
                    onChange={(e) =>
                      formik.setFieldValue('cod_allowed', e.target.checked)
                    }
                  />
                }
                label="COD Allowed"
              />
            </Grid>

            <Grid item size={{ xs: 12, md: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.status}
                    onChange={(e) =>
                      formik.setFieldValue('status', e.target.checked)
                    }
                  />
                }
                label="Active"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? 'Saving...' : 'Save Shipping Policy'}
              </Button>
            </Grid>

          </Grid>
        </form>
      </CardContent>
    </Card>
  );
}
