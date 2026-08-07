// src/components/_vendor/support/floating-widget.jsx
'use client';
import React, { useState } from 'react';
// mui
import {
  Fab,
  Paper,
  Box,
  Stack,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Chip,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Divider,
  Zoom
} from '@mui/material';
// icons
import { FiMessageCircle, FiX, FiArrowLeft, FiPlus, FiSend } from 'react-icons/fi';
// api
import * as api from 'src/services';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// constants
import {
  SUPPORT_STATUS_TABS,
  SUPPORT_STATUS_LABELS,
  SUPPORT_STATUS_CHIP_COLOR,
  SUPPORT_CATEGORY_OPTIONS,
  SUPPORT_CATEGORY_LABELS
} from 'src/constants/support';

export default function FloatingSupportWidget() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('list'); // 'list' | 'new' | 'thread'
  const [activeTicketId, setActiveTicketId] = useState(null);

  const toggle = () => setOpen((prev) => !prev);
  const close = () => setOpen(false);

  const goToThread = (id) => {
    setActiveTicketId(id);
    setView('thread');
  };

  return (
    <>
      <Zoom in={open}>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 96,
            right: 24,
            width: 380,
            maxHeight: 560,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
            zIndex: 1300
          }}
        >
          <Header
            view={view}
            onBack={() => setView('list')}
            onClose={close}
          />
          <Box sx={{ flex: 1, overflowY: 'auto', p: view === 'thread' ? 0 : 2 }}>
            {view === 'list' && <ListView onNew={() => setView('new')} onOpenTicket={goToThread} />}
            {view === 'new' && <NewView onCreated={goToThread} />}
            {view === 'thread' && activeTicketId && <ThreadView ticketId={activeTicketId} />}
          </Box>
        </Paper>
      </Zoom>

      <Fab
        color="primary"
        onClick={toggle}
        sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1300 }}
        aria-label="Support"
      >
        {open ? <FiX size={22} /> : <FiMessageCircle size={22} />}
      </Fab>
    </>
  );
}

function Header({ view, onBack, onClose }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ px: 2, py: 1.5, bgcolor: 'primary.main', color: 'primary.contrastText' }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        {view !== 'list' && (
          <IconButton size="small" onClick={onBack} sx={{ color: 'inherit' }}>
            <FiArrowLeft size={18} />
          </IconButton>
        )}
        <Typography variant="subtitle1" fontWeight={600}>
          {view === 'new' ? 'Raise a query' : view === 'thread' ? 'Ticket' : 'Support'}
        </Typography>
      </Stack>
      <IconButton size="small" onClick={onClose} sx={{ color: 'inherit' }}>
        <FiX size={18} />
      </IconButton>
    </Stack>
  );
}

function ListView({ onNew, onOpenTicket }) {
  const [status, setStatus] = useState('');
  const { data, isPending } = useQuery({
    queryKey: ['vendor-support-tickets', status],
    queryFn: () => api.vendorGetMySupportTickets(status ? { status } : {})
  });
  const tickets = data?.tickets || [];

  return (
    <Box>
      <Tabs
        value={status}
        onChange={(e, val) => setStatus(val)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ minHeight: 32, mb: 1.5 }}
      >
        {SUPPORT_STATUS_TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={tab.label} sx={{ minHeight: 32, py: 0.5 }} />
        ))}
      </Tabs>

      {isPending ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={22} />
        </Box>
      ) : tickets.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            No queries yet
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1} sx={{ mb: 2 }}>
          {tickets.map((t) => (
            <Paper
              key={t._id}
              variant="outlined"
              sx={{ p: 1.25, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
              onClick={() => onOpenTicket(t._id)}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {t.subject}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t.ticketNo} · {SUPPORT_CATEGORY_LABELS[t.category] || t.category}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={SUPPORT_STATUS_LABELS[t.status]}
                  color={SUPPORT_STATUS_CHIP_COLOR[t.status]}
                  variant="outlined"
                />
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      <Button fullWidth variant="contained" startIcon={<FiPlus />} onClick={onNew}>
        Raise a query
      </Button>
    </Box>
  );
}

function NewView({ onCreated }) {
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('payout_issue');
  const [message, setMessage] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: api.vendorRaiseSupportTicket,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-support-tickets'] });
      setSubject('');
      setMessage('');
      onCreated(data.ticket._id);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    mutate({ subject, category, message });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField select size="small" label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
          {SUPPORT_CATEGORY_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          inputProps={{ maxLength: 150 }}
          required
        />
        <TextField
          size="small"
          label="Details"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          multiline
          rows={4}
          required
        />
        <Button type="submit" variant="contained" disabled={isPending}>
          {isPending ? 'Submitting…' : 'Submit query'}
        </Button>
      </Stack>
    </form>
  );
}

function ThreadView({ ticketId }) {
  const queryClient = useQueryClient();
  const [reply, setReply] = useState('');

  const { data, isPending } = useQuery({
    queryKey: ['vendor-support-ticket', ticketId],
    queryFn: () => api.vendorGetSupportTicketById(ticketId)
  });

  const { mutate: sendReply, isPending: sending } = useMutation({
    mutationFn: (payload) => api.vendorReplySupportTicket({ id: ticketId, payload }),
    onSuccess: () => {
      setReply('');
      queryClient.invalidateQueries({ queryKey: ['vendor-support-ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-support-tickets'] });
    }
  });

  if (isPending) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={22} />
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 2, pt: 1.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 220 }}>
            {ticket.subject}
          </Typography>
          <Chip
            size="small"
            label={SUPPORT_STATUS_LABELS[ticket.status]}
            color={SUPPORT_STATUS_CHIP_COLOR[ticket.status]}
            variant="outlined"
          />
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {ticket.ticketNo}
        </Typography>
      </Box>

      <Divider sx={{ my: 1.5 }} />

      <Stack spacing={1.25} sx={{ flex: 1, overflowY: 'auto', px: 2, pb: 1 }}>
        {messages.map((m, i) => {
          const mine = m.sender.role === 'vendor';
          return (
            <Box key={i} sx={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
              <Box
                sx={{
                  maxWidth: '80%',
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  bgcolor: mine ? 'primary.main' : 'action.hover',
                  color: mine ? 'primary.contrastText' : 'text.primary'
                }}
              >
                <Typography variant="body2">{m.message}</Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.25, opacity: 0.7 }}>
                  {mine ? 'You' : 'Support'} · {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Stack>

      <Box component="form" onSubmit={handleSend} sx={{ p: 1.5, borderTop: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            fullWidth
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder={closed ? 'This ticket is closed' : 'Type a reply…'}
            disabled={closed}
          />
          <IconButton type="submit" color="primary" disabled={sending || closed}>
            <FiSend />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
}