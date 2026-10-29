'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import {
  Stack,
  AppBar,
  useMediaQuery,
  Container,
  Box,
  Typography,
  Button,
  Menu,
  MenuItem,
  Popover,
  IconButton,
  Divider,
} from '@mui/material';
import NextLink from 'next/link';
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// components
import Logo from '@/components/logo';
import WishlistWidget from '@/components/widgets/wishlist';
import CartWidget from '@/components/widgets/cart';
import UserSelect from '@/components/select/user-select';
import ShippingCurrencyDialog from '@/components/dialog/Shippingcurrencydialog';
import { useDispatch } from '@/redux';
import { setCurrency } from '@/redux/slices/currency';
import MessagesWidget from '@/components/widgets/messages';

import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
// data + hooks
import countries from '@/data/countries.json';
import { useGeoPrefs } from '@/hooks/useGeoPrefs';

const MobileBar = dynamic(() => import('@/layout/_main/mobile-bar'));

export default function Navbar({ branding, categories = [] }) {
  const { checkout } = useSelector(({ product }) => product);
  const isMobile = useMediaQuery('(max-width:992px)');



  // ── geo-aware prefs ────────────────────────────────────────────────────────
  const { prefs, loading: detecting, savePrefs } = useGeoPrefs(countries);

  // ── dialog ─────────────────────────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const dispatch = useDispatch();

  const handleDialogClose = (result) => {
    setDialogOpen(false);
    if (result) {
    savePrefs({ currency: result.currency });
    dispatch(setCurrency(result.currency));
    }
  };

const [anchorEl, setAnchorEl] = React.useState(null);
const [activeCategory, setActiveCategory] = React.useState(null);

const handleOpenCategories = (event) => {
  setAnchorEl(event.currentTarget);

  if (categories?.length) {
    setActiveCategory((previous) => previous || categories[0]);
  }
};

const handleCloseCategories = () => {
  setAnchorEl(null);
  setActiveCategory(null);
};


   // ── header: scrolls away normally, slides back in smoothly on scroll up ────
  const [mode, setMode] = React.useState('static'); // 'static' | 'floating' | 'hidden'
  const [shown, setShown] = React.useState(false);
  const [headerH, setHeaderH] = React.useState(0);
  const barRef = React.useRef(null);
  const modeRef = React.useRef('static');

  const changeMode = (m) => {
    if (modeRef.current !== m) {
      modeRef.current = m;
      setMode(m);
    }
  };

  // placeholder height so the page never jumps
  React.useEffect(() => {
    const el = barRef.current;
    if (!el) return;

    const DUR = 600;
    const EASING = 'cubic-bezier(.22,1,.36,1)';
    const SHADOW = '0 4px 18px #63351c14';
    let mode = 'follow'; // 'follow' | 'show' | 'hide'
    let anim = null;
    let lastY = Math.max(window.scrollY, 0);
    let ticking = false;

    const setStyle = (t, o, s) => {
      el.style.transform = `translateY(${t})`;
      el.style.opacity = o;
      el.style.boxShadow = s;
    };

    const stop = () => {
      if (anim) {
        try { anim.commitStyles(); } catch (e) {}
        anim.cancel();
        anim = null;
      }
    };

    const follow = (y) => {
      if (mode !== 'follow') { stop(); mode = 'follow'; }
      setStyle(`${-Math.min(y, el.offsetHeight)}px`, '1', 'none');
    };

    const show = () => {
      stop();
      mode = 'show';
      setStyle('0px', '1', SHADOW);
      anim = el.animate(
        [
          { transform: 'translateY(-100%)', opacity: 0 },
          { transform: 'translateY(0)', opacity: 1 }
        ],
        { duration: DUR, easing: EASING }
      );
    };

    const hide = () => {
      stop();
      mode = 'hide';
      anim = el.animate(
        [{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-100%)', opacity: 0 }],
        { duration: DUR * 0.7, easing: EASING }
      );
      anim.onfinish = () => setStyle('-100%', '0', 'none');
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = Math.max(window.scrollY, 0);
        const diff = y - lastY;
        const h = el.offsetHeight;

        if (mode === 'follow') {
          if (diff < -6 && y > h) show();
          else follow(y);
        } else if (mode === 'show') {
          if (y <= 0) follow(0);
          else if (diff > 6) hide();
        } else if (diff < -6) {
          show();
        } else if (y <= 0) {
          follow(0);
        }

        if (Math.abs(diff) > 6) lastY = y;
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      stop();
    };
  }, []);

  // mount off-screen first, then slide in on the next tick
  React.useEffect(() => {
    if (mode === 'floating') {
      const t = setTimeout(() => setShown(true), 20);
      return () => clearTimeout(t);
    }
    setShown(false);
  }, [mode]);

  React.useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const diff = y - lastY;
        const h = barRef.current?.offsetHeight || 0;

        if (y <= 0) changeMode('static');
        else if (diff > 6) {
          if (modeRef.current === 'floating') changeMode('hidden'); // scrolling down
        } else if (diff < -6) {
          if (modeRef.current === 'hidden') changeMode('floating'); // scrolling up
          else if (modeRef.current === 'static' && y > h) changeMode('floating');
        }

        if (Math.abs(diff) > 6) lastY = y;
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Trigger button label: show flag + currency once resolved
  const currencyLabel = prefs?.currency ?? '···';

  return (
    <>
            <Box sx={{ height: headerH || 'auto' }}>
            <AppBar
        ref={barRef}
        position={mode === 'static' ? 'relative' : 'fixed'}
        elevation={0}
        sx={{
          top: 0,
          background: '#fff',
          color: '#292322',
          transform: mode === 'static' ? 'none' : shown ? 'translateY(0)' : 'translateY(-100%)',
          opacity: mode === 'static' ? 1 : shown ? 1 : 0,
          pointerEvents: mode !== 'static' && !shown ? 'none' : 'auto',
          boxShadow: mode !== 'static' && shown ? '0 4px 18px #63351c14' : 'none',
          transition:
            mode === 'static'
              ? 'none'
              : 'transform .5s cubic-bezier(.22,1,.36,1), opacity .4s ease, box-shadow .4s ease'
        }}
      >
  <Container maxWidth="xl">
    {/* ROW 1 */}
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pt: 3, pb: { xs: 1.5, md: 0.5 } }}>
      <Logo branding={branding} />

      <Stack direction="row" alignItems="center" spacing={{ xs: 1, md: 2.5 }}>
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 2.5 }}>
                <MessagesWidget />
          <WishlistWidget />
    
          <CartWidget checkout={checkout} />
        </Box>

        {/* currency trigger */}
      <Box onClick={() => setDialogOpen(true)}
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer',
              userSelect: 'none', color: '#4a4240', '&:hover': { color: '#c74735' } }}>
        <PublicOutlinedIcon sx={{ fontSize: 22 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', fontSize: 12, lineHeight: '14px' }}>
          {detecting ? '···' : currencyLabel}
          <KeyboardArrowDownIcon sx={{ fontSize: 14, opacity: 0.5 }} />
        </Box>
      </Box>

       <UserSelect />
      </Stack>
    </Stack>

    {/* ROW 2 (desktop only) */}
    <Stack direction="row" alignItems="center" justifyContent="space-between"
      sx={{ display: { xs: 'none', md: 'flex' }, pb: 1.5 }}>
     {/* ALL CATEGORIES BUTTON */}
<Button
  onClick={handleOpenCategories}
  startIcon={<MenuIcon />}
  endIcon={<KeyboardArrowDownIcon />}
  sx={{
    color: '#c74735',
    textTransform: 'none',
    fontSize: 14,
    fontWeight: 400,
    '&:hover': {
      bgcolor: '#fff4ee',
    },
  }}
>
  All categories
</Button>

{/* CATEGORIES MEGA MENU */}
<Popover
  open={Boolean(anchorEl)}
  anchorEl={anchorEl}
  onClose={handleCloseCategories}
  anchorOrigin={{
    vertical: 'bottom',
    horizontal: 'left',
  }}
  transformOrigin={{
    vertical: 'top',
    horizontal: 'left',
  }}
  slotProps={{
  paper: {
    sx: {
      mt: 1,
      width: {
        xs: 'calc(100vw - 24px)',
        md: 'min(1450px, calc(100vw - 48px))',
      },
      maxWidth: 'calc(100vw - 24px)',
      height: {
        xs: 'calc(100dvh - 120px)',
        md: 'min(600px, calc(100dvh - 120px))',
      },
      maxHeight: 'calc(100dvh - 120px)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '18px',
      border: '1px solid #f0d7c9',
      boxShadow: '0 20px 55px rgba(65, 40, 25, 0.13)',
      bgcolor: '#fff',
    },
  },
}}
>
  <Box
  sx={{
    p: { xs: 2, md: 3 },
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  }}
>
    {/* HEADER */}
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ mb: 2 , flexShrink: 0}}
    >
      <Typography
        sx={{
          fontSize: 20,
          fontWeight: 650,
          color: '#302a27',
        }}
      >
        All categories
      </Typography>

      <IconButton
        onClick={handleCloseCategories}
        size="small"
        aria-label="Close categories"
        sx={{
          bgcolor: '#faf5f1',
          '&:hover': {
            bgcolor: '#f6e8df',
          },
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Stack>

    <Divider sx={{ borderColor: '#eadfd8' }} />

    {/* CATEGORY CONTENT */}
    <Box
      sx={{
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',
    md: '232px minmax(0, 1fr)',
  },
  gap: { xs: 2, md: 2.5 },
  mt: 2,
  flex: 1,
  minHeight: 0,
  overflow: 'hidden',
}}
    >
      {/* LEFT: PARENT CATEGORIES */}
      <Box
        sx={{
  overflowY: 'auto',
  overflowX: 'hidden',
  minHeight: 0,
  pr: { md: 2 },
  borderRight: {
    md: '1px solid #eadfd8',
  },
  display: 'flex',
  flexDirection: 'column',
  gap: 0.5,
  overscrollBehavior: 'contain',
  scrollbarWidth: 'thin',
}}
      >
        {categories?.map((category) => {
          const isActive =
            activeCategory?._id === category._id;

          return (
            <Box
              key={category._id}
              component="button"
              type="button"
              onMouseEnter={() => setActiveCategory(category)}
              onFocus={() => setActiveCategory(category)}
              onClick={() => setActiveCategory(category)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                minHeight: 48,
                px: 1.5,
                py: 1.25,
                border: 0,
                borderRadius: '11px',
                textAlign: 'left',
                fontFamily: 'inherit',
                fontSize: 13,
                cursor: 'pointer',
                color: isActive ? '#c74735' : '#38312e',
                bgcolor: isActive ? '#fff0e6' : 'transparent',
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  bgcolor: '#fff4ed',
                  color: '#c74735',
                },
              }}
            >
              <Typography
                component="span"
                sx={{
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {category.name}
              </Typography>

              <ArrowForwardIcon
                sx={{
                  fontSize: 16,
                  color: '#a98a78',
                  flexShrink: 0,
                  transform: 'rotate(0deg)',
                }}
              />
            </Box>
          );
        })}
      </Box>

      {/* RIGHT: SUBCATEGORIES AND CHILD CATEGORIES */}
      <Box
        sx={{
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: 0,
          pr: { md: 2 },
          borderRight: {
            md: '1px solid #eadfd8',
          },
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          overscrollBehavior: 'contain',
          scrollbarWidth: 'thin',
        }}
      >
        {activeCategory && (
          <>
            {/* ACTIVE PARENT CATEGORY TITLE */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 2.5, gap: 1 }}
            >
              <Typography
                component={NextLink}
                href={`/products?category=${activeCategory.slug}`}
                onClick={handleCloseCategories}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  fontSize: { xs: 17, md: 20 },
                  fontWeight: 650,
                  color: '#302a27',
                  textDecoration: 'none',
                  '&:hover': {
                    color: '#c74735',
                  },
                }}
              >
                {activeCategory.name}

                <ArrowForwardIcon
                  sx={{
                    fontSize: 17,
                    transform: 'rotate(-45deg)',
                    color: '#c74735',
                  }}
                />
              </Typography>

              <Typography
                sx={{
                  fontSize: 11,
                  color: '#a28a7b',
                  whiteSpace: 'nowrap',
                }}
              >
                {activeCategory.subCategories?.length || 0}{' '}
                subcategories
              </Typography>
            </Stack>

            {/* SUBCATEGORY GRID */}
            {activeCategory.subCategories?.length > 0 ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    lg: 'repeat(3, minmax(0, 1fr))',
                  },
                  columnGap: 2.5,
                  rowGap: 3,
                  pb: 2,
                }}
              >
                {activeCategory.subCategories.map((subCategory) => (
                  <Box
                    key={subCategory._id}
                    sx={{ minWidth: 0 }}
                  >
                    {/* SUBCATEGORY TITLE */}
                    <Typography
                      component={NextLink}
                      href={`/products?category=${activeCategory.slug}&subcategory=${subCategory.slug}`}
                      onClick={handleCloseCategories}
                      sx={{
                        display: 'block',
                        mb: 0.8,
                        fontSize: 13,
                        fontWeight: 650,
                        color: '#38312e',
                        textDecoration: 'none',
                        overflowWrap: 'anywhere',
                        '&:hover': {
                          color: '#c74735',
                        },
                      }}
                    >
                      {subCategory.name}
                    </Typography>

                    {/* CHILD CATEGORY LIST */}
                    {subCategory.childCategories?.length > 0 ? (
                      <Stack spacing={0.9}>
                        {subCategory.childCategories.map(
                          (childCategory) => (
                            <Typography
                              key={childCategory._id}
                              component={NextLink}
                              href={`/products?category=${activeCategory.slug}&subcategory=${subCategory.slug}&childCategory=${childCategory.slug}`}
                              onClick={handleCloseCategories}
                              sx={{
                                display: 'block',
                                fontSize: 12,
                                lineHeight: 1.7,
                                color: '#615954',
                                textDecoration: 'none',
                                overflowWrap: 'anywhere',
                                '&:hover': {
                                  color: '#c74735',
                                  textDecoration: 'underline',
                                },
                              }}
                            >
                              {childCategory.name}
                            </Typography>
                          )
                        )}
                      </Stack>
                    ) : (
                      <Typography
                        sx={{
                          fontSize: 11,
                          color: '#a28a7b',
                        }}
                      >
                        No child categories
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography
                sx={{
                  py: 4,
                  fontSize: 13,
                  color: '#8b817b',
                }}
              >
                No subcategories available.
              </Typography>
            )}
          </>
        )}
      </Box>
    </Box>

    {/* FOOTER */}
    <Divider sx={{
        mt: 1,
        borderColor: '#eadfd8',
        flexShrink: 0,
      }} />

    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      justifyContent="space-between"
      gap={1.5}
      sx={{ pt: 2 ,flexShrink: 0,}}
    >
      <Typography
        sx={{
          fontSize: 12,
          color: '#a28a7b',
        }}
      >
        Browse products by category, subcategory and child category.
      </Typography>

  
    </Stack>
  </Box>
</Popover>

      <Stack direction="row" alignItems="center" spacing={3}>
        {[['My orders', '/profile/orders'], ['Order tracking', '/order-tracking'], ['Help & support', '/contact-us']].map(([label, href]) => (
          <Typography key={label} component={NextLink} href={href}
            sx={{ fontSize: 14, color: '#4a4240', textDecoration: 'none', '&:hover': { color: '#c74735' } }}>
            {label}
          </Typography>
        ))}
        <Button component={NextLink} href="/seller-register" /* copy the href SellerWidget uses */
          sx={{  color: '#c74735', borderRadius: '40px', textTransform: 'none',
                px: 2.5, fontWeight: 600, border:'0.5px solid #be6d62', '&:hover': { bgcolor: '#f8d6c9' } }}>
          Sell on Wreeo
        </Button>
      </Stack>
    </Stack>
  </Container>
</AppBar>
      </Box>

      {isMobile && <MobileBar />}

      {/* ── DIALOG ─────────────────────────────────────────────────────────── */}
   <ShippingCurrencyDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        initialPrefs={prefs}
        detecting={detecting}
      />
    </>
  );
}