
'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  List,
  ListItemButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';

import { useRouter } from 'next/navigation';
import { FiPlus } from 'react-icons/fi';

import * as api from 'src/services';
import { useQuery } from '@tanstack/react-query';

import RaiseQueryDialog from './raise-query-dialog';

import {
  SUPPORT_STATUS_LABELS,
  SUPPORT_CATEGORY_LABELS,
} from 'src/constants/support';

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'awaiting', label: 'Awaiting' },
];

const AWAITING_STATUSES = [
  'awaiting_reply',
  'awaiting_vendor_response',
  'awaiting_customer_decision',
];

const getStatusLabel = (status) => {
  if (AWAITING_STATUSES.includes(status)) return 'Awaiting';
  return SUPPORT_STATUS_LABELS[status] || status;
};

const getStatusStyles = (status) => {
  if (status === 'open') {
    return { bgcolor: '#eaf5ed', color: '#39764b' };
  }

  if (status === 'in_progress') {
    return { bgcolor: '#edf2f5', color: '#536773' };
  }

  if (AWAITING_STATUSES.includes(status)) {
    return { bgcolor: '#fff4df', color: '#95651e' };
  }

  if (status === 'escalated') {
    return { bgcolor: '#fdeceb', color: '#bd493d' };
  }

  if (status === 'resolved') {
    return { bgcolor: '#eaf5ed', color: '#39764b' };
  }

  return { bgcolor: '#f0f1f2', color: '#69737b' };
};

