'use client';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
// mui
import { Box, Card, Chip, Typography, TextField, Button, Stack, CircularProgress, IconButton, Divider, Alert, MenuItem } from '@mui/material';
// routing
import { useRouter } from 'next/navigation';
// icons
import { FiArrowLeft, FiSend } from 'react-icons/fi';
// api
import * as api from 'src/services';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// constants
import {
  SUPPORT_STATUS_LABELS,
  SUPPORT_STATUS_CHIP_COLOR,
  SUPPORT_CATEGORY_LABELS,
  ISSUE_DECISION_OPTIONS
} from 'src/constants/support';

SupportThread.propTypes = { ticketId: PropTypes.string };

export default function SupportThread({ ticketId }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [reply, setReply] = useState('');

  const { data, isPending: isLoading } = useQuery({
    queryKey: ['vendor-support-ticket', ticketId],
    queryFn: () => api.vendorGetSupportTicketById(ticketId),
    enabled: Boolean(ticketId)
  });

  const { mutate: sendReply, isPending: sending } = useMutation({
    mutationFn: (payload) => api.vendorReplySupportTicket({ id: ticketId, payload }),
    onSuccess: () => {
      setReply('');
      queryClient.invalidateQueries({ queryKey: ['vendor-support-ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-support-tickets'] });
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
  if (!ticket) return null;

  const closed = ticket.status === 'closed';

  const handleSend = (e) => {
    e.preventDefault();
    if (!reply.trim() || closed) return;
    sendReply({ message: reply });
  };

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <IconButton onClick={() => router.push('/vendor/support')} size="small">
          <FiArrowLeft />
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          Back to tickets
        </Typography>
      </Stack>

      <Card sx={{ p: 3 }}>
        {ticket.vendor && ticket.category === 'order_issue' && (
          <VendorDecisionPanel ticket={ticket} ticketId={ticketId} />
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

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={1.5} sx={{ maxHeight: 420, overflowY: 'auto', mb: 2, px: 0.5 }}>
          {messages.map((m, i) => {
            const mine = m.sender.role === 'vendor';
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
                  <Typography
                    variant="caption"
                    sx={{ display: 'block', mt: 0.5, opacity: 0.7 }}
                  >
                    {mine ? 'You' : 'Marketplace support'} · {new Date(m.createdAt).toLocaleString()}
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

function VendorDecisionPanel({ ticket, ticketId }) {
  const queryClient = useQueryClient();
  const [decision, setDecision] = useState('');
  const [note, setNote] = useState('');

  const { data: context } = useQuery({
    queryKey: ['vendor-issue-context', ticketId],
    queryFn: () => api.vendorGetIssueContext(ticketId),
    enabled: ticket.currentHandler === 'vendor' && Boolean(ticket.relatedOrderItem)
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => api.vendorDecideTicket({ id: ticketId, decision, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-support-ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-customer-issues'] });
    }
  });

  const reasonInfo = context?.reasons?.find((r) => r.code === ticket.issueReason);

  return (
    <Card sx={{ p: 2.5, mb: 2, bgcolor: 'background.neutral' }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
        Issue reported
      </Typography>
      {context?.productCondition && (
        <Chip size="small" label={`Condition: ${context.productCondition.name}`} sx={{ mb: 1 }} />
      )}
      {reasonInfo && (
        <>
          <Typography variant="body2" fontWeight={600}>{reasonInfo.label}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {reasonInfo.description}
          </Typography>
          {reasonInfo.policy && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Returns: {reasonInfo.policy.returnsAccepted ? `Accepted within ${reasonInfo.policy.allowedWithinDays || '—'} days` : 'Not standard for this listing'}
            </Typography>
          )}
        </>
      )}

      {ticket.currentHandler === 'vendor' ? (
        <Stack spacing={1.5} sx={{ mt: 1.5 }}>
          {error && <Alert severity="error">{error?.response?.data?.message || 'Could not submit decision.'}</Alert>}
          <TextField  select size="small" label="Your decision" value={decision} onChange={(e) => setDecision(e.target.value)}>
            {ISSUE_DECISION_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField >
          <TextField  size="small" label="Note to customer" value={note} onChange={(e) => setNote(e.target.value)} multiline rows={2} />
          <Button variant="contained" disabled={!decision || isPending} onClick={() => mutate()}>
            {isPending ? 'Submitting…' : 'Submit decision'}
          </Button>
        </Stack>
      ) : (
        <Alert severity="info" sx={{ mt: 1.5 }}>
          {ticket.currentHandler === 'customer' && 'Waiting for the customer to respond to your decision.'}
          {ticket.currentHandler === 'admin' && 'This ticket has been escalated to Assuredbay support.'}
        </Alert>
      )}
    </Card>
  );
}