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
  MenuItem,
  Chip,
  Stack
} from '@mui/material';
import { useFormik } from 'formik';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const REFUND_MODES = [
  { label: 'Original Payment', value: 'original' },
  { label: 'Wallet', value: 'wallet' },
  { label: 'Replacement', value: 'replacement' }
];

export default function AdminReturnPolicyForm() {
  const formik = useFormik({
    initialValues: {
      name: '',
      return_allowed: true,
      return_window_days: 7,
      return_shipping_payer: 'buyer',
      refund_mode: 'original',
      replacement_allowed: false,
      conditions: [],
      status: true
    },
    onSubmit: async (values, { resetForm, setSubmitting }) => {
  try {
    setSubmitting(true);

    const payload = {
      name: values.name,
      return_allowed: values.return_allowed,
      return_window_days: values.return_window_days,
      return_shipping_payer: values.return_shipping_payer,
      refund_mode: values.refund_mode,
      replacement_allowed: values.replacement_allowed,
      conditions: values.conditions,
      status: values.status
    };

    const res = await api.returnpolicies(payload);

    console.log('Success:', res.data);

    resetForm();
    alert('Return policy created successfully');

  } catch (error) {
    console.error(error);
    alert(error?.response?.data?.message || 'Something went wrong');
  } finally {
    setSubmitting(false);
  }
}

  });

  return (
    <Card>
      <CardHeader title="Create Return Policy" />
      <CardContent>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>

            <Grid  size={{ xs: 12, md: 12 }}>
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
                fullWidth
                type="number"
                label="Return Window (Days)"
                name="return_window_days"
                value={formik.values.return_window_days}
                onChange={formik.handleChange}
                disabled={!formik.values.return_allowed}
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
              <TextField
                select
                fullWidth
                label="Return Shipping Paid By"
                name="return_shipping_payer"
                value={formik.values.return_shipping_payer}
                onChange={formik.handleChange}
              >
                <MenuItem value="buyer">Buyer</MenuItem>
                <MenuItem value="seller">Seller</MenuItem>
              </TextField>
            </Grid>

            <Grid item size={{ xs: 6, md: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.replacement_allowed}
                    onChange={(e) =>
                      formik.setFieldValue('replacement_allowed', e.target.checked)
                    }
                  />
                }
                label="Replacement Allowed"
              />
            </Grid>

            <Grid item size={{ xs: 12, md: 12 }}>
              <Stack direction="row" spacing={1}>
                {formik.values.conditions.map((c, i) => (
                  <Chip key={i} label={c} />
                ))}
              </Stack>
            </Grid>

            <Grid item size={{xs:12, md:12}}>
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
  {formik.isSubmitting ? 'Saving...' : 'Save Policy'}
</Button>

            </Grid>

          </Grid>
        </form>
      </CardContent>
    </Card>
  );
}
