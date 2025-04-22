import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  alpha,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  FormatListBulleted as TasksIcon,
  ChatBubbleOutline as AssistantIcon,
  CalendarToday as CalendarIcon,
  Timer as FocusIcon,
  NoteAlt as NotesIcon,
  Settings as SettingsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  AccountCircle,
  ChevronLeft as ChevronLeftIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useDarkMode } from '../../store/themeStore';
import { useUserStore } from '../../store/userStore';

const drawerWidth = 260;

const MainLayout: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { currentUser, logout } = useUserStore();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Tasks', icon: <TasksIcon />, path: '/tasks' },
    { text: 'Assistant', icon: <AssistantIcon />, path: '/assistant' },
    { text: 'Calendar', icon: <CalendarIcon />, path: '/calendar' },
    { text: 'Focus', icon: <FocusIcon />, path: '/focus' },
    { text: 'Notes', icon: <NotesIcon />, path: '/notes' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const drawer = (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: theme.palette.mode === 'dark' 
        ? `linear-gradient(195deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.default, 0.8)})`
        : `linear-gradient(195deg, ${alpha('#ffffff', 0.98)}, ${alpha('#f8fafc', 0.92)})`,
      backgroundSize: '100% 100%',
      backgroundAttachment: 'fixed',
    }}>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          background: theme.palette.mode === 'dark'
            ? alpha(theme.palette.primary.dark, 0.8)
            : theme.palette.primary.main,
          color: '#fff',
          borderRadius: isMobile ? 0 : '0 0 16px 0',
          boxShadow: theme.palette.mode === 'dark'
            ? `0 4px 20px 0 ${alpha('#000', 0.25)}`
            : `0 4px 20px 0 ${alpha(theme.palette.primary.main, 0.3)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              bgcolor: theme.palette.mode === 'dark' 
                ? alpha(theme.palette.common.white, 0.95)
                : alpha(theme.palette.common.white, 0.95),
              color: theme.palette.mode === 'dark'
                ? theme.palette.primary.dark
                : theme.palette.primary.main,
              width: 36,
              height: 36,
              mr: 1.5,
              boxShadow: `0 4px 12px ${alpha('#000', 0.15)}`
            }}
          >
            <AssistantIcon fontSize="small" />
          </Avatar>
          <Typography variant="h6" fontWeight={600} noWrap component="div">
            AI Assistant
          </Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle} edge="end" sx={{ color: '#fff' }}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Toolbar>
      
      <List sx={{ 
        flexGrow: 1, 
        px: 1,
        py: 2,
        '& .MuiListItem-root': {
          mb: 1,
        },
      }}>
        {menuItems.map((item) => {
          const isSelected = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);
            
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={isSelected}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) {
                    setMobileOpen(false);
                  }
                }}
                sx={{
                  borderRadius: 2,
                  py: 1.2,
                  px: 1,
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    bgcolor: theme.palette.mode === 'dark'
                      ? alpha(theme.palette.primary.main, 0.25)
                      : alpha(theme.palette.primary.main, 0.12),
                    color: theme.palette.mode === 'dark' 
                      ? theme.palette.primary.light
                      : theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark'
                        ? alpha(theme.palette.primary.main, 0.35)
                        : alpha(theme.palette.primary.main, 0.18),
                    }
                  },
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark'
                      ? alpha(theme.palette.primary.main, 0.12)
                      : alpha(theme.palette.primary.main, 0.06),
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 42,
                  color: isSelected 
                    ? (theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main)
                    : (theme.palette.mode === 'dark' ? theme.palette.text.secondary : 'inherit'),
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    fontWeight: isSelected ? 600 : 500,
                    fontSize: '0.95rem',
                  }}
                />
                {isSelected && (
                  <Box
                    sx={{
                      position: 'absolute',
                      right: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 4,
                      height: '60%',
                      backgroundColor: theme.palette.primary.main,
                      borderRadius: '4px 0 0 4px',
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      <Box sx={{ 
        px: 2, 
        py: 2,
        mt: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5
      }}>
        <Divider sx={{ mb: 1 }} />
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          px: 1 
        }}>
          <Typography variant="body2" color="text.secondary">
            {darkMode ? 'Dark Mode' : 'Light Mode'}
          </Typography>
          <IconButton 
            size="small" 
            onClick={toggleDarkMode}
            sx={{
              bgcolor: theme.palette.mode === 'dark' 
                ? alpha(theme.palette.primary.main, 0.15)
                : alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.mode === 'dark'
                ? theme.palette.primary.light
                : theme.palette.primary.main,
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.primary.main, 0.25)
                  : alpha(theme.palette.primary.main, 0.15),
              }
            }}
          >
            {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(90deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.default, 0.85)})`
            : `linear-gradient(90deg, ${alpha('#ffffff', 0.98)}, ${alpha('#f8fafc', 0.92)})`,
          color: theme.palette.text.primary,
          backdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography 
              variant="h6" 
              noWrap 
              component="div" 
              fontWeight={600}
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                background: theme.palette.mode === 'dark'
                  ? `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`
                  : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {menuItems.find(
                (item) =>
                  item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path)
              )?.text || 'AI Assistant'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
              <IconButton 
                onClick={toggleDarkMode} 
                size="small"
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.primary.main, 0.15)
                    : alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' 
                      ? alpha(theme.palette.primary.main, 0.25)
                      : alpha(theme.palette.primary.main, 0.15),
                  }
                }}
              >
                {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            
            <Box
              onClick={handleProfileMenuOpen}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                py: 0.5,
                px: 1,
                borderRadius: 2,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: alpha(theme.palette.divider, 0.1),
                }
              }}
            >
              <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
                <Typography variant="body2" fontWeight={500}>
                  {currentUser?.name || 'User'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {currentUser?.email || 'user@example.com'}
                </Typography>
              </Box>
              
              {currentUser?.photoURL ? (
                <Avatar
                  alt={currentUser.name}
                  src={currentUser.photoURL}
                  sx={{ 
                    width: 38, 
                    height: 38,
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                />
              ) : (
                <Avatar
                  sx={{ 
                    width: 38, 
                    height: 38,
                    bgcolor: theme.palette.primary.main,
                    color: '#fff',
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                >
                  {currentUser?.name?.[0] || 'U'}
                </Avatar>
              )}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: theme.palette.mode === 'dark'
                ? 'none'
                : `5px 0 20px ${alpha('#000', 0.05)}`,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.default, 0.97)
            : alpha(theme.palette.background.default, 0.98),
          transition: 'padding 0.3s ease',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1,
            overflow: 'visible',
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: theme.palette.mode === 'dark'
              ? `0 8px 16px ${alpha('#000', 0.2)}`
              : `0 8px 16px ${alpha('#000', 0.1)}`,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: theme.palette.background.paper,
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderLeft: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            },
          },
        }}
      >
        <MenuItem onClick={() => navigate('/settings')} sx={{ py: 1.5, px: 2 }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ py: 1.5, px: 2 }}>
          <ListItemIcon>
            <AccountCircle fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default MainLayout; 