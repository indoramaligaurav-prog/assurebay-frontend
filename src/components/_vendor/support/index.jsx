'use client';
import React, { useState } from 'react';
// mui
import {
  Box,
  Card,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
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
import NewTicketDialog from './new-ticket-dialog';
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
    queryKey: ['vendor-support-tickets', status],
    queryFn: () => api.vendorGetMySupportTickets(status ? { status } : {})
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
            Raise a query with the marketplace team, or track an existing one.
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
              Raise one and the marketplace team will follow up.
            </Typography>
            <Button variant="outlined" startIcon={<FiPlus />} onClick={() => setDialogOpen(true)}>
              Raise a query
            </Button>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ticket</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last update</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.map((t) => (
                <TableRow
                  key={t._id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => router.push(`/vendor/support/${t._id}`)}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {t.subject}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t.ticketNo}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {SUPPORT_CATEGORY_LABELS[t.category] || t.category}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={SUPPORT_STATUS_LABELS[t.status]}
                      color={SUPPORT_STATUS_CHIP_COLOR[t.status]}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(t.lastMessageAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <NewTicketDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={(ticket) => {
          setDialogOpen(false);
          router.push(`/vendor/support/${ticket._id}`);
        }}
      />
    </Box>
  );
}