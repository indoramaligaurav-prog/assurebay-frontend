'use client';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
// mui
import { Button, Snackbar, Alert } from '@mui/material';
import { FiHelpCircle } from 'react-icons/fi';
// routing
import { useRouter } from 'next/navigation';
// components
import RaiseQueryDialog from './raise-query-dialog';

GetHelpButton.propTypes = {
  orderId: PropTypes.string.isRequired,
  orderNo: PropTypes.string,
  orderItemId: PropTypes.string,
  productName: PropTypes.string,
  productId: PropTypes.string
};

export default function GetHelpButton({ orderId, orderNo, orderItemId, productName, productId }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(false);

  return (
    <>
      <Button
        size="small"
        variant="text"
        startIcon={<FiHelpCircle size={14} />}
        onClick={() => setOpen(true)}
        sx={{ fontSize: 12, minWidth: 0 }}
      >
        Get help
      </Button>

      <RaiseQueryDialog
        open={open}
        onClose={() => setOpen(false)}
        contextLabel={orderNo ? `Order #${orderNo}${productName ? ' · ' + productName : ''}` : productName}
        relatedOrder={orderId}
        relatedOrderItem={orderItemId}
        relatedProduct={productId}
        onCreated={(ticket) => {
          setOpen(false);
          setToast(true);
          router.push(`/support/${ticket._id}`);
        }}
      />

      <Snackbar open={toast} autoHideDuration={3000} onClose={() => setToast(false)}>
        <Alert severity="success" onClose={() => setToast(false)}>
          Query submitted — taking you to the ticket.
        </Alert>
      </Snackbar>
    </>
  );
}