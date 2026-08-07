'use client';
import React, { use } from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  Box,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  Paper,
  Divider
} from '@mui/material';

import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import * as api from 'src/services';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from '@/redux';

Page.propTypes = {
  params: PropTypes.shape({ oid: PropTypes.string.isRequired }).isRequired
};

export default function Page(props) {
  const { user } = useSelector((state) => state.user);
  const params = use(props.params);



  const { data, isPending: isLoading } = useQuery({
    queryKey: ['order-by-vendor', params.oid],
    queryFn: () => api.getOrderByVendor(params.oid)
  });

  const order = data?.data;

  // ✅ Filter vendor items
  const vendorItems =
    order?.items?.filter((item) => item.vendorid === user?._id) || [];

  // ✅ Recalculate totals
  const subTotal = vendorItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const shipping = vendorItems.reduce((sum, item) => sum + (item.shipping || 0), 0);
  const total = subTotal + shipping;

  console.log("FULL API RESPONSE:", data);
console.log("ORDER DATA:", data?.data);


  return (
    <Box>
      <HeaderBreadcrumbs
        admin
        links={[
          { name: 'Dashboard', href: '/vendor/dashboard' },
          { name: 'Orders', href: '/vendor/orders' },
          { name: 'Order details' }
        ]}
      />

      <Grid container spacing={3}>
        {/* LEFT SIDE - Order Info */}
        <Grid item xs={12} md={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Info
            </Typography>

            {isLoading ? (
              <Typography>Loading...</Typography>
            ) : (
              <>
                <Typography><strong>Order No:</strong> {order?.orderNo}</Typography>
                <Typography><strong>Status:</strong> {order?.status}</Typography>
                <Typography><strong>Customer:</strong> {order?.user?.firstName} {order?.user?.lastName}</Typography>
               

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" fontWeight="bold">
                  Shipping Info
                </Typography>

                <Typography>
                  {order?.user?.address}, {order?.user?.city}
                </Typography>
                <Typography>
                  {order?.user?.state}, {order?.user?.country} - {order?.user?.zip}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" fontWeight="bold">
                  Courier Details
                </Typography>

                <Typography>
                  <strong>Courier:</strong> {order?.courierName || 'Not Assigned'}
                </Typography>

                {order?.trackingLink && (
                  <Typography>
                    <strong>Tracking:</strong>{' '}
                    <a href={order?.trackingLink} target="_blank">
                      Track Package
                    </a>
                  </Typography>
                )}
              </>
            )}
          </Paper>
        </Grid>

        {/* RIGHT SIDE - Items Table */}
        <Grid item xs={12} md={12} sm={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Items ({vendorItems.length})
            </Typography>

            {isLoading ? (
              <Typography>Loading...</Typography>
            ) : (
              <>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="center">Qty</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Shipping</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {vendorItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="right">{item.price}</TableCell>
                        <TableCell align="right">{item.shipping}</TableCell>
                        <TableCell align="right">{item.subtotal}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Divider sx={{ my: 3 }} />

                {/* Totals */}
                <Box sx={{ maxWidth: 400, ml: 'auto' }}>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell><strong>Subtotal</strong></TableCell>
                        <TableCell align="right">{subTotal}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Shipping</TableCell>
                        <TableCell align="right">{shipping}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Total</strong></TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold">
                            {total}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
