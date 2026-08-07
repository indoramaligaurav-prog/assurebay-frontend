import React from 'react';

// mui
import { Container } from '@mui/material';

// component import
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import AboutUs from 'src/components/_main/about';

export default function Page() {
  return (
    <Container maxWidth="xl">
      <HeaderBreadcrumbs
        heading="About Us"
        links={[
          {
            name: 'Home',
            href: '/'
          },
          {
            name: 'About us'
          }
        ]}
      />
      <AboutUs />
    </Container>
  );
}
