import Link from 'next/link';
import PropTypes from 'prop-types';

// mui
import { Box, useTheme } from '@mui/material';
import Image from 'next/image';

import { getAssetUrl } from '@/utils/getAssetUrl';


const Logo = ({ branding }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  // src={isDarkMode?darkekt:}
  return (
    <Box
      component={Link}
      href="/"
      sx={{
        display: 'inline-block',
        height: 50,
        width: 'auto'
      }}
    >
      <Image
        src={getAssetUrl(isDarkMode ? branding.logoDark.url : branding.logoLight.url)}
        alt="Logo"
        height={34}
        width={140} // Will be overridden by aspect ratio automatically
      />
    </Box>
  );
};

Logo.propTypes = {
  sx: PropTypes.object,
  isMobile: PropTypes.bool
};
export default Logo;
