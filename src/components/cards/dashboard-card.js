import PropTypes from 'prop-types';
// mui
import { alpha } from '@mui/material/styles';
import { Box, Card, Typography, Button, Skeleton } from '@mui/material';
import { useCurrencyFormat } from '@/hooks/use-currency-format';

DashboardCard.propTypes = {
  title: PropTypes.string.required,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isLoading: PropTypes.bool.isRequired,
  isAmount: PropTypes.bool,
  icon: PropTypes.any,
  color: PropTypes.string.isRequired
};

export default function DashboardCard({ title, value, isLoading, isAmount, icon, color }) {
  const isHex = color.includes('#');
  const fCurrency = useCurrencyFormat('base');
  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 2
      }}
    >
      <>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1">{isLoading ? <Skeleton variant="text" width="100px" /> : title}</Typography>
          <Typography variant="h3">
            {isLoading ? <Skeleton variant="text" width="100px" /> : isAmount ? fCurrency(value) : value}
          </Typography>
        </Box>
        <Button
          sx={{
            display: 'block',
            minWidth: 54,
            lineHeight: 0,
            minHeight: 54,
            padding: 0,
            borderRadius: '50%',
            border: (theme) => `2px solid ${isHex ? color : theme.palette[color].main}!important`,
            color: (theme) => alpha(isHex ? color : theme.palette[color].main, 0.9) + '!important',
            background: 'transparent'
          }}
          variant="contained"
        >
          {icon}
        </Button>
      </>
    </Card>
  );
}
