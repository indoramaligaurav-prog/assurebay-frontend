// app/brands/[slug]/page.jsx or page.tsx
import React from 'react';
import { notFound } from 'next/navigation';
import { Stack, Container } from '@mui/material';

import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import ProductList from 'src/components/_main/products';
// Static generation with ISR
export const revalidate = 60;

// Base URL
const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export async function generateStaticParams() {
  const res = await fetch(`${baseUrl}/api/brands-slugs`, {
    next: { revalidate: 3600 } // Cache slug list for 1 hour
  });

  const { data } = await res.json();

  return (
    data?.map((brand) => ({
      slug: brand.slug
    })) || []
  );
}

// Generate metadata per brand
export async function generateMetadata({ params }) {
  const { slug } = await params;

  const res = await fetch(`${baseUrl}/api/brands/${slug}`, {
    cache: 'force-cache' // Prefer cached
  });

  const { data: brand } = await res.json();

  if (!brand) return {};

  return {
    title: brand.metaTitle || brand.name,
    description: brand.metaDescription || brand.description,
    openGraph: {
      title: brand.name,
      description: brand.metaDescription || brand.description
    }
  };
}

// Main page component
export default async function BrandDetail({ params }) {
  const { slug } = await params;

  const res = await fetch(`${baseUrl}/api/brands/${slug}`, {
    next: { revalidate: 60 } // Revalidate every 60 seconds
  });
  const res2 = await fetch(`${baseUrl}/api/products/filters`, {
    next: { revalidate: 60 } // Revalidate every 60 seconds
  });

  const response = await res.json();
  const response2 = await res2.json();
  if (!response?.success || !response?.data) {
    notFound(); // Show 404 page
  }

  const { data: brand } = response;
  const { data: filters } = response2;

  console.log('product filters:', filters);

  return (
    <Container maxWidth="xl">
      <Stack gap={3}>
        <HeaderBreadcrumbs
          heading={brand?.name}
          links={[{ name: 'Home', href: '/' }, { name: 'Brands', href: '/brands' }, { name: brand?.name }]}
        />
        <ProductList brand={brand} filters={filters} />
      </Stack>
    </Container>
  );
}
