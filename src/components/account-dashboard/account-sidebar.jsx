'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Avatar,
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from '@mui/material';

import {
  MdDashboard,
  MdShoppingBag,
  MdLocalShipping,
  MdChatBubbleOutline,
  MdFavoriteBorder,
  MdShoppingCart,
  MdManageAccounts,
  MdLogout,
  MdLanguage,
  MdHelpOutline
} from 'react-icons/md';

import { useDispatch, useSelector } from 'react-redux';
import { setLogout } from 'src/redux/slices/user';
import { resetWishlist } from 'src/redux/slices/wishlist';
import { deleteCookie } from '@/hooks/use-cookies';

const primaryItems = [
  { label: 'Overview', path: '/profile', icon: <MdDashboard size={20} /> },
  { label: 'My orders', path: '/profile/orders', icon: <MdShoppingBag size={20} /> },
  { label: 'Order tracking', path: '/profile/orders', icon: <MdLocalShipping size={20} /> },
  { label: 'Messages', path: '/support', icon: <MdChatBubbleOutline size={20} /> },
  { label: 'Wishlist', path: '/profile/wishlist', icon: <MdFavoriteBorder size={20} /> },
  { label: 'Cart', path: '/cart', icon: <MdShoppingCart size={20} /> },
  { label: 'Account settings', path: '/profile/general', icon: <MdManageAccounts size={20} /> }
];

export default function AccountSidebar({ onNavigate }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.user);

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.name ||
    'My Account';

  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  const navigate = (path) => {
    router.push(path);
    onNavigate?.();
  };

  const logout = () => {
    deleteCookie('token');
    dispatch(setLogout());
    dispatch(resetWishlist());
    router.push('/');
    onNavigate?.();
  };

  const isActive = (item) => {
    if (item.label === 'Order tracking') return false;
    if (item.path === '/profile') return pathname === '/profile';
    if (item.path === '/support') return pathname === '/support' || pathname.startsWith('/support/');
    return pathname === item.path || pathname.startsWith(`${item.path}/`);
  };

  const renderItem = (item) => {
    const active = isActive(item);

    return (
      <ListItemButton
        key={item.label}
        selected={active}
        onClick={() => navigate(item.path)}
        sx={{
          minHeight: 46,
          px: 1.5,
          mb: 0.5,
          borderRadius: '12px',
          color: active ? '#29333D' : '#667586',
          '& .MuiListItemIcon-root': {
            color: active ? '#29333D' : '#728091'
          },
          '&.Mui-selected': {
            bgcolor: '#EDF1F4',
            '&:hover': { bgcolor: '#E5EAEE' }
          },
          '&:hover': { bgcolor: '#F5F7F9' }
        }}
      >
        <ListItemIcon sx={{ minWidth: 30 }}>
          {item.icon}
        </ListItemIcon>

        <ListItemText
          primary={item.label}
          primaryTypographyProps={{
            fontSize: 13.5,
            fontWeight: active ? 700 : 400,
            noWrap: true
          }}
        />
      </ListItemButton>
    );
  };

  return (
    <Box
     sx={{
  width: '100%',
  bgcolor: '#FFFFFF',
  border: 'none',
  borderRadius: 0,
  p: 0,
  overflow: 'hidden'
}}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, mb: 2 }}>
        <Avatar
          src={user?.avatar?.url || user?.avatar || undefined}
          sx={{
            width: 44,
            height: 44,
            bgcolor: '#EDF1F4',
            color: '#647483',
            fontSize: 14,
            fontWeight: 700
          }}
        >
          {initials || 'U'}
        </Avatar>

        <Box sx={{ minWidth: 0 }}>
          <Typography fontSize={14} fontWeight={700} color="#29333D" noWrap>
            {fullName}
          </Typography>

          <Typography fontSize={12} color="#718096" sx={{ mt: 0.4 }}>
            Buyer account
          </Typography>
        </Box>
      </Box>

      <Typography
        sx={{
          px: 1.2,
          mb: 1,
          color: '#82909F',
          fontSize: 11,
          letterSpacing: 0.8,
          fontWeight: 600
        }}
      >
        MY ACCOUNT
      </Typography>

      <List disablePadding>
        {primaryItems.map(renderItem)}
      </List>

      <Divider sx={{ my: 2, borderColor: '#E7EBEF' }} />

      <List disablePadding>
        {renderItem({
          label: 'Delivery & preferences',
          path: '/profile/general',
          icon: <MdLanguage size={20} />
        })}

        {renderItem({
          label: 'Help & support',
          path: '/support',
          icon: <MdHelpOutline size={20} />
        })}

        <ListItemButton
          onClick={logout}
          sx={{
            minHeight: 46,
            px: 1.5,
            mt: 0.5,
            borderRadius: '12px',
            color: '#B94E37',
            '&:hover': { bgcolor: '#FFF3EF' }
          }}
        >
          <ListItemIcon sx={{ minWidth: 30, color: '#B94E37' }}>
            <MdLogout size={20} />
          </ListItemIcon>

          <ListItemText
            primary="Logout"
            primaryTypographyProps={{ fontSize: 13.5 }}
          />
        </ListItemButton>
      </List>
    </Box>
  );
}