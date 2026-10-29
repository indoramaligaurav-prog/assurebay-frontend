'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@bprogress/next';
import Link from '@/utils/link';
import { toast } from 'react-hot-toast';
// formik
import { useFormik, Form, FormikProvider } from 'formik';
// redux
import { useDispatch } from 'react-redux';
import { signIn } from 'src/redux/slices/user';
// api
import { useMutation } from '@tanstack/react-query';
import * as api from 'src/services';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { setWishlist } from 'src/redux/slices/wishlist';
// mui
import {
  Stack,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Box,
  MenuItem,
  FormControlLabel,
  Checkbox
} from '@mui/material';

import countries from 'src/data/countries.json';

// icons
import { MdOutlineVisibility } from 'react-icons/md';
import { MdOutlineVisibilityOff } from 'react-icons/md';

import { IoMdMail } from 'react-icons/io';
import { MdLock } from 'react-icons/md';

import { IoPerson } from 'react-icons/io5';

// hooks
import { setCookie } from '@/hooks/use-cookies';
import PhoneInputField from '../phone-input-field';
import { signUpSchema, businessSignUpSchema } from '@/validations';
export default function SignUpForm() {
  const router = useRouter();
  const searchParam = useSearchParams();
  const redirect = searchParam.get('redirect');
  const dispatch = useDispatch();

  const [loading, setloading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState('personal');

useEffect(() => {
  const init = () => {
    if (typeof window !== 'undefined' && window.AppleID) {
      window.AppleID.auth.init({
        clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID,
        scope: 'name email',
        redirectURI: process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI,
        usePopup: true
      });
    }
  };
  // If script already loaded, init immediately; otherwise wait for it
  if (window.AppleID) {
    init();
  } else {
    const script = document.querySelector(
      'script[src*="appleid.cdn-apple.com"]'
    );
    if (script) script.addEventListener('load', init);
  }
}, []);

  const formik = useFormik({
            initialValues: { firstName: '', lastName: '', companyName: '', businessCountry: '', phone: '', email: '', password: '', buyingOnly: false },
            validationSchema: accountType === 'business' ? businessSignUpSchema : signUpSchema,
            onSubmit: async (values) => {
              setloading(true);
              const payload =
                accountType === 'business'
                  ? {
                      accountType: 'business',
                      companyName: values.companyName,
                      businessCountry: values.businessCountry,
                      email: values.email,
                      password: values.password,
                      buyingOnly: values.buyingOnly
                    }
                  : {
                      accountType: 'personal',
                      firstName: values.firstName,
                      lastName: values.lastName,
                      email: values.email,
                      password: values.password
                    };
              mutate(payload);
            }
  });

  const googleLogin = useGoogleLogin({
  onSuccess: async (tokenResponse) => {
    try {
      setloading(true);
      const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
      });

      const response = await api.googleSignIn({
        name: userInfo.data.name,
        email: userInfo.data.email,
        image: userInfo.data.picture,
        google_id: userInfo.data.sub
      });

      dispatch(signIn(response.user));
      dispatch(setWishlist(response.user.wishlist || []));
      await setCookie('token', response.token);
      toast.success('Google sign-up successful!');

      const isAdmin = response.user?.role?.includes('admin');
      const isVendor = response.user?.role?.includes('vendor');
      router.push(
        redirect ? redirect : isAdmin ? '/admin/dashboard' : isVendor ? '/vendor/dashboard' : '/'
      );
    } catch (err) {
      toast.error('Google sign-up failed');
    } finally {
      setloading(false);
    }
  },
  onError: () => toast.error('Google sign-up failed')
});

  const { mutate } = useMutation({
    mutationFn: api.signUp,
    onSuccess: async (data, variables) => {
      dispatch(signIn(data.user));
      await setCookie('token', data.token);
      toast.success(`OTP sent to your email ${data.user.firstName}`);
       const otpRedirect = variables.accountType === 'business' && !variables.buyingOnly ? '/create-shop' : redirect || '/';
      router.push(`/auth/verify-otp?redirect=${otpRedirect}`);
    },
    onError: (err) => {
      const message = err?.response?.data?.message;
      toast.error(message || 'Something went wrong!');
    },
    onSettled: () => {
      setloading(false);
    }
  });

  const handleAppleLogin = async () => {
  try {
    setloading(true);
    const appleResponse = await window.AppleID.auth.signIn();
    const response = await api.appleSignIn({
      id_token: appleResponse.authorization.id_token,
      firstName: appleResponse.user?.name?.firstName || '',
      lastName: appleResponse.user?.name?.lastName || '',
      email: appleResponse.user?.email || ''
    });
    dispatch(signIn(response.user));
    dispatch(setWishlist(response.user.wishlist || []));
    await setCookie('token', response.token);
    toast.success('Apple sign-up successful!');
    const isAdmin = response.user?.role?.includes('admin');
    const isVendor = response.user?.role?.includes('vendor');
    router.push(redirect ? redirect : isAdmin ? '/admin/dashboard' : isVendor ? '/vendor/dashboard' : '/');
  } catch (err) {
    toast.error('Apple sign-up failed');
  } finally {
    setloading(false);
  }
};

  const { errors, touched, handleSubmit, values, getFieldProps, setFieldValue } = formik;
  const inputStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '999px',
    height: 58,
    bgcolor: '#fff',
  }
};
  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Box
  sx={{
    borderBottom: '1px solid',
    borderColor: 'divider',
    mb: 4,
  }}
