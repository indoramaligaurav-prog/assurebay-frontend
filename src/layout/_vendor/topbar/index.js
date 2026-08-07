'use client';
import React from 'react';
import PropTypes from 'prop-types';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

import { useRouter } from '@bprogress/next';

// mui
import {
  styled,
  useMediaQuery,
  Toolbar,
  IconButton,
  Skeleton,
  Stack,
  useTheme,
  alpha,
  Box,
} from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';

// icons
import { LuLayoutDashboard } from 'react-icons/lu';
import { BsReceipt, BsCart3, BsCreditCard, BsEnvelope } from 'react-icons/bs';
import { HiOutlineChartBar } from 'react-icons/hi2';
import { MdOutlineCampaign } from 'react-icons/md';

// components
import Logo from '@/components/logo';
import Search from 'src/components/search';

// dynamic imports
const UserSelect = dynamic(() => import('@/components/select/user-select'), {
  ssr: false,
  loading: () => <Skeleton variant="circular" width={50} height={50} />
});

// ─── Nav links (defined once, outside the component) ───────────────────────
const navlinks = [
  { id: 1, title: 'Dashboard',      slug: 'dashboard',      icon: <LuLayoutDashboard />, isSearch: false },
  { id: 2, title: 'Listings',       slug: 'products',       icon: <BsReceipt />,         isSearch: true  },
  { id: 3, title: 'Orders',         slug: 'orders',         icon: <BsCart3 />,           isSearch: true  },
  { id: 4, title: 'Payments',       slug: 'payments',       icon: <BsCreditCard />,      isSearch: true  },
  { id: 5, title: 'Analytics',      slug: 'shop',           icon: <HiOutlineChartBar />, isSearch: false },
  { id: 6, title: 'Messages',       slug: 'qouterequest',   icon: <BsEnvelope />,        isSearch: false },
  { id: 7, title: 'Advertisements', slug: 'advertisements', icon: <MdOutlineCampaign />, isSearch: false },
];

// ─── Styled AppBar ──────────────────────────────────────────────────────────
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open'
})(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
  backgroundColor: alpha(theme.palette.background.default, 0.72),
  borderBottom: '1px solid ' + theme.palette.divider,
}));

// ─── Component ─────────────────────────────────────────────────────────────
export default function Topbar({ open, handleDrawerToggle, branding }) {
  const theme   = useTheme();
  const router  = useRouter();
  const pathname = usePathname();

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Determine whether the active page has a search bar
  const activeLink = navlinks.find((v) => pathname === '/vendor/' + v.slug);
  const isSearch   = Boolean(activeLink?.isSearch);

  return (
    <>
<AppBar
  position="static"   // 👈 change from sticky to static
  open={open}
  sx={{
    borderRadius: 0,
    boxShadow: 'none',
    zIndex: 999,
    top: 0,
  }}
>
        <Toolbar sx={{ justifyContent: 'center' }}>

          {/* ── Left: logo + hamburger (mobile) + search ── */}
          {/* <Stack direction="row" alignItems="center">
            <IconButton
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              edge="start"
              size="small"
              sx={{ display: { xs: 'flex', md: 'none' } }}
            >
              <Logo small branding={branding} />
            </IconButton>

            {!isMobile && <Logo small branding={branding} />}
            {isSearch && <Search />}
          </Stack> */}

          {/* ── Centre: desktop nav links ── */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 2,
              ml: 4,
            }}
          >
            {navlinks.map((item) => {
              const active = pathname === '/vendor/' + item.slug;
              return (
                <Box
                  key={item.slug}
                  onClick={() => router.push('/vendor/' + item.slug)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                    px: 2,
                    py: 1,
                    borderRadius: '8px',
                    transition: '0.2s',
                    color: active ? 'primary.main' : 'text.primary',
                    bgcolor: active ? 'rgba(25,118,210,0.1)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' },
                  }}
                >
                  {item.icon}
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>
                    {item.title}
                  </span>
                </Box>
              );
            })}
          </Box>

          {/* ── Right: user avatar ── */}
          {/* <Stack direction="row" alignItems="center" gap={1}>
            <UserSelect />
          </Stack> */}
        </Toolbar>
      </AppBar>

      {/* ── Mobile bottom navigation ── */}
      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          height: 60,
          bgcolor: '#fff',
          borderTop: '1px solid #e0e0e0',
          zIndex: 1300,
          justifyContent: 'space-around',
          alignItems: 'center',
          boxShadow: '0 -4px 10px rgba(0,0,0,0.08)',
        }}
      >
        {navlinks.map((item) => {
          const active = pathname === '/vendor/' + item.slug;
          return (
            <Box
              key={item.slug}
              onClick={() => router.push('/vendor/' + item.slug)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                cursor: 'pointer',
                color: active ? 'primary.main' : 'text.secondary',
              }}
            >
              <Box sx={{ fontSize: 20 }}>{item.icon}</Box>
              {item.title}
            </Box>
          );
        })}
      </Box>
    </>
  );
}

Topbar.propTypes = {
  open: PropTypes.bool.isRequired,
  handleDrawerToggle: PropTypes.func.isRequired,
};