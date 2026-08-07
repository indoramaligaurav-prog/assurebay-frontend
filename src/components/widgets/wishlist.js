// react
import React from 'react';
import { useRouter } from '@bprogress/next';
import PropTypes from 'prop-types';
// mui
import { IconButton, Stack, Typography, alpha } from '@mui/material';
import { IoMdHeartEmpty } from 'react-icons/io';
import { useSelector } from 'react-redux';

WishlistWidget.propTypes = {
  isAuth: PropTypes.bool.isRequired
};

// ----------------------------------------------------------------------
export default function WishlistWidget() {
  const router = useRouter();

  const { wishlist } = useSelector(({ wishlist }) => wishlist);
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
    if (!isAuthenticated) {
      router.push("/auth/sign-in");
    } else {
      router.push("/profile/wishlist");
    }
  }}
>
  {/* ICON */}
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
    <IoMdHeartEmpty size={20} />
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
      Wishlist
    </Typography>

    <Typography
      sx={{
        fontSize: "12px",
        lineHeight: "14px",
        color: "text.secondary",
      }}
    >
      {wishlist?.length || 0}{" "}
      {wishlist?.length > 1 ? "Items" : "Item"}
    </Typography>
  </Stack>
</Stack>
    </>
  );
}
