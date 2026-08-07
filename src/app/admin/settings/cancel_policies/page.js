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

const REFUND_MODES = [
  { label: 'Original Payment', value: 'original' },
  { label: 'Wallet', value: 'wallet' }
];

export default function AdminCancellationPolicyForm() {

  const formik = useFormik({
    initialValues: {
      name: '',
      cancellation_allowed: true,
      cancel_before_hours: 24,
      refund_mode: 'original',
      status: true
    },

    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        setSubmitting(true);

        const payload = {
          name: values.name,
          cancellation_allowed: values.cancellation_allowed,
          cancel_before_hours: values.cancel_before_hours,
          refund_mode: values.refund_mode,
          status: values.status
        };

        const res = await api.createCancellationPolicy(payload);

        console.log('Success:', res.data);
        toast.success('Cancellation policy created successfully');
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
      <CardHeader title="Create Cancellation Policy" />
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
                type="number"
                fullWidth
                label="Cancel Before (Hours)"
                name="cancel_before_hours"
                value={formik.values.cancel_before_hours}
                onChange={formik.handleChange}
                disabled={!formik.values.cancellation_allowed}
              />
            </Grid>

            <Grid item size={{ xs: 6, md: 6 }}>
              <TextField
                select
                fullWidth
                label="Refund Mode"
                name="refund_mode"
                value={formik.values.refund_mode}
                onChange={formik.handleChange}
              >
                {REFUND_MODES.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item size={{ xs: 6, md: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.cancellation_allowed}
                    onChange={(e) =>
                      formik.setFieldValue('cancellation_allowed', e.target.checked)
                    }
                  />
                }
                label="Cancellation Allowed"
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
                {formik.isSubmitting ? 'Saving...' : 'Save Cancellation Policy'}
              </Button>
            </Grid>

          </Grid>
        </form>
      </CardContent>
    </Card>
  );
}
