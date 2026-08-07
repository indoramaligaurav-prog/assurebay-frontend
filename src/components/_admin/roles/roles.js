'use client';
import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// mui
import {
  Card, CardContent, Table, TableHead, TableBody, TableRow, TableCell,
  Button, Stack, Typography, Chip, Skeleton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormGroup, FormControlLabel, Checkbox, IconButton, Tooltip
} from '@mui/material';
import { MdEdit, MdDelete, MdAdd } from 'react-icons/md';

// api
import * as api from 'src/services';

export default function RolesMain() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null); // null = create mode
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const { data: rolesRes, isLoading: rolesLoading } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: api.getAdminRoles
  });

  const { data: permsRes, isLoading: permsLoading } = useQuery({
    queryKey: ['all-permissions'],
    queryFn: api.getAllPermissions
  });

  const roles = rolesRes?.data || [];
  const permissions = permsRes?.data || [];

  const groupedPermissions = useMemo(() => {
    return permissions.reduce((acc, p) => {
      acc[p.module] = acc[p.module] || [];
      acc[p.module].push(p);
      return acc;
    }, {});
  }, [permissions]);

  const openCreate = () => {
    setEditingRole(null);
    setName('');
    setDescription('');
    setSelectedPermissions([]);
    setDialogOpen(true);
  };

  const openEdit = (role) => {
    setEditingRole(role);
    setName(role.name);
    setDescription(role.description || '');
    setSelectedPermissions(role.permissions?.map((p) => p._id) || []);
    setDialogOpen(true);
  };

  const closeDialog = () => setDialogOpen(false);

  const togglePermission = (id) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleModule = (modulePerms, allSelected) => {
    const ids = modulePerms.map((p) => p._id);
    setSelectedPermissions((prev) =>
      allSelected ? prev.filter((id) => !ids.includes(id)) : [...new Set([...prev, ...ids])]
    );
  };

  const { mutate: saveRole, isPending: saving } = useMutation({
    mutationFn: (payload) =>
      editingRole ? api.updateAdminRole(editingRole._id, payload) : api.createAdminRole(payload),
    onSuccess: () => {
      toast.success(editingRole ? 'Role updated' : 'Role created');
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      closeDialog();
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to save role')
  });

  const { mutate: removeRole } = useMutation({
    mutationFn: api.deleteAdminRole,
    onSuccess: () => {
      toast.success('Role deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to delete role')
  });

  const handleSave = () => {
    if (!name.trim()) return toast.error('Role name is required');
    saveRole({ name: name.trim(), description, permissions: selectedPermissions });
  };

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
          <Button variant="contained" startIcon={<MdAdd />} onClick={openCreate}>
            Add Role
          </Button>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Permissions</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rolesLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={4}><Skeleton variant="text" /></TableCell>
                </TableRow>
              ))
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                    No roles created yet.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role._id} hover>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>{role.description || '-'}</TableCell>
                  <TableCell>
                    <Chip size="small" label={`${role.permissions?.length || 0} permissions`} />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton onClick={() => openEdit(role)}>
                        <MdEdit />
                      </IconButton>
                    </Tooltip>
                    {/* <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => removeRole(role._id)}>
                        <MdDelete />
                      </IconButton>
                    </Tooltip> */}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRole ? 'Edit Role' : 'Create Role'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="Role Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sales Agent"
              fullWidth
            />
            <TextField
              label="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />

            <Typography variant="subtitle2" sx={{ mt: 1 }}>Permissions</Typography>

            {permsLoading ? (
              <Skeleton variant="rounded" height={200} />
            ) : (
              Object.entries(groupedPermissions).map(([module, perms]) => {
                const allSelected = perms.every((p) => selectedPermissions.includes(p._id));
                return (
                  <Stack key={module} spacing={0.5} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={allSelected}
                          indeterminate={!allSelected && perms.some((p) => selectedPermissions.includes(p._id))}
                          onChange={() => toggleModule(perms, allSelected)}
                        />
                      }
                      label={<Typography fontWeight={600} sx={{ textTransform: 'capitalize' }}>{module}</Typography>}
                    />
                    <FormGroup sx={{ pl: 3 }}>
                      {perms.map((p) => (
                        <FormControlLabel
                          key={p._id}
                          control={
                            <Checkbox
                              size="small"
                              checked={selectedPermissions.includes(p._id)}
                              onChange={() => togglePermission(p._id)}
                            />
                          }
                          label={p.label}
                        />
                      ))}
                    </FormGroup>
                  </Stack>
                );
              })
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" disabled={saving} onClick={handleSave}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}