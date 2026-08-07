'use client';
import React, { useState } from 'react';
// mui
import {
  Box,
  Card,
  Tabs,
  Tab,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  Button,
  Typography,
  CircularProgress,
  Stack
} from '@mui/material';
// routing
import { useRouter } from 'next/navigation';
// icons
import { FiPlus } from 'react-icons/fi';
// api
import * as api from 'src/services';
import { useQuery } from '@tanstack/react-query';
// components
import RaiseQueryDialog from './raise-query-dialog';
// constants
import {
  SUPPORT_STATUS_TABS,
  SUPPORT_STATUS_LABELS,
  SUPPORT_STATUS_CHIP_COLOR,
  SUPPORT_CATEGORY_LABELS
} from 'src/constants/support';

export default function SupportInbox() {
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isPending: isLoading } = useQuery({
    queryKey: ['user-support-tickets', status],
    queryFn: () => api.userGetMySupportTickets(status ? { status } : {})
  });

  const tickets = data?.tickets || [];

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Support
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Raise a query with our team, or track one you've already sent.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<FiPlus />} onClick={() => setDialogOpen(true)}>
          Raise a query
        </Button>
      </Stack>

      <Card>
        <Tabs
          value={status}
          onChange={(e, val) => setStatus(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          {SUPPORT_STATUS_TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        ) : tickets.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              No queries here
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Raise one and we'll get back to you.
            </Typography>
            <Button variant="outlined" startIcon={<FiPlus />} onClick={() => setDialogOpen(true)}>
              Raise a query
            </Button>
          </Box>
        ) : (
          <List disablePadding>
            {tickets.map((t) => (
              <ListItemButton
                key={t._id}
                divider
                onClick={() => router.push(`/support/${t._id}`)}
                sx={{ py: 1.5 }}
              >
                <ListItemText
                  primary={t.subject}
                  secondary={`${t.ticketNo} · ${SUPPORT_CATEGORY_LABELS[t.category] || t.category} · ${new Date(
                    t.lastMessageAt
                  ).toLocaleDateString()}`}
                />
                <Chip
                  size="small"
                  label={SUPPORT_STATUS_LABELS[t.status]}
                  color={SUPPORT_STATUS_CHIP_COLOR[t.status]}
                  variant="outlined"
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Card>

      <RaiseQueryDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={(ticket) => {
          setDialogOpen(false);
          router.push(`/support/${ticket._id}`);
        }}
      />
    </Box>
  );
}