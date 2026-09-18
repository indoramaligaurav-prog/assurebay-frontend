'use client';

import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { Popover, Typography } from '@mui/material';
import DesktopMenuList from '@/components/lists/desktop-menu-list';
import Logo from '@/components/logo';

import {
  Box,
  Container,
  Stack,
  Button,
  MenuItem,
  TextField,
  Select,
  InputAdornment
} from '@mui/material';
import { FaSearch } from 'react-icons/fa';
import { RxDashboard } from 'react-icons/rx';

export default function ActionBar({ branding, categories }) {
  const [category, setCategory] = React.useState('all');
  const [keyword, setKeyword] = React.useState('');

  const [anchorEl, setAnchorEl] = React.useState(null);

const handleCategoryClick = (e) => {
  setAnchorEl(anchorEl ? null : e.currentTarget);
};

const handleClose = () => {
  setAnchorEl(null);
};

const SEARCH_HEIGHT = 40;


const open = Boolean(anchorEl);


  const handleSearch = () => {
    if (!keyword) return;
    window.location.href = `/products?search=${keyword}&category=${category}`;
  };

  return (
    <Box sx={{ bgcolor: '#fcfbf7', borderBottom: '1px solid #fcfbf7' }}>
      <Container maxWidth="xl">
          <Stack direction="row" justifyContent={'center'}  sx={{ display: { xs: 'flex', md: 'none' } }}>
                         <Logo branding={branding} />
            </Stack>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          py={2}
        >
          {/* LOGO */}

               
      

          {/* SHOP BY CATEGORY */}
          <Button
  startIcon={<RxDashboard />}
  variant="outlined"
  onClick={handleCategoryClick}
    sx={{
    whiteSpace: 'nowrap',
    display: { xs: 'none', sm: 'inline-flex' } // 👈 hide on mobile
  }}
>
  Shop by Category
</Button>

<Popover
  open={open}
  anchorEl={anchorEl}
  onClose={handleClose}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
>
  <DesktopMenuList data={categories} onClose={handleClose} />
</Popover>



          {/* SEARCH BAR */}
          <Box sx={{ flex: 1 }}>
            <Stack direction="row">
              <TextField
                fullWidth
                placeholder="Search for anything"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                 sx={{
                  '& .MuiOutlinedInput-root': {
                    height: SEARCH_HEIGHT,
                    borderRadius: '4px 0 0 4px'
                  }
                }}
                InputProps={{
                  sx: { height: SEARCH_HEIGHT }
                }}
                        />

              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                 sx={{
        height: SEARCH_HEIGHT,
        minWidth: 160,
        borderRadius: 0,
        '& .MuiSelect-select': {
          height: SEARCH_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          paddingTop: 0,
          paddingBottom: 0
        }
      }}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat.slug}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>

             <Button
      variant="contained"
      onClick={handleSearch}
      sx={{
        height: SEARCH_HEIGHT,
        minWidth: SEARCH_HEIGHT,
        borderRadius: '0 4px 4px 0',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <FaSearch size={18} />
    </Button>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

ActionBar.propTypes = {
  branding: PropTypes.object,
  categories: PropTypes.array.isRequired
};
