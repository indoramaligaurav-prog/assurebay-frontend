import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  FormControl, InputLabel, Select, MenuItem, Typography, Skeleton
} from '@mui/material';

import * as api from 'src/services';

AssignRoleDialog.propTypes = {
  user: PropTypes.object, // null when closed
  onClose: PropTypes.func.isRequired
};

export default function AssignRoleDialog({ user, onClose }) {
  const open = !!user;
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState('');

  const { data: rolesRes, isLoading: rolesLoading } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: api.getAdminRoles,
    enabled: open
  });

  const roles = rolesRes?.data || [];

  useEffect(() => {
    setSelectedRole(user?.adminRole?._id || '');
  }, [user]);

  const { mutate: assign, isPending: saving } = useMutation({
    mutationFn: () => api.assignRoleToUser(user._id, selectedRole || null),
    onSuccess: () => {
      toast.success('Role assigned successfully');
      queryClient.invalidateQueries({ queryKey: ['user'] });
      onClose();
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to assign role')
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Assign Role</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Assign a permission role to <strong>{user?.firstName}</strong>.
        </Typography>

        {rolesLoading ? (
          <Skeleton variant="rounded" height={56} />
        ) : (
          <FormControl fullWidth>
            <InputLabel id="assign-role-select">Role</InputLabel>
            <Select
              labelId="assign-role-select"
              label="Role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <MenuItem value="">No role (no extra permissions)</MenuItem>
              {roles.map((r) => (
                <MenuItem key={r._id} value={r._id}>
                  {r.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={saving} onClick={() => assign()}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}