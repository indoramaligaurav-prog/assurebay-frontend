'use client';

import React from 'react';
import Link from 'next/link';

import {
  Box,
  Container,
  Stack,
  Typography,
  Button,
  IconButton,
  Divider
} from '@mui/material';

import Logo from '@/components/logo';
import NewsLetter from './newsletter';

import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import ArrowUpwardOutlinedIcon from '@mui/icons-material/ArrowUpwardOutlined';

import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaXTwitter
} from 'react-icons/fa6';

const FOOTER_COLUMNS = [
  {
    heading: 'Sell on Wreeo',
    links: [
      { label: 'Start selling', href: '/seller/register' },
      { label: 'How to sell', href: '/how-to-sell' },
      { label: 'Business sellers', href: '/business-sellers' },
      { label: 'Why sell on Wreeo', href: '/why-sell' },
      { label: 'Commission structure', href: '/commission-structure' },
      { label: 'Global reach', href: '/global-reach' },
      { label: 'Seller centre', href: '/seller' },
      { label: 'Onboarding', href: '/seller/onboarding' }
    ]
  },
  {
    heading: 'Buy on Wreeo',
    links: [
      { label: 'Browse categories', href: '/categories' },
      { label: 'How to buy', href: '/how-to-buy' },
      { label: 'Buyer protection', href: '/buyer-protection' },
      { label: 'Shipping & delivery', href: '/shipping-policy' },
      { label: 'Returns & refunds', href: '/refund-policy' },
      { label: 'Track your order', href: '/profile/orders' }
    ]
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Wreeo', href: '/about-us' },
      { label: 'Leadership', href: '/leadership' },
      { label: 'Careers', href: '/careers' },
      { label: 'Newsroom', href: '/newsroom' },
      { label: 'Events', href: '/events' }
    ]
  },
  {
    heading: 'Support',
    links: [
      { label: 'Help centre', href: '/support' },
      { label: 'Contact us', href: '/contact-us' },
      { label: 'Account login', href: '/login' },
      { label: 'Dispute resolution', href: '/dispute-resolution' },
      { label: 'FAQ', href: '/faq' }
    ]
  },
  {
    heading: 'Partnerships & programs',
    links: [
      { label: 'Affiliate program', href: '/affiliate-program' },
      { label: 'Partner with us', href: '/partnerships' },
      {
        label: 'Vendor verification program',
        href: '/vendor-verification'
      }
    ]
  }
];

const LEGAL_LINKS = [
  { label: 'Terms of service', href: '/terms-and-conditions' },
  { label: 'Privacy policy', href: '/privacy-policy' },
  { label: 'Cookie policy', href: '/cookie-policy' },
  { label: 'Refund policy', href: '/refund-policy' },
  { label: 'Seller agreement', href: '/seller-agreement' },
  { label: 'Buyer agreement', href: '/buyer-agreement' }
];

const SOCIAL_LINKS = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/',
    icon: <FaFacebookF />
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/',
    icon: <FaInstagram />
  },
  {
    label: 'Twitter (X)',
    href: 'https://x.com/',
    icon: <FaXTwitter />
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/',
    icon: <FaYoutube />
  }
];

const FOOTER_ACTIONS = [
  {
    label: 'Messages',
    icon: <ChatBubbleOutlineOutlinedIcon />,
    href: '/messages'
  },
  {
    label: 'Telegram',
    icon: <SendOutlinedIcon />,
    href: 'https://telegram.org/'
  },
  {
    label: 'Email',
    icon: <MailOutlineIcon />,
    href: '/contact-us'
  },
  {
    label: 'Phone',
    icon: <PhoneOutlinedIcon />,
    href: '/contact-us'
  }
];

const utilityButtonSx = {
  minHeight: 44,
  px: 1.5,
  border: '1px solid #E0E5EB',
  borderRadius: '12px',
  color: '#718096',
  bgcolor: '#FFFFFF',
  fontSize: 13,
  fontWeight: 400,
  textTransform: 'none',
  whiteSpace: 'nowrap',
  '&:hover': {
    bgcolor: '#FFFFFF',
    borderColor: '#C74735'
  }
};

