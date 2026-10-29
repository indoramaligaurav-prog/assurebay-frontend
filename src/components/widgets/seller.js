// react
import React from 'react';
import { useRouter } from '@bprogress/next';
import PropTypes from 'prop-types';
// mui
import { IconButton, Stack, Typography, alpha } from '@mui/material';
import { IoStorefrontOutline } from "react-icons/io5";


import { useSelector } from 'react-redux';

SellerWidget.propTypes = {
  isAuth: PropTypes.bool.isRequired
};

// ----------------------------------------------------------------------
export default function SellerWidget() {
  const router = useRouter();


  const { isAuthenticated } = useSelector(({ user }) => user);

  return (
    <>
     <Stack
  direction="row"
  alignItems="center"
  width="auto"
  spacing={1}
  sx={{
    cursor: "pointer",
    "&:hover": {
      color: "primary.main",
    },
  }}
  onClick={() => {
    router.push("/auth/sign-in");
  }}
>
  {/* ICON (no bg, no border, no padding) */}
  <IconButton
    disableRipple
    sx={{
      p: 0,
      m: 0,
      bgcolor: "transparent",
      border: "none",
      "&:hover": {
        bgcolor: "transparent",
      },
    }}
  >
    <IoStorefrontOutline size={20} />
  </IconButton>

  {/* TEXT */}
  <Stack gap={0}>
    <Typography
      sx={{
        fontSize: "12px",
        lineHeight: "14px",
        color: "text.primary",
      }}
    >
      Sell on <br /> wreeo
    </Typography>
  </Stack>
</Stack>
    </>
  );
}
