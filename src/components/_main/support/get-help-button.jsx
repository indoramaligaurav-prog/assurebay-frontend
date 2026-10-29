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

import * as api from 'src/services';

GetHelpButton.propTypes = {
  orderId: PropTypes.string.isRequired,
  orderNo: PropTypes.string,
  orderItemId: PropTypes.string,
  productName: PropTypes.string,
  productId: PropTypes.string
};

export default function GetHelpButton({ orderId, orderNo, orderItemId, productName, productId , itemStatus}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(false);

  const [checking, setChecking] = useState(false);

  const handleClick = async () => {
  if (!orderItemId) {
    setOpen(true);
    return;
  }
  setChecking(true);
  try {
    const res = await api.userGetOpenTicketForItem(orderItemId);
    if (res?.ticket?._id) {
      router.push(`/support/${res.ticket._id}`);
      return;
    }
    setOpen(true);
  } catch (err) {
    setOpen(true); // if the check fails, still show the dialog; the server guard blocks duplicates
  } finally {
    setChecking(false);
  }
};

  return (
    <>
      <Button
        size="small"
        variant="text"
        startIcon={<FiHelpCircle size={14} />}
        onClick={handleClick}
        disabled={checking}
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
        itemStatus={itemStatus}
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