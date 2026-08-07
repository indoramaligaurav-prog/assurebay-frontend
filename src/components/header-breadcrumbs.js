//
'use client';
import { isString, last } from 'lodash';
import PropTypes from 'prop-types';
import Link from '@/utils/link';

// mui
import { Box, Button, Stack, Typography, alpha, useTheme, Breadcrumbs } from '@mui/material';
import { IoMdAdd } from 'react-icons/io';

// components
import { createGradient } from 'src/theme/palette';

function LinkItem({ link, admin }) {
  const { href, name, icon } = link;
  return (
    <Typography
      component={Link}
      key={name}
      href={href}
      passHref
      variant={admin ? 'subtitle1' : 'subtitle2'}
      sx={{
        lineHeight: 2,
        display: 'flex',
        alignItems: 'center',
        color: admin ? 'text.primary' : 'common.white',
        '& > div': { display: 'inherit' }
      }}
    >
      {icon && (
        <Box
          sx={{
            mr: 1,
            '& svg': {
              width: admin ? 30 : 20,
              height: admin ? 30 : 20,
              color: admin ? 'text.primary' : 'common.white'
            }
          }}
        >
          {icon}
        </Box>
      )}
      {name}
    </Typography>
  );
}

LinkItem.propTypes = {
  link: PropTypes.shape({
    href: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    icon: PropTypes.node
  }).isRequired,
  admin: PropTypes.bool.isRequired
};

function MBreadcrumbs({ links, admin, activeLast = false, ...other }) {
  const currentLink = last(links)?.name;

  const listDefault = links.map((link) => <LinkItem key={link.name} link={link} admin={admin} />);
  const listActiveLast = links.map((link) => (
    <div key={link.name}>
      {link.name !== currentLink ? (
        <LinkItem link={link} admin={admin} />
      ) : (
        <Typography
          variant={admin ? 'subtitle1' : 'subtitle2'}
          sx={{
            maxWidth: 260,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            color: (theme) => theme.palette.grey[400],
            textOverflow: 'ellipsis'
          }}
        >
          {currentLink}
        </Typography>
      )}
    </div>
  ));

  return (
    <Breadcrumbs separator="›" {...other}>
      {activeLast ? listDefault : listActiveLast}
    </Breadcrumbs>
  );
}

MBreadcrumbs.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.shape({
      href: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      icon: PropTypes.node
    })
  ).isRequired,
  admin: PropTypes.bool.isRequired,
  icon: PropTypes.node,
  activeLast: PropTypes.bool
};

export default function HeaderBreadcrumbs({ links, heading }) {
  const current = links[links.length - 1]?.name;

  return (
    <Box sx={{ mb: 2 }}>
      
      {/* Heading */}
      <Typography
        variant="h4"
        sx={{ fontWeight: 600, textTransform: 'capitalize', mb: 0.5 }}
      >
        {heading}
      </Typography>

      {/* Breadcrumb Path */}
      <Breadcrumbs separator="›">
        {links.map((link, index) => {
          const isLast = link.name === current;

          return isLast ? (
            <Typography
              key={link.name}
              sx={{ fontWeight: 700, color: 'text.primary' }}
            >
              {link.name}
            </Typography>
          ) : (
            <Typography
              key={link.name}
              component={Link}
              href={link.href}
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              {link.name}
            </Typography>
          );
        })}
      </Breadcrumbs>

    </Box>
  );
}
HeaderBreadcrumbs.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.shape({
      href: PropTypes.string,
      name: PropTypes.string,
      icon: PropTypes.node
    })
  ).isRequired,
  action: PropTypes.oneOfType([
    PropTypes.shape({
      href: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      icon: PropTypes.node
    }),
    PropTypes.node
  ]),
  icon: PropTypes.node,
  heading: PropTypes.string,
  moreLink: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  sx: PropTypes.object,
  admin: PropTypes.bool,
  isUser: PropTypes.bool
};
