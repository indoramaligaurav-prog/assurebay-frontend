'use client';
import Link from 'next/link';
import { Stack, Typography } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

export default function MessagesWidget() {
  return (
    <Stack
      component={Link}
      href="/support" // change to your support page route
      alignItems="center"
      spacing={0.25}
      sx={{ textDecoration: 'none', color: '#4a4240', '&:hover': { color: '#c74735' } }}
    >
      <ChatBubbleOutlineIcon sx={{ fontSize: 22 }} />
      <Typography sx={{ fontSize: 12, lineHeight: '14px', color: 'inherit' }}>Messages</Typography>
    </Stack>
  );
}