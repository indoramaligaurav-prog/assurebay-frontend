'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Alert, Box, Card, CardContent, Chip, Grid, LinearProgress, Skeleton, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import * as api from 'src/services';
import SellerBadge from '@/components/seller-badge';

const iconOf = (g) => g?.badges?.[0]?.icon || '•';

const describeRequirement = (g) => {
  const e = g.eligibility || {};
  const parts = [];
  if (e.minCompletedOrders) parts.push(`${e.minCompletedOrders}+ completed orders`);
  if (e.maxWeightedIncidents === 0) parts.push(`0 incidents in ${e.windowDays || 90} days`);
  if (e.maxLateShipRate != null) parts.push(`≤${Math.round(e.maxLateShipRate * 100)}% late shipping`);
  if (e.minReplyRate != null) parts.push(`≥${Math.round(e.minReplyRate * 100)}% reply rate`);
  if (e.requiresSubscription) parts.push('Active Pro subscription');
  return parts.length ? parts : ['Starting tier'];
};

export default function SellerTierCard() {
  const { user } = useSelector((s) => s.user);
  const isVendor = user?.role?.includes('vendor');
  const { data, isPending } = useQuery({
    queryKey: ['vendor-tier'],
    queryFn: api.vendorGetMyTier,
    enabled: Boolean(isVendor)
  });

  if (!isVendor) return null;
  if (isPending) return <Skeleton variant="rounded" height={300} />;

  const all = data?.grades || [];
  if (!all.length) return null;

  const completed = data.completedOrders || 0;
  const underReview = all.find((g) => g._id === data.currentId)?.key === 'review';
  const steps = all.filter((g) => g.key !== 'review');
  const currentIdx = Math.max(0, steps.findIndex((g) => g._id === data.currentId));
  const current = steps[currentIdx];
  const next = steps[currentIdx + 1];
  const target = next?.eligibility?.minCompletedOrders || 0;
  const pct = target ? Math.min(100, Math.round((completed / target) * 100)) : 100;
  const remaining = Math.max(0, target - completed);

  return (
    <Card sx={{ overflow: 'hidden' }}>
      {/* Header */}
      <Box
        sx={{
          p: 3,
          background: (t) =>
            `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.14)}, ${alpha(t.palette.primary.main, 0.02)})`
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ width: 56, height: 56, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 28, bgcolor: 'background.paper', boxShadow: 2 }}>
              {iconOf(current)}
            </Box>
            <Box>
              <Typography variant="overline" color="text.secondary">Your seller tier</Typography>
              <Typography variant="h5" fontWeight={700}>{current.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {current.description || 'Complete orders to grow your tier.'}
              </Typography>
            </Box>
          </Stack>
          <SellerBadge grade={current} size="medium" />
        </Stack>
      </Box>

      <CardContent sx={{ p: 3 }}>
        {underReview ? (
          <Alert severity="warning">Your account is currently under review. Contact support to find out what to fix.</Alert>
        ) : next ? (
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="baseline">
              <Typography variant="subtitle1" fontWeight={600}>
                Next: {iconOf(next)} {next.name}
              </Typography>
              {target > 0 && (
                <Typography variant="body2" color="text.secondary">
                  {Math.min(completed, target)} / {target} completed orders
                </Typography>
              )}
            </Stack>

            {target > 0 && (
              <LinearProgress
                variant="determinate"
                value={pct}
                sx={{ height: 14, borderRadius: 99, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { borderRadius: 99 } }}
              />
            )}
            <Typography variant="caption" color="text.secondary">
              {remaining > 0
                ? `${remaining} more completed ${remaining === 1 ? 'order' : 'orders'} to unlock ${next.name}.`
                : 'Order target reached. Your other requirements are being checked.'}
            </Typography>

            {next.perks?.length > 0 && (
              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ pt: 0.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                  Unlocks:
                </Typography>
                {next.perks.map((p) => (
                  <Chip key={p} size="small" variant="outlined" label={p} />
                ))}
              </Stack>
            )}
          </Stack>
        ) : (
          <Alert severity="success">You're at the top tier. Keep your standards up to stay here.</Alert>
        )}

        {current.key === 'new' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            An order counts as completed once the buyer receives it. Ship on time and reply to buyers quickly to build your tier.
          </Alert>
        )}

        {/* Journey */}
        <Typography variant="subtitle2" sx={{ mt: 3, mb: 1.5 }}>Tier journey</Typography>
        <Grid container spacing={1.5}>
          {steps.map((g, i) => {
            const state = i < currentIdx ? 'done' : i === currentIdx ? 'current' : 'locked';
            return (
              <Grid key={g._id} size={{ xs: 12, sm: 6, md: 3 }}>
                <Box
                  sx={{
                    p: 2,
                    height: 1,
                    borderRadius: 2,
                    border: '1.5px solid',
                    borderColor: state === 'current' ? 'primary.main' : 'divider',
                    bgcolor: (t) => (state === 'current' ? alpha(t.palette.primary.main, 0.06) : 'transparent'),
                    opacity: state === 'locked' ? 0.65 : 1
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography fontSize={22}>{iconOf(g)}</Typography>
                    {state === 'done' && <Chip size="small" color="success" label="Unlocked" />}
                    {state === 'current' && <Chip size="small" color="primary" label="You are here" />}
                  </Stack>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>{g.name}</Typography>
                  <Stack component="ul" sx={{ m: 0, mt: 0.5, pl: 2 }}>
                    {describeRequirement(g).map((r) => (
                      <Typography key={r} component="li" variant="caption" color="text.secondary">{r}</Typography>
                    ))}
                  </Stack>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
}