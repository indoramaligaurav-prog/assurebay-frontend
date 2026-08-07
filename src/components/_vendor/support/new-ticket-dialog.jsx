'use client';
import React, { useState } from 'react';
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
  Alert
} from '@mui/material';
// api
import * as api from 'src/services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
// constants
import { SUPPORT_CATEGORY_OPTIONS } from 'src/constants/support';

NewTicketDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onCreated: PropTypes.func
};

export default function NewTicketDialog({ open, onClose, onCreated }) {
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('payout_issue');
  const [message, setMessage] = useState('');

  const { mutate, isPending, error } = useMutation({
    mutationFn: api.vendorRaiseSupportTicket,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-support-tickets'] });
      setSubject('');
      setMessage('');
      onCreated?.(data.ticket);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    mutate({ subject, category, message });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>Raise a query</DialogTitle>
        <DialogContent>
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
              placeholder="Tell us what happened — include order or payout reference if relevant"
              multiline
              rows={5}
              fullWidth
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? 'Submitting…' : 'Submit query'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}