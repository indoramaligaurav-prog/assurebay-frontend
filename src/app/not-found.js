'use client';
import React from 'react';
import { useRouter } from '@bprogress/next';

// mui
import { Box, Button, Typography } from '@mui/material';

// svg
import NotFoundIllustration from 'src/illustrations/data-not-found';

export default function NotFound() {
  const router = useRouter();
  return (
    <Box
      spacing={3}
      sx={{
        px: 2,
        display: 'flex',
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 3,
        svg: {
          width: '100%'
        }
      }}
    >
      <NotFoundIllustration />
      <Typography variant="h4" color="text.primary">
        404, Page not founds
      </Typography>
      <Typography variant="body1" color="text.primary">
        Something went wrong. It’s look that your requested could not be found. It’s look like the link is broken or the
        page is removed.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="contained" color="primary" size="large" onClick={() => router.back()}>
          Go Back
        </Button>
        <Button component="a" href="/" variant="outlined" color="primary" size="large">
          Go To Home
        </Button>
      </Box>
    </Box>
  );
}
