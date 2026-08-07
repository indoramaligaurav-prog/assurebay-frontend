'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Stack,
  CircularProgress,
} from '@mui/material';
import toast from 'react-hot-toast';
import * as api from 'src/services';

const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used' },
  { value: 'reconditioned', label: 'Reconditioned' },
  { value: 'as_is', label: 'As-Is' },
];

export default function CreateListingModal({ open, onClose, isVendor }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [condition, setCondition] = useState('');
  const [loading, setLoading] = useState(false);

  const buildUrlAndGo = (categoryId) => {
    const params = new URLSearchParams();
    params.set('title', title.trim());
    params.set('condition', condition);
    if (categoryId) params.set('category', categoryId);

    router.push(`/${isVendor ? 'vendor' : 'admin'}/products/add?${params.toString()}`);
    onClose();
    setTitle('');
    setCondition('');
  };

  const handleContinue = async () => {
    if (!title.trim()) return toast.error('Enter a product title');
    if (!condition) return toast.error('Select condition');

    setLoading(true);
    try {
      const res = await api.suggestCategoryFromTitle(title.trim());
      const suggestedId = res?.data?.category?._id || null;
      buildUrlAndGo(suggestedId);
    } catch (err) {
      // Category suggestion failing shouldn't block listing creation
      buildUrlAndGo(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Start a New Listing</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            select
            fullWidth
            label="Condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            {CONDITIONS.map((c) => (
              <MenuItem key={c.value} value={c.value}>
                {c.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Product Title"
            placeholder="e.g. Apple iPhone 14 Pro Max 256GB"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleContinue}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
}