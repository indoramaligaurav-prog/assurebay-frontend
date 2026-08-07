// mui
import { Box, Container } from '@mui/material';

// components
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import ProductList from 'src/components/_main/products';
import FilterChips from 'src/components/_main/products/search-params-list';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;
export default async function Listing() {
  const res = await fetch(`${baseUrl}/api/products/filters`, {
    next: { revalidate: 60 } // Revalidate every 60 seconds
  });

  const response = await res.json();

  const { data: filters } = response;

  return (
    <Box>
      <Box sx={{ bgcolor: 'background.default' }}>
        <Container maxWidth="xl">
          <HeaderBreadcrumbs
            heading="Products"
            links={[
              {
                name: 'Home',
                href: '/'
              },
              {
                name: 'Products'
              }
            ]}
          />
          <Box>
            <FilterChips />
          </Box>
          <ProductList filters={filters} />
        </Container>
      </Box>
    </Box>
  );
}
