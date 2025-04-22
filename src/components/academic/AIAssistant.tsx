import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Chip,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
  Science as ScienceIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import aiService from '../../services/ai/aiService';

const AIAssistant: React.FC = () => {
  const theme = useTheme();
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [outline, setOutline] = useState<any>(null);
  const [keywords, setKeywords] = useState<string[]>([]);

  const handleGenerateOutline = async () => {
    try {
      setLoading(true);
      const generatedOutline = await aiService.generateSmartOutline(topic, description);
      setOutline(generatedOutline);
      
      // Extract keywords from description
      const extractedKeywords = await aiService.extractKeywords(description);
      setKeywords(extractedKeywords);
    } catch (error) {
      console.error('Error generating outline:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          borderRadius: 2,
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <PsychologyIcon sx={{ fontSize: 32, mr: 2, color: theme.palette.primary.main }} />
          <Typography variant="h5" fontWeight="bold">
            AI Research Assistant
          </Typography>
        </Box>

        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Research Topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            variant="outlined"
          />

          <TextField
            fullWidth
            label="Brief Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={4}
            variant="outlined"
          />

          <Button
            variant="contained"
            onClick={handleGenerateOutline}
            disabled={loading || !topic || !description}
            startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
            sx={{ alignSelf: 'flex-start' }}
          >
            Generate Smart Outline
          </Button>

          {keywords.length > 0 && (
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Key Concepts
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {keywords.map((keyword, index) => (
                  <Chip
                    key={index}
                    label={keyword}
                    variant="outlined"
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {outline && (
            <Box>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <ScienceIcon sx={{ mr: 1 }} />
                Generated Outline
              </Typography>
              
              <List>
                {outline.sections.map((section: any, index: number) => (
                  <ListItem key={index} sx={{ display: 'block', mb: 2 }}>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="bold">
                          {section.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {section.content}
                          </Typography>
                          <List dense>
                            {section.subsections.map((subsection: any, subIndex: number) => (
                              <ListItem key={subIndex}>
                                <ListItemText
                                  primary={subsection.title}
                                  sx={{
                                    '& .MuiListItemText-primary': {
                                      fontSize: '0.9rem',
                                      color: theme.palette.text.secondary
                                    }
                                  }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<AnalyticsIcon />}
                >
                  Analyze Citations
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AutoAwesomeIcon />}
                >
                  Enhance with AI
                </Button>
              </Box>
            </Box>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default AIAssistant; 