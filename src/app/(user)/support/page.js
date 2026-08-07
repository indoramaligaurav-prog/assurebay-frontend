import React from 'react';
import { Container } from '@mui/material';

// components
import SupportInbox from 'src/components/_main/support';

export const metadata = {
  title: 'Support | Assuredbay',
  description: 'Raise a query with our team and track its status.',
  applicationName: 'Assuredbay',
  authors: 'Assuredbay',
  keywords: 'support, help, contact, Assuredbay'
};

export default function page() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <SupportInbox />
    </Container>
  );
}