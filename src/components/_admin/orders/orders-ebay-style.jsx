'use client';
import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';

// MUI
import {
  Box, Typography, Stack, Chip, IconButton, Select, MenuItem,
  FormControl, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Skeleton, Button, OutlinedInput,
  InputAdornment, Alert, Paper, Divider, Checkbox, CircularProgress,
  Popover, TextField
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import ReplayIcon from '@mui/icons-material/Replay';
import FeedbackIcon from '@mui/icons-material/Feedback';

// App imports
import * as api from 'src/services';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fDateShort } from '@/utils/format-time';
import { useCurrencyFormat } from '@/hooks/use-currency-format';
import BlurImage from '@/components/blur-image';

/* ── Styled ── */
const PageWrap = styled(Box)({ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', background: '#fff', minHeight: '100vh', padding: '0 0 40px' });
const SidebarLink = styled(Typography)(({ active }) => ({ fontSize: 13, color: active ? '#111' : '#555', fontWeight: active ? 700 : 400, padding: '6px 20px', cursor: 'pointer', background: active ? '#f2f2f2' : 'transparent', display: 'block', '&:hover': { background: '#f7f7f7', color: '#111' } }));
const ActionButton = styled(Button)({ fontSize: 13, color: '#111', border: '1px solid #8f8f8f', borderRadius: 24, padding: '5px 16px', textTransform: 'none', background: '#fff', '&:hover': { background: '#f7f7f7' } });
const StyledTableCell = styled(TableCell)({ fontSize: 13, borderBottom: '1px solid #e5e5e5', padding: '10px 12px', color: '#111' });
const StyledHeadCell = styled(TableCell)({ fontSize: 12, fontWeight: 700, color: '#111', borderBottom: '2px solid #e5e5e5', background: '#fafafa', padding: '10px 12px', whiteSpace: 'nowrap' });
const ThumbBox = styled(Box)({ width: 48, height: 48, border: '1px solid #e5e5e5', borderRadius: 4, position: 'relative', overflow: 'hidden', flexShrink: 0, background: '#f7f7f7' });
const StatusChip = styled(Chip)(({ statuscolor }) => ({ fontSize: 11, fontWeight: 600, height: 22, borderRadius: 4, background: statuscolor === 'green' ? '#e6f4ea' : statuscolor === 'orange' ? '#fff3e0' : statuscolor === 'red' ? '#fdecea' : '#e3f2fd', color: statuscolor === 'green' ? '#2e7d32' : statuscolor === 'orange' ? '#e65100' : statuscolor === 'red' ? '#c62828' : '#1565c0' }));
const EbayLink = styled('a')({ color: '#0654ba', fontSize: 13, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } });

/* ── Helpers ── */
const getStatusColor = (s) => s === 'delivered' ? 'green' : ['shipped','out_for_delivery','on-the-way','in-review','approved'].includes(s) ? 'orange' : s === 'rejected' ? 'red' : 'blue';
const getStatusLabel = (s) => ({
  delivered:        'Delivered',
  shipped:          'Shipped',
  out_for_delivery: 'Out for delivery',
  processing:       'Processing',
  pending:          'Awaiting approval',
  approved:         'Approved',
  rejected:         'Rejected',
  'in-review':      'In review',
  canceled:         'Canceled',
  returned:         'Returned',
}[s] || s);

const STATUS_OPTIONS = [
  { value: 'pending',   label: 'Pending approval' },
  { value: 'approved',  label: 'Approved'         },
  { value: 'shipped',   label: 'Shipped'          },
  { value: 'delivered', label: 'Delivered'        },
  { value: 'all',       label: 'All orders'       }
];
const PERIOD_OPTIONS = [
  { value: '90', label: 'Last 90 days' },
  { value: '60', label: 'Last 60 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '14', label: 'Last 14 days' },
  { value: '7',  label: 'Last 7 days'  }
];
const SEARCH_BY = [
  { value: 'buyer', label: 'Buyer username' },
  { value: 'order', label: 'Order number'   },
  { value: 'item',  label: 'Item title'     }
];
const SIDEBAR = [
  { key: 'pending',       label: 'Pending approval' },
  { key: 'approved',      label: 'Approved'         },
  { key: 'shipped',       label: 'Shipped'          },
  { key: 'delivered',     label: 'Delivered'        },
  null,
  { key: 'cancellations', label: 'Cancellations'    },
  { key: 'returns',       label: 'Returns'          },
  { key: 'disputes',      label: 'Requests and disputes' },
  null,
  { key: 'all',           label: 'All orders' }
];

/* ── OrderRow ── */
// Each order (row) has row.items[] — each item is one OrderItem document
// Shipment actions operate per item, not per order
function OrderRow({ row, isLoading, onCreateShipment, onDownloadLabel, shippingItemId, onApprove, onOpenReject, decidingItemId, onOpenPickup, schedulingItemId }) {
  const fCurrency = useCurrencyFormat('custom', row?.currency);

  if (isLoading) return (
    <TableRow>
      {[...Array(8)].map((_, i) => (
        <StyledTableCell key={i}><Skeleton variant="text" width={i === 2 ? 180 : 80} /></StyledTableCell>
      ))}
    </TableRow>
  );

  const firstItem = row.items?.[0];
  const itemCount = row.items?.length ?? 1;
  const paid      = row.paymentMethod === 'COD' ? 'Cash on delivery' : (row.paymentMethod || 'Paid');

  // Show buyer city+country only — NO email, phone, full address
  const buyerLocation = row.user
    ? `${row.user.city || ''}${row.user.city && row.user.country ? ', ' : ''}${row.user.country || ''}`
    : 'Unknown location';

  return (
    <>
      {/* One row per OrderItem so each has its own shipment action */}
      {(row.items ?? [firstItem]).map((item, idx) => {
        const isCreating = shippingItemId === item?._id;
        const hasShipment = !!(item?.trackingNumber);

        return (
          <TableRow key={item?._id || idx} hover sx={{ '&:hover': { background: '#f7fbff' } }}>

            {/* Checkbox — only on first item row of this order */}
            <StyledTableCell padding="checkbox">
              {idx === 0 && <Checkbox size="small" />}
            </StyledTableCell>

            {/* Actions */}
      
            <StyledTableCell>
              <Stack spacing={0.5}>
                {(item?.vendorStatus || 'pending') === 'pending' ? (
                  decidingItemId === item?._id ? (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <CircularProgress size={12} />
                      <Typography fontSize={11} color="#888">Saving...</Typography>
                    </Stack>
                  ) : (
                    <Stack direction="row" spacing={1}>
                      <EbayLink
                        href="#"
                        onClick={(e) => { e.preventDefault(); onApprove(item._id); }}
                        style={{ color: '#2e7d32', fontWeight: 600 }}
                      >
                        Approve
                      </EbayLink>
                      <Typography color="#ccc">|</Typography>
                      <EbayLink
                        href="#"
                        onClick={(e) => { e.preventDefault(); onOpenReject(e.currentTarget, item._id); }}
                        style={{ color: '#c62828', fontWeight: 600 }}
                      >
                        Reject
                      </EbayLink>
                    </Stack>
                  )
                ) : hasShipment ? (
                  <>
                    <Typography fontSize={11} color="#2e7d32" fontWeight={600}>
                       ✓ {item.trackingNumber}
                    </Typography>
                    <EbayLink
                      href="#"
                      onClick={(e) => { e.preventDefault(); onDownloadLabel(item._id); }}
                    >
                      Download label
                    </EbayLink>
                    {item.trackingLink && (
                      <EbayLink href={item.trackingLink} target="_blank">Track package</EbayLink>
                    )}
                    {item.pickupConfirmationNumber ? (
                      <Typography fontSize={11} color="#1565c0" fontWeight={600}>
                        Pickup scheduled: {item.pickupConfirmationNumber}
                      </Typography>
                    ) : schedulingItemId === item?._id ? (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <CircularProgress size={10} />
                        <Typography fontSize={11} color="#888">Scheduling...</Typography>
                      </Stack>
                    ) : (
                      <EbayLink
                        href="#"
                        onClick={(e) => { e.preventDefault(); onOpenPickup(e.currentTarget, item._id); }}
                      >
                        Schedule pickup
                      </EbayLink>
                    )}
                  </>
                ) : (
                  <EbayLink
                    href="#"
                    onClick={(e) => { e.preventDefault(); onCreateShipment(item._id); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    {isCreating
                      ? <><CircularProgress size={10} /> Creating...</>
                      : 'Create shipment'
                    }
                  </EbayLink>
                )}
              </Stack>
            </StyledTableCell>

            {/* Product — only show order meta on first item */}
            <StyledTableCell sx={{ minWidth: 260 }}>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <ThumbBox>
                  {item?.imageUrl
                    ? <BlurImage priority fill alt={item?.productName} src={item?.imageUrl} objectFit="cover" />
                    : <Box sx={{ width: '100%', height: '100%', background: '#eee' }} />}
                </ThumbBox>
                <Box>
                  <Typography fontSize={13} fontWeight={600} sx={{ color: '#0654ba' }} noWrap maxWidth={200}>
                    {item?.productName || 'Order item'}
                  </Typography>
                  {idx === 0 && (
                    <Typography fontSize={12} color="#555" mt={0.2}>
                      Order #{row.orderNo ?? row._id?.slice(-8)?.toUpperCase()}
                    </Typography>
                  )}
                  {/* Location only — NO email/phone */}
                  {idx === 0 && (
                    <Typography fontSize={12} color="#555">
                      Ships to: {buyerLocation}
                    </Typography>
                  )}
                  {item?.variant && (
                    <Typography fontSize={11} color="#888">{item.variant}</Typography>
                  )}
                </Box>
              </Stack>
            </StyledTableCell>

            {/* Qty */}
            <StyledTableCell align="center">{item?.quantity ?? 1}</StyledTableCell>

            {/* Subtotal */}
            <StyledTableCell>{fCurrency(item?.subtotal ?? 0)}</StyledTableCell>

            {/* Total — only on first row */}
            <StyledTableCell>
              {idx === 0
                ? <Typography fontSize={13} fontWeight={600}>{fCurrency(row.total)}</Typography>
                : null}
            </StyledTableCell>

            {/* Date sold — only on first row */}
            <StyledTableCell>{idx === 0 ? fDateShort(row.createdAt) : null}</StyledTableCell>

            {/* Status per item */}
            <StyledTableCell>
              <Stack spacing={0.5}>
                <StatusChip
                  label={getStatusLabel(item?.vendorStatus || row.status)}
                  statuscolor={getStatusColor(item?.vendorStatus || row.status)}
                  size="small"
                />
                {idx === 0 && <Typography fontSize={11} color="#555">{paid}</Typography>}
              </Stack>
            </StyledTableCell>

          </TableRow>
        );
      })}
    </>
  );
}

/* ── Main ── */
export default function OrdersEbayStyle({ isVendor, shops }) {
  const searchParams  = useSearchParams();
  const queryClient   = useQueryClient();
  const [apicall]     = useState(false);
  const [period,    setPeriod]    = useState('90');
  const [searchBy,  setSearchBy]  = useState('buyer');
  const [searchInput, setSearchInput] = useState(''); // raw text as user types
  const [search,      setSearch]      = useState(''); // committed value, used in the actual query
  const [sidebar,   setSidebar]   = useState('pending');
  const [shippingItemId, setShippingItemId] = useState(null); // tracks which item is mid-request
  const [decidingItemId, setDecidingItemId] = useState(null);
  const [rejectAnchorEl, setRejectAnchorEl] = useState(null);
  const [rejectTargetId, setRejectTargetId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [pickupAnchorEl, setPickupAnchorEl] = useState(null);
  const [pickupTargetId, setPickupTargetId] = useState(null);
  const [pickupDate,  setPickupDate]  = useState('');
  const [pickupReady, setPickupReady] = useState('11:00');
  const [pickupClose, setPickupClose] = useState('18:00');
  const [schedulingItemId, setSchedulingItemId] = useState(null);

  const queryKey = ['orders', apicall, sidebar, search, searchBy, searchParams.toString()];

  const { data, isPending: isLoading } = useQuery({
    queryKey,
    queryFn: () => api.getOrdersByVendor({ status: sidebar, search, searchBy, period }),
    enabled: ['pending', 'approved', 'shipped', 'delivered', 'all'].includes(sidebar),
  });

  const orders = data?.orders ?? data?.data ?? [];
  const total  = data?.total  ?? orders.length ?? 0;

  // ── Create shipment ──
const handleCreateShipment = async (orderItemId) => {
  setShippingItemId(orderItemId);
  try {
    const res = await api.createShipment({ orderItemId });
    toast.success(`Shipment created! Tracking: ${res.data.trackingNumber}`);
    queryClient.invalidateQueries({ queryKey });
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Failed to create shipment');
  } finally {
    setShippingItemId(null);
  }
};

const handleDownloadLabel = (orderItemId) => {
  api.downloadShipmentLabel(orderItemId);
};

const handleOpenPickup = (anchorEl, orderItemId) => {
  setPickupAnchorEl(anchorEl);
  setPickupTargetId(orderItemId);
  setPickupDate('');
  setPickupReady('11:00');
  setPickupClose('18:00');
};

const handleClosePickup = () => {
  setPickupAnchorEl(null);
  setPickupTargetId(null);
};

const handleConfirmPickup = async () => {
  if (!pickupDate) {
    toast.error('Please select a pickup date');
    return;
  }
  const orderItemId = pickupTargetId;
  handleClosePickup();
  setSchedulingItemId(orderItemId);
  try {
    const res = await api.schedulePickup({
      orderItemId,
      pickupDate,
      readyTime: `${pickupReady}:00`,
      closeTime: `${pickupClose}:00`,
    });
    toast.success(`Pickup scheduled! Confirmation: ${res.data.pickupConfirmationNumber}`);
    queryClient.invalidateQueries({ queryKey });
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Failed to schedule pickup');
  } finally {
    setSchedulingItemId(null);
  }
};

const handleApprove = async (orderItemId) => {
  setDecidingItemId(orderItemId);
  try {
    await api.updateOrderItemDecision({ orderItemId, decision: 'approved' });
    toast.success('Item approved');
    queryClient.invalidateQueries({ queryKey });
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Failed to approve item');
  } finally {
    setDecidingItemId(null);
  }
};

const handleOpenReject = (anchorEl, orderItemId) => {
  setRejectAnchorEl(anchorEl);
  setRejectTargetId(orderItemId);
  setRejectReason('');
};

const handleCloseReject = () => {
  setRejectAnchorEl(null);
  setRejectTargetId(null);
  setRejectReason('');
};

const handleConfirmReject = async () => {
  if (!rejectReason.trim()) {
    toast.error('Please provide a reason');
    return;
  }
  const orderItemId = rejectTargetId;
  handleCloseReject();
  setDecidingItemId(orderItemId);
  try {
    await api.updateOrderItemDecision({ orderItemId, decision: 'rejected', rejectReason });
    toast.success('Item rejected');
    queryClient.invalidateQueries({ queryKey });
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Failed to reject item');
  } finally {
    setDecidingItemId(null);
  }
};



  const pillSelect = (value, onChange, options, minWidth, renderVal) => (
    <FormControl size="small">
      <Select value={value} onChange={e => onChange(e.target.value)}
        sx={{ fontSize: 13, borderRadius: 24, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#8f8f8f' }, minWidth }}
        renderValue={renderVal}>
        {options.map(o => <MenuItem key={o.value} value={o.value} sx={{ fontSize: 13 }}>{o.label}</MenuItem>)}
      </Select>
    </FormControl>
  );

  return (
    <PageWrap>
      <Stack direction="row">

        {/* Sidebar */}
        <Box sx={{ width: 200, borderRight: '1px solid #e5e5e5', pt: 1.5, flexShrink: 0 }}>
          {SIDEBAR.map((item, i) =>
            item === null
              ? <Divider key={i} sx={{ my: 1 }} />
              : <SidebarLink key={item.key} active={sidebar === item.key ? 1 : 0} onClick={() => setSidebar(item.key)}>
                  {item.label}
                </SidebarLink>
          )}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, p: '20px 24px' }}>

          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography fontSize={22} fontWeight={700} color="#111">
              {SIDEBAR.find(s => s?.key === sidebar)?.label ?? 'Manage orders'}
            </Typography>
            {/* <EbayLink href="#">Comments</EbayLink> */}
          </Stack>

          {/* Filters */}
          <Paper variant="outlined" sx={{ borderRadius: 1, border: '1px solid #e5e5e5', p: '10px 16px', mb: 2 }}>
            <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1}>
              {pillSelect(sidebar, setSidebar, STATUS_OPTIONS, 180, v => <Typography fontSize={13}><b>Status:</b> {STATUS_OPTIONS.find(o=>o.value===v)?.label}</Typography>)}
              {pillSelect(period,   setPeriod,   PERIOD_OPTIONS, 160, v => <Typography fontSize={13}><b>Period:</b> Last {v} days</Typography>)}
              {pillSelect(searchBy, setSearchBy, SEARCH_BY,      170, v => <Typography fontSize={13}><b>Search by:</b> {SEARCH_BY.find(o=>o.value===v)?.label}</Typography>)}
              <OutlinedInput
                size="small"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && setSearch(searchInput)}
                placeholder="Search..."
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch(searchInput)}>
                      <SearchIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                }
                sx={{ fontSize: 13, borderRadius: 1, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#8f8f8f' }, minWidth: 180 }}
              />
              <EbayLink href="#" onClick={e => { e.preventDefault(); setSearchInput(''); setSearch(''); }}>Reset</EbayLink>
            </Stack>
          </Paper>

          {/* Results */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Typography fontSize={14} fontWeight={600}>Results: {isLoading ? '—' : total}</Typography>
          </Stack>

          

          {/* Table */}
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius:1, border:'1px solid #e5e5e5' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <StyledHeadCell padding="checkbox"><Checkbox size="small" /></StyledHeadCell>
                  <StyledHeadCell>Actions</StyledHeadCell>
                  <StyledHeadCell>Order / Item</StyledHeadCell>
                  <StyledHeadCell align="center">Qty</StyledHeadCell>
                  <StyledHeadCell>Subtotal</StyledHeadCell>
                  <StyledHeadCell>Total</StyledHeadCell>
                  <StyledHeadCell>Date sold</StyledHeadCell>
                  <StyledHeadCell>Status</StyledHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading
                  ? [...Array(5)].map((_,i) => <OrderRow key={i} isLoading row={{}} onCreateShipment={()=>{}} onDownloadLabel={()=>{}} shippingItemId={null} onApprove={()=>{}} onOpenReject={()=>{}} decidingItemId={null} onOpenPickup={()=>{}} schedulingItemId={null} />)
                  : orders.length === 0
                    ? <TableRow>
                        <StyledTableCell colSpan={8} align="center" sx={{ py:6 }}>
                          <Typography fontSize={14} color="#555">No orders found. Try different filters.</Typography>
                        </StyledTableCell>
                      </TableRow>
                    : orders.map(row => (
                        <OrderRow
                          key={row._id}
                          row={row}
                          isLoading={false}
                          isVendor={isVendor}
                          onCreateShipment={handleCreateShipment}
                          onDownloadLabel={handleDownloadLabel}
                          shippingItemId={shippingItemId}
                          onApprove={handleApprove}
                          onOpenReject={handleOpenReject}
                          decidingItemId={decidingItemId}
                          onOpenPickup={handleOpenPickup}
                          schedulingItemId={schedulingItemId}
                        />
                      ))
                }
              </TableBody>
            </Table>
          </TableContainer>

          {/* Items per page */}
          <Stack direction="row" justifyContent="flex-end" alignItems="center" mt={2} spacing={1}>
            <Typography fontSize={13}>Items Per Page:</Typography>
            <FormControl size="small">
              <Select defaultValue={50} sx={{ fontSize:13, '& .MuiOutlinedInput-notchedOutline':{ borderColor:'#8f8f8f' } }}>
                {[25,50,100,200].map(n => <MenuItem key={n} value={n} sx={{ fontSize:13 }}>{n}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>

        </Box>
      </Stack>

      {/* Reject reason popover */}
      <Popover
        open={Boolean(rejectAnchorEl)}
        anchorEl={rejectAnchorEl}
        onClose={handleCloseReject}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, width: 280 }}>
          <Typography fontSize={13} fontWeight={600} mb={1}>Reason for rejection</Typography>
          <TextField
            multiline
            minRows={3}
            fullWidth
            size="small"
            placeholder="e.g. Out of stock, pricing error..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            sx={{ fontSize: 13 }}
          />
          <Stack direction="row" spacing={1} justifyContent="flex-end" mt={1.5}>
            <Button size="small" onClick={handleCloseReject} sx={{ textTransform: 'none', fontSize: 13 }}>
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              color="error"
              onClick={handleConfirmReject}
              sx={{ textTransform: 'none', fontSize: 13 }}
            >
              Reject item
            </Button>
          </Stack>
        </Box>
      </Popover>

      {/* Schedule pickup popover */}
      <Popover
        open={Boolean(pickupAnchorEl)}
        anchorEl={pickupAnchorEl}
        onClose={handleClosePickup}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, width: 280 }}>
          <Typography fontSize={13} fontWeight={600} mb={1}>Schedule FedEx pickup</Typography>
          <Stack spacing={1.5}>
            <TextField
              label="Pickup date"
              type="date"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
            />
            <TextField
              label="Ready time"
              type="time"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={pickupReady}
              onChange={(e) => setPickupReady(e.target.value)}
            />
            <TextField
              label="Close time"
              type="time"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={pickupClose}
              onChange={(e) => setPickupClose(e.target.value)}
            />
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="flex-end" mt={1.5}>
            <Button size="small" onClick={handleClosePickup} sx={{ textTransform: 'none', fontSize: 13 }}>
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleConfirmPickup}
              sx={{ textTransform: 'none', fontSize: 13 }}
            >
              Schedule pickup
            </Button>
          </Stack>
        </Box>
      </Popover>
    </PageWrap>
  );
}

OrdersEbayStyle.propTypes = { isVendor: PropTypes.bool, shops: PropTypes.array };