const footerLinkSx = {
  color: '#718096',
  fontSize: 14,
  fontWeight: 400,
  lineHeight: 1.5,
  textDecoration: 'none',
  transition: 'color 0.2s ease',
  '&:hover': {
    color: '#C74735'
  }
};

export default function Footer({ branding }) {
  const contact = branding?.contact || {};

  const socialLinks = SOCIAL_LINKS;

  const footerActions = FOOTER_ACTIONS.map((item) => {
    if (item.label === 'Email' && contact.email) {
      return {
        ...item,
        href: `mailto:${contact.email}`
      };
    }

    if (item.label === 'Phone' && contact.whatsappNo) {
      return {
        ...item,
        href: `tel:${contact.whatsappNo}`
      };
    }

    if (item.label === 'Telegram' && contact.telegram) {
      return {
        ...item,
        href: contact.telegram
      };
    }

    return item;
  });

  return (
    <Box
  component="footer"
  sx={{
    width: '100%',
    maxWidth: '100%',
    mt: 1,
    px: { xs: 0.5, sm: 1, md: 1.5 },
    pb: 1,
    bgcolor: '#F8FAFC',
    color: '#405363',
    boxSizing: 'border-box'
  }}
>
      <Container
  maxWidth={false}
  disableGutters
  sx={{
    width: '100%',
    maxWidth: '1600px',
    mx: 'auto',
    bgcolor: '#F8FAFC',
    px: { xs: 2, sm: 3, md: 4 },
    pt: { xs: 3, md: 4 },
    pb: 2,
    borderRadius: 0,
    boxSizing: 'border-box'
  }}
>
        {/* Top: Logo and newsletter */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={{ xs: 3, md: 5 }}
          sx={{
            pb: { xs: 3, md: 4 }
          }}
        >
          <Box
            sx={{
              flex: 1,
              minWidth: 0
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                minHeight: 54,
                '& img': {
                  maxWidth: 190,
                  maxHeight: 54,
                  objectFit: 'contain',
                  objectPosition: 'left center'
                }
              }}
            >
              <Logo branding={branding} />
            </Box>

            <Typography
              sx={{
                mt: 0.5,
                color: '#718096',
                fontSize: 14,
                lineHeight: 1.6
              }}
            >
              A marketplace for what’s next.
            </Typography>
          </Box>

          <Box
            sx={{
              width: { xs: '100%', md: '50%' },
              maxWidth: 600
            }}
          >
            <Typography
              sx={{
                mb: 1.25,
                fontSize: 16,
                fontWeight: 500,
                color: '#405363'
              }}
            >
              A few good finds, in your inbox.
            </Typography>

            <Box
              sx={{
                width: '100%',
                '& form': {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  width: '100%'
                },
                '& input': {
                  flex: 1,
                  minWidth: 0,
                  height: '52px',
                  boxSizing: 'border-box',
                  px: 2,
                  border: '1px solid #E0E5EB',
                  borderRadius: '12px',
                  outline: 'none',
                  bgcolor: '#FFFFFF',
                  color: '#405363',
                  fontSize: 14,
                  '&:focus': {
                    borderColor: '#C74735'
                  }
                },
                '& button': {
                  minWidth: '56px',
                  width: '56px',
                  height: '52px',
                  borderRadius: '12px',
                  bgcolor: '#F66B4D',
                  color: '#FFFFFF',
                  '&:hover': {
                    bgcolor: '#E85B40'
                  }
                }
              }}
            >
              <NewsLetter />
            </Box>

            <Typography
              sx={{
                mt: 1,
                fontSize: 11,
                color: '#94A3B8'
              }}
            >
              Preview only · no subscription is created.
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ borderColor: '#E1E6ED' }} />

        {/* Middle: Five link columns */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, minmax(0, 1fr))',
              sm: 'repeat(3, minmax(0, 1fr))',
              lg: 'repeat(5, minmax(0, 1fr))'
            },
            columnGap: { xs: 2, md: 3 },
            rowGap: { xs: 3, md: 2 },
            py: { xs: 3, md: 4 }
          }}
        >
          {FOOTER_COLUMNS.map((column) => (
            <Box key={column.heading} sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  mb: 2,
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#344653'
                }}
              >
                {column.heading}
              </Typography>

              <Stack spacing={1.25} alignItems="flex-start">
                {column.links.map((item) => (
                  <Typography
                    key={item.label}
                    component={Link}
                    href={item.href}
                    sx={footerLinkSx}
                  >
                    {item.label}
                  </Typography>
                ))}
              </Stack>
            </Box>
          ))}
        </Box>

        <Divider sx={{ borderColor: '#E1E6ED' }} />

        {/* Utility bar */}
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', lg: 'center' }}
          spacing={2}
          sx={{
            py: 2.25
          }}
        >
          {/* Country and support buttons */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.25}
            flexWrap="wrap"
            useFlexGap
          >
            <Button
              disableRipple
              startIcon={<PublicOutlinedIcon sx={{ fontSize: 19 }} />}
              endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 18 }} />}
              sx={utilityButtonSx}
            >
              🇮🇳 India · INR
            </Button>

            <Button
              component={Link}
              href="/support"
              startIcon={<HelpOutlineOutlinedIcon sx={{ fontSize: 18 }} />}
              sx={utilityButtonSx}
            >
              Help &amp; support
            </Button>
          </Stack>

          {/* Social links and contact icons */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent={{ xs: 'flex-start', lg: 'flex-end' }}
            flexWrap="wrap"
            useFlexGap
            spacing={{ xs: 1.25, sm: 1.75 }}
            sx={{
              width: { xs: '100%', lg: 'auto' }
            }}
          >
            {socialLinks.map((social) => (
              <Typography
                key={social.label}
                component="a"
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: '#718096',
                  fontSize: 13,
                  textDecoration: 'none',
                  '&:hover': {
                    color: '#C74735'
                  }
                }}
              >
                {social.label}
              </Typography>
            ))}

            <Divider
              orientation="vertical"
              flexItem
              sx={{
                mx: 0.5,
                borderColor: '#DCE2E9',
                display: { xs: 'none', sm: 'block' }
              }}
            />

            {footerActions.map((item) => (
              <IconButton
                key={item.label}
                component="a"
                href={item.href}
                aria-label={item.label}
                size="small"
                sx={{
                  width: 34,
                  height: 34,
                  color: '#718096',
                  '&:hover': {
                    color: '#C74735',
                    bgcolor: '#FCEDE9'
                  }
                }}
              >
                {item.icon}
              </IconButton>
            ))}
          </Stack>
        </Stack>

        <Divider sx={{ borderColor: '#E1E6ED' }} />

        {/* Bottom: Legal links, copyright and back to top */}
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          alignItems={{ xs: 'flex-start', lg: 'center' }}
          justifyContent="space-between"
          spacing={2}
          sx={{
            pt: 2.5
          }}
        >
          <Stack
            direction="row"
            flexWrap="wrap"
            useFlexGap
            columnGap={2.5}
            rowGap={1.25}
          >
            {LEGAL_LINKS.map((item) => (
              <Typography
                key={item.label}
                component={Link}
                href={item.href}
                sx={{
                  color: '#718096',
                  fontSize: 12,
                  textDecoration: 'none',
                  '&:hover': {
                    color: '#C74735'
                  }
                }}
              >
                {item.label}
              </Typography>
            ))}
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            spacing={2.5}
            sx={{
              flexShrink: 0
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                color: '#718096',
                whiteSpace: 'nowrap'
              }}
            >
              © {new Date().getFullYear()} Wreeo
            </Typography>

            <Typography
              component="a"
              href="#top"
              onClick={(event) => {
                event.preventDefault();
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
                });
              }}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                color: '#718096',
                fontSize: 12,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                '&:hover': {
                  color: '#C74735'
                }
              }}
            >
              Back to top
              <ArrowUpwardOutlinedIcon sx={{ fontSize: 17 }} />
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}