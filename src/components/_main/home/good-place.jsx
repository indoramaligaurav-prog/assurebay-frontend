import NextLink from 'next/link';
import { Box, Container, Stack, Typography } from '@mui/material';
import NorthEastIcon from '@mui/icons-material/NorthEast';

const CARDS = [
  { bg: '#f1e6dc', title: 'Equip a workshop', desc: 'Tools and essentials for your next project.', img: '/images/goodone.jpeg', href: '/products?category=tools-hardware-safety' },
  { bg: '#e9edeb', title: 'Keep work moving', desc: 'Parts, pumps and working machinery.', img: '/images/goodtwo.jpeg', href: '/products?category=machinery-parts' },
  { bg: '#fae5dc', title: 'Upgrade a workspace', desc: 'Computers, seating and business essentials.', img: '/images/goodthree.jpeg', href: '/products?category=commercial-office' },
];

export default function GoodPlace() {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" mb={2}>
        <Typography component="h2" sx={{ fontSize: 28, fontWeight: 600, letterSpacing: '-1px', color: '#24201f' }}>
          A good place to start.
        </Typography>
        <Typography component={NextLink} href="/products" sx={{ fontSize: 14, color: '#716b68', textDecoration: 'none' }}>
          Explore a collection
        </Typography>
      </Stack>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
        {CARDS.map((c) => (
          <Box key={c.title} component={NextLink} href={c.href}
            sx={{ bgcolor: c.bg, borderRadius: '18px', p: 3, minHeight: 190, display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center', gap: 2, textDecoration: 'none',
                  color: '#24201f', transition: 'transform .15s', '&:hover': { transform: 'translateY(-2px)' } }}>
            <Box>
              <Typography sx={{ fontSize: 22, fontWeight: 600, letterSpacing: '-.5px' }}>{c.title}</Typography>
              <Typography sx={{ fontSize: 14, color: '#716b68', mt: 1, mb: 1.5 }}>{c.desc}</Typography>
              <NorthEastIcon sx={{ fontSize: 16 }} />
            </Box>
            <Box component="img" src={c.img} alt={c.title}
              sx={{ width: { xs: 100, md: 130 }, height: { xs: 100, md: 130 }, objectFit: 'cover', flexShrink: 0 }} />
          </Box>
        ))}
      </Box>
    </Container>
  );
}