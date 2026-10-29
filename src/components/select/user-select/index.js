'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from '@bprogress/next';
import { useSelector } from 'react-redux';

import {
  Box,
  Typography,
  Drawer,
  IconButton,
  Avatar,
  Divider,
} from '@mui/material';

import { FiUser, FiPackage, FiHeart, FiMessageCircle, FiSettings } from 'react-icons/fi';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';

import { PATH_PAGE } from 'src/routes/paths';
import { UserList } from 'src/components/lists';

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

const drawerItemSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  width: '100%',
  px: 0,
  py: 1.6,
  color: '#353a40',
  cursor: 'pointer',
  borderRadius: 1,
  '&:hover': {
    bgcolor: '#f8f6f4',
  },
};

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
            width: {
              xs: '100%',
              sm: 430,
              md: 450,
            },
            maxWidth: '100%',
            bgcolor: '#ffffff',
            boxShadow: '-8px 0 35px rgba(0,0,0,0.06)',
          },
        }}
      >
        {/* Drawer header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            px: 3,
            pt: 3.5,
            pb: 2.5,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 27,
                fontWeight: 700,
                letterSpacing: '-0.8px',
                color: '#292f35',
              }}
            >
              Your account
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                color: '#858b91',
              }}
            >
              The details that make your wreeo yours.
            </Typography>
          </Box>

          <IconButton
            onClick={handleCloseUser}
            aria-label="Close account drawer"
            size="small"
            sx={{
              bgcolor: '#f6f7f8',
              '&:hover': {
                bgcolor: '#eceeef',
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* User information */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.75,
            px: 3,
            py: 1.5,
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: '#edf0f2',
              color: '#707983',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
            {user?.lastName?.charAt(0)?.toUpperCase() || ''}
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 19,
                fontWeight: 650,
                color: '#30363b',
              }}
            >
              Hello, {user?.firstName || 'User'}
            </Typography>

            <Typography
              sx={{
                fontSize: 13,
                color: '#858b91',
              }}
            >
              Your account
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mx: 3, my: 1, borderColor: '#f0f0f0' }} />

        {/* Existing account actions and logout */}
        <Box sx={{ px: 3, pt: 1 }}>
          <UserList
            openUser={openUser}
            isAuthenticated={isAuthenticated}
            user={user}
            setOpen={handleCloseUser}
          />
        </Box>
      </Drawer>
    </>
  );
}