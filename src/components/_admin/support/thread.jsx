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
  Checkbox
} from '@mui/material';
// routing
import { useRouter } from 'next/navigation';
// redux
import { useSelector } from 'react-redux';
// icons
import { FiArrowLeft, FiSend } from 'react-icons/fi';
// api
import * as api from 'src/services';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// constants
import {
  SUPPORT_STATUS_TABS,
  SUPPORT_STATUS_LABELS,
  SUPPORT_STATUS_CHIP_COLOR,
  SUPPORT_CATEGORY_LABELS,
  SUPPORT_RAISED_BY_ROLE_LABELS
} from 'src/constants/support';

SupportThreadAdmin.propTypes = { ticketId: PropTypes.string };

// status options for the dropdown, excluding the "All" entry from the tabs list
const STATUS_OPTIONS = SUPPORT_STATUS_TABS.filter((s) => s.value);

export default function SupportThreadAdmin({ ticketId }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.user.user);
  const [reply, setReply] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);

  const { data, isPending: isLoading } = useQuery({
    queryKey: ['admin-support-ticket', ticketId],
    queryFn: () => api.adminGetSupportTicketById(ticketId),
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
  const assignedToMe = ticket.assignedTo === user?._id;

  const handleSend = (e) => {
    e.preventDefault();
    if (!reply.trim() || closed) return;
    sendReply({ message: reply, isInternalNote });
  };

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
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 1 }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {ticket.subject}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {ticket.ticketNo} · {SUPPORT_CATEGORY_LABELS[ticket.category] || ticket.category} · raised by{' '}
              {ticket.raisedBy?.name} ({SUPPORT_RAISED_BY_ROLE_LABELS[ticket.raisedBy?.role]}, {ticket.raisedBy?.email})
            </Typography>
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
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={isInternalNote}
                  onChange={(e) => setIsInternalNote(e.target.checked)}
                  disabled={closed}
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