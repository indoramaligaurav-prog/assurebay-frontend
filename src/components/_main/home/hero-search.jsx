'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { Box, Container, Stack, Typography, Select, MenuItem, InputBase, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const CONDITIONS = ['Any', 'New', 'Used', 'Refurbished'];
const SUGGESTIONS = ['Pumps', 'Bearings', 'Power tools', 'Computers'];

export default function HeroSearch({ categories = [] }) {
  const router = useRouter();
  const [keyword, setKeyword] = React.useState('');
  const [category, setCategory] = React.useState('all');
  const [condition, setCondition] = React.useState('Any');

  const go = () => {
    const p = new URLSearchParams();
    if (keyword) p.set('search', keyword);
    if (category !== 'all') p.set('category', category);
    if (condition !== 'Any') p.set('condition', condition.toLowerCase());
    router.push(`/products?${p.toString()}`);
  };

  return (
   <Box
  sx={{
    pt: { xs: 5, md: 7 },
    pb: 4,
    textAlign: 'center',
    background:'#fff'
  }}
>
      <Container maxWidth="md">
        <Typography component="h1" sx={{ fontSize: { xs: 34, md: 56 }, fontWeight: 600, letterSpacing: '-2px', color: '#24201f', lineHeight: 1.1 }}>
          Start with what you need.
        </Typography>
        <Typography sx={{ mt: 1.5, mb: 4, color: '#716b68', fontSize: 15 }}>
          From a single part to your next setup.
        </Typography>

        <Box sx={{ bgcolor: '#fff', border: '1px solid #ed654f', borderRadius: '28px', p: 2, textAlign: 'left', boxShadow: '0 8px 28px #63351c12' }}>
          <Stack direction="row" alignItems="center" gap={1.5} sx={{ px: 1, pb: 1.5, borderBottom: '1px solid #eee8e3' }}>
            <SearchIcon sx={{ color: '#96857c' }} />
            <InputBase fullWidth value={keyword} placeholder="Search products, parts or model numbers"
              onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && go()}
              sx={{ fontSize: { xs: 16, md: 20 } }} />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" gap={1.5} sx={{ pt: 1.5 }}>
            <Select variant="standard" disableUnderline value={category} onChange={(e) => setCategory(e.target.value)}
            IconComponent={KeyboardArrowDownIcon}
            sx={{ minWidth: 180, fontSize: 14, px: 1, pr: 2, borderRight: '1px solid #eee8e3' }}>
              <MenuItem value="all">All categories</MenuItem>
              {categories.map((c) => <MenuItem key={c._id} value={c.slug}>{c.name}</MenuItem>)}
            </Select>

            <Stack direction="row" gap={0.5} flexWrap="wrap">
              {CONDITIONS.map((c) => (
                <Box key={c} onClick={() => setCondition(c)}
                  sx={{ px: 1.75, py: 0.75, borderRadius: '20px', fontSize: 14, cursor: 'pointer',
                        bgcolor: condition === c ? '#fbe5dc' : 'transparent', color: condition === c ? '#c74735' : '#4a4240' }}>
                  {c}
                </Box>
              ))}
            </Stack>

            <Button onClick={go} endIcon={<ArrowForwardIcon />}
              sx={{ bgcolor: '#c74735', color: '#fff', borderRadius: '30px', textTransform: 'none', px: 3.5, py: 1.25, fontWeight: 600, '&:hover': { bgcolor: '#b03e2e' } }}>
              Search
            </Button>
          </Stack>
        </Box>

        <Stack direction="row" justifyContent="center" alignItems="center" gap={1.5} flexWrap="wrap" sx={{ mt: 2.5, fontSize: 13, color: '#716b68' }}>
          <span>Try searching</span>
          {SUGGESTIONS.map((s) => (
            <Box key={s} component={NextLink} href={`/products?search=${encodeURIComponent(s)}`}
              sx={{ color: '#4a4240', textDecoration: 'underline', textDecorationColor: '#ccb2a3', textUnderlineOffset: '4px' }}>
              {s}
            </Box>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}