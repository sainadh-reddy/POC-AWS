import React, { createContext, useContext, useMemo } from 'react';
import { createTheme, ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';

export const THEME_PRESETS = {
  nordicLight: {
    key: 'nordicLight',
    name: 'Nordic Clean (Light)',
    icon: '☀️',
    mode: 'light',
    palette: {
      mode: 'light',
      primary: { main: '#2563eb', light: '#3b82f6', dark: '#1d4ed8' },
      secondary: { main: '#7c3aed', light: '#8b5cf6', dark: '#6d28d9' },
      background: { default: '#f1f5f9', paper: '#ffffff' },
      text: { primary: '#0f172a', secondary: '#475569' },
    },
    bodyBg: 'radial-gradient(circle at 10% 10%, rgba(37, 99, 235, 0.06) 0%, transparent 50%), radial-gradient(circle at 90% 90%, rgba(124, 58, 237, 0.05) 0%, transparent 50%), #f1f5f9',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    cardBorder: 'rgba(226, 232, 240, 0.9)',
    cardHoverBorder: 'rgba(37, 99, 235, 0.4)',
    cardGlow: 'rgba(37, 99, 235, 0.12)',
    navbarBg: 'rgba(255, 255, 255, 0.92)',
    inputBg: '#f8fafc',
    chipBg: 'rgba(37, 99, 235, 0.08)',
    accentGradient: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
    tableHeaderBg: '#f8fafc',
  },
};

const ThemeContext = createContext();

export function ThemeContextProvider({ children }) {
  const activeThemePreset = THEME_PRESETS.nordicLight;

  const muiTheme = useMemo(() => {
    const t = activeThemePreset;
    return createTheme({
      palette: t.palette,
      typography: {
        fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", sans-serif',
        h4: { fontWeight: 800, letterSpacing: '-0.5px' },
        h5: { fontWeight: 700, letterSpacing: '-0.3px' },
        h6: { fontWeight: 700 },
        button: { textTransform: 'none', fontWeight: 600 },
      },
      shape: { borderRadius: 12 },
      components: {
        MuiCard: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              backgroundColor: t.cardBg,
              backdropFilter: 'blur(16px)',
              border: `1px solid ${t.cardBorder}`,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: '10px',
              padding: '8px 20px',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: `0 4px 15px ${t.palette.primary.main}25`,
              },
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              fontWeight: 600,
              borderRadius: '8px',
            },
          },
        },
        MuiDivider: {
          styleOverrides: {
            root: {
              borderColor: 'rgba(0,0,0,0.08)',
            },
          },
        },
      },
    });
  }, [activeThemePreset]);

  return (
    <ThemeContext.Provider value={{ currentTheme: activeThemePreset, themeKey: 'nordicLight', changeTheme: () => {} }}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            body: {
              background: activeThemePreset.bodyBg,
              backgroundAttachment: 'fixed',
              color: activeThemePreset.palette.text.primary,
              minHeight: '100vh',
              transition: 'background 0.4s ease, color 0.4s ease',
            },
            '*::-webkit-scrollbar': { width: '6px', height: '6px' },
            '*::-webkit-scrollbar-track': {
              background: '#f1f5f9',
            },
            '*::-webkit-scrollbar-thumb': {
              background: activeThemePreset.palette.primary.main + '60',
              borderRadius: '3px',
            },
            '*::-webkit-scrollbar-thumb:hover': {
              background: activeThemePreset.palette.primary.main,
            },
          }}
        />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export const useAppTheme = () => useContext(ThemeContext);
