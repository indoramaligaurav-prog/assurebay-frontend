'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

import {
  Box,
  Stack,
  Typography,
  Drawer,
  IconButton,
  Divider,
  Button,
} from '@mui/material';

import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { FiArrowLeft } from 'react-icons/fi';

import SupportInbox from 'src/components/_main/support';
import SupportThread from 'src/components/_main/support/thread';

export default function MessagesWidget() {
  const router = useRouter();
  const pathname = usePathname();

  const { isAuthenticated } = useSelector(({ user }) => user);

  const [open, setOpen] = React.useState(false);
  const [selectedTicketId, setSelectedTicketId] = React.useState(null);

  const isConversationOpen = Boolean(selectedTicketId);

  const handleOpen = () => {
    if (!isAuthenticated) {
      router.push(
        `/auth/sign-in?redirect=${encodeURIComponent(pathname || '/')}`
      );
      return;
    }

    setSelectedTicketId(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleBackToInbox = () => {
    setSelectedTicketId(null);
  };

  const handleViewFullPage = () => {
    const destination = selectedTicketId
      ? `/support/${selectedTicketId}`
      : '/support';

    setOpen(false);
    router.push(destination);
  };

  return (
    <>
      {/* Messages trigger */}
      <Stack
        component="button"
        type="button"
        onClick={handleOpen}
        alignItems="center"
        spacing={0.25}
        aria-label="Open messages"
        sx={{
          border: 0,
          p: 0,
          bgcolor: 'transparent',
          fontFamily: 'inherit',
          cursor: 'pointer',
          color: '#4a4240',
          '&:hover': {
            color: '#c74735',
          },
        }}
      >
        <ChatBubbleOutlineIcon sx={{ fontSize: 22 }} />

        <Typography
          sx={{
            fontSize: 12,
            lineHeight: '14px',
            color: 'inherit',
          }}
        >
          Messages
        </Typography>
      </Stack>

      {/* Messages drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: {
              xs: '100%',
              sm: 430,
              md: 480,
            },
            maxWidth: '100%',
            height: '100%',
            bgcolor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '-8px 0 35px rgba(0,0,0,0.06)',
          },
        }}
      >
        {/* Fixed header */}
        <Box
          sx={{
            px: 3,
            pt: 3,
            pb: 2,
            flexShrink: 0,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ minWidth: 0 }}
            >
              {isConversationOpen && (
                <IconButton
                  onClick={handleBackToInbox}
                  aria-label="Back to inbox"
                  size="small"
                  sx={{
                    bgcolor: '#f6f7f8',
                    flexShrink: 0,
                    '&:hover': {
                      bgcolor: '#eceeef',
                    },
                  }}
                >
                  <FiArrowLeft size={18} />
                </IconButton>
              )}

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: 25,
                    fontWeight: 700,
                    letterSpacing: '-0.7px',
                    color: '#292f35',
                    lineHeight: 1.25,
                  }}
                >
                  {isConversationOpen ? 'Conversation' : 'Messages'}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: 12,
                    color: '#858b91',
                  }}
                >
                  {isConversationOpen
                    ? 'View your ticket and reply to support.'
                    : 'Your support queries and conversations.'}
                </Typography>
              </Box>
            </Stack>

            <IconButton
              onClick={handleClose}
              aria-label="Close messages"
              size="small"
              sx={{
                bgcolor: '#f6f7f8',
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

        <Divider sx={{ borderColor: '#f0f0f0', flexShrink: 0 }} />

        {/* Scrollable content */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            px: { xs: 2, sm: 3 },
            py: 2,
            overscrollBehavior: 'contain',
            scrollbarWidth: 'thin',
            '& .MuiCard-root': {
              boxShadow: 'none',
              border: '1px solid #eeeeee',
              borderRadius: '12px',
            },
          }}
        >
          {isConversationOpen ? (
            <SupportThread
              key={selectedTicketId}
              ticketId={selectedTicketId}
              inDrawer
              onBack={handleBackToInbox}
            />
          ) : (
            <SupportInbox
              inDrawer
              onSelectTicket={(ticketId) => {
                setSelectedTicketId(ticketId);
              }}
            />
          )}
        </Box>

        {/* Fixed footer */}
        <Divider sx={{ borderColor: '#f0f0f0', flexShrink: 0 }} />

        <Box
          sx={{
            px: 3,
            py: 2,
            flexShrink: 0,
            bgcolor: '#fff',
          }}
        >
          <Button
            fullWidth
            variant="outlined"
            onClick={handleViewFullPage}
            endIcon={<ArrowForwardIcon />}
            sx={{
              minHeight: 44,
              borderRadius: '12px',
              borderColor: '#edc5b5',
              color: '#b94332',
              fontSize: 13,
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#fff5ef',
                borderColor: '#c74735',
              },
            }}
          >
            {isConversationOpen
              ? 'View full conversation'
              : 'View all support'}
          </Button>

          <Typography
            sx={{
              mt: 1,
              textAlign: 'center',
              fontSize: 11,
              color: '#969ba0',
            }}
          >
            Need more help? Our support team is here for you.
          </Typography>
        </Box>
      </Drawer>
    </>
  );
}