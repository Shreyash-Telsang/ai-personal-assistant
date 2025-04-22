import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Tooltip,
  IconButton,
  useTheme,
  useMediaQuery,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  ContentCopy as CopyIcon,
  AutoFixHigh as KeywordIcon,
  Add as AddIcon,
  ArrowUpward as TrendUpIcon,
  ArrowDownward as TrendDownIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { useAcademicStore } from '../../store/academicStore';
import { KeywordAnalysis } from '../../services/academicService';
import GridWrapper from '../../utils/GridWrapper';

interface KeywordExtractionResult {
  keywords: string[];
  phrases: string[];
}

const KeywordExtractor: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { 
    keywordAnalysis, 
    isExtractingKeywords, 
    extractKeywords, 
    clearKeywordAnalysis 
  } = useAcademicStore();
  
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'relevance' | 'frequency' | 'keyword'>('relevance');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Create a mock extraction result for the UI since the actual data structure is different
  const extractionResult: KeywordExtractionResult | null = keywordAnalysis ? {
    keywords: keywordAnalysis.map(k => k.keyword),
    phrases: keywordAnalysis.slice(0, 3).map(k => k.keyword + (k.suggestions?.[0] || ''))
  } : null;
  
  const handleExtractKeywords = async () => {
    if (text.trim().length < 50) {
      setError('Please enter at least 50 characters for meaningful keyword extraction.');
      return;
    }
    
    setError(null);
    try {
      await extractKeywords(text);
    } catch (err) {
      setError('Failed to extract keywords. Please try again.');
      console.error(err);
    }
  };
  
  const handleSort = (field: 'relevance' | 'frequency' | 'keyword') => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default direction
      setSortField(field);
      setSortDirection(field === 'keyword' ? 'asc' : 'desc');
    }
  };
  
  const getSortedKeywords = (): KeywordAnalysis[] => {
    if (!keywordAnalysis) return [];
    
    return [...keywordAnalysis].sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'keyword') {
        comparison = a.keyword.localeCompare(b.keyword);
      } else if (sortField === 'frequency') {
        comparison = a.frequency - b.frequency;
      } else {
        comparison = a.relevance - b.relevance;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };
  
  const copyKeywordsToClipboard = () => {
    if (!keywordAnalysis) return;
    
    const keywordText = getSortedKeywords()
      .map(k => `${k.keyword} (${k.relevance}%)`)
      .join(', ');
    
    navigator.clipboard.writeText(keywordText)
      .then(() => {
        setError('Keywords copied to clipboard!');
        setTimeout(() => setError(null), 3000);
      })
      .catch(err => {
        setError('Failed to copy keywords');
        console.error(err);
      });
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Keyword Extractor
        </Typography>
        <GridWrapper container spacing={2}>
          <GridWrapper xs={12}>
            <TextField
              fullWidth
              label="Your text"
              multiline
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your text to extract keywords and key phrases..."
              sx={{ mb: 2 }}
            />
          </GridWrapper>
          <GridWrapper xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleExtractKeywords}
              disabled={isExtractingKeywords || !text}
              sx={{ height: '56px' }}
            >
              {isExtractingKeywords ? <CircularProgress size={24} /> : 'Extract Keywords'}
            </Button>
          </GridWrapper>
        </GridWrapper>
      </Paper>

      {extractionResult && (
        <Paper elevation={2} sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Extracted Keywords & Phrases
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Keywords:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {extractionResult.keywords.map((keyword, index) => (
                <Chip 
                  key={index} 
                  label={keyword} 
                  color="primary" 
                  variant="outlined" 
                />
              ))}
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Key Phrases:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {extractionResult.phrases.map((phrase, index) => (
                <Chip 
                  key={index} 
                  label={phrase} 
                  color="secondary" 
                  variant="outlined" 
                />
              ))}
            </Box>
          </Box>
        </Paper>
      )}

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

export default KeywordExtractor;
