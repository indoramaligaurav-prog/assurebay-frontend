'use client';
import { Box, Typography, Paper, Button } from '@mui/material';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useRouter } from 'next/navigation';

export default function PendingApprovalNotice({ status }) {
  const router = useRouter();

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" p={3}>
      <Paper variant="outlined" sx={{ p: 4, maxWidth: 480, textAlign: 'center' }}>
        <HourglassEmptyIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
        <Typography variant="h6" fontWeight={700} mb={1}>
          Your shop is under review
        </Typography>
        <Typography color="text.secondary" fontSize={14} mb={3}>
          This section will unlock once your shop verification is complete.
          {status === 'pending' && ' If you haven\'t finished payment setup yet, please check your Dashboard to complete it.'}
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.push('/vendor/dashboard')}
        >
          Back to Dashboard
        </Button>
      </Paper>
    </Box>
  );
}