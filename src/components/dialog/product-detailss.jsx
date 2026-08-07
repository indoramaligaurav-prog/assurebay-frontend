import React from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { getAssetUrl } from '@/utils/getAssetUrl';

// mui
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Chip,
  Skeleton,
  Stack,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material';

// components
import BlurImage from '@/components/blur-image';

// api
import * as api from 'src/services';

ProductDetailsDialog.propTypes = {
  slug: PropTypes.string,
  onClose: PropTypes.func.isRequired
};

const formatPrice = (price) => {
  if (price === null || price === undefined || price === '') return '-';
  return `₹${Number(price).toLocaleString('en-IN')}`;
};

function Detail({ label, value }) {
  return (
    <Grid item xs={6}>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Typography variant="body2">{value ?? '-'}</Typography>
    </Grid>
  );
}

export default function ProductDetailsDialog({ slug, onClose }) {
  const queryClient = useQueryClient();

  const { data: res, isLoading } = useQuery({
    queryKey: ['draft-product', slug],
    queryFn: () => api.getAdminProduct(slug),
    enabled: !!slug
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['draft-products'] });
    onClose();
  };

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

  const p = res?.data;
  const busy = approving || rejecting;
  const hasVariants = p?.hasVariations && Array.isArray(p?.variations) && p.variations.length > 0;

  return (
    <>
      <DialogTitle>Product Details</DialogTitle>

      <DialogContent dividers>
        {isLoading ? (
          <Stack spacing={2}>
            <Skeleton variant="rounded" height={100} />
            <Skeleton variant="text" />
            <Skeleton variant="text" />
          </Stack>
        ) : p ? (
          <Stack spacing={3}>
            {p.images?.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ overflowX: 'auto' }}>
                {p.images.map((img, i) => (
                  <BlurImage
                    key={i}
                      src={getAssetUrl(img.url)}
                    alt={img.name}
                    width={80}
                    height={80}
                    style={{ borderRadius: 8, objectFit: 'cover' }}
                  />
                ))}
              </Stack>
            )}

            <Grid container spacing={2}>
              <Detail label="Title" value={p.title} />
              <Detail label="Vendor" value={p.vendor?.shop?.name} />
              <Detail label="Category" value={p.category?.name} />
              <Detail label="Sub Category" value={p.subCategory?.name} />
              <Detail label="Child Category" value={p.childCategory?.name} />
              <Detail label="Brand" value={p.isBranded ? p.brand?.name : '-'} />

              {/* Price/Stock: only shown here when the product has NO variants — 
                  when variants exist, price/stock vary per variant and are shown below instead */}
              {!hasVariants && (
                <>
                  <Detail label="MRP" value={formatPrice(p.mrp)} />
                  <Detail label="Discount Price" value={formatPrice(p.discountPrice)} />
                  <Detail label="Stock" value={p.stock} />
                </>
              )}

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                  Status
                </Typography>
                <Chip size="small" label={p.status} sx={{ display: 'block', width: 'fit-content' }} />
              </Grid>
              <Detail label="Handling Time" value={p.handlingTime} />
              <Detail label="Shipping Policy" value={p.shipping_policy?.name} />
              <Detail label="Rating" value={p.totalRating ? p.totalRating.toFixed(1) : '-'} />
              <Detail label="Reviews" value={p.totalReviews ?? 0} />
            </Grid>

            {p.description && (
              <>
                <Divider />
                <div>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                    Description
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    {p.description}
                  </Typography>
                </div>
              </>
            )}

            {/* ── Variations ── */}
            {hasVariants && (
              <>
                <Divider />
                <div>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}
                  >
                    Variations ({p.variations.length})
                  </Typography>

                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Attributes</TableCell>
                        <TableCell>SKU</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Stock</TableCell>
                        <TableCell>Image</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {p.variations.map((v, i) => (
                        <TableRow key={v.sku || i}>
                          <TableCell>
                            {Object.entries(v.attributes || {})
                              .map(([k, val]) => `${k}: ${val}`)
                              .join(', ') || '-'}
                          </TableCell>
                          <TableCell>{v.sku || '-'}</TableCell>
                          <TableCell>
                            {formatPrice(v.discountPrice || v.price)}
                            {v.discountPrice && (
                              <Typography
                                component="span"
                                variant="caption"
                                sx={{ textDecoration: 'line-through', ml: 0.5 }}
                                color="text.secondary"
                              >
                                {formatPrice(v.price)}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>{v.stock ?? '-'}</TableCell>
                          <TableCell>
                            {v.images?.[0]?.url ? (
                              <BlurImage
                                src={getAssetUrl(v.images[0].url)}
                                alt={v.sku}
                                width={40}
                                height={40}
                                style={{ borderRadius: 4, objectFit: 'cover' }}
                              />
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </Stack>
        ) : (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            Failed to load product.
          </Typography>
        )}
      </DialogContent>

      {p && (
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button variant="contained" color="error" loading={rejecting} disabled={busy} onClick={() => reject(p.slug)}>
            Reject
          </Button>
          <Button variant="contained" color="success" loading={approving} disabled={busy} onClick={() => approve(p.slug)}>
            Approve
          </Button>
        </DialogActions>
      )}
    </>
  );
}