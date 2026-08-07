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
  Typography,
  CircularProgress,
  Stack,
  TextField,
  MenuItem,
  Pagination,
  InputAdornment
} from '@mui/material';
// routing
import { useRouter } from 'next/navigation';
// icons
import { FiSearch } from 'react-icons/fi';
// api
import * as api from 'src/services';
import { useQuery } from '@tanstack/react-query';
// constants
import {
  SUPPORT_STATUS_TABS,
  SUPPORT_STATUS_LABELS,
  SUPPORT_STATUS_CHIP_COLOR,
  SUPPORT_CATEGORY_LABELS,
  SUPPORT_RAISED_BY_ROLE_LABELS
} from 'src/constants/support';

const ROLE_OPTIONS = [
  { value: '', label: 'All raisers' },
  { value: 'user', label: 'Customers' },
  { value: 'vendor', label: 'Vendors' }
];

export default function SupportInboxAdmin() {
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isPending: isLoading } = useQuery({
    queryKey: ['admin-support-tickets', status, role, search, page],
    queryFn: () =>
      api.adminGetAllSupportTickets({
        ...(status && { status }),
        ...(role && { role }),
        ...(search && { search }),
        page,
        limit: 20
      })
  });

  const tickets = data?.tickets || [];
  const pages = data?.pages || 1;

  const resetToFirstPage = (setter) => (val) => {
    setter(val);
    setPage(1);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Support
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Queries raised by customers and vendors.
        </Typography>
      </Box>

      <Card>
        <Tabs
          value={status}
          onChange={(e, val) => resetToFirstPage(setStatus)(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          {SUPPORT_STATUS_TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ p: 2 }}>
          <TextField
            size="small"
            placeholder="Search ticket no, subject, email"
            value={search}
            onChange={(e) => resetToFirstPage(setSearch)(e.target.value)}
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FiSearch size={16} />
                </InputAdornment>
              )
            }}
          />
          <TextField
            select
            size="small"
            value={role}
            onChange={(e) => resetToFirstPage(setRole)(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            {ROLE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        ) : tickets.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              No tickets found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try a different filter or search term.
            </Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ticket</TableCell>
                  <TableCell>Raised by</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Priority</TableCell>
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
                    onClick={() => router.push(`/admin/support/${t._id}`)}
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
                      <Typography variant="body2">{t.raisedBy?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {SUPPORT_RAISED_BY_ROLE_LABELS[t.raisedBy?.role] || t.raisedBy?.role} · {t.raisedBy?.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {SUPPORT_CATEGORY_LABELS[t.category] || t.category}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>
                      <Typography variant="body2" color="text.secondary">
                        {t.priority}
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
                        {new Date(t.lastMessageAt).toLocaleString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {pages > 1 && (
              <Stack direction="row" justifyContent="center" sx={{ py: 2.5 }}>
                <Pagination count={pages} page={page} onChange={(e, val) => setPage(val)} color="primary" />
              </Stack>
            )}
          </>
        )}
      </Card>
    </Box>
  );
}