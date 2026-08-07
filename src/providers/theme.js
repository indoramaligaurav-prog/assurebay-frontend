'use client';
import dynamic from 'next/dynamic';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from '@/redux';
import { getTheme } from '@/theme';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import rtlPlugin from 'stylis-plugin-rtl';
import createCache from '@emotion/cache';
import { CacheProvider as EmotionCacheProvider } from '@emotion/react';
import GlobalStyles from '@/theme/global-styles';
import { initializeSettings } from '@/redux/slices/settings';
import { setShippingFee } from '@/redux/slices/product';

const Settings = dynamic(() => import('@/components/settings'), { ssr: false });

export default function MuiThemeProvider({
  children,
  fontFamilies,
  palette,
  fontFamily,
  baseCurrency,
  preset,
  cloudName,
  shippingFee
}) {
const { direction, rate, currency, isInitialized } = useSelector((state) => state.settings);
const resolvedMode = 'light';



  // Memoize the cache for RTL or LTR
  const styleCache = useMemo(() => {
    return createCache({
      key: direction === 'rtl' ? 'muirtl' : 'css',
      stylisPlugins: direction === 'rtl' ? [rtlPlugin] : []
    });
  }, [direction]);

  // Memoize theme based on dependencies
  const theme = useMemo(() => {
    const selectedFont = fontFamilies[fontFamily] || fontFamilies.figtree;
    return getTheme(resolvedMode, direction, selectedFont, palette);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedMode, direction, fontFamily, palette]);

  return (
    <AppRouterCacheProvider>
      <EmotionCacheProvider value={styleCache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <main dir={direction}>
            {children}
            {/* <Settings direction={direction} /> */}
          </main>
          <GlobalStyles />
        </ThemeProvider>
      </EmotionCacheProvider>
    </AppRouterCacheProvider>
  );
}
