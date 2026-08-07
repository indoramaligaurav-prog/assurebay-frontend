'use client';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { Typography, CardActionArea, Card, Box, Stack } from '@mui/material';
import Image from '@/components/blur-image';
import {getAssetUrl} from '@/utils/getAssetUrl';

export default function CategoriesCard({ category, slug }) {
  const baseUrl = '/products/' + (slug ? slug + '/' : '');

  const imgsrc = getAssetUrl(category?.cover?.url);

  return (
   <Stack spacing={1} alignItems="center" width="100%">
  <Card
    sx={{
      border: "1px solid #e0e0e0", // 👈 border added
      borderRadius: 2,
      transform: "scale(1.0)",
      transition: "all 0.2s ease-in-out",
      width: "100%",
      overflow: "hidden",

      "&:hover": {
        transform: "scale(1.05)",
      },
    }}
  >
    <CardActionArea
      component={Link}
      href={`${baseUrl + category?.slug}`}
      disableRipple
      disableTouchRipple
      sx={{
        backgroundColor: "#fff",
        p: 2,
        textAlign: "center",

        "&:hover": {
          backgroundColor: "#fff",
        },

        "& .MuiTouchRipple-root": {
          display: "none",
        },
        img: { borderRadius: "10px", }
      }}
    >
      {/* Image */}
      <Box
        sx={{
          position: "relative",
          width: 100,
          height: 100,
          mx: "auto",
          borderRadius:"10px !important", overflow: "hidden"
        }}
      >
        <Image
          alt="category"
          src={imgsrc}
          layout="fill"
          objectFit="cover"
          draggable="false"
        />
      </Box>

      {/* Title 👇 now inside card */}
      <Typography
        variant="subtitle1"
        noWrap
        sx={{
          mt: 1,
          textTransform: "capitalize",
          fontWeight: 700,
          fontSize: {
            sm: 16,
            xs: 12,
          },
        }}
      >
        {category?.name}
      </Typography>
    </CardActionArea>
  </Card>
</Stack>
  );
}

CategoriesCard.propTypes = {
  category: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    cover: PropTypes.shape({
      url: PropTypes.string.isRequired,
      blurDataURL: PropTypes.string
    }),
    name: PropTypes.string.isRequired
  }).isRequired,
  slug: PropTypes.string
};
