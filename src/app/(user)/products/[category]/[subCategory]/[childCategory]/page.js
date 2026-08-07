// mui
import { Box, Container } from '@mui/material';

// components
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import ProductList from 'src/components/_main/products';
// Static generation with ISR
export const revalidate = 60;

// Base URL
const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export async function generateStaticParams() {
  const res = await fetch(`${baseUrl}/api/child-categories-slugs`, {
    next: { revalidate: 3600 } // Cache slug list for 1 hour
  });

  const { data } = await res.json();

  return (
    data?.map((child) => ({
      childCategory: child.slug
    })) || []
  );
}

// // Generate metadata per brand
export async function generateMetadata({ params }) {
  const { childCategory } = await params;

  const res = await fetch(`${baseUrl}/api/child-categories/${childCategory}`, {
    cache: 'force-cache' // Prefer cached
  });

  const { data: child } = await res.json();

  if (!child) return {};

  return {
    title: child.metaTitle,
    description: child.metaDescription,
    openGraph: {
      title: child.metaTitle,
      description: child.metaDescription
    }
  };
}
export default async function Listing(props) {
  const params = await props.params;

  const { category, subCategory, childCategory } = params;

  const res = await fetch(`${baseUrl}/api/child-categories/${childCategory}`, {
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
  const { data: childCategoryData } = response;

  const { data: filters } = response2;

  return (
    <Box>
      <Box sx={{ bgcolor: 'background.default' }}>
        <Container maxWidth="xl">
          <HeaderBreadcrumbs
            heading={childCategoryData?.name}
            links={[
              {
                name: 'Home',
                href: '/'
              },
              {
                name: 'Products',
                href: '/products'
              },
              {
                name: childCategoryData.subCategory?.parentCategory.name,
                href: `/products/${category}`
              },
              {
                name: childCategoryData.subCategory?.name,
                href: `/products/${category}/${subCategory}`
              },
              {
                name: childCategoryData?.name
              }
            ]}
          />

          <ProductList childCategory={childCategoryData} filters={filters} />
        </Container>
      </Box>
    </Box>
  );
}
