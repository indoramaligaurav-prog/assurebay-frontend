'use client';
import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';

// api
import * as api from 'src/services';
import { useQuery } from '@tanstack/react-query';
// mui

// component

import Table from 'src/components/table/table';
import SubCategory from '@/components/table/rows/sub-category';

import Link from 'next/link';
import { Stack, Button } from '@mui/material';

const TABLE_HEAD = [
  { id: 'name', label: 'Subcategory' },
  { id: 'category', label: 'Category' },
  { id: 'status', label: 'Status' },
  { id: 'createdAt', label: 'Date' },
  { id: '', label: 'Actions' }
];
export default function SubCategoryList({ categories }) {
  const searchParams = useSearchParams();



  const { data, isPending: isLoading } = useQuery({
    queryKey: ['categories', searchParams.toString()],
    queryFn: () => api.getSubCategoriesByAdmin(searchParams.toString())
  });



  return (
    <>
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
      <Button component={Link} href="/admin/categories/sub-categories/add" variant="contained">
        Add Sub Category
      </Button>
    </Stack>
      <Table
        headData={TABLE_HEAD}
        data={data}
        isLoading={isLoading}
        row={SubCategory}
        isSearch
        filters={[{ name: 'Category', param: 'category', data: categories }, { ...STATUS_FILTER }]}
      />
    </>
  );
}
const STATUS_FILTER = {
  name: 'Status',
  param: 'status',
  data: [
    {
      name: 'Active',
      slug: 'active'
    },
    {
      name: 'Inactive',
      slug: 'inactive'
    }
  ]
};
