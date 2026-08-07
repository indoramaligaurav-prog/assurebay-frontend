// guard
import GuestGuard from '@/guards/guest';

// mui
import { Box, Stack, Typography } from '@mui/material';

// components
import SignUpMain from '@/components/_main/auth/sign-up';

export const metadata = {
  title: 'Create Account',
};

export default function SignUp() {
  return (
    <GuestGuard>
      <Box
        sx={{
          display: 'flex',
         height: '100%',
minHeight: '100vh',
          width: '100%',
          overflow: 'hidden',
          bgcolor: '#fff',
        }}
      >
        
        {/* LEFT IMAGE SECTION */}
        <Box
          sx={{
            width: '55%',
            display: { xs: 'none', md: 'block' },
            position: 'relative',
          }}
        >
          <Box
            component="img"
            src="/images/buyer_dweb_business.jpg"
            alt="signup"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </Box>

        {/* RIGHT FORM SECTION */}
        <Box
          sx={{
            width: { xs: '100%', md: '45%' },
            minWidth: { md: '520px' },
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            px: { xs: 3, md: 5 },
            pt: 10,
            pb: 6,
            overflowY: 'auto',
            bgcolor: '#fff',
          }}
        >
          <Stack
            width="100%"
            maxWidth={520}
          >
            <Typography
              sx={{
                fontSize: { xs: '42px', md: '64px' },
                fontWeight: 700,
                lineHeight: 1.1,
                mb: 4,
                letterSpacing: '-2px',
              }}
            >
              Create an account
            </Typography>

            <SignUpMain />
          </Stack>
        </Box>
      </Box>
    </GuestGuard>
  );
}