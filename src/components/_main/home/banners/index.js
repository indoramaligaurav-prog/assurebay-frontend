'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getAssetUrl } from '@/utils/getAssetUrl';
// mui
import { Box, Card, Grid, Container, CardActionArea } from '@mui/material';

export default function Index({ banners }) {
  return (
    <Box
      sx={{
        display: { md: 'block', xs: 'none' }
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={2}>
          <Grid size={{ lg: 6, md: 6, sm: 6, xs: 12 }} key={banners.banner1.image._id}>
            <Card>
              <CardActionArea
                {...(Boolean(banners.banner1.link) && {
                  component: Link,
                  href: banners.banner1.link
                })}
              >
                <Box sx={{ position: 'relative', height: 240 }}>
                 
                  <Image
                    draggable="false"
                    
                     src={getAssetUrl(banners.banner1.image.url)}
                    alt="banner"
                    layout="fill"
                    sizes="100vw"
                    objectFit="cover"
                  />
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid size={{ lg: 6, md: 6, sm: 6, xs: 12 }} key={banners.banner2.image._id}>
            <Card>
              <CardActionArea
                {...(Boolean(banners.banner2.link) && {
                  component: Link,
                  href: banners.banner2.link
                })}
              >
                <Box sx={{ position: 'relative', height: 240 }}>
                  <Image
                    draggable="false"
                    src={banners.banner2.image.url}
                    alt="banner"
                    layout="fill"
                    sizes="100vw"
                    objectFit="cover"
                  />
                </Box>
                {}
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
