// react
import React from 'react';
import { useRouter } from '@bprogress/next';
import PropTypes from 'prop-types';
// mui
import { Badge, Stack, Typography } from '@mui/material';
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
  alignItems="center"
  spacing={0.25}
  onClick={() => router.push(isAuthenticated ? '/profile/wishlist' : '/auth/sign-in')}
  sx={{ cursor: 'pointer', color: '#4a4240', '&:hover': { color: '#c74735' } }}
>
  <Badge
    badgeContent={wishlist?.length || 0}
    sx={{ '& .MuiBadge-badge': { bgcolor: '#ed654f', color: '#fff', fontSize: 10, minWidth: 16, height: 16 } }}
  >
    <IoMdHeartEmpty size={22} />
  </Badge>
  <Typography sx={{ fontSize: 12, lineHeight: '14px', color: 'inherit' }}>Wishlist</Typography>
</Stack>
    </>
  );
}
