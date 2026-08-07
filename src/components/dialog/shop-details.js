import PropTypes from 'prop-types';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// mui
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Chip,
  Skeleton,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

// components
import BlurImage from '@/components/blur-image';
import { getAssetUrl } from '@/utils/getAssetUrl';

// api
import * as api from 'src/services';

import { Switch, FormControlLabel } from '@mui/material'; // add to mui imports

ShopDetailsDialog.propTypes = {
  slug: PropTypes.string,
  onClose: PropTypes.func.isRequired
};

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
];

function Detail({ label, value }) {
  return (
    <Grid item xs={6}>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Typography variant="body2">{value ?? '-'}</Typography>
    </Grid>
  );
}

export default function ShopDetailsDialog({ slug, onClose }) {
  const open = !!slug;
  const queryClient = useQueryClient();
  const [statusValue, setStatusValue] = useState('');

  const { data: res, isLoading } = useQuery({
    queryKey: ['admin-shop', slug],
    queryFn: () => api.getShopBySlug(slug),
    enabled: open,
    onSuccess: (data) => {
      setStatusValue(data?.data?.status || '');
      setPayoutsEnabled(!!data?.data?.payoutsEnabled);
      setChargesEnabled(!!data?.data?.chargesEnabled);
    }
  });

  const s = res?.data;
  const isVendorPopulated = s?.vendor && typeof s.vendor === 'object';

  const { mutate: updateStatus, isPending: updating } = useMutation({
    mutationFn: (status) => api.updateShopStatus(slug, status),
    onSuccess: () => {
      toast.success('Shop status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-shop', slug] });
      queryClient.invalidateQueries({ queryKey: ['admin-shops'] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to update status')
  });



  const [payoutsEnabled, setPayoutsEnabled] = useState(false);
const [chargesEnabled, setChargesEnabled] = useState(false);

const { mutate: updateFlags, isPending: updatingFlags } = useMutation({
  mutationFn: (flags) => api.updateShopFlags(slug, flags),
  onSuccess: () => {
    toast.success('Shop settings updated');
    queryClient.invalidateQueries({ queryKey: ['admin-shop', slug] });
    queryClient.invalidateQueries({ queryKey: ['admin-shops'] });
  },
  onError: (err) => toast.error(err?.response?.data?.message || 'Failed to update settings')
});

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Shop Details</DialogTitle>

      <DialogContent dividers>
        {isLoading ? (
          <Stack spacing={2}>
            <Skeleton variant="rounded" height={100} />
            <Skeleton variant="text" />
            <Skeleton variant="text" />
          </Stack>
        ) : s ? (
          <Stack spacing={3}>
            {s.logo?.url && (
              <BlurImage
                src={getAssetUrl(s.logo.url)}
                alt={s.name}
                width={80}
                height={80}
                style={{ borderRadius: 8, objectFit: 'cover' }}
              />
            )}

            <Grid container spacing={2}>
              <Detail label="Shop Name" value={s.name} />
              <Detail
                label="Owner"
                value={isVendorPopulated ? `${s.vendor.firstName} ${s.vendor.lastName}` : '-'}
              />
              <Detail label="Owner Email" value={isVendorPopulated ? s.vendor.email : '-'} />
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                  Current Status
                </Typography>
                <Chip size="small" label={s.status} sx={{ display: 'block', width: 'fit-content', textTransform: 'capitalize' }} />
              </Grid>
              {/* <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                  KYC Status
                </Typography>
                <Chip size="small" label={s.kycStatus} sx={{ display: 'block', width: 'fit-content', textTransform: 'capitalize' }} />
              </Grid> */}
              <Detail label="Products" value={s.productCount ?? '-'} />
              <Detail label="Rating" value={s.rating ? `${s.rating.toFixed(1)} (${s.ratingCount})` : '-'} />
              <Detail label="Shop Email" value={s.shopEmail} />
              <Detail label="Shop Phone" value={s.shopPhone} />
              <Detail label="Website" value={s.website} />
            </Grid>

            <Divider />

            <Grid container spacing={2}>
              <Detail label="Country" value={s.address?.country} />
              <Detail label="State" value={s.address?.state} />
              <Detail label="City" value={s.address?.city} />
              <Detail label="Street Address" value={s.address?.streetAddress} />
            </Grid>

            <Grid item xs={12}>
  <Stack direction="row" spacing={3}>
    <FormControlLabel
      control={
        <Switch
          checked={payoutsEnabled}
          onChange={(e) => {
            const val = e.target.checked;
            setPayoutsEnabled(val);
            updateFlags({ payoutsEnabled: val });
          }}
          disabled={updatingFlags}
        />
      }
      label="Payouts Enabled"
    />
    <FormControlLabel
      control={
        <Switch
          checked={chargesEnabled}
          onChange={(e) => {
            const val = e.target.checked;
            setChargesEnabled(val);
            updateFlags({ chargesEnabled: val });
          }}
          disabled={updatingFlags}
        />
      }
      label="Charges Enabled"
    />
  </Stack>
</Grid>

            {s.description && (
              <>
                <Divider />
                <div>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                    Description
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    {s.description}
                  </Typography>
                </div>
              </>
            )}

            {s.identityVerification?.length > 0 && (
              <>
                <Divider />
                <div>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}
                  >
                    Identity Verification
                  </Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    {s.identityVerification.map((doc, i) => (
                      <Stack key={i} spacing={0.5} alignItems="center">
                        <BlurImage
                          src={getAssetUrl(doc.url)}
                          alt={doc.title}
                          width={70}
                          height={70}
                          style={{ borderRadius: 6, objectFit: 'cover', border: '1px solid #ddd' }}
                        />
                        <Typography variant="caption">{doc.title}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </div>
              </>
            )}
          </Stack>
        ) : (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            Failed to load shop.
          </Typography>
        )}
      </DialogContent>

      {s && (
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 160, mr: 'auto' }}>
            <InputLabel id="shop-status-select">Update Status</InputLabel>
            <Select
              labelId="shop-status-select"
              label="Update Status"
              value={statusValue}
              onChange={(e) => setStatusValue(e.target.value)}
            >
              {STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button onClick={onClose}>Close</Button>
          <Button
            variant="contained"
            disabled={updating || statusValue === s.status}
            onClick={() => updateStatus(statusValue)}
          >
            {updating ? 'Saving...' : 'Save Status'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}