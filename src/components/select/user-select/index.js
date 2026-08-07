'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from '@bprogress/next';
// mui
import { Avatar, IconButton, Box, Stack, Typography } from '@mui/material';
import { FiUser } from 'react-icons/fi';

// components
import MenuPopover from 'src/components/popover';
import { PATH_PAGE } from 'src/routes/paths';
import { UserList } from 'src/components/lists';
import BlurImageAvatar from '@/components/avatar';
// redux
import { useSelector } from 'react-redux';

function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

export default function UserSelect() {
  const { user, isAuthenticated } = useSelector(({ user }) => user);
  const router = useRouter();
  const pathname = usePathname();
  const isAuthPath = getKeyByValue(PATH_PAGE.auth, pathname);
  const isHomePath = pathname.slice(3) === '';
  const anchorRef = React.useRef(null);
  const [openUser, setOpen] = React.useState(false);

  const handleOpenUser = () => {
    if (!isAuthenticated) {
      router.push('/auth/sign-in');
    } else {
      setOpen(true);
    }
  };
  const handleCloseUser = () => {
    setOpen(false);
  };
  return (
 <Box>
  {!isAuthenticated ? (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{
        cursor: "pointer",
        "&:hover": {
          color: "primary.main",
        },
      }}
      onClick={() =>
        router.push(
          `/auth/sign-in${
            isAuthPath || isHomePath ? "" : `?redirect=${pathname}`
          }`
        )
      }
    >
      {/* ICON */}
      <IconButton
        disableRipple
        sx={{
          p: 0,
          m: 0,
          bgcolor: "transparent",
          "&:hover": { bgcolor: "transparent" },
        }}
      >
        <FiUser size={20} />
      </IconButton>

      {/* TEXT */}
      <Typography
        sx={{
          fontSize: "12px",
          lineHeight: "14px",
          color: "text.primary",
        }}
      >
        Sign In
      </Typography>
    </Stack>
  ) : (
    <>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          cursor: "pointer",
          "&:hover": {
            color: "primary.main",
          },
        }}
        ref={anchorRef}
        onClick={handleOpenUser}
      >
        {/* AVATAR */}
        <IconButton
          disableRipple
          sx={{
            p: 0,
            m: 0,
            bgcolor: "transparent",
            "&:hover": { bgcolor: "transparent" },
          }}
        >
          {user?.cover?.url ? (
            <BlurImageAvatar
              priority
              alt={user.firstName}
              src={user?.cover?.url}
              layout="fill"
              objectFit="cover"
            />
          ) : (
            <Avatar
              sx={{
                width: 24,
                height: 24,
                fontSize: "12px",
              }}
            >
              {user?.firstName?.slice(0, 1)?.toUpperCase()}
            </Avatar>
          )}
        </IconButton>

        {/* TEXT */}
        <Typography
          sx={{
            fontSize: "12px",
            lineHeight: "14px",
            color: "text.primary",
          }}
        >
          Account
        </Typography>
      </Stack>

      <MenuPopover
        open={openUser}
        onClose={handleCloseUser}
        anchorEl={anchorRef.current}
        sx={{ width: 300 }}
      >
        <UserList
          openUser={openUser}
          isAuthenticated={isAuthenticated}
          user={user}
          setOpen={() => setOpen(false)}
        />
      </MenuPopover>
    </>
  )}
</Box>
  );
}
