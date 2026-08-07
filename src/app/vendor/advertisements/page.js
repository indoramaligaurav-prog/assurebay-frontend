'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

// MUI
import {
  Box,
  Drawer,
  Avatar,
  Typography,
  IconButton,
  Stack,
  Button,
  Paper,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Dialog ,
  DialogTitle ,
  DialogContent,
  DialogActions ,
  TextField 
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import MessageIcon from '@mui/icons-material/Message';
import {getAssetUrl} from '@/utils/getAssetUrl'

// components
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';

export default function advertisements() {

    
      return (
        <Box>
          <HeaderBreadcrumbs
            admin
            heading="advertisements"
            links={[
              { name: 'Dashboard', href: '/vendor/dashboard' },
              { name: 'advertisements' }
            ]}
          />

             </Box>
        );


}