export default function SupportInbox({
  onSelectTicket,
  inDrawer = false,
}) {
  const router = useRouter();

  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch all tickets once so grouped status counts stay accurate.
  const { data, isPending: isLoading } = useQuery({
    queryKey: ['user-support-tickets'],
    queryFn: () => api.userGetMySupportTickets({}),
  });

  const tickets = data?.tickets || [];

  const counts = {
    all: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    in_progress: tickets.filter((t) => t.status === 'in_progress').length,
    awaiting: tickets.filter((t) =>
      AWAITING_STATUSES.includes(t.status)
    ).length,
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'awaiting') {
      return AWAITING_STATUSES.includes(ticket.status);
    }
    return ticket.status === statusFilter;
  });

  const handleSelectTicket = (ticketId) => {
    if (onSelectTicket) {
      onSelectTicket(ticketId);
    } else {
      router.push(`/support/${ticketId}`);
    }
  };

  const handleCreated = (ticket) => {
    setDialogOpen(false);

    if (ticket?._id) {
      handleSelectTicket(ticket._id);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) return '';

    return value.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    });
  };

  // Inline raise-query screen inside the drawer.
  if (dialogOpen) {
    return (
      <RaiseQueryDialog
        open={dialogOpen}
        inDrawer={inDrawer}
        onClose={() => setDialogOpen(false)}
        onCreated={handleCreated}
      />
    );
  }

  return (
    <Box sx={{ width: '100%' }}>

      {/* Raise query button */}
      <Stack
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        {/* <Button
          variant="contained"
          startIcon={<FiPlus />}
          onClick={() => setDialogOpen(true)}
          sx={{
            minHeight: 38,
            px: 1.8,
            borderRadius: '9px',
            bgcolor: '#c74735',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#ad3929',
              boxShadow: 'none',
            },
          }}
        >
          Raise a query
        </Button> */}
      </Stack>

      {/* Status filters */}
      <Tabs
        value={statusFilter}
        onChange={(event, value) => setStatusFilter(value)}
        variant="fullWidth"
        sx={{
          minHeight: 44,
          borderBottom: '1px solid #e9ebed',
          mb: 0,
          '& .MuiTabs-indicator': {
            height: 2,
            bgcolor: '#c74735',
          },
          '& .MuiTab-root': {
            minHeight: 44,
            minWidth: 0,
            px: 0.5,
            textTransform: 'none',
            fontSize: 11,
            fontWeight: 500,
            color: '#737d84',
          },
          '& .Mui-selected': {
            color: '#c74735 !important',
            fontWeight: 700,
          },
        }}
      >
        {STATUS_FILTERS.map((filter) => (
          <Tab
            key={filter.value}
            value={filter.value}
            label={
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.5}
              >
                <span>{filter.label}</span>
                <Typography
                  component="span"
                  sx={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: 'inherit',
                  }}
                >
                  {counts[filter.value]}
                </Typography>
              </Stack>
            }
          />
        ))}
      </Tabs>

      {/* Ticket list */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={26} />
        </Box>
      ) : filteredTickets.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 7, px: 2 }}>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 700,
              color: '#292f35',
            }}
          >
            No queries here
          </Typography>

          <Typography
            sx={{
              mt: 0.7,
              fontSize: 12,
              color: '#858d93',
            }}
          >
            {statusFilter === 'all'
              ? "You haven't raised any support queries yet."
              : 'No tickets found in this category.'}
          </Typography>
        </Box>
      ) : (
        <List disablePadding>
          {filteredTickets.map((ticket) => {
            const preview =
              ticket.lastMessagePreview ||
              ticket.subject ||
              'No messages yet';

            const isSupportReply =
              ticket.lastMessageByRole === 'admin';

            return (
              <ListItemButton
                key={ticket._id}
                onClick={() => handleSelectTicket(ticket._id)}
                sx={{
                  px: 0,
                  py: 2,
                  alignItems: 'flex-start',
                  borderBottom: '1px solid #e9ebed',
                  '&:hover': {
                    bgcolor: '#fafafa',
                  },
                }}
              >
                {/* Support avatar */}
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    mr: 1.5,
                    bgcolor: '#edf0f1',
                    color: '#596970',
                    fontSize: 11,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  WS
                </Avatar>

                {/* Ticket information */}
                <Box sx={{ flex: 1, minWidth: 0 }}>

                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Typography
                      noWrap
                      sx={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#292f35',
                      }}
                    >
                      Wreeo Support
                    </Typography>

                    <Chip
                      size="small"
                      label={getStatusLabel(ticket.status)}
                      sx={{
                        ...getStatusStyles(ticket.status),
                        height: 22,
                        borderRadius: '5px',
                        fontSize: 10,
                        fontWeight: 500,
                        flexShrink: 0,
                        '& .MuiChip-label': {
                          px: 0.8,
                        },
                      }}
                    />
                  </Stack>

                  <Typography
                    sx={{
                      mt: 0.7,
                      fontSize: 11.5,
                      color: '#69747b',
                      lineHeight: 1.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {ticket.subject}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: 11,
                      color: '#7d878e',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {isSupportReply
                      ? `Wreeo Support: ${preview}`
                      : preview}
                  </Typography>

                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.7}
                    sx={{ mt: 0.8 }}
                  >
                    <Typography
                      sx={{
                        fontSize: 10,
                        color: '#899198',
                      }}
                    >
                      {ticket.ticketNo}
                    </Typography>

                    {ticket.category && (
                      <>
                        <Typography sx={{ fontSize: 10, color: '#b0b5b9' }}>
                          ·
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 10,
                            color: '#899198',
                          }}
                        >
                          {SUPPORT_CATEGORY_LABELS[ticket.category] ||
                            ticket.category}
                        </Typography>
                      </>
                    )}

                    <Typography sx={{ fontSize: 10, color: '#b0b5b9' }}>
                      ·
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 10,
                        color: '#899198',
                      }}
                    >
                      {formatDate(ticket.lastMessageAt)}
                    </Typography>
                  </Stack>
                </Box>
              </ListItemButton>
            );
          })}
        </List>
      )}
    </Box>
  );
}

SupportInbox.propTypes = {
  onSelectTicket: PropTypes.func,
  inDrawer: PropTypes.bool,
};
