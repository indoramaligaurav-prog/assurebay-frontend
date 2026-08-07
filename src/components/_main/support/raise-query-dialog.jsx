'use client';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// mui
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Stack,
  Alert,
  Typography,
  Card,
  CardActionArea,
  Chip,
  CircularProgress,
  Box
} from '@mui/material';
// api
import * as api from 'src/services';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// constants
import { SUPPORT_CATEGORY_OPTIONS } from 'src/constants/support';

RaiseQueryDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onCreated: PropTypes.func,
  contextLabel: PropTypes.string, // shown above the form, e.g. "Order #J627911"
  relatedOrder: PropTypes.string,
  relatedOrderItem: PropTypes.string, // presence of this switches to the dynamic order-issue flow
  relatedProduct: PropTypes.string
};

export default function RaiseQueryDialog({
  open,
  onClose,
  onCreated,
  contextLabel,
  relatedOrder,
  relatedOrderItem,
  relatedProduct
}) {
  const isOrderIssue = Boolean(relatedOrderItem);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {isOrderIssue ? (
        <OrderIssueForm
          open={open}
          onClose={onClose}
          onCreated={onCreated}
          contextLabel={contextLabel}
          relatedOrder={relatedOrder}
          relatedOrderItem={relatedOrderItem}
          relatedProduct={relatedProduct}
        />
      ) : (
        <GeneralQueryForm open={open} onClose={onClose} onCreated={onCreated} />
      )}
    </Dialog>
  );
}

// ────────────────────────────────────────────────────────────────
// Order-issue flow — reasons come live from the eligibility endpoint,
// annotated with this specific product's actual return policy.
// ────────────────────────────────────────────────────────────────
function OrderIssueForm({ open, onClose, onCreated, contextLabel, relatedOrder, relatedOrderItem, relatedProduct }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState('reason'); // 'reason' | 'details'
  const [issueReason, setIssueReason] = useState(null);
  const [subReason, setSubReason] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const { data, isPending: loadingEligibility } = useQuery({
    queryKey: ['issue-eligibility', relatedOrderItem],
    queryFn: () => api.userGetIssueEligibility(relatedOrderItem),
    enabled: open && Boolean(relatedOrderItem)
  });

  useEffect(() => {
    if (open) {
      setStep('reason');
      setIssueReason(null);
      setSubReason('');
      setSubject('');
      setMessage('');
    }
  }, [open]);

  const { mutate, isPending: submitting, error } = useMutation({
    mutationFn: api.userRaiseSupportTicket,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-support-tickets'] });
      onCreated?.(data.ticket);
    }
  });

  const selectReason = (reason) => {
    setIssueReason(reason);
    setSubReason('');
    setSubject(reason.label);
    setStep('details');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim() || !issueReason) return;
    mutate({
      subject,
      category: 'order_issue',
      issueReason: issueReason.code,
      subReason: subReason || undefined,
      message,
      relatedOrder,
      relatedOrderItem,
      relatedProduct
    });
  };

  return (
    <>
      <DialogTitle>{step === 'reason' ? "What's the issue?" : issueReason?.label}</DialogTitle>
      <DialogContent>
        {contextLabel && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            About: <strong>{contextLabel}</strong>
          </Typography>
        )}

        {loadingEligibility ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={26} />
          </Box>
        ) : step === 'reason' ? (
          <Stack spacing={1.5}>
            {!data?.withinAdvisoryWindow && (
              <Alert severity="warning" variant="outlined">
                It's been {data?.daysSinceOrder} days since this order — reports are normally reviewed within{' '}
                {data?.advisoryWindowDays} days, but you can still submit and we'll take a look.
              </Alert>
            )}

            {data?.reasons?.map((reason) => (
              <Card key={reason.code} variant="outlined">
                <CardActionArea onClick={() => selectReason(reason)} sx={{ p: 1.5 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {reason.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: reason.policy ? 1 : 0 }}>
                    {reason.description}
                  </Typography>
                  {reason.policy && (
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" rowGap={0.5}>
                      <Chip
                        size="small"
                        variant="outlined"
                        color={reason.policy.returnsAccepted ? 'success' : 'default'}
                        label={reason.policy.returnsAccepted ? 'Returns accepted' : 'No standard returns'}
                      />
                      {reason.policy.returnsAccepted && reason.policy.allowedWithinDays && (
                        <Chip size="small" variant="outlined" label={`Within ${reason.policy.allowedWithinDays} days`} />
                      )}
                      {reason.policy.returnsAccepted && reason.policy.shippingPaidBy && (
                        <Chip size="small" variant="outlined" label={`${reason.policy.shippingPaidBy} pays shipping`} />
                      )}
                    </Stack>
                  )}
                </CardActionArea>
              </Card>
            ))}
          </Stack>
        ) : (
          <form id="order-issue-form" onSubmit={handleSubmit}>
            <Stack spacing={2.5} sx={{ mt: 0.5 }}>
              {error && (
                <Alert severity="error">{error?.response?.data?.message || 'Could not submit your query.'}</Alert>
              )}

              {issueReason?.subreasons?.length > 0 && (
                <TextField
                  select
                  label="More specifically"
                  value={subReason}
                  onChange={(e) => setSubReason(e.target.value)}
                  fullWidth
                >
                  {issueReason.subreasons.map((s) => (
                    <MenuItem key={s.code} value={s.code}>
                      {s.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}

              <TextField
                label="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                inputProps={{ maxLength: 150 }}
                fullWidth
                required
              />

              <TextField
                label="Tell us what happened"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                multiline
                rows={5}
                fullWidth
                required
              />
            </Stack>
          </form>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        {step === 'details' && (
          <Button onClick={() => setStep('reason')} color="inherit">
            Back
          </Button>
        )}
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        {step === 'details' && (
          <Button type="submit" form="order-issue-form" variant="contained" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit query'}
          </Button>
        )}
      </DialogActions>
    </>
  );
}

// ────────────────────────────────────────────────────────────────
// General flow — unchanged fixed category list, used when there's no
// specific order item (payment/payout/account/technical/other).
// ────────────────────────────────────────────────────────────────
function GeneralQueryForm({ open, onClose, onCreated }) {
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('other');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (open) {
      setSubject('');
      setCategory('other');
      setMessage('');
    }
  }, [open]);

  const { mutate, isPending, error } = useMutation({
    mutationFn: api.userRaiseSupportTicket,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-support-tickets'] });
      onCreated?.(data.ticket);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    mutate({ subject, category, message });
  };

  return (
    <>
      <DialogTitle>Raise a query</DialogTitle>
      <DialogContent>
        <form id="general-query-form" onSubmit={handleSubmit}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error?.response?.data?.message || 'Could not submit your query.'}</Alert>}

            <TextField select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} fullWidth>
              {SUPPORT_CATEGORY_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              inputProps={{ maxLength: 150 }}
              placeholder="Short summary of your issue"
              fullWidth
              required
            />

            <TextField
              label="Details"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what happened"
              multiline
              rows={5}
              fullWidth
              required
            />
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button type="submit" form="general-query-form" variant="contained" disabled={isPending}>
          {isPending ? 'Submitting…' : 'Submit query'}
        </Button>
      </DialogActions>
    </>
  );
}