import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Divider, Chip, Avatar, IconButton, Tooltip, CircularProgress,
  Alert, Skeleton, Tab, Tabs, InputAdornment, useTheme,
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import GroupIcon from '@mui/icons-material/Group';
import EngineeringIcon from '@mui/icons-material/Engineering';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { ApiService } from '../services/api';
import { useAppTheme } from '../context/ThemeContext';

const ROLE_CONFIG = {
  ADMIN: { color: '#dc2626', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', icon: <AdminPanelSettingsOutlinedIcon fontSize="small" /> },
  AGENT: { color: '#d97706', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', icon: <SupportAgentOutlinedIcon fontSize="small" /> },
  USER:  { color: '#059669', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', icon: <PersonOutlinedIcon fontSize="small" /> },
};

// ── Create Agent Form Component ───────────────────────────────────────────────
function CreateAgentForm({ onSuccess, onToast }) {
  const { currentTheme } = useAppTheme();
  const theme = useTheme();
  const [showPw, setShowPw] = useState(false);

  const fieldSx = {
    mb: 2.5,
    '& .MuiOutlinedInput-root': {
      color: theme.palette.text.primary,
      bgcolor: currentTheme.inputBg,
      borderRadius: 2.5,
      '& fieldset': { borderColor: currentTheme.cardBorder },
      '&:hover fieldset': { borderColor: theme.palette.primary.main },
      '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
    },
    '& .MuiInputLabel-root': { color: theme.palette.text.secondary },
    '& .MuiFormHelperText-root': { color: '#dc2626', fontSize: '0.72rem' },
  };

  const formik = useFormik({
    initialValues: { name: '', email: '', password: '' },
    validationSchema: Yup.object({
      name:     Yup.string().trim().min(2, 'Min 2 characters').max(60).required('Name is required'),
      email:    Yup.string().email('Enter a valid email').required('Email is required'),
      password: Yup.string().min(6, 'Min 6 characters').required('Password is required'),
    }),
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const res = await ApiService.createAgent(values.name.trim(), values.email.trim(), values.password);
        if (res.success) {
          onToast(`Agent "${values.name}" created successfully`, 'success');
          resetForm();
          onSuccess();
        } else {
          onToast(res.message || 'Failed to create agent', 'error');
        }
      } catch (e) {
        const msg = e?.response?.data?.message;
        if (e?.response?.status === 409) onToast('Email already registered', 'error');
        else if (e?.response?.status === 403) onToast('Only Admin can create agents', 'error');
        else onToast(msg || 'Failed to create agent — check connection', 'error');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: 3,
          p: 2,
          bgcolor: 'rgba(245,158,11,0.08)',
          borderRadius: 3,
          border: '1px solid rgba(245,158,11,0.25)',
        }}
      >
        <EngineeringIcon sx={{ color: '#d97706', fontSize: '1.4rem' }} />
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#d97706' }}>Create Agent Account</Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Agent can manage & resolve tickets assigned to them</Typography>
        </Box>
      </Box>

      <TextField
        fullWidth size="small" id="agent-name" name="name" label="Full Name" sx={fieldSx}
        value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur}
        error={formik.touched.name && Boolean(formik.errors.name)}
        helperText={formik.touched.name && formik.errors.name}
        InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlineIcon sx={{ color: theme.palette.text.secondary, fontSize: '1rem' }} /></InputAdornment> }}
      />
      <TextField
        fullWidth size="small" id="agent-email" name="email" label="Email Address" sx={fieldSx}
        value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
        InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlinedIcon sx={{ color: theme.palette.text.secondary, fontSize: '1rem' }} /></InputAdornment> }}
      />
      <TextField
        fullWidth size="small" id="agent-password" name="password" label="Password"
        type={showPw ? 'text' : 'password'} sx={fieldSx}
        value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setShowPw(s => !s)} sx={{ color: theme.palette.text.secondary }}>
                {showPw ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        type="submit" variant="contained" fullWidth
        disabled={formik.isSubmitting}
        endIcon={formik.isSubmitting ? <CircularProgress size={16} color="inherit" /> : <PersonAddAlt1Icon />}
        sx={{
          py: 1.3, borderRadius: 2.5, fontWeight: 800, textTransform: 'none',
          background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
          color: '#ffffff',
          boxShadow: '0 4px 15px rgba(245,158,11,0.3)',
          '&:hover': { background: 'linear-gradient(135deg, #b45309, #92400e)' },
          '&:disabled': { opacity: 0.6 },
        }}
      >
        {formik.isSubmitting ? 'Creating agent…' : 'Create Agent Account'}
      </Button>
    </Box>
  );
}

