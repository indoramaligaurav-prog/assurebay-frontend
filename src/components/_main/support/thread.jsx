
'use client';

import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiHeadphones, FiSend } from 'react-icons/fi';

import * as api from 'src/services';

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  SUPPORT_STATUS_LABELS,
  SUPPORT_CATEGORY_LABELS,
} from 'src/constants/support';

import CloseIcon from '@mui/icons-material/Close';

SupportThread.propTypes = {
  ticketId: PropTypes.string,
  onBack: PropTypes.func,
  onClose: PropTypes.func,
  inDrawer: PropTypes.bool,
};

const statusStyles = {
  open: { bgcolor: '#eaf5ed', color: '#39764b' },
  in_progress: { bgcolor: '#edf2f5', color: '#536773' },
  awaiting_reply: { bgcolor: '#fff4df', color: '#95651e' },
  awaiting_vendor_response: { bgcolor: '#fff4df', color: '#95651e' },
  awaiting_customer_decision: { bgcolor: '#fff4df', color: '#95651e' },
  escalated: { bgcolor: '#fdeceb', color: '#bd493d' },
  resolved: { bgcolor: '#eaf5ed', color: '#39764b' },
  closed: { bgcolor: '#f0f1f2', color: '#69737b' },
};

const formatTime = (date) => {
  if (!date) return '';

  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDateLabel = (date) => {
  if (!date) return '';

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return '';

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (value.toDateString() === today.toDateString()) return 'Today';
  if (value.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return value.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default function SupportThread({
  ticketId,
  onBack,
  onClose,
  inDrawer = false,
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [reply, setReply] = useState('');
  const messagesEndRef = useRef(null);

  const { data, isPending: isLoading } = useQuery({
    queryKey: ['user-support-ticket', ticketId],
    queryFn: () => api.userGetSupportTicketById(ticketId),
    enabled: Boolean(ticketId),
  });

  const { mutate: sendReply, isPending: sending } = useMutation({
    mutationFn: (payload) =>
      api.userReplySupportTicket({ id: ticketId, payload }),

    onSuccess: () => {
      setReply('');

      queryClient.invalidateQueries({
        queryKey: ['user-support-ticket', ticketId],
      });

      queryClient.invalidateQueries({
        queryKey: ['user-support-tickets'],
      });
    },
  });

  const ticket = data?.ticket;
  const messages = data?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages.length, isLoading]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/support');
    }
  };

  const handleSend = (e) => {
    e.preventDefault();

    if (!reply.trim() || ticket?.status === 'closed' || sending) return;

    sendReply({ message: reply.trim() });
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: 300,
        }}
      >
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!ticket) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography fontWeight={600}>Ticket not found</Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, mb: 2 }}
        >
          This ticket may have been removed or is no longer available.
        </Typography>

        <Button variant="outlined" onClick={handleBack}>
          Back to inbox
        </Button>
      </Box>
    );
  }

  const closed = ticket.status === 'closed';

  return (
    <Box
      sx={{
        width: '100%',
        height: inDrawer ? '100%' : 'auto',
        minHeight: inDrawer ? 0 : 500,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f5f7f7',
        overflow: 'hidden',
      }}
    >
      {/* Conversation header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: '#fff',
          borderBottom: '1px solid #e8ebed',
          flexShrink: 0,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconButton
            onClick={handleBack}
            size="small"
            aria-label="Back to tickets"
            sx={{
              color: '#65717a',
              width: 34,
              height: 34,
              flexShrink: 0,
            }}
          >
            <FiArrowLeft size={19} />
          </IconButton>

          <Avatar
            sx={{
              width: 42,
              height: 42,
              bgcolor: '#edf0f1',
              color: '#596970',
              fontWeight: 700,
              fontSize: 12,
              flexShrink: 0,
            }}
          >
            WS
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 700,
                color: '#292f35',
                lineHeight: 1.4,
              }}
            >
              Wreeo Support
            </Typography>

            <Stack
              direction="row"
              alignItems="center"
              spacing={0.6}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  color: '#7b858c',
                }}
              >
                {ticket.ticketNo}
              </Typography>

              <Typography sx={{ color: '#b0b5b9', fontSize: 11 }}>
                ·
              </Typography>

              <Typography
                sx={{
                  fontSize: 11,
                  color: '#7b858c',
                }}
              >
                {SUPPORT_STATUS_LABELS[ticket.status] || ticket.status}
              </Typography>
            </Stack>
          </Box>

          <IconButton
            onClick={onClose || handleBack}
            size="small"
            aria-label="Close conversation"
            sx={{
              bgcolor: '#f6f7f8',
              color: '#52616a',
              width: 34,
              height: 34,
              flexShrink: 0,
              '&:hover': {
                bgcolor: '#eceeef',
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {/* Ticket subject bar */}
      <Box
        sx={{
          px: 2,
          py: 1.3,
          bgcolor: '#fff',
          borderBottom: '1px solid #e8ebed',
          flexShrink: 0,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <FiHeadphones size={16} color="#77838a" />

          <Typography
            sx={{
              fontSize: 11,
              color: '#65717a',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {ticket.subject}
          </Typography>
        </Stack>
      </Box>

      {/* Message area */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          px: 2,
          py: 2,
          bgcolor: '#f5f7f7',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: 5,
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: '#d9dfe1',
            borderRadius: 5,
          },
        }}
      >
        {/* Vendor decision / appeal information */}
        {ticket.category === 'order_issue' &&
          ticket.vendorDecision?.decision &&
          ticket.currentHandler === 'customer' && (
            <VendorDecisionResponse
              ticket={ticket}
              ticketId={ticketId}
            />
          )}

        {ticket.category === 'order_issue' &&
          ticket.vendorDecision?.decision &&
          ticket.currentHandler === 'admin' && (
            <Alert
              severity="info"
              sx={{
                borderRadius: 2,
                fontSize: 12,
              }}
            >
              Your appeal has been sent to Wreeo customer support. They will
              reply here.
            </Alert>
          )}

        {/* Evidence attachments */}
        {ticket.evidence?.length > 0 && (
          <Box
            sx={{
              p: 1.5,
              bgcolor: '#fff',
              borderRadius: 2,
              border: '1px solid #e9edef',
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                mb: 1,
                color: '#39434a',
              }}
            >
              Attached evidence ({ticket.evidence.length})
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
              {ticket.evidence.map((ev, index) => (
                <Box
                  key={index}
                  component="a"
                  href={`${process.env.NEXT_PUBLIC_API_URL}${ev.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    border: '1px solid #e5e8ea',
                    display: 'block',
                  }}
                >
                  <Box
                    component="img"
                    src={`${process.env.NEXT_PUBLIC_API_URL}${ev.url}`}
                    alt="Evidence"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {/* Date separator */}
        {messages.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              my: 0.5,
            }}
          >
            <Typography
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 5,
                bgcolor: '#e9edef',
                color: '#7d878d',
                fontSize: 10,
              }}
            >
              {formatDateLabel(messages[0].createdAt)}
            </Typography>
          </Box>
        )}

        {/* Chat messages */}
        {messages.map((message, index) => {
          const mine = message.sender?.role === 'user';

          const previousMessage = messages[index - 1];

          const currentDate = new Date(message.createdAt).toDateString();
          const previousDate = previousMessage
            ? new Date(previousMessage.createdAt).toDateString()
            : null;

          const showDate = previousDate && currentDate !== previousDate;

          if (message.isInternalNote) return null;

          return (
            <React.Fragment key={message._id || index}>
              {showDate && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 0.5 }}>
                  <Typography
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 5,
                      bgcolor: '#e9edef',
                      color: '#7d878d',
                      fontSize: 10,
                    }}
                  >
                    {formatDateLabel(message.createdAt)}
                  </Typography>
                </Box>
              )}

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: mine ? 'flex-end' : 'flex-start',
                  width: '100%',
                }}
              >
                <Box
                  sx={{
                    maxWidth: '88%',
                    px: 1.7,
                    py: 1.25,
                    borderRadius: mine
                      ? '15px 15px 4px 15px'
                      : '15px 15px 15px 4px',
                    bgcolor: mine ? '#ffe9e0' : '#fff',
                    color: '#30383d',
                    border: mine ? 'none' : '1px solid #f0f1f2',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.025)',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      lineHeight: 1.65,
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {message.message}
                  </Typography>
                </Box>

                {/* Message timestamp */}
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.5}
                  sx={{
                    mt: 0.45,
                    px: 0.4,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 9.5,
                      color: '#8b959b',
                    }}
                  >
                    {formatTime(message.createdAt)}
                  </Typography>

                  {mine && (
                    <Typography
                      sx={{
                        fontSize: 9,
                        color: '#8b959b',
                      }}
                    >
                      · You
                    </Typography>
                  )}
                </Stack>
              </Box>
            </React.Fragment>
          );
        })}

        <div ref={messagesEndRef} />
      </Box>

      {/* Fixed composer */}
      <Box
        sx={{
          px: 1.5,
          pt: 1.4,
          pb: 1.2,
          bgcolor: '#fff',
          borderTop: '1px solid #e8ebed',
          flexShrink: 0,
        }}
      >
        {closed ? (
          <Box
            sx={{
              p: 1.5,
              bgcolor: '#f5f6f7',
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                color: '#7b858c',
              }}
            >
              This ticket is closed. Raise a new query if you need further help.
            </Typography>
          </Box>
        ) : (
          <form onSubmit={handleSend}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                p: 0.6,
                pl: 1.2,
                border: '1px solid #dfe4e6',
                borderRadius: '12px',
                '&:focus-within': {
                  borderColor: '#c74735',
                },
              }}
            >
              <TextField
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write a message..."
                disabled={sending}
                fullWidth
                multiline
                maxRows={4}
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    fontSize: 12,
                    lineHeight: 1.5,
                    py: 0.6,
                  },
                  '& textarea': {
                    padding: 0,
                  },
                }}
              />

              <IconButton
                type="submit"
                disabled={sending || !reply.trim()}
                aria-label="Send message"
                sx={{
                  width: 37,
                  height: 37,
                  borderRadius: '9px',
                  bgcolor: '#c74735',
                  color: '#fff',
                  flexShrink: 0,
                  '&:hover': {
                    bgcolor: '#ad3929',
                  },
                  '&.Mui-disabled': {
                    bgcolor: '#e8c5be',
                    color: '#fff',
                  },
                }}
              >
                {sending ? (
                  <CircularProgress size={17} color="inherit" />
                ) : (
                  <FiSend size={17} />
                )}
              </IconButton>
            </Stack>

            <Typography
              sx={{
                mt: 0.8,
                textAlign: 'center',
                fontSize: 9,
                color: '#929ba0',
              }}
            >
              Enter to send&nbsp; · &nbsp;Shift + Enter for a new line
            </Typography>
          </form>
        )}
      </Box>
    </Box>
  );
}

function VendorDecisionResponse({ ticket, ticketId }) {
  const queryClient = useQueryClient();
  const [dismissed, setDismissed] = useState(false);

  const { mutate: appeal, isPending, error } = useMutation({
    mutationFn: () =>
      api.userRespondToVendorDecision({
        id: ticketId,
        accepted: false,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['user-support-ticket', ticketId],
      });

      queryClient.invalidateQueries({
        queryKey: ['user-support-tickets'],
      });
    },
  });

  const DECISION_LABELS = {
    return_refund: 'a return & refund',
    refund_only: 'a refund (no return required)',
    replacement: 'a replacement',
    repair: 'a repair',
    declined: 'to decline your claim',
  };

  if (dismissed) return null;

  return (
    <Box
      sx={{
        p: 1.8,
        bgcolor: '#fff',
        border: '1px solid #e9edef',
        borderRadius: 2,
      }}
    >
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 700,
          mb: 1,
          color: '#30383d',
        }}
      >
        Seller's response
      </Typography>

      <Typography sx={{ fontSize: 12, mb: 1 }}>
        The seller decided to offer{' '}
        {DECISION_LABELS[ticket.vendorDecision?.decision] || 'a decision'}.
      </Typography>

      {ticket.vendorDecision?.note && (
        <Typography
          sx={{
            fontSize: 11,
            color: '#77838a',
            mb: 1.5,
            fontStyle: 'italic',
          }}
        >
          "{ticket.vendorDecision.note}"
        </Typography>
      )}

      <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 1.5 }}>
        Not satisfied with the seller's decision? Want to appeal to Wreeo
        customer support?
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {error?.response?.data?.message ||
            'Could not submit your appeal.'}
        </Alert>
      )}

      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          size="small"
          disabled={isPending}
          onClick={() => appeal()}
          sx={{
            bgcolor: '#c74735',
            textTransform: 'none',
            fontSize: 11,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#ad3929',
              boxShadow: 'none',
            },
          }}
        >
          Yes, appeal
        </Button>

        <Button
          variant="outlined"
          size="small"
          disabled={isPending}
          onClick={() => setDismissed(true)}
          sx={{
            textTransform: 'none',
            fontSize: 11,
            color: '#65717a',
            borderColor: '#dfe4e6',
          }}
        >
          Dismiss
        </Button>
      </Stack>
    </Box>
  );
}
