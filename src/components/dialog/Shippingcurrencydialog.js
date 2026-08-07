'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Divider, Autocomplete, TextField
} from '@mui/material';
import { IoClose } from 'react-icons/io5';
import { MdAttachMoney } from 'react-icons/md';
import { currencies as CURRENCIES } from '@/utils/currency';

export default function CurrencyDialog({
  open,
  onClose,
  /** Pass the currently-resolved currency so the dialog opens pre-filled */
  initialCurrency = 'USD',
}) {
  const [currency, setCurrency] = useState('USD');

  // Sync local state whenever the dialog opens or initialCurrency changes
  useEffect(() => {
    if (!open) return;
    setCurrency(initialCurrency ?? 'USD');
  }, [open, initialCurrency]);

  const handleSave = () => {
    onClose({ currency });
  };

  const activeCurrency = CURRENCIES.find((c) => c.currency  === currency);

  return (
    <Dialog
      open={open}
      onClose={() => onClose(null)}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 24px 48px rgba(0,0,0,0.14)',
        },
      }}
    >
      {/* ── header ─────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          px: 3, pt: 3, pb: 2,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '17px', color: '#111' }}>
            Currency
          </Typography>
          <Typography sx={{ fontSize: '13px', color: '#6b7280', mt: 0.3 }}>
            Choose your preferred currency.
          </Typography>
        </Box>
        <IconButton onClick={() => onClose(null)} size="small" sx={{ color: '#9ca3af', mt: -0.5, mr: -0.5 }}>
          <IoClose size={20} />
        </IconButton>
      </Box>

      <Divider />

      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.2 }}>
            <MdAttachMoney size={16} color="#c7d96a" />
            <Typography sx={{ fontWeight: 600, fontSize: '13px', color: '#374151' }}>
              Currency
            </Typography>
          </Stack>

         <Autocomplete
                options={CURRENCIES}
                value={activeCurrency || null}
                onChange={(_, val) => setCurrency(val ? val.currency  : 'USD')}
                getOptionLabel={(o) => `${o.symbol} ${o.code} — ${o.currency}`}
                isOptionEqualToValue={(a, b) => a.currency  === b.currency }
                renderOption={(props, option) => (
                  <Box component="li" {...props} key={option.code} sx={{ fontSize: '13px', gap: 1 }}>
                    <strong>{option.symbol}</strong> {option.code} — {option.currency}
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search currency…"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        fontSize: '13px',
                        '& fieldset': { borderColor: '#e5e7eb' },
                        '&:hover fieldset': { borderColor: '#c7d96a' },
                        '&.Mui-focused fieldset': { borderColor: '#c7d96a', borderWidth: '1.5px' },
                      },
                    }}
                  />
                )}
              />

          {activeCurrency && (
            <Typography sx={{ fontSize: '11.5px', color: '#9ca3af', mt: 1 }}>
              Prices shown in{' '}
              <strong style={{ color: '#374151' }}>{activeCurrency.currency}</strong>
            </Typography>
          )}
        </Box>
      </DialogContent>

      <Divider />

      {/* ── footer ─────────────────────────────────────────────────────────── */}
      <Box sx={{ px: 3, py: 2, display: 'flex', gap: 1.5 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => onClose(null)}
          sx={{
            borderRadius: '10px', textTransform: 'none',
            borderColor: '#e5e7eb', color: '#374151',
            fontWeight: 500, fontSize: '13px',
            '&:hover': { borderColor: '#c7d96a', backgroundColor: 'transparent' },
          }}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={handleSave}
          sx={{
            borderRadius: '10px', textTransform: 'none',
            backgroundColor: '#c7d96a', color: '#1a2000',
            fontWeight: 600, fontSize: '13px', boxShadow: 'none',
            '&:hover': { backgroundColor: '#b5c85a', boxShadow: 'none' },
          }}
        >
          Save preference
        </Button>
      </Box>
    </Dialog>
  );
}