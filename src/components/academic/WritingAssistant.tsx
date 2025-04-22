import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Chip,
  Card,
  CardContent,
  Alert,
  LinearProgress,
  useTheme,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Snackbar
} from '@mui/material';
import {
  Lightbulb as SuggestionIcon,
  Analytics as AnalyticsIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  TextFields as TextIcon,
  Send as SendIcon,
  AutoFixHigh as FixIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useAcademicStore } from '../../store/academicStore';
import GridWrapper from '../../utils/GridWrapper';

const WritingAssistant: React.FC = () => {
  const theme = useTheme();
  const { 
    analyzeWriting, 
    isAnalyzingWriting, 
    writingAnalysis,
    clearWritingAnalysis,
    analyzeCoherence,
    isAnalyzingCoherence,
    coherenceAnalysis,
    clearCoherenceAnalysis
  } = useAcademicStore();
  
  const [text, setText] = useState('');
  const [paragraph, setParagraph] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [openCoherence, setOpenCoherence] = useState(false);
  const [expandedSuggestions, setExpandedSuggestions] = useState(true);
  const [expandedCoherence, setExpandedCoherence] = useState(true);
  const [expandedKeywords, setExpandedKeywords] = useState(true);
  const [userText, setUserText] = useState('');
  const [assistanceType, setAssistanceType] = useState('improve');
  const [targetTone, setTargetTone] = useState('formal');
  const [isLoading, setIsLoading] = useState(false);
  
  // Clear analysis when text changes significantly
  useEffect(() => {
    if (writingAnalysis && text.length < 20) {
      clearWritingAnalysis();
    }
  }, [text, writingAnalysis, clearWritingAnalysis]);
  
  const handleAnalyzeWriting = async () => {
    if (text.trim().length < 50) {
      setError('Please enter at least 50 characters for a meaningful analysis.');
      return;
    }
    
    setError(null);
    try {
      await analyzeWriting(text);
    } catch (err) {
      setError('Failed to analyze writing. Please try again.');
      console.error(err);
    }
  };
  
  const handleAnalyzeCoherence = async () => {
    if (paragraph.trim().length < 20) {
      setError('Please enter at least 20 characters for paragraph analysis.');
      return;
    }
    
    setError(null);
    try {
      await analyzeCoherence(paragraph);
      setOpenCoherence(true);
    } catch (err) {
      setError('Failed to analyze paragraph. Please try again.');
      console.error(err);
    }
  };
  
  const getCoherenceColor = (score: number) => {
    if (score >= 80) return 'success.main';
    if (score >= 60) return 'warning.main';
    return 'error.main';
  };
  
  const getSuggestionIcon = (index: number) => {
    const icons = [
      <SuggestionIcon />,
      <FixIcon />,
      <TextIcon />
    ];
    return icons[index % icons.length];
  };
  
  const applyTextImprovementSuggestion = (suggestion: string) => {
    const improvedText = applyImprovementToText(text, suggestion);
    if (improvedText) {
      setText(improvedText);
    }
  };
  
  // This is a mock implementation - a real AI-powered version would be more sophisticated
  const applyImprovementToText = (originalText: string, suggestion: string): string | null => {
    // This is a simplified implementation
    // In a real app, this would use AI to actually modify the text
    
    if (suggestion.includes('precise language')) {
      const improved = originalText.replace(/very good/g, 'excellent')
        .replace(/very bad/g, 'terrible')
        .replace(/a lot of/g, 'numerous');
      return improved !== originalText ? improved : null;
    }
    
    if (suggestion.includes('paragraph structure')) {
      // Add a line break between sentences if they don't have one
      const improved = originalText.replace(/\.\s+([A-Z])/g, '.\n\n$1');
      return improved !== originalText ? improved : null;
    }
    
    if (suggestion.includes('supporting evidence')) {
      // Just add a placeholder for the user to add evidence
      return originalText + '\n\n[Add supporting evidence here]';
    }
    
    return null;
  };
  
  const handleAssistanceTypeChange = (event: SelectChangeEvent) => {
    setAssistanceType(event.target.value);
  };
  
  const handleToneChange = (event: SelectChangeEvent) => {
    setTargetTone(event.target.value);
  };
  
  const processText = async () => {
    if (userText.trim().length < 50) {
      setError('Please enter at least 50 characters for a meaningful analysis.');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    try {
      await analyzeWriting(userText);
    } catch (err) {
      setError('Failed to analyze writing. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Writing Assistant
        </Typography>
        
        <GridWrapper container spacing={2}>
          <GridWrapper xs={12}>
            <TextField
              fullWidth
              label="Your text"
              multiline
              rows={6}
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              placeholder="Enter your text to improve, proofread, or rephrase..."
              sx={{ mb: 2 }}
            />
          </GridWrapper>
          
          <GridWrapper xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="assistance-type-label">Assistance Type</InputLabel>
              <Select
                labelId="assistance-type-label"
                value={assistanceType}
                label="Assistance Type"
                onChange={handleAssistanceTypeChange}
              >
                <MenuItem value="improve">Improve Writing</MenuItem>
                <MenuItem value="proofread">Proofread & Fix Errors</MenuItem>
                <MenuItem value="rephrase">Rephrase/Paraphrase</MenuItem>
                <MenuItem value="tone">Adjust Tone</MenuItem>
              </Select>
            </FormControl>
          </GridWrapper>
          
          {assistanceType === 'tone' && (
            <GridWrapper xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="tone-label">Target Tone</InputLabel>
                <Select
                  labelId="tone-label"
                  value={targetTone}
                  label="Target Tone"
                  onChange={handleToneChange}
                >
                  <MenuItem value="formal">Formal/Academic</MenuItem>
                  <MenuItem value="professional">Professional</MenuItem>
                  <MenuItem value="casual">Casual/Conversational</MenuItem>
                  <MenuItem value="persuasive">Persuasive</MenuItem>
                </Select>
              </FormControl>
            </GridWrapper>
          )}
          
          <GridWrapper xs={12} sm={assistanceType === 'tone' ? 12 : 6}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={processText}
              disabled={isLoading || !userText}
              sx={{ height: '56px', width: '100%' }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Process Text'}
            </Button>
          </GridWrapper>
        </GridWrapper>
      </Paper>

      <GridWrapper container spacing={2}>
        <GridWrapper xs={12} md={7}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Academic Writing Assistant
            </Typography>
            
            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 2 }}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}
            
            <TextField
              label="Enter your academic writing"
              variant="outlined"
              fullWidth
              multiline
              rows={12}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your essay, paper, or other academic writing here for analysis and suggestions..."
              sx={{ mb: 2 }}
            />
            
            <Button
              variant="contained"
              color="primary"
              startIcon={isAnalyzingWriting ? <CircularProgress size={20} color="inherit" /> : <AnalyticsIcon />}
              onClick={handleAnalyzeWriting}
              disabled={isAnalyzingWriting || text.trim().length < 50}
            >
              {isAnalyzingWriting ? 'Analyzing...' : 'Analyze Writing'}
            </Button>
            
            <Divider sx={{ my: 3 }}>
              <Chip label="OR" />
            </Divider>
            
            <Typography variant="subtitle1" gutterBottom>
              Paragraph Coherence Analyzer
            </Typography>
            
            <TextField
              label="Enter a single paragraph"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={paragraph}
              onChange={(e) => setParagraph(e.target.value)}
              placeholder="Enter a specific paragraph to analyze its coherence and flow..."
              sx={{ mb: 2 }}
            />
            
            <Button
              variant="outlined"
              startIcon={isAnalyzingCoherence ? <CircularProgress size={20} color="inherit" /> : <TextIcon />}
              onClick={handleAnalyzeCoherence}
              disabled={isAnalyzingCoherence || paragraph.trim().length < 20}
            >
              {isAnalyzingCoherence ? 'Analyzing...' : 'Analyze Paragraph'}
            </Button>
            
            <Collapse in={openCoherence && coherenceAnalysis !== null}>
              {coherenceAnalysis && (
                <Card variant="outlined" sx={{ mt: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1">
                        Paragraph Coherence
                      </Typography>
                      <IconButton size="small" onClick={() => setOpenCoherence(false)}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={coherenceAnalysis.score} 
                          color={
                            coherenceAnalysis.score >= 80 ? "success" : 
                            coherenceAnalysis.score >= 60 ? "warning" : "error"
                          }
                          sx={{ height: 10, borderRadius: 5 }}
                        />
                      </Box>
                      <Typography 
                        variant="body2" 
                        color={getCoherenceColor(coherenceAnalysis.score)}
                        fontWeight="bold"
                      >
                        {coherenceAnalysis.score}%
                      </Typography>
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, mb: 1.5 }}>
                      {coherenceAnalysis.score >= 80 
                        ? 'Excellent paragraph coherence and flow.' 
                        : coherenceAnalysis.score >= 60 
                        ? 'Good paragraph structure with some room for improvement.' 
                        : 'Paragraph needs significant improvement in coherence.'}
                    </Typography>
                    
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                      Suggestions:
                    </Typography>
                    
                    <List dense>
                      {coherenceAnalysis.suggestions.map((suggestion, index) => (
                        <ListItem key={index}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <SuggestionIcon fontSize="small" color="info" />
                          </ListItemIcon>
                          <ListItemText primary={suggestion} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )}
            </Collapse>
          </Paper>
        </GridWrapper>
        
        <GridWrapper xs={12} md={5}>
          <Paper 
            elevation={3} 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              overflow: 'auto'
            }}
          >
            {!writingAnalysis ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                p: 4,
                height: '100%'
              }}>
                <AnalyticsIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" textAlign="center" gutterBottom>
                  Writing Analysis
                </Typography>
                <Typography color="text.secondary" textAlign="center">
                  Enter your text and click "Analyze Writing" to get AI-powered suggestions and improvements.
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6">Analysis Results</Typography>
                </Box>
                
                <Box sx={{ p: 2, overflowY: 'auto', flexGrow: 1 }}>
                  {/* Writing Suggestions Section */}
                  <Paper 
                    variant="outlined" 
                    sx={{ mb: 2, overflow: 'hidden' }}
                  >
                    <Box 
                      sx={{ 
                        p: 1.5, 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        borderBottom: expandedSuggestions ? 1 : 0,
                        borderColor: 'divider',
                        bgcolor: 'background.default'
                      }}
                      onClick={() => setExpandedSuggestions(!expandedSuggestions)}
                      style={{ cursor: 'pointer' }}
                    >
                      <Typography variant="subtitle1" fontWeight="medium">
                        Writing Suggestions
                      </Typography>
                      {expandedSuggestions ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </Box>
                    
                    <Collapse in={expandedSuggestions}>
                      <Box sx={{ p: 2 }}>
                        {writingAnalysis.suggestions.map((suggestion, index) => (
                          <Box 
                            key={index} 
                            sx={{ 
                              display: 'flex', 
                              mb: index < writingAnalysis.suggestions.length - 1 ? 2 : 0,
                              p: 1,
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'divider',
                              '&:hover': {
                                bgcolor: 'action.hover'
                              }
                            }}
                          >
                            <Box sx={{ mr: 1.5, color: 'info.main' }}>
                              {getSuggestionIcon(index)}
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="body2">{suggestion}</Typography>
                            </Box>
                            <Tooltip title="Apply Suggestion">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => applyTextImprovementSuggestion(suggestion)}
                              >
                                <FixIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ))}
                      </Box>
                    </Collapse>
                  </Paper>
                  
                  {/* Overall Coherence Score */}
                  <Paper 
                    variant="outlined" 
                    sx={{ mb: 2, overflow: 'hidden' }}
                  >
                    <Box 
                      sx={{ 
                        p: 1.5, 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        borderBottom: expandedCoherence ? 1 : 0,
                        borderColor: 'divider',
                        bgcolor: 'background.default'
                      }}
                      onClick={() => setExpandedCoherence(!expandedCoherence)}
                      style={{ cursor: 'pointer' }}
                    >
                      <Typography variant="subtitle1" fontWeight="medium">
                        Overall Coherence
                      </Typography>
                      {expandedCoherence ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </Box>
                    
                    <Collapse in={expandedCoherence}>
                      <Box sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={writingAnalysis.coherence} 
                              color={
                                writingAnalysis.coherence >= 80 ? "success" : 
                                writingAnalysis.coherence >= 60 ? "warning" : "error"
                              }
                              sx={{ height: 10, borderRadius: 5 }}
                            />
                          </Box>
                          <Typography 
                            variant="body2" 
                            color={getCoherenceColor(writingAnalysis.coherence)}
                            fontWeight="bold"
                          >
                            {writingAnalysis.coherence}%
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {writingAnalysis.coherence >= 80 
                            ? 'Your writing has excellent coherence and flow.' 
                            : writingAnalysis.coherence >= 60 
                            ? 'Your writing has good structure with some room for improvement.' 
                            : 'Your writing needs significant improvement in coherence and flow.'}
                        </Typography>
                      </Box>
                    </Collapse>
                  </Paper>
                  
                  {/* Keywords Analysis */}
                  <Paper 
                    variant="outlined" 
                    sx={{ overflow: 'hidden' }}
                  >
                    <Box 
                      sx={{ 
                        p: 1.5, 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        borderBottom: expandedKeywords ? 1 : 0,
                        borderColor: 'divider',
                        bgcolor: 'background.default'
                      }}
                      onClick={() => setExpandedKeywords(!expandedKeywords)}
                      style={{ cursor: 'pointer' }}
                    >
                      <Typography variant="subtitle1" fontWeight="medium">
                        Key Terms Analysis
                      </Typography>
                      {expandedKeywords ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </Box>
                    
                    <Collapse in={expandedKeywords}>
                      <Box sx={{ p: 2 }}>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          Key terms identified in your writing:
                        </Typography>
                        
                        <GridWrapper container spacing={1}>
                          {writingAnalysis.keywords.map((keyword, index) => (
                            <GridWrapper xs={12} key={index}>
                              <Paper 
                                variant="outlined" 
                                sx={{ 
                                  p: 1.5, 
                                  borderRadius: 1,
                                  borderColor: 'divider'
                                }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography fontWeight="bold" variant="body2">
                                    {keyword.keyword}
                                  </Typography>
                                  <Chip 
                                    label={`${keyword.relevance}%`} 
                                    size="small" 
                                    color={
                                      keyword.relevance >= 80 ? "success" : 
                                      keyword.relevance >= 50 ? "primary" : "default"
                                    }
                                    variant="outlined"
                                  />
                                </Box>
                                
                                <Typography variant="caption" color="text.secondary">
                                  Frequency: {keyword.frequency} occurrences
                                </Typography>
                                
                                {keyword.suggestions && keyword.suggestions.length > 0 && (
                                  <Box sx={{ mt: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                      Related terms:
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                      {keyword.suggestions.map((suggestion, i) => (
                                        <Chip 
                                          key={i} 
                                          label={suggestion} 
                                          size="small" 
                                          variant="outlined"
                                        />
                                      ))}
                                    </Box>
                                  </Box>
                                )}
                              </Paper>
                            </GridWrapper>
                          ))}
                        </GridWrapper>
                      </Box>
                    </Collapse>
                  </Paper>
                </Box>
              </>
            )}
          </Paper>
        </GridWrapper>
      </GridWrapper>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WritingAssistant;
