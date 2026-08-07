'use client';

import PropTypes from 'prop-types';
import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import useEmblaCarousel from 'embla-carousel-react';
import { Box, Stack, IconButton, Tooltip, useMediaQuery } from '@mui/material';
import { IoMdHeartEmpty, IoIosHeart } from 'react-icons/io';
import BlurImage from '@/components/blur-image';
import shape from '@/theme/shape';
import { setWishlist } from 'src/redux/slices/wishlist';
import * as api from 'src/services';
import { toast } from 'react-hot-toast';

function Slide({ item, onClickWishList, wishlist, isLoading, isMobile, id }) {
  const isInWishlist = wishlist?.includes(id);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Wishlist Button */}
      <Stack
        sx={{
          position: 'absolute',
          top: isMobile ? 8 : 16,
          right: isMobile ? 8 : 16,
          zIndex: 2,
          bgcolor: 'background.paper',
          borderRadius: '50%'
        }}
      >
        <Tooltip title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}>
          <IconButton
            size={isMobile ? 'small' : 'medium'}
            onClick={onClickWishList}
            disabled={isLoading}
            color={isInWishlist ? 'primary' : 'default'}
          >
            {isInWishlist ? <IoIosHeart /> : <IoMdHeartEmpty />}
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Image */}
      {item && (
        <BlurImage priority fill objectFit="cover" sizes="50%" src={item?.url || item?.src} alt="hero-carousel" />
      )}

      {/* Overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          bgcolor: 'rgba(0,0,0,0.1)'
        }}
      />
    </Box>
  );
}

Slide.propTypes = {
  item: PropTypes.object.isRequired,
  onClickWishList: PropTypes.func.isRequired,
  wishlist: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  isSimple: PropTypes.bool.isRequired
};

export default function ProductDetailsSlider({ product, selectedVariant, isSimple, id }) {
  const router = useRouter();
  const dispatch = useDispatch();

  const isMobile = useMediaQuery('(max-width:600px)');
  const { wishlist } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.user);

  const variantList = product?.variants;

  const selected =
    !isSimple && selectedVariant && variantList?.length > 0
      ? variantList.find((v) => v.name?.match(/^[^#]+/)?.[0] === selectedVariant)
      : variantList?.[0];

  const images =
    selected && selected?.images?.length ? [...(product?.images || []), ...selected.images] : product?.images || [];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mainRef, mainApi] = useEmblaCarousel({ loop: true });
  const [thumbRef, thumbApi] = useEmblaCarousel({ containScroll: 'keepSnaps', dragFree: true });

  const scrollTo = useCallback(
    (index) => {
      if (!mainApi || !thumbApi) return;
      mainApi.scrollTo(index);
    },
    [mainApi, thumbApi]
  );

  const onSelect = useCallback(() => {
    if (!mainApi || !thumbApi) return;
    const index = mainApi.selectedScrollSnap();
    setSelectedIndex(index);
    thumbApi.scrollTo(index);
  }, [mainApi, thumbApi]);

  useEffect(() => {
    if (!mainApi) return;
    mainApi.on('select', onSelect);
    onSelect();
  }, [mainApi, onSelect]);

  const [isLoading, setLoading] = useState(false);
  const { mutate } = useMutation({
    mutationFn: async (id) => {
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }
      const response = await api.updateWishlist(id);
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to update wishlist');
      }
      return response;
    },
    onSuccess: (response) => {
      const updatedWishlist = response?.data || [];
      dispatch(setWishlist(updatedWishlist));
      toast.success(response?.message || 'Wishlist updated successfully');
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to update wishlist');
    },
    onSettled: () => {
      setLoading(false);
    }
  });

  const onClickWishList = async (event) => {
    event.stopPropagation();
    if (!isAuthenticated) {
      router.push('/auth/signin');
      return;
    }
    setLoading(true);
    mutate(id);
  };

  return (
    <Stack gap={2}>
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          border: '1px solid #e0e0e0',
          borderRadius: shape.borderRadiusMd,
          aspectRatio: '1 / 1' // square
        }}
        ref={mainRef}
      >
        <Box sx={{ display: 'flex', width: '100%', height: '100%' }}>
          {images.map((item, index) => (
            <Box key={index} sx={{ flex: '0 0 100%', minWidth: 0, height: '100%', position: 'relative' }}>
              <Slide
                item={item}
                id={id}
                wishlist={wishlist}
                isLoading={isLoading}
                onClickWishList={onClickWishList}
                isMobile={isMobile}
              />
            </Box>
          ))}
        </Box>
      </Box>

      <Box
        ref={thumbRef}
        sx={{
          overflow: 'hidden',
          width: '100%',
          position: 'relative'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'row',
            p: 1
          }}
        >
          {images.map((item, index) => (
            <Box
              key={index}
              onClick={() => scrollTo(index)}
              sx={{
                flex: '0 0 auto',
                width: 56,
                height: 56,
                mr: 1,
                borderRadius: 1,
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                outline: selectedIndex === index ? '2px solid #1976d2' : 'none',
                outlineOffset: 2
              }}
            >
              <BlurImage
                priority
                fill
                objectFit="cover"
                sizes="14vw"
                src={item?.src || item?.url}
                alt={`thumb-${index}`}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Stack>
  );
}

ProductDetailsSlider.propTypes = {
  product: PropTypes.object.isRequired,
  data: PropTypes.object,
  selectedVariant: PropTypes.string
};
