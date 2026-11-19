'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from '@bprogress/next';
import { useSelector } from 'react-redux';

import { useDispatch } from 'react-redux';
import { setLogout } from 'src/redux/slices/user';
import { resetWishlist } from 'src/redux/slices/wishlist';
import { deleteCookie } from '@/hooks/use-cookies';

import {
  Box,
  Typography,
  Drawer,
  IconButton,
  Avatar,
  Divider,
} from '@mui/material';

import {
  FiUser, FiBox, FiHeart, FiMessageSquare, FiLock, FiShoppingBag,
  FiChevronRight, FiArrowRight, FiArrowDown, FiHeadphones, FiHome, FiLogOut,
} from 'react-icons/fi';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';

import { PATH_PAGE } from 'src/routes/paths';


function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

const pillSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.25,
  cursor: 'pointer',
  bgcolor: '#fff7f3',
  color: '#985444',
  borderRadius: '40px',
  pl: 1.75,
  pr: 1.25,
  py: 0.9,
  transition: 'background-color 0.2s ease',
  '&:hover': {
    bgcolor: '#fbe5dc',
  },
};

const titleSx = {
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '16px',
  color: '#914d40',
  whiteSpace: 'nowrap',
};

const subSx = {
  fontSize: 12,
  lineHeight: '14px',
  color: '#8a7771',
  whiteSpace: 'nowrap',
};

const sectionLabelSx = {
  fontSize: 12.5,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: '#6b7280',
  mt: 3,
  mb: 1,
};

const SHOPPING_ITEMS = [
  { label: 'Orders', sub: 'Track and manage your purchases', icon: FiBox, path: '/profile/orders' },
  { label: 'Wishlist', sub: 'Return to your saved products', icon: FiHeart, path: '/profile/wishlist' },
  { label: 'Product enquiries', sub: 'Review your product conversations', icon: FiMessageSquare, path: '/qouterequest' },
];

const getSettingsItems = (role) => {
  const isAdmin = role === 'admin' || role === 'super-admin';
  const isVendor = role === 'vendor';
  return [
    {
      label: 'Profile & details',
      icon: FiUser,
      path: isAdmin ? '/admin/settings/profile' : isVendor ? '/vendor/settings' : '/profile/general',
    },
    {
      label: 'Change password',
      icon: FiLock,
      path: isAdmin
        ? '/admin/settings/change-password'
        : isVendor
          ? '/vendor/settings/change-password'
          : '/profile/change-password',
    },
  ];
};

function MenuRow({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 1.5,
        mx: -1.5,
        py: item.sub ? 1.5 : 1.75,
        borderRadius: '12px',
        cursor: 'pointer',
        color: active ? '#c74735' : '#1f2328',
        bgcolor: active ? '#fdeee6' : 'transparent',
        '&:hover': { bgcolor: active ? '#fdeee6' : '#faf6f3' },
      }}
    >
      <Icon size={20} style={{ color: active ? '#c74735' : '#6b7280', flexShrink: 0 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 16, color: 'inherit' }}>{item.label}</Typography>
        {item.sub && (
          <Typography sx={{ fontSize: 13.5, color: '#6b7280', mt: 0.25 }}>{item.sub}</Typography>
        )}
      </Box>
      <FiChevronRight size={18} style={{ color: active ? '#c74735' : '#9ca3af' }} />
    </Box>
  );
}

export default function UserSelect() {
  const { user, isAuthenticated } = useSelector(({ user }) => user);

  const router = useRouter();
  const pathname = usePathname();

  const isAuthPath = getKeyByValue(PATH_PAGE.auth, pathname);
  const isHomePath = pathname.slice(3) === '';

  const [openUser, setOpenUser] = React.useState(false);

  const handleOpenUser = () => {
    if (!isAuthenticated) {
      router.push(
        `/auth/sign-in${
          isAuthPath || isHomePath ? '' : `?redirect=${pathname}`
        }`
      );
      return;
    }

    setOpenUser(true);
  };

  const handleCloseUser = () => {
    setOpenUser(false);
  };

  const handleNavigate = (path) => {
    setOpenUser(false);
    router.push(path);
  };

  const bodyRef = React.useRef(null);
const dispatch = useDispatch();

const isAdmin = user?.role === 'admin' || user?.role === 'super-admin';
const isVendor = user?.role === 'vendor';
const isNotUser = isAdmin || isVendor;
const settingsItems = getSettingsItems(user?.role);

const handleLogout = () => {
  deleteCookie('token');
  dispatch(setLogout());
  dispatch(resetWishlist());
  setOpenUser(false);
  setTimeout(() => {
    location.href = '/auth/sign-in';
  }, 1000);
};

const sellerCard = isAdmin
  ? { title: 'Admin dashboard', sub: 'Manage the marketplace', cta: 'Open dashboard', path: '/admin/dashboard' }
  : isVendor
    ? { title: 'Vendor dashboard', sub: 'Manage your store on Wreeo', cta: 'Open dashboard', path: '/vendor/dashboard' }
    : { title: 'Become a seller', sub: 'List your products on Wreeo', cta: 'Start selling', path: '/create-shop' };

  return (
    <>
      {/* Account button */}
      <Box
        onClick={handleOpenUser}
        sx={pillSx}
        role="button"
        tabIndex={0}
        aria-label="Open account menu"
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleOpenUser();
          }
        }}
      >
        <FiUser size={18} />

        <Box>
          <Typography sx={titleSx}>
            {isAuthenticated
              ? `Hello, ${user?.firstName || 'User'}`
              : 'Sign in'}
          </Typography>

          <Typography sx={subSx}>
            {isAuthenticated ? 'My account' : 'Create account'}
          </Typography>
        </Box>

        <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
      </Box>

      {/* Right-side account drawer */}
