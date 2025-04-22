import { useState, useEffect } from 'react';

type ThemeMode = 'light' | 'dark';

export const useTheme = () => {
  // Initialize theme from localStorage or system preference
  const getInitialTheme = (): ThemeMode => {
    const savedTheme = localStorage.getItem('theme-mode');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }
    
    // Check if user prefers dark mode
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDarkMode ? 'dark' : 'light';
  };
  
  const [mode, setMode] = useState<ThemeMode>(getInitialTheme);
  
  // Toggle between light and dark mode
  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme-mode', newMode);
      return newMode;
    });
  };
  
  // Set theme based on provided value
  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem('theme-mode', newMode);
  };
  
  // Update document when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove previous theme class
    root.classList.remove('light-mode', 'dark-mode');
    
    // Add current theme class
    root.classList.add(`${mode}-mode`);
    
    // Set data-theme attribute for CSS variables
    root.setAttribute('data-theme', mode);
  }, [mode]);
  
  return {
    mode,
    setTheme,
    toggleTheme,
    isDark: mode === 'dark',
    isLight: mode === 'light',
  };
};

export default useTheme; 