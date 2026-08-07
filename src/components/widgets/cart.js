import Link from 'next/link';
import PropTypes from 'prop-types';
import { sum } from 'lodash';
import { useSelector } from 'react-redux';
import { useState , useEffect,useMemo  } from 'react';
import { formatPrice } from '@/utils/formatPrice';
// mui
import { IconButton, Stack, Typography, alpha } from '@mui/material';
import { HiOutlineShoppingBag } from 'react-icons/hi2';


export default function CartWidget() {

  
  const { checkout } = useSelector(({ product }) => product);
    const { user } = useSelector((state) => state.user);

    const [displayTotal, setDisplayTotal] = useState('');
    const { code: currency } = useSelector((state) => state.currency);

  const totalItems = useMemo(
    () => sum(checkout.cart.map(item => item.quantity)),
    [checkout.cart]
  );

  const rawTotal = useMemo(
    () =>
      sum(
        checkout.cart.map(
          item => (item.salePrice || item.price) * item.quantity
        )
      ),
    [checkout.cart]
  );

  const vendorId = useMemo(() => {
  if (!checkout.cart?.length) return null;

  // take vendor from first cart item
  return checkout.cart[0]?.vendorid || null;
}, [checkout.cart]);

   useEffect(() => {
    let mounted = true;

    const loadTotal = async () => {
      if (!rawTotal) {
        setDisplayTotal('');
        return;
      }

      console.log('Formatting cart total:', rawTotal, checkout.cart?.[0]?.pid || null , user?._id ); 

      try {
        const formatted = await formatPrice({
          amount: rawTotal,
          vendorId: vendorId ,
          userId: user?._id || null, // guest safe
            currency,
        });

        if (mounted) setDisplayTotal(formatted);
      } catch (err) {
        console.error('Cart price format failed', err);
        if (mounted) setDisplayTotal(rawTotal);
      }
    };

    loadTotal();

    return () => {
      mounted = false;
    };
  }, [rawTotal, user, checkout.cart,currency]);

  return (
   <Stack
  component={Link}
  href="/cart"
  direction="row"
  spacing={1}
  alignItems="center"
  width="auto"
  sx={{
    cursor: "pointer",
    textDecoration: "none",
    "&:hover": {
      color: "primary.main",
    },
  }}
>
  {/* ICON */}
  <IconButton
    disableRipple
    sx={{
      p: 0,
      m: 0,
      bgcolor: "transparent",
      border: "none",
      "&:hover": {
        bgcolor: "transparent",
      },
    }}
  >
    <HiOutlineShoppingBag size={20} />
  </IconButton>

  {/* TEXT */}
  <Stack gap={0}>
    <Typography
      sx={{
        fontSize: "12px",
        lineHeight: "14px",
        color: "text.primary",
      }}
    >
       ({totalItems})
    </Typography>

    <Typography
      sx={{
        fontSize: "12px",
        lineHeight: "14px",
        color: "text.secondary",
      }}
    >
      {displayTotal}
    </Typography>
  </Stack>
</Stack>
  );
}
CartWidget.propTypes = {
  checkout: PropTypes.object.isRequired
};
