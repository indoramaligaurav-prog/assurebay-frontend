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
// constants
import { SUPPORT_STATUS_LABELS, SUPPORT_STATUS_CHIP_COLOR, SUPPORT_CATEGORY_LABELS } from 'src/constants/support';

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