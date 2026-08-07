'use client';
import React from 'react';
// components
import SingleSlideCarousel from '@/components/carousels/single-slide';
import PropTypes from 'prop-types';
import HeroShops from './shops';
import DesktopMenuList from '@/components/lists/desktop-menu-list';
// mui
import { Stack, Box, Container, Typography, Button, Chip } from '@mui/material';
 import { IoMdHeartEmpty } from "react-icons/io";
 import { MdOutlinePayment, MdVerifiedUser } from "react-icons/md";
import { FiShield } from "react-icons/fi";
import { TbWorld } from "react-icons/tb";
import { BiShow } from "react-icons/bi";

const features = [
  {
    label: "Assured Payments",
    icon: <MdOutlinePayment size={20} />,
  },
  {
    label: "Verified Sellers",
    icon: <MdVerifiedUser size={20} />,
  },
  {
    label: "Buyer Protection",
    icon: <FiShield size={20} />,
  },
  {
    label: "Global Shipping",
    icon: <TbWorld size={20} />,
  },
  {
    label: "Transparent Pricing",
    icon: <BiShow size={20} />,
  },
];

export default function Hero({ data, banners , allcategories  }) {

  return (
   <Container maxWidth="xl">
  <Stack direction="row" gap={2} mt={2}  alignItems="flex-start" >

    {/* LEFT CATEGORY */}
    <Box
       sx={{
    width: 340,
    display: { xs: "none", md: "block" },
    overflowY: "auto",
    overflowX: "hidden",
    height: "calc(100vh - 200px)",
  }}
    >

      <DesktopMenuList data={allcategories} />
          
   
   <Stack spacing={1}
   sx={{
    padding: "15px 15px",
    background:'#fff',
    borderTop: "1px solid #ccc"
   }}
   >
      
      <Stack direction="row" justifyContent="space-between">
        <Typography fontSize={14}>New Arrivals</Typography>
        <Button 
        sx={{
          fontSize: "12px",
          maxHeight: "25px", 
          padding: "0px !important",
          borderRadius: "5px"
        }}
        variant="contained" >
          New
        </Button>
      </Stack>

      <Stack direction="row" justifyContent="space-between">
        <Typography fontSize={14}>Best Seller Products</Typography>
        <Button variant="contained" color="info" sx={{
          fontSize: "12px",
          maxHeight: "25px", 
          padding: "0px !important",
          borderRadius: "5px"
        }}>
          The Best
        </Button>
      </Stack>

      <Stack direction="row" justifyContent="space-between">
        <Typography fontSize={14}>50% Sale Products</Typography>
        <Button variant="contained" color="error" sx={{
          fontSize: "12px",
          maxHeight: "25px", 
          padding: "0px !important",
          borderRadius: "5px"
        }}>
          -50%
        </Button>
      </Stack>

    </Stack>

     
    </Box>

    {/* RIGHT BANNER */}
    <Box 
    sx={{
      display: "flex",
      flexDirection: "column",
      gap:2,
      width: "100%"
    }}>
    <Box sx={{ flex: 1 }}>
      

<Box
  sx={{
    display: "flex",
    gap: 1, // gap between left and right
    alignItems: "stretch",
    height: 300,
  }}
>

  <Box
  sx={{
    flex: 1,
    background: "#000",
    borderRadius: 1,
    p: 4,
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  }}
>
  <Typography variant="h4" fontWeight={700}>
    Experience Truly Assured Global Trade
  </Typography>

  <Typography sx={{ mt: 2, color: "#ccc" }}>
    Secure escrow payments, verified sellers, and guaranteed delivery —
    all in one powerful marketplace.
  </Typography>

  <Stack direction="row" spacing={2} mt={3}>
    <Button
      variant="contained"
      sx={{
        borderRadius: 2,
        color: "#000",
        background: "#fff",
      }}
    >
      Explore Now
    </Button>

    <Button
      variant="outlined"
      sx={{
        color: "#fff",
        borderColor: "#fff",
        borderRadius: 2,
      }}
    >
      Learn More
    </Button>
  </Stack>
</Box>

<Box
  sx={{
    width: 260,
    borderRadius: 1,
    overflow: "hidden",
    background: "#1e293b",
    flexShrink: 0,
    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
  }}
>
  {banners?.slides?.length > 0 && (
    <Box sx={{ width: "100%", height: "100%" }}>
      <SingleSlideCarousel data={banners.slides} />
    </Box>
  )}
</Box>



</Box>
      
    </Box>



    <Box>

      

<Stack
  direction="row"
  justifyContent="space-between"
  alignItems="center"
  sx={{
    background: "#fff",
    p: 2,
    borderRadius: 2,
    border: "1px solid #eee",
  }}
>
  {features.map((item, i) => (
    <Stack key={i} alignItems="center" spacing={1}>
      <Box
        sx={{
          width: 45,
          height: 45,
          borderRadius: "50%",
          border: "1px solid #ddd",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#333",
        }}
      >
        {item.icon}
      </Box>

      <Typography fontSize={13}>{item.label}</Typography>
    </Stack>
  ))}
</Stack>
   
    </Box>
   </Box>
  </Stack>

</Container>
  );
}

Hero.propTypes = {
  categories: PropTypes.array.isRequired,
};
