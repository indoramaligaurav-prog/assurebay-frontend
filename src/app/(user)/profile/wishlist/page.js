import React from 'react';

// mui
import { Container } from '@mui/material';

// components
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import WishlistMain from 'src/components/_main/profile/wishlist';



// Meta information
export const metadata = {
  title: 'Wishlist | assuredbay - Save Your Favorite Items for Later',
  applicationName: 'assuredbay',
  authors: 'assuredbay'
};

export default function Wishlist() {
  return (
    <Container maxWidth="xl">
      <HeaderBreadcrumbs
        heading="Wishlist"
        links={[
          {
            name: 'Home',
            href: '/'
          },
          {
            name: 'Profile',
            href: '/profile/wishlist'
          },
          {
            name: 'Wishlist'
          }
        ]}
      />
      <WishlistMain />
    </Container>
  );
}