<Drawer
  anchor="right"
  open={openUser}
  onClose={handleCloseUser}
  PaperProps={{
    sx: {
      width: { xs: '100%', sm: 430, md: 450 },
      maxWidth: '100%',
      bgcolor: '#fff',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-8px 0 35px rgba(0,0,0,0.06)',
    },
  }}
>
  {/* Header */}
  <Box
    sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      px: 3, py: 2.5, borderBottom: '1px solid #eee', flexShrink: 0,
    }}
  >
    <Typography sx={{ fontSize: 32, fontWeight: 500, letterSpacing: '-1px', color: '#111' }}>
      Your account
    </Typography>
    <IconButton
      onClick={handleCloseUser}
      aria-label="Close account drawer"
      sx={{ bgcolor: '#f1f3f5', '&:hover': { bgcolor: '#e6e9ec' } }}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  </Box>

  {/* Scrollable body */}
  <Box ref={bodyRef} sx={{ flex: 1, overflowY: 'auto', px: 3, py: 3, position: 'relative' }}>
    {/* User card */}
    <Box
      onClick={() => handleNavigate(settingsItems[0].path)}
      sx={{
        display: 'flex', alignItems: 'center', gap: 2, p: 2, cursor: 'pointer',
        bgcolor: '#fdf6f1', border: '1px solid #f3e2d8', borderRadius: '12px',
      }}
    >
      <Avatar
        sx={{
          width: 56, height: 56, bgcolor: '#fff', color: '#c74735',
          border: '1px solid #f0d9cc', fontSize: 22, fontWeight: 500,
        }}
      >
        {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
        {user?.lastName?.charAt(0)?.toUpperCase() || ''}
      </Avatar>
      <Box>
        <Typography sx={{ fontSize: 22, color: '#1f2328' }}>
          Hello, {user?.firstName || 'User'}
        </Typography>
        <Typography sx={{ fontSize: 15, color: '#8a6f63', mt: 0.25 }}>View profile</Typography>
      </Box>
    </Box>

    {/* Shopping activity (normal users only) */}
    {!isNotUser && (
      <>
        <Typography sx={sectionLabelSx}>Shopping activity</Typography>
        {SHOPPING_ITEMS.map((item) => (
          <MenuRow
            key={item.label}
            item={item}
            active={pathname.includes(item.path)}
            onClick={() => handleNavigate(item.path)}
          />
        ))}
        <Divider sx={{ my: 2.5, borderColor: '#eee' }} />
      </>
    )}

    {/* Account settings */}
    <Typography sx={{ ...sectionLabelSx, mt: isNotUser ? 3 : 0 }}>Account settings</Typography>
    {settingsItems.map((item) => (
      <MenuRow
        key={item.label}
        item={item}
        active={pathname.includes(item.path)}
        onClick={() => handleNavigate(item.path)}
      />
    ))}

    {/* Seller / dashboard card */}
    <Box
      sx={{
        mt: 4, p: 2, bgcolor: '#fcece3', border: '1px solid #f0c4b2', borderRadius: '14px',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 46, height: 46, borderRadius: '12px', bgcolor: '#e07050',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <FiShoppingBag size={22} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: 18, color: '#3d2b25' }}>{sellerCard.title}</Typography>
          <Typography sx={{ fontSize: 14, color: '#8a6f63' }}>{sellerCard.sub}</Typography>
        </Box>
      </Box>
      <Divider sx={{ my: 1.75, borderColor: '#f0c4b2' }} />
      <Box
        onClick={() => handleNavigate(sellerCard.path)}
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', color: '#c74735', fontSize: 16,
        }}
      >
        {sellerCard.cta} <FiArrowRight size={20} />
      </Box>
    </Box>
  </Box>

  {/* Footer */}
  <Box sx={{ flexShrink: 0, bgcolor: '#fafafa', borderTop: '1px solid #eee', px: 3, position: 'relative' }}>
    <Box
      onClick={() => handleNavigate('/support')}
      sx={{
        display: 'flex', alignItems: 'center', gap: 2, py: 2, cursor: 'pointer',
        color: '#4b5563', borderBottom: '1px solid #eaeaea',
      }}
    >
      <FiHeadphones size={20} />
      <Typography sx={{ flex: 1, fontSize: 16, color: 'inherit' }}>Help & support</Typography>
      <FiChevronRight size={18} style={{ color: '#9ca3af' }} />
    </Box>

    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
      <Box
        onClick={() => handleNavigate('/')}
        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', color: '#4b5563' }}
      >
        <FiHome size={20} />
        <Typography sx={{ fontSize: 16, color: 'inherit' }}>Back to marketplace</Typography>
      </Box>

      <IconButton
        aria-label="Scroll down"
        onClick={() => bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' })}
        sx={{
          position: 'absolute', left: '50%', top: -22, transform: 'translateX(-50%)',
          bgcolor: '#fff', border: '1px solid #e5e7eb',
          '&:hover': { bgcolor: '#f5f5f5' },
        }}
      >
        <FiArrowDown size={18} />
      </IconButton>

      <Box
        onClick={handleLogout}
        sx={{ display: 'flex', alignItems: 'center', gap: 1.25, cursor: 'pointer', color: '#4b5563' }}
      >
        <FiLogOut size={20} />
        <Typography sx={{ fontSize: 16, color: 'inherit' }}>Sign out</Typography>
      </Box>
    </Box>
  </Box>
</Drawer>
    </>
  );
}