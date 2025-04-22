import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Container,
  useTheme,
  useMediaQuery,
  Divider
} from '@mui/material';
import {
  Description as OutlineIcon,
  FormatQuote as CitationIcon,
  TextFields as WritingIcon,
  PictureAsPdf as PdfIcon,
  AutoFixHigh as KeywordIcon,
} from '@mui/icons-material';
import GridWrapper from '../utils/GridWrapper';
import { useAcademicStore } from '../store/academicStore';
import OutlineGenerator from '../components/academic/OutlineGenerator';
import CitationEngine from '../components/academic/CitationEngine';
import WritingAssistant from '../components/academic/WritingAssistant';
import PdfLibrary from '../components/academic/PdfLibrary';
import KeywordExtractor from '../components/academic/KeywordExtractor';

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
      id={`academic-tabpanel-${index}`}
      aria-labelledby={`academic-tab-${index}`}
      {...other}
      style={{ height: '100%', width: '100%' }}
    >
      {value === index && (
        <Box sx={{ height: '100%', width: '100%', pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `academic-tab-${index}`,
    'aria-controls': `academic-tabpanel-${index}`,
  };
}

const AcademicPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = useState(0);
  
  const { loadAllData } = useAcademicStore();
  
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container 
      maxWidth="xl"
      sx={{ 
        height: '100%',
        px: { xs: 1, sm: 2, md: 3 },
        py: { xs: 1, sm: 2 }
      }}
    >
      <Paper
        elevation={3}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: theme.spacing(1),
          overflow: 'hidden',
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Typography 
            variant="h4" 
            sx={{ 
              p: 2, 
              fontWeight: 600,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
            }}
          >
            Academic Tools
          </Typography>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile ? "auto" : false}
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.875rem' },
                py: { xs: 1.5, sm: 2 },
                fontWeight: 500,
                transition: 'all 0.2s',
                '&.Mui-selected': {
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                }
              },
            }}
          >
            <Tab 
              label={isMobile ? "Outline" : "Paper Outline"} 
              icon={<OutlineIcon />} 
              iconPosition={isMobile ? "top" : "start"}
              {...a11yProps(0)} 
            />
            <Tab 
              label={isMobile ? "Citations" : "Citation Engine"} 
              icon={<CitationIcon />} 
              iconPosition={isMobile ? "top" : "start"}
              {...a11yProps(1)} 
            />
            <Tab 
              label={isMobile ? "Writing" : "Writing Assistant"} 
              icon={<WritingIcon />} 
              iconPosition={isMobile ? "top" : "start"}
              {...a11yProps(2)} 
            />
            <Tab 
              label={isMobile ? "PDFs" : "PDF Library"} 
              icon={<PdfIcon />} 
              iconPosition={isMobile ? "top" : "start"}
              {...a11yProps(3)} 
            />
            <Tab 
              label={isMobile ? "Keywords" : "Keyword Tool"} 
              icon={<KeywordIcon />} 
              iconPosition={isMobile ? "top" : "start"}
              {...a11yProps(4)} 
            />
          </Tabs>
        </Box>

        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <TabPanel value={tabValue} index={0}>
            <OutlineGenerator />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <CitationEngine />
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <WritingAssistant />
          </TabPanel>
          <TabPanel value={tabValue} index={3}>
            <PdfLibrary />
          </TabPanel>
          <TabPanel value={tabValue} index={4}>
            <KeywordExtractor />
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
};

export default AcademicPage;
