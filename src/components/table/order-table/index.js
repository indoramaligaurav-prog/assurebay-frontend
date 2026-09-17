'use client';
import React from 'react';
import PropTypes from 'prop-types';
import {
  Typography, Skeleton, Divider, Table, TableBody,
  TableRow, TableCell, Stack, Box, Chip
} from '@mui/material';
import Link from '@/utils/link';
import { useCurrencyFormat } from '@/hooks/use-currency-format';
import RootStyled from './styled';

import GetHelpButton from '@/components/_main/support/get-help-button';

TableCard.propTypes = {
  data: PropTypes.shape({
    items: PropTypes.array.isRequired,
    subTotal: PropTypes.number,
    shipping: PropTypes.number,
    discount: PropTypes.number,
    total: PropTypes.number,
    currency: PropTypes.string,
    conversionRate: PropTypes.number,
  }).isRequired,
  isLoading: PropTypes.bool.isRequired
};

export default function TableCard({ data, isLoading }) {
  const items = data?.items || [];
  const conversionRate = data?.conversionRate || 1;
  const fCurrency = useCurrencyFormat('custom', data?.currency);

  return (
    <RootStyled>
      {/* Header */}
      {isLoading ? (
        <Skeleton variant="text" width={150} />
      ) : (
        <Typography variant="h5" p={2}>
          {items.length} {items.length > 1 ? 'Items' : 'Item'} in your order
        </Typography>
      )}

      {/* Items Table */}
      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableBody>
            {/* Column Headers */}
            {!isLoading && (
              <TableRow sx={{ bgcolor: 'background.neutral' }}>
                <TableCell><Typography variant="caption" fontWeight={700} color="text.secondary">Product</Typography></TableCell>
                <TableCell align="center"><Typography variant="caption" fontWeight={700} color="text.secondary">Qty</Typography></TableCell>
                <TableCell align="right"><Typography variant="caption" fontWeight={700} color="text.secondary">Unit Price</Typography></TableCell>
                <TableCell align="right"><Typography variant="caption" fontWeight={700} color="text.secondary">Shipping</Typography></TableCell>
                <TableCell align="right"><Typography variant="caption" fontWeight={700} color="text.secondary">Subtotal</Typography></TableCell>
              </TableRow>
            )}

            {/* Item Rows */}
            {(isLoading ? Array.from({ length: 2 }) : items).map((item, i) => (
              <TableRow key={item?._id || i} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                {/* Product */}
                <TableCell>
                  {isLoading ? <Skeleton width={200} /> : (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      {item.imageUrl && (
                        <Box
                          component="img"
                          src={item.imageUrl}
                          alt={item.productName}
                          sx={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 1, flexShrink: 0, border: '1px solid', borderColor: 'divider' }}
                        />
                      )}
                      <Stack spacing={0.5}>
                        <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3 }}>
                          {item.productName}
                        </Typography>
                        {item.variant && (
                          <Typography variant="caption" color="text.secondary">{item.variant}</Typography>
                        )}
                        <Chip
                          label={item.vendorStatus || 'pending'}
                          size="small"
                          sx={{
                            width: 'fit-content',
                            fontSize: 10,
                            height: 18,
                            bgcolor: item.vendorStatus === 'delivered' ? 'success.lighter'
                              : item.vendorStatus === 'shipped' ? 'info.lighter'
                              : 'warning.lighter',
                            color: item.vendorStatus === 'delivered' ? 'success.dark'
                              : item.vendorStatus === 'shipped' ? 'info.dark'
                              : 'warning.dark',
                          }}
                        />
                        
                         <GetHelpButton
                          orderId={data?._id}
                          orderNo={data?.orderNo}
                          orderItemId={item._id}
                          productName={item.productName}
                          productId={item.productId || item.product}
                        />
                      </Stack>
                    </Stack>
                  )}
                </TableCell>

                {/* Qty */}
                <TableCell align="center">
                  {isLoading ? <Skeleton width={30} /> : (
                    <Typography variant="body2">{item.quantity}</Typography>
                  )}
                </TableCell>

                {/* Unit Price */}
                <TableCell align="right">
                  {isLoading ? <Skeleton width={60} /> : (
                    <Typography variant="body2">
                      {fCurrency((item.unitPrice || 0) * conversionRate)}
                    </Typography>
                  )}
                </TableCell>

                {/* Shipping */}
                <TableCell align="right">
                  {isLoading ? <Skeleton width={60} /> : (
                    <Typography variant="body2" color="text.secondary">
                      {item.shipping > 0
                        ? fCurrency(item.shipping * conversionRate)
                        : <Typography component="span" variant="body2" color="success.main">Free</Typography>
                      }
                    </Typography>
                  )}
                </TableCell>

                {/* Subtotal */}
                <TableCell align="right">
                  {isLoading ? <Skeleton width={60} /> : (
                    <Typography variant="body2" fontWeight={600}>
                      {fCurrency((item.subtotal || 0) * conversionRate)}
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {/* Tracking per item (if available) */}
      {!isLoading && items.some(i => i.courierName) && (
        <Box px={2} pb={2}>
          {items.filter(i => i.courierName).map((item) => (
            <Box key={item._id} sx={{ mt: 1.5, p: 1.5, bgcolor: 'background.neutral', borderRadius: 1 }}>
              <Typography variant="caption" fontWeight={600}>{item.productName}</Typography>
              <Typography variant="body2" mt={0.5}>
                <strong>Courier:</strong> {item.courierName}
                {item.shippingService && ` · ${item.shippingService}`}
              </Typography>
              {item.trackingLink && (
                <Typography variant="body2">
                  <strong>Tracking:</strong>{' '}
                  <Link href={item.trackingLink} target="_blank">Track package</Link>
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      )}

      {/* Order Totals */}
      <Divider sx={{ my: 2 }} />
      <Box sx={{ maxWidth: 400, ml: 'auto', pr: 2, pb: 2 }}>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell sx={{ border: 0, py: 0.5 }}>
                {isLoading ? <Skeleton width={100} /> : <Typography variant="body2">Subtotal</Typography>}
              </TableCell>
              <TableCell align="right" sx={{ border: 0, py: 0.5 }}>
                {isLoading ? <Skeleton width={80} /> : (
                  <Typography variant="body2">{fCurrency((data?.subTotal || 0) * conversionRate)}</Typography>
                )}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell sx={{ border: 0, py: 0.5 }}>
                {isLoading ? <Skeleton width={100} /> : <Typography variant="body2" color="text.secondary">Shipping</Typography>}
              </TableCell>
              <TableCell align="right" sx={{ border: 0, py: 0.5 }}>
                {isLoading ? <Skeleton width={80} /> : (
                  <Typography variant="body2" color="text.secondary">{fCurrency((data?.shipping || 0) * conversionRate)}</Typography>
                )}
              </TableCell>
            </TableRow>

            {data?.discount > 0 && (
              <TableRow>
                <TableCell sx={{ border: 0, py: 0.5 }}>
                  <Typography variant="body2" color="success.main">Discount</Typography>
                </TableCell>
                <TableCell align="right" sx={{ border: 0, py: 0.5 }}>
                  <Typography variant="body2" color="success.main">
                    -{fCurrency(data.discount * conversionRate)}
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            <TableRow>
              <TableCell sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 1 }}>
                {isLoading ? <Skeleton width={100} /> : <Typography variant="subtitle1" fontWeight={700}>Total</Typography>}
              </TableCell>
              <TableCell align="right" sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 1 }}>
                {isLoading ? <Skeleton width={80} /> : (
                  <Typography variant="h6" fontWeight={700}>
                    {fCurrency((data?.total || 0) * conversionRate)}
                  </Typography>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    </RootStyled>
  );
}