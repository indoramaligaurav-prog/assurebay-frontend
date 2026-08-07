'use client';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';

// api
import * as api from 'src/services';
import { useQuery, useMutation } from '@tanstack/react-query';

// component
import Table from 'src/components/table/table';
import UserList from '@/components/table/rows/user';
import RoleDialog from 'src/components/dialog/role';

import AssignRoleDialog from 'src/components/dialog/assign-role'; // add import

const TABLE_HEAD = [
  { id: 'name', label: 'User' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'phone' },
  { id: 'orders', label: 'Orders' },
  { id: 'role', label: 'Role' },
  { id: 'joined', label: 'Joined' },

  { id: '', label: 'Actions' }
];

export default function AdminProducts() {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page');
  const searchParam = searchParams.get('search');
  const [count, setCount] = useState(0);

  const { data, isPending: isLoading } = useQuery({
    queryKey: ['user', pageParam, searchParam, count],
    queryFn: () => api.getUserByAdminsByAdmin(+pageParam || 1, searchParam || '')
  });
  const [id, setId] = useState(null);

  const { mutate, isPending: roleLoading } = useMutation({
    mutationFn: api.updateUserRoleByAdmin,
    onSuccess: (data) => {
      toast.success(data?.message || 'Role updated successfully');
      setCount((prev) => prev + 1);
      setId(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update role');
      setId(null);
    }
  });

  const [assignRoleUser, setAssignRoleUser] = useState(null); // add alongside existing `id` state

  return (
    <div>
      <RoleDialog open={Boolean(id)} onClose={() => setId(null)} onClick={() => mutate(id)} loading={roleLoading} />
          <AssignRoleDialog user={assignRoleUser} onClose={() => setAssignRoleUser(null)} /> 
      <Table
        headData={TABLE_HEAD}
        data={data}
        isLoading={isLoading}
        row={UserList}
        setId={setId}
        id={setId}
        handleAssignRole={setAssignRoleUser}
        isSearch
        filters={[{ ...USER_ROLE_FILTERS }]}
      />
    </div>
  );
}
const USER_ROLE_FILTERS = {
  name: 'Role',
  param: 'role',
  data: [
    {
      name: 'Users',
      slug: 'user'
    },
    {
      name: 'Vendors',
      slug: 'vendor'
    },
    {
      name: 'Admins',
      slug: 'admin'
    }
  ]
};
