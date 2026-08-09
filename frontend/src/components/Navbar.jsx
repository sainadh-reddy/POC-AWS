import React, { useEffect, useState } from 'react';
import {
  AppBar, Toolbar, Box, Typography, Chip, Avatar, Tooltip, IconButton, useTheme,
} from '@mui/material';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import LogoutIcon from '@mui/icons-material/Logout';

import { ApiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';

export default function Navbar({ onRefresh }) {
  const { user, logout } = useAuth();
  const { currentTheme } = useAppTheme();
  const theme = useTheme();

  const [status, setStatus] = useState('checking');

  const checkHealth = async () => {
    try {
      const res = await ApiService.checkHealth();
      setStatus(res?.status === 'UP' ? 'online' : 'offline');
    } catch {
      setStatus('offline');
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const roleColors = {
    ADMIN: { bg: 'rgba(239,68,68,0.12)', color: '#dc2626', border: 'rgba(239,68,68,0.3)' },
    AGENT: { bg: 'rgba(245,158,11,0.12)', color: '#d97706', border: 'rgba(245,158,11,0.3)' },
    USER:  { bg: 'rgba(16,185,129,0.12)', color: '#059669', border: 'rgba(16,185,129,0.3)' },
  };

  const rc = roleColors[user?.role] || roleColors.USER;

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: currentTheme.navbarBg,
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${currentTheme.cardBorder}`,
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 0.75, px: { xs: 2, sm: 4 } }}>
        {/* Brand Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              background: currentTheme.accentGradient,
              borderRadius: 2.5,
              p: 0.9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 20px ${currentTheme.cardGlow}`,
            }}
          >
            <ConfirmationNumberOutlinedIcon sx={{ color: 'white', fontSize: '1.4rem' }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary, lineHeight: 1, letterSpacing: '-0.5px' }}>
              Ticket<span style={{ color: theme.palette.primary.main }}>Desk</span>
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, letterSpacing: '1.5px', textTransform: 'uppercase', fontSize: '0.62rem', fontWeight: 700 }}>
              Enterprise Support Platform
            </Typography>
          </Box>
        </Box>

        {/* Status & User Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* API Health Chip */}
          <Chip
            icon={status === 'online' ? <CloudDoneIcon sx={{ fontSize: '0.95rem !important' }} /> : <CloudOffIcon sx={{ fontSize: '0.95rem !important' }} />}
            label={status === 'checking' ? 'Checking...' : status === 'online' ? 'API Online' : 'API Offline'}
            size="small"
            sx={{
              bgcolor: status === 'online' ? 'rgba(16,185,129,0.12)' : status === 'offline' ? 'rgba(239,68,68,0.12)' : 'rgba(100,116,139,0.12)',
              color: status === 'online' ? '#059669' : status === 'offline' ? '#dc2626' : '#64748b',
              border: `1px solid ${status === 'online' ? 'rgba(16,185,129,0.3)' : status === 'offline' ? 'rgba(239,68,68,0.3)' : 'rgba(100,116,139,0.3)'}`,
              fontWeight: 700,
              fontSize: '0.72rem',
            }}
          />

          {/* Refresh Button */}
          <Tooltip title="Refresh Data">
            <IconButton onClick={onRefresh} size="small" sx={{ color: theme.palette.text.secondary, '&:hover': { color: theme.palette.primary.main, bgcolor: currentTheme.chipBg } }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* User Profile */}
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pl: 1, borderLeft: `1px solid ${currentTheme.cardBorder}` }}>
              <Avatar
                sx={{
                  width: 36, height: 36, fontSize: '0.85rem', fontWeight: 800,
                  background: currentTheme.accentGradient,
                  boxShadow: `0 2px 10px ${currentTheme.cardGlow}`,
                  color: '#ffffff',
                }}
              >
                {user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.text.primary, lineHeight: 1.1 }}>
                  {user.name}
                </Typography>
                <Chip
                  label={user.role}
                  size="small"
                  sx={{
                    bgcolor: rc.bg, color: rc.color, border: `1px solid ${rc.border}`,
                    fontWeight: 800, fontSize: '0.62rem', height: 18, mt: 0.3,
                  }}
                />
              </Box>
              <Tooltip title="Logout">
                <IconButton onClick={logout} size="small" sx={{ color: '#dc2626', '&:hover': { bgcolor: 'rgba(239,68,68,0.12)' } }}>
                  <LogoutIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
