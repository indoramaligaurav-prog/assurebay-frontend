'use client';

import React from 'react';
import { toast } from 'react-hot-toast';

// MUI
import { FormControl, Stack, TextField, IconButton } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Formik
import { Form, FormikProvider, useFormik } from 'formik';

// API
import * as api from 'src/services';
import { useMutation } from '@tanstack/react-query';

export default function NewsLetter() {
  const [loading, setLoading] = React.useState(false);

  const formik = useFormik({
    initialValues: { email: '' },

    onSubmit: async (values) => {
      const email = values.email.trim();

      const emailRegex =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      if (emailRegex.test(email)) {
        setLoading(true);
        mutate({ ...values, email });
      } else {
        toast.error('Invalid email!');
      }
    }
  });

  const { mutate } = useMutation({
    mutationFn: api.sendNewsletter,

    onSuccess: (data) => {
      toast.success(data.message);
      setLoading(false);
      formik.resetForm();
    },

    onError: (err) => {
      setLoading(false);
      toast.error(
        err?.response?.data?.message || 'Something went wrong!'
      );
    }
  });

  const { handleSubmit, getFieldProps } = formik;

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.25}
          sx={{
            width: '100%',
            minWidth: 0
          }}
        >
          <FormControl
            fullWidth
            variant="outlined"
            sx={{
              flex: '1 1 auto',
              minWidth: 0
            }}
          >
            <TextField
              {...getFieldProps('email')}
              type="email"
              placeholder="Your email address"
              aria-label="Your email address"
              fullWidth
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: 52,
                  borderRadius: '12px',
                  bgcolor: '#FFFFFF',
                  color: '#405363',
                  fontSize: 14,

                  '& fieldset': {
                    borderColor: '#E0E5EB'
                  },

                  '&:hover fieldset': {
                    borderColor: '#CBD5E1'
                  },

                  '&.Mui-focused fieldset': {
                    borderColor: '#C74735',
                    borderWidth: '1px'
                  }
                },

                '& .MuiOutlinedInput-input': {
                  px: 2,
                  py: 1.5,

                  '&::placeholder': {
                    color: '#8A8F98',
                    opacity: 1
                  }
                }
              }}
            />
          </FormControl>

          <IconButton
            type="submit"
            aria-label="Subscribe to newsletter"
            disabled={loading}
            sx={{
              flex: '0 0 56px',
              width: 56,
              height: 52,
              borderRadius: '12px',
              bgcolor: '#F66B4D',
              color: '#FFFFFF',
              transition: 'background-color 0.2s ease',

              '&:hover': {
                bgcolor: '#E85B40'
              },

              '&.Mui-disabled': {
                bgcolor: '#F6A08D',
                color: '#FFFFFF'
              }
            }}
          >
            <ArrowForwardIcon sx={{ fontSize: 24 }} />
          </IconButton>
        </Stack>
      </Form>
    </FormikProvider>
  );
}