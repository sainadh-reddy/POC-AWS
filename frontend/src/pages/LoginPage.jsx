import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box, Card, CardContent, Typography, TextField,
  Button, Divider, CircularProgress, Alert, Tab, Tabs, Chip,
  InputAdornment, IconButton, useTheme, Stack,
} from '@mui/material';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';

import { ApiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';

// ── Password field with show/hide ─────────────────────────────────────────────
function PasswordField({ id, name, label, formik, fieldSx }) {
  const [show, setShow] = useState(false);
  const theme = useTheme();

  return (
    <TextField
      fullWidth id={id} name={name} label={label} size="small"
      type={show ? 'text' : 'password'}
      sx={fieldSx}
      value={formik.values[name]}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched[name] && Boolean(formik.errors[name])}
      helperText={formik.touched[name] && formik.errors[name]}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton size="small" onClick={() => setShow(s => !s)} edge="end"
              sx={{ color: theme.palette.text.secondary, '&:hover': { color: theme.palette.primary.main } }}>
              {show ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}

// ── Login Form ────────────────────────────────────────────────────────────────
function LoginForm({ onError, onSuccess, initialValues, onDemoFill }) {
  const { login } = useAuth();
  const { currentTheme } = useAppTheme();
  const theme = useTheme();

  const fieldSx = {
    mb: 2.5,
    '& .MuiOutlinedInput-root': {
      color: theme.palette.text.primary,
      bgcolor: currentTheme.inputBg,
      borderRadius: 2.5,
      '& fieldset': { borderColor: currentTheme.cardBorder },
      '&:hover fieldset': { borderColor: theme.palette.primary.main },
      '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: '1.5px' },
      '&.Mui-error fieldset': { borderColor: '#ef4444 !important' },
    },
    '& .MuiInputLabel-root': { color: theme.palette.text.secondary },
    '& .MuiInputLabel-root.Mui-focused': { color: theme.palette.primary.main },
    '& .MuiFormHelperText-root': { color: '#ef4444', fontSize: '0.72rem', mt: 0.5 },
  };

  const formik = useFormik({
    initialValues: initialValues || { email: '', password: '' },
    enableReinitialize: true,
    validationSchema: Yup.object({
      email: Yup.string().email('Enter a valid email address').required('Email is required'),
      password: Yup.string().min(4, 'Password must be at least 4 characters').required('Password is required'),
    }),
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting }) => {
      onError('');
      try {
        const res = await ApiService.login(values.email.trim(), values.password);
        if (res.success) {
          login(res.data);
          onSuccess();
        } else {
          onError(res.message || 'Login failed. Check your credentials.');
        }
      } catch (e) {
        const msg = e?.response?.data?.message;
        if (e?.response?.status === 401) onError('Invalid email or password');
        else if (!e?.response) onError('Cannot connect to server. Make sure microservices are running.');
        else onError(msg || 'Login failed');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <TextField
        fullWidth id="login-email" name="email" label="Email Address" size="small"
        sx={fieldSx} value={formik.values.email}
        onChange={formik.handleChange} onBlur={formik.handleBlur}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
        InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlinedIcon sx={{ color: theme.palette.text.secondary, fontSize: '1rem' }} /></InputAdornment> }}
      />
      <PasswordField id="login-password" name="password" label="Password" formik={formik} fieldSx={fieldSx} />

      <Button
        type="submit" fullWidth variant="contained"
        disabled={formik.isSubmitting}
        endIcon={formik.isSubmitting ? <CircularProgress size={16} color="inherit" /> : <LockOutlinedIcon />}
        sx={{
          py: 1.4, borderRadius: 2.5, fontWeight: 800, fontSize: '0.95rem', textTransform: 'none',
          background: currentTheme.accentGradient,
          boxShadow: `0 4px 20px ${currentTheme.cardGlow}`,
          color: '#ffffff',
          '&:hover': { opacity: 0.92, boxShadow: `0 6px 25px ${currentTheme.cardGlow}` },
          '&:disabled': { opacity: 0.6, cursor: 'not-allowed' },
        }}
      >
        {formik.isSubmitting ? 'Signing in…' : 'Sign In'}
      </Button>

      {/* Demo Users Section Below Button */}
      <Box sx={{ mt: 3, pt: 2.5, borderTop: `1px solid ${currentTheme.cardBorder}`, textAlign: 'center' }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
          <FlashOnIcon sx={{ fontSize: '1.05rem', color: '#d97706' }} />
          <Typography variant="caption" sx={{ fontWeight: 800, color: theme.palette.text.secondary, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.72rem' }}>
            1-Click Quick Demo Login
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" gap={0.5}>
          <Chip
            icon={<AdminPanelSettingsOutlinedIcon sx={{ fontSize: '0.95rem !important' }} />}
            label="Admin"
            onClick={() => onDemoFill('admin@ticketdesk.com', 'admin123')}
            clickable
            size="small"
            sx={{
              bgcolor: 'rgba(239,68,68,0.12)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.3)',
              fontWeight: 800, fontSize: '0.75rem', py: 1.5, px: 1,
              '&:hover': { bgcolor: 'rgba(239,68,68,0.22)' },
            }}
          />
          <Chip
            icon={<SupportAgentOutlinedIcon sx={{ fontSize: '0.95rem !important' }} />}
            label="Agent"
            onClick={() => onDemoFill('agent1@ticketdesk.com', 'agent123')}
            clickable
            size="small"
            sx={{
              bgcolor: 'rgba(245,158,11,0.12)', color: '#d97706', border: '1px solid rgba(245,158,11,0.3)',
              fontWeight: 800, fontSize: '0.75rem', py: 1.5, px: 1,
              '&:hover': { bgcolor: 'rgba(245,158,11,0.22)' },
            }}
          />
          <Chip
            icon={<PersonOutlinedIcon sx={{ fontSize: '0.95rem !important' }} />}
            label="User"
            onClick={() => onDemoFill('user1@ticketdesk.com', 'user123')}
            clickable
            size="small"
            sx={{
              bgcolor: 'rgba(16,185,129,0.12)', color: '#059669', border: '1px solid rgba(16,185,129,0.3)',
              fontWeight: 800, fontSize: '0.75rem', py: 1.5, px: 1,
              '&:hover': { bgcolor: 'rgba(16,185,129,0.22)' },
            }}
          />
        </Stack>
      </Box>
    </form>
  );
}

// ── Register Form (USER only) ─────────────────────────────────────────────────
function RegisterForm({ onError, onSuccess }) {
  const { login } = useAuth();
  const { currentTheme } = useAppTheme();
  const theme = useTheme();

  const fieldSx = {
    mb: 2.5,
    '& .MuiOutlinedInput-root': {
      color: theme.palette.text.primary,
      bgcolor: currentTheme.inputBg,
      borderRadius: 2.5,
      '& fieldset': { borderColor: currentTheme.cardBorder },
      '&:hover fieldset': { borderColor: theme.palette.primary.main },
      '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: '1.5px' },
      '&.Mui-error fieldset': { borderColor: '#ef4444 !important' },
    },
    '& .MuiInputLabel-root': { color: theme.palette.text.secondary },
    '& .MuiFormHelperText-root': { color: '#ef4444', fontSize: '0.72rem', mt: 0.5 },
  };

  const formik = useFormik({
    initialValues: { name: '', email: '', password: '', confirmPassword: '' },
    validationSchema: Yup.object({
      name: Yup.string().trim().min(2, 'Name must be at least 2 characters').max(60).required('Full name is required'),
      email: Yup.string().email('Enter a valid email address').required('Email is required'),
      password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
      confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Passwords do not match').required('Please confirm password'),
    }),
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting }) => {
      onError('');
      try {
        const res = await ApiService.register(values.name.trim(), values.email.trim(), values.password);
        if (res.success) {
          login(res.data);
          onSuccess();
        } else {
          onError(res.message || 'Registration failed');
        }
      } catch (e) {
        const msg = e?.response?.data?.message;
        if (e?.response?.status === 409) onError('This email is already registered');
        else if (!e?.response) onError('Cannot connect to server. Make sure services are running.');
        else onError(msg || 'Registration failed');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5, p: 1.5, bgcolor: 'rgba(16,185,129,0.08)', borderRadius: 2.5, border: '1px solid rgba(16,185,129,0.25)' }}>
        <PersonOutlineIcon sx={{ color: '#059669', fontSize: '1.1rem' }} />
        <Box>
          <Typography variant="caption" sx={{ color: '#059669', fontWeight: 800, display: 'block', lineHeight: 1.2 }}>
            User Account Registration
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.7rem' }}>
            Submit & track your IT support requests
          </Typography>
        </Box>
        <Chip label="USER" size="small" sx={{ ml: 'auto', bgcolor: 'rgba(16,185,129,0.12)', color: '#059669', border: '1px solid rgba(16,185,129,0.3)', fontWeight: 800, fontSize: '0.65rem' }} />
      </Box>

      <TextField
        fullWidth id="reg-name" name="name" label="Full Name" size="small"
        sx={fieldSx} value={formik.values.name}
        onChange={formik.handleChange} onBlur={formik.handleBlur}
        error={formik.touched.name && Boolean(formik.errors.name)}
        helperText={formik.touched.name && formik.errors.name}
        InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlineIcon sx={{ color: theme.palette.text.secondary, fontSize: '1rem' }} /></InputAdornment> }}
      />
      <TextField
        fullWidth id="reg-email" name="email" label="Email Address" size="small"
        sx={fieldSx} value={formik.values.email}
        onChange={formik.handleChange} onBlur={formik.handleBlur}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
        InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlinedIcon sx={{ color: theme.palette.text.secondary, fontSize: '1rem' }} /></InputAdornment> }}
      />
      <PasswordField id="reg-password" name="password" label="Password" formik={formik} fieldSx={fieldSx} />
      <PasswordField id="reg-confirm" name="confirmPassword" label="Confirm Password" formik={formik} fieldSx={fieldSx} />

      <Button
        type="submit" fullWidth variant="contained"
        disabled={formik.isSubmitting}
        endIcon={formik.isSubmitting ? <CircularProgress size={16} color="inherit" /> : <PersonAddIcon />}
        sx={{
          py: 1.4, borderRadius: 2.5, fontWeight: 800, fontSize: '0.95rem', textTransform: 'none',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#ffffff',
          boxShadow: '0 4px 20px rgba(16,185,129,0.35)',
          '&:hover': { background: 'linear-gradient(135deg, #059669, #047857)', boxShadow: '0 6px 24px rgba(16,185,129,0.5)' },
          '&:disabled': { opacity: 0.6 },
        }}
      >
        {formik.isSubmitting ? 'Creating account…' : 'Create Account'}
      </Button>
    </form>
  );
}

