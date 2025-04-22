import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  IconButton,
  Collapse,
  Tooltip,
  Tabs,
  Tab,
  Divider,
  useMediaQuery,
  Container,
  Fade,
  responsiveFontSizes,
  createTheme,
} from '@mui/material';
import {
  SmartToy as BotIcon,
  Code as CodeIcon,
  LocalShipping as ShippingIcon,
  BugReport as BugReportIcon,
} from '@mui/icons-material';
import { alpha, useTheme, ThemeProvider } from '@mui/material/styles';
import GridWrapper from '../utils/GridWrapper';
import ChatBot from '../components/assistant/ChatBot';
import TestAPIConnection from '../components/assistant/TestAPIConnection';

// Enhanced TabPanel with responsive styling
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`assistant-tabpanel-${index}`}
      aria-labelledby={`assistant-tab-${index}`}
      {...other}
      style={{ height: '100%', width: '100%' }}
    >
      {value === index && (
        <Box sx={{ height: '100%', width: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `assistant-tab-${index}`,
    'aria-controls': `assistant-tabpanel-${index}`,
  };
}

const AssistantPage: React.FC = () => {
  const baseTheme = useTheme();
  const isMobile = useMediaQuery(baseTheme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(baseTheme.breakpoints.down('md'));
  const isLargeScreen = useMediaQuery(baseTheme.breakpoints.up('xl'));
  const [showTester, setShowTester] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const mainContentRef = useRef<HTMLDivElement>(null);
  
  // Create responsive theme that adjusts font sizes automatically
  const responsiveTheme = responsiveFontSizes(createTheme(baseTheme));

  // Auto-hide tester on mobile and adjust layout
  useEffect(() => {
    if (isMobile && showTester) {
      setShowTester(false);
    }
  }, [isMobile, showTester]);

  // Scroll to content on tab change for mobile
  useEffect(() => {
    if (isMobile && mainContentRef.current) {
      setTimeout(() => {
        mainContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [tabValue, isMobile]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={responsiveTheme}>
      <Container 
        maxWidth={isLargeScreen ? "lg" : "xl"}
        disableGutters={isMobile}
        sx={{ 
          height: '100%',
          px: { xs: 1, sm: 2, md: 3 },
          py: { xs: 1, sm: 2 }
        }}
      >
        <Box sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          maxWidth: '100%',
          overflow: 'hidden',
          borderRadius: { xs: 2, sm: 3 },
          boxShadow: { xs: 1, sm: 2 },
          backgroundColor: alpha(baseTheme.palette.background.paper, 0.8),
        }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: { xs: 1.5, sm: 2, md: 2.5 }, 
              mb: { xs: 1, sm: 2 }, 
              borderBottom: `1px solid ${baseTheme.palette.divider}`,
              borderRadius: { xs: '8px 8px 0 0', sm: '12px 12px 0 0' },
              backgroundColor: baseTheme.palette.background.paper,
              position: 'relative',
              zIndex: 2,
            }}
          >
            <Grid container alignItems="center" spacing={1}>
              <GridWrapper item xs={isMobile ? 2 : 1}>
                <Avatar sx={{ 
                  bgcolor: baseTheme.palette.primary.main,
                  width: { xs: 36, sm: 40, md: 48 },
                  height: { xs: 36, sm: 40, md: 48 }
                }}>
                  <BotIcon sx={{ fontSize: { xs: 20, sm: 24, md: 28 } }} />
                </Avatar>
              </GridWrapper>
              <GridWrapper item xs={12} sm>
                <Typography variant="h5" sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: '1.125rem', sm: '1.5rem', md: '1.75rem' },
                  lineHeight: 1.2
                }}>
                  AI Assistant
                </Typography>
                {!isMobile && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      display: { xs: 'none', sm: 'block' },
                      fontSize: { sm: '0.75rem', md: '0.875rem' }
                    }}
                  >
                    Your intelligent coding & procurement assistant
                  </Typography>
                )}
              </GridWrapper>
              <GridWrapper item xs={isMobile ? 2 : 1} sx={{ textAlign: 'right' }}>
                <Tooltip title="API Connection Tester">
                  <IconButton 
                    color="info"
                    onClick={() => setShowTester(!showTester)}
                    size={isMobile ? "small" : "medium"}
                    sx={{ 
                      ml: { xs: 0, sm: 1 },
                      backgroundColor: showTester ? alpha(baseTheme.palette.info.main, 0.1) : 'transparent',
                      '&:hover': {
                        backgroundColor: alpha(baseTheme.palette.info.main, 0.2),
                      }
                    }}
                  >
                    <BugReportIcon fontSize={isMobile ? "small" : "medium"} />
                  </IconButton>
                </Tooltip>
              </GridWrapper>
            </Grid>
            
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant={isMobile ? "fullWidth" : isTablet ? "scrollable" : "standard"}
              scrollButtons={!isMobile}
              allowScrollButtonsMobile
              sx={{ 
                mt: { xs: 1.5, sm: 2 },
                '& .MuiTab-root': {
                  minWidth: isMobile ? 'auto' : 120,
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.875rem' },
                  px: { xs: 1, sm: 2 },
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  '&.Mui-selected': {
                    fontWeight: 600,
                    color: baseTheme.palette.primary.main,
                  }
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                }
              }}
            >
              <Tab 
                label={isMobile ? "Assistant" : "AI Assistant"} 
                icon={<BotIcon fontSize={isMobile ? "small" : "medium"} />} 
                iconPosition="start"
                {...a11yProps(0)}
              />
              <Tab 
                label="Programming" 
                icon={<CodeIcon fontSize={isMobile ? "small" : "medium"} />} 
                iconPosition="start"
                {...a11yProps(1)}
              />
              <Tab 
                label={isMobile ? "Procure" : "Procurement"} 
                icon={<ShippingIcon fontSize={isMobile ? "small" : "medium"} />} 
                iconPosition="start"
                {...a11yProps(2)}
              />
            </Tabs>
          </Paper>

          <Collapse in={showTester}>
            <Box sx={{ 
              mb: { xs: 1, sm: 2 },
              mx: { xs: 1, sm: 2 },
              borderRadius: 2,
              overflow: 'hidden',
            }}>
              <TestAPIConnection />
            </Box>
          </Collapse>

          <Box 
            ref={mainContentRef}
            sx={{ 
              flexGrow: 1, 
              minHeight: 0,
              height: { 
                xs: 'calc(100vh - 180px)', 
                sm: 'calc(100vh - 200px)',
                md: 'calc(100vh - 220px)',
                lg: 'calc(100vh - 240px)'
              },
              px: { xs: 0, sm: 0 },
              pb: { xs: 0, sm: 2 },
              width: '100%',
              overflowX: 'hidden',
            }}
          >
            <TabPanel value={tabValue} index={0}>
              <ChatBot />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <ChatBot />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <ChatBot />
            </TabPanel>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default AssistantPage; 