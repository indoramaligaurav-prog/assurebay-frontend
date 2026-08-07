// mui
import { Box, Container } from '@mui/material';

// components
import ProductList from 'src/components/_main/products';
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export async function generateStaticParams() {
  const res = await fetch(`${baseUrl}/api/shops-slugs`, {
    next: { revalidate: 3600 } // Cache slug list for 1 hour
  });

  const { data } = await res.json();

  return (
    data?.map((cat) => ({
      slug: cat.slug
    })) || []
  );
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const res = await fetch(`${baseUrl}/api/shops/${slug}`, {
    cache: 'force-cache' // Prefer cached
  });

  const { data: currentShop } = await res.json();

  if (!currentShop) return {};

  return {
    title: currentShop.metaTitle,
    description: currentShop.metaDescription,
    openGraph: {
      title: currentShop.name,
      description: currentShop.metaDescription
    }
  };
}

export default async function Listing(props) {
  const params = await props.params;
  const { slug } = params;

  const res = await fetch(`${baseUrl}/api/shops/${slug}`, {
    next: { revalidate: 60 } // Revalidate every 60 seconds
  });
  const response = await res.json();
  if (!response?.success || !response?.data) {
    notFound(); // Show 404 page
  }
  const res2 = await fetch(`${baseUrl}/api/products/filters`, {
    next: { revalidate: 60 } // Revalidate every 60 seconds
  });
  const response2 = await res2.json();
  const { data: shopData } = response;
  const { data: filters } = response2;

  return (
    <Box>
      <Box sx={{ bgcolor: 'background.default' }}>
        <Container maxWidth="xl">
          <HeaderBreadcrumbs
            heading={shopData?.name}
            links={[
              {
                name: 'Home',
                href: '/'
              },
              {
                name: 'Shops',
                href: '/shops'
              },
              {
                name: shopData?.name
              }
            ]}
          />

          <ProductList shop={shopData} filters={filters} />
        </Container>
      </Box>
    </Box>
  );
}
