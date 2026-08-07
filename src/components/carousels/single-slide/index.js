'use client';

import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { getAssetUrl } from '@/utils/getAssetUrl';
import { Box, Card, Stack, Typography, LinearProgress } from '@mui/material';

const AUTOPLAY_DELAY = 5000; // 5 seconds

function CarouselItem({ item }) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: { xs: 125, sm: 225, md: 270, lg: 460 },
        borderBottom: (theme) => '1px solid ' + theme.palette.divider,
        display: 'block'
      }}
      {...(Boolean(item.link) && {
        component: Link,
        href: item.link
      })}
    >
      <Image
        priority
        src={getAssetUrl(item.image.url)}
        alt="banner"
        fill
        style={{
          objectFit: 'cover',
          objectPosition: 'center'
        }}
        draggable={false}
      />
    </Box>
  );
}

CarouselItem.propTypes = {
  item: PropTypes.shape({
    image: {
      url: PropTypes.string.isRequired,
      _id: PropTypes.string.isRequired
    }
  }).isRequired
};

export default function SingleSlideCarousel({ data }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: AUTOPLAY_DELAY, stopOnInteraction: false })
  ]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const isEmpty = !Boolean(data?.length);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;

    setSelectedIndex(emblaApi.selectedScrollSnap());
    setProgress(0); // reset progress bar

    const autoplay = emblaApi.plugins()?.autoplay;
    if (autoplay) {
      autoplay.reset(); // ⬅️ restart autoplay
    }
  }, [emblaApi]);
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  // Progress animation
  useEffect(() => {
    const start = Date.now();

    let raf;

    const updateProgress = () => {
      const elapsed = Date.now() - start;
      const newProgress = Math.min((elapsed / AUTOPLAY_DELAY) * 100, 100);
      setProgress(newProgress);
      if (newProgress < 100) {
        raf = requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();

    return () => cancelAnimationFrame(raf);
  }, [selectedIndex]);

  return (
    <Card
      sx={{
        width: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        flexDirection: 'column',
        borderRadius: '12px',
        height: '100%'
      }}
    >
      {isEmpty ? (
        <Stack
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <Typography variant="h4" color="text.secondary">
            Slides are not uploaded yet!
          </Typography>
        </Stack>
      ) : (
        <>
          <Box
            ref={emblaRef}
            sx={{
              width: '100%',
              height: '100%',
              overflow: 'hidden'
            }}
          >
            <Box
              className="embla__container"
              sx={{
                display: 'flex',
                height: '100%'
              }}
            >
              {data.map((item) => (
                <Box
                  className="embla__slide"
                  key={item.image._id}
                  sx={{
                    position: 'relative',
                    flex: '0 0 100%',
                    minWidth: 0
                  }}
                >
                  <CarouselItem item={item} />
                </Box>
              ))}
            </Box>
          </Box>

          {/* Progress Bar */}
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              width: '100%',
              height: 4,
              position: 'absolute',
              bottom: 0,
              left: 0,
              borderBottomLeftRadius: '12px',
              borderBottomRightRadius: '12px',
              '& .MuiLinearProgress-bar': {
                transition: 'none' // disables abrupt animation
              }
            }}
          />
        </>
      )}
    </Card>
  );
}

SingleSlideCarousel.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      cover: PropTypes.string.isRequired,
      heading: PropTypes.string,
      description: PropTypes.string,
      btnPrimary: PropTypes.shape({
        url: PropTypes.string.isRequired,
        btnText: PropTypes.string.isRequired
      }),
      btnSecondary: PropTypes.shape({
        url: PropTypes.string.isRequired,
        btnText: PropTypes.string.isRequired
      })
    })
  ).isRequired
};
