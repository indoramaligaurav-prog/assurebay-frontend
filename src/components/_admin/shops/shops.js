'use client';
import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PropTypes from 'prop-types';
// api
import * as api from 'src/services';
import { useQuery } from '@tanstack/react-query';
// mui
import { Dialog } from '@mui/material';
// components
import DeleteDialog from 'src/components/dialog/delete';
import Table from 'src/components/table/table';
import Shop from 'src/components/table/rows/shop';

import ShopDetailsDialog from 'src/components/dialog/shop-details';

const TABLE_HEAD = [
  { id: 'name', label: 'Shop' },
  { id: 'owner', label: 'Owner' },
  { id: 'products', label: 'products' },
  { id: 'status', label: 'Status' },
  { id: '', label: 'Actions' }
];

export default function AdminProducts() {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page');
  const searchParam = searchParams.get('search');
  const [open, setOpen] = useState(false);
  const [apicall, setApicall] = useState(false);
  const [id, setId] = useState(null);
  const [detailsSlug, setDetailsSlug] = useState(null);


  const statusParam = searchParams.get('status');

  const { data, isPending: isLoading } = useQuery({
    queryKey: ['admin-shops', apicall, searchParam, pageParam, statusParam],
    queryFn: () => api.getShopsByAdmin(+pageParam || 1, searchParam || '', statusParam || ''),
    select: (res) => ({
      data: res?.data || [],
        page: res?.pagination?.page,
        totalPages: res?.pagination?.totalPages,
        total: res?.pagination?.total
    })
  });

  const handleClickOpen = (prop) => () => {
    setId(prop);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Dialog onClose={handleClose} open={open} maxWidth={'xs'}>
        <DeleteDialog
          onClose={handleClose}
          id={id}
          apicall={setApicall}
          endPoint={'deleteShop'}
          type={'Shop deleted'}
          deleteMessage={
            'Are you really sure you want to remove this Shop? Just making sure before we go ahead with it.'
          }
        />
      </Dialog>

      <ShopDetailsDialog slug={detailsSlug} onClose={() => setDetailsSlug(null)} />
      <Table
        headData={TABLE_HEAD}
        data={data}
        isLoading={isLoading}
        row={Shop}
        handleClickOpen={handleClickOpen}
        handleOpenDetails={setDetailsSlug}
        isSearch
        filters={[{ ...SHOP_STATUS_FILTERS }]}
      />
    </>
  );
}
AdminProducts.propTypes = { isVendor: PropTypes.boolean };

const SHOP_STATUS_FILTERS = {
  name: 'Status',
  param: 'status',
  data: [
    {
      name: 'Approved',
      slug: 'approved'
    },
    {
      name: 'Pending',
      slug: 'pending'
    },
    {
      name: 'In Review',
      slug: 'in-review'
    },
    {
      name: 'Action Required',
      slug: 'action-required'
    },
    {
      name: 'Blocked',
      slug: 'blocked'
    },
    {
      name: 'Rejected',
      slug: 'rejected'
    }
  ]
};
