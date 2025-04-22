import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  useTheme,
  useMediaQuery,
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  PictureAsPdf as PdfIcon,
  FormatQuote as QuoteIcon
} from '@mui/icons-material';
import { useAcademicStore } from '../../store/academicStore';
import { Citation } from '../../services/academicService';
import GridWrapper from '../../utils/GridWrapper';

const CitationEngine: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { 
    citations, 
    searchResults, 
    isSearchingCitations, 
    findCitations, 
    addCitation, 
    deleteCitation,
    pdfs
  } = useAcademicStore();
  
  const [searchKeywords, setSearchKeywords] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form fields for new citation
  const [newCitation, setNewCitation] = useState<Omit<Citation, 'id'>>({
    title: '',
    authors: [],
    year: new Date().getFullYear(),
    source: '',
    url: '',
    pdfId: undefined
  });
  
  const [newAuthor, setNewAuthor] = useState('');
  
  const handleSearch = async () => {
    if (!searchKeywords.trim()) {
      setError('Please enter keywords to search for citations');
      return;
    }
    
    setError(null);
    try {
      // Split keywords by commas or spaces
      const keywords = searchKeywords
        .split(/[,\s]+/)
        .filter(kw => kw.trim().length > 0);
        
      await findCitations(keywords);
    } catch (err) {
      setError('Failed to search for citations');
      console.error(err);
    }
  };
  
  const handleAddCitation = async () => {
    if (!newCitation.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (newCitation.authors.length === 0) {
      setError('At least one author is required');
      return;
    }
    
    setError(null);
    try {
      await addCitation(newCitation);
      // Reset form
      setNewCitation({
        title: '',
        authors: [],
        year: new Date().getFullYear(),
        source: '',
        url: '',
        pdfId: undefined
      });
      setOpenAddDialog(false);
    } catch (err) {
      setError('Failed to add citation');
      console.error(err);
    }
  };
  
  const handleAddAuthor = () => {
    if (newAuthor.trim() && !newCitation.authors.includes(newAuthor.trim())) {
      setNewCitation({
        ...newCitation,
        authors: [...newCitation.authors, newAuthor.trim()]
      });
      setNewAuthor('');
    }
  };
  
  const handleRemoveAuthor = (author: string) => {
    setNewCitation({
      ...newCitation,
      authors: newCitation.authors.filter(a => a !== author)
    });
  };
  
  const handleDeleteCitation = async (id: string) => {
    await deleteCitation(id);
  };
  
  const formatApaStyle = (citation: Citation): string => {
    let apa = '';
    
    // Format authors
    if (citation.authors.length === 1) {
      apa += `${citation.authors[0]}`;
    } else if (citation.authors.length === 2) {
      apa += `${citation.authors[0]} & ${citation.authors[1]}`;
    } else if (citation.authors.length > 2) {
      apa += `${citation.authors[0]} et al.`;
    }
    
    // Add year
    apa += ` (${citation.year}). `;
    
    // Add title
    apa += `${citation.title}. `;
    
    // Add source
    apa += citation.source;
    
    // Add URL if available
    if (citation.url) {
      apa += `. Retrieved from ${citation.url}`;
    }
    
    return apa;
  };
  
  const formatMlaStyle = (citation: Citation): string => {
    let mla = '';
    
    // Format authors
    if (citation.authors.length === 1) {
      const nameParts = citation.authors[0].split(' ');
      const lastName = nameParts.pop() || '';
      const firstNames = nameParts.join(' ');
      mla += `${lastName}, ${firstNames}`;
    } else if (citation.authors.length === 2) {
      const nameParts1 = citation.authors[0].split(' ');
      const lastName1 = nameParts1.pop() || '';
      const firstNames1 = nameParts1.join(' ');
      
      mla += `${lastName1}, ${firstNames1}, and ${citation.authors[1]}`;
    } else if (citation.authors.length > 2) {
      const nameParts = citation.authors[0].split(' ');
      const lastName = nameParts.pop() || '';
      const firstNames = nameParts.join(' ');
      
      mla += `${lastName}, ${firstNames}, et al.`;
    }
    
    // Add title (in quotes)
    mla += ` "${citation.title}." `;
    
    // Add source (italicized)
    mla += citation.source;
    
    // Add year
    mla += `, ${citation.year}`;
    
    // Add URL if available
    if (citation.url) {
      mla += `. ${citation.url}`;
    }
    
    return mla;
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setError('Citation copied to clipboard!');
        setTimeout(() => setError(null), 3000);
      })
      .catch(err => {
        setError('Failed to copy citation');
        console.error(err);
      });
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <GridWrapper container spacing={2} sx={{ mb: 2 }}>
        <GridWrapper xs={12} md={5}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2,
              height: '100%',
              display: 'flex', 
              flexDirection: 'column' 
            }}
          >
            <Typography variant="h6" gutterBottom>
              Search Citations
            </Typography>
            <Box sx={{ mb: 2, display: 'flex' }}>
              <TextField
                label="Keywords"
                variant="outlined"
                fullWidth
                value={searchKeywords}
                onChange={(e) => setSearchKeywords(e.target.value)}
                placeholder="Enter keywords separated by commas"
                sx={{ mr: 1 }}
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={isSearchingCitations ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                onClick={handleSearch}
                disabled={isSearchingCitations || !searchKeywords.trim()}
              >
                Search
              </Button>
            </Box>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1">
                {searchResults.length > 0 ? `${searchResults.length} results found` : 'Search Results'}
              </Typography>
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                size="small"
                onClick={() => setOpenAddDialog(true)}
              >
                Add New
              </Button>
            </Box>
            
            <Divider sx={{ my: 1 }} />
            
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              {searchResults.length === 0 ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  py: 4
                }}>
                  <QuoteIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary" align="center">
                    No results yet. Search for citations or add new ones.
                  </Typography>
                </Box>
              ) : (
                <List sx={{ width: '100%' }}>
                  {searchResults.map((citation) => (
                    <ListItem
                      key={citation.id}
                      alignItems="flex-start"
                      secondaryAction={
                        <Box>
                          <IconButton 
                            size="small" 
                            onClick={() => copyToClipboard(formatApaStyle(citation))}
                            sx={{ mr: 1 }}
                            color="primary"
                          >
                            <CopyIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteCitation(citation.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                      sx={{ 
                        borderRadius: 1,
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                        mb: 1
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="subtitle1">
                              {citation.title}
                            </Typography>
                            {citation.pdfId && (
                              <Chip 
                                icon={<PdfIcon />} 
                                label="PDF" 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {citation.authors.join(', ')} ({citation.year})
                            </Typography>
                            <Typography component="div" variant="body2">
                              {citation.source}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Paper>
        </GridWrapper>
        
        <GridWrapper xs={12} md={7}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h6" gutterBottom>
              My Citation Library
            </Typography>
            
            {error && (
              <Alert 
                severity={error.includes('copied') ? 'success' : 'error'} 
                sx={{ mb: 2 }}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}
            
            {citations.length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                py: 4,
                flexGrow: 1
              }}>
                <QuoteIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography color="text.secondary" align="center">
                  No citations in your library. Add some using the form.
                </Typography>
              </Box>
            ) : (
              <List sx={{ width: '100%', overflow: 'auto', flexGrow: 1 }}>
                {citations.map((citation) => (
                  <Paper
                    key={citation.id}
                    elevation={1}
                    sx={{ 
                      mb: 2, 
                      p: 2,
                      borderRadius: 1,
                      '&:hover': {
                        boxShadow: 3
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {citation.title}
                      </Typography>
                      <Box>
                        <IconButton 
                          size="small" 
                          onClick={() => copyToClipboard(formatApaStyle(citation))}
                          color="primary"
                          sx={{ mr: 0.5 }}
                        >
                          <CopyIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteCitation(citation.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <Typography color="text.secondary" variant="body2">
                      {citation.authors.join(', ')} ({citation.year})
                    </Typography>
                    
                    <Typography variant="body2" sx={{ my: 1 }}>
                      {citation.source}
                    </Typography>
                    
                    {citation.url && (
                      <Typography variant="body2" component="a" href={citation.url} target="_blank" sx={{ color: 'primary.main', display: 'block', mb: 1 }}>
                        {citation.url}
                      </Typography>
                    )}
                    
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold">
                        APA:
                      </Typography>
                      <Typography variant="body2" paragraph sx={{ mt: 0.5 }}>
                        {formatApaStyle(citation)}
                      </Typography>
                      
                      <Typography variant="caption" color="text.secondary" fontWeight="bold">
                        MLA:
                      </Typography>
                      <Typography variant="body2" paragraph sx={{ mt: 0.5 }}>
                        {formatMlaStyle(citation)}
                      </Typography>
                    </Box>
                    
                    {citation.pdfId && (
                      <Chip 
                        icon={<PdfIcon />} 
                        label="Has PDF" 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    )}
                  </Paper>
                ))}
              </List>
            )}
          </Paper>
        </GridWrapper>
      </GridWrapper>
      
      {/* Add New Citation Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Citation</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField
              label="Title"
              variant="outlined"
              fullWidth
              value={newCitation.title}
              onChange={(e) => setNewCitation({...newCitation, title: e.target.value})}
              margin="normal"
              required
            />
            
            <Box sx={{ mt: 2, mb: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Authors
              </Typography>
              <Box sx={{ display: 'flex' }}>
                <TextField
                  label="Author Name"
                  variant="outlined"
                  fullWidth
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddAuthor}
                  disabled={!newAuthor.trim()}
                >
                  Add
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {newCitation.authors.map((author, index) => (
                  <Chip
                    key={index}
                    label={author}
                    onDelete={() => handleRemoveAuthor(author)}
                  />
                ))}
              </Box>
            </Box>
            
            <GridWrapper container spacing={2} sx={{ mt: 1 }}>
              <GridWrapper xs={6}>
                <TextField
                  label="Year"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={newCitation.year}
                  onChange={(e) => setNewCitation({...newCitation, year: parseInt(e.target.value) || new Date().getFullYear()})}
                />
              </GridWrapper>
              <GridWrapper xs={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="pdf-select-label">Attached PDF</InputLabel>
                  <Select
                    labelId="pdf-select-label"
                    value={newCitation.pdfId || ''}
                    onChange={(e) => setNewCitation({...newCitation, pdfId: e.target.value || undefined})}
                    label="Attached PDF"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {pdfs.map((pdf) => (
                      <MenuItem key={pdf.id} value={pdf.id}>
                        {pdf.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </GridWrapper>
            </GridWrapper>
            
            <TextField
              label="Source"
              variant="outlined"
              fullWidth
              value={newCitation.source}
              onChange={(e) => setNewCitation({...newCitation, source: e.target.value})}
              margin="normal"
              placeholder="Journal, Book, Website, etc."
            />
            
            <TextField
              label="URL (optional)"
              variant="outlined"
              fullWidth
              value={newCitation.url || ''}
              onChange={(e) => setNewCitation({...newCitation, url: e.target.value})}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddCitation} 
            variant="contained" 
            disabled={!newCitation.title.trim() || newCitation.authors.length === 0}
          >
            Add Citation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CitationEngine; 