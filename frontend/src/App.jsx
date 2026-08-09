import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Box, Snackbar, Alert, Typography, Tab, Tabs, useTheme,
} from '@mui/material';
import DashboardIcon          from '@mui/icons-material/Dashboard';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AddCircleOutlineIcon   from '@mui/icons-material/AddCircleOutline';

import Navbar           from './components/Navbar';
import KpiDashboard     from './components/KpiDashboard';
import CreateTicketForm from './components/CreateTicketForm';
import TicketQueue      from './components/TicketQueue';
import AdminPanel       from './components/AdminPanel';
import LoginPage        from './pages/LoginPage';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeContextProvider, useAppTheme } from './context/ThemeContext';
import { ApiService }            from './services/api';

// ── Main App Content (shown when logged in) ───────────────────────────────────
function MainContent() {
  const { user, isAdmin, isAgent, isUser } = useAuth();
  const { currentTheme } = useAppTheme();
  const theme = useTheme();

  const [activeTab, setActiveTab] = useState(0);
  const [stats,     setStats]     = useState(null);
  const [tickets,   setTickets]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState({ open: false, message: '', severity: 'success' });

  const showToast = useCallback((message, severity = 'success') =>
    setToast({ open: true, message, severity }), []);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [dashRes, tickRes] = await Promise.allSettled([
        ApiService.getDashboardSummary(),
        ApiService.getTickets(),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.success) {
        setStats(dashRes.value.data);
      }

      if (tickRes.status === 'fulfilled' && tickRes.value?.success) {
        setTickets(Array.isArray(tickRes.value.data) ? tickRes.value.data : []);
      }
    } catch (e) {
      console.error('Data load error:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  // Build tabs per role
  const tabs = isAdmin
    ? [
        { icon: <DashboardIcon sx={{ fontSize: '1.1rem' }} />, label: 'Dashboard' },
        { icon: <FormatListBulletedIcon sx={{ fontSize: '1.1rem' }} />, label: 'All Tickets' },
        { icon: <AdminPanelSettingsIcon sx={{ fontSize: '1.1rem' }} />, label: 'Admin Panel' },
      ]
    : isAgent
    ? [
        { icon: <DashboardIcon sx={{ fontSize: '1.1rem' }} />, label: 'Dashboard' },
        { icon: <FormatListBulletedIcon sx={{ fontSize: '1.1rem' }} />, label: 'Assigned Tickets' },
      ]
    : [
        { icon: <DashboardIcon sx={{ fontSize: '1.1rem' }} />, label: 'Dashboard' },
        { icon: <AddCircleOutlineIcon sx={{ fontSize: '1.1rem' }} />, label: 'Create Ticket' },
        { icon: <FormatListBulletedIcon sx={{ fontSize: '1.1rem' }} />, label: 'My Tickets' },
      ];

  return (
    <>
      <Navbar onRefresh={loadData} />

      <Container maxWidth="xl" sx={{ pt: 3, pb: 8 }}>

        {/* Tab Navigation */}
        <Box
          sx={{
            mb: 3.5,
            p: 0.75,
            borderRadius: 3.5,
            bgcolor: currentTheme.cardBg,
            backdropFilter: 'blur(12px)',
            border: `1px solid ${currentTheme.cardBorder}`,
            display: 'inline-flex',
            maxWidth: '100%',
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              minHeight: 44,
              '& .MuiTab-root': {
                color: theme.palette.text.secondary,
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.88rem',
                minHeight: 44,
                borderRadius: 2.5,
                px: 2.5,
                transition: 'all 0.25s ease',
                '&:hover': {
                  color: theme.palette.text.primary,
                  bgcolor: currentTheme.chipBg,
                },
              },
              '& .Mui-selected': {
                color: `${theme.palette.primary.main} !important`,
                bgcolor: currentTheme.chipBg,
                boxShadow: `0 2px 10px ${theme.palette.primary.main}20`,
              },
              '& .MuiTabs-indicator': {
                bgcolor: theme.palette.primary.main,
                height: 3,
                borderRadius: '3px',
              },
            }}
          >
            {tabs.map((t, i) => (
              <Tab key={i} icon={t.icon} iconPosition="start" label={t.label} id={`main-tab-${i}`} disableRipple />
            ))}
          </Tabs>
        </Box>

        {/* ── ADMIN TABS ────────────────────────────────────────────────────── */}
        {isAdmin && (
          <>
            {activeTab === 0 && <KpiDashboard stats={stats} loading={loading} />}

            {activeTab === 1 && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '420px 1fr' }, gap: 3, alignItems: 'start' }}>
                <Box sx={{ position: { lg: 'sticky' }, top: { lg: 90 } }}>
                  <CreateTicketForm onTicketCreated={loadData} onToast={showToast} />
                </Box>
                <TicketQueue tickets={tickets} loading={loading} onRefresh={loadData} onToast={showToast} />
              </Box>
            )}

            {activeTab === 2 && (
              <AdminPanel onToast={showToast} />
            )}
          </>
        )}

        {/* ── AGENT TABS ────────────────────────────────────────────────────── */}
        {isAgent && (
          <>
            {activeTab === 0 && <KpiDashboard stats={stats} loading={loading} />}
            {activeTab === 1 && (
              <TicketQueue tickets={tickets} loading={loading} onRefresh={loadData} onToast={showToast} />
            )}
          </>
        )}

        {/* ── USER TABS ─────────────────────────────────────────────────────── */}
        {isUser && (
          <>
            {activeTab === 0 && <KpiDashboard stats={stats} loading={loading} />}
            {activeTab === 1 && (
              <CreateTicketForm onTicketCreated={() => { loadData(); setActiveTab(2); }} onToast={showToast} />
            )}
            {activeTab === 2 && (
              <TicketQueue tickets={tickets} loading={loading} onRefresh={loadData} onToast={showToast} />
            )}
          </>
        )}

      </Container>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast(t => ({ ...t, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ borderRadius: 2.5, fontWeight: 600, boxShadow: '0 8px 25px rgba(0,0,0,0.3)' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
}

// ── Root App Router ───────────────────────────────────────────────────────────
function AppRouter() {
  const { user } = useAuth();
  return user ? <MainContent /> : <LoginPage />;
}

export default function App() {
  return (
    <ThemeContextProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeContextProvider>
  );
}
