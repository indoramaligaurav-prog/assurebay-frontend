'use client';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
// mui
import {
  Box,
  Card,
  Chip,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  IconButton,
  Divider,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert, Tooltip
} from '@mui/material';
// routing
import { useRouter } from 'next/navigation';
// redux
import { useSelector } from 'react-redux';
// icons

// api
import * as api from 'src/services';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// constants
import {
  SUPPORT_STATUS_TABS,
  SUPPORT_STATUS_LABELS,
  SUPPORT_STATUS_CHIP_COLOR,
  SUPPORT_CATEGORY_LABELS,
  SUPPORT_RAISED_BY_ROLE_LABELS,
    DECISIONS_BY_CONDITION
} from 'src/constants/support';
import { ISSUE_REASON_LABELS, DECISION_OPTIONS, DECISION_LABELS } from 'src/constants/issue-taxonomy';

import TicketProductHeader from '@/components/support/ticket-product-header';

import { FiArrowLeft, FiSend, FiPhoneCall } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

SupportThreadAdmin.propTypes = { ticketId: PropTypes.string };

const STATUS_OPTIONS = SUPPORT_STATUS_TABS.filter((s) => s.value);

export default function SupportThreadAdmin({ ticketId }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.user.user);
  const [reply, setReply] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [decisionNote, setDecisionNote] = useState('');

  const { data, isPending: isLoading } = useQuery({
    queryKey: ['admin-support-ticket', ticketId],
    queryFn: () => api.adminGetSupportTicketById(ticketId),
    enabled: Boolean(ticketId)
  });

  const ticket = data?.ticket;

  // policy context — only fetched for order_issue tickets tied to an item
  const { data: eligibility } = useQuery({
    queryKey: ['admin-ticket-eligibility', ticketId],
    queryFn: () => api.adminGetTicketEligibility(ticketId),
    enabled: Boolean(ticket?.relatedOrderItem)
  });

  const { data: callData } = useQuery({
  queryKey: ['admin-call-request', ticketId],
  queryFn: () => api.adminGetCallRequest(ticketId),
  enabled: Boolean(ticketId)
});

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-support-ticket', ticketId] });
    queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
  };

  const { mutate: sendReply, isPending: sending } = useMutation({
    mutationFn: (payload) => api.adminReplySupportTicket({ id: ticketId, payload }),
    onSuccess: () => {
      setReply('');
      setIsInternalNote(false);
      invalidateAll();
    }
  });

  const { mutate: updateStatus, isPending: updatingStatus } = useMutation({
    mutationFn: (status) => api.adminUpdateSupportTicketStatus({ id: ticketId, status }),
    onSuccess: invalidateAll
  });

  const { mutate: assignToMe, isPending: assigning } = useMutation({
    mutationFn: () => api.adminAssignSupportTicket({ id: ticketId, adminId: user?._id }),
    onSuccess: invalidateAll
  });

  const { mutate: decide, isPending: deciding } = useMutation({
    mutationFn: (decision) => api.adminDecideSupportTicket({ id: ticketId, decision, note: decisionNote }),
    onSuccess: () => {
      setDecisionNote('');
      invalidateAll();
    }
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  const messages = data?.messages || [];
  if (!ticket) return null;

  const closed = ticket.status === 'closed';
  const assignedToMe = ticket.assignedTo === user?._id;
  const sellerPhase =
  ticket.category === 'order_issue' && ticket.currentHandler && ticket.currentHandler !== 'admin';
const replyLocked = closed || sellerPhase;
const canDecide = ticket.category === 'order_issue' && !ticket.resolution?.decision && !closed && !sellerPhase;

  const handleSend = (e) => {
    e.preventDefault();
    if (!reply.trim() || replyLocked) return;
    sendReply({ message: reply, isInternalNote });
  };

  const reasonPolicy = eligibility?.reasons?.find((r) => r.code === ticket.issueReason)?.policy;

  const conditionName = eligibility?.productCondition?.name || '';
const conditionKey = conditionName.trim().toUpperCase().replace(/[\s-]+/g, '_');
const allowed = DECISIONS_BY_CONDITION[conditionKey];
const decisionOptions = allowed
  ? DECISION_OPTIONS.filter((opt) => allowed.includes(opt.value))
  : DECISION_OPTIONS;

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <IconButton onClick={() => router.push('/admin/support')} size="small">
          <FiArrowLeft />
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          Back to tickets
        </Typography>
      </Stack>

      <Card sx={{ p: 3 }}>
        <TicketProductHeader product={ticket.context?.product} orderNo={ticket.context?.orderNo} />
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 1 }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {ticket.subject}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {ticket.ticketNo} · {SUPPORT_CATEGORY_LABELS[ticket.category] || ticket.category} · raised by{' '}
              {ticket.raisedBy?.name} ({SUPPORT_RAISED_BY_ROLE_LABELS[ticket.raisedBy?.role]}, {ticket.raisedBy?.email})
            </Typography>
            {ticket.issueReason && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Reason: {ISSUE_REASON_LABELS[ticket.issueReason] || ticket.issueReason}
                {ticket.subReason ? ` · ${ticket.subReason}` : ''}
              </Typography>
            )}
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2, flexWrap: 'wrap', rowGap: 1 }}>
          <TextField
            select
            size="small"
            label="Status"
            value={ticket.status}
            onChange={(e) => updateStatus(e.target.value)}
            disabled={updatingStatus}
            sx={{ minWidth: 180 }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>

          <Chip
            size="small"
            label={SUPPORT_STATUS_LABELS[ticket.status]}
            color={SUPPORT_STATUS_CHIP_COLOR[ticket.status]}
            variant="outlined"
          />

          <Box sx={{ flexGrow: 1 }} />

          {ticket.assignedTo ? (
            <Typography variant="caption" color="text.secondary">
              {assignedToMe ? 'Assigned to you' : 'Assigned'}
            </Typography>
          ) : (
            <Button size="small" variant="outlined" onClick={() => assignToMe()} disabled={assigning}>
              Assign to me
            </Button>
          )}
        </Stack>

        {sellerPhase && (
  <Alert severity="info" sx={{ mb: 2 }}>
    This ticket is still with the seller. You can reply or decide once the customer appeals to Wreeo support.
  </Alert>
)}

{callData?.callRequest && (
  <Box sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'warning.main', borderRadius: 1.5 }}>
    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
      Call requested by vendor
    </Typography>
    <Typography variant="body2">
      <strong>Slot:</strong> {new Date(callData.callRequest.slotStart).toLocaleString()} –{' '}
      {new Date(callData.callRequest.slotEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </Typography>
    <Stack direction="row" alignItems="center" spacing={0.5}>
  <Typography variant="body2">
    <strong>Vendor:</strong> {callData.callRequest.snapshot?.vendorName}
  </Typography>
  <Tooltip title="Call vendor (via IVR)">
    <IconButton size="small" color="primary" onClick={() => toast('IVR calling will be connected soon')}>
      <FiPhoneCall />
    </IconButton>
  </Tooltip>
</Stack>
    <Typography variant="body2">
      <strong>Order:</strong> #{callData.callRequest.snapshot?.orderNo} · {callData.callRequest.snapshot?.productName}
    </Typography>
    {callData.callRequest.note && (
      <Typography variant="body2">
        <strong>Note:</strong> {callData.callRequest.note}
      </Typography>
    )}
    <Chip size="small" label={callData.callRequest.status} sx={{ mt: 1 }} />
  </Box>
)}

        {/* ── Evidence gallery ──────────────────────────────────────── */}
        {ticket.evidence?.length > 0 && (
          <>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Evidence ({ticket.evidence.length} photo{ticket.evidence.length === 1 ? '' : 's'})
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
                    width: 84,
                    height: 84,
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

        {/* ── Decision panel — order_issue tickets only ─────────────── */}
        {ticket.category === 'order_issue' && (
          <>
            <Divider sx={{ mb: 2 }} />
            {ticket.resolution?.decision ? (
              <Alert
                severity={ticket.resolution.decision === 'declined' ? 'error' : 'success'}
                sx={{ mb: 2 }}
              >
                <strong>{DECISION_LABELS[ticket.resolution.decision]}</strong> by{' '}
                {new Date(ticket.resolution.decidedAt).toLocaleString()}
                {ticket.resolution.note ? ` — "${ticket.resolution.note}"` : ''}
                {ticket.resolution.policyAligned === false && (
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                    Note: this decision overrides the product's stated return policy.
                  </Typography>
                )}
              </Alert>
            ) : (
              canDecide && (
                <Box sx={{ mb: 2 }}>
                  {reasonPolicy && (
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" rowGap={0.5} sx={{ mb: 1.5 }}>
                      <Chip
                        size="small"
                        variant="outlined"
                        color={reasonPolicy.returnsAccepted ? 'success' : 'default'}
                        label={reasonPolicy.returnsAccepted ? 'Policy: returns accepted' : 'Policy: no standard returns'}
                      />
                      {reasonPolicy.allowedWithinDays && (
                        <Chip size="small" variant="outlined" label={`Within ${reasonPolicy.allowedWithinDays} days`} />
                      )}
                      {reasonPolicy.shippingPaidBy && (
                        <Chip size="small" variant="outlined" label={`${reasonPolicy.shippingPaidBy} pays shipping`} />
                      )}
                      {reasonPolicy.isInternational && <Chip size="small" variant="outlined" label="International" />}
                      {conditionName && <Chip size="small" variant="outlined" label={`Condition: ${conditionName}`} />}
                    </Stack>
                  )}
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Optional note shown to the buyer/vendor with the decision"
                    value={decisionNote}
                    onChange={(e) => setDecisionNote(e.target.value)}
                    sx={{ mb: 1.5 }}
                  />
                  <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
                    {decisionOptions.map((opt) => (
                      <Button
                        key={opt.value}
                        size="small"
                        variant="outlined"
                        color={opt.color}
                        disabled={deciding}
                        onClick={() => decide(opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </Stack>
                </Box>
              )
            )}
          </>
        )}

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={1.5} sx={{ maxHeight: 420, overflowY: 'auto', mb: 2, px: 0.5 }}>
          {messages.map((m, i) => {
            const mine = m.sender.role === 'admin';
            return (
              <Box key={i} sx={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                <Box
                  sx={{
                    maxWidth: '75%',
                    px: 1.75,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: m.isInternalNote ? 'warning.light' : mine ? 'primary.main' : 'action.hover',
                    color: m.isInternalNote ? 'warning.contrastText' : mine ? 'primary.contrastText' : 'text.primary'
                  }}
                >
                  {m.isInternalNote && (
                    <Typography variant="caption" fontWeight={700} sx={{ display: 'block', mb: 0.25 }}>
                      INTERNAL NOTE
                    </Typography>
                  )}
                  <Typography variant="body2">{m.message}</Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.75 }}>
                    {m.sender.name} · {new Date(m.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <form onSubmit={handleSend}>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1.5} alignItems="flex-end">
              <TextField
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder={closed ? 'This ticket is closed' : sellerPhase ? 'You can reply after the customer appeals' : 'Type a reply…'}
                disabled={replyLocked}
                fullWidth
                multiline
                maxRows={4}
                size="small"
              />
              <Button type="submit" variant="contained" endIcon={<FiSend />} disabled={sending || replyLocked}>
                Send
              </Button>
            </Stack>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={isInternalNote}
                  onChange={(e) => setIsInternalNote(e.target.checked)}
                  disabled={replyLocked}
                />
              }
              label={
                <Typography variant="caption" color="text.secondary">
                  Internal note (hidden from the customer/vendor)
                </Typography>
              }
            />
          </Stack>
        </form>
      </Card>
    </Box>
  );
}