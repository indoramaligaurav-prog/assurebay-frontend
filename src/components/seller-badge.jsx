'use client';
import { Chip, Stack, Tooltip } from '@mui/material';

export default function SellerBadge({ grade, size = 'small' }) {
  const badges = grade?.badges || [];
  if (!badges.length) return null;
  return (
    <Stack direction="row" spacing={0.5}>
      {badges.map((b) => (
        <Tooltip key={b.label} title={grade.description || ''}>
          <Chip size={size} color={b.color || 'default'} variant="outlined" label={`${b.icon || ''} ${b.label}`.trim()} />
        </Tooltip>
      ))}
    </Stack>
  );
}