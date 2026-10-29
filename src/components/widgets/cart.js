import Link from 'next/link';
import PropTypes from 'prop-types';
import { sum } from 'lodash';
import { useSelector } from 'react-redux';
import { useState , useEffect,useMemo  } from 'react';
import { formatPrice } from '@/utils/formatPrice';
// mui
import { Badge, Stack, Typography } from '@mui/material';
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
  title={displayTotal ? String(displayTotal) : ''}
  alignItems="center"
  spacing={0.25}
  sx={{ textDecoration: 'none', color: '#4a4240', '&:hover': { color: '#c74735' } }}
>
  <Badge
    badgeContent={totalItems}
    sx={{ '& .MuiBadge-badge': { bgcolor: '#ed654f', color: '#fff', fontSize: 10, minWidth: 16, height: 16 } }}
  >
    <HiOutlineShoppingBag size={22} />
  </Badge>
  <Typography sx={{ fontSize: 12, lineHeight: '14px', color: 'inherit' }}>Cart</Typography>
</Stack>
  );
}
CartWidget.propTypes = {
  checkout: PropTypes.object.isRequired
};
