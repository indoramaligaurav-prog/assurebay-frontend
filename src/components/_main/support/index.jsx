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

import PropTypes from 'prop-types';
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

export default function SupportInbox({ onSelectTicket, inDrawer = false }) {
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
     <Stack spacing={2} sx={{ mb: 2.5 }}>
  <Box>
    <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#292f35' }}>
      Support inbox
    </Typography>

    <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
      Track your requests and get help from our team.
    </Typography>
  </Box>

  <Button
    fullWidth={inDrawer}
    variant="contained"
    startIcon={<FiPlus />}
    onClick={() => setDialogOpen(true)}
    sx={{
      minHeight: 42,
      alignSelf: inDrawer ? 'stretch' : 'flex-start',
      px: 2,
      borderRadius: '10px',
      bgcolor: '#c74735',
      color: '#fff',
      fontSize: 13,
      fontWeight: 600,
      textTransform: 'none',
      whiteSpace: 'nowrap',
      boxShadow: 'none',
      '&:hover': {
        bgcolor: '#ad3929',
        boxShadow: 'none',
      },
    }}
  >
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
  onClick={() => {
    if (onSelectTicket) {
      onSelectTicket(t._id);
    } else {
      router.push(`/support/${t._id}`);
    }
  }}
  sx={{
    py: 1.5,
    px: inDrawer ? 1 : 2,
    alignItems: 'flex-start',
    '&:hover': {
      bgcolor: '#fff7f2',
    },
  }}
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

  if (onSelectTicket) {
    onSelectTicket(ticket._id);
  } else {
    router.push(`/support/${ticket._id}`);
  }
}}
      />
    </Box>
  );
}

SupportInbox.propTypes = {
  onSelectTicket: PropTypes.func,
  inDrawer: PropTypes.bool,
};