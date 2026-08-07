'use client';
import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { enUS } from 'date-fns/locale';

// MUI
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Chip,
  Select,
  MenuItem,
  Alert,
  Skeleton,
  Tooltip,
  Menu,
  Divider,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from '@mui/material';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import TuneIcon from '@mui/icons-material/Tune';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import * as api from 'src/services';
import { updateProductStatus } from 'src/services';
import { fDateShort } from '@/utils/format-time';
import { getAssetUrl } from '@/utils/getAssetUrl';
import { useCurrencyFormat } from '@/hooks/use-currency-format';

import { currencyConfig } from "@/utils/currency";

import { useSelector } from 'react-redux';

import CreateListingModal from '@/components/forms/product/create-listing-modal'; // adjust path to match your alias

// ─── Sidebar ────────────────────────────────────────────────────────────────

const SIDEBAR_LISTING = [
  { label: 'Active', param: '' },
  { label: 'Inactive', param: 'inactive' },
  { label: 'Drafts', param: 'draft' },
  { label: 'Scheduled', param: 'scheduled' },
  { label: 'Rejected', param: 'reject' },
];

const SIDEBAR_SETTINGS = [
  { label: 'Selling preferences' },
  { label: 'Listing templates' },
  { label: 'Business policies' },
];

function Sidebar({ activeTab, onTabChange, collapsed, onCollapse }) {
  return (
    <Box
      sx={{
        width: collapsed ? 0 : 200,
        minWidth: collapsed ? 0 : 200,
        overflow: 'hidden',
        transition: 'width 0.2s, min-width 0.2s',
        borderRight: '1px solid #e0e0e0',
        bgcolor: '#fff',
        flexShrink: 0,
      }}
    >
      <Box sx={{ p: 0 }}>
        {/* Collapse button */}
        <ListItemButton
          onClick={onCollapse}
          sx={{
            py: 1,
            px: 2,
            gap: 1,
            fontSize: 13,
            color: '#555',
            '&:hover': { bgcolor: '#f5f5f5' },
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: 18 }} />
          <Typography variant="body2">Collapse</Typography>
        </ListItemButton>

        <Divider />

        {/* Listing status links */}
        <List disablePadding>
          {SIDEBAR_LISTING.map((item) => (
            <ListItemButton
              key={item.label}
              selected={activeTab === item.label}
              onClick={() => onTabChange(item)}
              sx={{
                py: 0.75,
                px: 2.5,
                fontSize: 14,
                bgcolor: activeTab === item.label ? '#e5efff !important' : 'transparent',
                borderLeft: activeTab === item.label ? '3px solid #3665f3' : '3px solid transparent',
                fontWeight: activeTab === item.label ? 700 : 400,
                '& .MuiListItemText-primary': {
                  fontSize: 14,
                  fontWeight: activeTab === item.label ? 700 : 400,
                  color: activeTab === item.label ? '#3665f3' : '#333',
                },
              }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>

        <Divider sx={{ my: 1 }} />

        {/* Settings links */}
        {/* <List disablePadding>
          {SIDEBAR_SETTINGS.map((item) => (
            <ListItemButton
              key={item.label}
              sx={{
                py: 0.75,
                px: 2.5,
                '& .MuiListItemText-primary': { fontSize: 14, color: '#333' },
              }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List> */}
      </Box>
    </Box>
  );
}

// ─── Product Row ─────────────────────────────────────────────────────────────

function EbayProductRow({ row, isLoading, isSelected, onSelect, isVendor }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fCurrency = useCurrencyFormat('base');

  const { mutate: toggleStatus, isPending } = useMutation({
    mutationFn: ({ id, status }) => updateProductStatus(id, status),
    onSuccess: () => {
      toast.success('Product status updated');
      queryClient.invalidateQueries(['products']);
    },
    onError: () => toast.error('Failed to update product status'),
  });

const imgSrc = getAssetUrl(row?.image);

const price = row?.mrp;
const discountPrice = row?.discountPrice;

  const stock = row?.hasVariations
    ? row?.variations?.reduce((sum, v) => sum + v.stock, 0)
    : row?.stock;

  const sku = row?.sku || row?.variations?.[0]?.sku || '—';

  const stockLabel =
    stock < 1 ? 'Out of stock' : stock < 10 ? `Low (${stock})` : stock;

  const stockColor =
    stock < 1 ? '#d32f2f' : stock < 10 ? '#ed6c02' : '#2e7d32';

    const user = useSelector((state) => state.user.user);

const country = user?.zone?.country || 'US';

const currencySymbol =
  currencyConfig[country]?.symbol || '$';



  if (isLoading) {
    return (
      <TableRow>
        {[...Array(8)].map((_, i) => (
          <TableCell key={i}><Skeleton /></TableCell>
        ))}
      </TableRow>
    );
  }

  return (
    <TableRow
      hover
      selected={isSelected}
      sx={{
        '&:hover': { bgcolor: '#f9f9f9' },
        '&.Mui-selected': { bgcolor: '#e8f0fe' },
        borderBottom: '1px solid #e0e0e0',
      }}
    >
      {/* Checkbox + Actions */}
      <TableCell sx={{ width: 160, whiteSpace: 'nowrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Checkbox
            size="small"
            checked={isSelected}
            onChange={() => onSelect(row._id)}
          />
          <Tooltip title={row.status === 'pending' ? 'Pending approval — editing disabled' : 'Edit'}>
  <span>
    <IconButton
      size="small"
      disabled={row.status === 'pending'}
      onClick={() => router.push(`/vendor/products/${row.slug || row._id}`)}
    >
      <EditIcon sx={{ fontSize: 16 }} />
    </IconButton>
  </span>
</Tooltip>
        
        </Box>
      </TableCell>

      {/* Item */}
      <TableCell sx={{ maxWidth: 280 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {imgSrc ? (
            <Box
              component="img"
              src={imgSrc}
              alt={row.title}
              sx={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 1, border: '1px solid #e0e0e0', flexShrink: 0 }}
            />
          ) : (
            <Box
              sx={{
                width: 48, height: 48, bgcolor: '#f5f5f5',
                borderRadius: 1, border: '1px solid #e0e0e0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontSize: 10, color: '#aaa',
              }}
            >
              No img
            </Box>
          )}
          <Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: '#3665f3',
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' },
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.35,
                fontSize: 13,
              }}
            
            >
              {row.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
              ID: {row._id?.slice(-8)?.toUpperCase()}
            </Typography>
          </Box>
        </Box>
      </TableCell>

      {/* Custom label (SKU) */}
      <TableCell sx={{ fontSize: 13, color: '#555', whiteSpace: 'nowrap' }}>
        {sku}
      </TableCell>

      {/* Current price */}
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>
          {currencySymbol}{price ? price.toFixed(2) : '-'}
        </Typography>
      </TableCell>

      {/* Discounts */}
      <TableCell sx={{ fontSize: 13, color: '#555' }}>
        {currencySymbol}{discountPrice ? discountPrice.toFixed(2) : '-'}
      </TableCell>

      {/* Available quantity */}
      <TableCell>
        <Typography variant="body2" sx={{ fontSize: 13, color: stockColor, fontWeight: 500 }}>
          {stockLabel}
        </Typography>
      </TableCell>

      {/* Views (30 days) – static placeholder */}
      <TableCell sx={{ fontSize: 13, color: '#555', textAlign: 'center' }}>
              {row?.views}
      </TableCell>

              <TableCell>
  <Chip
    label={row.status}
    size="small"
    sx={{
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'capitalize',
      bgcolor:
        row.status === 'published' ? '#e8f5e9' :
        row.status === 'pending'   ? '#fff8e1' :
        row.status === 'draft'     ? '#f5f5f5' : '#fce4ec',
      color:
        row.status === 'published' ? '#2e7d32' :
        row.status === 'pending'   ? '#f57c00' :
        row.status === 'draft'     ? '#555'    : '#c62828',
    }}
  />
</TableCell>
      
    </TableRow>
  );
}

// ─── Sort Header Cell ────────────────────────────────────────────────────────

function SortCell({ label, tooltip }) {
  return (
    <TableCell
      sx={{
        fontWeight: 600,
        fontSize: 12,
        color: '#333',
        whiteSpace: 'nowrap',
        bgcolor: '#f5f5f5',
        borderBottom: '2px solid #e0e0e0',
        py: 1,
        userSelect: 'none',
        cursor: 'pointer',
        '&:hover': { bgcolor: '#ebebeb' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
        {label}
        <UnfoldMoreIcon sx={{ fontSize: 14, color: '#999' }} />
        {tooltip && <InfoOutlinedIcon sx={{ fontSize: 13, color: '#999' }} />}
      </Box>
    </TableCell>
  );
}

// ─── Dropdown Button ─────────────────────────────────────────────────────────

function DropdownButton({ label, disabled, variant = 'outlined' }) {
  return (
    <Button
      variant={variant}
      size="small"
      disabled={disabled}
      endIcon={<KeyboardArrowDownIcon />}
      sx={{
        textTransform: 'none',
        fontSize: 13,
        borderRadius: '20px',
        borderColor: '#c7c7c7',
        color: disabled ? '#aaa' : '#333',
        bgcolor: '#fff',
        '&:hover': { borderColor: '#333', bgcolor: '#f5f5f5' },
        px: 2,
        height: 34,
        fontWeight: variant === 'contained' ? 700 : 400,
      }}
    >
      {label}
    </Button>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminProductsMain({ brands, categories, shops, isVendor }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('Active');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [apicall] = useState(false);

    const [openCreateModal, setOpenCreateModal] = useState(false);

  const { data, isPending: isLoading } = useQuery({
    queryKey: ['admin-products', apicall, searchParams.toString(), isVendor],
    queryFn: () =>
      api[isVendor ? 'getProductsByVendor' : 'getProductsByAdmin'](
        searchParams.toString()
      ),
  });

  const rows = data?.products || data?.data || data || [];

  const tabStatusMap = {
    Active: 'published',
    Inactive: 'pending',
    Drafts: 'draft',
    Scheduled: 'scheduled',
    Rejected: 'reject',
  };


const statusFilteredRows = rows.filter((row) => {
  const expectedStatus = tabStatusMap[activeTab];
  return expectedStatus ? row.status === expectedStatus : true;
});

// Filter by search term
const filteredRows = statusFilteredRows.filter((r) =>
  searchTerm
    ? r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r._id?.toLowerCase().includes(searchTerm.toLowerCase())
    : true
);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(filteredRows.map((r) => r._id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const allSelected =
    filteredRows.length > 0 && selected.length === filteredRows.length;
  const someSelected = selected.length > 0 && !allSelected;







  const tabLabel = activeTab === 'Active' ? 'active' : activeTab.toLowerCase();

  return (
    <Box sx={{ display: 'flex', minHeight: '100%', bgcolor: '#fff', fontFamily: '"Market Sans", Arial, sans-serif' }}>
      {/* ── Sidebar ── */}
      {!sidebarCollapsed && (
        <Sidebar
          activeTab={activeTab}
          onTabChange={(item) => setActiveTab(item.label)}
          collapsed={sidebarCollapsed}
          onCollapse={() => setSidebarCollapsed(true)}
        />
      )}

      {/* ── Main Content ── */}
      <Box sx={{ flex: 1, minWidth: 0, p: 0 }}>

        {/* ── Header row ── */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            pt: 2.5,
            pb: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {sidebarCollapsed && (
              <IconButton size="small" onClick={() => setSidebarCollapsed(false)}>
                <TuneIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, fontSize: 22, color: '#111' }}
            >
              Manage {tabLabel} listings
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateModal(true)}
            sx={{
              bgcolor: '#3665f3',
              textTransform: 'none',
              borderRadius: '20px',
              fontWeight: 700,
              fontSize: 14,
              px: 2.5,
              height: 38,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#2a52c9', boxShadow: 'none' },
            }}
          >
            Create listing
          </Button>
        </Box>

        <Divider />

        {/* ── Warning Banner ── */}
        {/* <Box sx={{ px: 3, pt: 2 }}>
          <Alert
            severity="error"
            icon={<WarningAmberIcon fontSize="small" />}
            sx={{
              fontSize: 13,
              bgcolor: '#fff8e1',
              border: '1px solid #ffe082',
              color: '#5f4000',
              borderRadius: 1,
              py: 0.75,
              '& .MuiAlert-icon': { color: '#f57c00' },
            }}
          >
            Until your payment account is verified, you may be unable to receive
            payouts for sold items and create new listings.{' '}
            <Box
              component="span"
              sx={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}
            >
              Update account details
            </Box>
          </Alert>
        </Box> */}

        {/* ── Search + Controls ── */}
        <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <TextField
              size="small"
              placeholder="Search by title, SKU, or item number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: '#666' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: 320,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '20px',
                  fontSize: 13,
                  height: 36,
                  bgcolor: '#fff',
                },
              }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* <Typography
                component="span"
                sx={{ fontSize: 13, color: '#555', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              >
                Customize table
              </Typography>
              <Typography sx={{ color: '#ccc' }}>|</Typography> */}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography
                  component="span"
                  sx={{ fontSize: 13, color: '#555', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                >
                  Download
                </Typography>
                <KeyboardArrowDownIcon sx={{ fontSize: 16, color: '#555' }} />
              </Box>
              <Typography sx={{ color: '#ccc' }}>|</Typography>

              <Typography
                component="span"
                sx={{ fontSize: 13, color: '#555', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              >
                Upload
              </Typography>
            </Box>
          </Box>

          {/* Results count + action buttons */}
          {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1.5 }}>
            <Typography variant="body2" sx={{ fontSize: 13, mr: 0.5 }}>
              <strong>Results:</strong> {isLoading ? '…' : filteredRows.length}
            </Typography>

            <DropdownButton label="Edit" variant="outlined" disabled={selected.length === 0} />
            <Button
              variant="outlined"
              size="small"
              disabled
              sx={{
                textTransform: 'none',
                fontSize: 13,
                borderRadius: '20px',
                borderColor: '#c7c7c7',
                color: '#aaa',
                height: 34,
                px: 2,
              }}
            >
              Sell similar
            </Button>
            <DropdownButton label="Actions" disabled={selected.length === 0} />
            <DropdownButton label="Sell it faster" disabled={selected.length === 0} />
          </Box> */}
        </Box>

        {/* ── Table ── */}
        <Box sx={{ px: 3, pb: 3 }}>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}
          >
            <Table size="small" sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  {/* Select-all + Actions header */}
                  <TableCell
                    sx={{
                      bgcolor: '#f5f5f5',
                      borderBottom: '2px solid #e0e0e0',
                      fontWeight: 600,
                      fontSize: 12,
                      width: 160,
                      py: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Checkbox
                        size="small"
                        indeterminate={someSelected}
                        checked={allSelected}
                        onChange={handleSelectAll}
                      />
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#333' }}>
                        Actions
                      </Typography>
                    </Box>
                  </TableCell>

                  <SortCell label="Item" />
                  <SortCell label="Custom label (SKU)" />
                  <SortCell label="Mrp" />
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: 12,
                      color: '#333',
                      bgcolor: '#f5f5f5',
                      borderBottom: '2px solid #e0e0e0',
                      py: 1,
                    }}
                  >
                    Discounts
                  </TableCell>
                  <SortCell label="Available quantity" />
                  <SortCell label="Views (30 days)" tooltip />
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: 12,
                      color: '#333',
                      bgcolor: '#f5f5f5',
                      borderBottom: '2px solid #e0e0e0',
                      py: 1,
                    }}
                  >
                     Status
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(8)].map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <Box
                        sx={{
                          textAlign: 'center',
                          py: 8,
                          color: '#555',
                          fontSize: 14,
                        }}
                      >
                        Looks like you don&apos;t have any {tabLabel} listings.
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((row) => (
                    <EbayProductRow
                      key={row._id}
                      row={row}
                      isLoading={false}
                      isSelected={selected.includes(row._id)}
                      onSelect={handleSelect}
                      isVendor={isVendor}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ── Footer: Items per page ── */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              mt: 2,
              gap: 1,
            }}
          >
            <Typography variant="body2" sx={{ fontSize: 13, color: '#555' }}>
              Items per page
            </Typography>
            <Select
              size="small"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(e.target.value)}
              sx={{
                fontSize: 13,
                height: 32,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#c7c7c7' },
              }}
            >
              {[25, 50, 100, 200].map((n) => (
                <MenuItem key={n} value={n} sx={{ fontSize: 13 }}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Box>
      </Box>

        <CreateListingModal
          open={openCreateModal}
          onClose={() => setOpenCreateModal(false)}
          isVendor={isVendor}
        />

    </Box>
  );
}

AdminProductsMain.propTypes = {
  brands: PropTypes.array,
  categories: PropTypes.array,
  shops: PropTypes.array,
  isVendor: PropTypes.bool,
};

AdminProductsMain.defaultProps = {
  brands: [],
  categories: [],
  shops: [],
  isVendor: false,
};