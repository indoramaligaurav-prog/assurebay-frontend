'use client';
import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Typography, Chip, TextField, Alert } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from 'src/services';

const SLOT_TIMES = Array.from({ length: 14 }, (_, i) => {
  const m = 10 * 60 + i * 30;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
});

RequestCallDialog.propTypes = { open: PropTypes.bool, onClose: PropTypes.func, ticketId: PropTypes.string };

export default function RequestCallDialog({ open, onClose, ticketId }) {
  const queryClient = useQueryClient();
  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + i + 1);
        return d;
      }),
    []
  );
  const [dayIdx, setDayIdx] = useState(0);
  const [time, setTime] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');

  const { mutate, isPending, error } = useMutation({
    mutationFn: (payload) => api.vendorCreateCallRequest({ id: ticketId, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-call-request', ticketId] });
      onClose();
    }
  });

  const submit = () => {
    const [h, m] = time.split(':').map(Number);
    const start = new Date(days[dayIdx]);
    start.setHours(h, m, 0, 0);
    mutate({ slotStart: start.toISOString(), vendorPhone: phone, note });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Request a call with Wreeo support</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error?.response?.data?.message || 'Could not request call.'}</Alert>}

          <Typography variant="subtitle2">Pick a day</Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {days.map((d, i) => (
              <Chip
                key={i}
                label={d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                color={dayIdx === i ? 'primary' : 'default'}
                variant={dayIdx === i ? 'filled' : 'outlined'}
                onClick={() => setDayIdx(i)}
              />
            ))}
          </Stack>

          <Typography variant="subtitle2">Pick a time</Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {SLOT_TIMES.map((t) => (
              <Chip
                key={t}
                label={t}
                color={time === t ? 'primary' : 'default'}
                variant={time === t ? 'filled' : 'outlined'}
                onClick={() => setTime(t)}
              />
            ))}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Times are in your timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone}).
          </Typography>

          <TextField size="small" label="Phone number to call" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <TextField
            size="small"
            label="What would you like to discuss? (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            multiline
            rows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={!time || !phone.trim() || isPending}>
          Request call
        </Button>
      </DialogActions>
    </Dialog>
  );
}