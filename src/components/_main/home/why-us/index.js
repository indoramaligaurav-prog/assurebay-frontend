'use client';
// react
import React from 'react';
// mui
import { Typography, Box, Card, Stack, Divider, Fab, alpha, Container } from '@mui/material';

// icons
import { MdOutlineSupportAgent } from 'react-icons/md';
import { AiOutlineShoppingCart } from 'react-icons/ai';
import { VscFeedback } from 'react-icons/vsc';
import { MdSettingsBackupRestore } from 'react-icons/md';
import { RiExchangeDollarLine } from 'react-icons/ri';

import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
export default function WhyUs() {
  
  return (
    
   <Box>
    <Box sx={{ borderTop: 1, borderColor: "#ccc", margin:"0 30px" }} /> 
      <Box mx={4} py={3}>
       <Stack
  direction={{ xs: "column", sm: "row" }}
  justifyContent={{ xs: "center", sm: "space-between" }}
  flexWrap="wrap"
  spacing={{ xs: 2, sm: 0 }}
>
          {/* Left Side */}
          <Box>
            <Typography fontWeight={600}>Need help?</Typography>
            <Typography variant="body2" color="text.secondary">
              Reach out to us on any of the support channel
            </Typography>
          </Box>

          {/* Right Side */}
          <Stack
  direction={{ xs: "column", sm: "row", gap:"10px" }}
  justifyContent={{ xs: "center", sm: "space-between" }}
  flexWrap="wrap"
  gap={3}
  spacing={{ xs: 2, sm: 0 }}
>
            
            {/* Store Locator */}
            <Stack direction="row" spacing={2} alignItems="center">
              <LocationOnOutlinedIcon />
              <Box>
                <Typography fontWeight={500}>Store Locator</Typography>
                <Typography sx={{padding:"0px", margin:"0px", fontSize: "14px"}} color="text.secondary">
                  Find a store nearby
                </Typography>
              </Box>
            </Stack>

            {/* Feedback */}
            <Stack direction="row" spacing={2} alignItems="center">
              <ChatBubbleOutlineIcon />
              <Box>
                <Typography fontWeight={500}>Feedback</Typography>
                <Typography sx={{padding:"0px", margin:"0px", fontSize: "14px"}} color="text.secondary">
                  Send us your feedback
                </Typography>
              </Box>
            </Stack>

            {/* Chat Now */}
            <Stack direction="row" spacing={2} alignItems="center">
              <PhoneOutlinedIcon />
              <Box>
                <Typography fontWeight={500}>Chat Now</Typography>
                <Typography sx={{padding:"0px", margin:"0px", fontSize: "14px"}} color="text.secondary">
                  Send us your feedback
                </Typography>
              </Box>
            </Stack>

          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
