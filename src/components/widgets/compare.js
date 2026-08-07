import React from 'react';
import { useSelector } from 'react-redux';
import Link from 'next/link';

// mui
import { IconButton, alpha, Stack, Typography } from '@mui/material';

// icons
import { GoGitCompare } from 'react-icons/go';

export default function CompareWidget() {
  const { products: compareProducts } = useSelector(({ compare }) => compare);
  return (
    <Link href="/compare" style={{ textDecoration: "none" }}>
  <Stack
    direction="row"
    spacing={1}
    alignItems="center"
    width="auto"
    sx={{
      cursor: "pointer",
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
      <GoGitCompare size={20} />
    </IconButton>

    {/* TEXT */}
    <Stack gap={0}>
      {/* <Typography
        sx={{
          fontSize: "12px",
          lineHeight: "14px",
          color: "text.primary",
        }}
      >
        Compare
      </Typography> */}

      {/* <Typography
        sx={{
          fontSize: "12px",
          lineHeight: "14px",
          color: "text.secondary",
        }}
      >
        {compareProducts?.length || 0}{" "}
        {compareProducts?.length > 1 ? "Items" : "Item"}
      </Typography> */}
    </Stack>
  </Stack>
</Link>
  );
}
