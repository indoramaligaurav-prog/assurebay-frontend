import React from 'react';

// mui
import { Container } from '@mui/material';

// component
import ContactUsMain from '@/components/_main/contact-us';
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';

export default function Page() {
  return (
    <Container maxWidth="xl">
      <HeaderBreadcrumbs
        heading="Contact Us"
        links={[
          {
            name: 'Home',
            href: '/'
          },
          {
            name: 'Contact us'
          }
        ]}
      />
      <ContactUsMain />
    </Container>
  );
}
