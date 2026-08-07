import PropTypes from 'prop-types';
import { useRouter } from '@bprogress/next';
import { enUS } from 'date-fns/locale';
import Link from '@/utils/link';
import React, { useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProductStatus } from 'src/services';
import toast from 'react-hot-toast';
import { MdOutlineDrafts } from 'react-icons/md';

import {
  Box,
  TableRow,
  Skeleton,
  TableCell,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';

import { fDateShort } from '@/utils/format-time';
import BlurImage from '@/components/blur-image';
import { MdEdit, MdDelete } from 'react-icons/md';
import { IoEye } from 'react-icons/io5';
import { useSelector } from '@/redux';
import { useCurrencyFormat } from '@/hooks/use-currency-format';
import { getAssetUrl } from '@/utils/getAssetUrl';

export default function ProductRow({ isLoading, row, handleClickOpen, isVendor }) {
  const router = useRouter();
  const { currency } = useSelector((state) => state.settings);
  const fCurrency = useCurrencyFormat('base');

  const image = row?.images?.[0]?.url;

  const queryClient = useQueryClient();

    const { mutate: toggleStatus, isPending } = useMutation({
  mutationFn: ({ id, status }) => updateProductStatus(id, status),
  onSuccess: () => {
    toast.success('Product status updated');
    queryClient.invalidateQueries(['products']);
  },
  onError: () => toast.error('Failed to update product status')
});



  const imgSrc = getAssetUrl(image);

  const price = row?.hasVariations
    ? row?.variations?.[0]?.price
    : row?.mrp;

  const stock = row?.hasVariations
    ? row?.variations?.reduce((sum, v) => sum + v.stock, 0)
    : row?.stock;

    const [editOpen, setEditOpen] = useState(false);
const [editProduct, setEditProduct] = useState(null);
 
const handleEdit = (product) => {
  setEditProduct(product);
  setEditOpen(true);
};

const handleEditClose = () => {
  setEditOpen(false);
  setEditProduct(null);
};


  return (
    <TableRow hover >
      {/* PRODUCT */}
      <TableCell sx={{ maxWidth: 300 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          
          <Typography variant="subtitle2" noWrap>
            {isLoading ? <Skeleton width={120} /> : row?.title}
          </Typography>
        </Box>
      </TableCell>

      {/* PRICE */}
     

      {/* STOCK */}
      <TableCell>
        {isLoading ? (
          <Skeleton />
        ) : (
          <Chip
            size="small"
            label={
              stock < 1 ? 'Out of stock' : stock < 10 ? 'Low stock' : 'In stock'
            }
            color={
              stock < 1 ? 'error' : stock < 10 ? 'warning' : 'success'
            }
          />
        )}
      </TableCell>

      {/* STATUS */}
      <TableCell>
        {isLoading ? (
          <Skeleton />
        ) : (
          <Chip
            size="small"
            label={row?.status}
            color={
              row?.status === 'published'
                ? 'success'
                : row?.status === 'draft'
                ? 'warning'
                : 'info'
            }
          />
        )}
      </TableCell>

      {/* DATE */}
      <TableCell>
        {isLoading ? <Skeleton /> : fDateShort(row?.createdAt, enUS)}
      </TableCell>
      {!isVendor && (
      <TableCell align="center">
        {isLoading ? (
          <Skeleton width={80} />
        ) : (
          <Stack direction="row" spacing={1}>
            {/* EDIT */}
            <Tooltip title="Edit product">
              <IconButton
                size="small"
                onClick={() => router.push(`/admin/products/edit/${row._id}`)}
              >
                <MdEdit />
              </IconButton>
            </Tooltip>

            {/* STATUS TOGGLE */}
            <Tooltip
              title={
                row.status === 'published'
                  ? 'Move to Draft'
                  : 'Publish Product'
              }
            >
              <IconButton
                size="small"
                disabled={isPending}
                onClick={() =>
                  toggleStatus({
                    id: row._id,
                    status:
                      row.status === 'published' ? 'draft' : 'published'
                  })
                }
              >
                {row.status === 'published' ? (
                  <MdOutlineDrafts />
                ) : (
                  <IoEye />
                )}
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </TableCell>
)}

    </TableRow>
    
  );
}




ProductRow.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  isVendor: PropTypes.bool,
  row: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    mrp: PropTypes.number,
    stock: PropTypes.number,
    status: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
    images: PropTypes.array,
    hasVariations: PropTypes.bool,
    variations: PropTypes.array
  }),
  handleClickOpen: PropTypes.func.isRequired
};