>
  <ToggleButtonGroup
    value={accountType}
    exclusive
   onChange={(e, value) => {
      if (value) {
        setAccountType(value);
        formik.setTouched({}, false);
        formik.setErrors({});
      }
    }}
    fullWidth
    sx={{
      gap: 2,

      '& .MuiToggleButton-root': {
        border: 'none',
        borderRadius: 0,
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '16px',
        color: 'text.secondary',
        pb: 1.5,
        px: 0,
        flex: 1,
      },

      '& .Mui-selected': {
        bgcolor: 'transparent !important',
        color: '#000 !important',
        borderBottom: '3px solid #3665f3',
      },
    }}
  >
    <ToggleButton value="personal">
      Personal
    </ToggleButton>

    <ToggleButton value="business">
      Business
    </ToggleButton>
  </ToggleButtonGroup>
</Box>
        <Stack spacing={3}>
         
         <Stack spacing={2}>


              {accountType === 'personal' ? (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  placeholder="First name"
                  {...getFieldProps('firstName')}
                  error={Boolean(touched.firstName && errors.firstName)}
                  helperText={touched.firstName && errors.firstName}
                  sx={inputStyle}
                />

                <TextField
                  fullWidth
                  placeholder="Last name"
                  {...getFieldProps('lastName')}
                  error={Boolean(touched.lastName && errors.lastName)}
                  helperText={touched.lastName && errors.lastName}
                  sx={inputStyle}
                />
              </Stack>

              ) : (
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  placeholder="Business name"
                  {...getFieldProps('companyName')}
                  error={Boolean(touched.companyName && errors.companyName)}
                  helperText={touched.companyName && errors.companyName}
                  sx={inputStyle}
                />
                <TextField
                  select
                  fullWidth
                  {...getFieldProps('businessCountry')}
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: (v) => v || <span style={{ color: '#757575' }}>Country where business is registered</span>
                  }}
                  error={Boolean(touched.businessCountry && errors.businessCountry)}
                  helperText={touched.businessCountry && errors.businessCountry}
                  sx={inputStyle}
                >
                  {countries.map((c) => (
                    <MenuItem key={c.code} value={c.label}>
                      {c.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            )}

            </Stack>

          {/* <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          
            <Stack gap={0.5} width={1}>
              <Typography variant="overline" color="text.primary" htmlFor="phone" component={'label'}>
                Phone
              </Typography>
              <PhoneInputField
                error={errors?.phone}
                onChange={(val) => setFieldValue('phone', val)}
                value={values.phone}
              />
            </Stack>
          </Stack> */}
          <Stack gap={0.5} width={1}>
            <Typography variant="overline" color="text.primary" htmlFor="email" component={'label'}>
              {accountType === 'business' ? 'Business email' : 'Email'}
            </Typography>
            <TextField
              id="email"
              fullWidth
              autoComplete="username"
              type="email"
              {...getFieldProps('email')}
              error={Boolean(touched.email && errors.email)}
              helperText={touched.email && errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IoMdMail size={24} />
                  </InputAdornment>
                )
              }}
            />
          </Stack>
          <Stack gap={0.5} width={1}>
            <Typography variant="overline" color="text.primary" htmlFor="password" component={'label'}>
              Password
            </Typography>
            <TextField
              id="password"
              fullWidth
              autoComplete="current-password"
              type={showPassword ? 'text' : 'password'}
              {...getFieldProps('password')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MdLock size={24} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" onClick={() => setShowPassword((prev) => !prev)}>
                      {showPassword ? <MdOutlineVisibility size={24} /> : <MdOutlineVisibilityOff size={24} />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              error={Boolean(touched.password && errors.password)}
              helperText={touched.password && errors.password}
            />
          </Stack>

          {accountType === 'business' && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={values.buyingOnly}
                  onChange={(e) => setFieldValue('buyingOnly', e.target.checked)}
                />
              }
              label="I'm only interested in buying on Assuredbay for now"
            />
          )}
              
          <Button fullWidth size="large" type="submit" variant="contained" loading={loading}>
            Sign up
          </Button>

          {/* Google sign-up — Personal only */}
{accountType === 'personal' && (
  <>
    <Stack direction="row" alignItems="center" spacing={2}>
      <Stack flex={1} height="1px" bgcolor="divider" />
      <Typography variant="body2" color="text.secondary">or</Typography>
      <Stack flex={1} height="1px" bgcolor="divider" />
    </Stack>

    <Button
      fullWidth
      variant="outlined"
      size="large"
      startIcon={
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="google"
          width={22}
          height={22}
        />
      }
      sx={{
        py: 1.2,
        borderRadius: '999px',
        textTransform: 'none',
        fontSize: '16px',
        fontWeight: 600,
        color: 'text.primary',
        borderColor: 'grey.400',
        '&:hover': { borderColor: 'grey.500', backgroundColor: 'grey.100' }
      }}
      onClick={() => googleLogin()}
    >
      Continue with Google
    </Button>
    <Button
  fullWidth
  variant="outlined"
  size="large"
  startIcon={
    <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 814 1000" fill="currentColor">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-155.5-118.3c-58.1-91.3-108.4-235.7-108.4-373.7 0-222.4 145.1-339.9 287.9-339.9 75.8 0 139 49.7 186.6 49.7 45.5 0 117.1-52.7 203.7-52.7 32.4 0 133.6 2.9 203.6 88.7zm-86.3-161.3c37.3-44.5 64.2-107.4 64.2-170.3 0-8.7-.6-17.4-2-25.4-60.5 2.3-132.3 40.7-175.9 91.3-33.8 37.9-66.3 101.5-66.3 165.5 0 9.3 1.5 18.7 2.2 21.8 3.9.7 10.4 1.4 16.8 1.4 54 0 121.2-36.2 161-84.3z"/>
    </svg>
  }
  sx={{
    py: 1.2,
    borderRadius: '999px',
    textTransform: 'none',
    fontSize: '16px',
    fontWeight: 600,
    color: 'text.primary',
    borderColor: 'grey.400',
    '&:hover': { borderColor: 'grey.500', backgroundColor: 'grey.100' }
  }}
  onClick={handleAppleLogin}
  disabled={loading}
>
  Continue with Apple
</Button>
  </>
)}

          <Typography variant="subtitle2" mt={3} textAlign="center">
            Already have an account? &nbsp;
            <Link href={`/auth/sign-in${router.query?.redirect ? '?redirect=' + router.query?.redirect : ''}`}>
              Sign in
            </Link>
          </Typography>
        </Stack>
        <Typography variant="body2" align="center" color="text.secondary" mt={2}>
          By registering, I agree to Assuredbay&nbsp;
          <Link underline="always" color="text.primary" href="#" variant="body2">
            Terms
          </Link>
          &nbsp;and&nbsp;
          <Link variant="body2" underline="always" color="text.primary" href="#">
            Privacy policy
          </Link>
          .
        </Typography>
      </Form>
    </FormikProvider>
  );
}
