import React from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getAssetUrl } from '@/utils/getAssetUrl';

// mui
import { styled } from '@mui/material/styles';
import { Box, TableRow, Skeleton, TableCell, Typography, Stack, IconButton, Tooltip, Chip } from '@mui/material';

// icons
import { MdVisibility, MdCheckCircle, MdCancel } from 'react-icons/md';

// components
import BlurImage from '@/components/blur-image';

// api
import * as api from 'src/services';

// utils
import { fDateShort } from '@/utils/format-time';

DraftProduct.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  row: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    productName: PropTypes.string,
    vendorName: PropTypes.string,
    childCategory: PropTypes.string,
    price: PropTypes.number,
    addedAt: PropTypes.string,
    image: PropTypes.string
  }).isRequired,
  handleOpenDetails: PropTypes.func.isRequired
};

const ThumbImgStyle = styled(Box)(({ theme }) => ({
  width: 50,
  height: 50,
  minWidth: 50,
  objectFit: 'cover',
  background: theme.palette.background.default,
  border: '1px solid ' + theme.palette.divider,
  borderRadius: theme.shape.borderRadiusSm,
  position: 'relative',
  overflow: 'hidden'
}));

const formatPrice = (price) => {
  if (price === null || price === undefined) return '-';
  return `₹${Number(price).toLocaleString('en-IN')}`;
};

export default function DraftProduct({ isLoading, row, handleOpenDetails }) {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['draft-products'] });

  const { mutate: approve, isPending: approving } = useMutation({
    mutationFn: api.approveProduct,
    onSuccess: () => {
      toast.success('Product approved');
      invalidate();
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to approve product')
  });

  const { mutate: reject, isPending: rejecting } = useMutation({
    mutationFn: api.rejectProduct,
    onSuccess: () => {
      toast.success('Product rejected');
      invalidate();
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to reject product')
  });

  const busy = approving || rejecting;

  const imageUrl = getAssetUrl(row?.image);

  return (
    <TableRow hover>
      <TableCell component="th" scope="row">
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isLoading ? (
            <Skeleton variant="rounded" width={50} height={50} sx={{ mr: 2 }} />
          ) : (
            <ThumbImgStyle sx={{ mr: 2 }}>
              <BlurImage src={imageUrl} alt={row?.productName} fill sizes="50px" />
            </ThumbImgStyle>
          )}
          <Typography variant="subtitle2" noWrap>
            {isLoading ? <Skeleton variant="text" width={140} /> : row?.productName}
          </Typography>
        </Box>
      </TableCell>

      <TableCell>{isLoading ? <Skeleton variant="text" /> : row?.vendorName}</TableCell>

      <TableCell>
        {isLoading ? <Skeleton variant="text" /> : <Chip size="small" label={row?.childCategory} />}
      </TableCell>

      <TableCell>{isLoading ? <Skeleton variant="text" /> : formatPrice(row?.price)}</TableCell>

      <TableCell>{isLoading ? <Skeleton variant="text" /> : fDateShort(row?.addedAt)}</TableCell>

      <TableCell align="right">
        <Stack direction="row" justifyContent="flex-end">
          {isLoading ? (
            <>
              <Skeleton variant="circular" width={34} height={34} sx={{ mr: 1 }} />
              <Skeleton variant="circular" width={34} height={34} sx={{ mr: 1 }} />
              <Skeleton variant="circular" width={34} height={34} />
            </>
          ) : (
            <>
              <Tooltip title="View details">
                <IconButton onClick={() => handleOpenDetails(row.slug)}>
                  <MdVisibility />
                </IconButton>
              </Tooltip>
              <Tooltip title="Approve">
                <IconButton color="success" disabled={busy} onClick={() => approve(row.slug)}>
                  <MdCheckCircle />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject">
                <IconButton color="error" disabled={busy} onClick={() => reject(row.slug)}>
                  <MdCancel />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Stack>
      </TableCell>
    </TableRow>
  );
}