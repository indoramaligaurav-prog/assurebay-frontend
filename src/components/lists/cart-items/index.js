import PropTypes from 'prop-types';
// mui
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import {formatPrice} from '@/utils/formatPrice';
import { useSelector } from 'react-redux';

import {
  Box,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  IconButton,
  Skeleton,
  Stack
} from '@mui/material';
import { IoClose } from 'react-icons/io5';

import * as api from 'src/services';

//components
import RootStyled from './styled';
import Incrementer from '@/components/incrementer';
// hooks
import { useCurrencyConvert } from '@/hooks/use-currency';
import { useCurrencyFormat } from '@/hooks/use-currency-format';
import BlurImage from '@/components/blur-image';

const ThumbImgStyle = styled(Box)(({ theme }) => ({
  width: 56,
  height: 56,
  marginRight: theme.spacing(2),
  borderRadius: '8px',
  border: `1px solid ${theme.palette.divider}`,
  position: 'relative',
  overflow: 'hidden'
}));

// ----------------------------------------------------------------------

export default function CartItemsList({ ...props }) {
  const { onDelete, onIncreaseQuantity, onDecreaseQuantity, isLoading, cart } = props;

  const { user } = useSelector((state) => state.user);
  const [vendorMap, setVendorMap] = useState({}); // pid -> vendorId


  const userId = user?._id || null;
  
  const [priceMap, setPriceMap] = useState({}); // sku -> formatted price
const [totalMap, setTotalMap] = useState({}); // sku -> formatted total
     
  const { code: currency } = useSelector((state) => state.currency);

  useEffect(() => {
  if (!cart?.length) return;

  const fetchVendors = async () => {
    const map = {};

    await Promise.all(
      cart.map(async (product) => {
        try {
          const res = await api.getvendoridbyproduct(product.pid);
          map[product.pid] = res.vendorId;
        } catch (err) {
          console.error('Vendor fetch failed:', product.pid);
        }
      })
    );

    setVendorMap(map);
  };

  fetchVendors();
}, [cart]);

useEffect(() => {
  if (!cart?.length) return;

  const resolvePrices = async () => {
    const prices = {};
    const totals = {};

    await Promise.all(
      cart.map(async (product) => {
        const amount = product.salePrice || product.price;
        const vendorId = vendorMap[product.pid];

        const formattedPrice = await formatPrice({
          amount,
          vendorId,
          userId: userId,
            currency,
        });

        const formattedTotal = await formatPrice({
          amount: amount * product.quantity,
          vendorId,
          userId: userId,
            currency,
        });
     
        prices[product.sku] = formattedPrice;
        totals[product.sku] = formattedTotal;
      })
    );

    setPriceMap(prices);
    setTotalMap(totals);
  };

  resolvePrices();
}, [cart, vendorMap, currency]);



  

  const cCurrency = useCurrencyConvert();
  const fCurrency = useCurrencyFormat();
  return (
    <RootStyled>
      <Table>
        <TableHead>
          <TableRow className="table-head-row">
            <TableCell>{isLoading ? <Skeleton variant="text" width={100} /> : 'Product'}</TableCell>
            <TableCell align="center">
              {isLoading ? <Skeleton variant="text" width={80} sx={{ mx: 'auto' }} /> : 'Type'}
            </TableCell>
            <TableCell align="center">
              {isLoading ? <Skeleton variant="text" width={80} sx={{ mx: 'auto' }} /> : 'Price'}
            </TableCell>

            <TableCell align="center">
              {isLoading ? <Skeleton variant="text" width={80} sx={{ mx: 'auto' }} /> : 'Quantity'}
            </TableCell>

            <TableCell align="center">
              {isLoading ? <Skeleton variant="text" width={63} sx={{ mx: 'auto' }} /> : 'Total Price'}
            </TableCell>
            <TableCell align="right">
              {isLoading ? <Skeleton variant="text" width={44} sx={{ ml: 'auto' }} /> : 'Action'}
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {cart.map((product) => {
            const {
              sku,
              name,
              type,
               variantName,
              variant,
              variantAttributes,
              quantity,
              price,
              salePrice,
              image,
              deliveryType,
              stockQuantity
            } = product;

       
              const vendorId = vendorMap[product.pid];

                

            return (
              <TableRow key={Math.random()}>
                <TableCell>
                  <Box className="product-sec">
                    {isLoading ? (
                      <Skeleton variant="rounded" width={56} height={56} sx={{ mr: 2 }} />
                    ) : (
                      <ThumbImgStyle>
                        <BlurImage priority fill alt="product image" src={image} />
                      </ThumbImgStyle>
                    )}
                    <Box>
                      <Typography
                        noWrap
                        variant="subtitle1"
                        className="subtitle"
                        lineHeight={1}
                        mb={0 + '!important'}
                        paddingY={0.7}
                      >
                        {isLoading ? <Skeleton variant="text" width={150} /> : name}
                      </Typography>

                      {type !== 'simple' && product?.variantAttributes && (
                        <Stack direction="row" gap={2}>
                          {Object.entries(product.variantAttributes).map(([key, value]) => (
                            <Typography
                              key={key}
                              variant="body2"
                              sx={{ span: { textTransform: 'uppercase' } }}
                            >
                              <b>{key}:</b> <span>{value}</span>
                            </Typography>
                          ))}
                        </Stack>
                      )}

                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  {isLoading ? (
                    <Skeleton variant="text" width={52} sx={{ mx: 'auto' }} />
                  ) : (
                    <Typography
                      variant="body1"
                      color="text.primary"
                      fontWeight={600}
                      sx={{
                        textTransform: 'capitalize'
                      }}
                    >
                      {deliveryType}
                    </Typography>
                  )}
                </TableCell>
               <TableCell>
                      {isLoading ? (
                        <Skeleton variant="text" width={52} sx={{ mx: 'auto' }} />
                      ) : (
                        <Typography variant="body1" fontWeight={600}>
                          {priceMap[sku] || '...'}
                        </Typography>
                      )}
                    </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    '& > div': {
                      mx: 'auto'
                    }
                  }}
                >
                  {isLoading ? (
                    <Stack width={96} sx={{ mx: 'auto' }}>
                      <Skeleton variant="rounded" width={96} height={36} />
                      <Skeleton variant="rounded" width={40} height={12} sx={{ ml: 'auto', mt: 0.5 }} />
                    </Stack>
                  ) : deliveryType === 'digital' ? (
                    '-'
                  ) : (
                    <Incrementer
                      cart
                      quantity={quantity}
                      stockQuantity={stockQuantity}
                      onDecrease={() => onDecreaseQuantity(sku)}
                      onIncrease={() => onIncreaseQuantity(sku)}
                    />
                  )}
                </TableCell>
                <TableCell align="center">
  {isLoading ? (
    <Skeleton variant="text" width={52} sx={{ mx: 'auto' }} />
  ) : (
    <Typography variant="body1" fontWeight={600}>
      {totalMap[sku] || '...'}
    </Typography>
  )}
</TableCell>

                <TableCell align="right">
                  {isLoading ? (
                    <Skeleton variant="circular" width={40} height={40} sx={{ ml: 'auto' }} />
                  ) : (
                    <IconButton aria-label="delete" color="inherit" onClick={() => onDelete(sku)} size="small">
                      <IoClose size={24} />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </RootStyled>
  );
}
CartItemsList.propTypes = {
  onDelete: PropTypes.func,
  onDecreaseQuantity: PropTypes.func,
  onIncreaseQuantity: PropTypes.func,
  isLoading: PropTypes.bool,
  cart: PropTypes.arrayOf(
    PropTypes.shape({
      sku: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      size: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired,
      stockQuantity: PropTypes.number.isRequired,
      price: PropTypes.number.isRequired,
      salePrice: PropTypes.number,
      image: PropTypes.string.isRequired,
       variantAttributes: PropTypes.object
    })
  )
};