// ── LoginPage ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { currentTheme } = useAppTheme();
  const theme = useTheme();

  const [tab, setTab] = useState(0);
  const [error, setError] = useState('');
  const [demoCreds, setDemoCreds] = useState({ email: '', password: '' });

  const handleTabChange = (_, v) => { setTab(v); setError(''); };

  const handleDemoFill = (email, password) => {
    setTab(0);
    setDemoCreds({ email, password });
    setError('');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Glow Blobs */}
      <Box
        sx={{
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: '50vw',
          height: '50vw',
          borderRadius: '50%',
          background: currentTheme.accentGradient,
          opacity: 0.12,
          filter: 'blur(120px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-15%',
          right: '-10%',
          width: '45vw',
          height: '45vw',
          borderRadius: '50%',
          background: theme.palette.secondary.main,
          opacity: 0.1,
          filter: 'blur(100px)',
          pointerEvents: 'none',
        }}
      />

      <Box sx={{ width: '100%', maxWidth: 460 }}>
        {/* Brand Header */}
        <Box sx={{ textAlign: 'center', mb: 3.5 }}>
          <Box
            sx={{
              display: 'inline-flex',
              p: 1.5,
              borderRadius: 3.5,
              mb: 1.5,
              background: currentTheme.accentGradient,
              boxShadow: `0 8px 30px ${currentTheme.cardGlow}`,
            }}
          >
            <ConfirmationNumberOutlinedIcon sx={{ color: '#ffffff', fontSize: '2.2rem' }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.text.primary, letterSpacing: '-0.5px' }}>
            Ticket<span style={{ color: theme.palette.primary.main }}>Desk</span>
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5, fontWeight: 500 }}>
            Enterprise IT Support Platform
          </Typography>
        </Box>

        {/* Form Card */}
        <Card
          sx={{
            background: currentTheme.cardBg,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${currentTheme.cardBorder}`,
            borderRadius: 4.5,
            boxShadow: `0 25px 50px ${currentTheme.cardGlow}`,
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Tabs
              value={tab} onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                mb: 3,
                '& .MuiTab-root': { color: theme.palette.text.secondary, fontWeight: 700, textTransform: 'none', fontSize: '0.92rem' },
                '& .Mui-selected': { color: `${theme.palette.primary.main} !important` },
                '& .MuiTabs-indicator': { bgcolor: theme.palette.primary.main, height: 3, borderRadius: '3px' },
              }}
            >
              <Tab id="tab-login" label="Sign In" disableRipple />
              <Tab id="tab-register" label="Create Account" disableRipple />
            </Tabs>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 2.5, borderRadius: 2.5, fontSize: '0.84rem', fontWeight: 600,
                  bgcolor: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)',
                }}
              >
                {error}
              </Alert>
            )}

            {tab === 0
              ? <LoginForm onError={setError} onSuccess={() => setError('')} initialValues={demoCreds.email ? demoCreds : undefined} onDemoFill={handleDemoFill} />
              : <RegisterForm onError={setError} onSuccess={() => setError('')} />
            }

            {tab === 1 && (
              <Box sx={{ mt: 2.5, p: 1.5, bgcolor: 'rgba(245,158,11,0.08)', borderRadius: 2.5, border: '1px solid rgba(245,158,11,0.25)' }}>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', textAlign: 'center', lineHeight: 1.5, fontWeight: 500 }}>
                  <strong style={{ color: '#d97706' }}>Agent & Support Staff accounts</strong> are created directly by the System Admin inside the Admin Panel.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
