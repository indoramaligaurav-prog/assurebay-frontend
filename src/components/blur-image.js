'use client';
import React from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';
// mui
import useMediaQuery from '@mui/material/useMediaQuery';
import Skeleton from '@mui/material/Skeleton';
export default function BlurImage({ ...props }) {
  const isDesktop = useMediaQuery('(min-width:600px)');
  const [loading, setLoading] = React.useState(true);

  return (
    <>
      {loading &&
        (props.fill || props.layout === 'fill' ? (
          <Skeleton
            width={'100%'}
            height={'100%'}
            variant="rectangular"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0
            }}
          />
        ) : (
          <Skeleton
            width={props.width}
            height={props.height}
            variant="rectangular"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0
            }}
          />
        ))}
      <Image
        component={Image}
        src={props.src}
        alt={props.alt}
        onLoad={() => {
          setLoading(false);
        }}
        sizes={isDesktop ? '14vw' : '50vw'}
        {...props}
      />
    </>
  );
}

BlurImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  static: PropTypes.bool
};
