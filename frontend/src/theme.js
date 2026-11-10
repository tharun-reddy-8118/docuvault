import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#10b981',       // Emerald Green
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0f172a',       // Deep Slate
      light: '#334155',
      dark: '#020617',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',    // Crisp Light Slate Background
      paper: '#ffffff',      // Pure White Cards & Panels
    },
    text: {
      primary: '#0f172a',    // Dark readable high-contrast text
      secondary: '#64748b',  // Muted Slate text
      disabled: '#94a3b8',
    },
    divider: '#e2e8f0',      // Crisp light border
    success: {
      main: '#10b981',
      light: '#ecfdf5',
      dark: '#047857',
    },
  },
  shape: {
    borderRadius: 6,         // Crisp modern geometric corners (no pill buttons!)
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          boxShadow: 'none',
          padding: '7px 16px',
          fontSize: '0.85rem',
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: '#10b981',
          color: '#ffffff',
          border: '1px solid #059669',
          '&:hover': {
            backgroundColor: '#059669',
          },
        },
        outlined: {
          borderColor: '#e2e8f0',
          color: '#0f172a',
          backgroundColor: '#ffffff',
          '&:hover': {
            borderColor: '#cbd5e1',
            backgroundColor: '#f1f5f9',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
          borderRadius: 6,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontSize: '0.72rem',
          height: 24,
          border: '1px solid #e2e8f0',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
            backgroundColor: '#ffffff',
            '& fieldset': {
              borderColor: '#e2e8f0',
            },
            '&:hover fieldset': {
              borderColor: '#cbd5e1',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#10b981',
              borderWidth: '1.5px',
            },
          },
        },
      },
    },
  },
});

export default theme;