// ── User Row Component ─────────────────────────────────────────────────────────
function UserRow({ user, onDelete }) {
  const { currentTheme } = useAppTheme();
  const theme = useTheme();
  const rc = ROLE_CONFIG[user.role] || ROLE_CONFIG.USER;

  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'center', gap: 2,
        p: 1.75, mb: 1,
        bgcolor: currentTheme.chipBg,
        border: `1px solid ${currentTheme.cardBorder}`,
        borderRadius: 2.5,
        transition: 'all 0.2s',
        '&:hover': { bgcolor: currentTheme.cardHoverBorder + '15', border: `1px solid ${currentTheme.cardHoverBorder}` },
      }}
    >
      <Avatar sx={{ width: 38, height: 38, fontSize: '0.85rem', fontWeight: 800, background: currentTheme.accentGradient, color: '#ffffff' }}>
        {rc.icon}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.text.primary, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.name}
        </Typography>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.75rem' }}>
          {user.email}
        </Typography>
      </Box>
      <Chip
        label={user.role}
        size="small"
        sx={{ bgcolor: rc.bg, color: rc.color, border: `1px solid ${rc.border}`, fontWeight: 800, fontSize: '0.65rem', height: 22 }}
      />
      {user.role !== 'ADMIN' && (
        <Tooltip title={`Delete ${user.role.toLowerCase()} account`}>
          <IconButton
            size="small"
            onClick={() => onDelete(user)}
            sx={{ color: theme.palette.text.secondary, '&:hover': { color: '#dc2626', bgcolor: 'rgba(239,68,68,0.1)' } }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}

// ── AdminPanel Component ───────────────────────────────────────────────────────
export default function AdminPanel({ onToast }) {
  const { currentTheme } = useAppTheme();
  const theme = useTheme();

  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await ApiService.getUsers();
      if (res.success) setUsers(Array.isArray(res.data) ? res.data : []);
      else setError(res.message || 'Failed to load users');
    } catch (e) {
      setError(e?.response?.data?.message || 'Cannot connect to auth service');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleDelete = async (targetUser) => {
    if (!window.confirm(`Delete ${targetUser.role} account "${targetUser.name}" (${targetUser.email})?`)) return;
    try {
      const res = await ApiService.deleteUser(targetUser.id);
      if (res.success) {
        onToast(`"${targetUser.name}" deleted`, 'info');
        loadUsers();
      } else {
        onToast(res.message || 'Delete failed', 'error');
      }
    } catch (e) {
      onToast(e?.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const agents = users.filter(u => u.role === 'AGENT');
  const regularUsers = users.filter(u => u.role === 'USER');
  const allUsers = users;

  return (
    <Card
      sx={{
        background: currentTheme.cardBg,
        backdropFilter: 'blur(16px)',
        border: `1px solid ${currentTheme.cardBorder}`,
        borderRadius: 4,
        boxShadow: `0 20px 40px ${currentTheme.cardGlow}`,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
              p: 1,
              borderRadius: 2.5,
              display: 'flex',
              color: '#ffffff',
              boxShadow: '0 4px 15px rgba(245,158,11,0.3)',
            }}
          >
            <AdminPanelSettingsIcon sx={{ fontSize: '1.4rem' }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary, lineHeight: 1 }}>
              Admin Management Panel
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
              Manage agents & user permissions · {users.length} registered accounts
            </Typography>
          </Box>
          {/* Quick stats */}
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <Chip icon={<EngineeringIcon sx={{ fontSize: '0.8rem !important' }} />} label={`${agents.length} Agents`} size="small"
              sx={{ bgcolor: 'rgba(245,158,11,0.12)', color: '#d97706', border: '1px solid rgba(245,158,11,0.3)', fontWeight: 700 }} />
            <Chip icon={<GroupIcon sx={{ fontSize: '0.8rem !important' }} />} label={`${regularUsers.length} Users`} size="small"
              sx={{ bgcolor: 'rgba(16,185,129,0.12)', color: '#059669', border: '1px solid rgba(16,185,129,0.3)', fontWeight: 700 }} />
          </Box>
        </Box>

        <Tabs
          value={tab} onChange={(_, v) => setTab(v)}
          sx={{
            mb: 3,
            '& .MuiTab-root': { color: theme.palette.text.secondary, fontWeight: 700, textTransform: 'none', fontSize: '0.88rem' },
            '& .Mui-selected': { color: '#d97706 !important' },
            '& .MuiTabs-indicator': { bgcolor: '#d97706', height: 3, borderRadius: '3px' },
          }}
        >
          <Tab id="admin-tab-create" label="Create Agent Account" />
          <Tab id="admin-tab-users" label={`All Accounts (${users.length})`} />
        </Tabs>

        {/* Tab 0: Create Agent */}
        {tab === 0 && <CreateAgentForm onSuccess={loadUsers} onToast={onToast} />}

        {/* Tab 1: All Users */}
        {tab === 1 && (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2.5, bgcolor: 'rgba(239,68,68,0.12)', color: '#dc2626' }}>
                {error}
              </Alert>
            )}

            {loading ? (
              [...Array(4)].map((_, i) => (
                <Skeleton key={i} variant="rounded" height={60} sx={{ bgcolor: currentTheme.chipBg, mb: 1, borderRadius: 2.5 }} />
              ))
            ) : allUsers.length === 0 ? (
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: 'center', py: 4 }}>
                No accounts found
              </Typography>
            ) : (
              <>
                {/* Admins */}
                {allUsers.filter(u => u.role === 'ADMIN').length > 0 && (
                  <>
                    <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', mb: 1, display: 'block' }}>
                      Administrators
                    </Typography>
                    {allUsers.filter(u => u.role === 'ADMIN').map(u => <UserRow key={u.id} user={u} onDelete={handleDelete} />)}
                    <Divider sx={{ borderColor: currentTheme.cardBorder, my: 2 }} />
                  </>
                )}
                {/* Agents */}
                {agents.length > 0 && (
                  <>
                    <Typography variant="caption" sx={{ color: '#d97706', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', mb: 1, display: 'block' }}>
                      Support Agents
                    </Typography>
                    {agents.map(u => <UserRow key={u.id} user={u} onDelete={handleDelete} />)}
                    <Divider sx={{ borderColor: currentTheme.cardBorder, my: 2 }} />
                  </>
                )}
                {/* Users */}
                {regularUsers.length > 0 && (
                  <>
                    <Typography variant="caption" sx={{ color: '#059669', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', mb: 1, display: 'block' }}>
                      End Users
                    </Typography>
                    {regularUsers.map(u => <UserRow key={u.id} user={u} onDelete={handleDelete} />)}
                  </>
                )}
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
