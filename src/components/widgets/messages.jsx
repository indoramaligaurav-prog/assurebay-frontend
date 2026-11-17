
'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

import {
  Box,
  Stack,
  Typography,
  Drawer,
  Avatar,
  IconButton,
  Divider,
  Button,
  Tabs,
  Tab,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { FiArrowLeft, FiMessageCircle } from 'react-icons/fi';

import SupportInbox from 'src/components/_main/support';
import SupportThread from 'src/components/_main/support/thread';

import QuoteChatsInbox from 'src/components/_main/quote-chats/inbox';
import QuoteConversation from 'src/components/_main/quote-chats/conversation';

const QUOTE_REQUESTS_PATH = '/quote-request';

export default function MessagesWidget() {
  const router = useRouter();
  const pathname = usePathname();

  const { isAuthenticated } = useSelector(({ user }) => user);

  const [open, setOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('chats');

  const [selectedTicketId, setSelectedTicketId] = React.useState(null);
  const [selectedQuote, setSelectedQuote] = React.useState(null);

  const isConversationOpen = Boolean(
    selectedTicketId || selectedQuote
  );

  const isQuoteConversation = Boolean(selectedQuote);

  const handleOpen = () => {
    if (!isAuthenticated) {
      router.push(
        `/auth/sign-in?redirect=${encodeURIComponent(pathname || '/')}`
      );
      return;
    }

    setActiveTab('chats');
    setSelectedTicketId(null);
    setSelectedQuote(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleBack = () => {
    setSelectedTicketId(null);
    setSelectedQuote(null);
  };

  const handleTabChange = (event, value) => {
    setActiveTab(value);
    handleBack();
  };

  const handleViewFullPage = (destination) => {
    setOpen(false);
    router.push(destination);
  };

  const seller = selectedQuote?.vendor || selectedQuote?.product?.vendor;

const sellerName =
  seller?.shop?.name ||
  seller?.shopName ||
  seller?.name ||
  selectedQuote?.product?.vendorName ||
  'Seller';

const sellerInitials = sellerName
  .trim()
  .split(/\s+/)
  .slice(0, 2)
  .map((word) => word.charAt(0).toUpperCase())
  .join('');

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
        <FiMessageCircle size={17} strokeWidth={1.6} />

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

         {!selectedTicketId && (
        <Box
          sx={{
      px: 3,
      pt: 2,
      pb: 2,
      flexShrink: 0,
      flexGrow: 0,
      bgcolor: '#fff',
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
                  onClick={handleBack}
                  size="small"
                  aria-label="Back to messages"
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

             {isQuoteConversation ? (
  <Stack
    direction="row"
    alignItems="center"
    spacing={1.5}
    sx={{ minWidth: 0, flex: 1 }}
  >
    <Avatar
      sx={{
        width: 40,
        height: 40,
        bgcolor: '#eef0f1',
        color: '#58656c',
        fontSize: 12,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {sellerInitials}
    </Avatar>

    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: 15,
          fontWeight: 700,
          color: '#292f35',
          lineHeight: 1.4,
        }}
        noWrap
      >
        {sellerName}
      </Typography>

      <Typography
        sx={{
          fontSize: 11,
          color: '#858b91',
          mt: 0.2,
        }}
      >
        Seller
      </Typography>
    </Box>
  </Stack>
) : (
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
      {isConversationOpen ? 'Support conversation' : 'Messages'}
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
        : 'Conversations and support, in one place.'}
    </Typography>
  </Box>
)}
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

        )}

        {/* Tabs - only visible in inbox */}
        {!isConversationOpen && (
          <>
            <Divider sx={{ borderColor: '#f0f0f0' }} />

            <Box sx={{ px: 3, py: 1.5, flexShrink: 0 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  minHeight: 38,
                  bgcolor: '#f5f6f7',
                  borderRadius: '9px',
                  p: 0.4,
                  '& .MuiTabs-indicator': {
                    display: 'none',
                  },
                  '& .MuiTab-root': {
                    minHeight: 34,
                    textTransform: 'none',
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#747d84',
                    borderRadius: '7px',
                    px: 1,
                  },
                  '& .Mui-selected': {
                    bgcolor: '#fff',
                    color: '#292f35 !important',
                    fontWeight: 700,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  },
                }}
              >
                <Tab value="chats" label="Chats" />
                <Tab value="support" label="Support queries" />
              </Tabs>
            </Box>
          </>
        )}

        {/* Scrollable content */}
        <Box
          sx={{
  flex: 1,
  minHeight: 0,
  overflowY: isConversationOpen ? 'hidden' : 'auto',
  overflowX: 'hidden',
  px: isConversationOpen ? 0 : { xs: 2, sm: 3 },
  py: isConversationOpen ? 0 : 1.5,
  overscrollBehavior: 'contain',
  scrollbarWidth: 'thin',
  display: 'flex',
  flexDirection: 'column',
  '& .MuiCard-root': {
    boxShadow: 'none',
    border: '1px solid #eeeeee',
    borderRadius: '12px',
  },
}}
        >
          {isConversationOpen ? (
            isQuoteConversation ? (
              <QuoteConversation
                key={selectedQuote._id}
                quote={selectedQuote}
                inDrawer
              />
            ) : (
              <SupportThread
                  key={selectedTicketId}
  ticketId={selectedTicketId}
  inDrawer
  onBack={handleBack}
  onClose={handleClose}
              />
            )
          ) : activeTab === 'chats' ? (
            <QuoteChatsInbox
              inDrawer
              onSelectQuote={(quote) => {
                setSelectedQuote(quote);
              }}
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
        {!isConversationOpen && (
          <>
            <Divider sx={{ borderColor: '#f0f0f0' }} />

            <Box
              sx={{
                px: 3,
                py: 2,
                flexShrink: 0,
                bgcolor: '#fff',
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Button
                  onClick={() =>
                    handleViewFullPage(QUOTE_REQUESTS_PATH)
                  }
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    color: '#292f35',
                    fontSize: 11,
                    fontWeight: 500,
                    textTransform: 'none',
                    px: 0,
                    minWidth: 0,
                  }}
                >
                  View all messages
                </Button>

                <Button
                  onClick={() =>
                    handleViewFullPage('/support')
                  }
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    color: '#292f35',
                    fontSize: 11,
                    fontWeight: 500,
                    textTransform: 'none',
                    px: 0,
                    minWidth: 0,
                  }}
                >
                  View all support
                </Button>
              </Stack>
            </Box>
          </>
        )}
      </Drawer>
    </>
  );
}
