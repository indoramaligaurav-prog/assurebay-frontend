'use client';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
// mui
import { Box, Card, Chip, Typography, TextField, Button, Stack, CircularProgress, IconButton, Divider } from '@mui/material';
// routing
import { useRouter } from 'next/navigation';
// icons
import { FiArrowLeft, FiSend } from 'react-icons/fi';
// api
import * as api from 'src/services';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Alert, Radio, RadioGroup, FormControlLabel } from '@mui/material';
// constants
import { SUPPORT_STATUS_LABELS, SUPPORT_STATUS_CHIP_COLOR, SUPPORT_CATEGORY_LABELS } from 'src/constants/support';

import TicketProductHeader from '@/components/support/ticket-product-header';

SupportThread.propTypes = {
  ticketId: PropTypes.string,
  onBack: PropTypes.func,
  inDrawer: PropTypes.bool,
};

export default function SupportThread({
  ticketId,
  onBack,
  inDrawer = false,
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [reply, setReply] = useState('');

  const { data, isPending: isLoading } = useQuery({
    queryKey: ['user-support-ticket', ticketId],
    queryFn: () => api.userGetSupportTicketById(ticketId),
    enabled: Boolean(ticketId)
  });

  const { mutate: sendReply, isPending: sending } = useMutation({
    mutationFn: (payload) => api.userReplySupportTicket({ id: ticketId, payload }),
    onSuccess: () => {
      setReply('');
      queryClient.invalidateQueries({ queryKey: ['user-support-ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['user-support-tickets'] });
    }
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  const ticket = data?.ticket;
  const messages = data?.messages || [];
  if (!ticket) {
  return (
    <Box sx={{ py: 6, textAlign: 'center' }}>
      <Typography fontWeight={600}>
        Ticket not found
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 1, mb: 2 }}
      >
        This ticket may have been removed or is no longer available.
      </Typography>

      {onBack && (
        <Button variant="outlined" onClick={onBack}>
          Back to inbox
        </Button>
      )}
    </Box>
  );
}
  const closed = ticket.status === 'closed';

  const handleSend = (e) => {
    e.preventDefault();
    if (!reply.trim() || closed) return;
    sendReply({ message: reply });
  };

 return (
  <Box
    sx={{
      width: '100%',
      maxWidth: inDrawer ? 'none' : 720,
      mx: 'auto',
      py: inDrawer ? 0 : 4,
      px: inDrawer ? 0 : 2,
    }}
  >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <IconButton
  onClick={() => {
    if (onBack) {
      onBack();
    } else {
      router.push('/support');
    }
  }}
  size="small"
  aria-label="Back to support inbox"
  sx={{
    color: '#6c747b',
    bgcolor: '#f6f7f8',
    '&:hover': {
      bgcolor: '#eceeef',
    },
  }}
>
  <FiArrowLeft />
</IconButton>
        <Typography variant="body2" color="text.secondary">
          Back to tickets
        </Typography>
      </Stack>

      <Card
  sx={{
    p: inDrawer ? 1.5 : 3,
    borderRadius: '12px',
    boxShadow: inDrawer ? 'none' : undefined,
    border: inDrawer ? '1px solid #eeeeee' : 'none',
  }}
>
        <TicketProductHeader product={ticket.context?.product} orderNo={ticket.context?.orderNo} />
        {ticket.category === 'order_issue' && ticket.vendorDecision?.decision && ticket.currentHandler === 'customer' && (
            <VendorDecisionResponse ticket={ticket} ticketId={ticketId} />
          )}
          {ticket.category === 'order_issue' && ticket.vendorDecision?.decision && ticket.currentHandler === 'admin' && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Your appeal has been sent to Wreeo customer support. They will reply here.
            </Alert>
          )}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {ticket.subject}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {ticket.ticketNo} · {SUPPORT_CATEGORY_LABELS[ticket.category] || ticket.category}
            </Typography>
          </Box>
          <Chip
            size="small"
            label={SUPPORT_STATUS_LABELS[ticket.status]}
            color={SUPPORT_STATUS_CHIP_COLOR[ticket.status]}
            variant="outlined"
          />
        </Stack>

        {ticket.evidence?.length > 0 && (
          <>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Your evidence ({ticket.evidence.length} photo{ticket.evidence.length === 1 ? '' : 's'})
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1} sx={{ mb: 2 }}>
              {ticket.evidence.map((ev, i) => (
                <Box
                  key={i}
                  component="a"
                  href={`${process.env.NEXT_PUBLIC_API_URL}${ev.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'block'
                  }}
                >
                  <Box
                    component="img"
                    src={`${process.env.NEXT_PUBLIC_API_URL}${ev.url}`}
                    alt="Evidence"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
              ))}
            </Stack>
          </>
        )}

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={1.5} sx={{ maxHeight: 420, overflowY: 'auto', mb: 2, px: 0.5 }}>
          {messages.map((m, i) => {
            const mine = m.sender.role === 'user';
            return (
              <Box key={i} sx={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                <Box
                  sx={{
                    maxWidth: '75%',
                    px: 1.75,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: mine ? 'primary.main' : 'action.hover',
                    color: mine ? 'primary.contrastText' : 'text.primary'
                  }}
                >
                  <Typography variant="body2">{m.message}</Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.75 }}>
                    {mine ? 'You' : 'Support'} · {new Date(m.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <form onSubmit={handleSend}>
          <Stack direction="row" spacing={1.5} alignItems="flex-end">
            <TextField
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={closed ? 'This ticket is closed' : 'Type a reply…'}
              disabled={closed}
              fullWidth
              multiline
              maxRows={4}
              size="small"
            />
            <Button type="submit" variant="contained" endIcon={<FiSend />} disabled={sending || closed}>
              Send
            </Button>
          </Stack>
        </form>
      </Card>
    </Box>
  );
}

function VendorDecisionResponse({ ticket, ticketId }) {
  const queryClient = useQueryClient();
  const [dismissed, setDismissed] = useState(false);

  const { mutate: appeal, isPending, error } = useMutation({
    mutationFn: () => api.userRespondToVendorDecision({ id: ticketId, accepted: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-support-ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['user-support-tickets'] });
    }
  });

  const DECISION_LABELS = {
    return_refund: 'a return & refund',
    refund_only: 'a refund (no return required)',
    replacement: 'a replacement',
    repair: 'a repair',
    declined: 'to decline your claim'
  };

  if (dismissed) return null;

  return (
    <Card sx={{ p: 2.5, mb: 2, bgcolor: 'background.neutral' }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
        Seller's response
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        The seller decided to offer {DECISION_LABELS[ticket.vendorDecision?.decision] || 'a decision'}.
      </Typography>
      {ticket.vendorDecision?.note && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontStyle: 'italic' }}>
          "{ticket.vendorDecision.note}"
        </Typography>
      )}
      <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5 }}>
        Not satisfied with the seller's decision? Want to appeal to Wreeo customer support?
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {error?.response?.data?.message || 'Could not submit your appeal.'}
        </Alert>
      )}
      <Stack direction="row" spacing={1.5}>
        <Button variant="contained" disabled={isPending} onClick={() => appeal()}>
          Yes, appeal
        </Button>
        <Button variant="outlined" color="inherit" disabled={isPending} onClick={() => setDismissed(true)}>
          Dismiss
        </Button>
      </Stack>
    </Card>
  );
}