'use client';
import React from 'react';
import Link from 'next/link';

// mui
import { alpha } from '@mui/material/styles';
import { Typography, Container, Stack, Box, IconButton, Grid, Fab, Divider, useTheme } from '@mui/material';
// components
import NewsLetter from './newsletter';
import Logo from '@/components/logo';

// icons
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { MdOutlineLocationOn } from 'react-icons/md';
import { FiMail } from 'react-icons/fi';
import { MdOutlineCall } from 'react-icons/md';
import { Opacity, Padding } from '@mui/icons-material';
import PhoneIcon from "@mui/icons-material/Phone";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";
import TelegramIcon from "@mui/icons-material/Telegram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";

const FOOTER_LINKS = [
  {
    heading: "Sell on wreeo",
    links: [
      "Start Selling",
      "How to Sell",
      "Business Sellers",
      "Why Sell on wreeo",
      "Commission Structure",
      "Global Reach",
      "Seller Center",
      "Onboarding"
    ]
  },
  {
    heading: "Buy on wreeo",
    links: [
      "Browse Categories",
      "How to Buy",
      "Buyer Protection",
      "Shipping & Delivery",
      "Returns & Refunds",
      "Track Your Order"
    ]
  },
  {
    heading: "Company",
    links: [
      "About wreeo",
      "Leadership",
      "Careers",
      "Newsroom",
      "Events"
    ]
  },
  {
    heading: "Support",
    links: [
      "Help Center",
      "Contact Us",
      "Account Login",
      "Dispute Resolution"
    ]
  },
  {
    heading: "Partnerships & Programs",
    links: [
      "Affiliate Program",
      "Partner With Us",
      "Vendor Verification Program"
    ]
  },
  {
    heading: "Get Connected",
    links: [
      "Facebook",
      "Instagram",
      "Twitter (X)",
      "YouTube"
    ]
  }
];

export default function Footer({ branding }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        background: "#fff",
        py: 2,
        px: 1,
        mt: 1,
        overflow: 'hidden',
        position: 'relative',
        color:"#000",

        display: {
          md: 'block',
        
        },
        a: {
      color: "#000",
      fontSize:"14px",
      textDecoration: "none !important",
      "&:hover": {
        color: "#000",
        textDecoration: "underline",
      },
    },
        
      }}
      
    >
      <Container maxWidth="xl" >
         <Stack
  direction={{ xs: "column", md: "row" }}
  spacing={2}
  alignItems={{ xs: "flex-start", md: "center" }}
  justifyContent={{md: "space-between"}}
>
          <Box>
            {/* Main Heading */}
  <Typography
    variant="h5"
    component="h2"
    fontWeight="bold"
  >
    Learn first about discounts
  </Typography>

  {/* Subheading */}
  <Typography
    variant="body2"
    component="p"
    color="text.white"
  >
    As well as news, special offers and promotions
  </Typography>
          </Box>
          <Box>  <NewsLetter /></Box>
         </Stack>

<Box sx={{ borderTop: 1, borderColor: "#00000036", margin:"20px 0px 0" }} /> 

        <Grid container gap={2} spacing={2} py={3} direction={{ xs: "column", md: "row" }}>
          
          {/* <Grid size={3}>
            <Stack spacing={3}>
              <Logo branding={branding} />
              <Typography variant="h6" color="text.primary">
                Let Us Help You
              </Typography>
              <Typography>
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
              </Typography>
              <Stack>
                <Stack direction={'row'} alignItems={'center'} gap={2}>
                  <IconButton
                    sx={{
                      svg: {
                        color: theme.palette.primary.main
                      }
                    }}
                  >
                    <MdOutlineLocationOn />
                  </IconButton>
                  <Typography variant="body1" color="text.white">
                    {branding.contact.address}
                  </Typography>
                </Stack>

                <Stack direction={'row'} alignItems={'center'} gap={2}>
                  <IconButton
                    sx={{
                      svg: {
                        color: theme.palette.primary.main
                      }
                    }}
                  >
                    <MdOutlineCall />
                  </IconButton>
                  <Typography
                    variant="body1"
                    color="text.white"
                    component="a"
                    href="/"
                    sx={{
                      ':hover': {
                        color: 'primary.main'
                      }
                    }}
                  >
                    {branding.contact.whatsappNo}
                  </Typography>
                </Stack>
                <Stack direction={'row'} alignItems={'center'} gap={2}>
                  <IconButton
                    sx={{
                      svg: {
                        color: theme.palette.primary.main
                      }
                    }}
                  >
                    <FiMail />
                  </IconButton>
                  <Typography
                    variant="body1"
                    color="text.white"
                    component="a"
                    href="/"
                    sx={{
                      ':hover': {
                        color: 'primary.main'
                      }
                    }}
                  >
                    {branding.contact.email}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Grid> */}
     
         
          {FOOTER_LINKS.map((item, idx) => (
            <Grid size={{ xs: 12, md: 2 }} key={idx}>
              <Stack spacing={1}>
                <Typography variant="h6" color="text.white">
                  {item.heading}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1
                  }}
                >
                  {item.links.map((link, i) => (
                    <Typography
                      key={i}
                      sx={{ fontSize: "14px", fontWeight: 400, color: "#000" }}
                      component={Link}
                      href="#"
                    >
                      {link}
                    </Typography>
                  ))}
                </Box>
              </Stack>
            </Grid>
          ))}

            <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
  {[
    "Terms of Service",
    "Privacy Policy",
    "Cookie Policy",
    "Refund Policy",
    "Seller Agreement",
    "Buyer Agreement"
  ].map((item, i) => (
    <Typography key={i} sx={{ fontSize: "13px" }}>
      {item}
    </Typography>
  ))}
</Stack>
          
        </Grid>
       <Box sx={{ borderTop: 1, borderColor: "#00000036", margin:"0px 0px 10px" }} /> 

       
       
         <Box
      sx={{
        fontSize: 14,
        color: "#000"
      }}
    >
      <Stack
        justifyContent="center"
        alignItems="center"
        flexWrap="wrap"
        direction={{ xs: "column", md: "row" }}
      >
        {/* Left Side */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="center">
          
          <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems="center">
            <Logo branding={branding} />
          </Stack>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems="center">
            <PhoneIcon fontSize="small" />
            <Typography>+ 375 25 522 18 48</Typography>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems="center">
            <MailOutlineIcon fontSize="small" />
            <Link href="#" sx={{ color: "#000" }}>
              Send Mail
            </Link>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems="center">
            <HeadsetMicIcon fontSize="small" />
            <Link href="#" sx={{ color: "#000" }}>
              Write to us
            </Link>
          </Stack>
           <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems="center">
            <TelegramIcon fontSize="small" />
            <Link href="#" sx={{ color: "#000" }}>
           Telegram
            </Link>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems="center">
            <WhatsAppIcon fontSize="small" />
            <Link href="#" sx={{ color: "#000" }}>
           WhatsApp
            </Link>
          </Stack>
        </Stack>

      
      </Stack>
    </Box>
      </Container>
    </Box>
  );
}
