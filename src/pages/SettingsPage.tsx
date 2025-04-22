import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Container,
  Paper,
  Avatar,
  Button,
  Divider,
  IconButton,
  useTheme,
  alpha,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Security as SecurityIcon,
  PrivacyTip as PrivacyTipIcon,
  Brush as BrushIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useDarkMode } from '../store/themeStore';
import APISettings from '../components/settings/APISettings';
import GridWrapper from '../utils/GridWrapper';

// Enhanced styled header component
const PageHeader = ({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) => {
  const theme = useTheme();
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: { xs: 2, sm: 3 }, 
        mb: 3, 
        borderRadius: 3,
        background: theme.palette.mode === 'dark' 
          ? `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.default, 0.8)})`
          : `linear-gradient(145deg, ${alpha('#ffffff', 0.95)}, ${alpha('#f8fafc', 0.85)})`,
        boxShadow: theme.palette.mode === 'dark'
          ? `0 10px 15px -5px ${alpha('#000', 0.2)}`
          : `0 10px 15px -5px ${alpha('#aaa', 0.1)}`,
        backdropFilter: 'blur(8px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
          }}
        >
          {icon}
        </Avatar>
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '1.5rem', sm: '1.8rem' },
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            {description}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

// Enhanced settings card component
const SettingsCard = ({ 
  title, 
  description, 
  icon, 
  children 
}: { 
  title: string, 
  description?: string, 
  icon: React.ReactNode, 
  children: React.ReactNode 
}) => {
  const theme = useTheme();
  
  return (
    <Card 
      elevation={0} 
      sx={{ 
        mb: 3,
        borderRadius: 3,
        overflow: 'visible',
        background: alpha(theme.palette.background.paper, 0.7),
        backdropFilter: 'blur(8px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: theme.palette.mode === 'dark'
          ? `0 5px 15px ${alpha('#000', 0.15)}`
          : `0 5px 15px ${alpha('#000', 0.05)}`,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.palette.mode === 'dark'
            ? `0 8px 25px ${alpha('#000', 0.2)}`
            : `0 8px 25px ${alpha('#000', 0.1)}`,
        }
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Card header */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
            }}
          >
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {title}
            </Typography>
            {description && (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            )}
          </Box>
        </Box>
        
        {/* Card content */}
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {children}
        </Box>
      </CardContent>
    </Card>
  );
};

const SettingsPage: React.FC = () => {
  const theme = useTheme();
  // Theme settings
  const { darkMode, toggleDarkMode } = useDarkMode();
  
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {/* Page Header */}
        <PageHeader
          title="Settings"
          description="Customize your experience and preferences"
          icon={<SettingsIcon />}
        />
        
        <Grid container spacing={3}>
          <GridWrapper item xs={12} md={6}>
            {/* Appearance Settings */}
            <SettingsCard
              title="Appearance"
              description="Customize the look and feel"
              icon={<PaletteIcon />}
            >
              <List disablePadding>
                <ListItem 
                  disablePadding 
                  sx={{ 
                    mb: 1,
                    p: 1.5,
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {darkMode ? 
                      <DarkModeIcon color="primary" /> : 
                      <LightModeIcon color="primary" />
                    }
                  </ListItemIcon>
                  <ListItemText 
                    primary="Dark Mode" 
                    secondary="Toggle between light and dark themes"
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  <Switch 
                    checked={darkMode}
                    onChange={toggleDarkMode}
                    color="primary"
                    edge="end"
                  />
                </ListItem>
                
                <ListItem 
                  disablePadding 
                  sx={{ 
                    mb: 1,
                    p: 1.5,
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <BrushIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Accent Color" 
                    secondary="Choose your preferred accent color"
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {['#1976d2', '#f44336', '#4caf50', '#ff9800', '#9c27b0'].map((color) => (
                      <Tooltip key={color} title={color} arrow>
                        <Avatar 
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            bgcolor: color,
                            cursor: 'pointer',
                            border: theme.palette.primary.main === color 
                              ? `2px solid ${theme.palette.divider}` 
                              : 'none',
                            '&:hover': {
                              opacity: 0.8,
                            }
                          }} 
                        />
                      </Tooltip>
                    ))}
                  </Box>
                </ListItem>
              </List>
            </SettingsCard>
            
            {/* Notification Settings */}
            <SettingsCard
              title="Notifications"
              description="Manage how you receive alerts"
              icon={<NotificationsIcon />}
            >
              <List disablePadding>
                <ListItem 
                  disablePadding 
                  sx={{ 
                    mb: 1,
                    p: 1.5,
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    }
                  }}
                >
                  <ListItemText 
                    primary="Desktop Notifications" 
                    secondary="Receive notifications on your desktop"
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  <Switch color="primary" defaultChecked />
                </ListItem>
                
                <ListItem 
                  disablePadding 
                  sx={{ 
                    mb: 1,
                    p: 1.5,
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    }
                  }}
                >
                  <ListItemText 
                    primary="Task Reminders" 
                    secondary="Receive reminders for upcoming tasks"
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  <Switch color="primary" defaultChecked />
                </ListItem>
                
                <ListItem 
                  disablePadding 
                  sx={{ 
                    mb: 1,
                    p: 1.5,
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    }
                  }}
                >
                  <ListItemText 
                    primary="Sound Alerts" 
                    secondary="Play sound when notifications arrive"
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  <Switch color="primary" />
                </ListItem>
              </List>
            </SettingsCard>
          </GridWrapper>
          
          <GridWrapper item xs={12} md={6}>
            {/* AI Assistant Settings */}
            <APISettings />
            
            {/* Privacy Settings */}
            <SettingsCard
              title="Privacy & Security"
              description="Manage your data and security preferences"
              icon={<SecurityIcon />}
            >
              <List disablePadding>
                <ListItem 
                  disablePadding 
                  sx={{ 
                    mb: 1,
                    p: 1.5,
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <PrivacyTipIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Data Collection" 
                    secondary="Allow anonymous usage data collection to improve the app"
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  <Switch color="primary" defaultChecked />
                </ListItem>
              </List>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  startIcon={<SaveIcon />}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  Save Changes
                </Button>
              </Box>
            </SettingsCard>
          </GridWrapper>
        </Grid>
      </Box>
    </Container>
  );
};

export default SettingsPage; 