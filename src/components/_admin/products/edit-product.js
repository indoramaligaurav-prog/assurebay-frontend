'use client';

import { useQuery } from '@tanstack/react-query';
import * as api from 'src/services';
import ProductForm from '@/components/forms/product';

export default function EditProduct(props) {
  const { slug } = props;

  const { data, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => api.getProductBySlug(slug),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <ProductForm
      {...props}
      product={data?.data}
    />
  );
}