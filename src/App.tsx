import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useDarkMode } from './store/themeStore';
import { useAIInit } from './services/ai/aiInit';

// Pages
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import AssistantPage from './pages/AssistantPage';
import CalendarPage from './pages/CalendarPage';
import FocusPage from './pages/FocusPage';
import JournalPage from './pages/JournalPage';
import NotesPage from './pages/NotesPage';
import SettingsPage from './pages/SettingsPage';
import AcademicPage from './pages/AcademicPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// Layout
import MainLayout from './components/layout/MainLayout';

function App() {
  const { darkMode } = useDarkMode();

  // Initialize AI service
  useAIInit();

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#4f46e5', // Vibrant indigo
        light: '#6366f1',
        dark: '#4338ca',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#f43f5e', // Vibrant rose
        light: '#fb7185',
        dark: '#e11d48',
        contrastText: '#ffffff',
      },
      background: {
        default: darkMode ? '#121212' : '#f8fafc',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
      error: {
        main: '#ef4444', // Red
      },
      warning: {
        main: '#f59e0b', // Amber
      },
      info: {
        main: '#0ea5e9', // Sky blue
      },
      success: {
        main: '#10b981', // Emerald
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 700,
      },
      h3: {
        fontWeight: 600,
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 10,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            padding: '8px 16px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
            },
          },
          contained: {
            '&:hover': {
              transform: 'translateY(-1px)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            boxShadow: darkMode 
              ? '0 4px 15px rgba(0, 0, 0, 0.4)' 
              : '0 4px 15px rgba(0, 0, 0, 0.07)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: darkMode 
                ? '0 10px 25px rgba(0, 0, 0, 0.5)' 
                : '0 10px 25px rgba(0, 0, 0, 0.1)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            marginBottom: '4px',
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="assistant" element={<AssistantPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="focus" element={<FocusPage />} />
            <Route path="journal" element={<JournalPage />} />
            <Route path="notes" element={<NotesPage />} />
            <Route path="academic" element={<AcademicPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
