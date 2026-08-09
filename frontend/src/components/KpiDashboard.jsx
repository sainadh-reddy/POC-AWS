import React from 'react';
import { Card, CardContent, Typography, Box, Skeleton, LinearProgress, useTheme } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import SyncIcon from '@mui/icons-material/Sync';
import VerifiedIcon from '@mui/icons-material/Verified';
import LockIcon from '@mui/icons-material/Lock';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import { useAppTheme } from '../context/ThemeContext';

export default function KpiDashboard({ stats, loading }) {
  const { currentTheme } = useAppTheme();
  const theme = useTheme();

  const total = stats?.totalTickets || 1;

  const CARDS = [
    {
      title: 'Total Tickets',
      value: stats?.totalTickets ?? 0,
      color: theme.palette.primary.main,
      glow: theme.palette.primary.main,
      gradient: currentTheme.accentGradient,
      icon: <TrendingUpIcon />,
      pct: 100,
    },
    {
      title: 'Open Tickets',
      value: stats?.statusCounts?.OPEN ?? 0,
      color: '#2563eb',
      glow: '#2563eb',
      gradient: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
      icon: <PendingActionsIcon />,
      pct: Math.round(((stats?.statusCounts?.OPEN ?? 0) / total) * 100),
    },
    {
      title: 'In Progress',
      value: stats?.statusCounts?.IN_PROGRESS ?? 0,
      color: '#d97706',
      glow: '#d97706',
      gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
      icon: <SyncIcon />,
      pct: Math.round(((stats?.statusCounts?.IN_PROGRESS ?? 0) / total) * 100),
    },
    {
      title: 'Resolved Tickets',
      value: stats?.statusCounts?.RESOLVED ?? 0,
      color: '#059669',
      glow: '#059669',
      gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      icon: <VerifiedIcon />,
      pct: Math.round(((stats?.statusCounts?.RESOLVED ?? 0) / total) * 100),
    },
    {
      title: 'Closed Tickets',
      value: stats?.statusCounts?.CLOSED ?? 0,
      color: '#64748b',
      glow: '#64748b',
      gradient: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
      icon: <LockIcon />,
      pct: Math.round(((stats?.statusCounts?.CLOSED ?? 0) / total) * 100),
    },
    {
      title: 'Urgent Priority',
      value: stats?.priorityCounts?.URGENT ?? 0,
      color: '#dc2626',
      glow: '#dc2626',
      gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
      icon: <ErrorOutlineIcon />,
      pct: Math.round(((stats?.priorityCounts?.URGENT ?? 0) / total) * 100),
    },
    {
      title: 'High Priority',
      value: stats?.priorityCounts?.HIGH ?? 0,
      color: '#ea580c',
      glow: '#ea580c',
      gradient: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
      icon: <PriorityHighIcon />,
      pct: Math.round(((stats?.priorityCounts?.HIGH ?? 0) / total) * 100),
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gap: 2.5,
        mb: 4,
      }}
    >
      {CARDS.map((card, i) => (
        <Card
          key={i}
          sx={{
            background: currentTheme.cardBg,
            backdropFilter: 'blur(16px)',
            border: `1px solid ${currentTheme.cardBorder}`,
            borderRadius: 3.5,
            height: 150,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 10px 25px -5px rgba(0, 0, 0, 0.4)'
              : '0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
            '&:hover': {
              transform: 'translateY(-4px)',
              borderColor: card.glow + '80',
              boxShadow: `0 12px 30px ${card.glow}25`,
            },
          }}
        >
          {/* Top colored gradient stripe */}
          <Box sx={{ height: 4, background: card.gradient, width: '100%' }} />

          <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', '&:last-child': { pb: 2 } }}>
            {/* Header row */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                  {card.title}
                </Typography>
                {loading ? (
                  <Skeleton variant="text" width={60} height={40} sx={{ bgcolor: currentTheme.chipBg }} />
                ) : (
                  <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.text.primary, mt: 0.25, lineHeight: 1.1, fontSize: '1.75rem' }}>
                    {card.value}
                  </Typography>
                )}
              </Box>

              <Box
                sx={{
                  background: card.gradient,
                  color: '#ffffff',
                  p: 1.1,
                  borderRadius: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 12px ${card.glow}35`,
                  '& svg': { fontSize: '1.3rem' },
                }}
              >
                {card.icon}
              </Box>
            </Box>

            {/* Equal Height Mini Progress Bar Footer */}
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontSize: '0.68rem', color: theme.palette.text.secondary, fontWeight: 600 }}>
                  Share of Total
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.68rem', color: card.color, fontWeight: 800 }}>
                  {card.pct}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, Math.max(0, card.pct))}
                sx={{
                  height: 5,
                  borderRadius: 3,
                  bgcolor: currentTheme.chipBg,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    background: card.gradient,
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
