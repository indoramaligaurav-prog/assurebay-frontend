'use client';
import React from 'react';
import NextLink from 'next/link';
import { Box, Container, Stack, Typography, Button, Select, MenuItem } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import { formatPrice } from '@/utils/formatPrice';

const TABS = ['All listings', 'New', 'Used', 'Refurbished'];
const priceOf = (p) => p.priceSale || p.price || 0;

export default function Marketplace({ categories = [], products = [] }) {
  const [tab, setTab] = React.useState('All listings');
  const [sort, setSort] = React.useState('recommended');

  const list = React.useMemo(() => {
    let l = tab === 'All listings' ? [...products] : products.filter((p) => p.condition?.toLowerCase() === tab.toLowerCase());
    if (sort === 'low') l.sort((a, b) => priceOf(a) - priceOf(b));
    if (sort === 'high') l.sort((a, b) => priceOf(b) - priceOf(a));
    return l;
  }, [products, tab, sort]);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '290px 1fr' }, alignItems: 'start' }}>
        {/* LEFT: categories */}
        <Box sx={{ bgcolor: '#fff', borderRadius: '18px', p: 3, display: { xs: 'none', md: 'block' } }}>
          <Typography sx={{ fontSize: 20, fontWeight: 600, mb: 1.5 }}>Explore categories</Typography>
          {categories.slice(0, 6).map((c) => (
            <Stack key={c._id} component={NextLink} href={`/products?category=${c.slug}`}
              direction="row" justifyContent="space-between" alignItems="center"
              sx={{ py: 2, borderTop: '1px solid #eee8e3', color: '#24201f', textDecoration: 'none', fontSize: 15,
                    '&:hover': { color: '#c74735' } }}>
              {c.name}
              <ChevronRightIcon sx={{ fontSize: 20, color: '#958b85' }} />
            </Stack>
          ))}
        </Box>

        {/* RIGHT: listings */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography component="h2" sx={{ fontSize: 28, fontWeight: 600, letterSpacing: '-1px' }}>
              Explore the marketplace.
            </Typography>
            <Button onClick={() => { setTab('All listings'); setSort('recommended'); }} endIcon={<CloseIcon sx={{ fontSize: 16 }} />}
              sx={{ border: '1px solid #e4c1b6', color: '#c74735', borderRadius: '20px', textTransform: 'none', px: 2 }}>
              Clear filters
            </Button>
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center"
            sx={{ borderBottom: '1px solid #e6e0dc', mb: 2 }}>
            <Stack direction="row" gap={3}>
              {TABS.map((t) => (
                <Box key={t} onClick={() => setTab(t)}
                  sx={{ py: 1.25, fontSize: 14, cursor: 'pointer', fontWeight: tab === t ? 600 : 400,
                        color: tab === t ? '#24201f' : '#716b68',
                        borderBottom: '2px solid', borderColor: tab === t ? '#c74735' : 'transparent', mb: '-1px' }}>
                  {t}
                </Box>
              ))}
            </Stack>
            <Stack direction="row" alignItems="center" gap={1} sx={{ fontSize: 13, color: '#716b68' }}>
              Sort
              <Select variant="standard" disableUnderline value={sort} onChange={(e) => setSort(e.target.value)} sx={{ fontSize: 13, color: '#24201f' }}>
                <MenuItem value="recommended">Recommended</MenuItem>
                <MenuItem value="low">Price: low to high</MenuItem>
                <MenuItem value="high">Price: high to low</MenuItem>
              </Select>
            </Stack>
          </Stack>

          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}>
            {list.map((p) => (
              <Box key={p._id} component={NextLink} href={`/product/${p.slug}`}
                sx={{ bgcolor: '#fff', border: '1px solid #ede9e5', borderRadius: '14px', overflow: 'hidden',
                      textDecoration: 'none', color: '#24201f', '&:hover': { borderColor: '#e4c1b6' } }}>
                <Box sx={{ position: 'relative', aspectRatio: '1.2', bgcolor: '#f3f3f0' }}>
                  <Box component="img" src={p.images?.[0]?.url} alt={p.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {p.condition && (
                    <Box sx={{ position: 'absolute', bottom: 8, left: 8, bgcolor: '#fffffff2', borderRadius: '15px', fontSize: 11, px: 1, py: '2px', textTransform: 'capitalize' }}>
                      {p.condition}
                    </Box>
                  )}
                </Box>
                <Box sx={{ p: 2 }}>
                  <Typography sx={{ fontSize: 15, minHeight: 44 }} noWrap>{p.name}</Typography>
                  <Typography sx={{ mt: 1, fontSize: 15, fontWeight: 600, color: priceOf(p) ? '#24201f' : '#c74735' }}>
                    {priceOf(p) ? formatPrice(priceOf(p)) : 'Request price'}
                  </Typography>
                </Box>
              </Box>
            ))}
            {!list.length && <Typography sx={{ color: '#716b68', py: 4 }}>No listings found.</Typography>}
          </Box>
        </Box>
      </Box>
    </Container>
  );
}