'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

// mui
import { Dialog } from '@mui/material';

// components
import Table from 'src/components/table/table';
import DraftProduct from 'src/components/table/rows/draft-product';
import ProductDetailsDialog from 'src/components/dialog/product-detailss';



// api
import * as api from 'src/services';

const TABLE_HEAD = [
  { id: 'image', label: 'Image' },
  { id: 'vendorName', label: 'Vendor' },
  { id: 'childCategory', label: 'Child Category' },
  { id: 'price', label: 'Price' },
  { id: 'addedAt', label: 'Added At' },
  { id: '', label: 'Actions' }
];

export default function DraftProductsTable() {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page');
  const searchParam = searchParams.get('search');

  const [detailsSlug, setDetailsSlug] = useState(null);

  const { data, isPending: isLoading } = useQuery({
    queryKey: ['draft-products', pageParam, searchParam],
    queryFn: () => api.getDraftProducts(+pageParam || 1, searchParam || ''),
    select: (res) => ({
      data: res?.data || [],
      page: res?.pagination?.page,
      totalPages: res?.pagination?.totalPages,
      total: res?.pagination?.total
    })
  });

  return (
    <>
      <Dialog open={!!detailsSlug} onClose={() => setDetailsSlug(null)} maxWidth="sm" fullWidth>
        <ProductDetailsDialog slug={detailsSlug} onClose={() => setDetailsSlug(null)} />
      </Dialog>

      <Table
        headData={TABLE_HEAD}
        data={data}
        isLoading={isLoading}
        row={DraftProduct}
        handleOpenDetails={setDetailsSlug}
        isSearch
      />
    </>
  );
}