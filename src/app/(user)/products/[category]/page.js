// mui
import { Box, Container } from '@mui/material';

// components
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import ProductList from 'src/components/_main/products';
import Categories from '@/components/_main/home/categories';

export const revalidate = 60;
const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export async function generateStaticParams() {
  const res = await fetch(`${baseUrl}/api/categories-slugs`, {
    next: { revalidate: 3600 } // Cache slug list for 1 hour
  });

  const { data } = await res.json();

  return (
    data?.map((cat) => ({
      category: cat.slug
    })) || []
  );
}

export async function generateMetadata({ params }) {
  const { category } = await params;

  const res = await fetch(`${baseUrl}/api/categories/${category}`, {
    cache: 'force-cache' // Prefer cached
  });

  const { data: currentCategory } = await res.json();

  if (!currentCategory) return {};

  return {
    title: currentCategory.metaTitle || currentCategory.name,
    description: currentCategory.metaDescription || currentCategory.description,
    openGraph: {
      title: currentCategory.name,
      description: currentCategory.metaDescription || currentCategory.description
    }
  };
}

export default async function Listing(props) {
  const params = await props.params;
  const { category } = params;

  const res = await fetch(`${baseUrl}/api/categories/${category}`, {
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
  const { data: categoryData } = response;
  const subCategories = categoryData?.subCategories;
  const { data: filters } = response2;
  return (
    <Box>
      <Box sx={{ bgcolor: 'background.default' }}>
        <Container maxWidth="xl">
          <HeaderBreadcrumbs
            heading={categoryData?.name}
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
                name: categoryData?.name
              }
            ]}
          />
          {Boolean(subCategories.length) && <Categories data={subCategories || []} slug={category} />}

          <ProductList category={categoryData} filters={filters} />
        </Container>
      </Box>
    </Box>
  );
}
